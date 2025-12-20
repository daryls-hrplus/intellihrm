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
  TaxCalculationMethod
} from "@/utils/payroll/cumulativeStatutoryCalculator";
import { fetchOpeningBalances, fetchStatutoryDeductionsForCountry, OpeningBalances } from "@/utils/statutoryDeductionCalculator";
import { fetchCountryTaxSettings, getDefaultTaxSettings } from "@/utils/payroll/countryTaxSettings";

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
  }[];
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
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

  // Fetch all necessary data in parallel, including country tax settings
  const [
    ytdAmounts,
    periodAmounts,
    openingBalances,
    { types: statutoryTypes },
    rateBands,
    countryTaxSettings
  ] = await Promise.all([
    fetchYtdStatutoryAmounts(employeeId, taxYear, excludeRunId),
    fetchPeriodStatutoryAmounts(employeeId, payPeriodId, excludeRunId),
    fetchOpeningBalances(employeeId, taxYear),
    fetchStatutoryDeductionsForCountry(countryCode, effectiveDate),
    fetchExtendedRateBands(supabase, countryCode, effectiveDate),
    fetchCountryTaxSettings(countryCode, effectiveDate)
  ]);

  // Use fetched settings or defaults
  const taxSettings = countryTaxSettings || getDefaultTaxSettings(countryCode);

  const context: CumulativeCalculationContext = {
    openingBalances,
    ytdStatutoryAmounts: ytdAmounts,
    periodStatutoryAmounts: periodAmounts,
    isOffCycle: true,
    taxCalculationMethod: taxSettings.taxCalculationMethod,
    allowMidYearRefunds: taxSettings.allowMidYearRefunds,
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

  // For regular payroll, we only consider YTD (not period amounts since this is the first run)
  const [
    ytdAmounts,
    openingBalances,
    { types: statutoryTypes },
    rateBands,
    countryTaxSettings
  ] = await Promise.all([
    fetchYtdStatutoryAmounts(employeeId, taxYear, excludeRunId),
    fetchOpeningBalances(employeeId, taxYear),
    fetchStatutoryDeductionsForCountry(countryCode, payPeriodStart),
    fetchExtendedRateBands(supabase, countryCode, payPeriodStart),
    fetchCountryTaxSettings(countryCode, payPeriodStart)
  ]);

  // Use fetched settings or defaults
  const taxSettings = countryTaxSettings || getDefaultTaxSettings(countryCode);

  const context: CumulativeCalculationContext = {
    openingBalances,
    ytdStatutoryAmounts: ytdAmounts,
    periodStatutoryAmounts: {}, // Empty for regular payroll
    isOffCycle: false,
    taxCalculationMethod: taxSettings.taxCalculationMethod,
    allowMidYearRefunds: taxSettings.allowMidYearRefunds,
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
