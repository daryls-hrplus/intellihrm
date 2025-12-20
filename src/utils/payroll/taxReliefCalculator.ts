import { supabase } from "@/integrations/supabase/client";

export interface TaxReliefRule {
  id: string;
  country: string;
  statutory_type_code: string;
  statutory_type_name: string;
  relief_percentage: number;
  annual_cap: number | null;
  monthly_cap: number | null;
  applies_to_employee_contribution: boolean;
  applies_to_employer_contribution: boolean;
  is_active: boolean;
}

export interface TaxReliefScheme {
  id: string;
  country: string;
  scheme_code: string;
  scheme_name: string;
  scheme_category: string;
  relief_type: 'deduction' | 'credit' | 'exemption' | 'reduced_rate';
  calculation_method: 'fixed_amount' | 'percentage_of_income' | 'percentage_of_contribution' | 'tiered';
  relief_value: number | null;
  relief_percentage: number | null;
  annual_cap: number | null;
  monthly_cap: number | null;
  min_age: number | null;
  max_age: number | null;
  is_active: boolean;
}

export interface EmployeeReliefEnrollment {
  id: string;
  scheme_id: string;
  scheme: TaxReliefScheme;
  contribution_amount: number | null;
  contribution_percentage: number | null;
  annual_claimed_amount: number;
  status: string;
}

export interface CalculatedRelief {
  scheme_code: string;
  scheme_name: string;
  category: string;
  relief_type: string;
  amount: number;
  reduces_taxable_income: boolean;
  is_tax_credit: boolean;
}

export interface TaxReliefCalculationResult {
  statutoryReliefs: CalculatedRelief[];
  schemeReliefs: CalculatedRelief[];
  totalTaxableIncomeReduction: number;
  totalTaxCredits: number;
  adjustedTaxableIncome: number;
}

/**
 * Fetch statutory tax relief rules for a country
 * These define which statutory deductions (NIS, SSNIT, etc.) reduce taxable income
 */
export async function fetchStatutoryTaxReliefRules(
  countryCode: string,
  effectiveDate?: string
): Promise<TaxReliefRule[]> {
  const today = effectiveDate || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('statutory_tax_relief_rules')
    .select('*')
    .eq('country', countryCode)
    .eq('is_active', true)
    .lte('effective_from', today)
    .or(`effective_to.is.null,effective_to.gte.${today}`);

  if (error) {
    console.error('Error fetching statutory tax relief rules:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch tax relief schemes for a country
 * These include personal reliefs, savings deductions, housing/education, youth schemes
 */
export async function fetchTaxReliefSchemes(
  countryCode: string,
  effectiveDate?: string
): Promise<TaxReliefScheme[]> {
  const today = effectiveDate || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('tax_relief_schemes')
    .select('*')
    .eq('country', countryCode)
    .eq('is_active', true)
    .lte('effective_from', today)
    .or(`effective_to.is.null,effective_to.gte.${today}`);

  if (error) {
    console.error('Error fetching tax relief schemes:', error);
    return [];
  }

  return (data || []) as TaxReliefScheme[];
}

/**
 * Fetch employee's enrolled tax relief schemes
 */
export async function fetchEmployeeReliefEnrollments(
  employeeId: string,
  effectiveDate?: string
): Promise<EmployeeReliefEnrollment[]> {
  const today = effectiveDate || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('employee_tax_relief_enrollments')
    .select(`
      *,
      scheme:tax_relief_schemes(*)
    `)
    .eq('employee_id', employeeId)
    .eq('status', 'active')
    .lte('effective_from', today)
    .or(`effective_to.is.null,effective_to.gte.${today}`);

  if (error) {
    console.error('Error fetching employee relief enrollments:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    scheme_id: row.scheme_id,
    scheme: row.scheme as TaxReliefScheme,
    contribution_amount: row.contribution_amount,
    contribution_percentage: row.contribution_percentage,
    annual_claimed_amount: row.annual_claimed_amount || 0,
    status: row.status,
  }));
}

/**
 * Calculate statutory tax relief from social security contributions
 * Returns the amount to deduct from taxable income
 */
export function calculateStatutoryTaxRelief(
  statutoryDeductions: Array<{ code: string; employeeAmount: number; employerAmount: number }>,
  reliefRules: TaxReliefRule[],
  ytdStatutoryReliefClaimed: Record<string, number> = {}
): CalculatedRelief[] {
  const reliefs: CalculatedRelief[] = [];

  for (const deduction of statutoryDeductions) {
    const rule = reliefRules.find(r => 
      r.statutory_type_code.toLowerCase() === deduction.code.toLowerCase()
    );

    if (!rule) continue;

    let reliefAmount = 0;

    // Calculate relief on employee contribution
    if (rule.applies_to_employee_contribution && deduction.employeeAmount > 0) {
      reliefAmount += deduction.employeeAmount * (rule.relief_percentage / 100);
    }

    // Calculate relief on employer contribution (rare, but some countries allow)
    if (rule.applies_to_employer_contribution && deduction.employerAmount > 0) {
      reliefAmount += deduction.employerAmount * (rule.relief_percentage / 100);
    }

    // Apply monthly cap if specified
    if (rule.monthly_cap !== null && reliefAmount > rule.monthly_cap) {
      reliefAmount = rule.monthly_cap;
    }

    // Apply annual cap if specified (check YTD)
    if (rule.annual_cap !== null) {
      const ytdClaimed = ytdStatutoryReliefClaimed[deduction.code] || 0;
      const remainingCap = Math.max(0, rule.annual_cap - ytdClaimed);
      reliefAmount = Math.min(reliefAmount, remainingCap);
    }

    if (reliefAmount > 0) {
      reliefs.push({
        scheme_code: deduction.code,
        scheme_name: rule.statutory_type_name,
        category: 'statutory_contribution',
        relief_type: 'deduction',
        amount: reliefAmount,
        reduces_taxable_income: true,
        is_tax_credit: false,
      });
    }
  }

  return reliefs;
}

/**
 * Calculate tax relief from enrolled schemes (personal reliefs, savings, etc.)
 */
export function calculateSchemeReliefs(
  grossPay: number,
  employeeAge: number | null,
  enrollments: EmployeeReliefEnrollment[],
  schemes: TaxReliefScheme[],
  ytdSchemeReliefClaimed: Record<string, number> = {}
): CalculatedRelief[] {
  const reliefs: CalculatedRelief[] = [];

  // Process enrolled schemes
  for (const enrollment of enrollments) {
    const scheme = enrollment.scheme;
    if (!scheme || !scheme.is_active) continue;

    // Check age eligibility
    if (employeeAge !== null) {
      if (scheme.min_age !== null && employeeAge < scheme.min_age) continue;
      if (scheme.max_age !== null && employeeAge > scheme.max_age) continue;
    }

    let reliefAmount = calculateSchemeAmount(scheme, grossPay, enrollment);

    // Apply monthly cap
    if (scheme.monthly_cap !== null) {
      reliefAmount = Math.min(reliefAmount, scheme.monthly_cap);
    }

    // Apply annual cap
    if (scheme.annual_cap !== null) {
      const ytdClaimed = ytdSchemeReliefClaimed[scheme.scheme_code] || 0;
      const remainingCap = Math.max(0, scheme.annual_cap - ytdClaimed);
      reliefAmount = Math.min(reliefAmount, remainingCap);
    }

    if (reliefAmount > 0) {
      reliefs.push({
        scheme_code: scheme.scheme_code,
        scheme_name: scheme.scheme_name,
        category: scheme.scheme_category,
        relief_type: scheme.relief_type,
        amount: reliefAmount,
        reduces_taxable_income: scheme.relief_type === 'deduction' || scheme.relief_type === 'exemption',
        is_tax_credit: scheme.relief_type === 'credit',
      });
    }
  }

  // Process auto-applicable schemes (like CRA in Nigeria, personal allowances)
  // These apply automatically based on age/country without enrollment
  for (const scheme of schemes) {
    // Skip if already processed through enrollment
    if (enrollments.some(e => e.scheme_id === scheme.id)) continue;

    // Only auto-apply certain scheme types
    const autoApplyCategories = ['personal_relief'];
    const autoApplyCodes = ['CRA', 'PERSONAL_ALLOWANCE', 'AGE_RELIEF_55', 'AGE_RELIEF_65', 'DISABILITY'];
    
    if (!autoApplyCategories.includes(scheme.scheme_category) && 
        !autoApplyCodes.includes(scheme.scheme_code)) continue;

    // Check age eligibility
    if (employeeAge !== null) {
      if (scheme.min_age !== null && employeeAge < scheme.min_age) continue;
      if (scheme.max_age !== null && employeeAge > scheme.max_age) continue;
    } else if (scheme.min_age !== null || scheme.max_age !== null) {
      // Skip age-dependent schemes if age is unknown
      continue;
    }

    let reliefAmount = calculateSchemeAmount(scheme, grossPay, null);

    // Apply monthly cap
    if (scheme.monthly_cap !== null) {
      reliefAmount = Math.min(reliefAmount, scheme.monthly_cap);
    }

    // Apply annual cap
    if (scheme.annual_cap !== null) {
      const ytdClaimed = ytdSchemeReliefClaimed[scheme.scheme_code] || 0;
      const remainingCap = Math.max(0, scheme.annual_cap - ytdClaimed);
      reliefAmount = Math.min(reliefAmount, remainingCap);
    }

    if (reliefAmount > 0) {
      reliefs.push({
        scheme_code: scheme.scheme_code,
        scheme_name: scheme.scheme_name,
        category: scheme.scheme_category,
        relief_type: scheme.relief_type,
        amount: reliefAmount,
        reduces_taxable_income: scheme.relief_type === 'deduction' || scheme.relief_type === 'exemption',
        is_tax_credit: scheme.relief_type === 'credit',
      });
    }
  }

  return reliefs;
}

/**
 * Calculate the relief amount based on scheme configuration
 */
function calculateSchemeAmount(
  scheme: TaxReliefScheme,
  grossPay: number,
  enrollment: EmployeeReliefEnrollment | null
): number {
  switch (scheme.calculation_method) {
    case 'fixed_amount':
      // For fixed amount, divide annual amount by 12 for monthly
      return (scheme.relief_value || 0) / 12;

    case 'percentage_of_income':
      return grossPay * ((scheme.relief_percentage || 0) / 100);

    case 'percentage_of_contribution':
      // Use contribution from enrollment if available
      const contribution = enrollment?.contribution_amount || 0;
      return contribution * ((scheme.relief_percentage || 0) / 100);

    case 'tiered':
      // Special handling for Nigeria's CRA
      if (scheme.scheme_code === 'CRA') {
        // CRA = Higher of N200,000 or 1% of gross + 20% of gross
        const annualGross = grossPay * 12;
        const option1 = 200000;
        const option2 = annualGross * 0.01;
        const baseRelief = Math.max(option1, option2);
        const percentageRelief = annualGross * 0.20;
        return (baseRelief + percentageRelief) / 12; // Monthly portion
      }
      return (scheme.relief_value || 0) / 12;

    default:
      return 0;
  }
}

/**
 * Main function to calculate all tax reliefs for an employee
 * Returns adjusted taxable income and any tax credits
 */
export async function calculateAllTaxReliefs(
  employeeId: string,
  countryCode: string,
  grossPay: number,
  statutoryDeductions: Array<{ code: string; employeeAmount: number; employerAmount: number }>,
  employeeAge: number | null = null,
  effectiveDate?: string,
  ytdStatutoryReliefClaimed: Record<string, number> = {},
  ytdSchemeReliefClaimed: Record<string, number> = {}
): Promise<TaxReliefCalculationResult> {
  // Fetch all relief configurations in parallel
  const [reliefRules, schemes, enrollments] = await Promise.all([
    fetchStatutoryTaxReliefRules(countryCode, effectiveDate),
    fetchTaxReliefSchemes(countryCode, effectiveDate),
    fetchEmployeeReliefEnrollments(employeeId, effectiveDate),
  ]);

  // Calculate statutory tax relief (from NIS, SSNIT, etc.)
  const statutoryReliefs = calculateStatutoryTaxRelief(
    statutoryDeductions,
    reliefRules,
    ytdStatutoryReliefClaimed
  );

  // Calculate scheme reliefs (personal reliefs, savings, housing, youth)
  const schemeReliefs = calculateSchemeReliefs(
    grossPay,
    employeeAge,
    enrollments,
    schemes,
    ytdSchemeReliefClaimed
  );

  // Sum up all reliefs
  const allReliefs = [...statutoryReliefs, ...schemeReliefs];
  
  const totalTaxableIncomeReduction = allReliefs
    .filter(r => r.reduces_taxable_income)
    .reduce((sum, r) => sum + r.amount, 0);

  const totalTaxCredits = allReliefs
    .filter(r => r.is_tax_credit)
    .reduce((sum, r) => sum + r.amount, 0);

  const adjustedTaxableIncome = Math.max(0, grossPay - totalTaxableIncomeReduction);

  return {
    statutoryReliefs,
    schemeReliefs,
    totalTaxableIncomeReduction,
    totalTaxCredits,
    adjustedTaxableIncome,
  };
}

/**
 * Simplified function for calculating taxable income after all reliefs
 * Used during payroll processing
 */
export async function getAdjustedTaxableIncome(
  employeeId: string,
  countryCode: string,
  grossPay: number,
  statutoryDeductions: Array<{ code: string; employeeAmount: number; employerAmount: number }>,
  employeeAge: number | null = null,
  effectiveDate?: string
): Promise<{ taxableIncome: number; taxCredits: number; reliefDetails: CalculatedRelief[] }> {
  const result = await calculateAllTaxReliefs(
    employeeId,
    countryCode,
    grossPay,
    statutoryDeductions,
    employeeAge,
    effectiveDate
  );

  return {
    taxableIncome: result.adjustedTaxableIncome,
    taxCredits: result.totalTaxCredits,
    reliefDetails: [...result.statutoryReliefs, ...result.schemeReliefs],
  };
}
