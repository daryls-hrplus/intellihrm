import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowInstance {
  id: string;
  template_id: string;
  current_step_id: string | null;
  current_step_order: number;
  current_step_started_at: string | null;
  current_step_deadline_at: string | null;
  sla_status: string;
  initiated_by: string;
  company_id: string;
  metadata: Record<string, unknown>;
}

interface WorkflowStep {
  id: string;
  template_id: string;
  step_order: number;
  name: string;
  escalation_hours: number | null;
  expiration_days: number | null;
  sla_warning_hours: number | null;
  sla_critical_hours: number | null;
  escalation_action: string | null;
  alternate_approver_id: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const results = {
      processed: 0,
      escalated: 0,
      expired: 0,
      warnings_sent: 0,
      errors: [] as string[],
    };

    // Get all active workflow instances with pending status
    const { data: instances, error: instancesError } = await supabase
      .from("workflow_instances")
      .select(`
        id,
        template_id,
        current_step_id,
        current_step_order,
        current_step_started_at,
        current_step_deadline_at,
        sla_status,
        initiated_by,
        company_id,
        metadata
      `)
      .eq("status", "pending");

    if (instancesError) {
      throw new Error(`Failed to fetch instances: ${instancesError.message}`);
    }

    if (!instances || instances.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending workflows to process", results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process each instance
    for (const instance of instances as WorkflowInstance[]) {
      try {
        results.processed++;

        // Get the current step configuration
        const { data: step, error: stepError } = await supabase
          .from("workflow_steps")
          .select("*")
          .eq("template_id", instance.template_id)
          .eq("step_order", instance.current_step_order)
          .single();

        if (stepError || !step) {
          results.errors.push(`Instance ${instance.id}: Step not found`);
          continue;
        }

        const workflowStep = step as WorkflowStep;
        const stepStartedAt = instance.current_step_started_at 
          ? new Date(instance.current_step_started_at) 
          : null;

        if (!stepStartedAt) {
          // Initialize step start time if not set
          await supabase
            .from("workflow_instances")
            .update({ 
              current_step_started_at: now.toISOString(),
              current_step_deadline_at: workflowStep.expiration_days 
                ? new Date(now.getTime() + workflowStep.expiration_days * 24 * 60 * 60 * 1000).toISOString()
                : null
            })
            .eq("id", instance.id);
          continue;
        }

        const hoursElapsed = (now.getTime() - stepStartedAt.getTime()) / (1000 * 60 * 60);
        const deadlineAt = instance.current_step_deadline_at 
          ? new Date(instance.current_step_deadline_at) 
          : null;

        // Check for expiration (workflow auto-reject)
        if (deadlineAt && now > deadlineAt) {
          await handleExpiration(supabase, instance, workflowStep, results);
          continue;
        }

        // Check for escalation
        if (workflowStep.escalation_hours && hoursElapsed >= workflowStep.escalation_hours) {
          await handleEscalation(supabase, instance, workflowStep, results);
          continue;
        }

        // Update SLA status
        const newSlaStatus = calculateSlaStatus(
          hoursElapsed,
          workflowStep.escalation_hours,
          workflowStep.sla_warning_hours,
          workflowStep.sla_critical_hours,
          deadlineAt ? (deadlineAt.getTime() - now.getTime()) / (1000 * 60 * 60) : null
        );

        if (newSlaStatus !== instance.sla_status) {
          await supabase
            .from("workflow_instances")
            .update({ sla_status: newSlaStatus })
            .eq("id", instance.id);

          // Send warning notification if status changed to warning or critical
          if (newSlaStatus === "warning" || newSlaStatus === "critical") {
            await sendSlaNotification(supabase, instance, workflowStep, newSlaStatus);
            results.warnings_sent++;
          }
        }

      } catch (err) {
        const error = err as Error;
        results.errors.push(`Instance ${instance.id}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ message: "Workflow escalation processing complete", results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const error = err as Error;
    console.error("Error processing workflow escalations:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function calculateSlaStatus(
  hoursElapsed: number,
  escalationHours: number | null,
  warningHours: number | null,
  criticalHours: number | null,
  hoursUntilDeadline: number | null
): string {
  // Check deadline-based SLA first
  if (hoursUntilDeadline !== null) {
    if (hoursUntilDeadline <= 0) return "overdue";
    if (criticalHours && hoursUntilDeadline <= criticalHours) return "critical";
    if (warningHours && hoursUntilDeadline <= warningHours) return "warning";
  }

  // Fall back to escalation-based SLA
  if (escalationHours) {
    const percentComplete = hoursElapsed / escalationHours;
    if (percentComplete >= 1) return "overdue";
    if (percentComplete >= 0.9) return "critical";
    if (percentComplete >= 0.75) return "warning";
  }

  return "on_track";
}

async function handleExpiration(
  supabase: AnySupabaseClient,
  instance: WorkflowInstance,
  step: WorkflowStep,
  results: { expired: number; errors: string[] }
) {
  try {
    // Mark workflow as expired/rejected
    await supabase
      .from("workflow_instances")
      .update({
        status: "expired",
        sla_status: "expired",
        completed_at: new Date().toISOString(),
        final_action: "expired",
      })
      .eq("id", instance.id);

    // Record the action
    await supabase.from("workflow_step_actions").insert({
      instance_id: instance.id,
      step_id: step.id,
      step_order: step.step_order,
      action: "expired",
      comment: `Workflow expired after ${step.expiration_days} days without action`,
    });

    // Update step tracking
    await supabase
      .from("workflow_step_tracking")
      .update({
        expired_at: new Date().toISOString(),
        sla_status: "expired",
        was_overdue: true,
      })
      .eq("instance_id", instance.id)
      .eq("step_order", step.step_order)
      .is("completed_at", null);

    // Send expiration notification
    await supabase.from("notifications").insert({
      user_id: instance.initiated_by,
      title: "Workflow Expired",
      message: `Your workflow request has expired at step "${step.name}" due to no action within the allowed time.`,
      type: "workflow",
      priority: "high",
      reference_type: "workflow_instance",
      reference_id: instance.id,
    });

    results.expired++;
  } catch (err) {
    const error = err as Error;
    results.errors.push(`Expiration error for ${instance.id}: ${error.message}`);
  }
}

async function handleEscalation(
  supabase: AnySupabaseClient,
  instance: WorkflowInstance,
  step: WorkflowStep,
  results: { escalated: number; errors: string[] }
) {
  try {
    const escalationAction = step.escalation_action || "notify";

    switch (escalationAction) {
      case "auto_approve":
        // Auto-approve and move to next step
        await supabase.from("workflow_step_actions").insert({
          instance_id: instance.id,
          step_id: step.id,
          step_order: step.step_order,
          action: "approved",
          comment: `Auto-approved after ${step.escalation_hours} hours (escalation policy)`,
        });
        
        // Move to next step (simplified - actual implementation would use workflow logic)
        await supabase
          .from("workflow_instances")
          .update({
            current_step_order: instance.current_step_order + 1,
            current_step_started_at: new Date().toISOString(),
            escalated_at: new Date().toISOString(),
            sla_status: "on_track",
          })
          .eq("id", instance.id);
        break;

      case "auto_reject":
        await supabase
          .from("workflow_instances")
          .update({
            status: "rejected",
            completed_at: new Date().toISOString(),
            final_action: "rejected",
            escalated_at: new Date().toISOString(),
          })
          .eq("id", instance.id);

        await supabase.from("workflow_step_actions").insert({
          instance_id: instance.id,
          step_id: step.id,
          step_order: step.step_order,
          action: "rejected",
          comment: `Auto-rejected after ${step.escalation_hours} hours (escalation policy)`,
        });
        break;

      case "delegate":
        if (step.alternate_approver_id) {
          await supabase.from("workflow_step_actions").insert({
            instance_id: instance.id,
            step_id: step.id,
            step_order: step.step_order,
            action: "delegated",
            delegated_to: step.alternate_approver_id,
            delegation_reason: `Auto-delegated after ${step.escalation_hours} hours`,
          });

          await supabase
            .from("workflow_instances")
            .update({
              escalated_at: new Date().toISOString(),
              current_step_started_at: new Date().toISOString(),
              sla_status: "on_track",
            })
            .eq("id", instance.id);

          // Notify alternate approver
          await supabase.from("notifications").insert({
            user_id: step.alternate_approver_id,
            title: "Workflow Delegated to You",
            message: `A workflow has been escalated to you for approval at step "${step.name}".`,
            type: "workflow",
            priority: "high",
            reference_type: "workflow_instance",
            reference_id: instance.id,
          });
        }
        break;

      case "notify":
      default:
        // Just mark as escalated and send notifications
        await supabase
          .from("workflow_instances")
          .update({
            escalated_at: new Date().toISOString(),
            sla_status: "overdue",
          })
          .eq("id", instance.id);

        // Notify the initiator
        await supabase.from("notifications").insert({
          user_id: instance.initiated_by,
          title: "Workflow Overdue",
          message: `Your workflow request is overdue at step "${step.name}". It has been pending for over ${step.escalation_hours} hours.`,
          type: "workflow",
          priority: "high",
          reference_type: "workflow_instance",
          reference_id: instance.id,
        });
        break;
    }

    results.escalated++;
  } catch (err) {
    const error = err as Error;
    results.errors.push(`Escalation error for ${instance.id}: ${error.message}`);
  }
}

async function sendSlaNotification(
  supabase: AnySupabaseClient,
  instance: WorkflowInstance,
  step: WorkflowStep,
  status: string
) {
  const priority = status === "critical" ? "high" : "medium";
  const message = status === "critical"
    ? `Your workflow request at step "${step.name}" is critically overdue and may expire soon.`
    : `Your workflow request at step "${step.name}" is approaching its deadline.`;

  await supabase.from("notifications").insert({
    user_id: instance.initiated_by,
    title: `Workflow SLA ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message,
    type: "workflow",
    priority,
    reference_type: "workflow_instance",
    reference_id: instance.id,
  });
}
