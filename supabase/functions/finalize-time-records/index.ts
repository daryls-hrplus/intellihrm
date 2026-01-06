import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinalizeRequest {
  companyId: string;
  periodStart: string;
  periodEnd: string;
  departmentId?: string;
  employeeIds?: string[];
  timekeeperId: string;
  previewOnly?: boolean;
}

interface LeaveTransaction {
  employeeId: string;
  employeeName: string;
  leaveRequestId: string | null;
  leaveTypeId: string;
  leaveTypeName: string;
  days: number;
  paymentPercentage: number;
  grossAmount: number;
  netAmount: number;
  deductionAmount: number;
  transactionType: string;
}

interface FinalizationSummary {
  totalEmployees: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  absencesExcused: number;
  absencesUnexcused: number;
  leaveTransactions: LeaveTransaction[];
  validationErrors: string[];
  employees: {
    id: string;
    name: string;
    regularHours: number;
    overtimeHours: number;
    hasAbsences: boolean;
  }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: FinalizeRequest = await req.json();
    const { companyId, periodStart, periodEnd, departmentId, employeeIds, timekeeperId, previewOnly = false } = body;

    if (!companyId || !periodStart || !periodEnd || !timekeeperId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: companyId, periodStart, periodEnd, timekeeperId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Finalize request: company=${companyId}, period=${periodStart} to ${periodEnd}, preview=${previewOnly}`);

    // Build employee filter
    let employeeFilter = employeeIds || [];
    
    // If no specific employees, get all employees from department or company
    if (employeeFilter.length === 0) {
      if (departmentId) {
        const { data: deptEmployees } = await supabase
          .from('profiles')
          .select('id')
          .eq('company_id', companyId)
          .eq('department_id', departmentId);
        employeeFilter = (deptEmployees || []).map((e: any) => e.id);
      } else {
        // Get employees assigned to this timekeeper
        const { data: timekeeperEmployees } = await supabase.rpc('get_timekeeper_employees', {
          p_timekeeper_id: timekeeperId
        });
        employeeFilter = (timekeeperEmployees || []).map((e: any) => e.employee_id);
      }
    }

    if (employeeFilter.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No employees found for finalization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${employeeFilter.length} employees`);

    // Initialize summary
    const summary: FinalizationSummary = {
      totalEmployees: employeeFilter.length,
      totalRegularHours: 0,
      totalOvertimeHours: 0,
      absencesExcused: 0,
      absencesUnexcused: 0,
      leaveTransactions: [],
      validationErrors: [],
      employees: []
    };

    // Get time entries for the period
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_clock_entries')
      .select(`
        id, employee_id, clock_in, clock_out,
        override_clock_in, override_clock_out,
        payable_hours, payable_regular_hours, payable_overtime_hours,
        regular_hours, overtime_hours, total_hours,
        employee:profiles!time_clock_entries_employee_id_fkey(id, full_name)
      `)
      .in('employee_id', employeeFilter)
      .gte('clock_in', `${periodStart}T00:00:00`)
      .lte('clock_in', `${periodEnd}T23:59:59`);

    if (timeError) {
      console.error('Error fetching time entries:', timeError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch time entries' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get attendance exceptions for the period
    const { data: exceptions, error: excError } = await supabase
      .from('attendance_exceptions')
      .select('*')
      .in('employee_id', employeeFilter)
      .gte('exception_date', periodStart)
      .lte('exception_date', periodEnd);

    if (excError) {
      console.error('Error fetching exceptions:', excError);
    }

    // Get approved leave requests for the period
    const { data: leaveRequests, error: leaveError } = await supabase
      .from('leave_requests')
      .select(`
        id, employee_id, leave_type_id, start_date, end_date, duration, status,
        leave_type:leave_types(id, name, code, is_paid, payment_method),
        employee:profiles!leave_requests_employee_id_fkey(id, full_name)
      `)
      .in('employee_id', employeeFilter)
      .eq('status', 'approved')
      .lte('start_date', periodEnd)
      .gte('end_date', periodStart);

    if (leaveError) {
      console.error('Error fetching leave requests:', leaveError);
    }

    // Get employee salary info for leave calculations
    const { data: employeeInfo, error: empError } = await supabase
      .from('employee_salaries')
      .select(`
        id, employee_id, base_salary, currency, pay_frequency,
        employee:profiles!employee_salaries_employee_id_fkey(id, full_name)
      `)
      .in('employee_id', employeeFilter)
      .is('end_date', null);

    const salaryByEmployee = new Map<string, any>();
    (employeeInfo || []).forEach((sal: any) => {
      salaryByEmployee.set(sal.employee_id, sal);
    });

    // Process each employee
    const employeeEntriesMap = new Map<string, any[]>();
    (timeEntries || []).forEach((entry: any) => {
      const empId = entry.employee_id;
      if (!employeeEntriesMap.has(empId)) {
        employeeEntriesMap.set(empId, []);
      }
      employeeEntriesMap.get(empId)!.push(entry);
    });

    const employeeExceptionsMap = new Map<string, any[]>();
    (exceptions || []).forEach((exc: any) => {
      const empId = exc.employee_id;
      if (!employeeExceptionsMap.has(empId)) {
        employeeExceptionsMap.set(empId, []);
      }
      employeeExceptionsMap.get(empId)!.push(exc);
    });

    // Calculate hours for each employee
    for (const empId of employeeFilter) {
      const entries = employeeEntriesMap.get(empId) || [];
      const empExceptions = employeeExceptionsMap.get(empId) || [];
      
      let regularHours = 0;
      let overtimeHours = 0;
      let employeeName = 'Unknown';

      for (const entry of entries) {
        employeeName = entry.employee?.full_name || 'Unknown';
        regularHours += entry.payable_regular_hours || entry.regular_hours || 0;
        overtimeHours += entry.payable_overtime_hours || entry.overtime_hours || 0;
      }

      summary.totalRegularHours += regularHours;
      summary.totalOvertimeHours += overtimeHours;

      // Count absences
      const excusedAbs = empExceptions.filter((e: any) => 
        ['excused_absence', 'approved'].includes(e.status) || 
        e.exception_type === 'excused_absence'
      );
      const unexcusedAbs = empExceptions.filter((e: any) => 
        e.exception_type === 'unexcused_absence' || 
        (e.exception_type === 'absent' && e.status === 'pending')
      );

      summary.absencesExcused += excusedAbs.length;
      summary.absencesUnexcused += unexcusedAbs.length;

      summary.employees.push({
        id: empId,
        name: employeeName,
        regularHours,
        overtimeHours,
        hasAbsences: empExceptions.length > 0
      });

      // Check for validation issues
      if (regularHours === 0 && entries.length === 0) {
        summary.validationErrors.push(`${employeeName}: No time entries for period`);
      }
      
      const pendingExceptions = empExceptions.filter((e: any) => e.status === 'pending');
      if (pendingExceptions.length > 0) {
        summary.validationErrors.push(`${employeeName}: ${pendingExceptions.length} unresolved exceptions`);
      }
    }

    // Process leave requests for transactions
    for (const leave of (leaveRequests || [])) {
      const leaveType = leave.leave_type as any;
      const employee = leave.employee as any;
      const salary = salaryByEmployee.get(leave.employee_id);

      if (!leaveType) continue;

      // Calculate days within period
      const leaveStart = new Date(leave.start_date);
      const leaveEnd = new Date(leave.end_date);
      const pStart = new Date(periodStart);
      const pEnd = new Date(periodEnd);

      const effectiveStart = leaveStart > pStart ? leaveStart : pStart;
      const effectiveEnd = leaveEnd < pEnd ? leaveEnd : pEnd;

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

      // Calculate daily rate
      let dailyRate = 0;
      if (salary) {
        const annualSalary = toAnnualSalary(salary.base_salary, salary.pay_frequency);
        dailyRate = annualSalary / 260;
      }

      const isPaid = leaveType.is_paid !== false;
      const paymentMethod = leaveType.payment_method || 'full_pay';

      let paymentPercentage = 100;
      let transactionType = 'paid_leave';

      if (paymentMethod === 'unpaid' || !isPaid) {
        paymentPercentage = 0;
        transactionType = 'unpaid_deduction';
      } else if (paymentMethod === 'reduced_pay') {
        paymentPercentage = 50;
      } else if (paymentMethod === 'statutory') {
        transactionType = 'sick_leave_statutory';
        paymentPercentage = 66;
      }

      const grossAmount = daysInPeriod * dailyRate;
      const netAmount = (grossAmount * paymentPercentage) / 100;
      const deductionAmount = grossAmount - netAmount;

      summary.leaveTransactions.push({
        employeeId: leave.employee_id,
        employeeName: employee?.full_name || 'Unknown',
        leaveRequestId: leave.id,
        leaveTypeId: leaveType.id,
        leaveTypeName: leaveType.name,
        days: daysInPeriod,
        paymentPercentage,
        grossAmount,
        netAmount,
        deductionAmount,
        transactionType
      });
    }

    // If preview only, return summary
    if (previewOnly) {
      console.log('Preview mode - returning summary');
      return new Response(
        JSON.stringify({ 
          success: true, 
          preview: true,
          summary 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for validation errors
    if (summary.validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Validation errors found',
          validationErrors: summary.validationErrors,
          summary 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create finalization record
    const { data: finalization, error: finError } = await supabase
      .from('timekeeper_period_finalizations')
      .upsert({
        company_id: companyId,
        timekeeper_id: timekeeperId,
        period_start: periodStart,
        period_end: periodEnd,
        department_id: departmentId,
        employee_ids: employeeFilter,
        status: 'finalized',
        total_employees: summary.totalEmployees,
        total_regular_hours: summary.totalRegularHours,
        total_overtime_hours: summary.totalOvertimeHours,
        absences_excused: summary.absencesExcused,
        absences_unexcused: summary.absencesUnexcused,
        leave_transactions_created: summary.leaveTransactions.length,
        finalized_at: new Date().toISOString()
      }, {
        onConflict: 'company_id,period_start,period_end,department_id'
      })
      .select()
      .single();

    if (finError) {
      console.error('Error creating finalization record:', finError);
      return new Response(
        JSON.stringify({ error: 'Failed to create finalization record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Created finalization record:', finalization.id);

    // Update timesheet submissions with finalization info
    const { error: updateTimesheetError } = await supabase
      .from('timesheet_submissions')
      .update({
        finalized_at: new Date().toISOString(),
        finalized_by: timekeeperId,
        leave_sync_status: 'synced',
        leave_sync_at: new Date().toISOString()
      })
      .in('employee_id', employeeFilter)
      .gte('period_start', periodStart)
      .lte('period_end', periodEnd);

    if (updateTimesheetError) {
      console.log('No timesheets to update or error:', updateTimesheetError);
    }

    // Create leave payroll transactions
    if (summary.leaveTransactions.length > 0) {
      const leaveRecords = summary.leaveTransactions.map(t => ({
        company_id: companyId,
        employee_id: t.employeeId,
        leave_request_id: t.leaveRequestId,
        leave_type_id: t.leaveTypeId,
        transaction_type: t.transactionType,
        leave_days: t.days,
        leave_hours: t.days * 8,
        daily_rate: t.grossAmount / t.days,
        gross_amount: t.grossAmount,
        payment_percentage: t.paymentPercentage,
        net_amount: t.netAmount,
        description: `${t.leaveTypeName} (${t.days} days at ${t.paymentPercentage}%)`,
        processed_at: new Date().toISOString()
      }));

      const { error: leaveInsertError } = await supabase
        .from('leave_payroll_transactions')
        .insert(leaveRecords);

      if (leaveInsertError) {
        console.error('Error creating leave transactions:', leaveInsertError);
      } else {
        console.log(`Created ${leaveRecords.length} leave payroll transactions`);
      }
    }

    // Update attendance exceptions as processed
    if (exceptions && exceptions.length > 0) {
      const { error: updateExcError } = await supabase
        .from('attendance_exceptions')
        .update({
          payroll_processed: true,
          payroll_processed_at: new Date().toISOString()
        })
        .in('employee_id', employeeFilter)
        .gte('exception_date', periodStart)
        .lte('exception_date', periodEnd);

      if (updateExcError) {
        console.log('Error updating exceptions:', updateExcError);
      }
    }

    console.log('Finalization complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        finalizationId: finalization.id,
        summary,
        message: `Successfully finalized ${summary.totalEmployees} employees with ${summary.leaveTransactions.length} leave transactions`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Finalization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to convert salary to annual
function toAnnualSalary(baseSalary: number, frequency: string): number {
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
