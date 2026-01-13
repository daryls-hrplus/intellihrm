import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderResult {
  reminders24h: number;
  reminders48h: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    
    // Helper function to format time in company timezone
    const formatInTimezone = (date: Date, timezone: string): string => {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    };

    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    const result: ReminderResult = {
      reminders24h: 0,
      reminders48h: 0,
      errors: [],
    };

    // Get interviews scheduled within the next 24 hours that haven't had reminders sent
    const { data: interviews24h, error: interviews24hError } = await supabase
      .from("appraisal_interviews")
      .select(`
        id,
        scheduled_at,
        location,
        meeting_link,
        reminder_sent,
        appraisal_participants!inner(
          id,
          employee_id,
          manager_id,
          appraisal_cycles!inner(
            id,
            name,
            company_id
          )
        )
      `)
      .eq("status", "scheduled")
      .eq("reminder_sent", false)
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", in24Hours.toISOString());

    if (interviews24hError) {
      result.errors.push(`Failed to query 24h interviews: ${interviews24hError.message}`);
    } else if (interviews24h && interviews24h.length > 0) {
      for (const interview of interviews24h) {
        const participant = interview.appraisal_participants as any;
        const cycle = participant.appraisal_cycles;
        
        // Fetch company timezone
        const { data: company } = await supabase
          .from('companies')
          .select('timezone')
          .eq('id', cycle.company_id)
          .single();
        
        const timezone = company?.timezone || 'UTC';
        const scheduledTime = formatInTimezone(new Date(interview.scheduled_at), timezone);

        // Create notifications for employee
        const { error: employeeNotifError } = await supabase.from("notifications").insert({
          user_id: participant.employee_id,
          title: "Appraisal Interview Tomorrow",
          message: `Your appraisal interview for "${cycle.name}" is scheduled for ${scheduledTime}. ${interview.meeting_link ? `Join here: ${interview.meeting_link}` : interview.location ? `Location: ${interview.location}` : ""}`,
          type: "reminder",
          category: "performance",
          company_id: cycle.company_id,
          action_url: `/performance/appraisals`,
          delivery_timezone: timezone,
        });

        if (employeeNotifError) {
          result.errors.push(`Failed to notify employee for interview ${interview.id}: ${employeeNotifError.message}`);
        }

        // Create notifications for manager
        if (participant.manager_id) {
          const { error: managerNotifError } = await supabase.from("notifications").insert({
            user_id: participant.manager_id,
            title: "Appraisal Interview Tomorrow",
            message: `You have an appraisal interview scheduled for ${scheduledTime}. ${interview.meeting_link ? `Join here: ${interview.meeting_link}` : interview.location ? `Location: ${interview.location}` : ""}`,
            type: "reminder",
            category: "performance",
            company_id: cycle.company_id,
            action_url: `/performance/appraisals`,
            delivery_timezone: timezone,
          });

          if (managerNotifError) {
            result.errors.push(`Failed to notify manager for interview ${interview.id}: ${managerNotifError.message}`);
          }
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from("appraisal_interviews")
          .update({ reminder_sent: true })
          .eq("id", interview.id);

        if (updateError) {
          result.errors.push(`Failed to update reminder_sent for interview ${interview.id}: ${updateError.message}`);
        } else {
          result.reminders24h++;
        }
      }
    }

    // Get interviews scheduled within 24-48 hours for advance notice (optional 48h reminder)
    const { data: interviews48h, error: interviews48hError } = await supabase
      .from("appraisal_interviews")
      .select(`
        id,
        scheduled_at,
        location,
        meeting_link,
        appraisal_participants!inner(
          id,
          employee_id,
          manager_id,
          appraisal_cycles!inner(
            id,
            name,
            company_id
          )
        )
      `)
      .eq("status", "scheduled")
      .eq("reminder_sent", false)
      .gt("scheduled_at", in24Hours.toISOString())
      .lte("scheduled_at", in48Hours.toISOString());

    if (interviews48hError) {
      result.errors.push(`Failed to query 48h interviews: ${interviews48hError.message}`);
    } else if (interviews48h && interviews48h.length > 0) {
      for (const interview of interviews48h) {
        const participant = interview.appraisal_participants as any;
        const cycle = participant.appraisal_cycles;
        const scheduledTime = new Date(interview.scheduled_at).toLocaleString();

        // Create 48h advance reminder for employee
        await supabase.from("notifications").insert({
          user_id: participant.employee_id,
          title: "Upcoming Appraisal Interview",
          message: `Reminder: Your appraisal interview for "${cycle.name}" is scheduled in 2 days (${scheduledTime}). Please prepare your self-assessment.`,
          type: "info",
          category: "performance",
          company_id: cycle.company_id,
          action_url: `/performance/appraisals`,
        });

        result.reminders48h++;
      }
    }

    // Also check for cycles starting soon and send reminders
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const { data: upcomingCycles, error: cyclesError } = await supabase
      .from("appraisal_cycles")
      .select("id, name, start_date, company_id")
      .eq("status", "draft")
      .gte("start_date", now.toISOString().split("T")[0])
      .lte("start_date", in3Days.toISOString().split("T")[0]);

    if (!cyclesError && upcomingCycles && upcomingCycles.length > 0) {
      for (const cycle of upcomingCycles) {
        // Notify HR about upcoming cycle activation
        await supabase.from("notifications").insert({
          title: "Appraisal Cycle Starting Soon",
          message: `The appraisal cycle "${cycle.name}" is scheduled to start on ${cycle.start_date}. Ensure all participants are configured.`,
          type: "info",
          category: "performance",
          company_id: cycle.company_id,
        });
      }
    }

    // Check for cycles ending soon
    const { data: endingCycles, error: endingCyclesError } = await supabase
      .from("appraisal_cycles")
      .select(`
        id, 
        name, 
        end_date, 
        evaluation_deadline,
        company_id,
        appraisal_participants(
          id,
          employee_id,
          status
        )
      `)
      .eq("status", "active")
      .gte("end_date", now.toISOString().split("T")[0])
      .lte("end_date", in3Days.toISOString().split("T")[0]);

    if (!endingCyclesError && endingCycles && endingCycles.length > 0) {
      for (const cycle of endingCycles) {
        const participants = cycle.appraisal_participants as any[];
        const pendingParticipants = participants?.filter(
          (p) => p.status === "pending" || p.status === "in_progress"
        ) || [];

        if (pendingParticipants.length > 0) {
          // Notify pending participants
          for (const participant of pendingParticipants) {
            await supabase.from("notifications").insert({
              user_id: participant.employee_id,
              title: "Appraisal Cycle Ending Soon",
              message: `The appraisal cycle "${cycle.name}" is ending on ${cycle.end_date}. Please complete your evaluation before the deadline.`,
              type: "warning",
              category: "performance",
              company_id: cycle.company_id,
              action_url: `/performance/appraisals`,
            });
          }
        }
      }
    }

    // Log the job run
    await supabase.from("ai_scheduled_job_runs").insert({
      job_name: "appraisal-interview-reminders",
      job_type: "reminder",
      status: result.errors.length > 0 ? "completed_with_errors" : "completed",
      started_at: now.toISOString(),
      completed_at: new Date().toISOString(),
      metrics_generated: result,
      error_message: result.errors.length > 0 ? result.errors.join("; ") : null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        results: result,
        message: `Sent ${result.reminders24h} 24h reminders and ${result.reminders48h} 48h advance notices`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in process-appraisal-interview-reminders:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
