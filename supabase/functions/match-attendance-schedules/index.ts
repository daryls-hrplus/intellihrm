import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchResult {
  entryId: string;
  employeeId: string;
  matchedShiftId: string | null;
  matchQuality: 'exact' | 'close' | 'unmatched';
  exceptions: Exception[];
  regularHours: number;
  overtimeHours: number;
  breakMinutes: number;
}

interface Exception {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  scheduledTime: string | null;
  actualTime: string | null;
  varianceMinutes: number;
}

// Tolerance settings (in minutes)
const LATE_THRESHOLD = 5; // Grace period for clock-in
const EARLY_LEAVE_THRESHOLD = 5; // Grace period for clock-out
const CRITICAL_LATE_THRESHOLD = 15; // When late becomes critical
const BREAK_TOLERANCE = 10; // Tolerance for break duration
const SHIFT_MATCH_WINDOW = 120; // Max minutes away from shift to match

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, entryIds, processAll = false } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Processing schedule matching for company ${companyId}`);

    // Get unmatched entries
    let query = supabase
      .from('time_clock_entries')
      .select('*')
      .eq('company_id', companyId)
      .is('matched_at', null)
      .not('clock_in', 'is', null);

    if (entryIds && entryIds.length > 0) {
      query = query.in('id', entryIds);
    } else if (!processAll) {
      // Only process entries from the last 7 days by default
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query.gte('clock_in', sevenDaysAgo.toISOString());
    }

    const { data: entries, error: entriesError } = await query.limit(500);

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
      throw entriesError;
    }

    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No unmatched entries to process',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${entries.length} unmatched entries`);

    // Get unique employee IDs
    const employeeIds = [...new Set(entries.map(e => e.employee_id))];

    // Get all shifts for the company
    const { data: shifts } = await supabase
      .from('shifts')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true);

    // Get employee schedules (assignments)
    const { data: scheduleAssignments } = await supabase
      .from('schedule_assignments')
      .select('*, shift:shifts(*)')
      .eq('company_id', companyId)
      .in('employee_id', employeeIds);

    const results: MatchResult[] = [];
    const exceptionsToCreate: Omit<Exception & { 
      company_id: string;
      employee_id: string;
      time_entry_id: string;
      shift_id: string | null;
      exception_date: string;
      exception_type: string;
    }, 'type'>[] = [];

    for (const entry of entries) {
      const clockIn = new Date(entry.clock_in);
      const clockOut = entry.clock_out ? new Date(entry.clock_out) : null;
      const entryDate = clockIn.toISOString().split('T')[0];
      const dayOfWeek = clockIn.getDay();

      // Find matching shift
      let matchedShift = null;
      let matchQuality: 'exact' | 'close' | 'unmatched' = 'unmatched';
      let scheduledStart: Date | null = null;
      let scheduledEnd: Date | null = null;

      // First, check for specific schedule assignment for this employee on this date
      const employeeAssignments = (scheduleAssignments || []).filter(
        a => a.employee_id === entry.employee_id
      );

      for (const assignment of employeeAssignments) {
        if (!assignment.shift) continue;

        // Check if assignment is for this date
        const assignmentDate = new Date(assignment.date);
        if (assignmentDate.toISOString().split('T')[0] === entryDate) {
          const shiftStart = parseTimeToDate(assignment.shift.start_time, clockIn);
          const shiftEnd = parseTimeToDate(assignment.shift.end_time, clockIn);
          
          const startDiff = Math.abs((clockIn.getTime() - shiftStart.getTime()) / 60000);
          
          if (startDiff <= SHIFT_MATCH_WINDOW) {
            matchedShift = assignment.shift;
            scheduledStart = shiftStart;
            scheduledEnd = shiftEnd;
            matchQuality = startDiff <= LATE_THRESHOLD ? 'exact' : 'close';
            break;
          }
        }
      }

      // If no specific assignment, try to match by shift pattern
      if (!matchedShift && shifts) {
        for (const shift of shifts) {
          // Check if shift applies to this day
          const applicableDays = shift.applicable_days || [0, 1, 2, 3, 4, 5, 6];
          if (!applicableDays.includes(dayOfWeek)) continue;

          const shiftStart = parseTimeToDate(shift.start_time, clockIn);
          const shiftEnd = parseTimeToDate(shift.end_time, clockIn);
          
          const startDiff = Math.abs((clockIn.getTime() - shiftStart.getTime()) / 60000);
          
          if (startDiff <= SHIFT_MATCH_WINDOW) {
            matchedShift = shift;
            scheduledStart = shiftStart;
            scheduledEnd = shiftEnd;
            matchQuality = startDiff <= LATE_THRESHOLD ? 'exact' : 'close';
            break;
          }
        }
      }

      // Calculate hours
      let regularHours = 0;
      let overtimeHours = 0;
      let breakMinutes = entry.break_duration_minutes || 0;

      if (clockOut) {
        const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / 60000 - breakMinutes;
        const totalHours = totalMinutes / 60;

        // Standard work day is 8 hours
        const standardHours = matchedShift?.standard_hours || 8;
        regularHours = Math.min(totalHours, standardHours);
        overtimeHours = Math.max(0, totalHours - standardHours);
      }

      // Detect exceptions
      const exceptions: Exception[] = [];

      if (matchedShift && scheduledStart && scheduledEnd) {
        // Late arrival check
        const lateMinutes = (clockIn.getTime() - scheduledStart.getTime()) / 60000;
        if (lateMinutes > LATE_THRESHOLD) {
          exceptions.push({
            type: 'late_arrival',
            severity: lateMinutes > CRITICAL_LATE_THRESHOLD ? 'critical' : 'warning',
            scheduledTime: scheduledStart.toISOString(),
            actualTime: clockIn.toISOString(),
            varianceMinutes: Math.round(lateMinutes)
          });
        }

        // Early departure check
        if (clockOut) {
          const earlyMinutes = (scheduledEnd.getTime() - clockOut.getTime()) / 60000;
          if (earlyMinutes > EARLY_LEAVE_THRESHOLD) {
            exceptions.push({
              type: 'early_departure',
              severity: earlyMinutes > 30 ? 'critical' : 'warning',
              scheduledTime: scheduledEnd.toISOString(),
              actualTime: clockOut.toISOString(),
              varianceMinutes: Math.round(earlyMinutes)
            });
          }
        }

        // Break duration check
        const expectedBreak = matchedShift.break_duration_minutes || 0;
        if (expectedBreak > 0) {
          if (breakMinutes === 0 && clockOut) {
            exceptions.push({
              type: 'missing_break',
              severity: 'warning',
              scheduledTime: null,
              actualTime: null,
              varianceMinutes: expectedBreak
            });
          } else if (Math.abs(breakMinutes - expectedBreak) > BREAK_TOLERANCE) {
            exceptions.push({
              type: breakMinutes > expectedBreak ? 'long_break' : 'short_break',
              severity: 'info',
              scheduledTime: null,
              actualTime: null,
              varianceMinutes: breakMinutes - expectedBreak
            });
          }
        }

        // Overtime check
        if (overtimeHours > 0) {
          exceptions.push({
            type: 'overtime',
            severity: overtimeHours > 2 ? 'warning' : 'info',
            scheduledTime: scheduledEnd.toISOString(),
            actualTime: clockOut?.toISOString() || null,
            varianceMinutes: Math.round(overtimeHours * 60)
          });
        }
      } else if (!matchedShift && clockIn) {
        // Unscheduled work
        exceptions.push({
          type: 'unscheduled_work',
          severity: 'info',
          scheduledTime: null,
          actualTime: clockIn.toISOString(),
          varianceMinutes: 0
        });
      }

      // Missing clock-out check
      if (!clockOut) {
        const hoursAgo = (Date.now() - clockIn.getTime()) / 3600000;
        if (hoursAgo > 12) {
          exceptions.push({
            type: 'missed_punch',
            severity: 'critical',
            scheduledTime: scheduledEnd?.toISOString() || null,
            actualTime: null,
            varianceMinutes: Math.round(hoursAgo * 60)
          });
        }
      }

      // Update entry with match data
      await supabase
        .from('time_clock_entries')
        .update({
          shift_id: matchedShift?.id || null,
          matched_at: new Date().toISOString(),
          match_quality: matchQuality,
          scheduled_start: scheduledStart?.toISOString() || null,
          scheduled_end: scheduledEnd?.toISOString() || null,
          break_minutes_expected: matchedShift?.break_duration_minutes || null,
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          exceptions_detected: exceptions.map(e => e.type)
        })
        .eq('id', entry.id);

      // Create exception records
      for (const exception of exceptions) {
        exceptionsToCreate.push({
          company_id: companyId,
          employee_id: entry.employee_id,
          time_entry_id: entry.id,
          shift_id: matchedShift?.id || null,
          exception_date: entryDate,
          exception_type: exception.type,
          severity: exception.severity,
          scheduledTime: exception.scheduledTime,
          actualTime: exception.actualTime,
          varianceMinutes: exception.varianceMinutes
        });
      }

      results.push({
        entryId: entry.id,
        employeeId: entry.employee_id,
        matchedShiftId: matchedShift?.id || null,
        matchQuality,
        exceptions,
        regularHours,
        overtimeHours,
        breakMinutes
      });
    }

    // Batch insert exceptions
    if (exceptionsToCreate.length > 0) {
      const { error: exceptionsError } = await supabase
        .from('attendance_exceptions')
        .insert(exceptionsToCreate);

      if (exceptionsError) {
        console.error('Error creating exceptions:', exceptionsError);
      }
    }

    const summary = {
      processed: results.length,
      matched: results.filter(r => r.matchQuality !== 'unmatched').length,
      exactMatches: results.filter(r => r.matchQuality === 'exact').length,
      closeMatches: results.filter(r => r.matchQuality === 'close').length,
      unmatched: results.filter(r => r.matchQuality === 'unmatched').length,
      exceptionsCreated: exceptionsToCreate.length,
      exceptionsByType: exceptionsToCreate.reduce((acc, e) => {
        acc[e.exception_type] = (acc[e.exception_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    console.log('Processing complete:', summary);

    return new Response(JSON.stringify({ summary, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in match-attendance-schedules:', error);
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function parseTimeToDate(timeStr: string, referenceDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(referenceDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}
