// Position Seats Model Types

export type SeatStatus = 'PLANNED' | 'APPROVED' | 'VACANT' | 'FILLED' | 'FROZEN' | 'ELIMINATED';

export interface PositionSeat {
  id: string;
  position_id: string;
  seat_number: number;
  seat_code: string;
  status: SeatStatus;
  current_employee_id: string | null;
  current_employee_position_id: string | null;
  planned_date: string | null;
  approved_date: string | null;
  filled_date: string | null;
  frozen_date: string | null;
  eliminated_date: string | null;
  freeze_reason: string | null;
  freeze_approved_by: string | null;
  elimination_reason: string | null;
  elimination_approved_by: string | null;
  displacement_action_id: string | null;
  requires_displacement: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  current_employee?: {
    full_name: string;
    email: string;
    employee_id: string | null;
  } | null;
  position?: {
    title: string;
    code: string;
    department?: {
      name: string;
    };
  };
}

export interface PositionSeatHistory {
  id: string;
  seat_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string | null;
  change_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type HeadcountRequestType = 'INCREASE' | 'DECREASE' | 'FREEZE' | 'UNFREEZE';
export type HeadcountRequestStatus = 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXECUTED';

export interface HeadcountChangeRequest {
  id: string;
  position_id: string;
  company_id: string | null;
  request_type: HeadcountRequestType;
  current_headcount: number;
  requested_headcount: number;
  change_amount: number;
  business_justification: string;
  cost_center_id: string | null;
  budget_impact_amount: number | null;
  budget_impact_currency: string;
  effective_date: string;
  status: HeadcountRequestStatus;
  requested_by: string;
  requested_at: string;
  current_approver_id: string | null;
  approval_level: number;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  executed_at: string | null;
  executed_by: string | null;
  impact_analysis: HeadcountImpactAnalysis;
  affected_seats: string[];
  displacement_required: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  position?: {
    title: string;
    code: string;
    department?: {
      name: string;
    };
  };
  requester?: {
    full_name: string;
    email: string;
  };
  reviewer?: {
    full_name: string;
    email: string;
  };
}

export interface HeadcountImpactAnalysis {
  affected_employees?: number;
  budget_impact?: {
    annual_savings?: number;
    annual_cost?: number;
    currency?: string;
  };
  risk_factors?: string[];
  recommendations?: string[];
  compliance_flags?: string[];
}

export type DisplacementActionType = 'REDEPLOYMENT' | 'VOLUNTARY_SEPARATION' | 'INVOLUNTARY_SEPARATION' | 'TRANSFER' | 'DEMOTION' | 'EARLY_RETIREMENT';
export type DisplacementStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface SeatDisplacementAction {
  id: string;
  request_id: string;
  seat_id: string;
  employee_id: string;
  action_type: DisplacementActionType;
  status: DisplacementStatus;
  proposed_position_id: string | null;
  proposed_seat_id: string | null;
  grace_period_start: string | null;
  grace_period_end: string | null;
  grace_period_days: number;
  final_action: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  legal_review_required: boolean;
  legal_reviewed_by: string | null;
  legal_reviewed_at: string | null;
  hr_reviewed_by: string | null;
  hr_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  employee?: {
    full_name: string;
    email: string;
    employee_id: string | null;
  };
  seat?: PositionSeat;
  proposed_position?: {
    title: string;
    code: string;
  };
}

export interface PositionSeatSummary {
  position_id: string;
  position_code: string;
  position_title: string;
  department_id: string;
  authorized_headcount: number;
  total_seats: number;
  filled_seats: number;
  vacant_seats: number;
  frozen_seats: number;
  planned_seats: number;
  approved_seats: number;
  eliminated_seats: number;
  fill_rate_percent: number | null;
}

// Status color mapping - Using high-contrast colors for accessibility
export const SEAT_STATUS_CONFIG: Record<SeatStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  PLANNED: {
    label: 'Planned',
    color: 'text-slate-800 dark:text-slate-100',
    bgColor: 'bg-slate-200 dark:bg-slate-700',
    icon: 'ClipboardList'
  },
  APPROVED: {
    label: 'Approved',
    color: 'text-blue-800 dark:text-blue-100',
    bgColor: 'bg-blue-200 dark:bg-blue-800',
    icon: 'CheckCircle2'
  },
  VACANT: {
    label: 'Vacant',
    color: 'text-amber-900 dark:text-amber-100',
    bgColor: 'bg-amber-200 dark:bg-amber-800',
    icon: 'UserX'
  },
  FILLED: {
    label: 'Filled',
    color: 'text-green-800 dark:text-green-100',
    bgColor: 'bg-green-200 dark:bg-green-800',
    icon: 'UserCheck'
  },
  FROZEN: {
    label: 'Frozen',
    color: 'text-cyan-800 dark:text-cyan-100',
    bgColor: 'bg-cyan-200 dark:bg-cyan-800',
    icon: 'Snowflake'
  },
  ELIMINATED: {
    label: 'Eliminated',
    color: 'text-red-800 dark:text-red-100',
    bgColor: 'bg-red-200 dark:bg-red-800',
    icon: 'XCircle'
  }
};

export const REQUEST_TYPE_CONFIG: Record<HeadcountRequestType, { label: string; color: string; icon: string }> = {
  INCREASE: {
    label: 'Increase',
    color: 'text-green-600',
    icon: 'TrendingUp'
  },
  DECREASE: {
    label: 'Decrease',
    color: 'text-red-600',
    icon: 'TrendingDown'
  },
  FREEZE: {
    label: 'Freeze',
    color: 'text-cyan-600',
    icon: 'Snowflake'
  },
  UNFREEZE: {
    label: 'Unfreeze',
    color: 'text-amber-600',
    icon: 'Sun'
  }
};

export const REQUEST_STATUS_CONFIG: Record<HeadcountRequestStatus, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: 'Draft', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  PENDING: { label: 'Pending', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  UNDER_REVIEW: { label: 'Under Review', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  APPROVED: { label: 'Approved', color: 'text-green-600', bgColor: 'bg-green-100' },
  REJECTED: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
  CANCELLED: { label: 'Cancelled', color: 'text-slate-500', bgColor: 'bg-slate-100' },
  EXECUTED: { label: 'Executed', color: 'text-purple-600', bgColor: 'bg-purple-100' }
};
