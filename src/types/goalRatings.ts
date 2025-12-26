// Goal Rating Types and Constants

export type CalculationMethod = 'auto_calculated' | 'manager_entered' | 'weighted_average' | 'calibrated';

export type RatingVisibility = 'immediately' | 'manager_submitted' | 'review_released' | 'acknowledged';

export type RatingSubmissionStatus = 'draft' | 'self_submitted' | 'manager_submitted' | 'released' | 'acknowledged' | 'disputed';

export type DisputeCategory = 
  | 'performance_not_reflected' 
  | 'progress_not_considered' 
  | 'factual_error' 
  | 'process_not_followed' 
  | 'bias_concern' 
  | 'other';

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'rejected';

export interface AutoCalcRules {
  progress_threshold?: number;
  progress_rating_map?: Record<string, number>;
  include_milestones?: boolean;
  milestone_weight?: number;
}

export interface GoalRatingConfiguration {
  id: string;
  company_id: string;
  cycle_id?: string | null;
  rating_scale_id?: string | null;
  calculation_method: CalculationMethod;
  self_rating_weight: number;
  manager_rating_weight: number;
  progress_weight: number;
  hide_ratings_until: RatingVisibility;
  show_manager_rating_to_employee: boolean;
  show_final_score_to_employee: boolean;
  requires_employee_acknowledgment: boolean;
  acknowledgment_deadline_days: number;
  allow_dispute: boolean;
  dispute_window_days: number;
  auto_calc_rules: AutoCalcRules;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface GoalRatingSubmission {
  id: string;
  goal_id: string;
  company_id: string;
  rating_config_id?: string | null;
  employee_id: string;
  self_rating?: number | null;
  self_rating_at?: string | null;
  self_comments?: string | null;
  manager_rating?: number | null;
  manager_id?: string | null;
  manager_rating_at?: string | null;
  manager_comments?: string | null;
  calculated_score?: number | null;
  final_score?: number | null;
  weight_adjusted_score?: number | null;
  status: RatingSubmissionStatus;
  released_at?: string | null;
  released_by?: string | null;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  acknowledgment_comments?: string | null;
  is_disputed: boolean;
  disputed_at?: string | null;
  dispute_reason?: string | null;
  dispute_category?: DisputeCategory | null;
  dispute_status?: DisputeStatus | null;
  dispute_resolution?: string | null;
  dispute_resolved_at?: string | null;
  dispute_resolved_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Display labels for calculation methods
export const CALCULATION_METHOD_LABELS: Record<CalculationMethod, { label: string; description: string }> = {
  auto_calculated: {
    label: 'Auto-Calculated',
    description: 'Final score calculated from goal progress percentage',
  },
  manager_entered: {
    label: 'Manager Entered',
    description: 'Manager directly enters the final rating',
  },
  weighted_average: {
    label: 'Weighted Average',
    description: 'Combines self-rating, manager rating, and progress with configurable weights',
  },
  calibrated: {
    label: 'Calibrated',
    description: 'Requires calibration session review before finalization',
  },
};

// Display labels for visibility options
export const VISIBILITY_LABELS: Record<RatingVisibility, { label: string; description: string }> = {
  immediately: {
    label: 'Immediately',
    description: 'Ratings visible to employee as soon as submitted',
  },
  manager_submitted: {
    label: 'After Manager Submits',
    description: 'Visible after manager completes their rating',
  },
  review_released: {
    label: 'After Review Released',
    description: 'Visible only after manager explicitly releases the review',
  },
  acknowledged: {
    label: 'After Acknowledgment',
    description: 'Visible only after employee acknowledges prior ratings',
  },
};

// Display labels for submission status
export const STATUS_LABELS: Record<RatingSubmissionStatus, { label: string; color: string; description: string }> = {
  draft: {
    label: 'Draft',
    color: 'gray',
    description: 'Rating not yet submitted',
  },
  self_submitted: {
    label: 'Self-Rating Submitted',
    color: 'blue',
    description: 'Employee has submitted their self-rating',
  },
  manager_submitted: {
    label: 'Manager Rated',
    color: 'purple',
    description: 'Manager has completed their rating',
  },
  released: {
    label: 'Released',
    color: 'green',
    description: 'Rating has been released to employee',
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'emerald',
    description: 'Employee has acknowledged the rating',
  },
  disputed: {
    label: 'Disputed',
    color: 'red',
    description: 'Employee has disputed the rating',
  },
};

// Display labels for dispute categories
export const DISPUTE_CATEGORY_LABELS: Record<DisputeCategory, { label: string; description: string }> = {
  performance_not_reflected: {
    label: 'Performance Not Reflected',
    description: 'The rating does not accurately reflect my performance',
  },
  progress_not_considered: {
    label: 'Progress Not Considered',
    description: 'My goal progress data was not taken into account',
  },
  factual_error: {
    label: 'Factual Error',
    description: 'There is a factual error in the assessment',
  },
  process_not_followed: {
    label: 'Process Not Followed',
    description: 'The proper rating process was not followed',
  },
  bias_concern: {
    label: 'Bias Concern',
    description: 'I believe there may be bias in the rating',
  },
  other: {
    label: 'Other',
    description: 'Other reason not listed above',
  },
};

// Display labels for dispute status
export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, { label: string; color: string }> = {
  open: {
    label: 'Open',
    color: 'yellow',
  },
  under_review: {
    label: 'Under Review',
    color: 'blue',
  },
  resolved: {
    label: 'Resolved',
    color: 'green',
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
  },
};
