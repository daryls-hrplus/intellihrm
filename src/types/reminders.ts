export interface ReminderEventType {
  id: string;
  company_id: string | null;
  code: string;
  name: string;
  description: string | null;
  category: string;
  source_table: string | null;
  date_field: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderRule {
  id: string;
  company_id: string;
  event_type_id: string;
  name: string;
  description: string | null;
  days_before: number;
  send_to_employee: boolean;
  send_to_manager: boolean;
  send_to_hr: boolean;
  notification_method: 'in_app' | 'email' | 'both';
  message_template: string | null;
  is_active: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  event_type?: ReminderEventType;
}

export interface EmployeeReminder {
  id: string;
  company_id: string;
  employee_id: string;
  event_type_id: string | null;
  rule_id: string | null;
  title: string;
  message: string | null;
  event_date: string;
  reminder_date: string;
  source_record_id: string | null;
  source_table: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notification_method: 'in_app' | 'email' | 'both';
  status: 'pending' | 'sent' | 'dismissed' | 'cancelled';
  sent_at: string | null;
  dismissed_at: string | null;
  created_by: string | null;
  created_by_role: 'admin' | 'hr' | 'manager' | 'employee' | 'system' | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  can_employee_dismiss: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  event_type?: ReminderEventType;
  employee?: {
    id: string;
    full_name: string;
    email: string;
  };
  creator?: {
    id: string;
    full_name: string;
  };
}

export interface ReminderPreference {
  id: string;
  employee_id: string;
  event_type_id: string | null;
  receive_in_app: boolean;
  receive_email: boolean;
  default_days_before: number;
  created_at: string;
  updated_at: string;
  event_type?: ReminderEventType;
}

export type ReminderCategory = 
  | 'probation' 
  | 'contract' 
  | 'leave' 
  | 'document' 
  | 'training' 
  | 'milestone' 
  | 'performance' 
  | 'custom';

export const REMINDER_CATEGORIES: { value: ReminderCategory; label: string }[] = [
  { value: 'probation', label: 'Probation' },
  { value: 'contract', label: 'Contract/Retirement' },
  { value: 'leave', label: 'Leave Events' },
  { value: 'document', label: 'Document Expiry' },
  { value: 'training', label: 'Training' },
  { value: 'milestone', label: 'Milestones' },
  { value: 'performance', label: 'Performance' },
  { value: 'custom', label: 'Custom' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-muted-foreground' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical', color: 'text-destructive' },
];

export const NOTIFICATION_METHODS = [
  { value: 'in_app', label: 'In-App Only' },
  { value: 'email', label: 'Email Only' },
  { value: 'both', label: 'Both' },
];

export const REMINDER_STATUS = [
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'cancelled', label: 'Cancelled' },
];
