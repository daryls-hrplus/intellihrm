import { supabase } from "@/integrations/supabase/client";

export interface YtdStatutoryAmounts {
  [statutoryCode: string]: {
    ytdEmployeeAmount: number;
    ytdEmployerAmount: number;
  };
}

export interface PeriodStatutoryAmounts {
  [statutoryCode: string]: {
    periodEmployeeAmount: number;
    periodEmployerAmount: number;
  };
}

/**
 * Fetch YTD statutory deductions for an employee for the current tax year
 * This is used to check against annual caps (e.g., NIS, Health Surcharge limits)
 */
export async function fetchYtdStatutoryAmounts(
  employeeId: string,
  taxYear: number,
  excludeRunId?: string
): Promise<YtdStatutoryAmounts> {
  const { data, error } = await supabase.rpc('get_employee_ytd_statutory', {
    p_employee_id: employeeId,
    p_tax_year: taxYear,
    p_exclude_run_id: excludeRunId || null,
  });

  if (error) {
    console.error('Error fetching YTD statutory amounts:', error);
    return {};
  }

  const result: YtdStatutoryAmounts = {};
  for (const row of data || []) {
    const code = row.statutory_code;
    if (!result[code]) {
      result[code] = { ytdEmployeeAmount: 0, ytdEmployerAmount: 0 };
    }
    result[code].ytdEmployeeAmount += Number(row.ytd_employee_amount) || 0;
    result[code].ytdEmployerAmount += Number(row.ytd_employer_amount) || 0;
  }

  return result;
}

/**
 * Fetch statutory deductions already calculated for the current pay period
 * This is used when running off-cycle payroll to know what's already been deducted
 */
export async function fetchPeriodStatutoryAmounts(
  employeeId: string,
  payPeriodId: string,
  excludeRunId?: string
): Promise<PeriodStatutoryAmounts> {
  const { data, error } = await supabase.rpc('get_employee_period_statutory', {
    p_employee_id: employeeId,
    p_pay_period_id: payPeriodId,
    p_exclude_run_id: excludeRunId || null,
  });

  if (error) {
    console.error('Error fetching period statutory amounts:', error);
    return {};
  }

  const result: PeriodStatutoryAmounts = {};
  for (const row of data || []) {
    const code = row.statutory_code;
    if (!result[code]) {
      result[code] = { periodEmployeeAmount: 0, periodEmployerAmount: 0 };
    }
    result[code].periodEmployeeAmount += Number(row.period_employee_amount) || 0;
    result[code].periodEmployerAmount += Number(row.period_employer_amount) || 0;
  }

  return result;
}

/**
 * Get the tax year from a pay period date
 */
export function getTaxYearFromDate(periodStart: string): number {
  const date = new Date(periodStart);
  // Most Caribbean countries use calendar year as tax year
  // Can be made configurable per country if needed
  return date.getFullYear();
}
