import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { 
  AppraisalTemplateSection, 
  CreateTemplateSectionInput,
  WeightValidationResult,
  WeightEnforcement 
} from "@/types/appraisalFormTemplates";

export function useAppraisalTemplateSections(templateId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading, refetch } = useQuery({
    queryKey: ["appraisal-template-sections", templateId],
    queryFn: async () => {
      if (!templateId) return [];
      const { data, error } = await supabase
        .from("appraisal_template_sections")
        .select("*")
        .eq("template_id", templateId)
        .order("display_order");
      if (error) throw error;
      return data as AppraisalTemplateSection[];
    },
    enabled: !!templateId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateTemplateSectionInput) => {
      const { data, error } = await supabase
        .from("appraisal_template_sections")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-template-sections", templateId] });
      toast.success("Section added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add section");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AppraisalTemplateSection> & { id: string }) => {
      const { data, error } = await supabase
        .from("appraisal_template_sections")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-template-sections", templateId] });
      toast.success("Section updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update section");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appraisal_template_sections")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-template-sections", templateId] });
      toast.success("Section removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove section");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => ({
        id,
        display_order: index,
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from("appraisal_template_sections")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-template-sections", templateId] });
      toast.success("Sections reordered");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reorder sections");
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (inputs: CreateTemplateSectionInput[]) => {
      const { data, error } = await supabase
        .from("appraisal_template_sections")
        .insert(inputs)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-template-sections", templateId] });
      toast.success("Sections created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create sections");
    },
  });

  return {
    sections,
    isLoading,
    refetch,
    createSection: createMutation.mutateAsync,
    updateSection: updateMutation.mutateAsync,
    deleteSection: deleteMutation.mutateAsync,
    reorderSections: reorderMutation.mutateAsync,
    bulkCreateSections: bulkCreateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Validate section weights based on enforcement mode
export function validateSectionWeights(
  sections: AppraisalTemplateSection[],
  enforcement: WeightEnforcement = 'strict'
): WeightValidationResult {
  // Only count sections that are included in final score
  const scoredSections = sections.filter(s => s.include_in_final_score && s.is_active);
  const total = scoredSections.reduce((sum, s) => sum + (s.weight || 0), 0);

  switch (enforcement) {
    case 'strict':
      if (total !== 100) {
        return { 
          valid: false, 
          total, 
          message: `Weights must sum to 100% (currently ${total}%)` 
        };
      }
      return { valid: true, total };
    
    case 'relaxed':
      if (total > 100) {
        return { 
          valid: false, 
          total, 
          message: `Weights cannot exceed 100% (currently ${total}%)` 
        };
      }
      return { valid: true, total };
    
    case 'none':
      return { 
        valid: true, 
        total, 
        message: 'Qualitative mode - weights not enforced' 
      };
    
    default:
      return { valid: true, total };
  }
}

// Calculate section deadline based on cycle dates and offset
export function calculateSectionDeadline(
  cycleEndDate: Date,
  evaluationOffsetDays: number,
  sectionOffsetDays: number
): Date {
  const evaluationDeadline = new Date(cycleEndDate);
  evaluationDeadline.setDate(evaluationDeadline.getDate() - evaluationOffsetDays);
  
  const sectionDeadline = new Date(evaluationDeadline);
  sectionDeadline.setDate(sectionDeadline.getDate() - sectionOffsetDays);
  
  return sectionDeadline;
}
