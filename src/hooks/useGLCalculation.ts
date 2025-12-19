import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GLCalculationResult {
  batchId: string;
  totalDebits: number;
  totalCredits: number;
  entryCount: number;
}

export function useGLCalculation() {
  const [isCalculating, setIsCalculating] = useState(false);

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
        mappings.find((m) => m.mapping_type === mappingType);

      // Create journal entries based on payroll totals
      const entries: any[] = [];
      let entryNumber = 1;
      let totalDebits = 0;
      let totalCredits = 0;

      // Group by mapping type and aggregate
      const grossPayMapping = findMapping("gross_pay") || findMapping("salaries_expense");
      const netPayMapping = findMapping("net_pay") || findMapping("payroll_payable");
      const taxWithholdingMapping = findMapping("tax_withholding") || findMapping("taxes_payable");
      const benefitDeductionMapping = findMapping("benefit_deduction") || findMapping("benefits_payable");
      const employerTaxMapping = findMapping("employer_tax") || findMapping("employer_taxes_expense");
      const employerTaxPayableMapping = findMapping("employer_tax_payable");
      const employerBenefitMapping = findMapping("employer_benefit") || findMapping("employer_benefits_expense");
      const employerBenefitPayableMapping = findMapping("employer_benefit_payable");

      // Calculate totals from employee payroll
      const totals = (runData.employee_payroll || []).reduce(
        (acc: any, emp: any) => ({
          grossPay: acc.grossPay + (emp.gross_pay || 0),
          netPay: acc.netPay + (emp.net_pay || 0),
          taxDeductions: acc.taxDeductions + (emp.tax_deductions || 0),
          benefitDeductions: acc.benefitDeductions + (emp.benefit_deductions || 0),
          employerTaxes: acc.employerTaxes + (emp.employer_taxes || 0),
          employerBenefits: acc.employerBenefits + (emp.employer_benefits || 0),
        }),
        { grossPay: 0, netPay: 0, taxDeductions: 0, benefitDeductions: 0, employerTaxes: 0, employerBenefits: 0 }
      );

      // DEBIT: Gross Pay (Salaries Expense)
      if (grossPayMapping?.debit_account_id && totals.grossPay > 0) {
        entries.push({
          batch_id: batch.id,
          entry_number: entryNumber++,
          entry_date: batch.batch_date,
          account_id: grossPayMapping.debit_account_id,
          debit_amount: totals.grossPay,
          credit_amount: 0,
          description: "Gross payroll expense",
          source_type: "payroll_run",
        });
        totalDebits += totals.grossPay;
      }

      // DEBIT: Employer Taxes Expense
      if (employerTaxMapping?.debit_account_id && totals.employerTaxes > 0) {
        entries.push({
          batch_id: batch.id,
          entry_number: entryNumber++,
          entry_date: batch.batch_date,
          account_id: employerTaxMapping.debit_account_id,
          debit_amount: totals.employerTaxes,
          credit_amount: 0,
          description: "Employer tax expense",
          source_type: "payroll_run",
        });
        totalDebits += totals.employerTaxes;
      }

      // DEBIT: Employer Benefits Expense
      if (employerBenefitMapping?.debit_account_id && totals.employerBenefits > 0) {
        entries.push({
          batch_id: batch.id,
          entry_number: entryNumber++,
          entry_date: batch.batch_date,
          account_id: employerBenefitMapping.debit_account_id,
          debit_amount: totals.employerBenefits,
          credit_amount: 0,
          description: "Employer benefit expense",
          source_type: "payroll_run",
        });
        totalDebits += totals.employerBenefits;
      }

      // CREDIT: Net Pay (Payroll Payable / Cash)
      if (netPayMapping?.credit_account_id && totals.netPay > 0) {
        entries.push({
          batch_id: batch.id,
          entry_number: entryNumber++,
          entry_date: batch.batch_date,
          account_id: netPayMapping.credit_account_id,
          debit_amount: 0,
          credit_amount: totals.netPay,
          description: "Net payroll payable",
          source_type: "payroll_run",
        });
        totalCredits += totals.netPay;
      }

      // CREDIT: Tax Withholdings Payable
      if (taxWithholdingMapping?.credit_account_id && totals.taxDeductions > 0) {
        entries.push({
          batch_id: batch.id,
          entry_number: entryNumber++,
          entry_date: batch.batch_date,
          account_id: taxWithholdingMapping.credit_account_id,
          debit_amount: 0,
          credit_amount: totals.taxDeductions,
          description: "Employee tax withholdings payable",
          source_type: "payroll_run",
        });
        totalCredits += totals.taxDeductions;
      }

      // CREDIT: Benefit Deductions Payable
      if (benefitDeductionMapping?.credit_account_id && totals.benefitDeductions > 0) {
        entries.push({
          batch_id: batch.id,
          entry_number: entryNumber++,
          entry_date: batch.batch_date,
          account_id: benefitDeductionMapping.credit_account_id,
          debit_amount: 0,
          credit_amount: totals.benefitDeductions,
          description: "Employee benefit deductions payable",
          source_type: "payroll_run",
        });
        totalCredits += totals.benefitDeductions;
      }

      // CREDIT: Employer Taxes Payable
      const empTaxPayableAccount = employerTaxPayableMapping?.credit_account_id || taxWithholdingMapping?.credit_account_id;
      if (empTaxPayableAccount && totals.employerTaxes > 0) {
        entries.push({
          batch_id: batch.id,
          entry_number: entryNumber++,
          entry_date: batch.batch_date,
          account_id: empTaxPayableAccount,
          debit_amount: 0,
          credit_amount: totals.employerTaxes,
          description: "Employer taxes payable",
          source_type: "payroll_run",
        });
        totalCredits += totals.employerTaxes;
      }

      // CREDIT: Employer Benefits Payable
      const empBenPayableAccount = employerBenefitPayableMapping?.credit_account_id || benefitDeductionMapping?.credit_account_id;
      if (empBenPayableAccount && totals.employerBenefits > 0) {
        entries.push({
          batch_id: batch.id,
          entry_number: entryNumber++,
          entry_date: batch.batch_date,
          account_id: empBenPayableAccount,
          debit_amount: 0,
          credit_amount: totals.employerBenefits,
          description: "Employer benefits payable",
          source_type: "payroll_run",
        });
        totalCredits += totals.employerBenefits;
      }

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
    checkGLConfigured,
    checkGLCalculated,
    calculateGL,
  };
}
