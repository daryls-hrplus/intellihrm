// Types for Appraisal KRA Snapshots - Enterprise KRA-to-Appraisal Integration

export type AssessmentMode = 'responsibility_only' | 'kra_based' | 'hybrid' | 'auto';

export interface AppraisalKRASnapshot {
  id: string;
  participant_id: string;
  responsibility_id: string;
  company_id: string | null;
  
  // Source references
  source_kra_id: string | null;
  job_kra_id: string | null;
  
  // KRA details (snapshot at appraisal time)
  name: string;
  description: string | null;
  target_metric: string | null;
  job_specific_target: string | null;
  measurement_method: string | null;
  weight: number;
  sequence_order: number;
  
  // Self ratings
  self_rating: number | null;
  self_comments: string | null;
  self_rated_at: string | null;
  
  // Manager ratings
  manager_rating: number | null;
  manager_id: string | null;
  manager_comments: string | null;
  manager_rated_at: string | null;
  
  // Calculated scores
  calculated_score: number | null;
  final_score: number | null;
  weight_adjusted_score: number | null;
  
  // Evidence
  evidence_urls: string[];
  achievement_notes: string | null;
  
  // Status
  status: 'pending' | 'self_rated' | 'manager_rated' | 'completed' | 'disputed';
  
  created_at: string;
  updated_at: string;
}

export interface JobResponsibilityWithMode {
  id: string;
  job_id: string;
  responsibility_id: string;
  weighting: number;
  notes: string | null;
  start_date: string;
  end_date: string | null;
  assessment_mode: AssessmentMode;
  kra_weights_validated: boolean;
  kra_weights_validated_at: string | null;
  
  // Joined data
  responsibility?: {
    id: string;
    name: string;
    description?: string;
    category?: string;
  };
  kras?: AppraisalKRASnapshot[];
}

export interface KRASnapshotWithDetails extends AppraisalKRASnapshot {
  // Additional UI state
  isEditing?: boolean;
  hasChanges?: boolean;
}

export interface ResponsibilityAssessmentConfig {
  responsibilityId: string;
  responsibilityName: string;
  assessmentMode: AssessmentMode;
  weight: number;
  kraCount: number;
  kraWeightsValid: boolean;
  totalKRAWeight: number;
}

export const ASSESSMENT_MODE_LABELS: Record<AssessmentMode, string> = {
  'auto': 'Auto-detect',
  'responsibility_only': 'Overall Rating',
  'kra_based': 'KRA-Based',
  'hybrid': 'Hybrid (Both)',
};

export const ASSESSMENT_MODE_DESCRIPTIONS: Record<AssessmentMode, string> = {
  'auto': 'System determines based on whether KRAs exist',
  'responsibility_only': 'Rate the responsibility as a whole (1-5)',
  'kra_based': 'Rate each KRA individually, rollup to responsibility score',
  'hybrid': 'Rate both responsibility overall + individual KRAs',
};
