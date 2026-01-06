import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AbsenceResult {
  employeeId: string;
  employeeName: string;
  scheduleDate: string;
  shiftId: string;
  shiftName: string;
  scheduledStart: string;
  scheduledEnd: string;
  exceptionId?: string;
  status: 'new' | 'existing';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, targetDate, departmentId, createExceptions = true } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Default to yesterday if no date provided (allows time for all punches to come in)
    const checkDate = targetDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`Detecting absences for company ${companyId} on ${checkDate}`);

    // Get all scheduled shifts for the date
    let schedulesQuery = supabase
      .from('employee_schedules')
      .select(`
        id,
        employee_id,
        schedule_date,
        shift_id,
        status,
        shifts!inner(id, shift_name, start_time, end_time),
        profiles!employee_schedules_employee_id_fkey(id, full_name, email, department_id)
      `)
      .eq('company_id', companyId)
      .eq('schedule_date', checkDate)
      .eq('status', 'scheduled')
      .not('shift_id', 'is', null);

    if (departmentId) {
      schedulesQuery = schedulesQuery.eq('profiles.department_id', departmentId);
    }

    const { data: schedules, error: schedulesError } = await schedulesQuery;

    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError);
      throw schedulesError;
    }

    console.log(`Found ${schedules?.length || 0} scheduled shifts for ${checkDate}`);

    if (!schedules || schedules.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        date: checkDate,
        absencesDetected: 0,
        absences: [],
        message: 'No scheduled shifts found for this date'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all time clock entries for the date
    const dateStart = `${checkDate}T00:00:00.000Z`;
    const dateEnd = `${checkDate}T23:59:59.999Z`;

    const { data: punches, error: punchesError } = await supabase
      .from('time_clock_entries')
      .select('id, employee_id, clock_in, clock_out, shift_id')
      .eq('company_id', companyId)
      .gte('clock_in', dateStart)
      .lte('clock_in', dateEnd);

    if (punchesError) {
      console.error('Error fetching punches:', punchesError);
      throw punchesError;
    }

    console.log(`Found ${punches?.length || 0} punches for ${checkDate}`);

    // Get approved leaves for the date
    const { data: leaves, error: leavesError } = await supabase
      .from('leave_requests')
      .select('id, employee_id, status')
      .eq('company_id', companyId)
      .eq('status', 'approved')
      .lte('start_date', checkDate)
      .gte('end_date', checkDate);

    if (leavesError) {
      console.error('Error fetching leaves:', leavesError);
    }

    const employeesWithPunches = new Set(punches?.map(p => p.employee_id) || []);
    const employeesOnLeave = new Set(leaves?.map(l => l.employee_id) || []);

    // Get existing exceptions for the date
    const { data: existingExceptions, error: exceptionsError } = await supabase
      .from('attendance_exceptions')
      .select('id, employee_id, exception_type, shift_id')
      .eq('company_id', companyId)
      .eq('exception_date', checkDate)
      .in('exception_type', ['absent', 'no_show', 'unexcused_absence']);

    if (exceptionsError) {
      console.error('Error fetching existing exceptions:', exceptionsError);
    }

    const existingExceptionMap = new Map<string, string>();
    existingExceptions?.forEach(ex => {
      existingExceptionMap.set(`${ex.employee_id}_${ex.shift_id}`, ex.id);
    });

    const absences: AbsenceResult[] = [];
    const newExceptions: any[] = [];

    for (const schedule of schedules) {
      const employeeId = schedule.employee_id;
      const shift = schedule.shifts as any;
      const employee = schedule.profiles as any;

      if (!employee || !shift) continue;

      // Skip if employee has a punch for this date
      if (employeesWithPunches.has(employeeId)) {
        continue;
      }

      // Skip if employee is on approved leave
      if (employeesOnLeave.has(employeeId)) {
        console.log(`Employee ${employee.full_name} is on approved leave, skipping`);
        continue;
      }

      const exceptionKey = `${employeeId}_${shift.id}`;
      const existingExceptionId = existingExceptionMap.get(exceptionKey);

      // Build scheduled start/end datetime
      const scheduledStart = `${checkDate}T${shift.start_time}`;
      const scheduledEnd = `${checkDate}T${shift.end_time}`;

      if (existingExceptionId) {
        // Already have an exception for this
        absences.push({
          employeeId,
          employeeName: employee.full_name,
          scheduleDate: checkDate,
          shiftId: shift.id,
          shiftName: shift.shift_name,
          scheduledStart,
          scheduledEnd,
          exceptionId: existingExceptionId,
          status: 'existing'
        });
      } else {
        // New absence detected
        absences.push({
          employeeId,
          employeeName: employee.full_name,
          scheduleDate: checkDate,
          shiftId: shift.id,
          shiftName: shift.shift_name,
          scheduledStart,
          scheduledEnd,
          status: 'new'
        });

        if (createExceptions) {
          newExceptions.push({
            company_id: companyId,
            employee_id: employeeId,
            exception_date: checkDate,
            exception_type: 'absent',
            severity: 'critical',
            reason: `No punch recorded for scheduled shift: ${shift.shift_name}`,
            status: 'pending',
            shift_id: shift.id,
            schedule_id: schedule.id,
            scheduled_time: scheduledStart,
            variance_minutes: null,
            auto_resolved: false
          });
        }
      }
    }

    // Insert new exceptions
    if (newExceptions.length > 0 && createExceptions) {
      console.log(`Creating ${newExceptions.length} absence exceptions`);
      
      const { data: insertedExceptions, error: insertError } = await supabase
        .from('attendance_exceptions')
        .insert(newExceptions)
        .select('id, employee_id, shift_id');

      if (insertError) {
        console.error('Error inserting exceptions:', insertError);
        throw insertError;
      }

      // Update absence results with new exception IDs
      insertedExceptions?.forEach(ex => {
        const absence = absences.find(a => 
          a.employeeId === ex.employee_id && 
          a.shiftId === ex.shift_id && 
          a.status === 'new'
        );
        if (absence) {
          absence.exceptionId = ex.id;
        }
      });
    }

    const newCount = absences.filter(a => a.status === 'new').length;
    const existingCount = absences.filter(a => a.status === 'existing').length;

    console.log(`Absence detection complete: ${newCount} new, ${existingCount} existing`);

    return new Response(JSON.stringify({
      success: true,
      date: checkDate,
      absencesDetected: absences.length,
      newAbsences: newCount,
      existingAbsences: existingCount,
      absences,
      message: `Detected ${absences.length} absences (${newCount} new, ${existingCount} existing)`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in detect-absences:', error);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
