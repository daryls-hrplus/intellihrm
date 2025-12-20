import { supabase } from "@/integrations/supabase/client";
import { getTodayString } from "@/utils/dateUtils";
import { 
  fetchStatutoryTaxReliefRules, 
  calculateStatutoryTaxRelief,
  fetchTaxReliefSchemes,
  fetchEmployeeReliefEnrollments,
  calculateSchemeReliefs,
  type TaxReliefRule,
  type TaxReliefScheme,
  type CalculatedRelief
} from "@/utils/payroll/taxReliefCalculator";

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
  employer_fixed_amount: number | null;
  per_monday_amount: number | null;
  employer_per_monday_amount: number | null;
  min_age: number | null;
  max_age: number | null;
  start_date: string | null;
  end_date: string | null;
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
  taxReliefAmount?: number; // NEW: Amount that reduces taxable income
}

export interface StatutoryCalculationResult {
  deductions: CalculatedStatutory[];
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
  taxReliefs?: CalculatedRelief[]; // NEW: Tax relief details
  adjustedTaxableIncome?: number; // NEW: Gross pay minus tax reliefs
  taxCredits?: number; // NEW: Direct tax credits
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

export async function fetchStatutoryDeductionsForCountry(countryCode: string, effectiveDate?: string): Promise<{
  types: StatutoryDeduction[];
  bands: StatutoryRateBand[];
}> {
  const today = effectiveDate || getTodayString();
  
  // Fetch statutory types for the country that are active on the effective date
  const { data: types } = await supabase
    .from('statutory_deduction_types')
    .select('*')
    .eq('country', countryCode)
    .lte('start_date', today)
    .or(`end_date.is.null,end_date.gte.${today}`);

  if (!types || types.length === 0) {
    return { types: [], bands: [] };
  }

  // Get the statutory type IDs to filter rate bands
  const statutoryTypeIds = types.map(t => t.id);

  // Fetch rate bands for these statutory types that are active on the effective date
  const { data: bands } = await supabase
    .from('statutory_rate_bands')
    .select('*')
    .eq('is_active', true)
    .in('statutory_type_id', statutoryTypeIds)
    .lte('start_date', today)
    .or(`end_date.is.null,end_date.gte.${today}`);

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
    const rate = (band.employee_rate || 0);

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

/**
 * Enhanced statutory calculation with integrated tax relief
 * This calculates:
 * 1. Non-income-tax statutory deductions first (NIS, NHT, SSNIT, etc.)
 * 2. Tax reliefs from those statutory contributions
 * 3. Other tax relief schemes (personal reliefs, savings, etc.)
 * 4. Adjusted taxable income after all reliefs
 * 5. Income tax on the adjusted taxable income
 */
export async function calculateStatutoryWithTaxRelief(
  employeeId: string,
  countryCode: string,
  grossPay: number,
  statutoryTypes: StatutoryDeduction[],
  rateBands: StatutoryRateBand[],
  mondayCount: number = 4,
  employeeAge: number | null = null,
  openingBalances: OpeningBalances | null = null,
  effectiveDate?: string
): Promise<StatutoryCalculationResult> {
  const deductions: CalculatedStatutory[] = [];
  let totalEmployeeDeductions = 0;
  let totalEmployerContributions = 0;

  // Step 1: Calculate non-income-tax statutory deductions first
  const nonTaxDeductions: Array<{ code: string; employeeAmount: number; employerAmount: number }> = [];
  
  for (const statType of statutoryTypes) {
    if (statType.statutory_type === 'income_tax') continue; // Skip income tax for now

    const applicableBand = rateBands.find(band => 
      band.statutory_type_id === statType.id &&
      (band.min_amount === null || grossPay >= band.min_amount) &&
      (band.max_amount === null || grossPay <= band.max_amount) &&
      band.is_active
    );

    if (!applicableBand) continue;

    if (employeeAge !== null) {
      if (applicableBand.min_age !== null && employeeAge < applicableBand.min_age) continue;
      if (applicableBand.max_age !== null && employeeAge > applicableBand.max_age) continue;
    }

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

    if (employeeAmount > 0 || employerAmount > 0) {
      deductions.push({
        code: statType.statutory_code,
        name: statType.statutory_name,
        type: statType.statutory_type,
        employeeAmount,
        employerAmount,
        calculationMethod: calcMethod,
      });
      nonTaxDeductions.push({
        code: statType.statutory_code,
        employeeAmount,
        employerAmount,
      });
      totalEmployeeDeductions += employeeAmount;
      totalEmployerContributions += employerAmount;
    }
  }

  // Step 2: Fetch and calculate tax reliefs
  const [reliefRules, schemes, enrollments] = await Promise.all([
    fetchStatutoryTaxReliefRules(countryCode, effectiveDate),
    fetchTaxReliefSchemes(countryCode, effectiveDate),
    fetchEmployeeReliefEnrollments(employeeId, effectiveDate),
  ]);

  // Calculate statutory tax relief (from NIS, SSNIT contributions)
  const statutoryReliefs = calculateStatutoryTaxRelief(nonTaxDeductions, reliefRules);

  // Calculate scheme reliefs (personal allowances, savings, etc.)
  const schemeReliefs = calculateSchemeReliefs(grossPay, employeeAge, enrollments, schemes);

  const allReliefs = [...statutoryReliefs, ...schemeReliefs];

  // Calculate total taxable income reduction
  const totalTaxableIncomeReduction = allReliefs
    .filter(r => r.reduces_taxable_income)
    .reduce((sum, r) => sum + r.amount, 0);

  // Calculate tax credits (applied after tax is calculated)
  const taxCredits = allReliefs
    .filter(r => r.is_tax_credit)
    .reduce((sum, r) => sum + r.amount, 0);

  // Step 3: Calculate adjusted taxable income
  const adjustedTaxableIncome = Math.max(0, grossPay - totalTaxableIncomeReduction);

  // Step 4: Calculate income tax on adjusted taxable income
  const incomeStatType = statutoryTypes.find(s => s.statutory_type === 'income_tax');
  
  if (incomeStatType && openingBalances) {
    const previousYtdIncome = openingBalances.ytdTaxableIncome;
    const previousYtdTax = openingBalances.ytdTaxPaid;
    
    // Use adjusted taxable income instead of gross pay
    const newYtdIncome = previousYtdIncome + adjustedTaxableIncome;
    
    // Calculate total tax due on cumulative adjusted income
    const totalTaxDue = calculateCumulativeTax(newYtdIncome, rateBands, incomeStatType.id);
    
    // This period's tax = total due - already paid - any tax credits
    let periodTax = Math.max(0, totalTaxDue - previousYtdTax);
    
    // Apply tax credits (reduce tax directly)
    periodTax = Math.max(0, periodTax - taxCredits);

    if (periodTax > 0) {
      deductions.push({
        code: incomeStatType.statutory_code,
        name: incomeStatType.statutory_name,
        type: incomeStatType.statutory_type,
        employeeAmount: periodTax,
        employerAmount: 0,
        calculationMethod: 'cumulative',
        ytdTaxableIncome: newYtdIncome,
        ytdTaxPaid: previousYtdTax + periodTax,
        taxReliefAmount: totalTaxableIncomeReduction,
      });
      totalEmployeeDeductions += periodTax;
    }
  }

  return {
    deductions,
    totalEmployeeDeductions,
    totalEmployerContributions,
    taxReliefs: allReliefs,
    adjustedTaxableIncome,
    taxCredits,
  };
}
