export interface CompanyValue {
  id: string;
  company_id: string;
  name: string;
  code: string | null;
  description: string | null;
  behavioral_indicators: BehavioralIndicator[];
  display_order: number;
  is_active: boolean;
  weight: number;
  is_promotion_factor: boolean;
  created_at: string;
  updated_at: string;
}

export interface BehavioralIndicator {
  level: number;
  description: string;
  examples?: string[];
}

export interface AppraisalValueScore {
  id: string;
  participant_id: string;
  value_id: string;
  rating: number | null;
  demonstrated_behaviors: string[] | null;
  evidence: string | null;
  comments: string | null;
  assessed_by: string | null;
  created_at: string;
  updated_at: string;
  value?: CompanyValue;
}

export interface EmployeeSkillGap {
  id: string;
  employee_id: string;
  company_id: string | null;
  capability_id: string | null;
  capability_name: string;
  required_level: number;
  current_level: number;
  gap_score: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: 'appraisal' | 'job_requirement' | 'succession' | 'ai_inference' | 'manual';
  source_reference_id: string | null;
  recommended_actions: RecommendedAction[];
  idp_item_id: string | null;
  status: 'open' | 'in_progress' | 'addressed' | 'closed';
  detected_at: string;
  addressed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecommendedAction {
  type: 'training' | 'mentoring' | 'assignment' | 'self_study' | 'certification';
  title: string;
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export interface ValueScoreInput {
  value_id: string;
  rating?: number;
  demonstrated_behaviors?: string[];
  evidence?: string;
  comments?: string;
}

export interface ValuesAssessmentSummary {
  total_values: number;
  assessed_values: number;
  average_rating: number | null;
  promotion_factors_met: number;
  promotion_factors_total: number;
}
