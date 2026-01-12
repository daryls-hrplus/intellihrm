import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CycleStatusResult {
  activated: number;
  completed: number;
  overdueParticipants: number;
  actionsExecuted: number;
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

    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();
    
    const result: CycleStatusResult = {
      activated: 0,
      completed: 0,
      overdueParticipants: 0,
      actionsExecuted: 0,
      errors: [],
    };

    // 1. Auto-activate cycles where start_date <= today and status is 'draft'
    const { data: cyclesToActivate, error: activateQueryError } = await supabase
      .from("appraisal_cycles")
      .select("id, name, company_id")
      .eq("status", "draft")
      .eq("auto_activate_enabled", true)
      .lte("start_date", today);

    if (activateQueryError) {
      result.errors.push(`Failed to query cycles for activation: ${activateQueryError.message}`);
    } else if (cyclesToActivate && cyclesToActivate.length > 0) {
      for (const cycle of cyclesToActivate) {
        const { error: updateError } = await supabase
          .from("appraisal_cycles")
          .update({ 
            status: "active", 
            auto_activated_at: now,
            updated_at: now 
          })
          .eq("id", cycle.id);

        if (updateError) {
          result.errors.push(`Failed to activate cycle ${cycle.id}: ${updateError.message}`);
        } else {
          result.activated++;
          
          // Create notification for HR
          await supabase.from("notifications").insert({
            title: "Appraisal Cycle Auto-Activated",
            message: `The appraisal cycle "${cycle.name}" has been automatically activated as the start date has been reached.`,
            type: "info",
            category: "performance",
            company_id: cycle.company_id,
          });
        }
      }
    }

    // 2. Auto-complete cycles where end_date < today and all participants are finalized
    const { data: cyclesToComplete, error: completeQueryError } = await supabase
      .from("appraisal_cycles")
      .select(`
        id, 
        name, 
        company_id,
        grace_period_days,
        end_date
      `)
      .eq("status", "active")
      .eq("auto_complete_enabled", true)
      .lt("end_date", today);

    if (completeQueryError) {
      result.errors.push(`Failed to query cycles for completion: ${completeQueryError.message}`);
    } else if (cyclesToComplete && cyclesToComplete.length > 0) {
      for (const cycle of cyclesToComplete) {
        // Check if grace period has passed
        const endDate = new Date(cycle.end_date);
        const graceDays = cycle.grace_period_days || 0;
        endDate.setDate(endDate.getDate() + graceDays);
        
        if (new Date() < endDate) {
          continue; // Still within grace period
        }

        // Check if all participants are finalized or force-close after grace period
        const { data: pendingParticipants, error: pendingError } = await supabase
          .from("appraisal_participants")
          .select("id")
          .eq("cycle_id", cycle.id)
          .not("status", "in", '("completed","finalized","cancelled")');

        if (pendingError) {
          result.errors.push(`Failed to check pending participants for cycle ${cycle.id}: ${pendingError.message}`);
          continue;
        }

        // Force-complete remaining participants
        if (pendingParticipants && pendingParticipants.length > 0) {
          await supabase
            .from("appraisal_participants")
            .update({ 
              status: "completed",
              is_overdue: true,
              updated_at: now 
            })
            .eq("cycle_id", cycle.id)
            .not("status", "in", '("completed","finalized","cancelled")');
        }

        // Complete the cycle
        const { error: completeError } = await supabase
          .from("appraisal_cycles")
          .update({ 
            status: "completed", 
            auto_completed_at: now,
            updated_at: now 
          })
          .eq("id", cycle.id);

        if (completeError) {
          result.errors.push(`Failed to complete cycle ${cycle.id}: ${completeError.message}`);
        } else {
          result.completed++;
          
          await supabase.from("notifications").insert({
            title: "Appraisal Cycle Auto-Completed",
            message: `The appraisal cycle "${cycle.name}" has been automatically completed as the end date (plus grace period) has passed.`,
            type: "info",
            category: "performance",
            company_id: cycle.company_id,
          });
        }
      }
    }

    // 3. Flag participants as overdue if evaluation_deadline or due_date has passed
    const { data: activeCycles, error: activeCyclesError } = await supabase
      .from("appraisal_cycles")
      .select("id, evaluation_deadline, company_id")
      .eq("status", "active");

    if (activeCyclesError) {
      result.errors.push(`Failed to query active cycles: ${activeCyclesError.message}`);
    } else if (activeCycles) {
      for (const cycle of activeCycles) {
        // Find participants who are overdue
        let query = supabase
          .from("appraisal_participants")
          .select("id, employee_id, due_date")
          .eq("cycle_id", cycle.id)
          .eq("is_overdue", false)
          .in("status", ["pending", "in_progress"]);

        const { data: participants, error: participantsError } = await query;

        if (participantsError) {
          result.errors.push(`Failed to query participants for cycle ${cycle.id}: ${participantsError.message}`);
          continue;
        }

        if (participants) {
          for (const participant of participants) {
            const dueDate = participant.due_date || cycle.evaluation_deadline;
            if (dueDate && new Date(dueDate) < new Date()) {
              // Mark as overdue
              const { error: overdueError } = await supabase
                .from("appraisal_participants")
                .update({ 
                  is_overdue: true,
                  overdue_notified_at: now,
                  updated_at: now 
                })
                .eq("id", participant.id);

              if (overdueError) {
                result.errors.push(`Failed to mark participant ${participant.id} as overdue: ${overdueError.message}`);
              } else {
                result.overdueParticipants++;
                
                // Notify employee and manager
                await supabase.from("notifications").insert({
                  user_id: participant.employee_id,
                  title: "Appraisal Evaluation Overdue",
                  message: "Your appraisal evaluation is overdue. Please complete it as soon as possible.",
                  type: "warning",
                  category: "performance",
                  company_id: cycle.company_id,
                });
              }
            }
          }
        }
      }
    }

    // 4. Execute pending action rules based on execute_after_days
    const { data: pendingActions, error: actionsError } = await supabase
      .from("appraisal_action_executions")
      .select(`
        id,
        participant_id,
        rule_id,
        triggered_at,
        appraisal_outcome_action_rules!inner(
          execute_after_days,
          auto_execute_on_date,
          action_type,
          action_config
        )
      `)
      .eq("status", "pending")
      .eq("appraisal_outcome_action_rules.auto_execute_on_date", true);

    if (actionsError) {
      result.errors.push(`Failed to query pending actions: ${actionsError.message}`);
    } else if (pendingActions) {
      for (const action of pendingActions) {
        const rule = action.appraisal_outcome_action_rules as any;
        const triggeredAt = new Date(action.triggered_at);
        const executeAfterDays = rule.execute_after_days || 0;
        triggeredAt.setDate(triggeredAt.getDate() + executeAfterDays);

        if (new Date() >= triggeredAt) {
          // Execute the action
          const { error: executeError } = await supabase
            .from("appraisal_action_executions")
            .update({ 
              status: "executed",
              executed_at: now,
              updated_at: now 
            })
            .eq("id", action.id);

          if (executeError) {
            result.errors.push(`Failed to execute action ${action.id}: ${executeError.message}`);
          } else {
            result.actionsExecuted++;
          }
        }
      }
    }

    // Log the job run
    await supabase.from("ai_scheduled_job_runs").insert({
      job_name: "appraisal-cycle-status",
      job_type: "appraisal_automation",
      status: result.errors.length > 0 ? "completed_with_errors" : "completed",
      started_at: now,
      completed_at: new Date().toISOString(),
      metrics_generated: result,
      error_message: result.errors.length > 0 ? result.errors.join("; ") : null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        results: result,
        message: `Processed: ${result.activated} activated, ${result.completed} completed, ${result.overdueParticipants} marked overdue, ${result.actionsExecuted} actions executed`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in process-appraisal-cycle-status:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
