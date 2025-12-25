export type CustomFieldFormContext =
  | 'employee_profile'
  | 'employee_create'
  | 'leave_request'
  | 'job_requisition'
  | 'job_application'
  | 'performance_review'
  | 'training_request'
  | 'expense_claim'
  | 'grievance'
  | 'onboarding_task'
  | 'position'
  | 'department'
  | 'company';

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multi_select'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'url'
  | 'currency';

export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  [key: string]: unknown;
}

export interface CustomFieldDefinition {
  id: string;
  company_id: string | null;
  form_context: CustomFieldFormContext;
  field_code: string;
  field_label: string;
  field_type: CustomFieldType;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  section_name: string | null;
  placeholder: string | null;
  help_text: string | null;
  default_value: string | null;
  validation_rules: ValidationRules;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  options?: CustomFieldOption[];
}

export interface CustomFieldOption {
  id: string;
  field_definition_id: string;
  option_value: string;
  option_label: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomFieldValue {
  id: string;
  field_definition_id: string;
  entity_id: string;
  entity_type: string;
  text_value: string | null;
  number_value: number | null;
  date_value: string | null;
  boolean_value: boolean | null;
  json_value: Json | null;
  created_at: string;

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
  updated_at: string;
  updated_by: string | null;
}

export const FORM_CONTEXT_LABELS: Record<CustomFieldFormContext, string> = {
  employee_profile: 'Employee Profile',
  employee_create: 'New Employee Form',
  leave_request: 'Leave Request',
  job_requisition: 'Job Requisition',
  job_application: 'Job Application',
  performance_review: 'Performance Review',
  training_request: 'Training Request',
  expense_claim: 'Expense Claim',
  grievance: 'Grievance',
  onboarding_task: 'Onboarding Task',
  position: 'Position',
  department: 'Department',
  company: 'Company',
};

export const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  boolean: 'Yes/No',
  select: 'Dropdown',
  multi_select: 'Multi-Select',
  textarea: 'Text Area',
  email: 'Email',
  phone: 'Phone',
  url: 'URL',
  currency: 'Currency',
};
