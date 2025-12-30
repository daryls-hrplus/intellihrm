import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ConditionType = 
  | "score_below" 
  | "score_above" 
  | "gap_detected" 
  | "repeated_low" 
  | "improvement_trend" 
  | "competency_gap" 
  | "goal_not_met";

export type ActionType = 
  | "create_idp" 
  | "create_pip" 
  | "suggest_succession" 
  | "block_finalization" 
  | "require_comment" 
  | "notify_hr" 
  | "schedule_coaching" 
  | "require_development_plan";

export type ConditionSection = "goals" | "competencies" | "responsibilities" | "feedback_360" | "values" | "overall";
export type ConditionOperator = "<" | "<=" | ">" | ">=" | "=" | "!=";

export interface AppraisalActionRule {
  id: string;
  template_id: string;
  company_id: string;
  rule_name: string;
  rule_code: string;
  description: string | null;
  condition_type: ConditionType;
  condition_section: ConditionSection;
  condition_operator: ConditionOperator;
  condition_threshold: number;
  condition_cycles: number | null;
  action_type: ActionType;
  action_is_mandatory: boolean;
  action_priority: number;
  action_description: string | null;
  action_message: string | null;
  requires_hr_override: boolean;
  auto_execute: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateRuleInput {
  template_id: string;
  company_id: string;
  rule_name: string;
  rule_code: string;
  description?: string;
  condition_type: ConditionType;
  condition_section: ConditionSection;
  condition_operator?: ConditionOperator;
  condition_threshold: number;
  condition_cycles?: number;
  action_type: ActionType;
  action_is_mandatory?: boolean;
  action_priority?: number;
  action_description?: string;
  action_message?: string;
  requires_hr_override?: boolean;
  auto_execute?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface AppraisalActionExecution {
  id: string;
  participant_id: string;
  rule_id: string;
  triggered_at: string;
  triggered_score: number | null;
  triggered_section: string | null;
  status: "pending" | "executed" | "overridden" | "dismissed" | "completed";
  executed_at: string | null;
  executed_by: string | null;
  created_idp_id: string | null;
  created_pip_id: string | null;
  created_succession_nomination_id: string | null;
  override_reason: string | null;
  override_approved_by: string | null;
  override_approved_at: string | null;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  acknowledgment_notes: string | null;
  rule?: AppraisalActionRule;
}

export function useAppraisalActionRules(templateId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading, refetch } = useQuery({
    queryKey: ["appraisal-action-rules", templateId],
    queryFn: async () => {
      if (!templateId) return [];
      const { data, error } = await supabase
        .from("appraisal_outcome_action_rules")
        .select("*")
        .eq("template_id", templateId)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as AppraisalActionRule[];
    },
    enabled: !!templateId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateRuleInput) => {
      const { data, error } = await supabase
        .from("appraisal_outcome_action_rules")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-action-rules"] });
      toast.success("Action rule created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create action rule");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AppraisalActionRule> & { id: string }) => {
      const { data, error } = await supabase
        .from("appraisal_outcome_action_rules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-action-rules"] });
      toast.success("Action rule updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update action rule");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appraisal_outcome_action_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-action-rules"] });
      toast.success("Action rule deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete action rule");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase
          .from("appraisal_outcome_action_rules")
          .update({ display_order: index })
          .eq("id", id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-action-rules"] });
    },
  });

  return {
    rules,
    isLoading,
    refetch,
    createRule: createMutation.mutateAsync,
    updateRule: updateMutation.mutateAsync,
    deleteRule: deleteMutation.mutateAsync,
    reorderRules: reorderMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useAppraisalActionExecutions(participantId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: executions = [], isLoading, refetch } = useQuery({
    queryKey: ["appraisal-action-executions", participantId],
    queryFn: async () => {
      if (!participantId) return [];
      const { data, error } = await supabase
        .from("appraisal_action_executions")
        .select(`
          *,
          rule:appraisal_outcome_action_rules(*)
        `)
        .eq("participant_id", participantId)
        .order("triggered_at", { ascending: false });
      if (error) throw error;
      return data as AppraisalActionExecution[];
    },
    enabled: !!participantId,
  });

  const executeMutation = useMutation({
    mutationFn: async ({ executionId, ...data }: { executionId: string; created_idp_id?: string; created_pip_id?: string }) => {
      const { error } = await supabase
        .from("appraisal_action_executions")
        .update({
          ...data,
          status: "executed",
          executed_at: new Date().toISOString(),
        })
        .eq("id", executionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-action-executions"] });
      toast.success("Action executed successfully");
    },
  });

  const overrideMutation = useMutation({
    mutationFn: async ({ executionId, reason, approvedBy }: { executionId: string; reason: string; approvedBy: string }) => {
      const { error } = await supabase
        .from("appraisal_action_executions")
        .update({
          status: "overridden",
          override_reason: reason,
          override_approved_by: approvedBy,
          override_approved_at: new Date().toISOString(),
        })
        .eq("id", executionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-action-executions"] });
      toast.success("Action overridden");
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (executionId: string) => {
      const { error } = await supabase
        .from("appraisal_action_executions")
        .update({ status: "dismissed" })
        .eq("id", executionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-action-executions"] });
    },
  });

  const pendingExecutions = executions.filter(e => e.status === "pending");
  const mandatoryPending = pendingExecutions.filter(e => e.rule?.action_is_mandatory);
  const advisoryPending = pendingExecutions.filter(e => !e.rule?.action_is_mandatory);

  return {
    executions,
    pendingExecutions,
    mandatoryPending,
    advisoryPending,
    isLoading,
    refetch,
    executeAction: executeMutation.mutateAsync,
    overrideAction: overrideMutation.mutateAsync,
    dismissAction: dismissMutation.mutateAsync,
    hasBlockingActions: mandatoryPending.length > 0,
  };
}

export function getRuleDescription(rule: AppraisalActionRule): string {
  const section = rule.condition_section.replace("_", " ");
  const operator = {
    "<": "is less than",
    "<=": "is at most",
    ">": "is greater than",
    ">=": "is at least",
    "=": "equals",
    "!=": "does not equal",
  }[rule.condition_operator];

  let condition = `When ${section} score ${operator} ${rule.condition_threshold}`;
  if (rule.condition_type === "repeated_low" && rule.condition_cycles) {
    condition += ` for ${rule.condition_cycles} consecutive cycles`;
  }

  const action = {
    create_idp: "create an Individual Development Plan",
    create_pip: "create a Performance Improvement Plan",
    suggest_succession: "suggest succession nomination",
    block_finalization: "block appraisal finalization",
    require_comment: "require a justification comment",
    notify_hr: "notify HR",
    schedule_coaching: "schedule coaching session",
    require_development_plan: "require development plan",
  }[rule.action_type];

  return `${condition}, then ${action}${rule.action_is_mandatory ? " (mandatory)" : " (advisory)"}.`;
}
