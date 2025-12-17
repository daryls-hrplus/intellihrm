import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduleConfig {
  id: string;
  company_id: string;
  schedule_type: 'daily_accrual' | 'monthly_accrual' | 'year_end_rollover';
  is_enabled: boolean;
  run_time: string;
  run_day_of_month: number | null;
  notify_on_completion: boolean;
  notify_on_failure: boolean;
}

interface Employee {
  id: string;
  full_name: string;
  hire_date: string;
  company_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { schedule_type, company_id, force_run } = await req.json();
    console.log(`Processing leave schedules: type=${schedule_type}, company=${company_id}, force=${force_run}`);

    // Get schedules to process
    let query = supabase
      .from('leave_schedule_config')
      .select('*')
      .eq('is_enabled', true);

    if (schedule_type) {
      query = query.eq('schedule_type', schedule_type);
    }
    if (company_id) {
      query = query.eq('company_id', company_id);
    }

    const { data: schedules, error: scheduleError } = await query;
    
    if (scheduleError) {
      throw new Error(`Failed to fetch schedules: ${scheduleError.message}`);
    }

    console.log(`Found ${schedules?.length || 0} schedules to process`);

    const results = [];

    for (const schedule of (schedules || []) as ScheduleConfig[]) {
      // Create run record
      const { data: runRecord, error: runError } = await supabase
        .from('leave_schedule_runs')
        .insert({
          config_id: schedule.id,
          company_id: schedule.company_id,
          schedule_type: schedule.schedule_type,
          status: 'running'
        })
        .select()
        .single();

      if (runError) {
        console.error(`Failed to create run record: ${runError.message}`);
        continue;
      }

      try {
        let result;
        
        switch (schedule.schedule_type) {
          case 'daily_accrual':
            result = await processDailyAccrual(supabase, schedule);
            break;
          case 'monthly_accrual':
            result = await processMonthlyAccrual(supabase, schedule);
            break;
          case 'year_end_rollover':
            result = await processYearEndRollover(supabase, schedule);
            break;
        }

        // Update run record with success
        await supabase
          .from('leave_schedule_runs')
          .update({
            status: 'success',
            completed_at: new Date().toISOString(),
            employees_processed: result.employeesProcessed,
            records_created: result.recordsCreated,
            records_updated: result.recordsUpdated,
            details: result.details
          })
          .eq('id', runRecord.id);

        // Update config with last run info
        await supabase
          .from('leave_schedule_config')
          .update({
            last_run_at: new Date().toISOString(),
            last_run_status: 'success',
            last_run_message: `Processed ${result.employeesProcessed} employees`,
            next_run_at: calculateNextRun(schedule)
          })
          .eq('id', schedule.id);

        // Send notification if enabled
        if (schedule.notify_on_completion) {
          await sendNotification(supabase, schedule, 'success', result);
        }

        results.push({ schedule_id: schedule.id, status: 'success', result });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing schedule ${schedule.id}:`, error);

        // Update run record with failure
        await supabase
          .from('leave_schedule_runs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: errorMessage
          })
          .eq('id', runRecord.id);

        // Update config with failure
        await supabase
          .from('leave_schedule_config')
          .update({
            last_run_at: new Date().toISOString(),
            last_run_status: 'failed',
            last_run_message: errorMessage
          })
          .eq('id', schedule.id);

        // Send failure notification if enabled
        if (schedule.notify_on_failure) {
          await sendNotification(supabase, schedule, 'failed', { error: errorMessage });
        }

        results.push({ schedule_id: schedule.id, status: 'failed', error: errorMessage });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in process-leave-schedules:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processDailyAccrual(supabase: any, schedule: ScheduleConfig) {
  console.log(`Processing daily accrual for company ${schedule.company_id}`);
  
  // Get active employees
  const { data: employees, error: empError } = await supabase
    .from('profiles')
    .select('id, full_name, hire_date')
    .eq('company_id', schedule.company_id)
    .eq('is_active', true);

  if (empError) throw new Error(`Failed to fetch employees: ${empError.message}`);

  // Get daily accrual rules
  const { data: rules, error: rulesError } = await supabase
    .from('leave_accrual_rules')
    .select('*, leave_types(name)')
    .eq('company_id', schedule.company_id)
    .eq('accrual_frequency', 'daily')
    .eq('is_active', true);

  if (rulesError) throw new Error(`Failed to fetch rules: ${rulesError.message}`);

  let recordsCreated = 0;
  let recordsUpdated = 0;
  const currentYear = new Date().getFullYear();

  for (const employee of (employees || [])) {
    for (const rule of (rules || [])) {
      // Check if employee meets service requirements
      const yearsOfService = calculateYearsOfService(employee.hire_date);
      if (yearsOfService < rule.years_of_service_min) continue;
      if (rule.years_of_service_max && yearsOfService > rule.years_of_service_max) continue;

      // Accrue leave
      const { data: balance, error: balanceError } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('leave_type_id', rule.leave_type_id)
        .eq('year', currentYear)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') {
        console.error(`Error fetching balance: ${balanceError.message}`);
        continue;
      }

      const dailyAmount = rule.accrual_amount / 365;

      if (balance) {
        await supabase
          .from('leave_balances')
          .update({ balance: balance.balance + dailyAmount })
          .eq('id', balance.id);
        recordsUpdated++;
      } else {
        await supabase
          .from('leave_balances')
          .insert({
            employee_id: employee.id,
            company_id: schedule.company_id,
            leave_type_id: rule.leave_type_id,
            balance: dailyAmount,
            used: 0,
            pending: 0,
            carried_over: 0,
            year: currentYear
          });
        recordsCreated++;
      }
    }
  }

  return {
    employeesProcessed: employees?.length || 0,
    recordsCreated,
    recordsUpdated,
    details: { rulesApplied: rules?.length || 0 }
  };
}

async function processMonthlyAccrual(supabase: any, schedule: ScheduleConfig) {
  console.log(`Processing monthly accrual for company ${schedule.company_id}`);
  
  const { data: employees } = await supabase
    .from('profiles')
    .select('id, full_name, hire_date')
    .eq('company_id', schedule.company_id)
    .eq('is_active', true);

  const { data: rules } = await supabase
    .from('leave_accrual_rules')
    .select('*, leave_types(name)')
    .eq('company_id', schedule.company_id)
    .eq('accrual_frequency', 'monthly')
    .eq('is_active', true);

  let recordsCreated = 0;
  let recordsUpdated = 0;
  const currentYear = new Date().getFullYear();

  for (const employee of (employees || [])) {
    for (const rule of (rules || [])) {
      const yearsOfService = calculateYearsOfService(employee.hire_date);
      if (yearsOfService < rule.years_of_service_min) continue;
      if (rule.years_of_service_max && yearsOfService > rule.years_of_service_max) continue;

      const { data: balance } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('leave_type_id', rule.leave_type_id)
        .eq('year', currentYear)
        .single();

      if (balance) {
        await supabase
          .from('leave_balances')
          .update({ balance: balance.balance + rule.accrual_amount })
          .eq('id', balance.id);
        recordsUpdated++;
      } else {
        await supabase
          .from('leave_balances')
          .insert({
            employee_id: employee.id,
            company_id: schedule.company_id,
            leave_type_id: rule.leave_type_id,
            balance: rule.accrual_amount,
            used: 0,
            pending: 0,
            carried_over: 0,
            year: currentYear
          });
        recordsCreated++;
      }
    }
  }

  return {
    employeesProcessed: employees?.length || 0,
    recordsCreated,
    recordsUpdated,
    details: { rulesApplied: rules?.length || 0 }
  };
}

async function processYearEndRollover(supabase: any, schedule: ScheduleConfig) {
  console.log(`Processing year-end rollover for company ${schedule.company_id}`);
  
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // Get rollover rules
  const { data: rolloverRules } = await supabase
    .from('leave_rollover_rules')
    .select('*, leave_types(name)')
    .eq('company_id', schedule.company_id)
    .eq('is_active', true);

  // Get previous year balances
  const { data: previousBalances } = await supabase
    .from('leave_balances')
    .select('*, profiles(full_name)')
    .eq('company_id', schedule.company_id)
    .eq('year', previousYear);

  let recordsCreated = 0;
  let recordsUpdated = 0;
  const rolloverDetails: any[] = [];

  for (const balance of (previousBalances || [])) {
    const rule = (rolloverRules || []).find((r: any) => r.leave_type_id === balance.leave_type_id);
    
    let rolloverAmount = 0;
    if (rule) {
      const remainingBalance = balance.balance - balance.used;
      if (remainingBalance > 0) {
        rolloverAmount = Math.min(remainingBalance, rule.max_rollover_days || remainingBalance);
        if (rule.max_rollover_percentage) {
          const percentageLimit = (remainingBalance * rule.max_rollover_percentage) / 100;
          rolloverAmount = Math.min(rolloverAmount, percentageLimit);
        }
      }
    }

    // Check if new year balance exists
    const { data: newBalance } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', balance.employee_id)
      .eq('leave_type_id', balance.leave_type_id)
      .eq('year', currentYear)
      .single();

    if (newBalance) {
      await supabase
        .from('leave_balances')
        .update({ 
          carried_over: rolloverAmount,
          balance: newBalance.balance + rolloverAmount
        })
        .eq('id', newBalance.id);
      recordsUpdated++;
    } else {
      await supabase
        .from('leave_balances')
        .insert({
          employee_id: balance.employee_id,
          company_id: schedule.company_id,
          leave_type_id: balance.leave_type_id,
          balance: rolloverAmount,
          used: 0,
          pending: 0,
          carried_over: rolloverAmount,
          year: currentYear
        });
      recordsCreated++;
    }

    if (rolloverAmount > 0) {
      rolloverDetails.push({
        employee_id: balance.employee_id,
        leave_type_id: balance.leave_type_id,
        previous_balance: balance.balance - balance.used,
        rolled_over: rolloverAmount
      });
    }
  }

  return {
    employeesProcessed: new Set((previousBalances || []).map((b: any) => b.employee_id)).size,
    recordsCreated,
    recordsUpdated,
    details: { rolloverDetails, rulesApplied: rolloverRules?.length || 0 }
  };
}

function calculateYearsOfService(hireDate: string): number {
  if (!hireDate) return 0;
  const hire = new Date(hireDate);
  const now = new Date();
  return Math.floor((now.getTime() - hire.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function calculateNextRun(schedule: ScheduleConfig): string {
  const now = new Date();
  const [hours, minutes] = schedule.run_time.split(':').map(Number);
  
  const nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);

  if (schedule.schedule_type === 'monthly_accrual' && schedule.run_day_of_month) {
    nextRun.setDate(schedule.run_day_of_month);
    if (nextRun <= now) {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }
  } else if (schedule.schedule_type === 'year_end_rollover') {
    nextRun.setMonth(0);
    nextRun.setDate(1);
    if (nextRun <= now) {
      nextRun.setFullYear(nextRun.getFullYear() + 1);
    }
  } else {
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
  }

  return nextRun.toISOString();
}

async function sendNotification(supabase: any, schedule: ScheduleConfig, status: string, result: any) {
  // Get HR admins for this company
  const { data: admins } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('company_id', schedule.company_id)
    .eq('is_active', true);

  const { data: hrAdmins } = await supabase
    .from('user_roles')
    .select('user_id')
    .in('user_id', (admins || []).map((a: any) => a.id))
    .in('role', ['admin', 'hr_manager']);

  const hrAdminIds = (hrAdmins || []).map((r: any) => r.user_id);

  const typeLabels: Record<string, string> = {
    'daily_accrual': 'Daily Leave Accrual',
    'monthly_accrual': 'Monthly Leave Accrual',
    'year_end_rollover': 'Year-End Leave Rollover'
  };

  const title = status === 'success' 
    ? `${typeLabels[schedule.schedule_type]} Completed`
    : `${typeLabels[schedule.schedule_type]} Failed`;

  const message = status === 'success'
    ? `Successfully processed ${result.employeesProcessed} employees. ${result.recordsCreated} records created, ${result.recordsUpdated} records updated.`
    : `Processing failed: ${result.error}`;

  // Create notifications for all HR admins
  for (const adminId of hrAdminIds) {
    await supabase
      .from('notifications')
      .insert({
        user_id: adminId,
        title,
        message,
        type: status === 'success' ? 'info' : 'error',
        category: 'leave',
        link: '/leave/schedule-config'
      });
  }
}
