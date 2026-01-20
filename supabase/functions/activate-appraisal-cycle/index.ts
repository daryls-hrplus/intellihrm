import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivationRequest {
  cycleId: string;
  sendNotifications: boolean;
  lockGoals: boolean;
  createTasks: boolean;
}

interface ActivationResult {
  success: boolean;
  cycleId: string;
  cycleName: string;
  participantsNotified: number;
  managersNotified: number;
  goalsLocked: number;
  tasksCreated: number;
  reminderRulesTriggered: number;
  errors: string[];
  warnings: string[];
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

    const { 
      cycleId, 
      sendNotifications = true, 
      lockGoals = true,
      createTasks = true 
    }: ActivationRequest = await req.json();

    if (!cycleId) {
      return new Response(
        JSON.stringify({ success: false, error: "cycleId is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const now = new Date().toISOString();
    const result: ActivationResult = {
      success: true,
      cycleId,
      cycleName: "",
      participantsNotified: 0,
      managersNotified: 0,
      goalsLocked: 0,
      tasksCreated: 0,
      reminderRulesTriggered: 0,
      errors: [],
      warnings: [],
    };

    console.log(`[activate-appraisal-cycle] Starting activation for cycle: ${cycleId}`);

    // 1. Validate cycle exists and is in draft status
    const { data: cycle, error: cycleError } = await supabase
      .from("appraisal_cycles")
      .select(`
        id, 
        name, 
        company_id, 
        status, 
        start_date, 
        end_date, 
        evaluation_deadline,
        template_id
      `)
      .eq("id", cycleId)
      .single();

    if (cycleError || !cycle) {
      console.error(`[activate-appraisal-cycle] Cycle not found: ${cycleId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Cycle not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    result.cycleName = cycle.name;

    if (cycle.status !== "draft") {
      console.error(`[activate-appraisal-cycle] Cycle is not in draft status: ${cycle.status}`);
      return new Response(
        JSON.stringify({ success: false, error: `Cycle is already ${cycle.status}. Only draft cycles can be activated.` }),
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
          email,
          company_id
        )
      `)
      .eq("cycle_id", cycleId);

    if (participantsError) {
      console.error(`[activate-appraisal-cycle] Error fetching participants:`, participantsError);
      result.errors.push(`Failed to fetch participants: ${participantsError.message}`);
    }

    const participantCount = participants?.length || 0;
    console.log(`[activate-appraisal-cycle] Found ${participantCount} participants`);

    if (participantCount === 0) {
      result.warnings.push("No participants enrolled in this cycle. Consider adding participants before activation.");
    }

    // 3. Update cycle status to active with activation metadata
    const { error: updateError } = await supabase
      .from("appraisal_cycles")
      .update({
        status: "active",
        activated_at: now,
        activated_by: userId,
        updated_at: now,
      })
      .eq("id", cycleId);

    if (updateError) {
      console.error(`[activate-appraisal-cycle] Error updating cycle status:`, updateError);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to activate cycle: ${updateError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`[activate-appraisal-cycle] Cycle status updated to active`);

    // 4. Update all participants to 'pending' status with due date
    if (participants && participants.length > 0) {
      const dueDate = cycle.evaluation_deadline || cycle.end_date;
      
      const { error: participantUpdateError } = await supabase
        .from("appraisal_participants")
        .update({
          status: "pending",
          due_date: dueDate,
          updated_at: now,
        })
        .eq("cycle_id", cycleId)
        .eq("status", "draft");

      if (participantUpdateError) {
        result.errors.push(`Failed to update participant statuses: ${participantUpdateError.message}`);
      } else {
        result.tasksCreated = participants.filter(p => (p as any).status === "draft").length;
      }
    }

    // 5. Send notifications to participants and managers
    if (sendNotifications && participants && participants.length > 0) {
      // Group participants by evaluator for manager notifications
      const evaluatorGroups: Record<string, typeof participants> = {};
      
      for (const participant of participants) {
        const evaluatorId = participant.evaluator_id;
        if (evaluatorId) {
          if (!evaluatorGroups[evaluatorId]) {
            evaluatorGroups[evaluatorId] = [];
          }
          evaluatorGroups[evaluatorId].push(participant);
        }

        // Send individual notification to each participant
        const profile = participant.profiles as any;
        if (profile?.id) {
          const { error: notifError } = await supabase.from("notifications").insert({
            user_id: profile.id,
            title: "Appraisal Cycle Started",
            message: `The appraisal cycle "${cycle.name}" has started. Please complete your self-assessment by ${cycle.evaluation_deadline || cycle.end_date}.`,
            type: "info",
            link: "/ess/appraisals",
          });

          if (!notifError) {
            result.participantsNotified++;
          } else {
            console.error(`[activate-appraisal-cycle] Failed to send notification to participant ${profile.id}:`, notifError);
          }
        }
      }

      // Send consolidated notification to each manager
      for (const [evaluatorId, teamMembers] of Object.entries(evaluatorGroups)) {
        const memberNames = teamMembers
          .map(p => {
            const profile = p.profiles as any;
            return profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown';
          })
          .filter(Boolean)
          .join(", ");

        const { error: managerNotifError } = await supabase.from("notifications").insert({
          user_id: evaluatorId,
          title: "Team Appraisals Ready for Evaluation",
          message: `The appraisal cycle "${cycle.name}" has started. You have ${teamMembers.length} team member(s) to evaluate: ${memberNames}. Deadline: ${cycle.evaluation_deadline || cycle.end_date}.`,
          type: "action_required",
          link: "/mss/appraisals",
        });

        if (!managerNotifError) {
          result.managersNotified++;
        } else {
          console.error(`[activate-appraisal-cycle] Failed to send notification to manager ${evaluatorId}:`, managerNotifError);
        }
      }

      console.log(`[activate-appraisal-cycle] Notifications sent: ${result.participantsNotified} participants, ${result.managersNotified} managers`);
    }

    // 6. Trigger reminder rules for APPRAISAL_CYCLE_ACTIVATED event
    const { data: reminderRules, error: reminderError } = await supabase
      .from("reminder_rules")
      .select(`
        id,
        rule_name,
        event_type_id,
        reminder_event_types!inner(code)
      `)
      .eq("company_id", cycle.company_id)
      .eq("is_active", true)
      .not("effective_from", "is", null);

    if (!reminderError && reminderRules) {
      const activationRules = reminderRules.filter(
        (r: any) => r.reminder_event_types?.code === "APPRAISAL_CYCLE_ACTIVATED"
      );
      
      result.reminderRulesTriggered = activationRules.length;
      console.log(`[activate-appraisal-cycle] Found ${activationRules.length} reminder rules to trigger`);
      
      // The reminder rules will be processed by the existing process-reminders edge function
      // which runs on a schedule. We just log that they exist.
    }

    // 7. Check for goal locking rules (on_cycle_freeze trigger)
    if (lockGoals) {
      const { data: lockingRules, error: lockingError } = await supabase
        .from("goal_locking_rules")
        .select("id, rule_name, trigger_type, target_status")
        .eq("company_id", cycle.company_id)
        .eq("is_active", true)
        .eq("trigger_type", "on_cycle_freeze");

      if (!lockingError && lockingRules && lockingRules.length > 0) {
        console.log(`[activate-appraisal-cycle] Found ${lockingRules.length} goal locking rules`);
        
        // Lock goals for the cycle's performance period
        const { data: lockedGoals, error: lockError } = await supabase
          .from("goals")
          .update({
            is_locked: true,
            lock_reason: `Locked by appraisal cycle: ${cycle.name}`,
            locked_at: now,
            locked_by: userId,
            updated_at: now,
          })
          .eq("company_id", cycle.company_id)
          .eq("is_locked", false)
          .gte("target_date", cycle.start_date)
          .lte("target_date", cycle.end_date)
          .select("id");

        if (lockError) {
          result.errors.push(`Failed to lock goals: ${lockError.message}`);
        } else {
          result.goalsLocked = lockedGoals?.length || 0;
          console.log(`[activate-appraisal-cycle] Locked ${result.goalsLocked} goals`);
        }
      }
    }

    // 8. Log HR-level activation (skip notification without user_id as it's required)
    console.log(`[activate-appraisal-cycle] HR notification skipped (requires specific user_id). Cycle ${cycle.name} activated with ${participantCount} participants.`);

    // 9. Log the activation job
    await supabase.from("ai_scheduled_job_runs").insert({
      job_name: "activate-appraisal-cycle",
      job_type: "appraisal_activation",
      status: result.errors.length > 0 ? "completed_with_errors" : "completed",
      started_at: now,
      completed_at: new Date().toISOString(),
      metrics_generated: {
        cycleId: result.cycleId,
        cycleName: result.cycleName,
        participantsNotified: result.participantsNotified,
        managersNotified: result.managersNotified,
        goalsLocked: result.goalsLocked,
        tasksCreated: result.tasksCreated,
        reminderRulesTriggered: result.reminderRulesTriggered,
      },
      error_message: result.errors.length > 0 ? result.errors.join("; ") : null,
      triggered_by: "manual",
      triggered_by_user: userId,
      company_id: cycle.company_id,
    });

    console.log(`[activate-appraisal-cycle] Activation complete for cycle: ${cycle.name}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[activate-appraisal-cycle] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
