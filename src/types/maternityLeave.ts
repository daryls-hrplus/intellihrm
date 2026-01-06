// Maternity Leave Processing Types

export type MaternityLeaveStatus = 
  | 'pending' 
  | 'approved' 
  | 'active_prenatal' 
  | 'active_postnatal' 
  | 'completed' 
  | 'cancelled' 
  | 'extended';

export type MaternityPhase = 'prenatal' | 'postnatal' | 'phased_return' | 'completed';

export type ComplianceRegion = 'caribbean' | 'latin_america' | 'africa' | 'other';

export type ReturnPlanType = 'standard' | 'phased' | 'flexible' | 'part_time';

export type ReturnPlanStatus = 'draft' | 'submitted' | 'approved' | 'active' | 'completed' | 'modified';

export type DocumentType = 
  | 'pregnancy_confirmation' 
  | 'medical_certificate' 
  | 'due_date_confirmation'
  | 'birth_certificate' 
  | 'hospital_discharge' 
  | 'fitness_to_work'
  | 'extension_request' 
  | 'return_to_work_clearance' 
  | 'other';

export type PaymentStatus = 'pending' | 'processed' | 'paid' | 'cancelled';

export type StatutoryPaidBy = 'government' | 'employer' | 'shared';

export interface MaternityLeaveRequest {
  id: string;
  company_id: string;
  employee_id: string;
  leave_request_id?: string;
  expected_due_date: string;
  actual_delivery_date?: string;
  pregnancy_confirmation_date?: string;
  number_of_children: number;
  prenatal_start_date?: string;
  prenatal_end_date?: string;
  postnatal_start_date?: string;
  postnatal_end_date?: string;
  total_leave_days?: number;
  status: MaternityLeaveStatus;
  current_phase?: MaternityPhase;
  payment_config_id?: string;
  statutory_payment_weeks?: number;
  employer_topup_weeks?: number;
  employer_topup_percentage?: number;
  planned_return_date?: string;
  actual_return_date?: string;
  phased_return_enabled: boolean;
  phased_return_plan_id?: string;
  country_code?: string;
  compliance_region?: ComplianceRegion;
  compliance_notes?: string;
  notes?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id?: string;
  };
}

export interface MaternityPaymentConfig {
  id: string;
  company_id: string;
  country_code: string;
  config_name: string;
  statutory_leave_weeks: number;
  statutory_payment_percentage: number;
  statutory_paid_by: StatutoryPaidBy;
  statutory_cap_amount?: number;
  statutory_cap_currency?: string;
  employer_topup_enabled: boolean;
  employer_topup_weeks?: number;
  employer_topup_percentage?: number;
  employer_topup_cap?: number;
  prenatal_weeks: number;
  postnatal_weeks: number;
  flexible_allocation: boolean;
  minimum_service_months: number;
  probation_eligible: boolean;
  is_active: boolean;
  effective_from?: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
}

export interface MaternityComplianceRule {
  id: string;
  country_code: string;
  region: ComplianceRegion;
  legal_minimum_weeks: number;
  legal_payment_percentage?: number;
  mandatory_prenatal_weeks?: number;
  mandatory_postnatal_weeks?: number;
  required_documents: string[];
  medical_certificate_required: boolean;
  birth_certificate_deadline_days?: number;
  nursing_breaks_daily?: number;
  nursing_break_duration_minutes?: number;
  nursing_breaks_until_months?: number;
  job_protection_weeks?: number;
  dismissal_protection_weeks?: number;
  extension_allowed: boolean;
  max_extension_weeks?: number;
  unpaid_extension_allowed: boolean;
  legislation_reference?: string;
  last_updated?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaternityReturnPlan {
  id: string;
  maternity_request_id: string;
  company_id: string;
  employee_id: string;
  plan_type: ReturnPlanType;
  planned_return_date: string;
  phase_1_start_date?: string;
  phase_1_hours_per_week?: number;
  phase_1_duration_weeks?: number;
  phase_2_start_date?: string;
  phase_2_hours_per_week?: number;
  phase_2_duration_weeks?: number;
  phase_3_start_date?: string;
  phase_3_hours_per_week?: number;
  phase_3_duration_weeks?: number;
  full_time_return_date?: string;
  nursing_room_required: boolean;
  flexible_hours_required: boolean;
  remote_work_days?: number;
  accommodations_notes?: string;
  status: ReturnPlanStatus;
  manager_approved: boolean;
  manager_approved_by?: string;
  manager_approved_at?: string;
  hr_approved: boolean;
  hr_approved_by?: string;
  hr_approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MaternityDocument {
  id: string;
  maternity_request_id: string;
  company_id: string;
  document_type: DocumentType;
  document_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
  issue_date?: string;
  expiry_date?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MaternityPayment {
  id: string;
  maternity_request_id: string;
  company_id: string;
  employee_id: string;
  payment_period_start: string;
  payment_period_end: string;
  statutory_amount: number;
  employer_topup_amount: number;
  total_amount: number;
  currency: string;
  payment_type: 'regular' | 'statutory' | 'topup' | 'adjustment';
  payment_source?: 'employer' | 'government' | 'insurance';
  status: PaymentStatus;
  payroll_run_id?: string;
  processed_at?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MaternityLeaveFormData {
  employee_id: string;
  expected_due_date: string;
  pregnancy_confirmation_date?: string;
  number_of_children: number;
  prenatal_start_date?: string;
  postnatal_end_date?: string;
  country_code: string;
  payment_config_id?: string;
  phased_return_enabled: boolean;
  notes?: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  pregnancy_confirmation: 'Pregnancy Confirmation',
  medical_certificate: 'Medical Certificate',
  due_date_confirmation: 'Due Date Confirmation',
  birth_certificate: 'Birth Certificate',
  hospital_discharge: 'Hospital Discharge',
  fitness_to_work: 'Fitness to Work Certificate',
  extension_request: 'Extension Request',
  return_to_work_clearance: 'Return to Work Clearance',
  other: 'Other Document',
};

export const STATUS_LABELS: Record<MaternityLeaveStatus, string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  active_prenatal: 'Active (Pre-natal)',
  active_postnatal: 'Active (Post-natal)',
  completed: 'Completed',
  cancelled: 'Cancelled',
  extended: 'Extended',
};

export const REGION_LABELS: Record<ComplianceRegion, string> = {
  caribbean: 'Caribbean',
  latin_america: 'Latin America',
  africa: 'Africa',
  other: 'Other',
};
