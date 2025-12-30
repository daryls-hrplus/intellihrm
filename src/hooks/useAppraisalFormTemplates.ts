import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AppraisalFormTemplate {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  description_en: string | null;
  include_goals: boolean;
  include_competencies: boolean;
  include_responsibilities: boolean;
  include_360_feedback: boolean;
  include_values: boolean;
  goals_weight: number;
  competencies_weight: number;
  responsibilities_weight: number;
  feedback_360_weight: number;
  values_weight: number;
  rating_scale_id: string | null;
  overall_scale_id: string | null;
  min_rating: number;
  max_rating: number;
  is_default: boolean;
  is_locked: boolean;
  allow_weight_override: boolean;
  requires_hr_approval_for_override: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateTemplateInput {
  company_id: string;
  name: string;
  code: string;
  description?: string;
  description_en?: string;
  include_goals?: boolean;
  include_competencies?: boolean;
  include_responsibilities?: boolean;
  include_360_feedback?: boolean;
  include_values?: boolean;
  goals_weight?: number;
  competencies_weight?: number;
  responsibilities_weight?: number;
  feedback_360_weight?: number;
  values_weight?: number;
  rating_scale_id?: string;
  overall_scale_id?: string;
  min_rating?: number;
  max_rating?: number;
  is_default?: boolean;
  is_locked?: boolean;
  allow_weight_override?: boolean;
  requires_hr_approval_for_override?: boolean;
  is_active?: boolean;
}

export function useAppraisalFormTemplates(companyId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading, refetch } = useQuery({
    queryKey: ["appraisal-form-templates", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("appraisal_form_templates")
        .select("*")
        .eq("company_id", companyId)
        .order("name");
      if (error) throw error;
      return data as AppraisalFormTemplate[];
    },
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      const { data, error } = await supabase
        .from("appraisal_form_templates")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-form-templates"] });
      toast.success("Template created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create template");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AppraisalFormTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("appraisal_form_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-form-templates"] });
      toast.success("Template updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update template");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appraisal_form_templates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-form-templates"] });
      toast.success("Template deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete template");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async ({ id, newName, newCode }: { id: string; newName: string; newCode: string }) => {
      const template = templates.find(t => t.id === id);
      if (!template) throw new Error("Template not found");

      const { id: _id, created_at, updated_at, ...rest } = template;
      const { data, error } = await supabase
        .from("appraisal_form_templates")
        .insert({
          ...rest,
          name: newName,
          code: newCode,
          is_default: false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-form-templates"] });
      toast.success("Template duplicated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to duplicate template");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, unset all defaults for this company
      await supabase
        .from("appraisal_form_templates")
        .update({ is_default: false })
        .eq("company_id", companyId!);
      
      // Then set the new default
      const { error } = await supabase
        .from("appraisal_form_templates")
        .update({ is_default: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-form-templates"] });
      toast.success("Default template updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to set default template");
    },
  });

  return {
    templates,
    isLoading,
    refetch,
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    duplicateTemplate: duplicateMutation.mutateAsync,
    setDefaultTemplate: setDefaultMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function validateWeights(template: Partial<AppraisalFormTemplate>): { valid: boolean; total: number; message?: string } {
  const goals = template.include_goals ? (template.goals_weight || 0) : 0;
  const competencies = template.include_competencies ? (template.competencies_weight || 0) : 0;
  const responsibilities = template.include_responsibilities ? (template.responsibilities_weight || 0) : 0;
  const feedback360 = template.include_360_feedback ? (template.feedback_360_weight || 0) : 0;
  const values = template.include_values ? (template.values_weight || 0) : 0;

  const total = goals + competencies + responsibilities + feedback360 + values;

  if (total !== 100) {
    return { valid: false, total, message: `Weights must sum to 100% (currently ${total}%)` };
  }

  return { valid: true, total };
}
