import { supabase } from "@/integrations/supabase/client";
import { getTodayString } from "@/utils/dateUtils";

export interface StatutoryDeduction {
  id: string;
  statutory_code: string;
  statutory_name: string;
  statutory_type: string;
  country: string;
}

export interface StatutoryRateBand {
  id: string;
  statutory_type_id: string;
  band_name: string;
  min_amount: number | null;
  max_amount: number | null;
  calculation_method: string | null;
  employee_rate: number | null;
  employer_rate: number | null;
  fixed_amount: number | null;
  per_monday_amount: number | null;
  employer_per_monday_amount: number | null;
  min_age: number | null;
  max_age: number | null;
  is_active: boolean;
}

export interface OpeningBalances {
  ytdTaxableIncome: number;
  ytdTaxPaid: number;
}

export interface CalculatedStatutory {
  code: string;
  name: string;
  type: string;
  employeeAmount: number;
  employerAmount: number;
  calculationMethod: string;
  ytdTaxableIncome?: number;
  ytdTaxPaid?: number;
}

export interface StatutoryCalculationResult {
  deductions: CalculatedStatutory[];
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
}

export async function fetchOpeningBalances(
  employeeId: string,
  taxYear: number
): Promise<OpeningBalances> {
  const { data } = await supabase
    .from('employee_opening_balances')
    .select('ytd_taxable_income, ytd_income_tax')
    .eq('employee_id', employeeId)
    .eq('tax_year', taxYear)
    .maybeSingle();

  return {
    ytdTaxableIncome: data?.ytd_taxable_income || 0,
    ytdTaxPaid: data?.ytd_income_tax || 0,
  };
}

export async function fetchStatutoryDeductionsForCountry(countryCode: string): Promise<{
  types: StatutoryDeduction[];
  bands: StatutoryRateBand[];
}> {
  const today = getTodayString();
  const { data: types } = await supabase
    .from('statutory_deduction_types')
    .select('*')
    .eq('country', countryCode)
    .lte('start_date', today)
    .or(`end_date.is.null,end_date.gte.${today}`);

  const { data: bands } = await supabase
    .from('statutory_rate_bands')
    .select('*')
    .eq('is_active', true);

  return {
    types: (types || []) as StatutoryDeduction[],
    bands: (bands || []) as StatutoryRateBand[],
  };
}

// Calculate cumulative PAYE tax using progressive bands
function calculateCumulativeTax(
  cumulativeIncome: number,
  rateBands: StatutoryRateBand[],
  statutoryTypeId: string
): number {
  // Get all bands for this statutory type, sorted by min_amount
  const taxBands = rateBands
    .filter(b => b.statutory_type_id === statutoryTypeId && b.is_active)
    .sort((a, b) => (a.min_amount || 0) - (b.min_amount || 0));

  if (taxBands.length === 0) return 0;

  let totalTax = 0;
  let remainingIncome = cumulativeIncome;

  for (const band of taxBands) {
    const bandMin = band.min_amount || 0;
    const bandMax = band.max_amount || Infinity;
    const rate = (band.employee_rate || 0) / 100;

    // Calculate income in this band
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

export function calculateStatutoryDeductions(
  grossPay: number,
  statutoryTypes: StatutoryDeduction[],
  rateBands: StatutoryRateBand[],
  mondayCount: number = 4,
  employeeAge: number | null = null,
  openingBalances: OpeningBalances | null = null
): StatutoryCalculationResult {
  const deductions: CalculatedStatutory[] = [];
  let totalEmployeeDeductions = 0;
  let totalEmployerContributions = 0;

  for (const statType of statutoryTypes) {
    // Find applicable rate band for this statutory type
    const applicableBand = rateBands.find(band => 
      band.statutory_type_id === statType.id &&
      (band.min_amount === null || grossPay >= band.min_amount) &&
      (band.max_amount === null || grossPay <= band.max_amount) &&
      band.is_active
    );

    if (!applicableBand) continue;

    // Check age restrictions
    if (employeeAge !== null) {
      if (applicableBand.min_age !== null && employeeAge < applicableBand.min_age) continue;
      if (applicableBand.max_age !== null && employeeAge > applicableBand.max_age) continue;
    }

    let employeeAmount = 0;
    let employerAmount = 0;
    let ytdTaxableIncome: number | undefined;
    let ytdTaxPaid: number | undefined;
    const calcMethod = applicableBand.calculation_method || 'percentage';

    // Use cumulative calculation for income tax (PAYE)
    if (statType.statutory_type === 'income_tax' && openingBalances) {
      const previousYtdIncome = openingBalances.ytdTaxableIncome;
      const previousYtdTax = openingBalances.ytdTaxPaid;
      
      // New cumulative YTD income including this period
      const newYtdIncome = previousYtdIncome + grossPay;
      
      // Calculate total tax due on cumulative income
      const totalTaxDue = calculateCumulativeTax(newYtdIncome, rateBands, statType.id);
      
      // This period's tax = total due - already paid
      employeeAmount = Math.max(0, totalTaxDue - previousYtdTax);
      employerAmount = 0;
      
      ytdTaxableIncome = newYtdIncome;
      ytdTaxPaid = previousYtdTax + employeeAmount;
    } else {
      switch (calcMethod) {
        case 'percentage':
          employeeAmount = grossPay * (applicableBand.employee_rate || 0) / 100;
          employerAmount = grossPay * (applicableBand.employer_rate || 0) / 100;
          break;
        case 'per_monday':
          employeeAmount = mondayCount * (applicableBand.per_monday_amount || 0);
          employerAmount = mondayCount * (applicableBand.employer_per_monday_amount || 0);
          break;
        case 'fixed':
          employeeAmount = applicableBand.fixed_amount || 0;
          employerAmount = 0;
          break;
      }
    }

    if (employeeAmount > 0 || employerAmount > 0) {
      deductions.push({
        code: statType.statutory_code,
        name: statType.statutory_name,
        type: statType.statutory_type,
        employeeAmount,
        employerAmount,
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
    totalEmployeeDeductions,
    totalEmployerContributions,
  };
}
