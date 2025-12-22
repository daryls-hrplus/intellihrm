import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator, RefreshCw } from "lucide-react";
import { 
  calculateProrationFactor, 
  applyProration, 
  getProrationMethodCode,
  type ProrationResult 
} from "@/utils/payroll/prorationCalculator";

interface PayrollSimulatorProps {
  companyId: string;
  employeeId: string;
  payPeriodId: string;
}

interface StatutoryDeduction {
  name: string;
  code: string;
  employee_amount: number;
  employer_amount: number;
  calculation_method: string;
  ytd_info?: {
    ytd_taxable_before: number;
    ytd_taxable_after: number;
    ytd_tax_before: number;
    ytd_tax_after: number;
  };
}

interface OpeningBalances {
  ytd_taxable_income: number;
  ytd_income_tax: number;
  ytd_gross_earnings: number;
}

interface SimulationResult {
  employee: {
    name: string;
    employee_id: string;
    position: string;
  };
  salary: {
    base_salary: number;
    hourly_rate: number;
    currency: string;
    frequency: string;
  };
  proration?: {
    isProrated: boolean;
    factor: number;
    daysWorked: number;
    totalDays: number;
    method: string;
    fullPeriodSalary: number;
  };
  earnings: {
    regular_hours: number;
    overtime_hours: number;
    regular_pay: number;
    overtime_pay: number;
    additional_comp: Array<{ name: string; amount: number }>;
    allowances: Array<{ name: string; amount: number; is_taxable: boolean; is_bik: boolean }>;
    total_gross: number;
  };
  deductions: {
    pretax: Array<{ name: string; amount: number; type: string }>;
    statutory: StatutoryDeduction[];
    posttax: Array<{ name: string; amount: number; type: string }>;
    total_deductions: number;
  };
  net_pay: number;
  rules_applied: Array<{ name: string; type: string; multiplier: number }>;
}

interface StatutoryRateBand {
  id: string;
  statutory_type_id: string;
  band_name: string;
  min_amount: number;
  max_amount: number | null;
  employee_rate: number | null;
  employer_rate: number | null;
  calculation_method: string;
  per_monday_amount: number;
  employer_per_monday_amount: number | null;
  min_age: number | null;
  max_age: number | null;
  pay_frequency: string;
}

interface StatutoryType {
  id: string;
  country: string;
  statutory_type: string;
  statutory_code: string;
  statutory_name: string;
}

export function PayrollSimulator({ companyId, employeeId, payPeriodId }: PayrollSimulatorProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const calculateStatutoryDeductions = (
    taxableIncome: number,
    statutoryTypes: StatutoryType[],
    rateBands: StatutoryRateBand[],
    mondayCount: number,
    employeeAge: number | null,
    payFrequency: string,
    openingBalances: OpeningBalances | null
  ): StatutoryDeduction[] => {
    const deductions: StatutoryDeduction[] = [];

    for (const statType of statutoryTypes) {
      // Get rate bands for this statutory type
      const bands = rateBands
        .filter(b => b.statutory_type_id === statType.id)
        .sort((a, b) => (a.min_amount || 0) - (b.min_amount || 0));

      if (bands.length === 0) continue;

      let employeeAmount = 0;
      let employerAmount = 0;
      let method = 'percentage';
      let ytdInfo: StatutoryDeduction['ytd_info'] = undefined;

      // For income_tax (PAYE), use cumulative calculation if opening balances exist
      if (statType.statutory_type === 'income_tax' && openingBalances) {
        const ytdTaxableBefore = openingBalances.ytd_taxable_income || 0;
        const ytdTaxPaid = openingBalances.ytd_income_tax || 0;
        const ytdTaxableAfter = ytdTaxableBefore + taxableIncome;

        // Calculate total tax due on cumulative earnings
        const totalTaxDue = calculateCumulativeTax(ytdTaxableAfter, bands, payFrequency);
        
        // Current period tax = Total tax due - Tax already paid
        employeeAmount = Math.max(0, totalTaxDue - ytdTaxPaid);
        method = 'cumulative';

        ytdInfo = {
          ytd_taxable_before: ytdTaxableBefore,
          ytd_taxable_after: ytdTaxableAfter,
          ytd_tax_before: ytdTaxPaid,
          ytd_tax_after: ytdTaxPaid + employeeAmount
        };
      } else {
        // Non-cumulative calculation for other statutory types
        for (const band of bands) {
          // Check age restrictions
          if (employeeAge !== null) {
            if (band.min_age !== null && employeeAge < band.min_age) continue;
            if (band.max_age !== null && employeeAge > band.max_age) continue;
          }

          // Check if income falls within this band
          const minAmount = band.min_amount || 0;
          const maxAmount = band.max_amount;
          
          if (taxableIncome < minAmount) continue;
          if (maxAmount !== null && taxableIncome > maxAmount) continue;

          method = band.calculation_method || 'percentage';

          if (method === 'per_monday') {
            // Per-monday calculation (e.g., NIS, Health Surcharge)
            employeeAmount = (band.per_monday_amount || 0) * mondayCount;
            employerAmount = (band.employer_per_monday_amount || 0) * mondayCount;
          } else if (method === 'fixed') {
            // Fixed amount
            employeeAmount = band.per_monday_amount || 0;
            employerAmount = band.employer_per_monday_amount || 0;
          } else {
            // Percentage-based calculation
            const rate = band.employee_rate || 0;
            const employerRate = band.employer_rate || 0;
            
            employeeAmount = taxableIncome * rate;
            employerAmount = taxableIncome * employerRate;
          }

          // Found matching band, break
          break;
        }
      }

      if (employeeAmount > 0 || employerAmount > 0) {
        deductions.push({
          name: statType.statutory_name,
          code: statType.statutory_code,
          employee_amount: employeeAmount,
          employer_amount: employerAmount,
          calculation_method: method,
          ytd_info: ytdInfo
        });
      }
    }

    return deductions;
  };

  // Calculate cumulative tax using progressive tax bands
  const calculateCumulativeTax = (
    cumulativeTaxableIncome: number,
    bands: StatutoryRateBand[],
    payFrequency: string
  ): number => {
    let totalTax = 0;
    let remainingIncome = cumulativeTaxableIncome;

    // Sort bands by min_amount to ensure proper progressive calculation
    const sortedBands = [...bands].sort((a, b) => (a.min_amount || 0) - (b.min_amount || 0));

    for (let i = 0; i < sortedBands.length; i++) {
      const band = sortedBands[i];
      const minAmount = band.min_amount || 0;
      const maxAmount = band.max_amount;
      const rate = band.employee_rate || 0;

      if (remainingIncome <= 0) break;
      if (cumulativeTaxableIncome < minAmount) continue;

      // Calculate the taxable amount in this band
      let bandTaxable: number;
      if (maxAmount !== null) {
        // Amount in this band is from minAmount to min(income, maxAmount)
        const bandTop = Math.min(cumulativeTaxableIncome, maxAmount);
        bandTaxable = Math.max(0, bandTop - minAmount);
      } else {
        // Top band - everything above minAmount
        bandTaxable = Math.max(0, cumulativeTaxableIncome - minAmount);
      }

      totalTax += bandTaxable * rate;
    }

    return totalTax;
  };

  const runSimulation = async () => {
    setIsCalculating(true);
    
    try {
      // Fetch employee info
      const { data: employee } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', employeeId)
        .single();

      // Note: Age-based statutory exemptions would need date_of_birth from employee_profiles table
      // For now, we skip age checks (employeeAge = null means all ages apply)
      let employeeAge: number | null = null;

      // Fetch company to get territory/country
      const { data: company } = await supabase
        .from('companies')
        .select('territory_id, territories(country_code)')
        .eq('id', companyId)
        .single();

      // Determine country code (default to TT if not set)
      const countryCode = (company?.territories as any)?.country_code || 'TT';

      // Fetch ALL active employee positions with compensation
      const { data: positionsData, error: positionError } = await supabase
        .from('employee_positions')
        .select(`
          compensation_amount,
          compensation_currency,
          compensation_frequency,
          start_date,
          end_date,
          is_primary,
          positions (title)
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (positionError) throw positionError;

      // Get positions array (could be multiple)
      const allPositions = positionsData || [];
      
      // Use primary position for proration dates, or first position if no primary
      const primaryPosition = allPositions.find(p => p.is_primary) || allPositions[0];
      
      // Get employee start/end dates for proration from primary position
      const employeeStartDate = primaryPosition?.start_date 
        ? new Date(primaryPosition.start_date) 
        : null;
      const employeeEndDate = primaryPosition?.end_date
        ? new Date(primaryPosition.end_date)
        : null;

      // Fetch employee compensation (overrides position compensation when present)
      const { data: employeeComp, error: employeeCompError } = await supabase
        .from('employee_compensation')
        .select(`
          amount,
          currency,
          frequency,
          pay_elements (
            name, 
            code,
            proration_method:lookup_values!pay_elements_proration_method_id_fkey(code, name)
          )
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true);

      if (employeeCompError) throw employeeCompError;

      // Fetch work records with periods
      const { data: workRecords } = await supabase
        .from('employee_work_records')
        .select(`
          *,
          payroll_rules(name, rule_type, overtime_multiplier, weekend_multiplier, holiday_multiplier)
        `)
        .eq('employee_id', employeeId)
        .eq('pay_period_id', payPeriodId);

      // Fetch allowances
      const { data: allowances } = await supabase
        .from('employee_period_allowances')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('pay_period_id', payPeriodId);

      // Fetch deductions
      const { data: deductions } = await supabase
        .from('employee_period_deductions')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('pay_period_id', payPeriodId);

      // Fetch pay period info for period-based calculations
      const { data: payPeriod, error: payPeriodError } = await supabase
        .from('pay_periods')
        .select('period_start, period_end, monday_count, pay_groups(pay_frequency)')
        .eq('id', payPeriodId)
        .maybeSingle();

      if (payPeriodError) {
        console.error('Pay period fetch error:', payPeriodError);
      }

      // Fetch statutory deduction types for the country
      const { data: statutoryTypes } = await supabase
        .from('statutory_deduction_types')
        .select('*')
        .eq('country', countryCode)
        .eq('is_active', true);

      // Fetch rate bands for the statutory types
      const statutoryTypeIds = (statutoryTypes || []).map(s => s.id);
      const { data: rateBands } = await supabase
        .from('statutory_rate_bands')
        .select('*')
        .in('statutory_type_id', statutoryTypeIds.length > 0 ? statutoryTypeIds : ['00000000-0000-0000-0000-000000000000'])
        .eq('is_active', true);

      // Fetch opening balances for cumulative PAYE calculation
      const currentYear = new Date().getFullYear();
      const { data: openingBalanceData } = await supabase
        .from('employee_opening_balances')
        .select('ytd_taxable_income, ytd_income_tax, ytd_gross_earnings')
        .eq('employee_id', employeeId)
        .eq('company_id', companyId)
        .eq('tax_year', currentYear)
        .maybeSingle();

      const openingBalances: OpeningBalances | null = openingBalanceData ? {
        ytd_taxable_income: openingBalanceData.ytd_taxable_income || 0,
        ytd_income_tax: openingBalanceData.ytd_income_tax || 0,
        ytd_gross_earnings: openingBalanceData.ytd_gross_earnings || 0
      } : null;

      // Determine pay frequency for this simulation
      const payFrequency = (payPeriod?.pay_groups as any)?.pay_frequency || 'monthly';
      const mondayCount = payPeriod?.monday_count || 4; // Default to 4 Mondays if not set

      // Employee compensation overrides position compensation when present
      const employeeCompList = employeeComp || [];
      const baseSalaryItemIndex = employeeCompList.findIndex(
        (c) => ((c.pay_elements as any)?.code || '').toUpperCase() === 'SAL'
      );
      const baseSalaryItem =
        employeeCompList.length > 0
          ? employeeCompList[baseSalaryItemIndex >= 0 ? baseSalaryItemIndex : 0]
          : null;

      // Calculate total position compensation from ALL positions
      const totalPositionCompensation = allPositions.reduce((sum, pos) => {
        const amount = pos.compensation_amount || 0;
        const freq = pos.compensation_frequency || 'monthly';
        // Convert to monthly for consistent aggregation
        let monthlyAmount = amount;
        switch (freq) {
          case 'annual': monthlyAmount = amount / 12; break;
          case 'weekly': monthlyAmount = amount * 4.33; break;
          case 'biweekly': monthlyAmount = amount * 2.17; break;
          case 'fortnightly': monthlyAmount = amount * 2.17; break;
        }
        return sum + monthlyAmount;
      }, 0);
      
      // Use employee compensation if available, otherwise use total position compensation
      const baseCompAmount = baseSalaryItem ? (baseSalaryItem.amount || 0) : totalPositionCompensation;
      const baseCompFrequency = baseSalaryItem ? (baseSalaryItem.frequency || 'monthly') : 'monthly'; // Aggregated is monthly
      const baseCompCurrency = baseSalaryItem
        ? (baseSalaryItem.currency || primaryPosition?.compensation_currency || 'USD')
        : (primaryPosition?.compensation_currency || 'USD');

      // Get proration method from base salary pay element
      const baseProrationMethodCode = getProrationMethodCode(
        (baseSalaryItem?.pay_elements as any)?.proration_method?.code
      );

      // Calculate proration factor for base salary
      let prorationResult: ProrationResult | null = null;
      if (payPeriod?.period_start && payPeriod?.period_end) {
        prorationResult = calculateProrationFactor({
          periodStart: new Date(payPeriod.period_start),
          periodEnd: new Date(payPeriod.period_end),
          employeeStartDate,
          employeeEndDate,
          prorationMethod: baseProrationMethodCode,
        });
      }

      // Use default standard hours until positions/jobs standard hours are wired here
      const standardHours = 40;

      const hoursPerYear = standardHours * 52;
      let annualSalary = baseCompAmount;

      switch (baseCompFrequency) {
        case 'monthly':
          annualSalary = baseCompAmount * 12;
          break;
        case 'biweekly':
        case 'fortnightly':
          annualSalary = baseCompAmount * 26;
          break;
        case 'weekly':
          annualSalary = baseCompAmount * 52;
          break;
        case 'annual':
          annualSalary = baseCompAmount;
          break;
      }

      const hourlyRate = hoursPerYear > 0 ? annualSalary / hoursPerYear : 0;

      // Calculate period-based base salary
      let periodBaseSalary = baseCompAmount;
      if (baseCompFrequency !== payFrequency) {
        switch (payFrequency) {
          case 'monthly':
            periodBaseSalary = annualSalary / 12;
            break;
          case 'biweekly':
          case 'fortnightly':
            periodBaseSalary = annualSalary / 26;
            break;
          case 'weekly':
            periodBaseSalary = annualSalary / 52;
            break;
          case 'semimonthly':
            periodBaseSalary = annualSalary / 24;
            break;
        }
      }

      // Apply proration to base salary if applicable
      const fullPeriodBaseSalary = periodBaseSalary;
      if (prorationResult && prorationResult.isProrated) {
        periodBaseSalary = applyProration(periodBaseSalary, prorationResult);
      }

      // Calculate totals from work records
      const regularHours = (workRecords || []).reduce((sum, r) => sum + (r.regular_hours || 0), 0);
      const overtimeHours = (workRecords || []).reduce((sum, r) => sum + (r.overtime_hours || 0), 0);

      // Use base salary for regular pay, hourly rate for overtime
      const regularPay = periodBaseSalary;
      const overtimePay = overtimeHours * hourlyRate * 1.5;

      // Any remaining employee compensation items (besides Base Salary) are treated as additional comp
      const remainingEmployeeComp = baseSalaryItem
        ? employeeCompList.filter((_, idx) => idx !== (baseSalaryItemIndex >= 0 ? baseSalaryItemIndex : 0))
        : [];

      const additionalCompList = remainingEmployeeComp.map((c) => {
        let periodAmount = c.amount || 0;
        const freq = c.frequency || 'monthly';

        if (freq !== payFrequency) {
          let annualAmount = periodAmount;
          switch (freq) {
            case 'monthly':
              annualAmount = periodAmount * 12;
              break;
            case 'biweekly':
              annualAmount = periodAmount * 26;
              break;
            case 'weekly':
              annualAmount = periodAmount * 52;
              break;
            case 'annual':
              annualAmount = periodAmount;
              break;
          }

          switch (payFrequency) {
            case 'monthly':
              periodAmount = annualAmount / 12;
              break;
            case 'biweekly':
              periodAmount = annualAmount / 26;
              break;
            case 'weekly':
              periodAmount = annualAmount / 52;
              break;
            case 'semimonthly':
              periodAmount = annualAmount / 24;
              break;
          }
        }

        return {
          name: (c.pay_elements as any)?.name || 'Compensation',
          amount: periodAmount,
        };
      });

      const totalAdditionalComp = additionalCompList.reduce((sum, c) => sum + c.amount, 0);

      const allowanceList = (allowances || []).map(a => ({
        name: a.allowance_name,
        amount: a.amount,
        is_taxable: a.is_taxable,
        is_bik: a.is_benefit_in_kind
      }));

      const totalAllowances = allowanceList.reduce((sum, a) => sum + a.amount, 0);
      const totalGross = regularPay + overtimePay + totalAdditionalComp + totalAllowances;

      // Calculate deductions
      const pretaxDeductions = (deductions || [])
        .filter(d => d.is_pretax)
        .map(d => ({ name: d.deduction_name, amount: d.amount, type: d.deduction_type || 'other' }));
      
      const posttaxDeductions = (deductions || [])
        .filter(d => !d.is_pretax)
        .map(d => ({ name: d.deduction_name, amount: d.amount, type: d.deduction_type || 'other' }));

      const totalPretax = pretaxDeductions.reduce((sum, d) => sum + d.amount, 0);
      const taxableIncome = totalGross - totalPretax;

      // Calculate statutory deductions using configured rates
      const statutoryDeductions = calculateStatutoryDeductions(
        taxableIncome,
        statutoryTypes || [],
        rateBands || [],
        mondayCount,
        employeeAge,
        payFrequency,
        openingBalances
      );

      const totalStatutory = statutoryDeductions.reduce((sum, d) => sum + d.employee_amount, 0);
      const totalPosttax = posttaxDeductions.reduce((sum, d) => sum + d.amount, 0);
      const totalDeductions = totalPretax + totalStatutory + totalPosttax;
      const netPay = totalGross - totalDeductions;

      // Collect unique rules applied
      const rulesApplied = new Map();
      (workRecords || []).forEach(r => {
        if (r.payroll_rules) {
          rulesApplied.set(r.payroll_rules.name, {
            name: r.payroll_rules.name,
            type: r.payroll_rules.rule_type,
            multiplier: r.payroll_rules.overtime_multiplier
          });
        }
      });

      setResult({
        employee: {
          name: employee?.full_name || 'N/A',
          employee_id: employeeId.slice(0, 8).toUpperCase(),
          position: allPositions.length > 1 
            ? `${allPositions.length} positions` 
            : ((primaryPosition?.positions as any)?.title || 'N/A')
        },
        salary: {
          base_salary: periodBaseSalary,
          hourly_rate: hourlyRate,
          currency: baseCompCurrency,
          frequency: payFrequency
        },
        proration: prorationResult ? {
          isProrated: prorationResult.isProrated,
          factor: prorationResult.factor,
          daysWorked: prorationResult.daysWorked,
          totalDays: prorationResult.totalDays,
          method: baseProrationMethodCode,
          fullPeriodSalary: fullPeriodBaseSalary
        } : undefined,
        earnings: {
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          regular_pay: regularPay,
          overtime_pay: overtimePay,
          additional_comp: additionalCompList,
          allowances: allowanceList,
          total_gross: totalGross
        },
        deductions: {
          pretax: pretaxDeductions,
          statutory: statutoryDeductions,
          posttax: posttaxDeductions,
          total_deductions: totalDeductions
        },
        net_pay: netPay,
        rules_applied: Array.from(rulesApplied.values())
      });

      if (periodBaseSalary === 0 && additionalCompList.length === 0) {
        toast.warning(
          "No base salary configured for this employee. Please set up employee compensation or position compensation."
        );
      } else {
        toast.success("Payroll simulation complete");
      }
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error("Failed to run simulation");
    }
    
    setIsCalculating(false);
  };

  useEffect(() => {
    runSimulation();
  }, [employeeId, payPeriodId]);

  if (!result) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Employee Info */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Employee</p>
          <p className="font-medium">{result.employee.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Employee ID</p>
          <p className="font-medium">{result.employee.employee_id}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Position</p>
          <p className="font-medium">{result.employee.position}</p>
        </div>
      </div>

      {/* Rules Applied */}
      {result.rules_applied.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Rules Applied</h4>
          <div className="flex gap-2 flex-wrap">
            {result.rules_applied.map((rule, idx) => (
              <Badge key={idx} variant="outline">
                {rule.name} ({rule.type}) - {rule.multiplier}x OT
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Salary Info */}
      {result.salary.base_salary === 0 ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-medium">
            ⚠️ No base salary configured for this employee. Please set up employee compensation or position compensation.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Base Salary</p>
              <p className="font-semibold">{result.salary.currency} {formatCurrency(result.salary.base_salary)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Hourly Rate</p>
              <p className="font-semibold">{result.salary.currency} {formatCurrency(result.salary.hourly_rate)}/hr</p>
            </div>
            <div>
              <p className="text-muted-foreground">Currency</p>
              <p className="font-semibold">{result.salary.currency}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pay Frequency</p>
              <p className="font-semibold capitalize">{result.salary.frequency}</p>
            </div>
          </div>
          
          {/* Proration Info */}
          {result.proration?.isProrated && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
                ⚡ Mid-Period Proration Applied
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Full Period Salary</p>
                  <p className="font-medium">{result.salary.currency} {formatCurrency(result.proration.fullPeriodSalary)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Days Worked</p>
                  <p className="font-medium">{result.proration.daysWorked} / {result.proration.totalDays}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Proration Factor</p>
                  <p className="font-medium">{(result.proration.factor * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Method</p>
                  <p className="font-medium capitalize">{result.proration.method.replace('_', ' ').toLowerCase()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Earnings */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Earnings</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Base Salary ({result.salary.frequency})</TableCell>
                <TableCell className="text-right">{result.salary.currency} {formatCurrency(result.earnings.regular_pay)}</TableCell>
              </TableRow>
              {result.earnings.overtime_hours > 0 && (
                <TableRow>
                  <TableCell>Overtime ({result.earnings.overtime_hours}h @ {result.salary.currency} {formatCurrency(result.salary.hourly_rate)} × 1.5)</TableCell>
                  <TableCell className="text-right">{result.salary.currency} {formatCurrency(result.earnings.overtime_pay)}</TableCell>
                </TableRow>
              )}
              {result.earnings.additional_comp.map((comp, idx) => (
                <TableRow key={`comp-${idx}`}>
                  <TableCell>{comp.name}</TableCell>
                  <TableCell className="text-right">{result.salary.currency} {formatCurrency(comp.amount)}</TableCell>
                </TableRow>
              ))}
              {result.earnings.allowances.map((allowance, idx) => (
                <TableRow key={`allow-${idx}`}>
                  <TableCell className="flex items-center gap-2">
                    {allowance.name}
                    {allowance.is_bik && <Badge variant="secondary" className="text-xs">BIK</Badge>}
                    {!allowance.is_taxable && <Badge variant="outline" className="text-xs">Non-taxable</Badge>}
                  </TableCell>
                  <TableCell className="text-right">{result.salary.currency} {formatCurrency(allowance.amount)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-medium bg-muted/50">
                <TableCell>Total Gross Pay</TableCell>
                <TableCell className="text-right">{result.salary.currency} {formatCurrency(result.earnings.total_gross)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Deductions */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Deductions</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <Table>
            <TableBody>
              {result.deductions.pretax.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm text-muted-foreground font-medium">
                      Pre-tax Deductions
                    </TableCell>
                  </TableRow>
                  {result.deductions.pretax.map((d, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">{d.name}</TableCell>
                      <TableCell className="text-right text-destructive">-{result.salary.currency} {formatCurrency(d.amount)}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              
              {result.deductions.statutory.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm text-muted-foreground font-medium">
                      Statutory Deductions
                    </TableCell>
                  </TableRow>
                  {result.deductions.statutory.map((d, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          {d.name}
                          <Badge variant="outline" className="text-xs">{d.code}</Badge>
                          {d.calculation_method === 'per_monday' && (
                            <Badge variant="secondary" className="text-xs">Per Monday</Badge>
                          )}
                          {d.calculation_method === 'cumulative' && (
                            <Badge variant="secondary" className="text-xs">Cumulative</Badge>
                          )}
                        </div>
                        {d.ytd_info && (
                          <div className="text-xs text-muted-foreground mt-1">
                            YTD Taxable: {result.salary.currency} {formatCurrency(d.ytd_info.ytd_taxable_before)} → {result.salary.currency} {formatCurrency(d.ytd_info.ytd_taxable_after)} | 
                            YTD Tax: {result.salary.currency} {formatCurrency(d.ytd_info.ytd_tax_before)} → {result.salary.currency} {formatCurrency(d.ytd_info.ytd_tax_after)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-destructive align-top">-{result.salary.currency} {formatCurrency(d.employee_amount)}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {result.deductions.statutory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-sm text-muted-foreground italic">
                    No statutory deductions configured for this territory
                  </TableCell>
                </TableRow>
              )}

              {result.deductions.posttax.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm text-muted-foreground font-medium">
                      Post-tax Deductions
                    </TableCell>
                  </TableRow>
                  {result.deductions.posttax.map((d, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">{d.name}</TableCell>
                      <TableCell className="text-right text-destructive">-{result.salary.currency} {formatCurrency(d.amount)}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              <TableRow className="font-medium bg-muted/50">
                <TableCell>Total Deductions</TableCell>
                <TableCell className="text-right text-destructive">-{result.salary.currency} {formatCurrency(result.deductions.total_deductions)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Net Pay */}
      <div className="p-4 bg-primary/10 rounded-lg flex justify-between items-center">
        <span className="text-lg font-medium">Net Pay</span>
        <span className="text-2xl font-bold text-primary">{result.salary.currency} {formatCurrency(result.net_pay)}</span>
      </div>

      <Button onClick={runSimulation} disabled={isCalculating} className="w-full gap-2">
        <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
        Recalculate
      </Button>
    </div>
  );
}
