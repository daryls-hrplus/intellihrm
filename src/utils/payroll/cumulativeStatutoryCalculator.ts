import { 
  StatutoryDeduction, 
  StatutoryRateBand, 
  OpeningBalances,
  CalculatedStatutory,
  StatutoryCalculationResult 
} from "@/utils/statutoryDeductionCalculator";
import { YtdStatutoryAmounts, PeriodStatutoryAmounts } from "./ytdStatutoryService";
import {
  TaxReliefRule,
  TaxReliefScheme,
  EmployeeReliefEnrollment,
  CalculatedRelief,
  calculateStatutoryTaxRelief,
  calculateSchemeReliefs,
} from "./taxReliefCalculator";

export type TaxCalculationMethod = 'cumulative' | 'non_cumulative';

export interface TaxReliefContext {
  /** Statutory tax relief rules for the country (NIS/SSNIT deductibility) */
  statutoryReliefRules: TaxReliefRule[];
  /** Tax relief schemes available in the country */
  taxReliefSchemes: TaxReliefScheme[];
  /** Employee's enrolled relief schemes */
  employeeEnrollments: EmployeeReliefEnrollment[];
  /** YTD relief amounts already claimed (by scheme code) */
  ytdReliefsClaimed?: Record<string, number>;
}

export interface CumulativeCalculationContext {
  /** YTD amounts from opening balances (start of year or mid-year joiner) */
  openingBalances: OpeningBalances | null;
  /** YTD amounts from payroll runs this tax year (excluding current calculation) */
  ytdStatutoryAmounts: YtdStatutoryAmounts;
  /** Amounts already calculated for this pay period (for off-cycle runs) */
  periodStatutoryAmounts: PeriodStatutoryAmounts;
  /** Whether this is an off-cycle calculation */
  isOffCycle: boolean;
  /** Tax calculation method for the country */
  taxCalculationMethod?: TaxCalculationMethod;
  /** Whether mid-year refunds are allowed (for cumulative method) */
  allowMidYearRefunds?: boolean;
  /** Tax relief context (optional - if provided, reliefs will be applied) */
  taxReliefContext?: TaxReliefContext;
}

export interface ExtendedStatutoryRateBand extends StatutoryRateBand {
  annual_max_employee: number | null;
  annual_max_employer: number | null;
  employer_fixed_amount: number | null;
}

export interface ExtendedStatutoryCalculationResult extends StatutoryCalculationResult {
  /** Tax reliefs applied (both statutory and scheme-based) */
  taxReliefs?: CalculatedRelief[];
  /** Total reduction to taxable income from reliefs */
  totalTaxableIncomeReduction?: number;
  /** Tax credits applied directly to tax amount */
  totalTaxCredits?: number;
  /** Adjusted taxable income after all reliefs */
  adjustedTaxableIncome?: number;
}

/**
 * Calculate cumulative PAYE tax using progressive bands
 * Considers YTD income to determine correct bracket
 */
function calculateCumulativeTax(
  cumulativeIncome: number,
  rateBands: StatutoryRateBand[],
  statutoryTypeId: string
): number {
  const taxBands = rateBands
    .filter(b => b.statutory_type_id === statutoryTypeId && b.is_active)
    .sort((a, b) => (a.min_amount || 0) - (b.min_amount || 0));

  if (taxBands.length === 0) return 0;

  let totalTax = 0;
  let remainingIncome = cumulativeIncome;

  for (const band of taxBands) {
    const bandMin = band.min_amount || 0;
    const bandMax = band.max_amount || Infinity;
    const rate = band.employee_rate || 0;

    const incomeInBand = Math.min(
      Math.max(remainingIncome - bandMin, 0),
      bandMax - bandMin
    );

    if (incomeInBand > 0) {
      totalTax += incomeInBand * rate;
    }

    if (remainingIncome <= bandMax) break;
  }

  return totalTax;
}

/**
 * Calculate statutory deductions with full cumulative/YTD awareness
 * Respects annual caps, progressive tax brackets, and tax reliefs
 */
export function calculateCumulativeStatutoryDeductions(
  grossPay: number,
  statutoryTypes: StatutoryDeduction[],
  rateBands: ExtendedStatutoryRateBand[],
  context: CumulativeCalculationContext,
  mondayCount: number = 4,
  employeeAge: number | null = null
): ExtendedStatutoryCalculationResult {
  const deductions: CalculatedStatutory[] = [];
  let totalEmployeeDeductions = 0;
  let totalEmployerContributions = 0;

  const { 
    openingBalances, 
    ytdStatutoryAmounts, 
    periodStatutoryAmounts, 
    isOffCycle,
    taxCalculationMethod = 'cumulative',
    allowMidYearRefunds = true,
    taxReliefContext
  } = context;

  // Step 1: Calculate non-income-tax statutory deductions first
  // We need these to calculate tax relief from statutory contributions
  const nonTaxDeductions: Array<{ code: string; employeeAmount: number; employerAmount: number }> = [];

  for (const statType of statutoryTypes) {
    if (statType.statutory_type === 'income_tax') continue; // Skip income tax for now

    const applicableBand = rateBands.find(band => 
      band.statutory_type_id === statType.id &&
      (band.min_amount === null || grossPay >= band.min_amount) &&
      (band.max_amount === null || grossPay <= band.max_amount) &&
      band.is_active
    ) as ExtendedStatutoryRateBand | undefined;

    if (!applicableBand) continue;

    if (employeeAge !== null) {
      if (applicableBand.min_age !== null && employeeAge < applicableBand.min_age) continue;
      if (applicableBand.max_age !== null && employeeAge > applicableBand.max_age) continue;
    }

    const statCode = statType.statutory_code;
    const ytdAmounts = ytdStatutoryAmounts[statCode] || { ytdEmployeeAmount: 0, ytdEmployerAmount: 0 };
    const periodAmounts = periodStatutoryAmounts[statCode] || { periodEmployeeAmount: 0, periodEmployerAmount: 0 };

    let employeeAmount = 0;
    let employerAmount = 0;
    const calcMethod = applicableBand.calculation_method || 'percentage';

    switch (calcMethod) {
      case 'percentage':
        employeeAmount = grossPay * (applicableBand.employee_rate || 0);
        employerAmount = grossPay * (applicableBand.employer_rate || 0);
        break;
      case 'per_monday':
        employeeAmount = mondayCount * (applicableBand.per_monday_amount || 0);
        employerAmount = mondayCount * (applicableBand.employer_per_monday_amount || 0);
        break;
      case 'fixed':
        employeeAmount = applicableBand.fixed_amount || 0;
        employerAmount = applicableBand.employer_fixed_amount || 0;
        break;
    }

    // Apply annual caps
    const annualMaxEmployee = applicableBand.annual_max_employee;
    const annualMaxEmployer = applicableBand.annual_max_employer;

    if (annualMaxEmployee !== null && annualMaxEmployee > 0) {
      const ytdEmployeePaid = ytdAmounts.ytdEmployeeAmount + periodAmounts.periodEmployeeAmount;
      const remainingCap = Math.max(0, annualMaxEmployee - ytdEmployeePaid);
      employeeAmount = Math.min(employeeAmount, remainingCap);
    }

    if (annualMaxEmployer !== null && annualMaxEmployer > 0) {
      const ytdEmployerPaid = ytdAmounts.ytdEmployerAmount + periodAmounts.periodEmployerAmount;
      const remainingCap = Math.max(0, annualMaxEmployer - ytdEmployerPaid);
      employerAmount = Math.min(employerAmount, remainingCap);
    }

    if (employeeAmount > 0 || employerAmount > 0) {
      deductions.push({
        code: statCode,
        name: statType.statutory_name,
        type: statType.statutory_type,
        employeeAmount: Math.round(employeeAmount * 100) / 100,
        employerAmount: Math.round(employerAmount * 100) / 100,
        calculationMethod: calcMethod,
      });
      nonTaxDeductions.push({ code: statCode, employeeAmount, employerAmount });
      totalEmployeeDeductions += employeeAmount;
      totalEmployerContributions += employerAmount;
    }
  }

  // Step 2: Calculate tax reliefs if context is provided
  let taxReliefs: CalculatedRelief[] = [];
  let totalTaxableIncomeReduction = 0;
  let totalTaxCredits = 0;

  if (taxReliefContext) {
    const { statutoryReliefRules, taxReliefSchemes, employeeEnrollments, ytdReliefsClaimed = {} } = taxReliefContext;

    // Calculate statutory tax relief (NIS, SSNIT contributions that reduce taxable income)
    const statutoryReliefs = calculateStatutoryTaxRelief(
      nonTaxDeductions,
      statutoryReliefRules,
      ytdReliefsClaimed
    );

    // Calculate scheme reliefs (personal allowances, savings deductions, etc.)
    const schemeReliefs = calculateSchemeReliefs(
      grossPay,
      employeeAge,
      employeeEnrollments,
      taxReliefSchemes,
      ytdReliefsClaimed
    );

    taxReliefs = [...statutoryReliefs, ...schemeReliefs];

    // Sum up reliefs
    totalTaxableIncomeReduction = taxReliefs
      .filter(r => r.reduces_taxable_income)
      .reduce((sum, r) => sum + r.amount, 0);

    totalTaxCredits = taxReliefs
      .filter(r => r.is_tax_credit)
      .reduce((sum, r) => sum + r.amount, 0);
  }

  // Step 3: Calculate adjusted taxable income
  const adjustedTaxableIncome = Math.max(0, grossPay - totalTaxableIncomeReduction);

  // Step 4: Calculate income tax on adjusted taxable income
  const incomeStatType = statutoryTypes.find(s => s.statutory_type === 'income_tax');

  if (incomeStatType) {
    const applicableBand = rateBands.find(band => 
      band.statutory_type_id === incomeStatType.id && band.is_active
    );

    if (applicableBand) {
      const statCode = incomeStatType.statutory_code;
      const ytdAmounts = ytdStatutoryAmounts[statCode] || { ytdEmployeeAmount: 0, ytdEmployerAmount: 0 };
      const periodAmounts = periodStatutoryAmounts[statCode] || { periodEmployeeAmount: 0, periodEmployerAmount: 0 };

      let employeeAmount = 0;
      let ytdTaxableIncome: number | undefined;
      let ytdTaxPaid: number | undefined;
      let isRefund = false;

      if (taxCalculationMethod === 'non_cumulative') {
        // Non-cumulative: Calculate tax only on current period adjusted earnings
        const periodTax = calculateCumulativeTax(adjustedTaxableIncome, rateBands, incomeStatType.id);
        employeeAmount = Math.max(0, periodTax - totalTaxCredits);
        
        const openingYtdIncome = openingBalances?.ytdTaxableIncome || 0;
        ytdTaxableIncome = openingYtdIncome + ytdAmounts.ytdEmployeeAmount + adjustedTaxableIncome;
        ytdTaxPaid = (openingBalances?.ytdTaxPaid || 0) + ytdAmounts.ytdEmployeeAmount + employeeAmount;
      } else {
        // Cumulative: Calculate tax on YTD adjusted basis with potential refunds
        const openingYtdIncome = openingBalances?.ytdTaxableIncome || 0;
        const openingYtdTax = openingBalances?.ytdTaxPaid || 0;
        
        // Total YTD adjusted income before this pay period
        const previousYtdIncome = openingYtdIncome + ytdAmounts.ytdEmployeeAmount;
        const previousYtdTax = openingYtdTax + ytdAmounts.ytdEmployeeAmount;
        
        const periodBaseTax = isOffCycle ? periodAmounts.periodEmployeeAmount : 0;
        
        // New cumulative YTD income using ADJUSTED taxable income
        const newYtdIncome = previousYtdIncome + adjustedTaxableIncome;
        
        // Calculate total tax due on cumulative adjusted income
        const totalTaxDue = calculateCumulativeTax(newYtdIncome, rateBands, incomeStatType.id);
        
        // This period's tax = total due - already paid YTD - already paid this period - tax credits
        let rawTaxAmount = totalTaxDue - previousYtdTax - periodBaseTax - totalTaxCredits;
        
        if (rawTaxAmount < 0) {
          if (allowMidYearRefunds) {
            employeeAmount = rawTaxAmount;
            isRefund = true;
          } else {
            employeeAmount = 0;
          }
        } else {
          employeeAmount = rawTaxAmount;
        }
        
        ytdTaxableIncome = newYtdIncome;
        ytdTaxPaid = previousYtdTax + periodBaseTax + Math.max(0, employeeAmount);
      }

      if (employeeAmount !== 0) {
        deductions.push({
          code: statCode,
          name: incomeStatType.statutory_name,
          type: incomeStatType.statutory_type,
          employeeAmount: Math.round(employeeAmount * 100) / 100,
          employerAmount: 0,
          calculationMethod: 'cumulative',
          ytdTaxableIncome,
          ytdTaxPaid,
          taxReliefAmount: totalTaxableIncomeReduction > 0 ? totalTaxableIncomeReduction : undefined,
        });
        totalEmployeeDeductions += employeeAmount;
      }
    }
  }

  return {
    deductions,
    totalEmployeeDeductions: Math.round(totalEmployeeDeductions * 100) / 100,
    totalEmployerContributions: Math.round(totalEmployerContributions * 100) / 100,
    taxReliefs: taxReliefs.length > 0 ? taxReliefs : undefined,
    totalTaxableIncomeReduction: totalTaxableIncomeReduction > 0 ? totalTaxableIncomeReduction : undefined,
    totalTaxCredits: totalTaxCredits > 0 ? totalTaxCredits : undefined,
    adjustedTaxableIncome,
  };
}

/**
 * Fetch extended rate bands with annual caps
 * Filters by country and effective date
 */
export async function fetchExtendedRateBands(
  supabaseClient: any,
  countryCode?: string,
  effectiveDate?: string
): Promise<ExtendedStatutoryRateBand[]> {
  const today = effectiveDate || new Date().toISOString().split('T')[0];
  
  // First get statutory type IDs for this country if specified
  let statutoryTypeIds: string[] = [];
  if (countryCode) {
    const { data: types } = await supabaseClient
      .from('statutory_deduction_types')
      .select('id')
      .eq('country', countryCode)
      .lte('start_date', today)
      .or(`end_date.is.null,end_date.gte.${today}`);
    
    statutoryTypeIds = (types || []).map((t: any) => t.id);
    if (statutoryTypeIds.length === 0) {
      return [];
    }
  }

  let query = supabaseClient
    .from('statutory_rate_bands')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', today)
    .or(`end_date.is.null,end_date.gte.${today}`);

  if (countryCode && statutoryTypeIds.length > 0) {
    query = query.in('statutory_type_id', statutoryTypeIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching extended rate bands:', error);
    return [];
  }

  return (data || []) as ExtendedStatutoryRateBand[];
}
