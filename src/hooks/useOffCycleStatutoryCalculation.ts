import { supabase } from "@/integrations/supabase/client";
import { 
  fetchYtdStatutoryAmounts, 
  fetchPeriodStatutoryAmounts, 
  getTaxYearFromDate,
  YtdStatutoryAmounts,
  PeriodStatutoryAmounts 
} from "@/utils/payroll/ytdStatutoryService";
import { 
  calculateCumulativeStatutoryDeductions, 
  fetchExtendedRateBands,
  CumulativeCalculationContext,
  ExtendedStatutoryRateBand,
  TaxCalculationMethod,
  TaxReliefContext,
  ExtendedStatutoryCalculationResult
} from "@/utils/payroll/cumulativeStatutoryCalculator";
import { fetchOpeningBalances, fetchStatutoryDeductionsForCountry, OpeningBalances } from "@/utils/statutoryDeductionCalculator";
import { fetchCountryTaxSettings, getDefaultTaxSettings } from "@/utils/payroll/countryTaxSettings";
import {
  fetchStatutoryTaxReliefRules,
  fetchTaxReliefSchemes,
  fetchEmployeeReliefEnrollments,
  CalculatedRelief
} from "@/utils/payroll/taxReliefCalculator";

export interface OffCycleCalculationParams {
  employeeId: string;
  payPeriodId: string;
  grossPay: number;
  countryCode: string;
  excludeRunId?: string;
  mondayCount?: number;
  employeeAge?: number | null;
}

export interface OffCycleCalculationResult {
  deductions: {
    code: string;
    name: string;
    type: string;
    employeeAmount: number;
    employerAmount: number;
    calculationMethod: string;
    ytdTaxableIncome?: number;
    ytdTaxPaid?: number;
    isRefund?: boolean;
    taxReliefAmount?: number;
  }[];
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
  taxReliefs?: CalculatedRelief[];
  totalTaxableIncomeReduction?: number;
  totalTaxCredits?: number;
  adjustedTaxableIncome?: number;
  context: {
    ytdAmounts: YtdStatutoryAmounts;
    periodAmounts: PeriodStatutoryAmounts;
    openingBalances: OpeningBalances | null;
    taxYear: number;
    taxCalculationMethod: TaxCalculationMethod;
    allowMidYearRefunds: boolean;
  };
}

/**
 * Calculate statutory deductions for off-cycle payroll
 * Takes into account:
 * - YTD amounts already paid (for annual caps)
 * - Current period amounts already calculated (for off-cycle additions)
 * - Progressive tax bracket placement
 * - Country's tax calculation method (cumulative vs non-cumulative)
 * - Tax relief from statutory contributions and enrolled schemes
 */
export async function calculateOffCycleStatutory(
  params: OffCycleCalculationParams
): Promise<OffCycleCalculationResult> {
  const { 
    employeeId, 
    payPeriodId, 
    grossPay, 
    countryCode, 
    excludeRunId,
    mondayCount = 4,
    employeeAge = null 
  } = params;

  // Get pay period details to determine tax year
  const { data: payPeriod } = await supabase
    .from('pay_periods')
    .select('period_start, period_end')
    .eq('id', payPeriodId)
    .single();

  if (!payPeriod) {
    throw new Error('Pay period not found');
  }

  const taxYear = getTaxYearFromDate(payPeriod.period_start);

  // Use period end date as the effective date for rate lookups
  const effectiveDate = payPeriod.period_end;

  // Fetch all necessary data in parallel, including tax relief data
  const [
    ytdAmounts,
    periodAmounts,
    openingBalances,
    { types: statutoryTypes },
    rateBands,
    countryTaxSettings,
    statutoryReliefRules,
    taxReliefSchemes,
    employeeEnrollments
  ] = await Promise.all([
    fetchYtdStatutoryAmounts(employeeId, taxYear, excludeRunId),
    fetchPeriodStatutoryAmounts(employeeId, payPeriodId, excludeRunId),
    fetchOpeningBalances(employeeId, taxYear),
    fetchStatutoryDeductionsForCountry(countryCode, effectiveDate),
    fetchExtendedRateBands(supabase, countryCode, effectiveDate),
    fetchCountryTaxSettings(countryCode, effectiveDate),
    fetchStatutoryTaxReliefRules(countryCode, effectiveDate),
    fetchTaxReliefSchemes(countryCode, effectiveDate),
    fetchEmployeeReliefEnrollments(employeeId, effectiveDate)
  ]);

  // Use fetched settings or defaults
  const taxSettings = countryTaxSettings || getDefaultTaxSettings(countryCode);

  // Build tax relief context
  const taxReliefContext: TaxReliefContext = {
    statutoryReliefRules,
    taxReliefSchemes,
    employeeEnrollments,
    ytdReliefsClaimed: {}, // TODO: Track YTD relief claims
  };

  const context: CumulativeCalculationContext = {
    openingBalances,
    ytdStatutoryAmounts: ytdAmounts,
    periodStatutoryAmounts: periodAmounts,
    isOffCycle: true,
    taxCalculationMethod: taxSettings.taxCalculationMethod,
    allowMidYearRefunds: taxSettings.allowMidYearRefunds,
    taxReliefContext,
  };

  const result = calculateCumulativeStatutoryDeductions(
    grossPay,
    statutoryTypes,
    rateBands as ExtendedStatutoryRateBand[],
    context,
    mondayCount,
    employeeAge
  );

  return {
    ...result,
    context: {
      ytdAmounts,
      periodAmounts,
      openingBalances,
      taxYear,
      taxCalculationMethod: taxSettings.taxCalculationMethod,
      allowMidYearRefunds: taxSettings.allowMidYearRefunds,
    },
  };
}

/**
 * Calculate regular (non-off-cycle) statutory deductions with YTD awareness
 * Used for first-time calculations or recalculations
 * Respects country's tax calculation method (cumulative vs non-cumulative)
 * Includes tax relief calculations
 */
export async function calculateRegularStatutory(
  params: Omit<OffCycleCalculationParams, 'payPeriodId'> & { payPeriodStart: string }
): Promise<OffCycleCalculationResult> {
  const { 
    employeeId, 
    payPeriodStart,
    grossPay, 
    countryCode, 
    excludeRunId,
    mondayCount = 4,
    employeeAge = null 
  } = params;

  const taxYear = getTaxYearFromDate(payPeriodStart);

  // Fetch all data including tax relief data
  const [
    ytdAmounts,
    openingBalances,
    { types: statutoryTypes },
    rateBands,
    countryTaxSettings,
    statutoryReliefRules,
    taxReliefSchemes,
    employeeEnrollments
  ] = await Promise.all([
    fetchYtdStatutoryAmounts(employeeId, taxYear, excludeRunId),
    fetchOpeningBalances(employeeId, taxYear),
    fetchStatutoryDeductionsForCountry(countryCode, payPeriodStart),
    fetchExtendedRateBands(supabase, countryCode, payPeriodStart),
    fetchCountryTaxSettings(countryCode, payPeriodStart),
    fetchStatutoryTaxReliefRules(countryCode, payPeriodStart),
    fetchTaxReliefSchemes(countryCode, payPeriodStart),
    fetchEmployeeReliefEnrollments(employeeId, payPeriodStart)
  ]);

  // Use fetched settings or defaults
  const taxSettings = countryTaxSettings || getDefaultTaxSettings(countryCode);

  // Build tax relief context
  const taxReliefContext: TaxReliefContext = {
    statutoryReliefRules,
    taxReliefSchemes,
    employeeEnrollments,
    ytdReliefsClaimed: {}, // TODO: Track YTD relief claims
  };

  const context: CumulativeCalculationContext = {
    openingBalances,
    ytdStatutoryAmounts: ytdAmounts,
    periodStatutoryAmounts: {}, // Empty for regular payroll
    isOffCycle: false,
    taxCalculationMethod: taxSettings.taxCalculationMethod,
    allowMidYearRefunds: taxSettings.allowMidYearRefunds,
    taxReliefContext,
  };

  const result = calculateCumulativeStatutoryDeductions(
    grossPay,
    statutoryTypes,
    rateBands as ExtendedStatutoryRateBand[],
    context,
    mondayCount,
    employeeAge
  );

  return {
    ...result,
    context: {
      ytdAmounts,
      periodAmounts: {},
      openingBalances,
      taxYear,
      taxCalculationMethod: taxSettings.taxCalculationMethod,
      allowMidYearRefunds: taxSettings.allowMidYearRefunds,
    },
  };
}
