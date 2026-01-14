import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { 
  AppraisalTemplatePhase, 
  CreateTemplatePhaseInput,
  PhaseWithDates 
} from "@/types/appraisalFormTemplates";

export function useAppraisalTemplatePhases(templateId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: phases = [], isLoading, refetch } = useQuery({
    queryKey: ["appraisal-template-phases", templateId],
    queryFn: async () => {
      if (!templateId) return [];
      const { data, error } = await supabase
        .from("appraisal_template_phases")
        .select("*")
        .eq("template_id", templateId)
        .order("display_order");
      if (error) throw error;
      return data as AppraisalTemplatePhase[];
    },
    enabled: !!templateId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateTemplatePhaseInput) => {
      const { data, error } = await supabase
        .from("appraisal_template_phases")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-template-phases", templateId] });
      toast.success("Phase added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add phase");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AppraisalTemplatePhase> & { id: string }) => {
      const { data, error } = await supabase
        .from("appraisal_template_phases")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-template-phases", templateId] });
      toast.success("Phase updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update phase");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appraisal_template_phases")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-template-phases", templateId] });
      toast.success("Phase removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove phase");
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
          .from("appraisal_template_phases")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-template-phases", templateId] });
      toast.success("Phases reordered");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reorder phases");
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (inputs: CreateTemplatePhaseInput[]) => {
      const { data, error } = await supabase
        .from("appraisal_template_phases")
        .insert(inputs)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-template-phases", templateId] });
      toast.success("Phases created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create phases");
    },
  });

  return {
    phases,
    isLoading,
    refetch,
    createPhase: createMutation.mutateAsync,
    updatePhase: updateMutation.mutateAsync,
    deletePhase: deleteMutation.mutateAsync,
    reorderPhases: reorderMutation.mutateAsync,
    bulkCreatePhases: bulkCreateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Calculate phase dates based on cycle start date
export function calculatePhaseDates(
  phases: AppraisalTemplatePhase[],
  cycleStartDate: Date
): PhaseWithDates[] {
  return phases.map(phase => {
    const startDate = new Date(cycleStartDate);
    startDate.setDate(startDate.getDate() + phase.start_offset_days);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + phase.duration_days);
    
    return {
      ...phase,
      calculated_start_date: startDate,
      calculated_end_date: endDate,
    };
  });
}

// Get total duration of all phases
export function getTotalPhaseDuration(phases: AppraisalTemplatePhase[]): number {
  if (phases.length === 0) return 0;
  
  // Find the maximum end point
  let maxEndDay = 0;
  phases.forEach(phase => {
    const endDay = phase.start_offset_days + phase.duration_days;
    if (endDay > maxEndDay) {
      maxEndDay = endDay;
    }
  });
  
  return maxEndDay;
}

// Validate phase timeline for conflicts
export function validatePhaseTimeline(phases: AppraisalTemplatePhase[]): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for dependency cycles
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function hasCycle(phaseId: string): boolean {
    if (recursionStack.has(phaseId)) return true;
    if (visited.has(phaseId)) return false;
    
    visited.add(phaseId);
    recursionStack.add(phaseId);
    
    const phase = phases.find(p => p.id === phaseId);
    if (phase?.depends_on_phase_id) {
      if (hasCycle(phase.depends_on_phase_id)) return true;
    }
    
    recursionStack.delete(phaseId);
    return false;
  }
  
  for (const phase of phases) {
    if (hasCycle(phase.id)) {
      issues.push(`Circular dependency detected involving "${phase.phase_name}"`);
    }
  }
  
  // Check for overlapping mandatory phases that aren't parallel
  const mandatoryPhases = phases.filter(p => p.is_mandatory && !p.allow_parallel);
  for (let i = 0; i < mandatoryPhases.length; i++) {
    for (let j = i + 1; j < mandatoryPhases.length; j++) {
      const a = mandatoryPhases[i];
      const b = mandatoryPhases[j];
      
      const aEnd = a.start_offset_days + a.duration_days;
      const bEnd = b.start_offset_days + b.duration_days;
      
      // Check if they overlap
      if (a.start_offset_days < bEnd && b.start_offset_days < aEnd) {
        issues.push(`"${a.phase_name}" and "${b.phase_name}" overlap but aren't marked as parallel`);
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

// Format phase duration for display
export function formatPhaseDuration(days: number): string {
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days === 7) return "1 week";
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  if (days === 30) return "1 month";
  return `${Math.round(days / 30)} months`;
}
