// Goal Dependency Types

export type DependencyType = 'sequential' | 'resource' | 'skill' | 'external' | 'cross_team' | 'regulatory';
export type RiskIndicator = 'blocked' | 'at_risk' | 'on_track' | 'accelerated';
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'dependency_blocked' | 'progress_behind' | 'deadline_risk' | 'cascade_impact';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface GoalDependency {
  id: string;
  goal_id: string;
  depends_on_goal_id: string | null;
  dependency_type: DependencyType;
  description: string | null;
  external_dependency_name: string | null;
  external_dependency_contact: string | null;
  expected_resolution_date: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  impact_if_blocked: ImpactLevel;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  depends_on_goal?: {
    id: string;
    title: string;
    status: string;
    progress_percentage: number | null;
  };
}

export interface RiskFactor {
  type: string;
  count?: number;
  impact: number;
  days_overdue?: number;
  days_remaining?: number;
  progress?: number;
  expected?: number;
  actual?: number;
  gap?: number;
}

export interface GoalRiskAssessment {
  id: string;
  goal_id: string;
  risk_indicator: RiskIndicator;
  risk_score: number | null;
  risk_factors: RiskFactor[];
  blocking_dependencies: string[];
  mitigation_actions: string | null;
  assessed_by: string | null;
  assessment_type: 'manual' | 'ai_calculated' | 'system_derived';
  confidence_score: number | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalRiskAlert {
  id: string;
  goal_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  ai_explanation: string | null;
  recommended_actions: string[];
  is_dismissed: boolean;
  dismissed_by: string | null;
  dismissed_at: string | null;
  created_at: string;
  // Joined fields
  goal?: {
    id: string;
    title: string;
    employee_id: string;
  };
}

export const DEPENDENCY_TYPE_LABELS: Record<DependencyType, string> = {
  sequential: 'Sequential',
  resource: 'Resource',
  skill: 'Skill',
  external: 'External',
  cross_team: 'Cross-Team',
  regulatory: 'Regulatory',
};

export const DEPENDENCY_TYPE_DESCRIPTIONS: Record<DependencyType, string> = {
  sequential: 'This goal must wait for another goal to complete first',
  resource: 'This goal depends on shared resources (budget, equipment, etc.)',
  skill: 'This goal requires specific skills or expertise from others',
  external: 'This goal depends on external factors (vendors, clients, etc.)',
  cross_team: 'This goal depends on work from another team',
  regulatory: 'This goal depends on regulatory approval or compliance',
};

export const IMPACT_LEVEL_LABELS: Record<ImpactLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const IMPACT_LEVEL_COLORS: Record<ImpactLevel, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-destructive/10 text-destructive',
};

export const RISK_INDICATOR_LABELS: Record<RiskIndicator, string> = {
  blocked: 'Blocked',
  at_risk: 'At Risk',
  on_track: 'On Track',
  accelerated: 'Accelerated',
};

export const RISK_INDICATOR_COLORS: Record<RiskIndicator, string> = {
  blocked: 'bg-destructive text-destructive-foreground',
  at_risk: 'bg-orange-500 text-white',
  on_track: 'bg-green-500 text-white',
  accelerated: 'bg-blue-500 text-white',
};

export const RISK_INDICATOR_ICONS: Record<RiskIndicator, string> = {
  blocked: 'ban',
  at_risk: 'alert-triangle',
  on_track: 'check-circle',
  accelerated: 'rocket',
};
