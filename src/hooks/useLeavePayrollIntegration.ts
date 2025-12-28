import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LeavePayrollTransaction {
  id: string;
  company_id: string;
  employee_id: string;
  pay_period_id: string;
  payroll_run_id: string | null;
  leave_request_id: string | null;
  leave_type_id: string;
  leave_payroll_mapping_id: string | null;
  transaction_type: 'unpaid_deduction' | 'paid_leave' | 'leave_buyout' | 'leave_encashment' | 'sick_leave_statutory';
  leave_days: number;
  leave_hours: number;
  daily_rate: number;
  hourly_rate: number;
  gross_amount: number;
  payment_percentage: number;
  net_amount: number;
  description: string | null;
  processed_at: string | null;
}

export interface LeavePayrollSummary {
  totalUnpaidDays: number;
  totalUnpaidDeduction: number;
  totalPaidLeaveDays: number;
  totalPaidLeaveAmount: number;
  transactions: LeaveTransaction[];
}

export interface LeaveTransaction {
  leaveRequestId: string | null;
  leaveTypeName: string;
  leaveTypeCode: string;
  isPaid: boolean;
  paymentMethod: string;
  days: number;
  dailyRate: number;
  grossAmount: number;
  paymentPercentage: number;
  netAmount: number;
  transactionType: string;
  description: string;
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  duration: number;
  status: string;
  leave_type?: {
    id: string;
    name: string;
    code: string;
    is_paid: boolean;
    payment_method: string;
  };
}

interface LeavePayrollMapping {
  id: string;
  company_id: string;
  leave_type_id: string;
  pay_element_id: string | null;
  payroll_code: string;
  mapping_type: string;
  is_active: boolean;
}

export function useLeavePayrollIntegration() {
  
  /**
   * Calculate leave impact on payroll for a specific employee in a pay period
   */
  const calculateLeaveImpact = async (
    companyId: string,
    employeeId: string,
    payPeriodStart: string,
    payPeriodEnd: string,
    dailyRate: number,
    hourlyRate: number = 0
  ): Promise<LeavePayrollSummary> => {
    const summary: LeavePayrollSummary = {
      totalUnpaidDays: 0,
      totalUnpaidDeduction: 0,
      totalPaidLeaveDays: 0,
      totalPaidLeaveAmount: 0,
      transactions: []
    };

    try {
      // Fetch approved leave requests that overlap with the pay period
      const { data: leaveRequests, error } = await supabase
        .from('leave_requests')
        .select(`
          id,
          employee_id,
          leave_type_id,
          start_date,
          end_date,
          duration,
          status,
          leave_type:leave_types(id, name, code, is_paid, payment_method)
        `)
        .eq('employee_id', employeeId)
        .eq('status', 'approved')
        .lte('start_date', payPeriodEnd)
        .gte('end_date', payPeriodStart);

      if (error) throw error;

      if (!leaveRequests || leaveRequests.length === 0) {
        return summary;
      }

      // Fetch leave payroll mappings for the company
      const leaveTypeIds = [...new Set(leaveRequests.map(lr => lr.leave_type_id))];
      const { data: mappings } = await supabase
        .from('leave_payroll_mappings')
        .select('*')
        .eq('company_id', companyId)
        .in('leave_type_id', leaveTypeIds)
        .eq('is_active', true)
        .lte('start_date', payPeriodEnd)
        .or(`end_date.is.null,end_date.gte.${payPeriodStart}`);

      const mappingsByLeaveType = new Map<string, LeavePayrollMapping>();
      (mappings || []).forEach((m: any) => {
        mappingsByLeaveType.set(m.leave_type_id, m);
      });

      // Fetch leave payment rules for tiered payments
      const { data: paymentRules } = await supabase
        .from('leave_payment_rules')
        .select(`
          id,
          leave_type_id,
          leave_payment_tiers(from_day, to_day, payment_percentage, sort_order)
        `)
        .eq('company_id', companyId)
        .in('leave_type_id', leaveTypeIds)
        .eq('is_active', true);

      const paymentRulesByLeaveType = new Map<string, any>();
      (paymentRules || []).forEach((r: any) => {
        paymentRulesByLeaveType.set(r.leave_type_id, r);
      });

      // Process each leave request
      for (const request of leaveRequests as unknown as LeaveRequest[]) {
        const leaveType = request.leave_type;
        if (!leaveType) continue;

        // Calculate days within the pay period
        const leaveStart = new Date(request.start_date);
        const leaveEnd = new Date(request.end_date);
        const periodStart = new Date(payPeriodStart);
        const periodEnd = new Date(payPeriodEnd);

        const effectiveStart = leaveStart > periodStart ? leaveStart : periodStart;
        const effectiveEnd = leaveEnd < periodEnd ? leaveEnd : periodEnd;

        // Calculate working days (simple calculation - could be enhanced with holiday calendar)
        let daysInPeriod = 0;
        const current = new Date(effectiveStart);
        while (current <= effectiveEnd) {
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysInPeriod++;
          }
          current.setDate(current.getDate() + 1);
        }

        if (daysInPeriod === 0) continue;

        const isPaid = leaveType.is_paid !== false;
        const paymentMethod = leaveType.payment_method || 'full_pay';
        const mapping = mappingsByLeaveType.get(request.leave_type_id);

        let paymentPercentage = 100;
        let transactionType: LeaveTransaction['transactionType'] = 'paid_leave';

        // Determine payment percentage based on payment method
        if (paymentMethod === 'unpaid' || !isPaid) {
          paymentPercentage = 0;
          transactionType = 'unpaid_deduction';
        } else if (paymentMethod === 'reduced_pay') {
          // Check for tiered payment rules
          const rule = paymentRulesByLeaveType.get(request.leave_type_id);
          if (rule && rule.leave_payment_tiers?.length > 0) {
            const tiers = rule.leave_payment_tiers.sort((a: any, b: any) => a.sort_order - b.sort_order);
            // Use first matching tier (simplified - would need cumulative tracking for accuracy)
            for (const tier of tiers) {
              if (daysInPeriod >= tier.from_day && (!tier.to_day || daysInPeriod <= tier.to_day)) {
                paymentPercentage = tier.payment_percentage;
                break;
              }
            }
          } else {
            paymentPercentage = 50; // Default reduced pay
          }
        } else if (paymentMethod === 'statutory') {
          transactionType = 'sick_leave_statutory';
          // Statutory sick pay would use country-specific rules
          paymentPercentage = 66; // Default statutory rate
        }

        const grossAmount = daysInPeriod * dailyRate;
        const netAmount = (grossAmount * paymentPercentage) / 100;
        const deductionAmount = grossAmount - netAmount;

        const transaction: LeaveTransaction = {
          leaveRequestId: request.id,
          leaveTypeName: leaveType.name,
          leaveTypeCode: leaveType.code,
          isPaid,
          paymentMethod,
          days: daysInPeriod,
          dailyRate,
          grossAmount,
          paymentPercentage,
          netAmount,
          transactionType,
          description: `${leaveType.name} (${daysInPeriod} days at ${paymentPercentage}%)`
        };

        summary.transactions.push(transaction);

        if (transactionType === 'unpaid_deduction' || paymentPercentage < 100) {
          summary.totalUnpaidDays += (paymentPercentage < 100) ? daysInPeriod * (1 - paymentPercentage / 100) : daysInPeriod;
          summary.totalUnpaidDeduction += deductionAmount;
        }

        if (paymentPercentage > 0) {
          summary.totalPaidLeaveDays += daysInPeriod * (paymentPercentage / 100);
          summary.totalPaidLeaveAmount += netAmount;
        }
      }

      return summary;
    } catch (error) {
      console.error('Error calculating leave impact:', error);
      return summary;
    }
  };

  /**
   * Save leave payroll transactions to database
   */
  const saveLeaveTransactions = async (
    companyId: string,
    employeeId: string,
    payPeriodId: string,
    payrollRunId: string | null,
    transactions: LeaveTransaction[],
    dailyRate: number,
    hourlyRate: number
  ): Promise<boolean> => {
    try {
      const records = transactions.map(t => ({
        company_id: companyId,
        employee_id: employeeId,
        pay_period_id: payPeriodId,
        payroll_run_id: payrollRunId,
        leave_request_id: t.leaveRequestId,
        leave_type_id: null, // Would need to fetch from leave_request
        transaction_type: t.transactionType,
        leave_days: t.days,
        leave_hours: t.days * 8, // Assuming 8-hour workday
        daily_rate: dailyRate,
        hourly_rate: hourlyRate,
        gross_amount: t.grossAmount,
        payment_percentage: t.paymentPercentage,
        net_amount: t.netAmount,
        description: t.description,
        processed_at: new Date().toISOString()
      }));

      if (records.length > 0) {
        const { error } = await supabase
          .from('leave_payroll_transactions')
          .insert(records);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error saving leave transactions:', error);
      return false;
    }
  };

  /**
   * Get leave transactions for a payroll run
   */
  const getLeaveTransactions = async (
    payrollRunId: string
  ): Promise<LeavePayrollTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('leave_payroll_transactions')
        .select('*')
        .eq('payroll_run_id', payrollRunId)
        .order('created_at');

      if (error) throw error;
      return (data || []) as LeavePayrollTransaction[];
    } catch (error) {
      console.error('Error fetching leave transactions:', error);
      return [];
    }
  };

  /**
   * Get leave summary for payroll simulation
   */
  const getLeavePayrollSummary = async (
    companyId: string,
    employeeId: string,
    payPeriodId: string
  ): Promise<{
    hasLeave: boolean;
    unpaidDays: number;
    unpaidDeduction: number;
    paidLeaveDays: number;
    leaveDetails: Array<{
      type: string;
      days: number;
      payment: number;
      isPaid: boolean;
    }>;
  }> => {
    try {
      // Get pay period dates
      const { data: payPeriod } = await supabase
        .from('pay_periods')
        .select('period_start, period_end')
        .eq('id', payPeriodId)
        .single();

      if (!payPeriod) {
        return { hasLeave: false, unpaidDays: 0, unpaidDeduction: 0, paidLeaveDays: 0, leaveDetails: [] };
      }

      // Get employee's daily rate from their primary position
      const { data: position } = await supabase
        .from('employee_positions')
        .select(`
          employee_compensation(
            base_salary,
            pay_frequency
          )
        `)
        .eq('employee_id', employeeId)
        .eq('is_primary', true)
        .eq('is_active', true)
        .single();

      let dailyRate = 0;
      if (position?.employee_compensation) {
        const comp = Array.isArray(position.employee_compensation) 
          ? position.employee_compensation[0] 
          : position.employee_compensation;
        if (comp) {
          const annualSalary = calculateAnnualSalary(comp.base_salary, comp.pay_frequency);
          dailyRate = annualSalary / 260; // Assuming 260 working days per year
        }
      }

      const summary = await calculateLeaveImpact(
        companyId,
        employeeId,
        payPeriod.period_start,
        payPeriod.period_end,
        dailyRate
      );

      return {
        hasLeave: summary.transactions.length > 0,
        unpaidDays: summary.totalUnpaidDays,
        unpaidDeduction: summary.totalUnpaidDeduction,
        paidLeaveDays: summary.totalPaidLeaveDays,
        leaveDetails: summary.transactions.map(t => ({
          type: t.leaveTypeName,
          days: t.days,
          payment: t.netAmount,
          isPaid: t.isPaid
        }))
      };
    } catch (error) {
      console.error('Error getting leave payroll summary:', error);
      return { hasLeave: false, unpaidDays: 0, unpaidDeduction: 0, paidLeaveDays: 0, leaveDetails: [] };
    }
  };

  return {
    calculateLeaveImpact,
    saveLeaveTransactions,
    getLeaveTransactions,
    getLeavePayrollSummary
  };
}

// Helper function to calculate annual salary from different frequencies
function calculateAnnualSalary(baseSalary: number, frequency: string): number {
  switch (frequency?.toLowerCase()) {
    case 'hourly':
      return baseSalary * 2080; // 40 hours * 52 weeks
    case 'daily':
      return baseSalary * 260;
    case 'weekly':
      return baseSalary * 52;
    case 'bi-weekly':
    case 'biweekly':
      return baseSalary * 26;
    case 'semi-monthly':
    case 'semimonthly':
      return baseSalary * 24;
    case 'monthly':
      return baseSalary * 12;
    case 'annually':
    case 'annual':
      return baseSalary;
    default:
      return baseSalary * 12; // Default to monthly
  }
}