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
  ExtendedStatutoryRateBand 
} from "@/utils/payroll/cumulativeStatutoryCalculator";
import { fetchOpeningBalances, fetchStatutoryDeductionsForCountry, OpeningBalances } from "@/utils/statutoryDeductionCalculator";

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
  }[];
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
  context: {
    ytdAmounts: YtdStatutoryAmounts;
    periodAmounts: PeriodStatutoryAmounts;
    openingBalances: OpeningBalances | null;
    taxYear: number;
  };
}

/**
 * Calculate statutory deductions for off-cycle payroll
 * Takes into account:
 * - YTD amounts already paid (for annual caps)
 * - Current period amounts already calculated (for off-cycle additions)
 * - Progressive tax bracket placement
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

  // Fetch all necessary data in parallel
  const [
    ytdAmounts,
    periodAmounts,
    openingBalances,
    { types: statutoryTypes },
    rateBands
  ] = await Promise.all([
    fetchYtdStatutoryAmounts(employeeId, taxYear, excludeRunId),
    fetchPeriodStatutoryAmounts(employeeId, payPeriodId, excludeRunId),
    fetchOpeningBalances(employeeId, taxYear),
    fetchStatutoryDeductionsForCountry(countryCode, effectiveDate),
    fetchExtendedRateBands(supabase, countryCode, effectiveDate)
  ]);

  const context: CumulativeCalculationContext = {
    openingBalances,
    ytdStatutoryAmounts: ytdAmounts,
    periodStatutoryAmounts: periodAmounts,
    isOffCycle: true,
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
    },
  };
}

/**
 * Calculate regular (non-off-cycle) statutory deductions with YTD awareness
 * Used for first-time calculations or recalculations
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
    rateBands
  ] = await Promise.all([
    fetchYtdStatutoryAmounts(employeeId, taxYear, excludeRunId),
    fetchOpeningBalances(employeeId, taxYear),
    fetchStatutoryDeductionsForCountry(countryCode, payPeriodStart),
    fetchExtendedRateBands(supabase, countryCode, payPeriodStart)
  ]);

  const context: CumulativeCalculationContext = {
    openingBalances,
    ytdStatutoryAmounts: ytdAmounts,
    periodStatutoryAmounts: {}, // Empty for regular payroll
    isOffCycle: false,
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
    },
  };
}
