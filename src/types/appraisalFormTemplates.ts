// Types for Industry-Aligned Appraisal Form Templates

// Scoring method options for sections
export type SectionScoringMethod = 'numeric' | 'qualitative' | 'advisory' | 'pass_fail';

// Weight enforcement mode
export type WeightEnforcement = 'strict' | 'relaxed' | 'none';

// Cycle types that templates can be associated with
export type AppraisalCycleType = 
  | 'annual' 
  | 'mid_year' 
  | 'quarterly' 
  | 'probation' 
  | 'manager_360' 
  | 'project_based' 
  | 'continuous';

// Section types available in templates
export type AppraisalSectionType = 
  | 'goals' 
  | 'competencies' 
  | 'responsibilities' 
  | 'feedback_360' 
  | 'values' 
  | 'self_reflection' 
  | 'custom';

// Phase types in the appraisal lifecycle
export type AppraisalPhaseType = 
  | 'goal_setting' 
  | 'self_assessment' 
  | 'manager_review' 
  | '360_collection' 
  | 'calibration' 
  | 'finalization' 
  | 'employee_acknowledgment';

// Advance conditions for phase automation
export type PhaseAdvanceCondition = 
  | 'all_complete' 
  | 'deadline_passed' 
  | 'approval_received';

// Data sources for sections
export type SectionDataSource = 
  | 'goals_table' 
  | 'competencies_table' 
  | 'responsibilities_table' 
  | '360_responses' 
  | 'manual_entry';

// Template section configuration
export interface AppraisalTemplateSection {
  id: string;
  template_id: string;
  section_type: AppraisalSectionType;
  display_name: string;
  display_order: number;
  
  // Scoring Behavior
  scoring_method: SectionScoringMethod;
  include_in_final_score: boolean;
  weight: number;
  
  // Data Configuration
  data_source: SectionDataSource | null;
  is_required: boolean;
  
  // Visibility
  visible_to_employee: boolean;
  visible_to_manager: boolean;
  visible_to_hr: boolean;
  
  // 360 Specific
  is_advisory_only: boolean;
  advisory_label: string | null;
  max_weight_cap: number | null;
  
  // Date-driven
  deadline_offset_days: number;
  reminder_days_before: number[];
  
  // AI interpretation
  ai_interpretation_hint: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Template phase configuration
export interface AppraisalTemplatePhase {
  id: string;
  template_id: string;
  phase_type: AppraisalPhaseType;
  phase_name: string;
  display_order: number;
  
  // Timing configuration
  start_offset_days: number;
  duration_days: number;
  is_mandatory: boolean;
  
  // Dependencies
  depends_on_phase_id: string | null;
  allow_parallel: boolean;
  
  // Automation
  auto_advance: boolean;
  advance_condition: PhaseAdvanceCondition | null;
  
  // Notifications
  notify_on_start: boolean;
  notify_on_deadline: boolean;
  reminder_intervals: number[];
  
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Extended template interface with new fields
export interface ExtendedAppraisalFormTemplate {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  description_en: string | null;
  
  // Legacy section toggles (still used for quick config)
  include_goals: boolean;
  include_competencies: boolean;
  include_responsibilities: boolean;
  include_360_feedback: boolean;
  include_values: boolean;
  
  // Legacy weights
  goals_weight: number;
  competencies_weight: number;
  responsibilities_weight: number;
  feedback_360_weight: number;
  values_weight: number;
  
  // Rating configuration
  rating_scale_id: string | null;
  overall_scale_id: string | null;
  min_rating: number;
  max_rating: number;
  
  // Governance
  is_default: boolean;
  is_locked: boolean;
  allow_weight_override: boolean;
  requires_hr_approval_for_override: boolean;
  is_active: boolean;
  
  // NEW: Versioning
  version_number: number;
  version_notes: string | null;
  is_draft: boolean;
  published_at: string | null;
  cloned_from_id: string | null;
  cloned_from_version: number | null;
  
  // NEW: Cycle type association
  applicable_cycle_types: AppraisalCycleType[];
  weight_enforcement: WeightEnforcement;
  
  // NEW: Date defaults
  default_duration_days: number;
  default_evaluation_offset_days: number;
  default_grace_period_days: number;
  auto_calculate_dates: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Input types for creating/updating
export interface CreateTemplateSectionInput {
  template_id: string;
  section_type: AppraisalSectionType;
  display_name: string;
  display_order?: number;
  scoring_method?: SectionScoringMethod;
  include_in_final_score?: boolean;
  weight?: number;
  data_source?: SectionDataSource | null;
  is_required?: boolean;
  visible_to_employee?: boolean;
  visible_to_manager?: boolean;
  visible_to_hr?: boolean;
  is_advisory_only?: boolean;
  advisory_label?: string | null;
  max_weight_cap?: number | null;
  deadline_offset_days?: number;
  reminder_days_before?: number[];
  ai_interpretation_hint?: string | null;
  is_active?: boolean;
}

export interface CreateTemplatePhaseInput {
  template_id: string;
  phase_type: AppraisalPhaseType;
  phase_name: string;
  display_order?: number;
  start_offset_days?: number;
  duration_days?: number;
  is_mandatory?: boolean;
  depends_on_phase_id?: string | null;
  allow_parallel?: boolean;
  auto_advance?: boolean;
  advance_condition?: PhaseAdvanceCondition | null;
  notify_on_start?: boolean;
  notify_on_deadline?: boolean;
  reminder_intervals?: number[];
  is_active?: boolean;
}

// Validation result type
export interface WeightValidationResult {
  valid: boolean;
  total: number;
  message?: string;
}

// Phase with calculated dates for preview
export interface PhaseWithDates extends AppraisalTemplatePhase {
  calculated_start_date?: Date;
  calculated_end_date?: Date;
}

// Section with calculated deadline for preview
export interface SectionWithDeadline extends AppraisalTemplateSection {
  calculated_deadline?: Date;
}

// Cycle type configuration presets
export const CYCLE_TYPE_PRESETS: Record<AppraisalCycleType, {
  label: string;
  defaultDurationDays: number;
  defaultEvaluationOffset: number;
  suggestedPhases: AppraisalPhaseType[];
  weightEnforcement: WeightEnforcement;
}> = {
  annual: {
    label: 'Annual Review',
    defaultDurationDays: 365,
    defaultEvaluationOffset: 14,
    suggestedPhases: ['goal_setting', 'self_assessment', '360_collection', 'manager_review', 'calibration', 'finalization', 'employee_acknowledgment'],
    weightEnforcement: 'strict',
  },
  mid_year: {
    label: 'Mid-Year Review',
    defaultDurationDays: 180,
    defaultEvaluationOffset: 10,
    suggestedPhases: ['self_assessment', 'manager_review', 'finalization'],
    weightEnforcement: 'strict',
  },
  quarterly: {
    label: 'Quarterly Review',
    defaultDurationDays: 90,
    defaultEvaluationOffset: 7,
    suggestedPhases: ['self_assessment', 'manager_review', 'finalization'],
    weightEnforcement: 'strict',
  },
  probation: {
    label: 'Probation Review',
    defaultDurationDays: 90,
    defaultEvaluationOffset: 7,
    suggestedPhases: ['self_assessment', 'manager_review', 'finalization'],
    weightEnforcement: 'strict',
  },
  manager_360: {
    label: 'Manager 360 Review',
    defaultDurationDays: 30,
    defaultEvaluationOffset: 7,
    suggestedPhases: ['360_collection', 'manager_review', 'finalization'],
    weightEnforcement: 'relaxed',
  },
  project_based: {
    label: 'Project-Based Review',
    defaultDurationDays: 30,
    defaultEvaluationOffset: 5,
    suggestedPhases: ['self_assessment', 'manager_review', 'finalization'],
    weightEnforcement: 'relaxed',
  },
  continuous: {
    label: 'Continuous Feedback',
    defaultDurationDays: 0,
    defaultEvaluationOffset: 0,
    suggestedPhases: [],
    weightEnforcement: 'none',
  },
};

// Section type configuration presets
export const SECTION_TYPE_PRESETS: Record<AppraisalSectionType, {
  label: string;
  icon: string;
  defaultScoringMethod: SectionScoringMethod;
  defaultDataSource: SectionDataSource | null;
  aiHint: string;
  is360: boolean;
}> = {
  goals: {
    label: 'Goals',
    icon: 'Target',
    defaultScoringMethod: 'numeric',
    defaultDataSource: 'goals_table',
    aiHint: 'Individual OKRs set at cycle start, weighted by strategic priority',
    is360: false,
  },
  competencies: {
    label: 'Competencies',
    icon: 'BookOpen',
    defaultScoringMethod: 'numeric',
    defaultDataSource: 'competencies_table',
    aiHint: 'Behavioral assessments against job-level competency profiles',
    is360: false,
  },
  responsibilities: {
    label: 'Responsibilities',
    icon: 'Users',
    defaultScoringMethod: 'numeric',
    defaultDataSource: 'responsibilities_table',
    aiHint: 'Core job function performance evaluation',
    is360: false,
  },
  feedback_360: {
    label: '360 Feedback',
    icon: 'MessageSquare',
    defaultScoringMethod: 'advisory',
    defaultDataSource: '360_responses',
    aiHint: 'Multi-rater perspective for development insights, not direct scoring',
    is360: true,
  },
  values: {
    label: 'Values',
    icon: 'Heart',
    defaultScoringMethod: 'numeric',
    defaultDataSource: 'manual_entry',
    aiHint: 'Alignment with organizational values and culture',
    is360: false,
  },
  self_reflection: {
    label: 'Self Reflection',
    icon: 'User',
    defaultScoringMethod: 'qualitative',
    defaultDataSource: 'manual_entry',
    aiHint: 'Employee self-assessment narrative, no direct scoring',
    is360: false,
  },
  custom: {
    label: 'Custom Section',
    icon: 'Layers',
    defaultScoringMethod: 'numeric',
    defaultDataSource: 'manual_entry',
    aiHint: 'Company-specific evaluation criteria',
    is360: false,
  },
};

// Phase type configuration presets
export const PHASE_TYPE_PRESETS: Record<AppraisalPhaseType, {
  label: string;
  icon: string;
  defaultDurationDays: number;
  description: string;
}> = {
  goal_setting: {
    label: 'Goal Setting',
    icon: 'Target',
    defaultDurationDays: 14,
    description: 'Employees and managers define goals for the review period',
  },
  self_assessment: {
    label: 'Self Assessment',
    icon: 'User',
    defaultDurationDays: 10,
    description: 'Employees complete their self-evaluation',
  },
  '360_collection': {
    label: '360 Feedback Collection',
    icon: 'MessageSquare',
    defaultDurationDays: 21,
    description: 'Collect feedback from peers, direct reports, and stakeholders',
  },
  manager_review: {
    label: 'Manager Review',
    icon: 'UserCheck',
    defaultDurationDays: 14,
    description: 'Managers complete their evaluation of team members',
  },
  calibration: {
    label: 'Calibration',
    icon: 'BarChart',
    defaultDurationDays: 7,
    description: 'Leadership reviews and calibrates ratings across teams',
  },
  finalization: {
    label: 'Finalization',
    icon: 'CheckCircle',
    defaultDurationDays: 7,
    description: 'Final ratings locked and prepared for communication',
  },
  employee_acknowledgment: {
    label: 'Employee Acknowledgment',
    icon: 'FileCheck',
    defaultDurationDays: 7,
    description: 'Employees review and acknowledge their final evaluation',
  },
};
