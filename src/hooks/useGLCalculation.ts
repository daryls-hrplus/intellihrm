import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GLCalculationResult {
  batchId: string;
  totalDebits: number;
  totalCredits: number;
  entryCount: number;
}

interface GLSimulationEntry {
  entryNumber: number;
  accountCode: string;
  accountName: string;
  costCenterCode: string | null;
  composedGLString: string;
  entryType: 'debit' | 'credit';
  amount: number;
  description: string;
  overrideRuleApplied: string | null;
  segmentValues: Record<string, string> | null;
}

interface GLSimulationResult {
  entries: GLSimulationEntry[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  warnings: string[];
}

interface OverrideRule {
  id: string;
  rule_code: string;
  rule_name: string;
  priority: number;
  override_type: string;
  applies_to_debit: boolean;
  applies_to_credit: boolean;
  conditions: Array<{
    dimension_type: string;
    dimension_value_id: string | null;
    operator: string;
  }>;
  target: {
    target_account_id: string | null;
    segment_overrides: Record<string, string> | null;
    custom_gl_string: string | null;
  } | null;
}

interface GLMapping {
  id: string;
  mapping_type: string;
  pay_element_id: string | null;
  debit_account_id: string | null;
  credit_account_id: string | null;
  default_cost_center_id: string | null;
  priority: number;
}

interface GLAccount {
  id: string;
  account_code: string;
  account_name: string;
}

interface SegmentConfig {
  id: string;
  segment_code: string;
  segment_name: string;
  segment_order: number;
}

export function useGLCalculation() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  /**
   * Check if a pay group has GL configured
   */
  const checkGLConfigured = async (payGroupId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("pay_groups")
        .select("gl_configured")
        .eq("id", payGroupId)
        .single();

      if (error) throw error;
      return data?.gl_configured || false;
    } catch (err) {
      console.error("Error checking GL config:", err);
      return false;
    }
  };

  /**
   * Check if GL has already been calculated for a payroll run
   */
  const checkGLCalculated = async (payrollRunId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("gl_journal_batches")
        .select("id")
        .eq("payroll_run_id", payrollRunId)
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (err) {
      console.error("Error checking GL calculated:", err);
      return false;
    }
  };

  /**
   * Fetch override rules for a company
   */
  const fetchOverrideRules = async (companyId: string): Promise<OverrideRule[]> => {
    const { data: rules, error } = await supabase
      .from("gl_override_rules")
      .select(`
        *,
        conditions:gl_override_conditions(*),
        target:gl_override_targets(*)
      `)
      .eq("company_id", companyId)
      .eq("is_active", true)
      .gte("effective_date", new Date().toISOString().split('T')[0])
      .order("priority", { ascending: false });

    if (error) {
      console.error("Error fetching override rules:", error);
      return [];
    }

    return (rules || []).map((r: any) => ({
      id: r.id,
      rule_code: r.rule_code,
      rule_name: r.rule_name,
      priority: r.priority,
      override_type: r.override_type,
      applies_to_debit: r.applies_to_debit,
      applies_to_credit: r.applies_to_credit,
      conditions: r.conditions || [],
      target: r.target?.[0] || null,
    }));
  };

  /**
   * Evaluate if an override rule matches the context
   */
  const evaluateRule = (
    rule: OverrideRule,
    context: {
      mappingType: string;
      payElementId: string | null;
      departmentId: string | null;
      divisionId: string | null;
      locationId: string | null;
      jobId: string | null;
      costCenterId: string | null;
      entryType: 'debit' | 'credit';
    }
  ): boolean => {
    // Check if rule applies to this entry type
    if (context.entryType === 'debit' && !rule.applies_to_debit) return false;
    if (context.entryType === 'credit' && !rule.applies_to_credit) return false;

    // All conditions must match (AND logic)
    for (const condition of rule.conditions) {
      let contextValue: string | null = null;
      
      switch (condition.dimension_type) {
        case 'mapping_type':
          contextValue = context.mappingType;
          break;
        case 'pay_element':
          contextValue = context.payElementId;
          break;
        case 'department':
          contextValue = context.departmentId;
          break;
        case 'division':
          contextValue = context.divisionId;
          break;
        case 'location':
          contextValue = context.locationId;
          break;
        case 'job':
          contextValue = context.jobId;
          break;
        case 'cost_center':
          contextValue = context.costCenterId;
          break;
      }

      if (condition.operator === 'any') continue; // Wildcard matches all
      
      if (condition.operator === 'equals') {
        if (contextValue !== condition.dimension_value_id) return false;
      } else if (condition.operator === 'not_equals') {
        if (contextValue === condition.dimension_value_id) return false;
      }
    }

    return true;
  };

  /**
   * Compose GL string from segments
   */
  const composeGLString = async (
    companyId: string,
    accountCode: string,
    segmentOverrides: Record<string, string> | null,
    defaultSegments: Record<string, string>
  ): Promise<{ glString: string; segmentValues: Record<string, string> }> => {
    // Fetch segment configuration
    const { data: segments } = await supabase
      .from("gl_cost_center_segments")
      .select("segment_code, segment_name, segment_order")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("segment_order");

    if (!segments || segments.length === 0) {
      return { glString: accountCode, segmentValues: {} };
    }

    // Merge defaults with overrides
    const finalSegments: Record<string, string> = { ...defaultSegments };
    if (segmentOverrides) {
      Object.keys(segmentOverrides).forEach(key => {
        if (segmentOverrides[key]) {
          finalSegments[key] = segmentOverrides[key];
        }
      });
    }

    // Build GL string
    const parts: string[] = [];
    for (const seg of segments) {
      const value = finalSegments[seg.segment_code] || '';
      parts.push(value);
    }

    // Include account code
    const glString = parts.filter(p => p).join('-') + (parts.length > 0 ? '-' : '') + accountCode;
    
    return { glString, segmentValues: finalSegments };
  };

  /**
   * Simulate GL entries for a payroll run without saving
   */
  const simulateGL = async (
    payrollRunId: string,
    companyId: string
  ): Promise<GLSimulationResult | null> => {
    setIsSimulating(true);
    try {
      const warnings: string[] = [];

      // Fetch payroll run details with employee payroll data
      const { data: runData, error: runError } = await supabase
        .from("payroll_runs")
        .select(`
          *,
          employee_payroll (
            id, employee_id, gross_pay, net_pay, 
            tax_deductions, benefit_deductions, retirement_deductions,
            employer_taxes, employer_benefits, employer_retirement,
            calculation_details
          )
        `)
        .eq("id", payrollRunId)
        .single();

      if (runError) throw runError;

      // Fetch GL account mappings
      const { data: mappings } = await supabase
        .from("gl_account_mappings")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true);

      if (!mappings || mappings.length === 0) {
        warnings.push("No GL account mappings configured");
        return { entries: [], totalDebits: 0, totalCredits: 0, isBalanced: true, warnings };
      }

      // Fetch GL accounts
      const { data: accounts } = await supabase
        .from("gl_accounts")
        .select("id, account_code, account_name")
        .eq("company_id", companyId);

      const accountMap = new Map<string, GLAccount>();
      (accounts || []).forEach(a => accountMap.set(a.id, a));

      // Fetch override rules
      const overrideRules = await fetchOverrideRules(companyId);

      // Generate simulation entries
      const entries: GLSimulationEntry[] = [];
      let entryNumber = 1;
      let totalDebits = 0;
      let totalCredits = 0;

      const findMapping = (mappingType: string) =>
        mappings.find((m: GLMapping) => m.mapping_type === mappingType);

      // Calculate totals from employee payroll
      const totals = (runData.employee_payroll || []).reduce(
        (acc: any, emp: any) => {
          const calcDetails = emp.calculation_details as any;
          const savingsDeductions = calcDetails?.savings_deductions || {};
          
          return {
            grossPay: acc.grossPay + (emp.gross_pay || 0),
            netPay: acc.netPay + (emp.net_pay || 0),
            taxDeductions: acc.taxDeductions + (emp.tax_deductions || 0),
            benefitDeductions: acc.benefitDeductions + (emp.benefit_deductions || 0),
            employerTaxes: acc.employerTaxes + (emp.employer_taxes || 0),
            employerBenefits: acc.employerBenefits + (emp.employer_benefits || 0),
            employerRetirement: acc.employerRetirement + (emp.employer_retirement || 0),
            savingsEmployeeTotal: acc.savingsEmployeeTotal + (savingsDeductions.total_employee || 0),
            savingsEmployerTotal: acc.savingsEmployerTotal + (savingsDeductions.total_employer || 0),
          };
        },
        { 
          grossPay: 0, netPay: 0, taxDeductions: 0, benefitDeductions: 0, 
          employerTaxes: 0, employerBenefits: 0, employerRetirement: 0,
          savingsEmployeeTotal: 0, savingsEmployerTotal: 0
        }
      );

      // Helper to create entry with override evaluation
      const createEntry = async (
        mappingType: string,
        accountId: string | null,
        amount: number,
        entryType: 'debit' | 'credit',
        description: string
      ) => {
        if (!accountId || amount <= 0) return;

        const account = accountMap.get(accountId);
        if (!account) {
          warnings.push(`Account not found: ${accountId}`);
          return;
        }

        // Find matching override rule
        const context = {
          mappingType,
          payElementId: null,
          departmentId: null,
          divisionId: null,
          locationId: null,
          jobId: null,
          costCenterId: null,
          entryType,
        };

        let matchedRule: OverrideRule | null = null;
        for (const rule of overrideRules) {
          if (evaluateRule(rule, context)) {
            matchedRule = rule;
            break;
          }
        }

        let finalAccountCode = account.account_code;
        let composedGLString = account.account_code;
        let segmentValues: Record<string, string> | null = null;

        if (matchedRule?.target) {
          if (matchedRule.override_type === 'full_string' && matchedRule.target.custom_gl_string) {
            composedGLString = matchedRule.target.custom_gl_string;
          } else if (matchedRule.override_type === 'account' && matchedRule.target.target_account_id) {
            const overrideAccount = accountMap.get(matchedRule.target.target_account_id);
            if (overrideAccount) {
              finalAccountCode = overrideAccount.account_code;
              composedGLString = overrideAccount.account_code;
            }
          } else if (matchedRule.override_type === 'segment' && matchedRule.target.segment_overrides) {
            const composed = await composeGLString(
              companyId,
              finalAccountCode,
              matchedRule.target.segment_overrides as Record<string, string>,
              {}
            );
            composedGLString = composed.glString;
            segmentValues = composed.segmentValues;
          }
        }

        entries.push({
          entryNumber: entryNumber++,
          accountCode: finalAccountCode,
          accountName: account.account_name,
          costCenterCode: null,
          composedGLString,
          entryType,
          amount,
          description,
          overrideRuleApplied: matchedRule?.rule_name || null,
          segmentValues,
        });

        if (entryType === 'debit') {
          totalDebits += amount;
        } else {
          totalCredits += amount;
        }
      };

      // Generate entries for each payroll component
      const grossPayMapping = findMapping("gross_pay") || findMapping("salaries_expense") || findMapping("wages_expense");
      const netPayMapping = findMapping("net_pay") || findMapping("payroll_payable");
      const taxWithholdingMapping = findMapping("tax_withholding") || findMapping("taxes_payable") || findMapping("tax_liability");
      const employerTaxMapping = findMapping("employer_tax") || findMapping("employer_taxes_expense") || findMapping("tax_expense");
      const benefitDeductionMapping = findMapping("benefit_deduction") || findMapping("benefits_payable") || findMapping("benefit_liability");
      const employerBenefitMapping = findMapping("employer_benefit") || findMapping("employer_benefits_expense") || findMapping("benefit_expense");
      const savingsEmployeeMapping = findMapping("savings_employee_deduction");
      const savingsEmployerExpenseMapping = findMapping("savings_employer_contribution");
      const savingsEmployerLiabilityMapping = findMapping("savings_employer_liability");
      const retirementExpenseMapping = findMapping("retirement_expense");
      const retirementLiabilityMapping = findMapping("retirement_liability");

      // DEBIT entries
      await createEntry("wages_expense", grossPayMapping?.debit_account_id, totals.grossPay, 'debit', "Gross payroll expense");
      await createEntry("tax_expense", employerTaxMapping?.debit_account_id, totals.employerTaxes, 'debit', "Employer tax expense");
      await createEntry("benefit_expense", employerBenefitMapping?.debit_account_id, totals.employerBenefits, 'debit', "Employer benefit expense");
      await createEntry("savings_employer_contribution", savingsEmployerExpenseMapping?.debit_account_id, totals.savingsEmployerTotal, 'debit', "Employer retirement/savings match expense");
      await createEntry("retirement_expense", retirementExpenseMapping?.debit_account_id, totals.employerRetirement, 'debit', "Employer retirement contribution expense");

      // CREDIT entries
      await createEntry("net_pay", netPayMapping?.credit_account_id, totals.netPay, 'credit', "Net payroll payable");
      await createEntry("tax_liability", taxWithholdingMapping?.credit_account_id, totals.taxDeductions, 'credit', "Employee tax withholdings payable");
      await createEntry("benefit_liability", benefitDeductionMapping?.credit_account_id, totals.benefitDeductions, 'credit', "Employee benefit deductions payable");
      await createEntry("tax_liability", employerTaxMapping?.credit_account_id || taxWithholdingMapping?.credit_account_id, totals.employerTaxes, 'credit', "Employer taxes payable");
      await createEntry("benefit_liability", employerBenefitMapping?.credit_account_id || benefitDeductionMapping?.credit_account_id, totals.employerBenefits, 'credit', "Employer benefits payable");
      await createEntry("savings_employee_deduction", savingsEmployeeMapping?.credit_account_id, totals.savingsEmployeeTotal, 'credit', "Employee savings deductions payable");
      await createEntry("savings_employer_liability", savingsEmployerLiabilityMapping?.credit_account_id || savingsEmployerExpenseMapping?.credit_account_id, totals.savingsEmployerTotal, 'credit', "Employer savings match payable");
      await createEntry("retirement_liability", retirementLiabilityMapping?.credit_account_id, totals.employerRetirement, 'credit', "Employer retirement payable");

      const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
      if (!isBalanced) {
        warnings.push(`Entries not balanced: Debits ${totalDebits.toFixed(2)} ≠ Credits ${totalCredits.toFixed(2)}`);
      }

      return { entries, totalDebits, totalCredits, isBalanced, warnings };
    } catch (err: any) {
      console.error("Error simulating GL:", err);
      toast.error(err.message || "Failed to simulate GL entries");
      return null;
    } finally {
      setIsSimulating(false);
    }
  };

  /**
   * Simulate GL for individual employee payroll data (for pre-calculation preview)
   */
  const simulateEmployeeGL = async (
    companyId: string,
    simulationData: {
      grossPay: number;
      netPay: number;
      taxDeductions: number;
      benefitDeductions: number;
      employerTaxes: number;
      employerBenefits: number;
      employerRetirement: number;
      savingsEmployeeTotal: number;
      savingsEmployerTotal: number;
    }
  ): Promise<GLSimulationResult | null> => {
    setIsSimulating(true);
    try {
      const warnings: string[] = [];

      // Fetch GL account mappings
      const { data: mappings } = await supabase
        .from("gl_account_mappings")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true);

      if (!mappings || mappings.length === 0) {
        warnings.push("No GL account mappings configured");
        return { entries: [], totalDebits: 0, totalCredits: 0, isBalanced: true, warnings };
      }

      // Fetch GL accounts
      const { data: accounts } = await supabase
        .from("gl_accounts")
        .select("id, account_code, account_name")
        .eq("company_id", companyId);

      const accountMap = new Map<string, GLAccount>();
      (accounts || []).forEach(a => accountMap.set(a.id, a));

      // Fetch override rules
      const overrideRules = await fetchOverrideRules(companyId);

      const entries: GLSimulationEntry[] = [];
      let entryNumber = 1;
      let totalDebits = 0;
      let totalCredits = 0;

      const findMapping = (mappingType: string) =>
        mappings.find((m: GLMapping) => m.mapping_type === mappingType);

      // Helper to create entry
      const createEntry = async (
        mappingType: string,
        accountId: string | null,
        amount: number,
        entryType: 'debit' | 'credit',
        description: string
      ) => {
        if (!accountId || amount <= 0) return;

        const account = accountMap.get(accountId);
        if (!account) return;

        const context = {
          mappingType,
          payElementId: null,
          departmentId: null,
          divisionId: null,
          locationId: null,
          jobId: null,
          costCenterId: null,
          entryType,
        };

        let matchedRule: OverrideRule | null = null;
        for (const rule of overrideRules) {
          if (evaluateRule(rule, context)) {
            matchedRule = rule;
            break;
          }
        }

        let composedGLString = account.account_code;
        let segmentValues: Record<string, string> | null = null;

        if (matchedRule?.target?.segment_overrides) {
          const composed = await composeGLString(
            companyId,
            account.account_code,
            matchedRule.target.segment_overrides as Record<string, string>,
            {}
          );
          composedGLString = composed.glString;
          segmentValues = composed.segmentValues;
        }

        entries.push({
          entryNumber: entryNumber++,
          accountCode: account.account_code,
          accountName: account.account_name,
          costCenterCode: null,
          composedGLString,
          entryType,
          amount,
          description,
          overrideRuleApplied: matchedRule?.rule_name || null,
          segmentValues,
        });

        if (entryType === 'debit') totalDebits += amount;
        else totalCredits += amount;
      };

      // Get mappings
      const grossPayMapping = findMapping("gross_pay") || findMapping("wages_expense");
      const netPayMapping = findMapping("net_pay");
      const taxMapping = findMapping("tax_liability");
      const benefitMapping = findMapping("benefit_liability");
      const employerTaxMapping = findMapping("tax_expense");
      const employerBenefitMapping = findMapping("benefit_expense");
      const savingsEmpMapping = findMapping("savings_employee_deduction");
      const savingsErExpMapping = findMapping("savings_employer_contribution");
      const savingsErLiabMapping = findMapping("savings_employer_liability");

      // Generate entries
      await createEntry("wages_expense", grossPayMapping?.debit_account_id, simulationData.grossPay, 'debit', "Gross pay expense");
      await createEntry("tax_expense", employerTaxMapping?.debit_account_id, simulationData.employerTaxes, 'debit', "Employer tax expense");
      await createEntry("benefit_expense", employerBenefitMapping?.debit_account_id, simulationData.employerBenefits, 'debit', "Employer benefit expense");
      await createEntry("savings_employer_contribution", savingsErExpMapping?.debit_account_id, simulationData.savingsEmployerTotal, 'debit', "Employer savings match");

      await createEntry("net_pay", netPayMapping?.credit_account_id, simulationData.netPay, 'credit', "Net pay payable");
      await createEntry("tax_liability", taxMapping?.credit_account_id, simulationData.taxDeductions, 'credit', "Tax withholdings");
      await createEntry("benefit_liability", benefitMapping?.credit_account_id, simulationData.benefitDeductions, 'credit', "Benefit deductions");
      await createEntry("tax_liability", employerTaxMapping?.credit_account_id, simulationData.employerTaxes, 'credit', "Employer taxes payable");
      await createEntry("benefit_liability", employerBenefitMapping?.credit_account_id, simulationData.employerBenefits, 'credit', "Employer benefits payable");
      await createEntry("savings_employee_deduction", savingsEmpMapping?.credit_account_id, simulationData.savingsEmployeeTotal, 'credit', "Employee savings");
      await createEntry("savings_employer_liability", savingsErLiabMapping?.credit_account_id, simulationData.savingsEmployerTotal, 'credit', "Employer savings payable");

      const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

      return { entries, totalDebits, totalCredits, isBalanced, warnings };
    } catch (err) {
      console.error("Error simulating employee GL:", err);
      return null;
    } finally {
      setIsSimulating(false);
    }
  };

  /**
   * Calculate and create GL journal entries for a payroll run
   */
  const calculateGL = async (
    payrollRunId: string,
    companyId: string
  ): Promise<GLCalculationResult | null> => {
    setIsCalculating(true);
    try {
      // Check if already calculated
      const alreadyCalculated = await checkGLCalculated(payrollRunId);
      if (alreadyCalculated) {
        toast.info("GL entries have already been calculated for this payroll run");
        return null;
      }

      // Fetch payroll run details with employee payroll data
      const { data: runData, error: runError } = await supabase
        .from("payroll_runs")
        .select(`
          *,
          employee_payroll (
            id, employee_id, gross_pay, net_pay, 
            tax_deductions, benefit_deductions, retirement_deductions,
            employer_taxes, employer_benefits, employer_retirement,
            calculation_details
          )
        `)
        .eq("id", payrollRunId)
        .single();

      if (runError) throw runError;

      // Fetch GL account mappings for this company
      const { data: mappings, error: mappingError } = await supabase
        .from("gl_account_mappings")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true);

      if (mappingError) throw mappingError;

      if (!mappings || mappings.length === 0) {
        toast.error("No GL account mappings configured. Please set up GL mappings first.");
        return null;
      }

      // Fetch override rules
      const overrideRules = await fetchOverrideRules(companyId);

      // Fetch GL accounts for composing GL strings
      const { data: accounts } = await supabase
        .from("gl_accounts")
        .select("id, account_code, account_name")
        .eq("company_id", companyId);

      const accountMap = new Map<string, GLAccount>();
      (accounts || []).forEach(a => accountMap.set(a.id, a));

      // Create journal batch
      const batchNumber = `PR-${runData.run_number}-${Date.now().toString(36).toUpperCase()}`;
      const { data: batch, error: batchError } = await supabase
        .from("gl_journal_batches")
        .insert({
          company_id: companyId,
          batch_number: batchNumber,
          batch_date: new Date().toISOString().split('T')[0],
          payroll_run_id: payrollRunId,
          description: `Payroll GL entries for run ${runData.run_number}`,
          status: "draft",
          total_debits: 0,
          total_credits: 0,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Helper function to find mapping by type
      const findMapping = (mappingType: string) => 
        mappings.find((m: GLMapping) => m.mapping_type === mappingType);

      // Create journal entries based on payroll totals
      const entries: any[] = [];
      let entryNumber = 1;
      let totalDebits = 0;
      let totalCredits = 0;

      // Calculate totals from employee payroll including savings
      const totals = (runData.employee_payroll || []).reduce(
        (acc: any, emp: any) => {
          const calcDetails = emp.calculation_details as any;
          const savingsDeductions = calcDetails?.savings_deductions || {};
          
          return {
            grossPay: acc.grossPay + (emp.gross_pay || 0),
            netPay: acc.netPay + (emp.net_pay || 0),
            taxDeductions: acc.taxDeductions + (emp.tax_deductions || 0),
            benefitDeductions: acc.benefitDeductions + (emp.benefit_deductions || 0),
            employerTaxes: acc.employerTaxes + (emp.employer_taxes || 0),
            employerBenefits: acc.employerBenefits + (emp.employer_benefits || 0),
            employerRetirement: acc.employerRetirement + (emp.employer_retirement || 0),
            savingsEmployeeTotal: acc.savingsEmployeeTotal + (savingsDeductions.total_employee || 0),
            savingsEmployerTotal: acc.savingsEmployerTotal + (savingsDeductions.total_employer || 0),
          };
        },
        { 
          grossPay: 0, netPay: 0, taxDeductions: 0, benefitDeductions: 0, 
          employerTaxes: 0, employerBenefits: 0, employerRetirement: 0,
          savingsEmployeeTotal: 0, savingsEmployerTotal: 0
        }
      );

      // Helper to create entry with override evaluation
      const createEntry = async (
        mappingType: string,
        accountId: string | null,
        amount: number,
        entryType: 'debit' | 'credit',
        description: string
      ) => {
        if (!accountId || amount <= 0) return;

        const account = accountMap.get(accountId);
        if (!account) return;

        // Find matching override rule
        const context = {
          mappingType,
          payElementId: null,
          departmentId: null,
          divisionId: null,
          locationId: null,
          jobId: null,
          costCenterId: null,
          entryType,
        };

        let matchedRule: OverrideRule | null = null;
        for (const rule of overrideRules) {
          if (evaluateRule(rule, context)) {
            matchedRule = rule;
            break;
          }
        }

        let composedGLString = account.account_code;
        let segmentValues: Record<string, string> | null = null;
        let finalAccountId = accountId;

        if (matchedRule?.target) {
          if (matchedRule.override_type === 'full_string' && matchedRule.target.custom_gl_string) {
            composedGLString = matchedRule.target.custom_gl_string;
          } else if (matchedRule.override_type === 'account' && matchedRule.target.target_account_id) {
            finalAccountId = matchedRule.target.target_account_id;
            const overrideAccount = accountMap.get(finalAccountId);
            if (overrideAccount) {
              composedGLString = overrideAccount.account_code;
            }
          } else if (matchedRule.override_type === 'segment' && matchedRule.target.segment_overrides) {
            const composed = await composeGLString(
              companyId,
              account.account_code,
              matchedRule.target.segment_overrides as Record<string, string>,
              {}
            );
            composedGLString = composed.glString;
            segmentValues = composed.segmentValues;
          }
        }

        entries.push({
          batch_id: batch.id,
          entry_number: entryNumber++,
          entry_date: batch.batch_date,
          account_id: finalAccountId,
          debit_amount: entryType === 'debit' ? amount : 0,
          credit_amount: entryType === 'credit' ? amount : 0,
          description,
          source_type: "payroll_run",
          entry_type: entryType,
          composed_gl_string: composedGLString,
          segment_values: segmentValues,
          override_rule_id: matchedRule?.id || null,
        });

        if (entryType === 'debit') totalDebits += amount;
        else totalCredits += amount;
      };

      // Get mappings
      const grossPayMapping = findMapping("gross_pay") || findMapping("salaries_expense") || findMapping("wages_expense");
      const netPayMapping = findMapping("net_pay") || findMapping("payroll_payable");
      const taxWithholdingMapping = findMapping("tax_withholding") || findMapping("taxes_payable") || findMapping("tax_liability");
      const employerTaxMapping = findMapping("employer_tax") || findMapping("employer_taxes_expense") || findMapping("tax_expense");
      const benefitDeductionMapping = findMapping("benefit_deduction") || findMapping("benefits_payable") || findMapping("benefit_liability");
      const employerBenefitMapping = findMapping("employer_benefit") || findMapping("employer_benefits_expense") || findMapping("benefit_expense");
      const savingsEmployeeMapping = findMapping("savings_employee_deduction");
      const savingsEmployerExpenseMapping = findMapping("savings_employer_contribution");
      const savingsEmployerLiabilityMapping = findMapping("savings_employer_liability");
      const retirementExpenseMapping = findMapping("retirement_expense");
      const retirementLiabilityMapping = findMapping("retirement_liability");

      // DEBIT entries
      await createEntry("wages_expense", grossPayMapping?.debit_account_id, totals.grossPay, 'debit', "Gross payroll expense");
      await createEntry("tax_expense", employerTaxMapping?.debit_account_id, totals.employerTaxes, 'debit', "Employer tax expense");
      await createEntry("benefit_expense", employerBenefitMapping?.debit_account_id, totals.employerBenefits, 'debit', "Employer benefit expense");
      await createEntry("savings_employer_contribution", savingsEmployerExpenseMapping?.debit_account_id, totals.savingsEmployerTotal, 'debit', "Employer savings match expense");
      await createEntry("retirement_expense", retirementExpenseMapping?.debit_account_id, totals.employerRetirement, 'debit', "Employer retirement expense");

      // CREDIT entries
      await createEntry("net_pay", netPayMapping?.credit_account_id, totals.netPay, 'credit', "Net payroll payable");
      await createEntry("tax_liability", taxWithholdingMapping?.credit_account_id, totals.taxDeductions, 'credit', "Employee tax withholdings payable");
      await createEntry("benefit_liability", benefitDeductionMapping?.credit_account_id, totals.benefitDeductions, 'credit', "Employee benefit deductions payable");
      await createEntry("tax_liability", employerTaxMapping?.credit_account_id || taxWithholdingMapping?.credit_account_id, totals.employerTaxes, 'credit', "Employer taxes payable");
      await createEntry("benefit_liability", employerBenefitMapping?.credit_account_id || benefitDeductionMapping?.credit_account_id, totals.employerBenefits, 'credit', "Employer benefits payable");
      await createEntry("savings_employee_deduction", savingsEmployeeMapping?.credit_account_id, totals.savingsEmployeeTotal, 'credit', "Employee savings deductions payable");
      await createEntry("savings_employer_liability", savingsEmployerLiabilityMapping?.credit_account_id || savingsEmployerExpenseMapping?.credit_account_id, totals.savingsEmployerTotal, 'credit', "Employer savings match payable");
      await createEntry("retirement_liability", retirementLiabilityMapping?.credit_account_id, totals.employerRetirement, 'credit', "Employer retirement payable");

      // Insert all entries
      if (entries.length > 0) {
        const { error: entriesError } = await supabase
          .from("gl_journal_entries")
          .insert(entries);

        if (entriesError) throw entriesError;
      }

      // Update batch totals
      await supabase
        .from("gl_journal_batches")
        .update({
          total_debits: totalDebits,
          total_credits: totalCredits,
        })
        .eq("id", batch.id);

      // Check if balanced
      const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
      if (!isBalanced) {
        toast.warning(`GL entries created but not balanced. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}`);
      } else {
        toast.success(`GL entries calculated successfully. ${entries.length} entries created.`);
      }

      return {
        batchId: batch.id,
        totalDebits,
        totalCredits,
        entryCount: entries.length,
      };
    } catch (err: any) {
      console.error("Error calculating GL:", err);
      toast.error(err.message || "Failed to calculate GL entries");
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    isCalculating,
    isSimulating,
    checkGLConfigured,
    checkGLCalculated,
    calculateGL,
    simulateGL,
    simulateEmployeeGL,
  };
}
