export type GoalLevel = 'company' | 'department' | 'team' | 'individual' | 'project';
export type GoalType = 'okr_objective' | 'okr_key_result' | 'smart_goal';

export interface LevelConfig {
  showEmployee: boolean;
  showDepartment: boolean;
  showTeamSelector: boolean;
  showProjectFields: boolean;
  showStrategicPriority: boolean;
  showCascadeTargets: boolean;
  showJobGoals: boolean;
  showParentGoalAlignment: boolean;
  showComplianceCategory: boolean;
  showPersonalDevelopment: boolean;
  defaultIsMandatory: boolean;
  description: string;
  icon: string;
}

export const LEVEL_FIELD_CONFIG: Record<GoalLevel, LevelConfig> = {
  company: {
    showEmployee: false,
    showDepartment: false,
    showTeamSelector: false,
    showProjectFields: false,
    showStrategicPriority: true,
    showCascadeTargets: true,
    showJobGoals: false,
    showParentGoalAlignment: false,
    showComplianceCategory: false,
    showPersonalDevelopment: false,
    defaultIsMandatory: false,
    description: "Organization-wide strategic objectives that cascade down",
    icon: "Building2",
  },
  department: {
    showEmployee: false,
    showDepartment: true,
    showTeamSelector: false,
    showProjectFields: false,
    showStrategicPriority: false,
    showCascadeTargets: true,
    showJobGoals: false,
    showParentGoalAlignment: true,
    showComplianceCategory: true,
    showPersonalDevelopment: false,
    defaultIsMandatory: false,
    description: "Department-level goals aligned to company strategy",
    icon: "Users",
  },
  team: {
    showEmployee: false,
    showDepartment: false,
    showTeamSelector: true,
    showProjectFields: false,
    showStrategicPriority: false,
    showCascadeTargets: false,
    showJobGoals: false,
    showParentGoalAlignment: true,
    showComplianceCategory: false,
    showPersonalDevelopment: false,
    defaultIsMandatory: false,
    description: "Team-based collaborative objectives",
    icon: "UserCircle",
  },
  project: {
    showEmployee: false,
    showDepartment: false,
    showTeamSelector: false,
    showProjectFields: true,
    showStrategicPriority: false,
    showCascadeTargets: false,
    showJobGoals: false,
    showParentGoalAlignment: true,
    showComplianceCategory: false,
    showPersonalDevelopment: false,
    defaultIsMandatory: false,
    description: "Time-bound project or initiative deliverables",
    icon: "Briefcase",
  },
  individual: {
    showEmployee: true,
    showDepartment: false,
    showTeamSelector: false,
    showProjectFields: false,
    showStrategicPriority: false,
    showCascadeTargets: false,
    showJobGoals: true,
    showParentGoalAlignment: true,
    showComplianceCategory: false,
    showPersonalDevelopment: true,
    defaultIsMandatory: false,
    description: "Personal performance goals aligned to role",
    icon: "Target",
  },
};

export interface TypeConfig {
  showSmartCriteria: boolean;
  showKeyResults: boolean;
  showQuantitativeMetrics: boolean;
  description: string;
  icon: string;
}

export const TYPE_FIELD_CONFIG: Record<GoalType, TypeConfig> = {
  smart_goal: {
    showSmartCriteria: true,
    showKeyResults: false,
    showQuantitativeMetrics: true,
    description: "Specific, Measurable, Achievable, Relevant, Time-bound",
    icon: "Target",
  },
  okr_objective: {
    showSmartCriteria: false,
    showKeyResults: true,
    showQuantitativeMetrics: false,
    description: "Qualitative objective with measurable key results",
    icon: "Flag",
  },
  okr_key_result: {
    showSmartCriteria: false,
    showKeyResults: false,
    showQuantitativeMetrics: true,
    description: "Quantitative measure of an objective's progress",
    icon: "TrendingUp",
  },
};

export const GOAL_LEVELS: { value: GoalLevel; label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "team", label: "Team" },
  { value: "project", label: "Project / Initiative" },
  { value: "department", label: "Department" },
  { value: "company", label: "Company / Strategic" },
];

export const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: "smart_goal", label: "SMART Goal" },
  { value: "okr_objective", label: "OKR Objective" },
  { value: "okr_key_result", label: "Key Result" },
];
