// Development Theme Types for Phase B

export type RecommendationType = 
  | 'learning' 
  | 'experience' 
  | 'mentoring' 
  | 'coaching' 
  | 'stretch_assignment';

export type MeasurementType = 'full_360' | 'pulse' | 'manager_check';

export type RemeasurementStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type IDPLinkType = 'derived' | 'informed' | 'validated';

export interface DevelopmentTheme {
  id: string;
  employee_id: string;
  company_id: string;
  source_cycle_id: string | null;
  theme_code: string | null;
  theme_name: string;
  theme_description: string | null;
  signal_ids: string[] | null;
  confidence_score: number | null;
  ai_generated: boolean;
  is_confirmed: boolean;
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevelopmentRecommendation {
  id: string;
  theme_id: string;
  recommendation_type: RecommendationType;
  recommendation_text: string;
  priority_order: number;
  linked_learning_path_id: string | null;
  linked_course_ids: string[] | null;
  is_accepted: boolean;
  accepted_at: string | null;
  created_at: string;
}

export interface IDPFeedbackLink {
  id: string;
  idp_id: string | null;
  idp_item_id: string | null;
  source_theme_id: string | null;
  source_cycle_id: string | null;
  link_type: IDPLinkType;
  created_at: string;
}

export interface FeedbackRemeasurementPlan {
  id: string;
  employee_id: string;
  company_id: string;
  source_cycle_id: string | null;
  focus_areas: {
    themes: string[];
    signals: string[];
    competencies: string[];
  } | null;
  scheduled_date: string;
  measurement_type: MeasurementType;
  status: RemeasurementStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppraisalEvidenceUsage {
  id: string;
  participant_id: string;
  evidence_type: string;
  source_snapshot_id: string | null;
  was_viewed: boolean;
  was_referenced: boolean;
  view_timestamp: string | null;
  reference_timestamp: string | null;
  created_at: string;
}

// Coaching prompt types
export interface CoachingPrompt {
  id: string;
  category: 'strength' | 'development' | 'blind_spot' | 'exploration';
  prompt_text: string;
  context: string;
  signal_code?: string;
}

// Insight caution types
export interface InsightCaution {
  type: 'low_sample' | 'high_variance' | 'outlier' | 'recency_bias' | 'single_source';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  details: string;
}
