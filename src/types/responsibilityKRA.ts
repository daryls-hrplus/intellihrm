// Types for structured Responsibility KRAs

export interface ResponsibilityKRA {
  id: string;
  responsibility_id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  target_metric: string | null;
  measurement_method: string | null;
  weight: number;
  sequence_order: number;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KRARatingSubmission {
  id: string;
  participant_id: string;
  responsibility_kra_id: string;
  responsibility_id: string;
  company_id: string | null;
  
  // Self-rating
  self_rating: number | null;
  self_rating_at: string | null;
  self_comments: string | null;
  
  // Manager rating
  manager_rating: number | null;
  manager_id: string | null;
  manager_rating_at: string | null;
  manager_comments: string | null;
  
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
  
  // Joined data
  responsibility_kra?: ResponsibilityKRA;
}

export interface KRAWithRating extends ResponsibilityKRA {
  rating?: KRARatingSubmission | null;
}

export const MEASUREMENT_METHODS = [
  { value: 'quantitative', label: 'Quantitative (Numbers/Metrics)' },
  { value: 'qualitative', label: 'Qualitative (Behavioral/Observation)' },
  { value: 'milestone', label: 'Milestone-based (Deliverables)' },
  { value: 'percentage', label: 'Percentage Achievement' },
  { value: 'rating_scale', label: 'Rating Scale (1-5)' },
] as const;

export type MeasurementMethod = typeof MEASUREMENT_METHODS[number]['value'];
