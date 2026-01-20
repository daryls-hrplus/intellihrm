import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendRequest {
  cycleId: string;
  targetAudience?: "all" | "participants" | "managers";
}

interface ResendResult {
  success: boolean;
  cycleId: string;
  cycleName: string;
  participantsNotified: number;
  managersNotified: number;
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

    // Get authorization header for user context
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { cycleId, targetAudience = "all" }: ResendRequest = await req.json();

    if (!cycleId) {
      return new Response(
        JSON.stringify({ success: false, error: "cycleId is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const result: ResendResult = {
      success: true,
      cycleId,
      cycleName: "",
      participantsNotified: 0,
      managersNotified: 0,
      errors: [],
    };

    console.log(`[resend-appraisal-notifications] Starting resend for cycle: ${cycleId}`);

    // 1. Validate cycle exists and is active
    const { data: cycle, error: cycleError } = await supabase
      .from("appraisal_cycles")
      .select(`
        id, 
        name, 
        company_id, 
        status, 
        start_date, 
        end_date, 
        evaluation_deadline
      `)
      .eq("id", cycleId)
      .single();

    if (cycleError || !cycle) {
      console.error(`[resend-appraisal-notifications] Cycle not found: ${cycleId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Cycle not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    result.cycleName = cycle.name;

    if (cycle.status !== "active") {
      return new Response(
        JSON.stringify({ success: false, error: `Cycle is ${cycle.status}. Only active cycles can have notifications resent.` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 2. Get all participants for this cycle
    const { data: participants, error: participantsError } = await supabase
      .from("appraisal_participants")
      .select(`
        id,
        employee_id,
        evaluator_id,
        status,
        profiles:employee_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("cycle_id", cycleId);

    if (participantsError) {
      console.error(`[resend-appraisal-notifications] Error fetching participants:`, participantsError);
      result.errors.push(`Failed to fetch participants: ${participantsError.message}`);
    }

    if (!participants || participants.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No participants found in this cycle" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`[resend-appraisal-notifications] Found ${participants.length} participants`);

    // 3. Send notifications to participants
    const now = new Date().toISOString();
    
    if (targetAudience === "all" || targetAudience === "participants") {
      for (const participant of participants) {
        const profile = participant.profiles as any;
        if (profile?.id) {
          const notificationTitle = "Reminder: Appraisal Cycle Active";
          const notificationMessage = `The appraisal cycle "${cycle.name}" is active. Please complete your self-assessment by ${cycle.evaluation_deadline || cycle.end_date}.`;
          
          const { error: notifError } = await supabase.from("notifications").insert({
            user_id: profile.id,
            title: notificationTitle,
            message: notificationMessage,
            type: "info",
            link: "/ess/appraisals",
          });

          if (!notifError) {
            result.participantsNotified++;
            
            // Log to reminder_delivery_log for HR tracking
            const recipientName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown';
            await supabase.from("reminder_delivery_log").insert({
              company_id: cycle.company_id,
              employee_id: profile.id,
              delivery_channel: 'in_app',
              recipient_email: profile.email,
              recipient_name: recipientName,
              subject: notificationTitle,
              body_preview: notificationMessage.substring(0, 200),
              status: 'delivered',
              sent_at: now,
              delivered_at: now,
              source_table: 'appraisal_cycles',
              source_record_id: cycleId,
              metadata: { 
                cycle_name: cycle.name, 
                notification_type: 'participant_reminder',
                deadline: cycle.evaluation_deadline || cycle.end_date
              }
            });
          } else {
            console.error(`[resend-appraisal-notifications] Failed to send to participant ${profile.id}:`, notifError);
          }
        }
      }
    }

    // 4. Send consolidated notification to each manager
    if (targetAudience === "all" || targetAudience === "managers") {
      // Group participants by evaluator
      const evaluatorGroups: Record<string, typeof participants> = {};
      
      for (const participant of participants) {
        const evaluatorId = participant.evaluator_id;
        if (evaluatorId) {
          if (!evaluatorGroups[evaluatorId]) {
            evaluatorGroups[evaluatorId] = [];
          }
          evaluatorGroups[evaluatorId].push(participant);
        }
      }

      for (const [evaluatorId, teamMembers] of Object.entries(evaluatorGroups)) {
        const memberNames = teamMembers
          .map(p => {
            const profile = p.profiles as any;
            return profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown';
          })
          .filter(Boolean)
          .join(", ");

        const managerTitle = "Reminder: Team Appraisals Pending";
        const managerMessage = `The appraisal cycle "${cycle.name}" is active. You have ${teamMembers.length} team member(s) to evaluate: ${memberNames}. Deadline: ${cycle.evaluation_deadline || cycle.end_date}.`;

        const { error: managerNotifError } = await supabase.from("notifications").insert({
          user_id: evaluatorId,
          title: managerTitle,
          message: managerMessage,
          type: "action_required",
          link: "/mss/appraisals",
        });

        if (!managerNotifError) {
          result.managersNotified++;
          
          // Log to reminder_delivery_log for HR tracking
          const { data: managerProfile } = await supabase
            .from("profiles")
            .select("email, first_name, last_name")
            .eq("id", evaluatorId)
            .single();
          
          const managerName = managerProfile 
            ? `${managerProfile.first_name || ''} ${managerProfile.last_name || ''}`.trim() 
            : 'Unknown';
          
          await supabase.from("reminder_delivery_log").insert({
            company_id: cycle.company_id,
            employee_id: evaluatorId,
            delivery_channel: 'in_app',
            recipient_email: managerProfile?.email,
            recipient_name: managerName,
            subject: managerTitle,
            body_preview: managerMessage.substring(0, 200),
            status: 'delivered',
            sent_at: now,
            delivered_at: now,
            source_table: 'appraisal_cycles',
            source_record_id: cycleId,
            metadata: { 
              cycle_name: cycle.name, 
              notification_type: 'manager_reminder',
              team_size: teamMembers.length,
              deadline: cycle.evaluation_deadline || cycle.end_date
            }
          });
        } else {
          console.error(`[resend-appraisal-notifications] Failed to send to manager ${evaluatorId}:`, managerNotifError);
        }
      }
    }

    console.log(`[resend-appraisal-notifications] Resend complete: ${result.participantsNotified} participants, ${result.managersNotified} managers`);

    // 5. Log the resend job
    await supabase.from("ai_scheduled_job_runs").insert({
      job_name: "resend-appraisal-notifications",
      job_type: "appraisal_notification_resend",
      status: result.errors.length > 0 ? "completed_with_errors" : "completed",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      metrics_generated: {
        cycleId: result.cycleId,
        cycleName: result.cycleName,
        participantsNotified: result.participantsNotified,
        managersNotified: result.managersNotified,
        targetAudience,
      },
      error_message: result.errors.length > 0 ? result.errors.join("; ") : null,
      triggered_by: "manual",
      triggered_by_user: userId,
      company_id: cycle.company_id,
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[resend-appraisal-notifications] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
