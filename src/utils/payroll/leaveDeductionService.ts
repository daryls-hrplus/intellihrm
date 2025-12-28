import { supabase } from "@/integrations/supabase/client";

export interface LeaveDeductionResult {
  totalUnpaidDays: number;
  totalUnpaidDeduction: number;
  totalPaidLeaveDays: number;
  transactions: LeaveDeductionItem[];
}

export interface LeaveDeductionItem {
  leaveRequestId: string | null;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  isPaid: boolean;
  paymentMethod: string;
  days: number;
  dailyRate: number;
  grossAmount: number;
  paymentPercentage: number;
  netAmount: number;
  deductionAmount: number;
  transactionType: string;
  description: string;
}

/**
 * Calculate leave deductions for an employee in a pay period
 */
export async function calculateLeaveDeductions(
  companyId: string,
  employeeId: string,
  payPeriodStart: string,
  payPeriodEnd: string,
  dailyRate: number
): Promise<LeaveDeductionResult> {
  const result: LeaveDeductionResult = {
    totalUnpaidDays: 0,
    totalUnpaidDeduction: 0,
    totalPaidLeaveDays: 0,
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

    if (error) {
      console.error('Error fetching leave requests:', error);
      return result;
    }

    if (!leaveRequests || leaveRequests.length === 0) {
      return result;
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

    const mappingsByLeaveType = new Map<string, any>();
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
    for (const request of leaveRequests) {
      const leaveType = request.leave_type as any;
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

      let paymentPercentage = 100;
      let transactionType = 'paid_leave';

      // Determine payment percentage based on payment method
      if (paymentMethod === 'unpaid' || !isPaid) {
        paymentPercentage = 0;
        transactionType = 'unpaid_deduction';
      } else if (paymentMethod === 'reduced_pay') {
        // Check for tiered payment rules
        const rule = paymentRulesByLeaveType.get(request.leave_type_id);
        if (rule && rule.leave_payment_tiers?.length > 0) {
          const tiers = rule.leave_payment_tiers.sort((a: any, b: any) => a.sort_order - b.sort_order);
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
        paymentPercentage = 66; // Default statutory rate
      }

      const grossAmount = daysInPeriod * dailyRate;
      const netAmount = (grossAmount * paymentPercentage) / 100;
      const deductionAmount = grossAmount - netAmount;

      const transaction: LeaveDeductionItem = {
        leaveRequestId: request.id,
        leaveTypeId: leaveType.id,
        leaveTypeName: leaveType.name,
        leaveTypeCode: leaveType.code,
        isPaid,
        paymentMethod,
        days: daysInPeriod,
        dailyRate,
        grossAmount,
        paymentPercentage,
        netAmount,
        deductionAmount,
        transactionType,
        description: `${leaveType.name} (${daysInPeriod} days at ${paymentPercentage}%)`
      };

      result.transactions.push(transaction);

      if (transactionType === 'unpaid_deduction' || paymentPercentage < 100) {
        result.totalUnpaidDays += (paymentPercentage < 100) ? daysInPeriod * (1 - paymentPercentage / 100) : daysInPeriod;
        result.totalUnpaidDeduction += deductionAmount;
      }

      if (paymentPercentage > 0) {
        result.totalPaidLeaveDays += daysInPeriod * (paymentPercentage / 100);
      }
    }

    return result;
  } catch (error) {
    console.error('Error calculating leave deductions:', error);
    return result;
  }
}

/**
 * Save leave payroll transactions to database
 */
export async function saveLeavePayrollTransactions(
  companyId: string,
  employeeId: string,
  payPeriodId: string,
  payrollRunId: string,
  transactions: LeaveDeductionItem[],
  dailyRate: number,
  hourlyRate: number = 0
): Promise<boolean> {
  try {
    if (transactions.length === 0) return true;

    const records = transactions.map(t => ({
      company_id: companyId,
      employee_id: employeeId,
      pay_period_id: payPeriodId,
      payroll_run_id: payrollRunId,
      leave_request_id: t.leaveRequestId,
      leave_type_id: t.leaveTypeId,
      transaction_type: t.transactionType,
      leave_days: t.days,
      leave_hours: t.days * 8,
      daily_rate: dailyRate,
      hourly_rate: hourlyRate,
      gross_amount: t.grossAmount,
      payment_percentage: t.paymentPercentage,
      net_amount: t.netAmount,
      description: t.description,
      processed_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('leave_payroll_transactions')
      .insert(records);

    if (error) {
      console.error('Error saving leave transactions:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving leave transactions:', error);
    return false;
  }
}

/**
 * Get daily rate from annual salary
 */
export function calculateDailyRate(annualSalary: number, workingDaysPerYear: number = 260): number {
  return annualSalary / workingDaysPerYear;
}

/**
 * Convert salary to annual based on frequency
 */
export function toAnnualSalary(baseSalary: number, frequency: string): number {
  switch (frequency?.toLowerCase()) {
    case 'hourly':
      return baseSalary * 2080;
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
      return baseSalary * 12;
  }
}