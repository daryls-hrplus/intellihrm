import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTodayString, toDateString } from "@/utils/dateUtils";
import { 
  calculateProrationFactor, 
  applyProration, 
  getProrationMethodCode,
  type ProrationMethod 
} from "@/utils/payroll/prorationCalculator";
import {
  calculateStatutoryDeductions,
  fetchOpeningBalances,
  type StatutoryDeduction,
  type StatutoryRateBand,
} from "@/utils/statutoryDeductionCalculator";
import {
  fetchActiveSavingsEnrollments,
  calculateSavingsDeductions,
  createSavingsTransactions,
  type EmployeeSavingsDeductions,
} from "@/utils/payroll/savingsDeductionService";
import {
  calculateLeaveDeductions,
  saveLeavePayrollTransactions,
  type LeaveDeductionResult,
} from "@/utils/payroll/leaveDeductionService";

export interface PayPeriodSchedule {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description: string | null;
  frequency: 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';
  pay_day_of_week: number | null;
  pay_day_of_month: number | null;
  second_pay_day_of_month: number | null;
  cutoff_days_before_pay: number;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayPeriod {
  id: string;
  company_id: string;
  schedule_id: string;
  period_number: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  cutoff_date: string | null;
  status: 'open' | 'processing' | 'approved' | 'paid' | 'closed';
  processed_at: string | null;
  processed_by: string | null;
  approved_at: string | null;
  approved_by: string | null;
  paid_at: string | null;
  paid_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  fiscal_year?: number | null;
  fiscal_month?: number | null;
  schedule?: PayPeriodSchedule;
}

export interface PayrollRun {
  id: string;
  company_id: string;
  pay_group_id: string;
  pay_period_id: string;
  run_number: string;
  run_type: 'regular' | 'supplemental' | 'bonus' | 'correction' | 'off_cycle';
  status: 'draft' | 'calculating' | 'calculated' | 'pending_approval' | 'approved' | 'processing' | 'paid' | 'failed' | 'cancelled';
  total_gross_pay: number;
  total_net_pay: number;
  total_deductions: number;
  total_taxes: number;
  total_employer_taxes: number;
  total_employer_contributions: number;
  employee_count: number;
  currency: string;
  calculated_at: string | null;
  calculated_by: string | null;
  approved_at: string | null;
  approved_by: string | null;
  paid_at: string | null;
  paid_by: string | null;
  workflow_instance_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  pay_period?: PayPeriod;
}

export interface EmployeePayroll {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  employee_position_id: string | null;
  pay_period_id: string;
  status: 'pending' | 'calculated' | 'approved' | 'paid' | 'void';
  regular_hours: number;
  overtime_hours: number;
  holiday_hours: number;
  sick_hours: number;
  vacation_hours: number;
  other_hours: number;
  gross_pay: number;
  regular_pay: number;
  overtime_pay: number;
  bonus_pay: number;
  commission_pay: number;
  other_earnings: number;
  total_deductions: number;
  tax_deductions: number;
  benefit_deductions: number;
  retirement_deductions: number;
  garnishment_deductions: number;
  other_deductions: number;
  net_pay: number;
  employer_taxes: number;
  employer_benefits: number;
  employer_retirement: number;
  total_employer_cost: number;
  currency: string;
  ytd_gross_pay: number;
  ytd_net_pay: number;
  ytd_taxes: number;
  calculation_details: Record<string, unknown>;
  payslip_generated: boolean;
  payslip_generated_at: string | null;
  payslip_document_id: string | null;
  bank_file_generated: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: { id: string; full_name: string; email: string };
  position?: { title: string };
}

export interface PayrollLineItem {
  id: string;
  employee_payroll_id: string;
  pay_element_id: string | null;
  line_type: 'earning' | 'deduction' | 'tax' | 'employer_contribution';
  code: string;
  name: string;
  hours: number | null;
  rate: number | null;
  units: number | null;
  amount: number;
  ytd_amount: number;
  is_taxable: boolean;
  is_pensionable: boolean;
  tax_category: string | null;
  sort_order: number;
  calculation_basis: string | null;
  notes: string | null;
  created_at: string;
}

export interface PayrollTaxConfig {
  id: string;
  company_id: string | null;
  country_code: string;
  region_code: string | null;
  tax_type: string;
  tax_name: string;
  calculation_method: 'percentage' | 'bracket' | 'flat' | 'formula';
  rate: number | null;
  wage_base_limit: number | null;
  exempt_amount: number;
  employer_rate: number | null;
  employer_wage_base_limit: number | null;
  is_employee_tax: boolean;
  is_employer_tax: boolean;
  is_active: boolean;
  effective_date: string;
  end_date: string | null;
  tax_brackets: unknown;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollDeductionConfig {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description: string | null;
  deduction_type: 'pre_tax' | 'post_tax' | 'garnishment' | 'loan' | 'other';
  calculation_method: 'fixed' | 'percentage' | 'formula';
  default_amount: number | null;
  default_percentage: number | null;
  max_amount: number | null;
  annual_limit: number | null;
  is_active: boolean;
  is_mandatory: boolean;
  affects_taxable_income: boolean;
  affects_pensionable_income: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payslip {
  id: string;
  employee_payroll_id: string;
  employee_id: string;
  payslip_number: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  currency: string;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  is_viewable: boolean;
  viewed_at: string | null;
  downloaded_at: string | null;
  status?: 'active' | 'recalled' | 'superseded';
  recalled_at?: string | null;
  recalled_by?: string | null;
  recall_reason?: string | null;
  payroll_run_id?: string | null;
  created_at: string;
  updated_at: string;
  employee?: { full_name: string; email: string };
}

export interface BankFileConfig {
  id: string;
  company_id: string;
  bank_name: string;
  file_format: 'ach' | 'nacha' | 'bacs' | 'sepa' | 'csv' | 'custom';
  company_bank_name: string | null;
  company_bank_account: string | null;
  company_bank_routing: string | null;
  company_id_number: string | null;
  originator_id: string | null;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayrollYearEnd {
  id: string;
  company_id: string;
  tax_year: number;
  status: 'open' | 'processing' | 'generated' | 'submitted' | 'corrected' | 'closed';
  w2_generated: boolean;
  w2_generated_at: string | null;
  w2_submitted: boolean;
  w2_submitted_at: string | null;
  total_employees: number;
  total_wages: number;
  total_taxes_withheld: number;
  processing_notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export function usePayroll() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pay Period Schedules
  const fetchPayPeriodSchedules = async (companyId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("pay_period_schedules")
        .select("*")
        .eq("company_id", companyId)
        .order("name");
      if (error) throw error;
      return data as PayPeriodSchedule[];
    } catch (err: any) {
      toast.error("Failed to fetch pay period schedules");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createPayPeriodSchedule = async (data: Partial<PayPeriodSchedule>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("pay_period_schedules").insert([data as any]);
      if (error) throw error;
      toast.success("Pay period schedule created");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to create schedule");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePayPeriodSchedule = async (id: string, data: Partial<PayPeriodSchedule>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("pay_period_schedules").update(data as any).eq("id", id);
      if (error) throw error;
      toast.success("Pay period schedule updated");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update schedule");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePayPeriodSchedule = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("pay_period_schedules").delete().eq("id", id);
      if (error) throw error;
      toast.success("Pay period schedule deleted");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete schedule");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Pay Periods
  const fetchPayPeriods = async (companyId: string, status?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("pay_periods")
        .select(`*, schedule:pay_period_schedules(*)`)
        .eq("company_id", companyId)
        .order("period_start", { ascending: false });
      
      if (status) {
        query = query.eq("status", status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PayPeriod[];
    } catch (err: any) {
      toast.error("Failed to fetch pay periods");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createPayPeriod = async (data: Partial<PayPeriod>) => {
    setIsLoading(true);
    try {
      // Calculate fiscal period if we have company_id and period_end
      let enrichedData = { ...data };
      if (data.company_id && data.period_end) {
        const { getFiscalPeriodForCompany } = await import("@/utils/fiscalPeriodCalculator");
        const fiscalPeriod = await getFiscalPeriodForCompany(data.company_id, data.period_end);
        if (fiscalPeriod) {
          enrichedData = { ...enrichedData, ...fiscalPeriod };
        }
      }
      
      const { error } = await supabase.from("pay_periods").insert([enrichedData as any]);
      if (error) throw error;
      toast.success("Pay period created");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to create pay period");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePayPeriod = async (id: string, data: Partial<PayPeriod>) => {
    setIsLoading(true);
    try {
      // Recalculate fiscal period if period_end changed
      let enrichedData = { ...data };
      if (data.period_end && data.company_id) {
        const { getFiscalPeriodForCompany } = await import("@/utils/fiscalPeriodCalculator");
        const fiscalPeriod = await getFiscalPeriodForCompany(data.company_id, data.period_end);
        if (fiscalPeriod) {
          enrichedData = { ...enrichedData, ...fiscalPeriod };
        }
      }
      
      const { error } = await supabase.from("pay_periods").update(enrichedData as any).eq("id", id);
      if (error) throw error;
      toast.success("Pay period updated");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update pay period");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const generatePayPeriods = async (scheduleId: string, companyId: string, startDate: string, endDate: string) => {
    setIsLoading(true);
    try {
      // Fetch schedule to determine frequency
      const { data: schedule, error: schedError } = await supabase
        .from("pay_period_schedules")
        .select("*")
        .eq("id", scheduleId)
        .single();
      
      if (schedError) throw schedError;
      
      // Get company's country fiscal config
      const { data: company } = await supabase
        .from("companies")
        .select("country")
        .eq("id", companyId)
        .single();
      
      let fiscalStartMonth = 1;
      let fiscalStartDay = 1;
      
      if (company?.country) {
        const { data: fiscalConfig } = await supabase
          .from("country_fiscal_years")
          .select("fiscal_year_start_month, fiscal_year_start_day")
          .eq("country_code", company.country)
          .eq("is_active", true)
          .single();
        
        if (fiscalConfig) {
          fiscalStartMonth = fiscalConfig.fiscal_year_start_month;
          fiscalStartDay = fiscalConfig.fiscal_year_start_day;
        }
      }
      
      const { calculateFiscalPeriod } = await import("@/utils/fiscalPeriodCalculator");
      
      const periods: Partial<PayPeriod>[] = [];
      let currentStart = new Date(startDate);
      const end = new Date(endDate);
      
      while (currentStart < end) {
        let periodEnd: Date;
        let payDate: Date;
        
        switch (schedule.frequency) {
          case 'weekly':
            periodEnd = new Date(currentStart);
            periodEnd.setDate(periodEnd.getDate() + 6);
            payDate = new Date(periodEnd);
            payDate.setDate(payDate.getDate() + (schedule.cutoff_days_before_pay || 3));
            break;
          case 'bi_weekly':
            periodEnd = new Date(currentStart);
            periodEnd.setDate(periodEnd.getDate() + 13);
            payDate = new Date(periodEnd);
            payDate.setDate(payDate.getDate() + (schedule.cutoff_days_before_pay || 3));
            break;
          case 'semi_monthly':
            if (currentStart.getDate() <= 15) {
              periodEnd = new Date(currentStart.getFullYear(), currentStart.getMonth(), 15);
            } else {
              periodEnd = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 0);
            }
            payDate = new Date(periodEnd);
            payDate.setDate(payDate.getDate() + (schedule.cutoff_days_before_pay || 3));
            break;
          case 'monthly':
          default:
            periodEnd = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 0);
            payDate = new Date(periodEnd);
            if (schedule.pay_day_of_month) {
              payDate = new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, schedule.pay_day_of_month);
            } else {
              payDate.setDate(payDate.getDate() + (schedule.cutoff_days_before_pay || 3));
            }
            break;
        }
        
        if (periodEnd > end) periodEnd = end;
        
        // Calculate fiscal period for this pay period
        const fiscalPeriod = calculateFiscalPeriod(periodEnd, fiscalStartMonth, fiscalStartDay);
        
        periods.push({
          company_id: companyId,
          schedule_id: scheduleId,
          period_start: toDateString(currentStart),
          period_end: toDateString(periodEnd),
          pay_date: toDateString(payDate),
          cutoff_date: toDateString(new Date(payDate.getTime() - (schedule.cutoff_days_before_pay || 3) * 24 * 60 * 60 * 1000)),
          status: 'open',
          fiscal_year: fiscalPeriod.fiscal_year,
          fiscal_month: fiscalPeriod.fiscal_month,
        });
        
        // Move to next period
        currentStart = new Date(periodEnd);
        currentStart.setDate(currentStart.getDate() + 1);
      }
      
      if (periods.length > 0) {
        const { error } = await supabase.from("pay_periods").insert(periods as any);
        if (error) throw error;
        toast.success(`Generated ${periods.length} pay periods`);
        return true;
      }
      
      return false;
    } catch (err: any) {
      toast.error(err.message || "Failed to generate pay periods");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Payroll Runs
  const fetchPayrollRuns = async (companyId: string, payPeriodId?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("payroll_runs")
        .select(`*, pay_period:pay_periods(*, schedule:pay_period_schedules(*))`)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      
      if (payPeriodId) {
        query = query.eq("pay_period_id", payPeriodId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PayrollRun[];
    } catch (err: any) {
      toast.error("Failed to fetch payroll runs");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createPayrollRun = async (data: Partial<PayrollRun>) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase
        .from("payroll_runs")
        .insert([data as any])
        .select()
        .single();
      if (error) throw error;
      toast.success("Payroll run created");
      return result as PayrollRun;
    } catch (err: any) {
      toast.error(err.message || "Failed to create payroll run");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePayrollRun = async (id: string, data: Partial<PayrollRun>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("payroll_runs").update(data as any).eq("id", id);
      if (error) throw error;
      toast.success("Payroll run updated");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update payroll run");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Lock employees for payroll processing
  const lockEmployeesForPayroll = async (payrollRunId: string, payGroupId: string, employeeIds: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const locks = employeeIds.map(empId => ({
        payroll_run_id: payrollRunId,
        employee_id: empId,
        pay_group_id: payGroupId,
        locked_by: user?.id,
        lock_reason: 'payroll_processing',
      }));
      
      await supabase.from("payroll_employee_locks").upsert(locks, { onConflict: 'payroll_run_id,employee_id' });
      
      await supabase.from("payroll_runs").update({
        is_locked: true,
        locked_at: new Date().toISOString(),
        locked_by: user?.id,
      }).eq("id", payrollRunId);
      
      return true;
    } catch (err) {
      console.error("Failed to lock employees:", err);
      return false;
    }
  };

  // Unlock employees after payroll is reopened
  const unlockEmployeesForPayroll = async (payrollRunId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("payroll_employee_locks")
        .update({ unlocked_at: new Date().toISOString(), unlocked_by: user?.id })
        .eq("payroll_run_id", payrollRunId)
        .is("unlocked_at", null);
      
      await supabase.from("payroll_runs").update({
        is_locked: false,
        unlocked_at: new Date().toISOString(),
        unlocked_by: user?.id,
      }).eq("id", payrollRunId);
      
      return true;
    } catch (err) {
      console.error("Failed to unlock employees:", err);
      return false;
    }
  };

  // Check if employee is locked
  const checkEmployeeLocked = async (employeeId: string): Promise<boolean> => {
    const { data } = await supabase
      .from("payroll_employee_locks")
      .select("id")
      .eq("employee_id", employeeId)
      .is("unlocked_at", null)
      .limit(1);
    return (data?.length || 0) > 0;
  };

  // Calculate payroll for all employees
  const calculatePayroll = async (payrollRunId: string, companyId: string, payPeriodId: string, payGroupId?: string) => {
    setIsLoading(true);
    try {
      const calculationStartedAt = new Date().toISOString();
      
      // Get run info including run_type for retro targeting
      const { data: runInfo } = await supabase
        .from("payroll_runs")
        .select("run_type")
        .eq("id", payrollRunId)
        .single();
      
      const runType = runInfo?.run_type || 'regular';
      
      // Update run status with start time
      await supabase.from("payroll_runs").update({ 
        status: 'calculating',
        calculation_started_at: calculationStartedAt,
      }).eq("id", payrollRunId);
      
      // Get company info for country code
      const { data: company } = await supabase
        .from("companies")
        .select("country, local_currency_id")
        .eq("id", companyId)
        .single();
      
      const countryCode = company?.country || 'US';
      const localCurrencyId = company?.local_currency_id;
      
      // Get currency code from local_currency_id
      let currency = 'USD';
      if (localCurrencyId) {
        const { data: currencyData } = await supabase
          .from("currencies")
          .select("code")
          .eq("id", localCurrencyId)
          .single();
        currency = currencyData?.code || 'USD';
      }
      
      // Fetch all active currencies to build a code->id lookup map
      const { data: allCurrencies } = await supabase
        .from("currencies")
        .select("id, code")
        .eq("is_active", true);
      
      const currencyCodeToIdMap = new Map<string, string>();
      for (const cur of allCurrencies || []) {
        if (cur?.code && cur?.id) {
          currencyCodeToIdMap.set(cur.code.toUpperCase(), cur.id);
        }
      }
      
      // Fetch stored exchange rates for this payroll run (for multi-currency conversion)
      const { data: payrollExchangeRates } = await supabase
        .from("payroll_run_exchange_rates")
        .select("from_currency_id, to_currency_id, exchange_rate")
        .eq("payroll_run_id", payrollRunId);
      
      // Build a map for quick exchange rate lookup: "fromId->toId" => rate
      const exchangeRateMap = new Map<string, number>();
      for (const rate of payrollExchangeRates || []) {
        const key = `${rate.from_currency_id}->${rate.to_currency_id}`;
        exchangeRateMap.set(key, Number(rate.exchange_rate));
        // Also store the inverse rate for reverse conversions
        if (Number(rate.exchange_rate) > 0) {
          const inverseKey = `${rate.to_currency_id}->${rate.from_currency_id}`;
          exchangeRateMap.set(inverseKey, 1 / Number(rate.exchange_rate));
        }
      }
      
      // Helper function to convert amount from one currency to local currency
      const convertToLocalCurrency = (amount: number, fromCurrencyId: string | null): { 
        localAmount: number; 
        exchangeRateUsed: number | null;
        wasConverted: boolean;
      } => {
        // If no from currency or same as local, no conversion needed
        if (!fromCurrencyId || !localCurrencyId || fromCurrencyId === localCurrencyId) {
          return { localAmount: amount, exchangeRateUsed: null, wasConverted: false };
        }
        
        const key = `${fromCurrencyId}->${localCurrencyId}`;
        const rate = exchangeRateMap.get(key);
        
        if (rate && rate > 0) {
          return { localAmount: amount * rate, exchangeRateUsed: rate, wasConverted: true };
        }
        
        // No rate found - return amount as-is (will log warning)
        console.warn(`No exchange rate found for ${fromCurrencyId} -> ${localCurrencyId}`);
        return { localAmount: amount, exchangeRateUsed: null, wasConverted: false };
      };
      
      // Get pay period info for monday count
      const { data: payPeriod } = await supabase
        .from("pay_periods")
        .select("period_start, period_end, monday_count")
        .eq("id", payPeriodId)
      .single();
      
      const mondayCount = payPeriod?.monday_count || 4;
      const taxYear = payPeriod?.period_start ? new Date(payPeriod.period_start).getFullYear() : new Date().getFullYear();
      
      // Get statutory deduction types for this country
      const today = getTodayString();
      const { data: statutoryTypes } = await supabase
        .from('statutory_deduction_types')
        .select('*')
        .eq('country', countryCode)
        .lte('start_date', today)
        .or(`end_date.is.null,end_date.gte.${today}`);
      
      // Get statutory rate bands
      const { data: rateBands } = await supabase
        .from('statutory_rate_bands')
        .select('*')
        .eq('is_active', true);
      
      // Get pay frequency from pay group
      // Get pay frequency from pay group (if provided)
      let payFrequency = 'monthly';
      if (payGroupId) {
        const { data: payGroup } = await supabase
          .from("pay_groups")
          .select("pay_frequency")
          .eq("id", payGroupId)
          .single();
        payFrequency = payGroup?.pay_frequency || 'monthly';
      }
      
      // Get active employees with positions
      const { data: employees, error: empError } = await supabase
        .from("employee_positions")
        .select(`
          id,
          employee_id,
          position_id,
          start_date,
          end_date,
          compensation_amount,
          compensation_currency,
          compensation_frequency,
          is_primary,
          employee:profiles!employee_positions_employee_id_fkey(id, full_name, email, company_id),
          position:positions!employee_positions_position_id_fkey(id, title)
        `)
        .eq("is_active", true);

      if (empError) throw empError;

      // Filter to only employees from this company
      const baseCompanyEmployees = (employees || []).filter((emp: any) => emp.employee?.company_id === companyId);

      // If a pay group is provided, prefer explicit employee-to-pay-group assignments
      let companyEmployees = baseCompanyEmployees;
      if (payGroupId) {
        const todayStr = getTodayString();
        const { data: payGroupEmployees, error: payGroupErr } = await supabase
          .from("employee_pay_groups")
          .select("employee_id")
          .eq("pay_group_id", payGroupId)
          .lte("start_date", todayStr)
          .or(`end_date.is.null,end_date.gte.${todayStr}`);

        if (payGroupErr) throw payGroupErr;

        const assignedIds = new Set((payGroupEmployees || []).map((r: any) => r.employee_id));
        if (assignedIds.size > 0) {
          companyEmployees = baseCompanyEmployees.filter((emp: any) => assignedIds.has(emp.employee_id));
        }
      }
      
      // Lock employees before processing
      const employeeIds = companyEmployees.map((emp: any) => emp.employee_id);
      if (payGroupId && employeeIds.length > 0) {
        await lockEmployeesForPayroll(payrollRunId, payGroupId, employeeIds);
      }
      
      // Get position compensation for each employee
      const employeePayrolls: Partial<EmployeePayroll>[] = [];
      let totalGross = 0;
      let totalNet = 0;
      let totalDeductions = 0;
      let totalTaxes = 0;
      let totalEmployerTaxes = 0;
      let totalEmployerBenefits = 0;
      
      // Deduplicate employees - each employee should only appear once regardless of how many positions they have
      const uniqueEmployeeIds = [...new Set(companyEmployees.map((emp: any) => emp.employee_id))];
      const processedEmployees: any[] = [];
      for (const empId of uniqueEmployeeIds) {
        // Get the first position record for employee metadata (name, email, etc.)
        const empRecord = companyEmployees.find((e: any) => e.employee_id === empId);
        if (empRecord) {
          processedEmployees.push(empRecord);
        }
      }
      
      for (const emp of processedEmployees) {
        // Get ALL employee positions for this employee (they may have multiple)
        const employeePositions = (employees || []).filter((e: any) => 
          e.employee_id === emp.employee_id && e.employee?.company_id === companyId
        );
        
        // Use primary position for proration dates, or first position if no primary
        const primaryPosition = employeePositions.find((p: any) => p.is_primary) || employeePositions[0];
        
        const employeeStartDate = primaryPosition?.start_date 
          ? new Date(primaryPosition.start_date) 
          : null;
        const employeeEndDate = primaryPosition?.end_date
          ? new Date(primaryPosition.end_date)
          : null;
        
        // First check employee_compensation (overrides position compensation)
        // Filter out compensation items that have ended before this pay period
        // Fetch compensation - exclude pending items (not yet approved for payment)
        const { data: employeeCompRaw } = await supabase
          .from("employee_compensation")
          .select(`
            *, 
            positions (title),
            pay_elements(
              name, 
              code, 
              proration_method:lookup_values!pay_elements_proration_method_id_fkey(code, name)
            )
          `)
          .eq("employee_id", emp.employee_id)
          .eq("is_active", true)
          .or("approval_status.is.null,approval_status.eq.approved");
        
        // Filter out compensation items with end_date before the pay period start
        const periodStart = payPeriod?.period_start;
        const employeeComp = (employeeCompRaw || []).filter((comp: any) => {
          // If no end_date, it's ongoing and should be included
          if (!comp.end_date) return true;
          // If no period start available, include all
          if (!periodStart) return true;
          // Include only if end_date >= period_start (still active during this period)
          return comp.end_date >= periodStart;
        });
        
        let grossPay = 0;
        let regularPay = 0;
        
        // Track itemized earnings for calculation_details
        const earningsBreakdown: { 
          name: string; 
          code: string; 
          amount: number; 
          type: string; 
          is_prorated?: boolean; 
          proration_factor?: number;
          job_title?: string;
          effective_start?: string;
          effective_end?: string;
          original_currency_id?: string;
          original_amount?: number;
          exchange_rate_used?: number;
        }[] = [];
        const allowancesBreakdown: { 
          name: string; 
          amount: number; 
          is_taxable: boolean;
          original_amount?: number;
          original_currency?: string;
          original_currency_id?: string | null;
          exchange_rate_used?: number;
        }[] = [];
        
        if (employeeComp && employeeComp.length > 0) {
          // Use employee compensation with proration - matching simulator logic
          for (const comp of employeeComp) {
            let basePeriodAmount = comp.amount || 0;
            const freq = comp.frequency || 'monthly';
            
            // Convert to pay period frequency (same as simulator)
            if (freq !== payFrequency) {
              let annualAmount = basePeriodAmount;
              switch (freq) {
                case 'monthly':
                  annualAmount = basePeriodAmount * 12;
                  break;
                case 'biweekly':
                case 'fortnightly':
                  annualAmount = basePeriodAmount * 26;
                  break;
                case 'weekly':
                  annualAmount = basePeriodAmount * 52;
                  break;
                case 'annual':
                  annualAmount = basePeriodAmount;
                  break;
              }

              switch (payFrequency) {
                case 'monthly':
                  basePeriodAmount = annualAmount / 12;
                  break;
                case 'biweekly':
                case 'fortnightly':
                  basePeriodAmount = annualAmount / 26;
                  break;
                case 'weekly':
                  basePeriodAmount = annualAmount / 52;
                  break;
                case 'semimonthly':
                  basePeriodAmount = annualAmount / 24;
                  break;
                default:
                  basePeriodAmount = annualAmount / 12;
                  break;
              }
            }
            
            const prorationMethodCode = getProrationMethodCode(
              (comp.pay_elements as any)?.proration_method?.code
            );
            
            let calculatedAmount = basePeriodAmount;
            let isProrated = false;
            let prorationFactor = 1;
            
            // Use compensation's own start/end dates for proration (not position dates)
            if (payPeriod?.period_start && payPeriod?.period_end && prorationMethodCode !== 'NONE') {
              const compStartDate = comp.start_date ? new Date(comp.start_date) : null;
              const compEndDate = comp.end_date ? new Date(comp.end_date) : null;
              
              const pr = calculateProrationFactor({
                periodStart: new Date(payPeriod.period_start),
                periodEnd: new Date(payPeriod.period_end),
                employeeStartDate: compStartDate,
                employeeEndDate: compEndDate,
                prorationMethod: prorationMethodCode,
              });
              
              isProrated = pr.isProrated;
              prorationFactor = pr.factor;
              if (pr.isProrated) {
                calculatedAmount = applyProration(basePeriodAmount, pr);
              }
            }
            
            // Apply currency conversion if compensation is in foreign currency
            // First try currency_id, then fall back to looking up by currency code text
            let compCurrencyId = comp.currency_id;
            if (!compCurrencyId && comp.currency) {
              compCurrencyId = currencyCodeToIdMap.get(String(comp.currency).toUpperCase()) || null;
            }
            
            const originalAmount = calculatedAmount;
            const { localAmount, exchangeRateUsed, wasConverted } = convertToLocalCurrency(calculatedAmount, compCurrencyId);
            calculatedAmount = localAmount;
            
            grossPay += calculatedAmount;
            
            const payElementName = (comp.pay_elements as any)?.name || 'Compensation';
            const payElementCode = (comp.pay_elements as any)?.code || 'COMP';
            
            // Get job title from the position linked to this compensation
            const jobTitle = (comp.positions as any)?.title || '';
            
            earningsBreakdown.push({
              name: payElementName,
              code: payElementCode,
              amount: calculatedAmount,
              type: payElementCode.toUpperCase() === 'SAL' ? 'base_salary' : 'additional',
              is_prorated: isProrated,
              proration_factor: prorationFactor,
              job_title: jobTitle,
              effective_start: comp.start_date || undefined,
              effective_end: comp.end_date || undefined,
              original_currency_id: wasConverted ? compCurrencyId : undefined,
              original_amount: wasConverted ? originalAmount : undefined,
              exchange_rate_used: wasConverted ? exchangeRateUsed ?? undefined : undefined,
            });
            
            // Base salary (SAL code) goes to regular_pay
            if (payElementCode.toUpperCase() === 'SAL') {
              regularPay += calculatedAmount;
            }
          }
        } else {
          // Fall back to position compensation with proration (for each position)
          for (const pos of employeePositions) {
            const posAmount = pos.compensation_amount || 0;
            const posFreq = pos.compensation_frequency || 'monthly';
            
            // Convert to period amount based on pay frequency
            let periodAmount = posAmount;
            let annualAmount = posAmount;
            switch (posFreq) {
              case 'annual': annualAmount = posAmount; break;
              case 'monthly': annualAmount = posAmount * 12; break;
              case 'weekly': annualAmount = posAmount * 52; break;
              case 'biweekly': 
              case 'fortnightly': annualAmount = posAmount * 26; break;
            }
            
            // Convert to pay period amount
            switch (payFrequency) {
              case 'monthly': periodAmount = annualAmount / 12; break;
              case 'biweekly':
              case 'fortnightly': periodAmount = annualAmount / 26; break;
              case 'weekly': periodAmount = annualAmount / 52; break;
              case 'semimonthly': periodAmount = annualAmount / 24; break;
              default: periodAmount = annualAmount / 12; break;
            }
            
            // Calculate proration for THIS position based on its own start/end dates
            let proratedAmount = periodAmount;
            let isProrated = false;
            let prorationFactor = 1;
            
            if (payPeriod?.period_start && payPeriod?.period_end) {
              const posStartDate = pos.start_date ? new Date(pos.start_date) : null;
              const posEndDate = pos.end_date ? new Date(pos.end_date) : null;
              
              const posProration = calculateProrationFactor({
                periodStart: new Date(payPeriod.period_start),
                periodEnd: new Date(payPeriod.period_end),
                employeeStartDate: posStartDate,
                employeeEndDate: posEndDate,
                prorationMethod: 'CALENDAR_DAYS',
              });
              
              isProrated = posProration.isProrated;
              prorationFactor = posProration.factor;
              if (posProration.isProrated) {
                proratedAmount = applyProration(periodAmount, posProration);
              }
            }
            
            // Apply currency conversion if position compensation is in foreign currency
            // Note: Position uses compensation_currency (text field) - need to look up currency ID
            const posCurrencyCode = pos.compensation_currency;
            let posCurrencyId: string | null = null;
            if (posCurrencyCode && posCurrencyCode !== currency) {
              // Look up currency ID by code
              const { data: currencyLookup } = await supabase
                .from("currencies")
                .select("id")
                .eq("code", posCurrencyCode)
                .single();
              posCurrencyId = currencyLookup?.id || null;
            }
            
            const originalAmount = proratedAmount;
            const { localAmount, exchangeRateUsed, wasConverted } = convertToLocalCurrency(proratedAmount, posCurrencyId);
            proratedAmount = localAmount;
            
            grossPay += proratedAmount;
            regularPay += proratedAmount;
            
            earningsBreakdown.push({
              name: (pos.position as any)?.title || 'Position Salary',
              code: 'SAL',
              amount: proratedAmount,
              type: 'base_salary',
              is_prorated: isProrated,
              proration_factor: prorationFactor,
              job_title: (pos.position as any)?.title || '',
              effective_start: pos.start_date || undefined,
              effective_end: pos.end_date || undefined,
              original_currency_id: wasConverted ? posCurrencyId ?? undefined : undefined,
              original_amount: wasConverted ? originalAmount : undefined,
              exchange_rate_used: wasConverted ? exchangeRateUsed ?? undefined : undefined,
            });
          }
        }
        
        // Add period allowances
        const { data: allowances } = await supabase
          .from("employee_period_allowances")
          .select("amount, allowance_name, is_taxable, currency")
          .eq("employee_id", emp.employee_id)
          .eq("pay_period_id", payPeriodId);
        
        for (const a of allowances || []) {
          const originalAmount = a.amount || 0;
          // Look up currency_id from the currency code text
          const allowanceCurrencyId = a.currency ? currencyCodeToIdMap.get(String(a.currency).toUpperCase()) || null : null;
          const { localAmount, exchangeRateUsed, wasConverted } = convertToLocalCurrency(originalAmount, allowanceCurrencyId);
          
          grossPay += localAmount;
          allowancesBreakdown.push({
            name: a.allowance_name || 'Allowance',
            amount: localAmount,
            is_taxable: a.is_taxable ?? true,
            original_amount: wasConverted ? originalAmount : undefined,
            original_currency: wasConverted ? a.currency : undefined,
            original_currency_id: wasConverted ? allowanceCurrencyId : undefined,
            exchange_rate_used: wasConverted ? exchangeRateUsed : undefined,
          });
        }
        
        // Add retroactive pay adjustments (if any pending)
        let retroactivePayTotal = 0;
        const retroactiveBreakdown: {
          config_name: string;
          pay_element_name: string;
          adjustment_amount: number;
          period_count: number;
        }[] = [];
        
        if (payGroupId) {
          const { fetchEmployeePendingRetro, markRetroAsProcessed } = await import("@/utils/payroll/retroactivePayService");
          const pendingRetro = await fetchEmployeePendingRetro(emp.employee_id, payGroupId, {
            runType: runType,
            payPeriodId: payPeriodId,
          });
          
          if (pendingRetro.total > 0) {
            retroactivePayTotal = pendingRetro.total;
            retroactiveBreakdown.push(...pendingRetro.items);
            grossPay += retroactivePayTotal;
            
            // Mark these retro calculations as processed
            await markRetroAsProcessed(emp.employee_id, payGroupId, payrollRunId);
          }
        }
        
        // Add approved expense claims as non-taxable reimbursements
        let expenseReimbursementTotal = 0;
        const expenseClaimsBreakdown: {
          claim_id: string;
          claim_number: string;
          claim_date: string;
          amount: number;
          description: string | null;
        }[] = [];
        
        const { data: pendingExpenseClaims } = await supabase
          .from("expense_claims")
          .select("id, claim_number, claim_date, total_amount, description, currency")
          .eq("employee_id", emp.employee_id)
          .eq("pay_period_id", payPeriodId)
          .eq("status", "pending_payment");
        
        for (const claim of pendingExpenseClaims || []) {
          const claimAmount = Number(claim.total_amount) || 0;
          // Convert expense claim to local currency if needed
          const claimCurrencyId = claim.currency ? currencyCodeToIdMap.get(String(claim.currency).toUpperCase()) || null : null;
          const { localAmount, exchangeRateUsed, wasConverted } = convertToLocalCurrency(claimAmount, claimCurrencyId);
          
          expenseReimbursementTotal += localAmount;
          expenseClaimsBreakdown.push({
            claim_id: claim.id,
            claim_number: claim.claim_number,
            claim_date: claim.claim_date,
            amount: localAmount,
            description: claim.description,
          });
        }
        
        // Add expense reimbursements to gross pay (non-taxable)
        grossPay += expenseReimbursementTotal;
        
        // Add period deductions (non-statutory)
        const { data: periodDeductions } = await supabase
          .from("employee_period_deductions")
          .select("amount, is_pretax, currency, deduction_name")
          .eq("employee_id", emp.employee_id)
          .eq("pay_period_id", payPeriodId);
        
        // Convert each period deduction to local currency
        const convertedPeriodDeductions = (periodDeductions || []).map((d: any) => {
          const deductionAmount = d.amount || 0;
          // Look up currency_id from the currency code text
          const deductionCurrencyId = d.currency ? currencyCodeToIdMap.get(String(d.currency).toUpperCase()) || null : null;
          const { localAmount, exchangeRateUsed, wasConverted } = convertToLocalCurrency(deductionAmount, deductionCurrencyId);
          return {
            ...d,
            original_amount: deductionAmount,
            original_currency: d.currency,
            original_currency_id: deductionCurrencyId,
            amount: localAmount,
            exchange_rate_used: wasConverted ? exchangeRateUsed : undefined,
            was_converted: wasConverted
          };
        });
        
        const totalPeriodDeductions = convertedPeriodDeductions.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
        const totalPretaxDeductions = convertedPeriodDeductions.reduce(
          (sum: number, d: any) => sum + (d.is_pretax ? (d.amount || 0) : 0),
          0
        );
        const taxableIncome = Math.max(0, grossPay - totalPretaxDeductions);
        // Calculate benefit deductions from active enrollments
        let benefitDeductions = 0;
        let employerBenefits = 0;
        
        const { data: benefitEnrollments } = await supabase
          .from("benefit_enrollments")
          .select(`
            id,
            plan_id,
            employee_contribution,
            employee_contribution_type,
            employer_contribution,
            employer_contribution_type,
            benefit_plan:benefit_plans!benefit_enrollments_plan_id_fkey(
              id,
              name,
              employee_contribution,
              employee_contribution_type,
              employer_contribution,
              employer_contribution_type
            )
          `)
          .eq("employee_id", emp.employee_id)
          .eq("status", "active")
          .lte("effective_date", payPeriod?.period_end || getTodayString())
          .or(`termination_date.is.null,termination_date.gte.${payPeriod?.period_start || getTodayString()}`);
        
        // Check if benefit plans have payroll mappings (only process mapped benefits)
        if (benefitEnrollments && benefitEnrollments.length > 0) {
          const planIds = benefitEnrollments.map((e: any) => e.plan_id);
          
          const { data: benefitMappings } = await supabase
            .from("benefit_payroll_mappings")
            .select("benefit_plan_id, mapping_type, pay_element_id")
            .in("benefit_plan_id", planIds)
            .eq("company_id", companyId)
            .eq("is_active", true)
            .lte("start_date", payPeriod?.period_end || getTodayString())
            .or(`end_date.is.null,end_date.gte.${payPeriod?.period_start || getTodayString()}`);
          
          const mappedPlanIds = new Set((benefitMappings || []).map((m: any) => m.benefit_plan_id));
          
          for (const enrollment of benefitEnrollments) {
            // Only process benefits that have payroll mappings
            if (!mappedPlanIds.has(enrollment.plan_id)) continue;
            
            const plan = enrollment.benefit_plan as any;
            
            // Use enrollment-level contribution if set, otherwise fall back to plan defaults
            const empContribType = enrollment.employee_contribution_type || plan?.employee_contribution_type || 'fixed';
            const empContribValue = enrollment.employee_contribution ?? plan?.employee_contribution ?? 0;
            const erContribType = enrollment.employer_contribution_type || plan?.employer_contribution_type || 'fixed';
            const erContribValue = enrollment.employer_contribution ?? plan?.employer_contribution ?? 0;
            
            // Calculate employee contribution
            if (empContribType === 'percentage') {
              benefitDeductions += grossPay * (empContribValue / 100);
            } else {
              benefitDeductions += empContribValue;
            }
            
            // Calculate employer contribution
            if (erContribType === 'percentage') {
              employerBenefits += grossPay * (erContribValue / 100);
            } else {
              employerBenefits += erContribValue;
            }
          }
        }
        
        // Calculate savings program deductions
        let savingsDeductions = 0;
        let employerSavingsContributions = 0;
        let savingsPretaxDeductions = 0;
        let savingsBreakdown: { name: string; code: string; employee_amount: number; employer_amount: number; is_pretax: boolean; category: string }[] = [];
        
        const savingsEnrollments = await fetchActiveSavingsEnrollments(
          emp.employee_id,
          companyId,
          payPeriod?.period_end || getTodayString()
        );
        
        if (savingsEnrollments.length > 0) {
          const savingsResult = calculateSavingsDeductions(savingsEnrollments, grossPay);
          savingsDeductions = savingsResult.total_employee_deductions;
          employerSavingsContributions = savingsResult.total_employer_contributions;
          savingsPretaxDeductions = savingsResult.total_pretax_deductions;
          savingsBreakdown = savingsResult.deductions.map(d => ({
            name: d.program_name,
            code: d.program_code,
            employee_amount: d.employee_amount,
            employer_amount: d.employer_amount,
            is_pretax: d.is_pretax,
            category: d.category,
          }));
        }
        
        // Calculate statutory deductions using shared calculator with cumulative PAYE
        // Adjust taxable income for pre-tax savings deductions
        let taxDeductions = 0;
        let employerTaxes = 0;
        let openingBalances = { ytdTaxableIncome: 0, ytdTaxPaid: 0 };
        const adjustedTaxableIncome = Math.max(0, taxableIncome - savingsPretaxDeductions);
        
        if (statutoryTypes && statutoryTypes.length > 0 && rateBands) {
          // Fetch opening balances for cumulative PAYE calculation
          openingBalances = await fetchOpeningBalances(emp.employee_id, taxYear);
          
          // Use the shared calculator that handles cumulative PAYE
          const statutoryResult = calculateStatutoryDeductions(
            adjustedTaxableIncome,
            statutoryTypes as StatutoryDeduction[],
            rateBands as StatutoryRateBand[],
            mondayCount,
            null, // employeeAge - not currently used
            openingBalances
          );
          
          taxDeductions = statutoryResult.totalEmployeeDeductions;
          employerTaxes = statutoryResult.totalEmployerContributions;
        }
        
        const totalDed = taxDeductions + totalPeriodDeductions + benefitDeductions + savingsDeductions;
        const netPay = grossPay - totalDed;
        const totalEmployerCost = grossPay + employerTaxes + employerBenefits + employerSavingsContributions;
        
        employeePayrolls.push({
          payroll_run_id: payrollRunId,
          employee_id: emp.employee_id,
          employee_position_id: emp.id,
          pay_period_id: payPeriodId,
          status: 'calculated',
          regular_hours: 160,
          gross_pay: grossPay,
          regular_pay: regularPay,
          total_deductions: totalDed,
          tax_deductions: taxDeductions,
          benefit_deductions: benefitDeductions,
          other_deductions: totalPeriodDeductions + savingsDeductions,
          retirement_deductions: savingsDeductions,
          net_pay: netPay,
          employer_taxes: employerTaxes,
          employer_benefits: employerBenefits,
          employer_retirement: employerSavingsContributions,
          total_employer_cost: totalEmployerCost,
          currency: currency,
          calculation_details: {
            earnings: earningsBreakdown,
            allowances: allowancesBreakdown,
            retroactive_pay: retroactiveBreakdown.length > 0 ? {
              total: retroactivePayTotal,
              items: retroactiveBreakdown,
            } : undefined,
            expense_reimbursements: expenseClaimsBreakdown.length > 0 ? {
              total: expenseReimbursementTotal,
              claims: expenseClaimsBreakdown,
            } : undefined,
            statutory_deductions: statutoryTypes && rateBands ? 
              calculateStatutoryDeductions(
                adjustedTaxableIncome,
                statutoryTypes as StatutoryDeduction[],
                rateBands as StatutoryRateBand[],
                mondayCount,
                null,
                openingBalances
              ).deductions.map(d => ({
                name: d.name,
                code: d.code,
                employee_amount: d.employeeAmount,
                employer_amount: d.employerAmount,
                method: d.calculationMethod
              })) : [],
            period_deductions: convertedPeriodDeductions.map((d: any) => ({
              name: d.deduction_name || 'Deduction',
              amount: d.amount || 0,
              is_pretax: d.is_pretax,
              original_amount: d.original_amount,
              original_currency: d.original_currency,
              original_currency_id: d.original_currency_id,
              exchange_rate_used: d.exchange_rate_used,
              was_converted: d.was_converted
            })),
            savings_deductions: savingsBreakdown.length > 0 ? {
              total_employee: savingsDeductions,
              total_employer: employerSavingsContributions,
              items: savingsBreakdown,
            } : undefined,
            taxable_income: adjustedTaxableIncome,
            pretax_deductions: totalPretaxDeductions + savingsPretaxDeductions,
          },
        });
        
        totalGross += grossPay;
        totalNet += netPay;
        totalDeductions += totalDed;
        totalTaxes += taxDeductions;
        totalEmployerTaxes += employerTaxes;
        totalEmployerBenefits += employerBenefits + employerSavingsContributions;
      }
      
      // Insert employee payroll records
      if (employeePayrolls.length > 0) {
        const { error: insertError } = await supabase
          .from("employee_payroll")
          .insert(employeePayrolls as any);
        if (insertError) throw insertError;
      }
      
      // Update run totals with completion time and local currency
      await supabase.from("payroll_runs").update({
        status: 'calculated',
        total_gross_pay: totalGross,
        total_net_pay: totalNet,
        total_deductions: totalDeductions,
        total_taxes: totalTaxes,
        total_employer_taxes: totalEmployerTaxes,
        total_employer_contributions: totalEmployerBenefits,
        employee_count: employeePayrolls.length,
        currency: currency,
        local_currency_id: localCurrencyId,
        calculated_at: new Date().toISOString(),
      }).eq("id", payrollRunId);
      
      toast.success(`Calculated payroll for ${employeePayrolls.length} employees`);
      return true;
    } catch (err: any) {
      await supabase.from("payroll_runs").update({ status: 'failed' }).eq("id", payrollRunId);
      toast.error(err.message || "Failed to calculate payroll");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Recalculate payroll (for calculated status only, or approved with supervisor approval)
  const recalculatePayroll = async (payrollRunId: string, companyId: string, payPeriodId: string, payGroupId?: string) => {
    setIsLoading(true);
    try {
      // Delete existing employee_payroll records for this run
      await supabase.from("employee_payroll").delete().eq("payroll_run_id", payrollRunId);
      
      // Reset run to calculating state
      await supabase.from("payroll_runs").update({
        status: 'calculating',
        calculation_started_at: new Date().toISOString(),
        recalculation_approved_at: null,
        recalculation_approved_by: null,
      }).eq("id", payrollRunId);
      
      // Run calculation again
      return await calculatePayroll(payrollRunId, companyId, payPeriodId, payGroupId);
    } catch (err: any) {
      toast.error(err.message || "Failed to recalculate payroll");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Request recalculation approval (for approved runs)
  const requestRecalculationApproval = async (payrollRunId: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("payroll_runs").update({
        recalculation_requested_by: user?.id,
      }).eq("id", payrollRunId);
      
      toast.success("Recalculation request submitted for supervisor approval");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to request recalculation");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Approve recalculation (supervisor function)
  const approveRecalculation = async (payrollRunId: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("payroll_runs").update({
        recalculation_approved_by: user?.id,
        recalculation_approved_at: new Date().toISOString(),
        status: 'calculated', // Reset to calculated so recalculation can proceed
      }).eq("id", payrollRunId);
      
      toast.success("Recalculation approved");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to approve recalculation");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reopen payroll (unlock employees for changes)
  const reopenPayroll = async (payrollRunId: string) => {
    setIsLoading(true);
    try {
      await unlockEmployeesForPayroll(payrollRunId);
      
      await supabase.from("payroll_runs").update({
        status: 'draft',
      }).eq("id", payrollRunId);
      
      // Delete existing calculations
      await supabase.from("employee_payroll").delete().eq("payroll_run_id", payrollRunId);
      
      toast.success("Payroll reopened for changes");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to reopen payroll");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch employee payroll records
  const fetchEmployeePayroll = async (payrollRunId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("employee_payroll")
        .select(`
          *,
          employee:profiles!employee_payroll_employee_id_fkey(id, full_name, email)
        `)
        .eq("payroll_run_id", payrollRunId)
        .order("created_at");
      
      if (error) throw error;
      
      // Map the data to match EmployeePayroll interface
      return (data || []).map((item: any) => ({
        ...item,
        employee: item.employee,
        position: undefined // Position will be fetched separately if needed
      })) as EmployeePayroll[];
    } catch (err: any) {
      toast.error("Failed to fetch employee payroll");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Approve payroll
  const approvePayroll = async (payrollRunId: string) => {
    setIsLoading(true);
    try {
      // Get payroll run details including pay group
      const { data: runData, error: runFetchError } = await supabase
        .from("payroll_runs")
        .select("pay_group_id, company_id, run_number")
        .eq("id", payrollRunId)
        .single();
      
      if (runFetchError) throw runFetchError;
      
      const { error } = await supabase.from("payroll_runs").update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      }).eq("id", payrollRunId);
      
      if (error) throw error;
      
      // Update employee records
      await supabase.from("employee_payroll").update({
        status: 'approved'
      }).eq("payroll_run_id", payrollRunId);
      
      toast.success("Payroll approved");
      
      // Auto-generate GL entries if GL is configured for the pay group
      if (runData?.pay_group_id && runData?.company_id) {
        const { data: payGroupData } = await supabase
          .from("pay_groups")
          .select("gl_configured")
          .eq("id", runData.pay_group_id)
          .single();
        
        if (payGroupData?.gl_configured) {
          try {
            // Check if GL already calculated
            const { data: existingBatch } = await supabase
              .from("gl_journal_batches")
              .select("id")
              .eq("payroll_run_id", payrollRunId)
              .limit(1);
            
            if (!existingBatch || existingBatch.length === 0) {
              // Dynamically import to avoid circular dependencies
              const { useGLCalculation } = await import("@/hooks/useGLCalculation");
              
              // Fetch mappings and create entries directly
              const { data: mappings } = await supabase
                .from("gl_account_mappings")
                .select("*")
                .eq("company_id", runData.company_id)
                .eq("is_active", true);
              
              if (mappings && mappings.length > 0) {
                // Fetch payroll totals
                const { data: empPayrolls } = await supabase
                  .from("employee_payroll")
                  .select("gross_pay, net_pay, tax_deductions, benefit_deductions, employer_taxes, employer_benefits, employer_retirement, calculation_details")
                  .eq("payroll_run_id", payrollRunId);
                
                const totals = (empPayrolls || []).reduce(
                  (acc: any, emp: any) => {
                    const calcDetails = emp.calculation_details as any;
                    const savingsDeductions = calcDetails?.savings_deductions || {};
                    return {
                      grossPay: acc.grossPay + (emp.gross_pay || 0),
                      netPay: acc.netPay + (emp.net_pay || 0),
                      taxDeductions: acc.taxDeductions + (emp.tax_deductions || 0),
                      benefitDeductions: acc.benefitDeductions + (emp.benefit_deductions || 0),
                      employerTaxes: acc.employerTaxes + (emp.employer_taxes || 0),
                      employerBenefits: acc.employerBenefits + (emp.employer_benefits || 0),
                      employerRetirement: acc.employerRetirement + (emp.employer_retirement || 0),
                      savingsEmployeeTotal: acc.savingsEmployeeTotal + (savingsDeductions.total_employee || 0),
                      savingsEmployerTotal: acc.savingsEmployerTotal + (savingsDeductions.total_employer || 0),
                    };
                  },
                  { grossPay: 0, netPay: 0, taxDeductions: 0, benefitDeductions: 0, employerTaxes: 0, employerBenefits: 0, employerRetirement: 0, savingsEmployeeTotal: 0, savingsEmployerTotal: 0 }
                );
                
                // Create batch
                const batchNumber = `PR-${runData.run_number}-${Date.now().toString(36).toUpperCase()}`;
                const { data: batch, error: batchError } = await supabase
                  .from("gl_journal_batches")
                  .insert({
                    company_id: runData.company_id,
                    batch_number: batchNumber,
                    batch_date: new Date().toISOString().split('T')[0],
                    payroll_run_id: payrollRunId,
                    description: `Auto-generated GL entries for payroll run ${runData.run_number}`,
                    status: "draft",
                    total_debits: 0,
                    total_credits: 0,
                  })
                  .select()
                  .single();
                
                if (!batchError && batch) {
                  const findMapping = (type: string) => mappings.find((m: any) => m.mapping_type === type);
                  const entries: any[] = [];
                  let entryNum = 1;
                  let totalDebits = 0;
                  let totalCredits = 0;
                  
                  const addEntry = (accountId: string | null, amount: number, isDebit: boolean, desc: string) => {
                    if (!accountId || amount <= 0) return;
                    entries.push({
                      batch_id: batch.id,
                      entry_number: entryNum++,
                      entry_date: batch.batch_date,
                      account_id: accountId,
                      debit_amount: isDebit ? amount : 0,
                      credit_amount: isDebit ? 0 : amount,
                      description: desc,
                      source_type: "payroll_run",
                      entry_type: isDebit ? 'debit' : 'credit',
                    });
                    if (isDebit) totalDebits += amount;
                    else totalCredits += amount;
                  };
                  
                  // Create entries
                  const grossMapping = findMapping("gross_pay") || findMapping("wages_expense");
                  const netMapping = findMapping("net_pay");
                  const taxLiabMapping = findMapping("tax_liability");
                  const empTaxMapping = findMapping("tax_expense");
                  const benLiabMapping = findMapping("benefit_liability");
                  const empBenMapping = findMapping("benefit_expense");
                  const savingsEmpMapping = findMapping("savings_employee_deduction");
                  const savingsErExpMapping = findMapping("savings_employer_contribution");
                  const savingsErLiabMapping = findMapping("savings_employer_liability");
                  
                  addEntry(grossMapping?.debit_account_id, totals.grossPay, true, "Gross payroll expense");
                  addEntry(empTaxMapping?.debit_account_id, totals.employerTaxes, true, "Employer tax expense");
                  addEntry(empBenMapping?.debit_account_id, totals.employerBenefits, true, "Employer benefit expense");
                  addEntry(savingsErExpMapping?.debit_account_id, totals.savingsEmployerTotal, true, "Employer savings match");
                  
                  addEntry(netMapping?.credit_account_id, totals.netPay, false, "Net pay payable");
                  addEntry(taxLiabMapping?.credit_account_id, totals.taxDeductions, false, "Tax withholdings");
                  addEntry(benLiabMapping?.credit_account_id, totals.benefitDeductions, false, "Benefit deductions");
                  addEntry(empTaxMapping?.credit_account_id || taxLiabMapping?.credit_account_id, totals.employerTaxes, false, "Employer taxes payable");
                  addEntry(empBenMapping?.credit_account_id || benLiabMapping?.credit_account_id, totals.employerBenefits, false, "Employer benefits payable");
                  addEntry(savingsEmpMapping?.credit_account_id, totals.savingsEmployeeTotal, false, "Employee savings");
                  addEntry(savingsErLiabMapping?.credit_account_id || savingsErExpMapping?.credit_account_id, totals.savingsEmployerTotal, false, "Employer savings payable");
                  
                  if (entries.length > 0) {
                    await supabase.from("gl_journal_entries").insert(entries);
                    await supabase.from("gl_journal_batches").update({
                      total_debits: totalDebits,
                      total_credits: totalCredits,
                    }).eq("id", batch.id);
                    
                    toast.success(`GL entries auto-generated: ${entries.length} entries`);
                  }
                }
              }
            }
          } catch (glErr) {
            console.error("Error auto-generating GL:", glErr);
            // Don't fail the approval, just log the error
            toast.warning("Payroll approved but GL generation encountered an issue");
          }
        }
      }
      
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to approve payroll");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Process payment
  const processPayment = async (payrollRunId: string) => {
    setIsLoading(true);
    try {
      // Get payroll run details including company_id
      const { data: runData } = await supabase
        .from("payroll_runs")
        .select("pay_period_id, company_id")
        .eq("id", payrollRunId)
        .single();
      
      const { error } = await supabase.from("payroll_runs").update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      }).eq("id", payrollRunId);
      
      if (error) throw error;
      
      // Update employee records
      await supabase.from("employee_payroll").update({
        status: 'paid'
      }).eq("payroll_run_id", payrollRunId);
      
      // Mark expense claims as paid for this pay period
      if (runData?.pay_period_id) {
        await supabase.from("expense_claims").update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        }).eq("pay_period_id", runData.pay_period_id)
         .eq("status", "pending_payment");
      }
      
      // Create savings transactions for employees with savings enrollments
      if (runData?.company_id && runData?.pay_period_id) {
        // Get all employee payroll records for this run
        const { data: empPayrolls } = await supabase
          .from("employee_payroll")
          .select("id, employee_id, calculation_details")
          .eq("payroll_run_id", payrollRunId);
        
        if (empPayrolls && empPayrolls.length > 0) {
          // Build maps for savings transaction creation
          const employeePayrollMap = new Map<string, string>();
          const savingsDeductionsMap = new Map<string, EmployeeSavingsDeductions>();
          
          const { data: currentUser } = await supabase.auth.getUser();
          const processedBy = currentUser?.user?.id || '';
          
          for (const ep of empPayrolls) {
            employeePayrollMap.set(ep.employee_id, ep.id);
            
            // Check if this employee has savings deductions in calculation_details
            const calcDetails = ep.calculation_details as any;
            if (calcDetails?.savings_deductions?.items?.length > 0) {
              // Fetch enrollments to get enrollment IDs
              const enrollments = await fetchActiveSavingsEnrollments(
                ep.employee_id,
                runData.company_id,
                new Date().toISOString().split('T')[0]
              );
              
              if (enrollments.length > 0) {
                const deductions = calculateSavingsDeductions(enrollments, 0); // Amount already calculated
                // Override with actual amounts from calculation_details
                deductions.deductions = calcDetails.savings_deductions.items.map((item: any) => {
                  const enrollment = enrollments.find(e => e.program_type?.code === item.code);
                  return {
                    enrollment_id: enrollment?.id || '',
                    program_code: item.code,
                    program_name: item.name,
                    category: item.category,
                    employee_amount: item.employee_amount,
                    employer_amount: item.employer_amount,
                    is_pretax: item.is_pretax,
                    deduction_priority: 0,
                  };
                }).filter((d: any) => d.enrollment_id);
                
                deductions.total_employee_deductions = calcDetails.savings_deductions.total_employee || 0;
                deductions.total_employer_contributions = calcDetails.savings_deductions.total_employer || 0;
                
                if (deductions.deductions.length > 0) {
                  savingsDeductionsMap.set(ep.employee_id, deductions);
                }
              }
            }
          }
          
          // Create savings transactions
          if (savingsDeductionsMap.size > 0) {
            const txResult = await createSavingsTransactions(
              payrollRunId,
              runData.pay_period_id,
              runData.company_id,
              employeePayrollMap,
              savingsDeductionsMap,
              processedBy
            );
            
            if (txResult.success && txResult.transactionCount > 0) {
              console.log(`Created ${txResult.transactionCount} savings transactions`);
            } else if (!txResult.success) {
              console.error("Failed to create savings transactions:", txResult.error);
            }
          }
        }
      }
      
      toast.success("Payment processed");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Tax Configuration
  const fetchTaxConfig = async (companyId?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("payroll_tax_config")
        .select("*")
        .eq("is_active", true)
        .order("tax_type");
      
      if (companyId) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PayrollTaxConfig[];
    } catch (err: any) {
      toast.error("Failed to fetch tax configuration");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createTaxConfig = async (data: Partial<PayrollTaxConfig>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("payroll_tax_config").insert([data as any]);
      if (error) throw error;
      toast.success("Tax configuration created");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to create tax config");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaxConfig = async (id: string, data: Partial<PayrollTaxConfig>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("payroll_tax_config").update(data as any).eq("id", id);
      if (error) throw error;
      toast.success("Tax configuration updated");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update tax config");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTaxConfig = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("payroll_tax_config").delete().eq("id", id);
      if (error) throw error;
      toast.success("Tax configuration deleted");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete tax config");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Deduction Configuration
  const fetchDeductionConfig = async (companyId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("payroll_deduction_config")
        .select("*")
        .eq("company_id", companyId)
        .order("name");
      if (error) throw error;
      return data as PayrollDeductionConfig[];
    } catch (err: any) {
      toast.error("Failed to fetch deduction configuration");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createDeductionConfig = async (data: Partial<PayrollDeductionConfig>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("payroll_deduction_config").insert([data as any]);
      if (error) throw error;
      toast.success("Deduction configuration created");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to create deduction config");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeductionConfig = async (id: string, data: Partial<PayrollDeductionConfig>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("payroll_deduction_config").update(data as any).eq("id", id);
      if (error) throw error;
      toast.success("Deduction configuration updated");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update deduction config");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDeductionConfig = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("payroll_deduction_config").delete().eq("id", id);
      if (error) throw error;
      toast.success("Deduction configuration deleted");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete deduction config");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Payslips
  const fetchPayslips = async (employeeId?: string, companyId?: string, onlyPaid: boolean = true) => {
    setIsLoading(true);
    try {
      // First get payslips with employee_payroll join to check payroll run status
      let query = supabase
        .from("payslips")
        .select(`
          *,
          employee:profiles!payslips_employee_id_fkey(full_name, email),
          employee_payroll!inner(payroll_run_id, payroll_runs!inner(status))
        `)
        .eq("status", "active") // Only show active payslips (not recalled/superseded)
        .order("pay_date", { ascending: false });
      
      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }
      
      // For ESS, only show payslips from paid payroll runs
      if (onlyPaid) {
        query = query.eq("employee_payroll.payroll_runs.status", "paid");
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Payslip[];
    } catch (err: any) {
      toast.error("Failed to fetch payslips");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const generatePayslips = async (payrollRunId: string) => {
    setIsLoading(true);
    try {
      // Get employee payroll records
      const { data: empPayrolls, error: fetchError } = await supabase
        .from("employee_payroll")
        .select(`*, pay_period:pay_periods(*)`)
        .eq("payroll_run_id", payrollRunId);
      
      if (fetchError) throw fetchError;
      
      // Delete existing payslips for this payroll run to prevent duplicates
      const employeePayrollIds = empPayrolls?.map(ep => ep.id) || [];
      if (employeePayrollIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("payslips")
          .delete()
          .in("employee_payroll_id", employeePayrollIds);
        
        if (deleteError) {
          console.error("Error deleting existing payslips:", deleteError);
          // Continue anyway - insert might still work
        }
      }
      
      const payslips: Partial<Payslip>[] = [];
      
      for (const emp of empPayrolls || []) {
        payslips.push({
          employee_payroll_id: emp.id,
          employee_id: emp.employee_id,
          pay_period_start: emp.pay_period?.period_start,
          pay_period_end: emp.pay_period?.period_end,
          pay_date: emp.pay_period?.pay_date,
          gross_pay: emp.gross_pay,
          total_deductions: emp.total_deductions,
          net_pay: emp.net_pay,
          currency: emp.currency,
          payroll_run_id: payrollRunId,
          status: 'active',
        });
      }
      
      if (payslips.length > 0) {
        const { error } = await supabase.from("payslips").insert(payslips as any);
        if (error) throw error;
        
        // Update employee payroll records
        await supabase.from("employee_payroll").update({
          payslip_generated: true,
          payslip_generated_at: new Date().toISOString(),
        }).eq("payroll_run_id", payrollRunId);
      }
      
      toast.success(`Generated ${payslips.length} payslips`);
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to generate payslips");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Recall payslips for a payroll run
  const recallPayslips = async (payrollRunId: string, reason: string, userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("payslips")
        .update({
          status: 'recalled',
          recalled_at: new Date().toISOString(),
          recalled_by: userId,
          recall_reason: reason,
        } as any)
        .eq("payroll_run_id", payrollRunId)
        .eq("status", "active")
        .select();
      
      if (error) throw error;
      
      const count = data?.length || 0;
      toast.success(`Recalled ${count} payslips`);
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to recall payslips");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Bank File Configuration
  const fetchBankFileConfig = async (companyId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bank_file_config")
        .select("*")
        .eq("company_id", companyId)
        .order("bank_name");
      if (error) throw error;
      return data as BankFileConfig[];
    } catch (err: any) {
      toast.error("Failed to fetch bank file configuration");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createBankFileConfig = async (data: Partial<BankFileConfig>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("bank_file_config").insert([data as any]);
      if (error) throw error;
      toast.success("Bank file configuration created");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to create bank config");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Bank File
  const generateBankFile = async (payrollRunId: string, bankConfigId: string, companyId: string) => {
    setIsLoading(true);
    try {
      // Get payroll data
      const { data: empPayrolls, error: fetchError } = await supabase
        .from("employee_payroll")
        .select(`
          *,
          employee:profiles!employee_payroll_employee_id_fkey(
            id, full_name, email
          )
        `)
        .eq("payroll_run_id", payrollRunId)
        .eq("status", "approved");
      
      if (fetchError) throw fetchError;
      
      // Get bank accounts for employees
      const { data: bankAccounts } = await supabase
        .from("employee_bank_accounts")
        .select("*")
        .in("employee_id", (empPayrolls || []).map(e => e.employee_id))
        .eq("is_primary", true);
      
      const bankMap = new Map((bankAccounts || []).map(b => [b.employee_id, b]));
      
      // Generate CSV content (simplified)
      let csvContent = "Employee Name,Bank Name,Account Number,Routing Number,Amount\n";
      let totalAmount = 0;
      let recordCount = 0;
      
      for (const emp of empPayrolls || []) {
        const bank = bankMap.get(emp.employee_id);
        if (bank) {
          csvContent += `"${emp.employee?.full_name}","${bank.bank_name}","${bank.account_number}","${bank.routing_number || ''}",${emp.net_pay}\n`;
          totalAmount += emp.net_pay;
          recordCount++;
        }
      }
      
      // Save bank file generation record
      const { error } = await supabase.from("bank_file_generations").insert([{
        company_id: companyId,
        payroll_run_id: payrollRunId,
        bank_config_id: bankConfigId,
        file_name: `payroll_${getTodayString()}.csv`,
        file_content: csvContent,
        file_format: 'csv',
        total_amount: totalAmount,
        record_count: recordCount,
        status: 'generated',
      }]);
      
      if (error) throw error;
      
      // Update employee payroll records
      await supabase.from("employee_payroll").update({
        bank_file_generated: true,
      }).eq("payroll_run_id", payrollRunId);
      
      toast.success(`Bank file generated for ${recordCount} employees`);
      return csvContent;
    } catch (err: any) {
      toast.error(err.message || "Failed to generate bank file");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Year-End Processing
  const fetchYearEndProcessing = async (companyId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("payroll_year_end")
        .select("*")
        .eq("company_id", companyId)
        .order("tax_year", { ascending: false });
      if (error) throw error;
      return data as PayrollYearEnd[];
    } catch (err: any) {
      toast.error("Failed to fetch year-end processing");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createYearEndProcessing = async (data: Partial<PayrollYearEnd>) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase
        .from("payroll_year_end")
        .insert([data as any])
        .select()
        .single();
      if (error) throw error;
      toast.success("Year-end processing initiated");
      return result as PayrollYearEnd;
    } catch (err: any) {
      toast.error(err.message || "Failed to create year-end processing");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateYearEndProcessing = async (id: string, data: Partial<PayrollYearEnd>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("payroll_year_end").update(data as any).eq("id", id);
      if (error) throw error;
      toast.success("Year-end processing updated");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update year-end processing");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Payroll Analytics
  const fetchPayrollAnalytics = async (companyId: string, year?: number) => {
    setIsLoading(true);
    try {
      const targetYear = year || new Date().getFullYear();
      
      const { data: runs, error } = await supabase
        .from("payroll_runs")
        .select(`
          *,
          pay_period:pay_periods(period_start, period_end)
        `)
        .eq("company_id", companyId)
        .gte("created_at", `${targetYear}-01-01`)
        .lte("created_at", `${targetYear}-12-31`);
      
      if (error) throw error;
      
      const analytics = {
        totalPayrollRuns: runs?.length || 0,
        totalGrossPay: runs?.reduce((sum, r) => sum + (r.total_gross_pay || 0), 0) || 0,
        totalNetPay: runs?.reduce((sum, r) => sum + (r.total_net_pay || 0), 0) || 0,
        totalDeductions: runs?.reduce((sum, r) => sum + (r.total_deductions || 0), 0) || 0,
        totalTaxes: runs?.reduce((sum, r) => sum + (r.total_taxes || 0), 0) || 0,
        avgEmployeesPerRun: runs?.length ? Math.round(runs.reduce((sum, r) => sum + (r.employee_count || 0), 0) / runs.length) : 0,
        monthlyData: [] as { month: string; gross: number; net: number; taxes: number }[],
      };
      
      // Group by month
      const monthlyMap = new Map<string, { gross: number; net: number; taxes: number }>();
      for (const run of runs || []) {
        const month = run.pay_period?.period_start?.substring(0, 7) || run.created_at.substring(0, 7);
        const existing = monthlyMap.get(month) || { gross: 0, net: 0, taxes: 0 };
        monthlyMap.set(month, {
          gross: existing.gross + (run.total_gross_pay || 0),
          net: existing.net + (run.total_net_pay || 0),
          taxes: existing.taxes + (run.total_taxes || 0),
        });
      }
      
      analytics.monthlyData = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));
      
      return analytics;
    } catch (err: any) {
      toast.error("Failed to fetch payroll analytics");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    // Pay Period Schedules
    fetchPayPeriodSchedules,
    createPayPeriodSchedule,
    updatePayPeriodSchedule,
    deletePayPeriodSchedule,
    // Pay Periods
    fetchPayPeriods,
    createPayPeriod,
    updatePayPeriod,
    generatePayPeriods,
    // Payroll Runs
    fetchPayrollRuns,
    createPayrollRun,
    updatePayrollRun,
    calculatePayroll,
    recalculatePayroll,
    requestRecalculationApproval,
    approveRecalculation,
    reopenPayroll,
    approvePayroll,
    processPayment,
    // Locking
    lockEmployeesForPayroll,
    unlockEmployeesForPayroll,
    checkEmployeeLocked,
    // Employee Payroll
    fetchEmployeePayroll,
    // Tax Config
    fetchTaxConfig,
    createTaxConfig,
    updateTaxConfig,
    deleteTaxConfig,
    // Deduction Config
    fetchDeductionConfig,
    createDeductionConfig,
    updateDeductionConfig,
    deleteDeductionConfig,
    // Payslips
    fetchPayslips,
    generatePayslips,
    recallPayslips,
    // Bank Files
    fetchBankFileConfig,
    createBankFileConfig,
    generateBankFile,
    // Year End
    fetchYearEndProcessing,
    createYearEndProcessing,
    updateYearEndProcessing,
    // Analytics
    fetchPayrollAnalytics,
  };
}
