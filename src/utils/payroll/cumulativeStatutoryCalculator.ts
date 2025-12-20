import { 
  StatutoryDeduction, 
  StatutoryRateBand, 
  OpeningBalances,
  CalculatedStatutory,
  StatutoryCalculationResult 
} from "@/utils/statutoryDeductionCalculator";
import { YtdStatutoryAmounts, PeriodStatutoryAmounts } from "./ytdStatutoryService";

export type TaxCalculationMethod = 'cumulative' | 'non_cumulative';

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
}

export interface ExtendedStatutoryRateBand extends StatutoryRateBand {
  annual_max_employee: number | null;
  annual_max_employer: number | null;
  employer_fixed_amount: number | null;
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
 * Respects annual caps and progressive tax brackets
 */
export function calculateCumulativeStatutoryDeductions(
  grossPay: number,
  statutoryTypes: StatutoryDeduction[],
  rateBands: ExtendedStatutoryRateBand[],
  context: CumulativeCalculationContext,
  mondayCount: number = 4,
  employeeAge: number | null = null
): StatutoryCalculationResult {
  const deductions: CalculatedStatutory[] = [];
  let totalEmployeeDeductions = 0;
  let totalEmployerContributions = 0;

  const { 
    openingBalances, 
    ytdStatutoryAmounts, 
    periodStatutoryAmounts, 
    isOffCycle,
    taxCalculationMethod = 'cumulative',
    allowMidYearRefunds = true
  } = context;

  for (const statType of statutoryTypes) {
    // Find applicable rate band for this statutory type
    const applicableBand = rateBands.find(band => 
      band.statutory_type_id === statType.id &&
      (band.min_amount === null || grossPay >= band.min_amount) &&
      (band.max_amount === null || grossPay <= band.max_amount) &&
      band.is_active
    ) as ExtendedStatutoryRateBand | undefined;

    if (!applicableBand) continue;

    // Check age restrictions
    if (employeeAge !== null) {
      if (applicableBand.min_age !== null && employeeAge < applicableBand.min_age) continue;
      if (applicableBand.max_age !== null && employeeAge > applicableBand.max_age) continue;
    }

    const statCode = statType.statutory_code;
    const ytdAmounts = ytdStatutoryAmounts[statCode] || { ytdEmployeeAmount: 0, ytdEmployerAmount: 0 };
    const periodAmounts = periodStatutoryAmounts[statCode] || { periodEmployeeAmount: 0, periodEmployerAmount: 0 };

    let employeeAmount = 0;
    let employerAmount = 0;
    let ytdTaxableIncome: number | undefined;
    let ytdTaxPaid: number | undefined;
    let isRefund = false;
    const calcMethod = applicableBand.calculation_method || 'percentage';

    // Handle income tax based on country's calculation method
    if (statType.statutory_type === 'income_tax') {
      if (taxCalculationMethod === 'non_cumulative') {
        // Non-cumulative: Calculate tax only on current period earnings
        // No YTD considerations, no mid-year refunds
        const periodTax = calculateCumulativeTax(grossPay, rateBands, statType.id);
        employeeAmount = periodTax;
        employerAmount = 0;
        
        // Still track YTD for reporting purposes, but don't use it in calculation
        const openingYtdIncome = openingBalances?.ytdTaxableIncome || 0;
        ytdTaxableIncome = openingYtdIncome + (ytdAmounts.ytdEmployeeAmount || 0) + grossPay;
        ytdTaxPaid = (openingBalances?.ytdTaxPaid || 0) + (ytdAmounts.ytdEmployeeAmount || 0) + employeeAmount;
      } else {
        // Cumulative: Calculate tax on YTD basis with potential refunds
        const openingYtdIncome = openingBalances?.ytdTaxableIncome || 0;
        const openingYtdTax = openingBalances?.ytdTaxPaid || 0;
        
        // Total YTD income before this pay period
        const previousYtdIncome = openingYtdIncome + ytdAmounts.ytdEmployeeAmount;
        const previousYtdTax = openingYtdTax + ytdAmounts.ytdEmployeeAmount;
        
        // If off-cycle, add what was already calculated this period to the base
        const periodBaseTax = isOffCycle ? periodAmounts.periodEmployeeAmount : 0;
        
        // New cumulative YTD income including this period
        const newYtdIncome = previousYtdIncome + grossPay;
        
        // Calculate total tax due on cumulative income
        const totalTaxDue = calculateCumulativeTax(newYtdIncome, rateBands, statType.id);
        
        // This period's tax = total due - already paid YTD - already paid this period
        const rawTaxAmount = totalTaxDue - previousYtdTax - periodBaseTax;
        
        // Handle potential refunds based on country settings
        if (rawTaxAmount < 0) {
          if (allowMidYearRefunds) {
            // Negative tax = refund to employee (reduce deduction)
            employeeAmount = rawTaxAmount; // Will be negative
            isRefund = true;
          } else {
            // No mid-year refunds - set to zero, will reconcile at year end
            employeeAmount = 0;
          }
        } else {
          employeeAmount = rawTaxAmount;
        }
        employerAmount = 0;
        
        ytdTaxableIncome = newYtdIncome;
        ytdTaxPaid = previousYtdTax + periodBaseTax + Math.max(0, employeeAmount);
      }
    } else {
      // For other statutories, calculate base amount first
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

      // Apply annual caps if defined
      const annualMaxEmployee = applicableBand.annual_max_employee;
      const annualMaxEmployer = applicableBand.annual_max_employer;

      if (annualMaxEmployee !== null && annualMaxEmployee > 0) {
        // YTD employee amount already paid (opening + calculated this year + this period)
        const ytdEmployeePaid = ytdAmounts.ytdEmployeeAmount + periodAmounts.periodEmployeeAmount;
        const remainingCap = Math.max(0, annualMaxEmployee - ytdEmployeePaid);
        
        if (remainingCap === 0) {
          // Already at cap, no more deductions
          employeeAmount = 0;
        } else if (employeeAmount > remainingCap) {
          // Would exceed cap, limit to remaining
          employeeAmount = remainingCap;
        }
      }

      if (annualMaxEmployer !== null && annualMaxEmployer > 0) {
        const ytdEmployerPaid = ytdAmounts.ytdEmployerAmount + periodAmounts.periodEmployerAmount;
        const remainingCap = Math.max(0, annualMaxEmployer - ytdEmployerPaid);
        
        if (remainingCap === 0) {
          employerAmount = 0;
        } else if (employerAmount > remainingCap) {
          employerAmount = remainingCap;
        }
      }
    }

    if (employeeAmount > 0 || employerAmount > 0) {
      deductions.push({
        code: statCode,
        name: statType.statutory_name,
        type: statType.statutory_type,
        employeeAmount: Math.round(employeeAmount * 100) / 100,
        employerAmount: Math.round(employerAmount * 100) / 100,
        calculationMethod: calcMethod,
        ytdTaxableIncome,
        ytdTaxPaid,
      });
      totalEmployeeDeductions += employeeAmount;
      totalEmployerContributions += employerAmount;
    }
  }

  return {
    deductions,
    totalEmployeeDeductions: Math.round(totalEmployeeDeductions * 100) / 100,
    totalEmployerContributions: Math.round(totalEmployerContributions * 100) / 100,
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
