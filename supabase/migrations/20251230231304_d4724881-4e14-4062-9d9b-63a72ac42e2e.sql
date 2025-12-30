-- Create reminder_email_templates table
CREATE TABLE public.reminder_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  event_type_id UUID REFERENCES reminder_event_types(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.reminder_email_templates ENABLE ROW LEVEL SECURITY;

-- Policy for viewing templates (company members can view their company's templates + default templates)
CREATE POLICY "Users can view their company templates and defaults"
ON public.reminder_email_templates FOR SELECT
USING (
  is_default = true 
  OR company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Policy for creating templates
CREATE POLICY "HR and Admin can create templates"
ON public.reminder_email_templates FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Policy for updating templates
CREATE POLICY "HR and Admin can update company templates"
ON public.reminder_email_templates FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Policy for deleting templates
CREATE POLICY "HR and Admin can delete company templates"
ON public.reminder_email_templates FOR DELETE
USING (
  is_default = false AND company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_reminder_email_templates_updated_at
  BEFORE UPDATE ON public.reminder_email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default templates for each category
INSERT INTO public.reminder_email_templates (category, name, subject, body, is_default) VALUES
-- Compliance templates
('compliance', 'Work Permit Expiring', 'Action Required: Work Permit Expires in {{days_until}} Days', 'Dear {{employee_first_name}},

This is a reminder that your work permit is set to expire on {{event_date}}.

Please take the necessary steps to renew your work permit before the expiration date to ensure continued authorization to work.

If you have any questions or need assistance, please contact HR.

Best regards,
{{company_name}} HR Team', true),

('compliance', 'Visa Expiry Notice', 'Important: Visa Expires on {{event_date}}', 'Dear {{employee_first_name}},

Your visa is scheduled to expire on {{event_date}}. This is {{days_until}} days from now.

Please initiate the renewal process as soon as possible to avoid any work authorization issues.

Contact HR if you need support with the renewal process.

Best regards,
{{company_name}} HR Team', true),

-- Document templates
('document', 'Certificate Expiring', 'Reminder: {{event_title}} Expires Soon', 'Dear {{employee_first_name}},

This is a reminder that your certification/license ({{event_title}}) will expire on {{event_date}}.

Please ensure you complete the renewal process before this date to maintain compliance.

Best regards,
{{company_name}} HR Team', true),

('document', 'License Renewal Required', 'License Renewal Required: {{event_title}}', 'Dear {{employee_first_name}},

Your professional license ({{event_title}}) requires renewal by {{event_date}}.

Please submit your renewal documentation to HR at your earliest convenience.

Best regards,
{{company_name}} HR Team', true),

-- Employment templates
('employment', 'Contract Renewal Notice', 'Contract Renewal: Your Employment Contract Expires {{event_date}}', 'Dear {{employee_first_name}},

This is to inform you that your employment contract is due for renewal on {{event_date}}.

Your manager will be in touch to discuss renewal terms. If you have any questions, please reach out to HR.

Best regards,
{{company_name}} HR Team', true),

('employment', 'Probation Period Ending', 'Probation Review: {{days_until}} Days Remaining', 'Dear {{employee_first_name}},

Your probation period will conclude on {{event_date}}.

Your manager will schedule a probation review meeting to discuss your performance and next steps.

Best regards,
{{company_name}} HR Team', true),

-- Onboarding templates
('onboarding', 'Onboarding Task Reminder', 'Reminder: Complete Your Onboarding Tasks', 'Dear {{employee_first_name}},

Welcome to {{company_name}}! This is a friendly reminder to complete your pending onboarding tasks by {{event_date}}.

If you need any assistance, please dont hesitate to reach out to your manager or HR.

Best regards,
{{company_name}} HR Team', true),

-- Performance templates
('performance', 'Performance Review Due', 'Performance Review: Evaluation Due {{event_date}}', 'Dear {{employee_first_name}},

This is a reminder that your performance review is scheduled for {{event_date}}.

Please complete your self-assessment and gather any supporting documentation before the review meeting.

Best regards,
{{company_name}} HR Team', true),

-- Training templates
('training', 'Training Certification Due', 'Training Required: {{event_title}} by {{event_date}}', 'Dear {{employee_first_name}},

You are required to complete the following training: {{event_title}}

Please complete this training by {{event_date}} to remain compliant with company and regulatory requirements.

Best regards,
{{company_name}} HR Team', true),

-- Benefits templates
('benefits', 'Benefits Enrollment Reminder', 'Benefits Enrollment: Deadline {{event_date}}', 'Dear {{employee_first_name}},

This is a reminder that the benefits enrollment period ends on {{event_date}}.

Please review and select your benefits options before the deadline. Changes cannot be made after this date until the next enrollment period.

Best regards,
{{company_name}} HR Team', true),

-- Leave templates
('leave', 'Leave Balance Reminder', 'Leave Balance: {{days_until}} Days Remaining This Year', 'Dear {{employee_first_name}},

This is a reminder about your current leave balance. You have {{days_until}} days of annual leave remaining for this year.

Please plan your time off accordingly. Unused leave may be forfeited at year end per company policy.

Best regards,
{{company_name}} HR Team', true),

-- Milestone templates
('milestone', 'Work Anniversary', 'Happy Work Anniversary, {{employee_first_name}}!', 'Dear {{employee_first_name}},

Congratulations on your work anniversary with {{company_name}}!

We appreciate your dedication and contributions to our team. Thank you for being a valued member of our organization.

Best regards,
{{company_name}} HR Team', true),

('milestone', 'Birthday Wishes', 'Happy Birthday, {{employee_first_name}}!', 'Dear {{employee_first_name}},

Wishing you a wonderful birthday from all of us at {{company_name}}!

We hope you have a fantastic day filled with joy and celebration.

Best regards,
{{company_name}} HR Team', true),

-- Employee Voice templates
('employee_voice', 'Review Response Required', 'Action Required: Respond to Employee Review', 'Dear Manager,

An employee review requires your response. Please review and provide your feedback by {{event_date}}.

Employee: {{employee_full_name}}
Review Type: {{event_title}}

Please log in to the system to submit your response.

Best regards,
{{company_name}} HR Team', true);