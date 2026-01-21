import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { 
  AppraisalTemplatePhase, 
  CreateTemplatePhaseInput,
  PhaseWithDates,
  AppraisalCycleType
} from "@/types/appraisalFormTemplates";
import { CYCLE_TYPE_PRESETS, PHASE_TYPE_PRESETS } from "@/types/appraisalFormTemplates";

// Industry-standard phase ordering (position in workflow)
export const PHASE_ORDER_PRIORITY: Record<string, number> = {
  goal_setting: 1,
  self_assessment: 2,
  '360_collection': 3,
  manager_review: 4,
  calibration: 5,
  hr_review: 6,
  rating_release: 7,
  finalization: 8,
  employee_acknowledgment: 9,
};

// Get suggested phase order based on industry standards
export function getSuggestedPhaseOrder(phases: AppraisalTemplatePhase[]): AppraisalTemplatePhase[] {
  return [...phases].sort((a, b) => {
    const aPriority = PHASE_ORDER_PRIORITY[a.phase_type] ?? 99;
    const bPriority = PHASE_ORDER_PRIORITY[b.phase_type] ?? 99;
    return aPriority - bPriority;
  });
}

// Generate phase presets for a given cycle type
export function generatePhasePresets(
  cycleType: AppraisalCycleType,
  templateId: string
): CreateTemplatePhaseInput[] {
  const cyclePreset = CYCLE_TYPE_PRESETS[cycleType];
  let currentOffset = 0;
  
  return cyclePreset.suggestedPhases.map((phaseType, index) => {
    const phasePreset = PHASE_TYPE_PRESETS[phaseType];
    const phase: CreateTemplatePhaseInput = {
      template_id: templateId,
      phase_type: phaseType,
      phase_name: phasePreset.label,
      display_order: index,
      start_offset_days: currentOffset,
      duration_days: phasePreset.defaultDurationDays,
      is_mandatory: true,
      notify_on_start: true,
      notify_on_deadline: true,
    };
    
    // Advance offset for next phase
    currentOffset += phasePreset.defaultDurationDays;
    
    return phase;
  });
}

// Template configuration interface for conditional phase logic
interface TemplateConfig {
  include_goals?: boolean;
  include_360_feedback?: boolean;
  include_calibration?: boolean;
  include_hr_review?: boolean;
  include_rating_release?: boolean;
}

// Get required phases based on template configuration
export function getRequiredPhases(templateConfig: TemplateConfig): string[] {
  const requiredPhases: string[] = ['self_assessment', 'manager_review', 'finalization', 'employee_acknowledgment'];
  
  // Goal Setting is required when goals are included
  if (templateConfig.include_goals) {
    requiredPhases.unshift('goal_setting');
  }
  
  // 360 Collection is required when 360 feedback is included
  if (templateConfig.include_360_feedback) {
    // Insert after self_assessment
    const selfAssessmentIndex = requiredPhases.indexOf('self_assessment');
    requiredPhases.splice(selfAssessmentIndex + 1, 0, '360_collection');
  }
  
  // Calibration is typically included for annual reviews
  if (templateConfig.include_calibration !== false) {
    // Insert after manager_review
    const managerReviewIndex = requiredPhases.indexOf('manager_review');
    if (managerReviewIndex !== -1) {
      requiredPhases.splice(managerReviewIndex + 1, 0, 'calibration');
    }
  }
  
  // HR Review is optional (checkpoint before finalization)
  if (templateConfig.include_hr_review) {
    const finalizationIndex = requiredPhases.indexOf('finalization');
    if (finalizationIndex !== -1) {
      requiredPhases.splice(finalizationIndex, 0, 'hr_review');
    }
  }
  
  // Rating Release phase (explicit release to employees)
  if (templateConfig.include_rating_release) {
    const finalizationIndex = requiredPhases.indexOf('finalization');
    if (finalizationIndex !== -1) {
      requiredPhases.splice(finalizationIndex + 1, 0, 'rating_release');
    }
  }
  
  return requiredPhases;
}

// Generate phases with conditional inclusion based on template settings
export function generateConditionalPhasePresets(
  cycleType: AppraisalCycleType,
  templateId: string,
  templateConfig: TemplateConfig
): CreateTemplatePhaseInput[] {
  const requiredPhaseTypes = getRequiredPhases(templateConfig);
  let currentOffset = 0;
  
  return requiredPhaseTypes.map((phaseType, index) => {
    const phasePreset = PHASE_TYPE_PRESETS[phaseType as keyof typeof PHASE_TYPE_PRESETS];
    if (!phasePreset) {
      console.warn(`Unknown phase type: ${phaseType}`);
      return null;
    }
    
    const phase: CreateTemplatePhaseInput = {
      template_id: templateId,
      phase_type: phaseType as any,
      phase_name: phasePreset.label,
      display_order: index,
      start_offset_days: currentOffset,
      duration_days: phasePreset.defaultDurationDays,
      is_mandatory: true,
      notify_on_start: true,
      notify_on_deadline: true,
    };
    
    // Advance offset for next phase
    currentOffset += phasePreset.defaultDurationDays;
    
    return phase;
  }).filter((p): p is CreateTemplatePhaseInput => p !== null);
}

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

  // === COMPREHENSIVE PHASE ORDERING VALIDATION ===
  
  // 1. Goal Setting should be first (if present)
  const goalSettingPhase = phases.find(p => p.phase_type === 'goal_setting');
  if (goalSettingPhase) {
    const earlierPhase = phases.find(p => 
      p.id !== goalSettingPhase.id && 
      p.display_order < goalSettingPhase.display_order
    );
    if (earlierPhase) {
      issues.push('Goal Setting should be the first phase in the workflow');
    }
  }

  // 2. Self Assessment must come before Manager Review
  const selfAssessmentPhase = phases.find(p => p.phase_type === 'self_assessment');
  const managerReviewPhase = phases.find(p => p.phase_type === 'manager_review');
  if (selfAssessmentPhase && managerReviewPhase) {
    if (selfAssessmentPhase.display_order >= managerReviewPhase.display_order) {
      issues.push('Self Assessment must come before Manager Review');
    }
  }

  // 3. 360 Collection should complete before Calibration
  const collection360Phase = phases.find(p => p.phase_type === '360_collection');
  const calibrationPhase = phases.find(p => p.phase_type === 'calibration');
  if (collection360Phase && calibrationPhase) {
    if (collection360Phase.display_order >= calibrationPhase.display_order) {
      issues.push('360 Feedback Collection should complete before Calibration');
    }
  }

  // 4. Calibration must come after Manager Review
  if (calibrationPhase && managerReviewPhase) {
    if (calibrationPhase.display_order <= managerReviewPhase.display_order) {
      issues.push('Calibration must come after Manager Review');
    }
  }

  // 5. HR Review phase ordering (must be after Calibration, before Finalization)
  const hrReviewPhase = phases.find(p => p.phase_type === 'hr_review');
  const finalizationPhase = phases.find(p => p.phase_type === 'finalization');
  if (hrReviewPhase) {
    if (calibrationPhase && hrReviewPhase.display_order <= calibrationPhase.display_order) {
      issues.push('HR Review must come after Calibration in the workflow');
    }
    
    if (finalizationPhase && hrReviewPhase.display_order >= finalizationPhase.display_order) {
      issues.push('HR Review must come before Finalization in the workflow');
    }
  }

  // 6. Finalization must come after Calibration (if both exist)
  if (finalizationPhase && calibrationPhase) {
    if (finalizationPhase.display_order <= calibrationPhase.display_order) {
      issues.push('Finalization must come after Calibration');
    }
  }

  // 7. Employee Acknowledgment must be last (if present)
  const acknowledgmentPhase = phases.find(p => p.phase_type === 'employee_acknowledgment');
  if (acknowledgmentPhase) {
    const laterPhase = phases.find(p => 
      p.id !== acknowledgmentPhase.id && 
      p.display_order > acknowledgmentPhase.display_order
    );
    if (laterPhase) {
      issues.push('Employee Acknowledgment must be the last phase in the workflow');
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
  const weeks = Math.round(days / 7);
  if (days < 30) return weeks === 1 ? "1 week" : `${weeks} weeks`;
  if (days === 30) return "1 month";
  const months = Math.round(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
}
