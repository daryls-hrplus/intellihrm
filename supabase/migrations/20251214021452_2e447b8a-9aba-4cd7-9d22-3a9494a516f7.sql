-- Reminder System Tables

-- Reminder event types lookup
CREATE TABLE public.reminder_event_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  source_table TEXT,
  date_field TEXT,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reminder rules - company-level automatic reminder configuration
CREATE TABLE public.reminder_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  event_type_id UUID NOT NULL REFERENCES public.reminder_event_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  days_before INTEGER NOT NULL DEFAULT 7,
  send_to_employee BOOLEAN DEFAULT true,
  send_to_manager BOOLEAN DEFAULT true,
  send_to_hr BOOLEAN DEFAULT false,
  notification_method TEXT NOT NULL DEFAULT 'both',
  message_template TEXT,
  is_active BOOLEAN DEFAULT true,
  priority TEXT DEFAULT 'medium',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual employee reminders (both auto-generated and manual)
CREATE TABLE public.employee_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  event_type_id UUID REFERENCES public.reminder_event_types(id),
  rule_id UUID REFERENCES public.reminder_rules(id),
  title TEXT NOT NULL,
  message TEXT,
  event_date DATE NOT NULL,
  reminder_date DATE NOT NULL,
  source_record_id UUID,
  source_table TEXT,
  priority TEXT DEFAULT 'medium',
  notification_method TEXT NOT NULL DEFAULT 'both',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_by_role TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  can_employee_dismiss BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee reminder preferences
CREATE TABLE public.employee_reminder_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  event_type_id UUID REFERENCES public.reminder_event_types(id),
  receive_in_app BOOLEAN DEFAULT true,
  receive_email BOOLEAN DEFAULT true,
  default_days_before INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, event_type_id)
);

-- Reminder history/audit log
CREATE TABLE public.reminder_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_id UUID NOT NULL REFERENCES public.employee_reminders(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES public.profiles(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminder_event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reminder_event_types
CREATE POLICY "Admins can manage reminder event types"
ON public.reminder_event_types FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'hr_manager')));

CREATE POLICY "Users can view active reminder event types"
ON public.reminder_event_types FOR SELECT USING (is_active = true);

-- RLS Policies for reminder_rules
CREATE POLICY "Admins can manage reminder rules"
ON public.reminder_rules FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'hr_manager')));

CREATE POLICY "Users can view reminder rules"
ON public.reminder_rules FOR SELECT USING (is_active = true);

-- RLS Policies for employee_reminders
CREATE POLICY "Admins can manage all reminders"
ON public.employee_reminders FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'hr_manager')));

CREATE POLICY "Managers can manage direct reports reminders"
ON public.employee_reminders FOR ALL
USING (employee_id IN (SELECT employee_id FROM public.get_manager_direct_reports(auth.uid())));

CREATE POLICY "Employees can view their own reminders"
ON public.employee_reminders FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Employees can update only self-created reminders"
ON public.employee_reminders FOR UPDATE
USING (employee_id = auth.uid() AND created_by = auth.uid() AND created_by_role = 'employee');

CREATE POLICY "Employees can create their own reminders"
ON public.employee_reminders FOR INSERT
WITH CHECK (employee_id = auth.uid() AND created_by = auth.uid() AND created_by_role = 'employee');

-- RLS Policies for employee_reminder_preferences
CREATE POLICY "Employees can manage their own preferences"
ON public.employee_reminder_preferences FOR ALL USING (employee_id = auth.uid());

CREATE POLICY "Admins can view all preferences"
ON public.employee_reminder_preferences FOR SELECT
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'hr_manager')));

-- RLS Policies for reminder_history
CREATE POLICY "Users can view history for their reminders"
ON public.reminder_history FOR SELECT
USING (reminder_id IN (SELECT id FROM public.employee_reminders WHERE employee_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'hr_manager')));

-- Insert system-defined event types
INSERT INTO public.reminder_event_types (code, name, description, category, source_table, date_field, is_system) VALUES
('PROBATION_END', 'Probation Period Ending', 'Reminder when employee probation period is about to end', 'probation', 'profiles', 'probation_end_date', true),
('CONTRACT_END', 'Contract Ending', 'Reminder when employee contract is about to end', 'contract', 'profiles', 'contract_end_date', true),
('RETIREMENT', 'Retirement Date', 'Reminder when employee retirement date is approaching', 'contract', 'profiles', 'retirement_date', true),
('LEAVE_START', 'Leave Starting', 'Reminder when employee leave is about to start', 'leave', 'leave_requests', 'start_date', true),
('LEAVE_END', 'Returning from Leave', 'Reminder when employee is returning from leave', 'leave', 'leave_requests', 'end_date', true),
('LICENSE_EXPIRY', 'License Expiring', 'Reminder when employee license is about to expire', 'document', 'employee_licenses', 'expiry_date', true),
('WORK_PERMIT_EXPIRY', 'Work Permit Expiring', 'Reminder when employee work permit is about to expire', 'document', 'employee_work_permits', 'expiry_date', true),
('CERTIFICATE_EXPIRY', 'Certificate Expiring', 'Reminder when employee certificate is about to expire', 'document', 'employee_certificates', 'expiry_date', true),
('TRAINING_DUE', 'Training Due Date', 'Reminder when mandatory training is due', 'training', 'lms_enrollments', 'due_date', true),
('TRAINING_START', 'Training Starting', 'Reminder when training course is about to start', 'training', 'lms_courses', 'start_date', true),
('BIRTHDAY', 'Employee Birthday', 'Reminder for employee birthday', 'milestone', 'profiles', 'date_of_birth', true),
('WORK_ANNIVERSARY', 'Work Anniversary', 'Reminder for employee work anniversary', 'milestone', 'profiles', 'hire_date', true),
('MEDICAL_CHECKUP', 'Medical Checkup Due', 'Reminder when medical checkup is due', 'document', 'employee_medical_profiles', 'next_checkup_date', true),
('APPRAISAL_DUE', 'Appraisal Due', 'Reminder when performance appraisal is due', 'performance', 'appraisal_participants', 'due_date', true),
('GOAL_DEADLINE', 'Goal Deadline', 'Reminder when goal deadline is approaching', 'performance', 'performance_goals', 'target_date', true),
('CUSTOM', 'Custom Reminder', 'User-defined custom reminder', 'custom', NULL, NULL, true);

-- Create indexes
CREATE INDEX idx_employee_reminders_employee ON public.employee_reminders(employee_id);
CREATE INDEX idx_employee_reminders_reminder_date ON public.employee_reminders(reminder_date);
CREATE INDEX idx_employee_reminders_status ON public.employee_reminders(status);
CREATE INDEX idx_reminder_rules_company ON public.reminder_rules(company_id);
CREATE INDEX idx_reminder_rules_event_type ON public.reminder_rules(event_type_id);

-- Update timestamp triggers
CREATE TRIGGER update_reminder_event_types_updated_at BEFORE UPDATE ON public.reminder_event_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reminder_rules_updated_at BEFORE UPDATE ON public.reminder_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_reminders_updated_at BEFORE UPDATE ON public.employee_reminders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_reminder_preferences_updated_at BEFORE UPDATE ON public.employee_reminder_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();