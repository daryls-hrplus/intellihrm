// Calibration Session Types

export interface CalibrationSession {
  id: string;
  company_id: string;
  appraisal_cycle_id: string | null;
  overall_scale_id: string | null;
  name: string;
  description: string | null;
  scheduled_date: string | null;
  status: CalibrationSessionStatus;
  facilitator_id: string | null;
  participants: string[];
  calibration_rules: CalibrationRules | null;
  outcome_summary: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type CalibrationSessionStatus = 
  | 'pending' 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface CalibrationRules {
  force_distribution?: boolean;
  max_rating_5_percent?: number;
  target_distribution?: TargetDistribution;
}

export interface TargetDistribution {
  exceptional: number;
  exceeds: number;
  meets: number;
  needs_improvement: number;
  unsatisfactory: number;
}

export interface CalibrationParticipant {
  id: string;
  session_id: string;
  user_id: string;
  role: 'facilitator' | 'reviewer' | 'observer';
  joined_at: string;
  is_active: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface CalibrationAdjustment {
  id: string;
  session_id: string;
  submission_id: string | null;
  employee_id: string;
  original_score: number | null;
  calibrated_score: number | null;
  original_box_position: string | null;
  calibrated_box_position: string | null;
  ai_suggested: boolean;
  ai_suggestion_score: number | null;
  ai_confidence: number | null;
  ai_reasoning: string | null;
  ai_bias_flags: any | null;
  adjustment_reason: string | null;
  adjustment_category: string | null;
  adjusted_by: string | null;
  adjusted_at: string;
  status: 'pending' | 'applied' | 'reverted';
  applied_at: string | null;
  reverted_at: string | null;
  reverted_by: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: {
    id: string;
    full_name: string;
    department_id?: string;
    departments?: { name: string };
  };
  adjuster?: {
    full_name: string;
  };
}

export interface CalibrationAIAnalysis {
  id: string;
  session_id: string;
  analysis_type: 'pre_session' | 'real_time' | 'summary';
  overall_health_score: number | null;
  anomalies_detected: number;
  bias_alerts: number;
  suggested_adjustments: any;
  distribution_analysis: DistributionAnalysis | null;
  equity_analysis: any | null;
  summary_narrative: string | null;
  model_used: string | null;
  confidence_score: number | null;
  tokens_used: number | null;
  analyzed_by: string | null;
  analyzed_at: string;
  company_id: string;
  created_at: string;
}

export interface DistributionAnalysis {
  current: {
    exceptional: number;
    exceeds: number;
    meets: number;
    needs_improvement: number;
    unsatisfactory: number;
  };
  percentages: {
    exceptional: string;
    exceeds: string;
    meets: string;
    needs_improvement: string;
    unsatisfactory: string;
  };
  total: number;
}

export interface CalibrationEmployee {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  avatarUrl?: string;
  currentScore: number;
  originalScore: number;
  selfRating: number;
  managerRating: number;
  boxPosition: NineBoxPosition;
  hasAnomalies: boolean;
  anomalyType?: string;
  aiSuggestion?: {
    score: number;
    confidence: number;
    reasoning: string;
  };
}

export type NineBoxPosition = 
  | 'high_potential_high_performer'
  | 'high_potential_solid_performer'
  | 'high_potential_low_performer'
  | 'moderate_potential_high_performer'
  | 'moderate_potential_solid_performer'
  | 'moderate_potential_low_performer'
  | 'low_potential_high_performer'
  | 'low_potential_solid_performer'
  | 'low_potential_low_performer';

export const NINE_BOX_LABELS: Record<NineBoxPosition, string> = {
  high_potential_high_performer: 'Star',
  high_potential_solid_performer: 'High Potential',
  high_potential_low_performer: 'Rough Diamond',
  moderate_potential_high_performer: 'Core Player',
  moderate_potential_solid_performer: 'Core Contributor',
  moderate_potential_low_performer: 'Inconsistent Player',
  low_potential_high_performer: 'Solid Professional',
  low_potential_solid_performer: 'Average Performer',
  low_potential_low_performer: 'Underperformer',
};

export const NINE_BOX_COLORS: Record<NineBoxPosition, string> = {
  high_potential_high_performer: 'bg-green-500',
  high_potential_solid_performer: 'bg-green-400',
  high_potential_low_performer: 'bg-yellow-400',
  moderate_potential_high_performer: 'bg-green-300',
  moderate_potential_solid_performer: 'bg-blue-400',
  moderate_potential_low_performer: 'bg-orange-400',
  low_potential_high_performer: 'bg-blue-300',
  low_potential_solid_performer: 'bg-gray-400',
  low_potential_low_performer: 'bg-red-400',
};

export const STATUS_CONFIG: Record<CalibrationSessionStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-500' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-500' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-500' },
  completed: { label: 'Completed', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
};

// Helper to map score to 9-box position
export function getBoxPosition(performance: number, potential: number): NineBoxPosition {
  const perf = performance >= 4 ? 'high' : performance >= 2.5 ? 'solid' : 'low';
  const pot = potential >= 4 ? 'high' : potential >= 2.5 ? 'moderate' : 'low';
  
  return `${pot}_potential_${perf}_performer` as NineBoxPosition;
}

// Helper to get position coordinates for 9-box grid
export function getBoxCoordinates(position: NineBoxPosition): { row: number; col: number } {
  const mapping: Record<NineBoxPosition, { row: number; col: number }> = {
    high_potential_low_performer: { row: 0, col: 0 },
    high_potential_solid_performer: { row: 0, col: 1 },
    high_potential_high_performer: { row: 0, col: 2 },
    moderate_potential_low_performer: { row: 1, col: 0 },
    moderate_potential_solid_performer: { row: 1, col: 1 },
    moderate_potential_high_performer: { row: 1, col: 2 },
    low_potential_low_performer: { row: 2, col: 0 },
    low_potential_solid_performer: { row: 2, col: 1 },
    low_potential_high_performer: { row: 2, col: 2 },
  };
  return mapping[position];
}
