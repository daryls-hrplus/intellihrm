// Goal Structure & Types Enhancement - Extended Goal Attributes
// These extensions are stored in the 'category' field as JSON or parsed client-side

export type MeasurementType = 'quantitative' | 'qualitative' | 'binary';

export type ComplianceCategory = 'regulatory' | 'policy' | 'audit' | 'safety' | 'ethics' | 'other';

export type GoalLevel = 'company' | 'department' | 'team' | 'individual' | 'project';

export type AchievementLevel = 'not_started' | 'not_met' | 'below' | 'meets' | 'exceeds';

export interface GoalExtendedAttributes {
  // Measurement Type
  measurementType: MeasurementType;
  
  // Threshold/Target/Stretch Model
  thresholdValue?: number;       // Minimum acceptable (e.g., 80% of target)
  stretchValue?: number;         // Exceeds expectations (e.g., 120% of target)
  thresholdPercentage?: number;  // Default: 80
  stretchPercentage?: number;    // Default: 120
  
  // Inverse Target (lower is better)
  isInverse?: boolean;
  
  // Compliance/Mandatory
  isMandatory?: boolean;
  complianceCategory?: ComplianceCategory;
  
  // Weight Inheritance
  isWeightRequired?: boolean;
  inheritedWeightPortion?: number;
  
  // Metric Template Reference
  metricTemplateId?: string;
  
  // Actual goal level (for project level stored as team in DB)
  actualGoalLevel?: GoalLevel;
}

export interface GoalAchievement {
  percentage: number;
  achievementLevel: AchievementLevel;
  thresholdMet: boolean;
  targetMet: boolean;
  stretchMet: boolean;
}

export interface MetricTemplate {
  id: string;
  name: string;
  description?: string;
  unitOfMeasure?: string;
  defaultTarget?: number;
  thresholdPercentage: number;
  stretchPercentage: number;
  isInverse: boolean;
  measurementType: MeasurementType;
  category?: string;
  isActive: boolean;
  isGlobal?: boolean;
}

// Default Metric Templates
export const DEFAULT_METRIC_TEMPLATES: Omit<MetricTemplate, 'id'>[] = [
  {
    name: 'Revenue Target',
    description: 'Track revenue against target',
    unitOfMeasure: '$',
    thresholdPercentage: 80,
    stretchPercentage: 120,
    measurementType: 'quantitative',
    category: 'Financial',
    isInverse: false,
    isActive: true,
    isGlobal: true,
  },
  {
    name: 'Cost Reduction',
    description: 'Reduce costs below target',
    unitOfMeasure: '$',
    thresholdPercentage: 120,
    stretchPercentage: 80,
    measurementType: 'quantitative',
    category: 'Financial',
    isInverse: true,
    isActive: true,
    isGlobal: true,
  },
  {
    name: 'Customer Satisfaction',
    description: 'CSAT score target',
    unitOfMeasure: '%',
    thresholdPercentage: 80,
    stretchPercentage: 120,
    measurementType: 'quantitative',
    category: 'Customer',
    isInverse: false,
    isActive: true,
    isGlobal: true,
  },
  {
    name: 'Employee Engagement',
    description: 'Engagement score target',
    unitOfMeasure: '%',
    thresholdPercentage: 80,
    stretchPercentage: 120,
    measurementType: 'quantitative',
    category: 'People',
    isInverse: false,
    isActive: true,
    isGlobal: true,
  },
  {
    name: 'Project Completion',
    description: 'Complete by deadline',
    unitOfMeasure: '%',
    thresholdPercentage: 80,
    stretchPercentage: 100,
    measurementType: 'quantitative',
    category: 'Delivery',
    isInverse: false,
    isActive: true,
    isGlobal: true,
  },
  {
    name: 'Quality Score',
    description: 'Quality metrics target',
    unitOfMeasure: '%',
    thresholdPercentage: 80,
    stretchPercentage: 120,
    measurementType: 'quantitative',
    category: 'Quality',
    isInverse: false,
    isActive: true,
    isGlobal: true,
  },
  {
    name: 'Error Rate',
    description: 'Reduce error rate',
    unitOfMeasure: '%',
    thresholdPercentage: 120,
    stretchPercentage: 80,
    measurementType: 'quantitative',
    category: 'Quality',
    isInverse: true,
    isActive: true,
    isGlobal: true,
  },
  {
    name: 'Response Time',
    description: 'Average response time',
    unitOfMeasure: 'hours',
    thresholdPercentage: 120,
    stretchPercentage: 80,
    measurementType: 'quantitative',
    category: 'Service',
    isInverse: true,
    isActive: true,
    isGlobal: true,
  },
  {
    name: 'Training Completion',
    description: 'Complete training modules',
    unitOfMeasure: 'modules',
    thresholdPercentage: 80,
    stretchPercentage: 100,
    measurementType: 'quantitative',
    category: 'Development',
    isInverse: false,
    isActive: true,
    isGlobal: true,
  },
  {
    name: 'Compliance Audit',
    description: 'Pass/Fail compliance audit',
    unitOfMeasure: '',
    thresholdPercentage: 100,
    stretchPercentage: 100,
    measurementType: 'binary',
    category: 'Compliance',
    isInverse: false,
    isActive: true,
    isGlobal: true,
  },
];

// Configuration constants
export const MEASUREMENT_TYPE_LABELS: Record<MeasurementType, string> = {
  quantitative: 'Quantitative',
  qualitative: 'Qualitative',
  binary: 'Pass/Fail',
};

export const COMPLIANCE_CATEGORY_LABELS: Record<ComplianceCategory, string> = {
  regulatory: 'Regulatory',
  policy: 'Company Policy',
  audit: 'Audit Requirement',
  safety: 'Health & Safety',
  ethics: 'Ethics & Conduct',
  other: 'Other',
};

export const GOAL_LEVEL_LABELS: Record<GoalLevel, string> = {
  company: 'Company',
  department: 'Department',
  team: 'Team',
  individual: 'Individual',
  project: 'Project',
};

export const ACHIEVEMENT_LEVEL_LABELS: Record<AchievementLevel, string> = {
  not_started: 'Not Started',
  not_met: 'Not Met',
  below: 'Below Target',
  meets: 'Meets Target',
  exceeds: 'Exceeds Target',
};

export const ACHIEVEMENT_LEVEL_COLORS: Record<AchievementLevel, string> = {
  not_started: 'bg-muted text-muted-foreground',
  not_met: 'bg-destructive/10 text-destructive',
  below: 'bg-warning/10 text-warning',
  meets: 'bg-success/10 text-success',
  exceeds: 'bg-primary/10 text-primary',
};
