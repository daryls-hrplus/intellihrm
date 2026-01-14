import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Target modules that rules can execute against
export type TargetModule = 
  | "nine_box" 
  | "succession" 
  | "idp" 
  | "pip" 
  | "compensation" 
  | "workforce_analytics" 
  | "notifications" 
  | "reminders";

// Action types for each module
export type ActionType = "create" | "update" | "flag" | "archive" | "notify" | "sync";

// Condition types for rule evaluation
export type ConditionType = "category_match" | "score_range" | "trend_direction" | "readiness_threshold";

// Condition operators
export type ConditionOperator = "=" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "not_in" | "between";

// Score sections that can be evaluated
export type ConditionSection = "overall" | "goals" | "competencies" | "responsibilities" | "feedback_360" | "values";

// Trigger events
export type TriggerEvent = "appraisal_finalized" | "score_threshold" | "category_assigned";

export interface UnifiedAppraisalRule {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  trigger_event: TriggerEvent;
  condition_type: ConditionType;
  condition_operator: ConditionOperator;
  condition_value: number | null;
  condition_value_max: number | null;
  condition_category_codes: string[];
  condition_section: ConditionSection | null;
  condition_threshold: number | null;
  rating_level_codes: string[];
  target_module: TargetModule;
  action_type: ActionType;
  action_config: Record<string, unknown>;
  action_priority: number;
  action_is_mandatory: boolean;
  action_message: string | null;
  requires_hr_override: boolean;
  auto_execute: boolean;
  requires_approval: boolean;
  approval_role: string | null;
  is_active: boolean;
  execution_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUnifiedRuleInput {
  company_id: string;
  name: string;
  description?: string;
  trigger_event?: TriggerEvent;
  condition_type: ConditionType;
  condition_operator?: ConditionOperator;
  condition_value?: number;
  condition_value_max?: number;
  condition_category_codes?: string[];
  condition_section?: ConditionSection;
  condition_threshold?: number;
  rating_level_codes?: string[];
  target_module: TargetModule;
  action_type: ActionType;
  action_config?: Record<string, unknown>;
  action_priority?: number;
  action_is_mandatory?: boolean;
  action_message?: string;
  requires_hr_override?: boolean;
  auto_execute?: boolean;
  requires_approval?: boolean;
  approval_role?: string;
  is_active?: boolean;
  execution_order?: number;
}

export function useUnifiedAppraisalRules(companyId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading, refetch } = useQuery({
    queryKey: ["unified-appraisal-rules", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("appraisal_integration_rules")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("execution_order", { ascending: true });
      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(rule => ({
        ...rule,
        condition_category_codes: Array.isArray(rule.condition_category_codes) 
          ? rule.condition_category_codes 
          : [],
        rating_level_codes: rule.rating_level_codes || [],
        condition_section: rule.condition_section || 'overall',
      })) as UnifiedAppraisalRule[];
    },
    enabled: !!companyId,
  });

  const { data: allRules = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["unified-appraisal-rules-all", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("appraisal_integration_rules")
        .select("*")
        .eq("company_id", companyId)
        .order("execution_order", { ascending: true });
      if (error) throw error;
      
      return (data || []).map(rule => ({
        ...rule,
        condition_category_codes: Array.isArray(rule.condition_category_codes) 
          ? rule.condition_category_codes 
          : [],
        rating_level_codes: rule.rating_level_codes || [],
        condition_section: rule.condition_section || 'overall',
      })) as UnifiedAppraisalRule[];
    },
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateUnifiedRuleInput) => {
      const insertData = {
        company_id: input.company_id,
        name: input.name,
        description: input.description || null,
        trigger_event: input.trigger_event || 'appraisal_finalized',
        condition_type: input.condition_type,
        condition_operator: input.condition_operator || 'in',
        condition_value: input.condition_value || null,
        condition_value_max: input.condition_value_max || null,
        condition_section: input.condition_section || 'overall',
        condition_threshold: input.condition_threshold || null,
        rating_level_codes: input.rating_level_codes || [],
        target_module: input.target_module,
        action_type: input.action_type,
        action_config: input.action_config ? JSON.parse(JSON.stringify(input.action_config)) : {},
        action_priority: input.action_priority ?? 2,
        action_is_mandatory: input.action_is_mandatory ?? false,
        action_message: input.action_message || null,
        requires_hr_override: input.requires_hr_override ?? false,
        auto_execute: input.auto_execute ?? true,
        requires_approval: input.requires_approval ?? false,
        is_active: input.is_active ?? true,
        execution_order: input.execution_order ?? 0,
      };
      const { data, error } = await supabase
        .from("appraisal_integration_rules")
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-appraisal-rules"] });
      queryClient.invalidateQueries({ queryKey: ["unified-appraisal-rules-all"] });
      toast.success("Rule created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create rule");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UnifiedAppraisalRule> & { id: string }) => {
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.trigger_event !== undefined) updateData.trigger_event = updates.trigger_event;
      if (updates.condition_type !== undefined) updateData.condition_type = updates.condition_type;
      if (updates.condition_operator !== undefined) updateData.condition_operator = updates.condition_operator;
      if (updates.condition_value !== undefined) updateData.condition_value = updates.condition_value;
      if (updates.condition_section !== undefined) updateData.condition_section = updates.condition_section;
      if (updates.condition_threshold !== undefined) updateData.condition_threshold = updates.condition_threshold;
      if (updates.rating_level_codes !== undefined) updateData.rating_level_codes = updates.rating_level_codes;
      if (updates.target_module !== undefined) updateData.target_module = updates.target_module;
      if (updates.action_type !== undefined) updateData.action_type = updates.action_type;
      if (updates.action_config !== undefined) updateData.action_config = JSON.parse(JSON.stringify(updates.action_config));
      if (updates.action_priority !== undefined) updateData.action_priority = updates.action_priority;
      if (updates.action_is_mandatory !== undefined) updateData.action_is_mandatory = updates.action_is_mandatory;
      if (updates.action_message !== undefined) updateData.action_message = updates.action_message;
      if (updates.requires_hr_override !== undefined) updateData.requires_hr_override = updates.requires_hr_override;
      if (updates.auto_execute !== undefined) updateData.auto_execute = updates.auto_execute;
      if (updates.requires_approval !== undefined) updateData.requires_approval = updates.requires_approval;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      
      const { data, error } = await supabase
        .from("appraisal_integration_rules")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-appraisal-rules"] });
      queryClient.invalidateQueries({ queryKey: ["unified-appraisal-rules-all"] });
      toast.success("Rule updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update rule");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appraisal_integration_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-appraisal-rules"] });
      queryClient.invalidateQueries({ queryKey: ["unified-appraisal-rules-all"] });
      toast.success("Rule deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete rule");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("appraisal_integration_rules")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["unified-appraisal-rules"] });
      queryClient.invalidateQueries({ queryKey: ["unified-appraisal-rules-all"] });
      toast.success(isActive ? "Rule enabled" : "Rule disabled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update rule");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) =>
        supabase
          .from("appraisal_integration_rules")
          .update({ execution_order: index })
          .eq("id", id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-appraisal-rules"] });
      queryClient.invalidateQueries({ queryKey: ["unified-appraisal-rules-all"] });
    },
  });

  return {
    rules,
    allRules,
    isLoading,
    isLoadingAll,
    refetch,
    createRule: createMutation.mutateAsync,
    updateRule: updateMutation.mutateAsync,
    deleteRule: deleteMutation.mutateAsync,
    toggleRule: toggleMutation.mutateAsync,
    reorderRules: reorderMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Trigger the orchestrator for a participant
export async function triggerAppraisalOrchestrator(participantId: string, triggerEvent: TriggerEvent = 'appraisal_finalized') {
  const { data, error } = await supabase.functions.invoke('appraisal-integration-orchestrator', {
    body: { participant_id: participantId, trigger_event: triggerEvent }
  });
  
  if (error) throw error;
  return data;
}

// Constants for UI
export const TARGET_MODULES: { value: TargetModule; label: string; description: string; icon: string }[] = [
  { value: "nine_box", label: "9-Box Assessment", description: "Update performance/potential matrix", icon: "Grid3X3" },
  { value: "succession", label: "Succession Planning", description: "Update succession readiness", icon: "Users" },
  { value: "idp", label: "Development Plan (IDP)", description: "Create development plan", icon: "FileText" },
  { value: "pip", label: "Performance Improvement (PIP)", description: "Initiate improvement plan", icon: "AlertTriangle" },
  { value: "compensation", label: "Compensation Review", description: "Flag for salary review", icon: "DollarSign" },
  { value: "workforce_analytics", label: "Workforce Analytics", description: "Update performance index", icon: "BarChart" },
  { value: "notifications", label: "Notifications", description: "Send in-app notification", icon: "Bell" },
  { value: "reminders", label: "HR Reminders", description: "Create action reminder", icon: "Calendar" },
];

export const ACTION_TYPES: { value: ActionType; label: string }[] = [
  { value: "create", label: "Create Record" },
  { value: "update", label: "Update Record" },
  { value: "flag", label: "Flag for Review" },
  { value: "archive", label: "Archive" },
  { value: "notify", label: "Send Notification" },
  { value: "sync", label: "Sync Data" },
];

export const CONDITION_SECTIONS: { value: ConditionSection; label: string }[] = [
  { value: "overall", label: "Overall Score" },
  { value: "goals", label: "Goals" },
  { value: "competencies", label: "Competencies" },
  { value: "responsibilities", label: "Responsibilities" },
  { value: "feedback_360", label: "360 Feedback" },
  { value: "values", label: "Values" },
];

export const PRIORITY_OPTIONS = [
  { value: 1, label: "Low", color: "bg-slate-500" },
  { value: 2, label: "Medium", color: "bg-amber-500" },
  { value: 3, label: "High", color: "bg-orange-500" },
  { value: 4, label: "Critical", color: "bg-destructive" },
];
