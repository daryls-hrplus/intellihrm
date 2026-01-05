import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AudienceType = "executive" | "manager" | "individual_contributor" | "hr" | "self";
export type ContentDepth = "high_level" | "summary" | "detailed" | "comprehensive";
export type AnonymityLevel = "strict" | "standard" | "relaxed";

export interface SectionsConfig {
  executive_summary: boolean;
  score_breakdown: boolean;
  category_analysis: boolean;
  question_details: boolean;
  verbatim_comments: boolean;
  anonymized_themes: boolean;
  comparison_to_norm: boolean;
  development_suggestions: boolean;
  ai_insights: boolean;
}

export interface VisualizationConfig {
  chart_types: string[];
  show_benchmarks: boolean;
  color_scheme: string;
}

export interface FeedbackReportTemplate {
  id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  audience_type: AudienceType;
  sections_config: SectionsConfig;
  visualization_config: VisualizationConfig;
  content_depth: ContentDepth;
  anonymity_level: AnonymityLevel;
  is_default: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useFeedbackReportTemplates(companyId?: string) {
  return useQuery({
    queryKey: ["feedback-report-templates", companyId],
    queryFn: async () => {
      let query = supabase
        .from("feedback_report_templates")
        .select("*")
        .eq("is_active", true)
        .order("audience_type", { ascending: true });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as FeedbackReportTemplate[];
    },
    enabled: true,
  });
}

export function useFeedbackReportTemplate(templateId?: string) {
  return useQuery({
    queryKey: ["feedback-report-template", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      
      const { data, error } = await supabase
        .from("feedback_report_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (error) throw error;
      return data as unknown as FeedbackReportTemplate;
    },
    enabled: !!templateId,
  });
}

export function useCreateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Partial<FeedbackReportTemplate>) => {
      const { data, error } = await supabase
        .from("feedback_report_templates")
        .insert(template as any)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as FeedbackReportTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback-report-templates"] });
      toast.success("Report template created");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create report template");
    },
  });
}

export function useUpdateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeedbackReportTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("feedback_report_templates")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as FeedbackReportTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback-report-templates"] });
      toast.success("Report template updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update report template");
    },
  });
}

export function useDeleteReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from("feedback_report_templates")
        .update({ is_active: false })
        .eq("id", templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback-report-templates"] });
      toast.success("Report template deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete report template");
    },
  });
}

export function useSetDefaultTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, companyId, audienceType }: { 
      templateId: string; 
      companyId: string; 
      audienceType: AudienceType 
    }) => {
      // First, unset any existing default for this audience type
      await supabase
        .from("feedback_report_templates")
        .update({ is_default: false })
        .eq("company_id", companyId)
        .eq("audience_type", audienceType);

      // Then set the new default
      const { error } = await supabase
        .from("feedback_report_templates")
        .update({ is_default: true })
        .eq("id", templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback-report-templates"] });
      toast.success("Default template updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to set default template");
    },
  });
}
