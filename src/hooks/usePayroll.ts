import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      const { error } = await supabase.from("pay_periods").insert([data as any]);
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
      const { error } = await supabase.from("pay_periods").update(data as any).eq("id", id);
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
        
        periods.push({
          company_id: companyId,
          schedule_id: scheduleId,
          period_start: currentStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          pay_date: payDate.toISOString().split('T')[0],
          cutoff_date: new Date(payDate.getTime() - (schedule.cutoff_days_before_pay || 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'open',
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
      
      // Get currency code from local_currency_id
      let currency = 'USD';
      if (company?.local_currency_id) {
        const { data: currencyData } = await supabase
          .from("currencies")
          .select("code")
          .eq("id", company.local_currency_id)
          .single();
        currency = currencyData?.code || 'USD';
      }
      
      // Get pay period info for monday count
      const { data: payPeriod } = await supabase
        .from("pay_periods")
        .select("period_start, period_end, monday_count")
        .eq("id", payPeriodId)
        .single();
      
      const mondayCount = payPeriod?.monday_count || 4;
      
      // Get statutory deduction types for this country
      const { data: statutoryTypes } = await supabase
        .from('statutory_deduction_types')
        .select('*')
        .eq('country', countryCode)
        .lte('start_date', new Date().toISOString().split('T')[0])
        .or(`end_date.is.null,end_date.gte.${new Date().toISOString().split('T')[0]}`);
      
      // Get statutory rate bands
      const { data: rateBands } = await supabase
        .from('statutory_rate_bands')
        .select('*')
        .eq('is_active', true);
      
      // Get active employees with positions - filter by pay group if provided
      let empQuery = supabase
        .from("employee_positions")
        .select(`
          id,
          employee_id,
          position_id,
          employee:profiles!employee_positions_employee_id_fkey(id, full_name, email, company_id, pay_group_id),
          position:positions!employee_positions_position_id_fkey(id, title)
        `)
        .eq("is_active", true);
      
      const { data: employees, error: empError } = await empQuery;
      
      if (empError) throw empError;
      
      // Filter to only employees from this company and pay group
      const companyEmployees = (employees || []).filter((emp: any) => {
        if (emp.employee?.company_id !== companyId) return false;
        if (payGroupId && emp.employee?.pay_group_id !== payGroupId) return false;
        return true;
      });
      
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
      
      for (const emp of companyEmployees) {
        // Get compensation for this position
        const { data: compensation } = await supabase
          .from("position_compensation")
          .select(`*, pay_element:pay_elements(*)`)
          .eq("position_id", emp.position_id)
          .eq("is_active", true);
        
        let grossPay = 0;
        let regularPay = 0;
        
        for (const comp of compensation || []) {
          grossPay += comp.amount || 0;
          if (comp.pay_element?.element_type_id) {
            regularPay += comp.amount || 0;
          }
        }
        
        // Calculate statutory deductions based on company's country
        let taxDeductions = 0;
        let employerTaxes = 0;
        
        if (statutoryTypes && statutoryTypes.length > 0 && rateBands) {
          for (const statType of statutoryTypes) {
            const applicableBand = rateBands.find((band: any) => 
              band.statutory_type_id === statType.id &&
              (band.min_amount === null || grossPay >= band.min_amount) &&
              (band.max_amount === null || grossPay <= band.max_amount) &&
              band.is_active
            );

            if (!applicableBand) continue;

            const calcMethod = (applicableBand as any).calculation_method || 'percentage';

            switch (calcMethod) {
              case 'percentage':
                taxDeductions += grossPay * ((applicableBand as any).employee_rate || 0) / 100;
                employerTaxes += grossPay * ((applicableBand as any).employer_rate || 0) / 100;
                break;
              case 'per_monday':
                taxDeductions += mondayCount * ((applicableBand as any).per_monday_amount || 0);
                employerTaxes += mondayCount * ((applicableBand as any).employer_per_monday_amount || 0);
                break;
              case 'fixed':
                taxDeductions += (applicableBand as any).fixed_amount || 0;
                break;
            }
          }
        }
        
        const totalDed = taxDeductions;
        const netPay = grossPay - totalDed;
        
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
          benefit_deductions: 0,
          net_pay: netPay,
          employer_taxes: employerTaxes,
          currency: currency,
        });
        
        totalGross += grossPay;
        totalNet += netPay;
        totalDeductions += totalDed;
        totalTaxes += taxDeductions;
        totalEmployerTaxes += employerTaxes;
      }
      
      // Insert employee payroll records
      if (employeePayrolls.length > 0) {
        const { error: insertError } = await supabase
          .from("employee_payroll")
          .insert(employeePayrolls as any);
        if (insertError) throw insertError;
      }
      
      // Update run totals with completion time
      await supabase.from("payroll_runs").update({
        status: 'calculated',
        total_gross_pay: totalGross,
        total_net_pay: totalNet,
        total_deductions: totalDeductions,
        total_taxes: totalTaxes,
        total_employer_taxes: totalEmployerTaxes,
        employee_count: employeePayrolls.length,
        currency: currency,
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
      const { error } = await supabase.from("payroll_runs").update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      }).eq("id", payrollRunId);
      
      if (error) throw error;
      
      // Update employee records
      await supabase.from("employee_payroll").update({
        status: 'paid'
      }).eq("payroll_run_id", payrollRunId);
      
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
  const fetchPayslips = async (employeeId?: string, companyId?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("payslips")
        .select(`*, employee:profiles!payslips_employee_id_fkey(full_name, email)`)
        .order("pay_date", { ascending: false });
      
      if (employeeId) {
        query = query.eq("employee_id", employeeId);
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
        file_name: `payroll_${new Date().toISOString().split('T')[0]}.csv`,
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
