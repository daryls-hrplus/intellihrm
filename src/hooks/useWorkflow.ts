import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type WorkflowStatus = 'draft' | 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled' | 'escalated' | 'returned' | 'auto_terminated';
export type WorkflowAction = 'approve' | 'reject' | 'return' | 'escalate' | 'delegate' | 'comment';
export type WorkflowCategory = 'leave_request' | 'probation_confirmation' | 'headcount_request' | 'training_request' | 'promotion' | 'transfer' | 'resignation' | 'termination' | 'expense_claim' | 'letter_request' | 'general';

export interface WorkflowTemplate {
  id: string;
  name: string;
  code: string;
  category: WorkflowCategory;
  description: string | null;
  company_id: string | null;
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
  use_reporting_line: boolean;
  requires_signature: boolean;
  requires_comment: boolean;
  can_delegate: boolean;
  escalation_hours: number | null;
  escalation_action: string | null;
  alternate_approver_id: string | null;
  is_active: boolean;
}

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
  template?: WorkflowTemplate;
  steps?: WorkflowStep[];
  current_step?: WorkflowStep;
  initiator?: { full_name: string; email: string };
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

      setState({ isLoading: false, error: null });
      toast.success("Workflow started successfully");
      return instance as WorkflowInstance;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start workflow";
      setState({ isLoading: false, error: message });
      toast.error(message);
      return null;
    }
  }, [user, profile]);

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
  }, [user, profile]);

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
