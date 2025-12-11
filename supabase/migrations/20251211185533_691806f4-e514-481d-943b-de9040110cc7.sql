-- Add transaction_type to letter_templates for linking to employee transactions
ALTER TABLE public.letter_templates 
ADD COLUMN IF NOT EXISTS transaction_type_id UUID REFERENCES public.lookup_values(id);

-- Create workflow_letters table to store generated letters for workflows
CREATE TABLE IF NOT EXISTS public.workflow_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_instance_id UUID NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.letter_templates(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  generated_content TEXT NOT NULL,
  variable_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, pending_signatures, signed, cancelled
  final_pdf_url TEXT,
  verification_code TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  signed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT workflow_letters_status_check CHECK (status IN ('draft', 'pending_signatures', 'signed', 'cancelled'))
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workflow_letters_instance ON public.workflow_letters(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_letters_verification ON public.workflow_letters(verification_code);

-- Enable RLS
ALTER TABLE public.workflow_letters ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view workflow letters"
  ON public.workflow_letters FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Workflow participants can create letters"
  ON public.workflow_letters FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins and HR can update letters"
  ON public.workflow_letters FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_workflow_letters_updated_at
  BEFORE UPDATE ON public.workflow_letters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.verification_code := 'VER-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER generate_workflow_letter_verification
  BEFORE INSERT ON public.workflow_letters
  FOR EACH ROW
  EXECUTE FUNCTION generate_verification_code();

-- Enable realtime for workflow_letters
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_letters;

-- Insert default letter templates for transaction types
INSERT INTO public.letter_templates (name, code, category, subject, body_template, available_variables, requires_approval, created_by)
SELECT 
  'Employee Hire Letter' AS name,
  'hire_letter' AS code,
  'employment' AS category,
  'Offer of Employment' AS subject,
  E'{{company_letterhead}}\n\n{{current_date}}\n\nRef: {{letter_number}}\n\nDear {{employee_name}},\n\nWe are pleased to offer you the position of {{position_title}} in the {{department_name}} department at {{company_name}}.\n\nYour employment will commence on {{effective_date}}. Your initial probation period will be {{probation_period}} months.\n\n**Terms of Employment:**\n- Position: {{position_title}}\n- Department: {{department_name}}\n- Reports To: {{supervisor_name}}\n- Employment Type: {{employment_type}}\n- Contract Type: {{contract_type}}\n\nPlease confirm your acceptance by signing below.\n\n{{signature_block}}\n\nWelcome to the team!\n\nBest regards,\n{{hr_name}}\nHuman Resources' AS body_template,
  '["company_letterhead", "current_date", "letter_number", "employee_name", "position_title", "department_name", "company_name", "effective_date", "probation_period", "supervisor_name", "employment_type", "contract_type", "signature_block", "hr_name"]'::jsonb AS available_variables,
  true AS requires_approval,
  (SELECT id FROM auth.users LIMIT 1) AS created_by
WHERE NOT EXISTS (SELECT 1 FROM public.letter_templates WHERE code = 'hire_letter');

INSERT INTO public.letter_templates (name, code, category, subject, body_template, available_variables, requires_approval, created_by)
SELECT 
  'Confirmation Letter' AS name,
  'confirmation_letter' AS code,
  'career' AS category,
  'Confirmation of Permanent Employment' AS subject,
  E'{{company_letterhead}}\n\n{{current_date}}\n\nRef: {{letter_number}}\n\nDear {{employee_name}},\n\nFollowing the successful completion of your probation period, we are pleased to confirm your appointment as {{position_title}} in the {{department_name}} department, effective {{confirmation_date}}.\n\nYour performance during the probation period has been satisfactory and we are confident in your continued contribution to the organization.\n\nAll other terms and conditions of your employment remain unchanged.\n\n{{signature_block}}\n\nCongratulations!\n\nBest regards,\n{{hr_name}}\nHuman Resources' AS body_template,
  '["company_letterhead", "current_date", "letter_number", "employee_name", "position_title", "department_name", "confirmation_date", "signature_block", "hr_name"]'::jsonb AS available_variables,
  true AS requires_approval,
  (SELECT id FROM auth.users LIMIT 1) AS created_by
WHERE NOT EXISTS (SELECT 1 FROM public.letter_templates WHERE code = 'confirmation_letter');

INSERT INTO public.letter_templates (name, code, category, subject, body_template, available_variables, requires_approval, created_by)
SELECT 
  'Promotion Letter' AS name,
  'promotion_letter' AS code,
  'career' AS category,
  'Notification of Promotion' AS subject,
  E'{{company_letterhead}}\n\n{{current_date}}\n\nRef: {{letter_number}}\n\nDear {{employee_name}},\n\nWe are delighted to inform you of your promotion to the position of {{new_position_title}} in the {{new_department_name}} department, effective {{effective_date}}.\n\n**Promotion Details:**\n- Previous Position: {{old_position_title}}\n- New Position: {{new_position_title}}\n- Department: {{new_department_name}}\n- Effective Date: {{effective_date}}\n- Reason: {{promotion_reason}}\n\nThis promotion is in recognition of your outstanding performance and dedication.\n\n{{signature_block}}\n\nCongratulations on this well-deserved achievement!\n\nBest regards,\n{{hr_name}}\nHuman Resources' AS body_template,
  '["company_letterhead", "current_date", "letter_number", "employee_name", "old_position_title", "new_position_title", "new_department_name", "effective_date", "promotion_reason", "signature_block", "hr_name"]'::jsonb AS available_variables,
  true AS requires_approval,
  (SELECT id FROM auth.users LIMIT 1) AS created_by
WHERE NOT EXISTS (SELECT 1 FROM public.letter_templates WHERE code = 'promotion_letter');

INSERT INTO public.letter_templates (name, code, category, subject, body_template, available_variables, requires_approval, created_by)
SELECT 
  'Transfer Letter' AS name,
  'transfer_letter' AS code,
  'career' AS category,
  'Notification of Transfer' AS subject,
  E'{{company_letterhead}}\n\n{{current_date}}\n\nRef: {{letter_number}}\n\nDear {{employee_name}},\n\nThis letter confirms your transfer from {{from_department}} to {{to_department}}, effective {{effective_date}}.\n\n**Transfer Details:**\n- From: {{from_position}} in {{from_department}}\n- To: {{to_position}} in {{to_department}}\n- Effective Date: {{effective_date}}\n- Reason: {{transfer_reason}}\n\nAll other terms and conditions of your employment remain unchanged unless otherwise communicated.\n\n{{signature_block}}\n\nWe wish you success in your new role.\n\nBest regards,\n{{hr_name}}\nHuman Resources' AS body_template,
  '["company_letterhead", "current_date", "letter_number", "employee_name", "from_department", "from_position", "to_department", "to_position", "effective_date", "transfer_reason", "signature_block", "hr_name"]'::jsonb AS available_variables,
  true AS requires_approval,
  (SELECT id FROM auth.users LIMIT 1) AS created_by
WHERE NOT EXISTS (SELECT 1 FROM public.letter_templates WHERE code = 'transfer_letter');

INSERT INTO public.letter_templates (name, code, category, subject, body_template, available_variables, requires_approval, created_by)
SELECT 
  'Termination Letter' AS name,
  'termination_letter' AS code,
  'employment' AS category,
  'Notice of Termination of Employment' AS subject,
  E'{{company_letterhead}}\n\n{{current_date}}\n\nRef: {{letter_number}}\n\nDear {{employee_name}},\n\nThis letter serves as formal notice of the termination of your employment with {{company_name}}, effective {{last_working_date}}.\n\n**Termination Details:**\n- Position: {{position_title}}\n- Department: {{department_name}}\n- Last Working Date: {{last_working_date}}\n- Termination Type: {{termination_type}}\n- Reason: {{termination_reason}}\n\n**Final Settlement:**\nYour final settlement including any outstanding dues, accrued leave, and other benefits will be processed as per company policy.\n\nPlease ensure all company property is returned by your last working date.\n\n{{signature_block}}\n\nWe wish you the best in your future endeavors.\n\nBest regards,\n{{hr_name}}\nHuman Resources' AS body_template,
  '["company_letterhead", "current_date", "letter_number", "employee_name", "company_name", "position_title", "department_name", "last_working_date", "termination_type", "termination_reason", "signature_block", "hr_name"]'::jsonb AS available_variables,
  true AS requires_approval,
  (SELECT id FROM auth.users LIMIT 1) AS created_by
WHERE NOT EXISTS (SELECT 1 FROM public.letter_templates WHERE code = 'termination_letter');

INSERT INTO public.letter_templates (name, code, category, subject, body_template, available_variables, requires_approval, created_by)
SELECT 
  'Probation Extension Letter' AS name,
  'probation_extension_letter' AS code,
  'employment' AS category,
  'Extension of Probation Period' AS subject,
  E'{{company_letterhead}}\n\n{{current_date}}\n\nRef: {{letter_number}}\n\nDear {{employee_name}},\n\nThis letter is to inform you that your probation period has been extended.\n\n**Extension Details:**\n- Original Probation End Date: {{original_end_date}}\n- New Probation End Date: {{new_end_date}}\n- Extension Duration: {{extension_days}} days\n- Reason: {{extension_reason}}\n\nDuring this extended period, please focus on the areas discussed during your review. We are committed to supporting your development and success.\n\n{{signature_block}}\n\nBest regards,\n{{hr_name}}\nHuman Resources' AS body_template,
  '["company_letterhead", "current_date", "letter_number", "employee_name", "original_end_date", "new_end_date", "extension_days", "extension_reason", "signature_block", "hr_name"]'::jsonb AS available_variables,
  true AS requires_approval,
  (SELECT id FROM auth.users LIMIT 1) AS created_by
WHERE NOT EXISTS (SELECT 1 FROM public.letter_templates WHERE code = 'probation_extension_letter');

INSERT INTO public.letter_templates (name, code, category, subject, body_template, available_variables, requires_approval, created_by)
SELECT 
  'Acting Appointment Letter' AS name,
  'acting_letter' AS code,
  'career' AS category,
  'Acting Appointment Notification' AS subject,
  E'{{company_letterhead}}\n\n{{current_date}}\n\nRef: {{letter_number}}\n\nDear {{employee_name}},\n\nYou are hereby appointed to act in the capacity of {{acting_position}} during the period from {{acting_start_date}} to {{acting_end_date}}.\n\n**Acting Appointment Details:**\n- Current Position: {{current_position}}\n- Acting Position: {{acting_position}}\n- Start Date: {{acting_start_date}}\n- End Date: {{acting_end_date}}\n- Reason: {{acting_reason}}\n- Acting Allowance: {{acting_allowance}}\n\nDuring this period, you will assume the responsibilities and authority of the acting position.\n\n{{signature_block}}\n\nBest regards,\n{{hr_name}}\nHuman Resources' AS body_template,
  '["company_letterhead", "current_date", "letter_number", "employee_name", "current_position", "acting_position", "acting_start_date", "acting_end_date", "acting_reason", "acting_allowance", "signature_block", "hr_name"]'::jsonb AS available_variables,
  true AS requires_approval,
  (SELECT id FROM auth.users LIMIT 1) AS created_by
WHERE NOT EXISTS (SELECT 1 FROM public.letter_templates WHERE code = 'acting_letter');