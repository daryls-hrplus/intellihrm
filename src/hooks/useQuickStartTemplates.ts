import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// Database row type
export interface QuickStartTemplateRow {
  id: string;
  module_code: string;
  title: string;
  subtitle: string | null;
  icon_name: string;
  color_class: string;
  quick_setup_time: string | null;
  full_config_time: string | null;
  breadcrumb_label: string | null;
  roles: Json;
  prerequisites: Json;
  pitfalls: Json;
  content_strategy_questions: Json;
  setup_steps: Json;
  rollout_options: Json;
  rollout_recommendation: string | null;
  verification_checks: Json;
  integration_checklist: Json;
  success_metrics: Json;
  next_steps: Json;
  status: string;
  version: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Type for updating templates
export type QuickStartTemplateUpdate = Partial<Omit<QuickStartTemplateRow, 'id' | 'created_at' | 'updated_at'>>;

// Fetch all templates
export function useQuickStartTemplates(includeAllStatuses = false) {
  return useQuery({
    queryKey: ["quickstart-templates", includeAllStatuses],
    queryFn: async () => {
      let query = supabase
        .from("enablement_quickstart_templates")
        .select("*")
        .order("module_code");
      
      if (!includeAllStatuses) {
        query = query.eq("status", "published");
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as QuickStartTemplateRow[];
    },
  });
}

// Fetch a single template by module code
export function useQuickStartTemplate(moduleCode: string) {
  return useQuery({
    queryKey: ["quickstart-template", moduleCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enablement_quickstart_templates")
        .select("*")
        .eq("module_code", moduleCode)
        .single();
      
      if (error) throw error;
      return data as QuickStartTemplateRow;
    },
    enabled: !!moduleCode,
  });
}

// Update a template
export function useUpdateQuickStartTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: QuickStartTemplateUpdate }) => {
      const { data, error } = await supabase
        .from("enablement_quickstart_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quickstart-templates"] });
      queryClient.invalidateQueries({ queryKey: ["quickstart-template", data.module_code] });
    },
  });
}

// Publish/Unpublish a template
export function usePublishQuickStartTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "draft" | "published" }) => {
      const { data, error } = await supabase
        .from("enablement_quickstart_templates")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quickstart-templates"] });
    },
  });
}

// Delete a template
export function useDeleteQuickStartTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("enablement_quickstart_templates")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quickstart-templates"] });
    },
  });
}
