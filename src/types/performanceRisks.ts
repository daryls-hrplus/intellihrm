export type PerformanceRiskType = 
  | 'chronic_underperformance'
  | 'skills_decay'
  | 'toxic_high_performer'
  | 'declining_trend'
  | 'competency_gap'
  | 'goal_achievement_gap'
  | 'engagement_risk';

export type PerformanceRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type PerformanceTrendDirection = 'improving' | 'stable' | 'declining';

export type SuccessionImpactType = 'none' | 'flagged' | 'excluded';

export interface RiskFactor {
  type: string;
  count?: number;
  cycles?: string[];
  gap?: string;
  goal_score?: number;
  behavior_score?: string;
  mandatory_count?: number;
  total_drop?: string;
}

export interface ExpiringCertification {
  name: string;
  expiry_date: string;
  is_mandatory: boolean;
}

export interface TriggeredIntervention {
  type: string;
  id: string | null;
  triggered_at: string;
}

export interface EmployeePerformanceRisk {
  id: string;
  employee_id: string;
  company_id: string;
  risk_type: PerformanceRiskType;
  risk_level: PerformanceRiskLevel;
  risk_score: number;
  risk_factors: RiskFactor[];
  affected_competencies: string[];
  consecutive_underperformance_count: number;
  expiring_certifications: ExpiringCertification[];
  goal_vs_behavior_gap: number | null;
  goal_score: number | null;
  competency_score: number | null;
  triggered_interventions: TriggeredIntervention[];
  succession_impact: SuccessionImpactType;
  promotion_block_reason: string | null;
  ai_recommendation: string | null;
  ai_analysis: Record<string, unknown> | null;
  detection_method: string;
  first_detected_at: string;
  last_analyzed_at: string;
  is_active: boolean;
  is_acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface PerformanceTrendHistory {
  id: string;
  employee_id: string;
  company_id: string;
  cycle_id: string | null;
  cycle_name: string | null;
  cycle_end_date: string | null;
  overall_score: number | null;
  goal_score: number | null;
  competency_score: number | null;
  responsibility_score: number | null;
  trend_direction: PerformanceTrendDirection;
  trend_score: number | null;
  previous_overall_score: number | null;
  score_delta: number | null;
  percentile_rank: number | null;
  peer_comparison: Record<string, unknown> | null;
  snapshot_date: string;
  metric_type: string;
  metric_value: number | null;
  ai_prediction: Record<string, unknown> | null;
  created_at: string;
}

export interface RiskSummary {
  total_risks: number;
  by_type: Record<PerformanceRiskType, number>;
  by_level: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  affected_employees_count: number;
}

export interface PerformanceRiskAnalysisResult {
  employee_id: string;
  employee_name: string;
  risks_found: number;
  risk_types: PerformanceRiskType[];
  highest_risk_level: string;
}

export const RISK_TYPE_LABELS: Record<PerformanceRiskType, string> = {
  chronic_underperformance: 'Chronic Underperformance',
  skills_decay: 'Skills Decay',
  toxic_high_performer: 'Toxic High Performer',
  declining_trend: 'Declining Trend',
  competency_gap: 'Competency Gap',
  goal_achievement_gap: 'Goal Achievement Gap',
  engagement_risk: 'Engagement Risk'
};

export const RISK_TYPE_DESCRIPTIONS: Record<PerformanceRiskType, string> = {
  chronic_underperformance: 'Repeated low performance across multiple cycles',
  skills_decay: 'Critical certifications expiring without renewal',
  toxic_high_performer: 'High goal achievement but poor behavioral scores',
  declining_trend: 'Consistent decline in performance scores',
  competency_gap: 'Significant gaps in required competencies',
  goal_achievement_gap: 'Consistently missing goal targets',
  engagement_risk: 'Signs of disengagement affecting performance'
};

export const RISK_LEVEL_COLORS: Record<PerformanceRiskLevel, string> = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

export const RISK_LEVEL_BADGE_VARIANTS: Record<PerformanceRiskLevel, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  low: 'secondary',
  medium: 'outline',
  high: 'default',
  critical: 'destructive'
};
