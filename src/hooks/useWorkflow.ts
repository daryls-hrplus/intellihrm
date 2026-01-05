import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type WorkflowStatus = 'draft' | 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled' | 'escalated' | 'returned' | 'auto_terminated';
export type WorkflowAction = 'approve' | 'reject' | 'return' | 'escalate' | 'delegate' | 'comment';
export type WorkflowCategory = 'leave_request' | 'probation_confirmation' | 'headcount_request' | 'training_request' | 'promotion' | 'transfer' | 'resignation' | 'termination' | 'expense_claim' | 'letter_request' | 'general' | 'qualification' | 'hire' | 'rehire' | 'confirmation' | 'probation_extension' | 'acting' | 'secondment' | 'salary_change' | 'rate_change';

export interface WorkflowTemplate {
  id: string;
  name: string;
  code: string;
  category: WorkflowCategory;
  description: string | null;
  company_id: string | null;
  department_id: string | null;
  section_id: string | null;
  is_global: boolean;
  is_active: boolean;
  requires_signature: boolean;
  requires_letter: boolean;
  letter_template_id: string | null;
  auto_terminate_hours: number | null;
  allow_return_to_previous: boolean;
  start_date: string | null;
  end_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowApprovalRole {
  id: string;
  name: string;
  code: string;
  description: string | null;
  company_id: string | null;
  is_active: boolean;
  positions?: { id: string; title: string; is_primary: boolean; priority_order: number }[];
}

export interface WorkflowStep {
  id: string;
  template_id: string;
  step_order: number;
  name: string;
  description: string | null;
  approver_type: string;
  approver_position_id: string | null;
  approver_role_id: string | null;
  approver_governance_body_id: string | null;
  approver_user_id: string | null;
  workflow_approval_role_id: string | null;
  use_reporting_line: boolean;
  requires_signature: boolean;
  requires_comment: boolean;
  can_delegate: boolean;
  escalation_hours: number | null;
  escalation_action: string | null;
  alternate_approver_id: string | null;
  is_active: boolean;
  company_id: string | null;
  department_id: string | null;
  section_id: string | null;
  target_company_id: string | null;
  // SLA fields
  expiration_days: number | null;
  sla_warning_hours: number | null;
  sla_critical_hours: number | null;
}

export interface CrossCompanyPathEntry {
  company_id: string;
  company_name: string;
  step_order: number;
  entered_at: string;
}

export type SlaStatus = 'on_track' | 'warning' | 'critical' | 'overdue' | 'expired';

export interface WorkflowInstance {
  id: string;
  template_id: string;
  category: WorkflowCategory;
  reference_type: string;
  reference_id: string;
  status: WorkflowStatus;
  current_step_id: string | null;
  current_step_order: number;
  initiated_by: string;
  initiated_at: string;
  completed_at: string | null;
  completed_by: string | null;
  final_action: WorkflowAction | null;
  deadline_at: string | null;
  escalated_at: string | null;
  auto_terminate_at: string | null;
  metadata: Record<string, unknown>;
  company_id: string | null;
  is_cross_company: boolean;
  origin_company_id: string | null;
  cross_company_path: CrossCompanyPathEntry[];
  // SLA tracking fields
  current_step_started_at: string | null;
  current_step_deadline_at: string | null;
  sla_status: SlaStatus;
  template?: WorkflowTemplate;
  steps?: WorkflowStep[];
  current_step?: WorkflowStep;
  initiator?: { full_name: string; email: string };
  origin_company?: { name: string; code: string };
}

export interface WorkflowStepAction {
  id: string;
  instance_id: string;
  step_id: string;
  step_order: number;
  action: WorkflowAction;
  actor_id: string;
  acted_at: string;
  comment: string | null;
  internal_notes: string | null;
  delegated_to: string | null;
  delegation_reason: string | null;
  return_to_step: number | null;
  return_reason: string | null;
  actor?: { full_name: string; email: string };
}

interface UseWorkflowState {
  isLoading: boolean;
  error: string | null;
}

export function useWorkflow() {
  const { user, profile } = useAuth();
  const [state, setState] = useState<UseWorkflowState>({
    isLoading: false,
    error: null,
  });

  // Send notification - supports both legacy and new format
  const sendWorkflowNotification = useCallback(async (params: {
    instanceId: string;
    recipientId: string;
    notificationType: 'pending_approval' | 'approved' | 'rejected' | 'escalated' | 'returned' | 'completed' | 'comment_added';
    workflowName: string;
    category: string;
    referenceType: string;
    referenceId: string;
    stepName?: string;
    escalationHours?: number | null;
    deadlineAt?: string | null;
    initiatorName?: string;
    actorName?: string;
    comment?: string;
    rejectionReason?: string;
    returnReason?: string;
  }) => {
    try {
      await supabase.functions.invoke("send-workflow-notification", {
        body: {
          instance_id: params.instanceId,
          recipient_id: params.recipientId,
          notification_type: params.notificationType,
          workflow_name: params.workflowName,
          category: params.category,
          reference_type: params.referenceType,
          reference_id: params.referenceId,
          step_name: params.stepName,
          escalation_hours: params.escalationHours,
          deadline_at: params.deadlineAt,
          initiator_name: params.initiatorName,
          actor_name: params.actorName,
          comment: params.comment,
          rejection_reason: params.rejectionReason,
          return_reason: params.returnReason,
        },
      });
    } catch (error) {
      console.error("Failed to send workflow notification:", error);
      // Don't throw - notification failure shouldn't block workflow
    }
  }, []);

  // Legacy function for backward compatibility
  const notifyApprover = useCallback(async (
    instanceId: string,
    approverId: string,
    stepName: string,
    workflowName: string,
    category: string,
    referenceType: string,
    referenceId: string,
    escalationHours?: number | null,
    deadlineAt?: string | null,
    initiatorName?: string
  ) => {
    await sendWorkflowNotification({
      instanceId,
      recipientId: approverId,
      notificationType: 'pending_approval',
      workflowName,
      category,
      referenceType,
      referenceId,
      stepName,
      escalationHours,
      deadlineAt,
      initiatorName,
    });
  }, [sendWorkflowNotification]);

  // Get the approver for a step
  const getStepApprover = useCallback(async (
    step: WorkflowStep,
    initiatorId: string
  ): Promise<string | null> => {
    try {
      if (step.approver_type === "specific_user" && step.approver_user_id) {
        return step.approver_user_id;
      }

      if (step.approver_type === "manager" || step.use_reporting_line) {
        // Get initiator's position and find their manager
        const { data: empPos } = await supabase
          .from("employee_positions")
          .select("position:positions(reports_to_position_id)")
          .eq("employee_id", initiatorId)
          .eq("is_active", true)
          .eq("is_primary", true)
          .single();

        if (empPos?.position?.reports_to_position_id) {
          const { data: managerPos } = await supabase
            .from("employee_positions")
            .select("employee_id")
            .eq("position_id", empPos.position.reports_to_position_id)
            .eq("is_active", true)
            .limit(1)
            .single();

          if (managerPos?.employee_id) {
            return managerPos.employee_id;
          }
        }
      }

      if (step.approver_type === "position" && step.approver_position_id) {
        // First, check for someone acting in this position (takes precedence)
        const { data: actingHolder } = await supabase
          .from("employee_positions")
          .select("employee_id")
          .eq("position_id", step.approver_position_id)
          .eq("is_active", true)
          .eq("assignment_type", "acting")
          .or("end_date.is.null,end_date.gte." + new Date().toISOString().split("T")[0])
          .limit(1)
          .single();

        if (actingHolder?.employee_id) {
          return actingHolder.employee_id;
        }

        // Fall back to primary position holder
        const { data: primaryHolder } = await supabase
          .from("employee_positions")
          .select("employee_id")
          .eq("position_id", step.approver_position_id)
          .eq("is_active", true)
          .eq("assignment_type", "primary")
          .limit(1)
          .single();

        if (primaryHolder?.employee_id) {
          return primaryHolder.employee_id;
        }

        // Last resort: any active holder
        const { data: anyHolder } = await supabase
          .from("employee_positions")
          .select("employee_id")
          .eq("position_id", step.approver_position_id)
          .eq("is_active", true)
          .limit(1)
          .single();

        if (anyHolder?.employee_id) {
          return anyHolder.employee_id;
        }
      }

      // Workflow approval role - check positions linked to this role
      if (step.approver_type === "workflow_role" && step.workflow_approval_role_id) {
        // Get positions linked to this workflow approval role, ordered by priority
        const { data: rolePositions } = await supabase
          .from("workflow_approval_role_positions")
          .select("position_id, is_primary, priority_order")
          .eq("workflow_role_id", step.workflow_approval_role_id)
          .order("is_primary", { ascending: false })
          .order("priority_order", { ascending: true });

        if (rolePositions && rolePositions.length > 0) {
          // Check each position in priority order
          for (const rp of rolePositions) {
            // First check for acting position holders
            const { data: actingHolder } = await supabase
              .from("employee_positions")
              .select("employee_id")
              .eq("position_id", rp.position_id)
              .eq("is_active", true)
              .eq("assignment_type", "acting")
              .or("end_date.is.null,end_date.gte." + new Date().toISOString().split("T")[0])
              .limit(1)
              .single();

            if (actingHolder?.employee_id) {
              return actingHolder.employee_id;
            }

            // Fall back to primary position holder
            const { data: primaryHolder } = await supabase
              .from("employee_positions")
              .select("employee_id")
              .eq("position_id", rp.position_id)
              .eq("is_active", true)
              .eq("assignment_type", "primary")
              .limit(1)
              .single();

            if (primaryHolder?.employee_id) {
              return primaryHolder.employee_id;
            }
          }
        }
      }

      if (step.approver_type === "role" && step.approver_role_id) {
        // Get any user with this role
        const { data: roleUser } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role_id", step.approver_role_id)
          .limit(1)
          .single();

        if (roleUser?.user_id) {
          return roleUser.user_id;
        }
      }

      if (step.approver_type === "hr") {
        // Find HR manager role users
        const { data: hrRole } = await supabase
          .from("roles")
          .select("id")
          .eq("code", "hr_manager")
          .single();

        if (hrRole) {
          const { data: hrUser } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("role_id", hrRole.id)
            .limit(1)
            .single();

          if (hrUser?.user_id) {
            return hrUser.user_id;
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Failed to get step approver:", error);
      return null;
    }
  }, []);

  // Start a new workflow instance
  const startWorkflow = useCallback(async (
    templateCode: string,
    referenceType: string,
    referenceId: string,
    metadata?: Record<string, unknown>
  ): Promise<WorkflowInstance | null> => {
    if (!user || !profile) {
      toast.error("You must be logged in to start a workflow");
      return null;
    }

    setState({ isLoading: true, error: null });

    try {
      // Get the template
      const { data: template, error: templateError } = await supabase
        .from("workflow_templates")
        .select("*")
        .eq("code", templateCode)
        .eq("is_active", true)
        .single();

      if (templateError || !template) {
        throw new Error("Workflow template not found");
      }

      // Get the first step
      const { data: firstStep, error: stepError } = await supabase
        .from("workflow_steps")
        .select("*")
        .eq("template_id", template.id)
        .eq("is_active", true)
        .order("step_order", { ascending: true })
        .limit(1)
        .single();

      if (stepError || !firstStep) {
        throw new Error("Workflow has no steps configured");
      }

      // Calculate auto-terminate deadline if configured
      let autoTerminateAt: string | null = null;
      if (template.auto_terminate_hours) {
        autoTerminateAt = new Date(
          Date.now() + template.auto_terminate_hours * 60 * 60 * 1000
        ).toISOString();
      }

      // Create the workflow instance
      const { data: instance, error: instanceError } = await supabase
        .from("workflow_instances")
        .insert({
          template_id: template.id,
          category: template.category,
          reference_type: referenceType,
          reference_id: referenceId,
          status: "pending",
          current_step_id: firstStep.id,
          current_step_order: firstStep.step_order,
          initiated_by: user.id,
          auto_terminate_at: autoTerminateAt,
          metadata: metadata || {},
          company_id: profile.company_id,
        } as any)
        .select()
        .single();

      if (instanceError) {
        throw instanceError;
      }

      // Notify the first step approver
      const approverId = await getStepApprover(firstStep as WorkflowStep, user.id);
      if (approverId) {
        await notifyApprover(
          instance.id,
          approverId,
          firstStep.name,
          template.name,
          template.category,
          referenceType,
          referenceId,
          firstStep.escalation_hours,
          autoTerminateAt,
          profile.full_name || profile.email
        );
      }

      setState({ isLoading: false, error: null });
      toast.success("Workflow started successfully");
      
      // Transform the instance to match WorkflowInstance type
      const workflowInstance: WorkflowInstance = {
        ...instance,
        is_cross_company: instance.is_cross_company ?? false,
        cross_company_path: Array.isArray(instance.cross_company_path) 
          ? (instance.cross_company_path as unknown as CrossCompanyPathEntry[]) 
          : [],
        metadata: (instance.metadata as Record<string, unknown>) ?? {},
        current_step_started_at: instance.current_step_started_at ?? null,
        current_step_deadline_at: instance.current_step_deadline_at ?? null,
        sla_status: (instance.sla_status as SlaStatus) ?? 'on_track',
      };
      return workflowInstance;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start workflow";
      setState({ isLoading: false, error: message });
      toast.error(message);
      return null;
    }
  }, [user, profile, getStepApprover, notifyApprover]);

  // Take action on a workflow step
  const takeAction = useCallback(async (
    instanceId: string,
    action: WorkflowAction,
    options?: {
      comment?: string;
      internalNotes?: string;
      delegateTo?: string;
      delegationReason?: string;
      returnToStep?: number;
      returnReason?: string;
      signatureText?: string;
    }
  ): Promise<boolean> => {
    if (!user || !profile) {
      toast.error("You must be logged in to take action");
      return false;
    }

    setState({ isLoading: true, error: null });

    try {
      // Get the current instance
      const { data: instance, error: instanceError } = await supabase
        .from("workflow_instances")
        .select(`
          *,
          template:workflow_templates(*),
          current_step:workflow_steps(*)
        `)
        .eq("id", instanceId)
        .single();

      if (instanceError || !instance) {
        throw new Error("Workflow instance not found");
      }

      const currentStep = instance.current_step;
      if (!currentStep) {
        throw new Error("Current step not found");
      }

      // Create the step action record
      const { data: stepAction, error: actionError } = await supabase
        .from("workflow_step_actions")
        .insert({
          instance_id: instanceId,
          step_id: currentStep.id,
          step_order: instance.current_step_order,
          action,
          actor_id: user.id,
          comment: options?.comment,
          internal_notes: options?.internalNotes,
          delegated_to: options?.delegateTo,
          delegation_reason: options?.delegationReason,
          return_to_step: options?.returnToStep,
          return_reason: options?.returnReason,
          ip_address: null, // Would need edge function for IP
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (actionError) {
        throw actionError;
      }

      // If signature is required and provided, create it
      if (currentStep.requires_signature && options?.signatureText) {
        const signatureHash = btoa(
          `${options.signatureText}|${user.id}|${new Date().toISOString()}|${instanceId}`
        );

        await supabase.from("workflow_signatures").insert({
          instance_id: instanceId,
          step_action_id: stepAction.id,
          signer_id: user.id,
          signer_name: profile.full_name || profile.email,
          signer_email: profile.email,
          signature_text: options.signatureText,
          signature_hash: signatureHash,
          user_agent: navigator.userAgent,
        });
      }

      // Update instance based on action
      let newStatus: WorkflowStatus = instance.status;
      let newStepId: string | null = instance.current_step_id;
      let newStepOrder: number = instance.current_step_order;
      let completedAt: string | null = null;
      let completedBy: string | null = null;
      let finalAction: WorkflowAction | null = null;

      let nextStepForNotification: WorkflowStep | null = null;

      if (action === "approve") {
        // Check if there's a next step
        const { data: nextStep } = await supabase
          .from("workflow_steps")
          .select("*")
          .eq("template_id", instance.template_id)
          .eq("is_active", true)
          .gt("step_order", instance.current_step_order)
          .order("step_order", { ascending: true })
          .limit(1)
          .single();

        if (nextStep) {
          newStatus = "in_progress";
          newStepId = nextStep.id;
          newStepOrder = nextStep.step_order;
          nextStepForNotification = nextStep as WorkflowStep;
        } else {
          // No more steps - workflow is complete
          newStatus = "approved";
          completedAt = new Date().toISOString();
          completedBy = user.id;
          finalAction = "approve";
        }
      } else if (action === "reject") {
        newStatus = "rejected";
        completedAt = new Date().toISOString();
        completedBy = user.id;
        finalAction = "reject";
      } else if (action === "return" && options?.returnToStep !== undefined) {
        // Find the step to return to
        const { data: returnStep } = await supabase
          .from("workflow_steps")
          .select("*")
          .eq("template_id", instance.template_id)
          .eq("step_order", options.returnToStep)
          .single();

        if (returnStep) {
          newStatus = "returned";
          newStepId = returnStep.id;
          newStepOrder = returnStep.step_order;
          nextStepForNotification = returnStep as WorkflowStep;
        }
      } else if (action === "escalate") {
        newStatus = "escalated";
      }

      // Update the instance
      const { error: updateError } = await supabase
        .from("workflow_instances")
        .update({
          status: newStatus,
          current_step_id: newStepId,
          current_step_order: newStepOrder,
          completed_at: completedAt,
          completed_by: completedBy,
          final_action: finalAction,
          escalated_at: action === "escalate" ? new Date().toISOString() : instance.escalated_at,
        })
        .eq("id", instanceId);

      if (updateError) {
        throw updateError;
      }

      // Update the reference record if workflow is completed
      if (newStatus === "approved" || newStatus === "rejected") {
        // Update the source record based on reference_type
        if (instance.reference_type === "headcount_requests") {
          await supabase
            .from("headcount_requests")
            .update({
              status: newStatus,
              reviewed_by: user.id,
              reviewed_at: completedAt,
              review_notes: options?.comment || null,
            })
            .eq("id", instance.reference_id);
        } else if (instance.reference_type === "leave_requests") {
          await supabase
            .from("leave_requests")
            .update({
              status: newStatus,
              actioned_by: user.id,
              actioned_at: completedAt,
              rejection_reason: newStatus === "rejected" ? options?.comment : null,
            })
            .eq("id", instance.reference_id);
        } else if (instance.reference_type === "employee_transactions") {
          // Update the transaction status
          await supabase
            .from("employee_transactions")
            .update({
              status: newStatus === "approved" ? "approved" : "rejected",
            })
            .eq("id", instance.reference_id);
          
          // Handle compensation approval/rejection for employee transactions
          if (newStatus === "approved") {
            // Import and call the approval-triggered retro pay service
            try {
              const { generateApprovalTriggeredRetroPay } = await import("@/utils/payroll/approvalRetroPayService");
              const result = await generateApprovalTriggeredRetroPay(
                instance.reference_id,
                completedAt || new Date().toISOString(),
                user.id
              );
              
              if (result.success && result.configId) {
                toast.info(`Retroactive pay config created for ${result.periodCount} periods. Total: $${result.totalAmount?.toFixed(2)}`);
              }
            } catch (retroError) {
              console.error("Failed to generate approval-triggered retro pay:", retroError);
              // Don't fail the workflow approval, just log the error
            }
          } else if (newStatus === "rejected") {
            // Reject pending compensation
            try {
              const { rejectPendingCompensation } = await import("@/utils/payroll/approvalRetroPayService");
              await rejectPendingCompensation(instance.reference_id);
            } catch (rejectError) {
              console.error("Failed to reject pending compensation:", rejectError);
            }
          }
        }
      }

      // Notify next approver if moving to a new step
      if (nextStepForNotification) {
        const template = instance.template as any;
        const approverId = await getStepApprover(nextStepForNotification, instance.initiated_by);
        if (approverId) {
          // Get initiator name
          const { data: initiator } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", instance.initiated_by)
            .single();

          await notifyApprover(
            instanceId,
            approverId,
            nextStepForNotification.name,
            template?.name || "Workflow",
            instance.category,
            instance.reference_type,
            instance.reference_id,
            nextStepForNotification.escalation_hours,
            instance.auto_terminate_at,
            initiator?.full_name || initiator?.email
          );
        }
      }

      setState({ isLoading: false, error: null });
      
      const actionLabels: Record<WorkflowAction, string> = {
        approve: "approved",
        reject: "rejected",
        return: "returned",
        escalate: "escalated",
        delegate: "delegated",
        comment: "commented on",
      };
      
      toast.success(`Request ${actionLabels[action]} successfully`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to take action";
      setState({ isLoading: false, error: message });
      toast.error(message);
      return false;
    }
  }, [user, profile, getStepApprover, notifyApprover]);

  // Get workflow instance with full details
  const getWorkflowInstance = useCallback(async (
    instanceId: string
  ): Promise<WorkflowInstance | null> => {
    try {
      const { data, error } = await supabase
        .from("workflow_instances")
        .select(`
          *,
          template:workflow_templates(*),
          current_step:workflow_steps(*),
          initiator:profiles!workflow_instances_initiated_by_fkey(full_name, email)
        `)
        .eq("id", instanceId)
        .single();

      if (error) throw error;
      return data as unknown as WorkflowInstance;
    } catch (error) {
      console.error("Failed to get workflow instance:", error);
      return null;
    }
  }, []);

  // Get workflow actions/history
  const getWorkflowHistory = useCallback(async (
    instanceId: string
  ): Promise<WorkflowStepAction[]> => {
    try {
      const { data, error } = await supabase
        .from("workflow_step_actions")
        .select(`
          *,
          actor:profiles!workflow_step_actions_actor_id_fkey(full_name, email)
        `)
        .eq("instance_id", instanceId)
        .order("acted_at", { ascending: true });

      if (error) throw error;
      return data as unknown as WorkflowStepAction[];
    } catch (error) {
      console.error("Failed to get workflow history:", error);
      return [];
    }
  }, []);

  // Get pending workflows for current user
  const getPendingWorkflows = useCallback(async (): Promise<WorkflowInstance[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from("workflow_instances")
        .select(`
          *,
          template:workflow_templates(name, code, category),
          initiator:profiles!workflow_instances_initiated_by_fkey(full_name, email)
        `)
        .in("status", ["pending", "in_progress", "escalated", "returned"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as WorkflowInstance[];
    } catch (error) {
      console.error("Failed to get pending workflows:", error);
      return [];
    }
  }, [user]);

  // Cancel a workflow
  const cancelWorkflow = useCallback(async (instanceId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("workflow_instances")
        .update({
          status: "cancelled",
          completed_at: new Date().toISOString(),
          completed_by: user.id,
        })
        .eq("id", instanceId)
        .eq("initiated_by", user.id);

      if (error) throw error;
      toast.success("Workflow cancelled");
      return true;
    } catch (error) {
      toast.error("Failed to cancel workflow");
      return false;
    }
  }, [user]);

  return {
    ...state,
    startWorkflow,
    takeAction,
    getWorkflowInstance,
    getWorkflowHistory,
    getPendingWorkflows,
    cancelWorkflow,
  };
}
