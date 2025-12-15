import { supabase } from "@/integrations/supabase/client";

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

export interface CalculatedStatutory {
  code: string;
  name: string;
  type: string;
  employeeAmount: number;
  employerAmount: number;
  calculationMethod: string;
}

export interface StatutoryCalculationResult {
  deductions: CalculatedStatutory[];
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
}

export async function fetchStatutoryDeductionsForCountry(countryCode: string): Promise<{
  types: StatutoryDeduction[];
  bands: StatutoryRateBand[];
}> {
  const { data: types } = await supabase
    .from('statutory_deduction_types')
    .select('*')
    .eq('country', countryCode)
    .lte('start_date', new Date().toISOString().split('T')[0])
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString().split('T')[0]}`);

  const { data: bands } = await supabase
    .from('statutory_rate_bands')
    .select('*')
    .eq('is_active', true);

  return {
    types: (types || []) as StatutoryDeduction[],
    bands: (bands || []) as StatutoryRateBand[],
  };
}

export function calculateStatutoryDeductions(
  grossPay: number,
  statutoryTypes: StatutoryDeduction[],
  rateBands: StatutoryRateBand[],
  mondayCount: number = 4,
  employeeAge: number | null = null
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
    const calcMethod = applicableBand.calculation_method || 'percentage';

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

    if (employeeAmount > 0 || employerAmount > 0) {
      deductions.push({
        code: statType.statutory_code,
        name: statType.statutory_name,
        type: statType.statutory_type,
        employeeAmount,
        employerAmount,
        calculationMethod: calcMethod,
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
