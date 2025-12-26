// Goal Adjustments & Audit Trail Types

export type ChangeType = 
  | 'target_revision'
  | 'timeline_extension' 
  | 'scope_change'
  | 'weight_rebalance'
  | 'status_change'
  | 'priority_change'
  | 'ownership_transfer'
  | 'metric_recalibration';

export type AdjustmentReason =
  // Strategic Realignment
  | 'strategic_priority_shift'
  | 'organizational_restructure'
  | 'market_conditions_change'
  | 'budget_reallocation'
  | 'executive_directive'
  // External Factors
  | 'regulatory_requirement'
  | 'compliance_mandate'
  | 'vendor_dependency'
  | 'customer_requirement_change'
  | 'supply_chain_disruption'
  // Resource Constraints
  | 'resource_unavailability'
  | 'skill_gap_identified'
  | 'technology_limitation'
  | 'staffing_change'
  | 'budget_constraint'
  // Performance Factors
  | 'overperformance_stretch'
  | 'underperformance_reset'
  | 'baseline_error_correction'
  | 'measurement_methodology_change'
  | 'data_quality_issue'
  // Employee Factors
  | 'role_change'
  | 'extended_leave'
  | 'medical_accommodation'
  | 'personal_circumstances'
  | 'workload_rebalancing'
  // Operational Factors
  | 'project_delay'
  | 'scope_creep'
  | 'dependency_blocked'
  | 'integration_issue'
  | 'process_improvement'
  // Other
  | 'other';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface GoalAdjustment {
  id: string;
  goal_id: string;
  company_id: string | null;
  adjusted_by: string;
  adjusted_at: string;
  change_type: ChangeType;
  adjustment_reason: AdjustmentReason;
  reason_details: string | null;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  business_justification: string | null;
  supporting_evidence: string | null;
  impact_assessment: string | null;
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  approval_notes: string | null;
  is_material_change: boolean;
  requires_recalibration: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  adjusted_by_profile?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  approved_by_profile?: {
    id: string;
    full_name: string;
  };
  goal?: {
    id: string;
    title: string;
    employee_id: string;
  };
}

export interface GoalLockInfo {
  is_locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
  lock_reason: string | null;
  locked_by_profile?: {
    id: string;
    full_name: string;
  };
}

// Labels & descriptions for UI
export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  target_revision: 'Target Revision',
  timeline_extension: 'Timeline Extension',
  scope_change: 'Scope Change',
  weight_rebalance: 'Weight Rebalance',
  status_change: 'Status Change',
  priority_change: 'Priority Change',
  ownership_transfer: 'Ownership Transfer',
  metric_recalibration: 'Metric Recalibration',
};

export const CHANGE_TYPE_DESCRIPTIONS: Record<ChangeType, string> = {
  target_revision: 'Modify the target value or KPI threshold',
  timeline_extension: 'Extend the due date or milestone dates',
  scope_change: 'Adjust the scope or deliverables of the goal',
  weight_rebalance: 'Change the weighting of this goal in performance calculation',
  status_change: 'Update the goal status (active, on hold, cancelled, etc.)',
  priority_change: 'Modify the priority level of the goal',
  ownership_transfer: 'Transfer goal ownership to another employee',
  metric_recalibration: 'Recalibrate the measurement methodology or baseline',
};

export const CHANGE_TYPE_ICONS: Record<ChangeType, string> = {
  target_revision: 'Target',
  timeline_extension: 'Calendar',
  scope_change: 'Layers',
  weight_rebalance: 'Scale',
  status_change: 'RefreshCw',
  priority_change: 'Flag',
  ownership_transfer: 'UserCheck',
  metric_recalibration: 'Activity',
};

export const ADJUSTMENT_REASON_CATEGORIES: Record<string, { label: string; reasons: AdjustmentReason[] }> = {
  strategic: {
    label: 'Strategic Realignment',
    reasons: ['strategic_priority_shift', 'organizational_restructure', 'market_conditions_change', 'budget_reallocation', 'executive_directive'],
  },
  external: {
    label: 'External Factors',
    reasons: ['regulatory_requirement', 'compliance_mandate', 'vendor_dependency', 'customer_requirement_change', 'supply_chain_disruption'],
  },
  resource: {
    label: 'Resource Constraints',
    reasons: ['resource_unavailability', 'skill_gap_identified', 'technology_limitation', 'staffing_change', 'budget_constraint'],
  },
  performance: {
    label: 'Performance Factors',
    reasons: ['overperformance_stretch', 'underperformance_reset', 'baseline_error_correction', 'measurement_methodology_change', 'data_quality_issue'],
  },
  employee: {
    label: 'Employee Factors',
    reasons: ['role_change', 'extended_leave', 'medical_accommodation', 'personal_circumstances', 'workload_rebalancing'],
  },
  operational: {
    label: 'Operational Factors',
    reasons: ['project_delay', 'scope_creep', 'dependency_blocked', 'integration_issue', 'process_improvement'],
  },
  other: {
    label: 'Other',
    reasons: ['other'],
  },
};

export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
  // Strategic
  strategic_priority_shift: 'Strategic Priority Shift',
  organizational_restructure: 'Organizational Restructure',
  market_conditions_change: 'Market Conditions Change',
  budget_reallocation: 'Budget Reallocation',
  executive_directive: 'Executive Directive',
  // External
  regulatory_requirement: 'Regulatory Requirement',
  compliance_mandate: 'Compliance Mandate',
  vendor_dependency: 'Vendor Dependency',
  customer_requirement_change: 'Customer Requirement Change',
  supply_chain_disruption: 'Supply Chain Disruption',
  // Resource
  resource_unavailability: 'Resource Unavailability',
  skill_gap_identified: 'Skill Gap Identified',
  technology_limitation: 'Technology Limitation',
  staffing_change: 'Staffing Change',
  budget_constraint: 'Budget Constraint',
  // Performance
  overperformance_stretch: 'Overperformance - Stretch Target',
  underperformance_reset: 'Underperformance - Reset',
  baseline_error_correction: 'Baseline Error Correction',
  measurement_methodology_change: 'Measurement Methodology Change',
  data_quality_issue: 'Data Quality Issue',
  // Employee
  role_change: 'Role Change',
  extended_leave: 'Extended Leave',
  medical_accommodation: 'Medical Accommodation',
  personal_circumstances: 'Personal Circumstances',
  workload_rebalancing: 'Workload Rebalancing',
  // Operational
  project_delay: 'Project Delay',
  scope_creep: 'Scope Creep',
  dependency_blocked: 'Dependency Blocked',
  integration_issue: 'Integration Issue',
  process_improvement: 'Process Improvement',
  // Other
  other: 'Other',
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-destructive/10 text-destructive',
  withdrawn: 'bg-muted text-muted-foreground',
};
