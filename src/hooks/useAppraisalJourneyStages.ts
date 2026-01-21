import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, parseISO, addDays, isBefore } from "date-fns";
import type { AppraisalTemplatePhase, AppraisalPhaseType } from "@/types/appraisalFormTemplates";
import { PHASE_TYPE_PRESETS } from "@/types/appraisalFormTemplates";
import type { LucideIcon } from "lucide-react";
import { 
  Target, User, Users, UserCheck, BarChart, 
  ShieldCheck, CheckCircle, FileCheck, Circle 
} from "lucide-react";

// Helper to check if calibration exists - defined outside hook to avoid type instantiation issues
async function checkCalibrationSessionExists(cycleId: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { count, error } = await client
    .from("calibration_sessions")
    .select("id", { count: 'exact', head: true })
    .eq("cycle_id", cycleId);
  return !error && (count || 0) > 0;
}

// Helper to fetch template phases - defined outside hook to avoid type instantiation issues
async function fetchTemplatePhases(templateId: string): Promise<AppraisalTemplatePhase[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data, error } = await client
    .from("appraisal_template_phases")
    .select("*")
    .eq("template_id", templateId)
    .eq("is_active", true)
    .order("display_order");
  if (error) throw error;
  return (data || []) as AppraisalTemplatePhase[];
}

// Actor types for who needs to take action
export type StageActor = 'employee' | 'manager' | 'hr' | 'system' | 'peers';

// Status of each stage
export type StageStatus = 'completed' | 'current' | 'pending' | 'skipped' | 'overdue' | 'at_risk';

// Journey stage with calculated data
export interface JourneyStage {
  key: string;
  phaseType: AppraisalPhaseType;
  label: string;
  icon: LucideIcon;
  actor: StageActor;
  actorLabel: string;
  status: StageStatus;
  completedAt?: string;
  deadline?: string;
  daysRemaining?: number;
  isOverdue: boolean;
  description?: string;
}

// Dispute branch stage for employee response flow
export interface DisputeStage {
  key: string;
  label: string;
  status: StageStatus;
  completedAt?: string;
}

// Icon mapping for phase types
const PHASE_ICONS: Record<AppraisalPhaseType, LucideIcon> = {
  goal_setting: Target,
  self_assessment: User,
  '360_collection': Users,
  manager_review: UserCheck,
  calibration: BarChart,
  hr_review: ShieldCheck,
  finalization: CheckCircle,
  employee_acknowledgment: FileCheck,
};

// Actor mapping for phase types
const PHASE_ACTORS: Record<AppraisalPhaseType, { actor: StageActor; label: string }> = {
  goal_setting: { actor: 'employee', label: 'Your action' },
  self_assessment: { actor: 'employee', label: 'Your action' },
  '360_collection': { actor: 'peers', label: 'Awaiting peers' },
  manager_review: { actor: 'manager', label: 'Manager action' },
  calibration: { actor: 'hr', label: 'HR/Leadership' },
  hr_review: { actor: 'hr', label: 'HR review' },
  finalization: { actor: 'system', label: 'Processing' },
  employee_acknowledgment: { actor: 'employee', label: 'Your action' },
};

// Map participant status to completed phase types
function getCompletedPhases(participantStatus: string, submittedAt: string | null, reviewedAt: string | null): AppraisalPhaseType[] {
  const completed: AppraisalPhaseType[] = [];
  
  // Self-assessment is complete if submitted
  if (submittedAt) {
    completed.push('goal_setting', 'self_assessment');
  }
  
  // Manager review is complete if reviewed
  if (reviewedAt) {
    completed.push('manager_review');
  }
  
  // Status-based completions
  if (participantStatus === 'acknowledged' || participantStatus === 'completed') {
    completed.push('finalization', 'employee_acknowledgment');
  } else if (participantStatus === 'finalized' || participantStatus === 'released') {
    completed.push('finalization');
  } else if (participantStatus === 'calibrated') {
    completed.push('calibration');
  } else if (participantStatus === 'hr_reviewed') {
    completed.push('hr_review');
  }
  
  return completed;
}

// Determine current phase based on participant data
function getCurrentPhase(
  participantStatus: string,
  submittedAt: string | null,
  reviewedAt: string | null,
  phases: AppraisalTemplatePhase[]
): AppraisalPhaseType | null {
  const phaseTypes = phases.map(p => p.phase_type);
  
  if (participantStatus === 'acknowledged' || participantStatus === 'completed') {
    return null; // All complete
  }
  
  if (participantStatus === 'finalized' || participantStatus === 'released') {
    if (phaseTypes.includes('employee_acknowledgment')) {
      return 'employee_acknowledgment';
    }
    return null;
  }
  
  if (participantStatus === 'calibrated' || participantStatus === 'hr_reviewed') {
    if (phaseTypes.includes('finalization')) {
      return 'finalization';
    }
    return null;
  }
  
  if (reviewedAt) {
    // Manager has reviewed, now calibration or HR review
    if (phaseTypes.includes('calibration')) {
      return 'calibration';
    }
    if (phaseTypes.includes('hr_review')) {
      return 'hr_review';
    }
    if (phaseTypes.includes('finalization')) {
      return 'finalization';
    }
  }
  
  if (submittedAt) {
    // Employee has submitted self-assessment
    if (phaseTypes.includes('360_collection')) {
      return '360_collection';
    }
    if (phaseTypes.includes('manager_review')) {
      return 'manager_review';
    }
  }
  
  // Not yet submitted
  if (phaseTypes.includes('self_assessment')) {
    return 'self_assessment';
  }
  if (phaseTypes.includes('goal_setting')) {
    return 'goal_setting';
  }
  
  return phaseTypes[0] || null;
}

// Calculate deadline for a phase based on cycle dates
function calculatePhaseDeadline(
  phase: AppraisalTemplatePhase,
  cycleStartDate: string
): Date {
  const startDate = parseISO(cycleStartDate);
  return addDays(startDate, phase.start_offset_days + phase.duration_days);
}

interface UseAppraisalJourneyStagesParams {
  participantId?: string;
  cycleId?: string;
  templateId?: string;
  // Participant data (can be passed directly to avoid extra queries)
  participantStatus?: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  cycleStartDate?: string;
  cycleEndDate?: string;
  // Phase-specific deadlines from cycle (new columns)
  selfAssessmentDeadline?: string | null;
  feedback360Deadline?: string | null;
  managerReviewDeadline?: string | null;
  calibrationDeadline?: string | null;
  finalizationDeadline?: string | null;
  acknowledgmentDeadline?: string | null;
  // Employee response data for dispute tracking
  employeeResponseStatus?: string | null;
  hasEmployeeResponse?: boolean;
}

export function useAppraisalJourneyStages({
  participantId,
  cycleId,
  templateId,
  participantStatus = 'pending',
  submittedAt,
  reviewedAt,
  cycleStartDate,
  cycleEndDate,
  selfAssessmentDeadline,
  feedback360Deadline,
  managerReviewDeadline,
  calibrationDeadline,
  finalizationDeadline,
  acknowledgmentDeadline,
  employeeResponseStatus,
  hasEmployeeResponse,
}: UseAppraisalJourneyStagesParams) {
  // Fetch template phases if templateId is provided
  const { data: phases = [], isLoading } = useQuery<AppraisalTemplatePhase[]>({
    queryKey: ["journey-template-phases", templateId],
    queryFn: () => templateId ? fetchTemplatePhases(templateId) : Promise.resolve([]),
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Calculate journey stages from phases
  const stages = useMemo((): JourneyStage[] => {
    if (phases.length === 0) return [];
    
    const completedPhases = getCompletedPhases(participantStatus, submittedAt || null, reviewedAt || null);
    const currentPhase = getCurrentPhase(participantStatus, submittedAt || null, reviewedAt || null, phases);
    const now = new Date();
    
    // Map of phase type to specific deadline from cycle
    const phaseDeadlines: Partial<Record<AppraisalPhaseType, string | null>> = {
      self_assessment: selfAssessmentDeadline,
      '360_collection': feedback360Deadline,
      manager_review: managerReviewDeadline,
      calibration: calibrationDeadline,
      finalization: finalizationDeadline,
      employee_acknowledgment: acknowledgmentDeadline,
    };
    
    return phases.map((phase): JourneyStage => {
      const isCompleted = completedPhases.includes(phase.phase_type);
      const isCurrent = phase.phase_type === currentPhase;
      const actorInfo = PHASE_ACTORS[phase.phase_type];
      const icon = PHASE_ICONS[phase.phase_type] || Circle;
      
      // Get deadline (prefer cycle-specific, fallback to calculated)
      let deadline: string | undefined;
      if (phaseDeadlines[phase.phase_type]) {
        deadline = phaseDeadlines[phase.phase_type]!;
      } else if (cycleStartDate) {
        deadline = calculatePhaseDeadline(phase, cycleStartDate).toISOString().split('T')[0];
      }
      
      // Calculate days remaining and overdue status
      let daysRemaining: number | undefined;
      let isOverdue = false;
      if (deadline && !isCompleted) {
        const deadlineDate = parseISO(deadline);
        daysRemaining = differenceInDays(deadlineDate, now);
        isOverdue = isBefore(deadlineDate, now);
      }
      
      // Determine status
      let status: StageStatus = 'pending';
      if (isCompleted) {
        status = 'completed';
      } else if (isCurrent) {
        if (isOverdue) {
          status = 'overdue';
        } else if (daysRemaining !== undefined && daysRemaining <= 3) {
          status = 'at_risk';
        } else {
          status = 'current';
        }
      } else if (!phase.is_mandatory) {
        status = 'skipped';
      }
      
      return {
        key: phase.id,
        phaseType: phase.phase_type,
        label: phase.phase_name || PHASE_TYPE_PRESETS[phase.phase_type].label,
        icon,
        actor: actorInfo.actor,
        actorLabel: actorInfo.label,
        status,
        deadline,
        daysRemaining,
        isOverdue,
        description: PHASE_TYPE_PRESETS[phase.phase_type].description,
      };
    });
  }, [phases, participantStatus, submittedAt, reviewedAt, cycleStartDate, selfAssessmentDeadline, feedback360Deadline, managerReviewDeadline, calibrationDeadline, finalizationDeadline, acknowledgmentDeadline]);

  // Calculate current stage index
  const currentStageIndex = useMemo(() => {
    return stages.findIndex(s => s.status === 'current' || s.status === 'at_risk' || s.status === 'overdue');
  }, [stages]);

  // Dispute branch for employee response flow
  const disputeStages = useMemo((): DisputeStage[] => {
    if (!hasEmployeeResponse) return [];
    
    const disputeFlow: DisputeStage[] = [
      {
        key: 'dispute_filed',
        label: 'Response Filed',
        status: 'completed',
        completedAt: undefined, // Would come from employee_review_responses
      },
    ];
    
    // Add HR review stage if escalated
    if (employeeResponseStatus === 'escalated_to_hr' || employeeResponseStatus === 'hr_resolved') {
      disputeFlow.push({
        key: 'hr_review',
        label: 'HR Review',
        status: employeeResponseStatus === 'hr_resolved' ? 'completed' : 'current',
      });
    }
    
    // Resolution stage
    if (employeeResponseStatus === 'resolved' || employeeResponseStatus === 'hr_resolved' || employeeResponseStatus === 'accepted') {
      disputeFlow.push({
        key: 'resolved',
        label: 'Resolved',
        status: 'completed',
      });
    }
    
    return disputeFlow;
  }, [hasEmployeeResponse, employeeResponseStatus]);

  // Check if calibration session exists for the cycle
  const { data: hasCalibration = false } = useQuery<boolean>({
    queryKey: ["journey-has-calibration", cycleId],
    queryFn: () => cycleId ? checkCalibrationSessionExists(cycleId) : Promise.resolve(false),
    enabled: !!cycleId,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    if (stages.length === 0) return 0;
    const completed = stages.filter(s => s.status === 'completed').length;
    return Math.round((completed / stages.length) * 100);
  }, [stages]);

  // Check if all stages are complete
  const isComplete = useMemo(() => {
    return stages.length > 0 && stages.every(s => s.status === 'completed' || s.status === 'skipped');
  }, [stages]);

  // Get next action text
  const nextAction = useMemo((): { text: string; actor: StageActor; isUrgent: boolean } | null => {
    const currentStage = stages.find(s => 
      s.status === 'current' || s.status === 'at_risk' || s.status === 'overdue'
    );
    if (!currentStage) return null;
    
    return {
      text: `${currentStage.label} - ${currentStage.actorLabel}`,
      actor: currentStage.actor,
      isUrgent: currentStage.status === 'overdue' || currentStage.status === 'at_risk',
    };
  }, [stages]);

  return {
    stages,
    currentStageIndex,
    hasDisputeBranch: disputeStages.length > 0,
    disputeStages,
    hasCalibration,
    isLoading,
    completionPercentage,
    isComplete,
    nextAction,
  };
}

// Helper to get default phases when no template is selected
export function getDefaultJourneyStages(): JourneyStage[] {
  const defaultPhases: AppraisalPhaseType[] = [
    'goal_setting',
    'self_assessment',
    'manager_review',
    'finalization',
    'employee_acknowledgment',
  ];
  
  return defaultPhases.map((phaseType, index) => ({
    key: `default-${phaseType}`,
    phaseType,
    label: PHASE_TYPE_PRESETS[phaseType].label,
    icon: PHASE_ICONS[phaseType],
    actor: PHASE_ACTORS[phaseType].actor,
    actorLabel: PHASE_ACTORS[phaseType].label,
    status: index === 0 ? 'current' : 'pending',
    isOverdue: false,
    description: PHASE_TYPE_PRESETS[phaseType].description,
  }));
}
