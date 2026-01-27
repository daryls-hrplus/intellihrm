// Talent Signal Types

export type SignalCategory = 
  | 'leadership' 
  | 'teamwork' 
  | 'technical' 
  | 'values' 
  | 'general';

export type BiasRiskLevel = 'low' | 'medium' | 'high';

export type AggregationMethod = 
  | 'weighted_average' 
  | 'simple_average' 
  | 'median' 
  | 'max' 
  | 'min';

export interface TalentSignalDefinition {
  id: string;
  company_id: string | null;
  signal_code: string;
  signal_name: string;
  signal_name_en: string | null;
  description: string | null;
  category: SignalCategory;
  source_module: string | null;
  calculation_method: AggregationMethod;
  weight_default: number;
  confidence_threshold: number;
  bias_risk_factors: string[];
  is_system_defined: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TalentSignalRule {
  id: string;
  signal_definition_id: string;
  company_id: string;
  source_type: string;
  source_config: Record<string, any>;
  weight: number;
  min_responses: number;
  max_age_days: number;
  calculation_formula: Record<string, any> | null;
  rater_category_weights: Record<string, number> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TalentSignalSnapshot {
  id: string;
  employee_id: string;
  company_id: string;
  signal_definition_id: string;
  source_cycle_id: string | null;
  source_record_type: string;
  source_record_id: string | null;
  snapshot_version: number;
  signal_value: number | null;
  raw_value: number | null;
  normalized_score: number | null;
  confidence_score: number | null;
  bias_risk_level: BiasRiskLevel;
  bias_factors: string[];
  evidence_count: number;
  evidence_summary: {
    response_count: number;
    rater_group_count: number;
    score_range: { min: number; max: number };
  };
  rater_breakdown: Record<string, { avg: number; count: number }>;
  data_freshness_days?: number;
  effective_from: string;
  expires_at: string | null;
  is_current: boolean;
  captured_at: string;
  created_at: string;
  created_by: string | null;
  signal_definition?: TalentSignalDefinition;
}

export interface SignalEvidenceLink {
  id: string;
  snapshot_id: string;
  source_table: string;
  source_id: string;
  source_field: string | null;
  contribution_weight: number;
  contribution_value: number | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SignalSummary {
  employee_id: string;
  signals: TalentSignalSnapshot[];
  by_category: Record<SignalCategory, TalentSignalSnapshot[]>;
  summary: {
    overall_score: number | null;
    signal_count: number;
    avg_confidence: number;
    strengths: Array<{
      name: string;
      score: number;
      confidence: number;
    }>;
    development_areas: Array<{
      name: string;
      score: number;
      confidence: number;
    }>;
  };
}

// Signal routing configuration for 360 cycles
export interface CycleSignalRouting {
  cycle_purpose: 'development' | 'evaluation' | 'assessment';
  feed_to_appraisal: boolean;
  feed_to_talent_profile: boolean;
  feed_to_nine_box: boolean;
  feed_to_succession: boolean;
  include_in_analytics: boolean;
  anonymity_threshold: number;
  retention_period_months: number;
  ai_tone_setting: 'development' | 'neutral' | 'evaluative';
}

// System signal codes
export const SYSTEM_SIGNALS = {
  LEADERSHIP_CONSISTENCY: 'leadership_consistency',
  COLLABORATION: 'collaboration',
  INFLUENCE: 'influence',
  PEOPLE_LEADERSHIP: 'people_leadership',
  TECHNICAL_EXCELLENCE: 'technical_excellence',
  STRATEGIC_THINKING: 'strategic_thinking',
  CUSTOMER_FOCUS: 'customer_focus',
  ADAPTABILITY: 'adaptability',
} as const;

export type SystemSignalCode = typeof SYSTEM_SIGNALS[keyof typeof SYSTEM_SIGNALS];
