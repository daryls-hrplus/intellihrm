-- Create letter templates table
CREATE TABLE public.letter_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  subject TEXT NOT NULL,
  body_template TEXT NOT NULL,
  available_variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  company_id UUID REFERENCES public.companies(id),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated letters table
CREATE TABLE public.generated_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.letter_templates(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  requested_by UUID NOT NULL,
  generated_content TEXT NOT NULL,
  variable_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  letter_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.letter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_letters ENABLE ROW LEVEL SECURITY;

-- Letter templates policies
CREATE POLICY "Admins can manage letter templates"
ON public.letter_templates FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active templates"
ON public.letter_templates FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Generated letters policies
CREATE POLICY "Admins can manage all letters"
ON public.generated_letters FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "HR managers can view and approve letters"
ON public.generated_letters FOR SELECT
USING (has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "HR managers can update letter status"
ON public.generated_letters FOR UPDATE
USING (has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Users can view own letters"
ON public.generated_letters FOR SELECT
USING (auth.uid() = employee_id OR auth.uid() = requested_by);

CREATE POLICY "Users can request letters for themselves"
ON public.generated_letters FOR INSERT
WITH CHECK (auth.uid() = requested_by);

-- Create trigger for updated_at
CREATE TRIGGER update_letter_templates_updated_at
BEFORE UPDATE ON public.letter_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_letters_updated_at
BEFORE UPDATE ON public.generated_letters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Generate letter number function
CREATE OR REPLACE FUNCTION public.generate_letter_number()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  year_prefix := to_char(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(letter_number FROM 5) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM generated_letters
  WHERE letter_number LIKE 'LTR-' || year_prefix || '-%';
  
  NEW.letter_number := 'LTR-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER generate_letter_number_trigger
BEFORE INSERT ON public.generated_letters
FOR EACH ROW
EXECUTE FUNCTION public.generate_letter_number();

-- Insert default templates
INSERT INTO public.letter_templates (name, code, category, description, subject, body_template, available_variables, requires_approval, created_by) VALUES
(
  'Employment Confirmation Letter',
  'employment_confirmation',
  'employment',
  'Confirms current employment status for an employee',
  'Employment Confirmation - {{employee_name}}',
  E'[Company Letterhead]\n\nDate: {{current_date}}\nRef: {{letter_number}}\n\nTo Whom It May Concern,\n\nThis is to confirm that {{employee_name}} has been employed with {{company_name}} since {{hire_date}}.\n\nCurrent Position: {{position_title}}\nDepartment: {{department_name}}\nEmployment Type: {{employment_type}}\n\nThis letter is issued upon the request of the employee for whatever legal purpose it may serve.\n\nShould you require any further information, please do not hesitate to contact us.\n\nSincerely,\n\n___________________________\nHuman Resources Department\n{{company_name}}',
  '["employee_name", "company_name", "hire_date", "position_title", "department_name", "employment_type", "current_date", "letter_number"]',
  false,
  '00000000-0000-0000-0000-000000000000'
),
(
  'Promotion Letter',
  'promotion',
  'career',
  'Official letter announcing employee promotion',
  'Promotion Announcement - {{employee_name}}',
  E'[Company Letterhead]\n\nDate: {{current_date}}\nRef: {{letter_number}}\n\nDear {{employee_name}},\n\nWe are pleased to inform you of your promotion to the position of {{new_position}} in the {{department_name}} department, effective {{effective_date}}.\n\nYour new compensation package will be as follows:\n- New Salary: {{new_salary}}\n- Other Benefits: As per company policy\n\nThis promotion is a recognition of your outstanding performance, dedication, and contributions to {{company_name}}.\n\nWe are confident that you will continue to excel in your new role and contribute significantly to our organization''s success.\n\nPlease sign and return the duplicate copy of this letter as acknowledgment of your acceptance.\n\nCongratulations!\n\nSincerely,\n\n___________________________\n{{approver_name}}\n{{approver_title}}',
  '["employee_name", "new_position", "department_name", "effective_date", "new_salary", "company_name", "approver_name", "approver_title", "current_date", "letter_number"]',
  true,
  '00000000-0000-0000-0000-000000000000'
),
(
  'Salary Increment Letter',
  'salary_increment',
  'compensation',
  'Official letter for salary increase',
  'Salary Revision - {{employee_name}}',
  E'[Company Letterhead]\n\nDate: {{current_date}}\nRef: {{letter_number}}\n\nDear {{employee_name}},\n\nWe are pleased to inform you that your salary has been revised effective {{effective_date}}.\n\nDetails of the revision:\n- Previous Salary: {{previous_salary}}\n- New Salary: {{new_salary}}\n- Increment: {{increment_percentage}}%\n\nThis increment is in recognition of your valuable contributions and performance at {{company_name}}.\n\nWe appreciate your continued dedication and look forward to your ongoing success with our organization.\n\nBest regards,\n\n___________________________\nHuman Resources Department\n{{company_name}}',
  '["employee_name", "effective_date", "previous_salary", "new_salary", "increment_percentage", "company_name", "current_date", "letter_number"]',
  true,
  '00000000-0000-0000-0000-000000000000'
),
(
  'Experience Letter',
  'experience',
  'employment',
  'Letter certifying work experience upon leaving',
  'Experience Certificate - {{employee_name}}',
  E'[Company Letterhead]\n\nDate: {{current_date}}\nRef: {{letter_number}}\n\nTo Whom It May Concern,\n\nThis is to certify that {{employee_name}} was employed with {{company_name}} from {{start_date}} to {{end_date}}.\n\nDuring this period, they held the position of {{position_title}} in the {{department_name}} department.\n\nTheir responsibilities included:\n{{responsibilities}}\n\nWe found them to be {{performance_summary}}.\n\nWe wish them all the best in their future endeavors.\n\nSincerely,\n\n___________________________\nHuman Resources Department\n{{company_name}}',
  '["employee_name", "company_name", "start_date", "end_date", "position_title", "department_name", "responsibilities", "performance_summary", "current_date", "letter_number"]',
  true,
  '00000000-0000-0000-0000-000000000000'
),
(
  'Address Proof Letter',
  'address_proof',
  'general',
  'Letter confirming employee address for official purposes',
  'Address Confirmation - {{employee_name}}',
  E'[Company Letterhead]\n\nDate: {{current_date}}\nRef: {{letter_number}}\n\nTo Whom It May Concern,\n\nThis is to certify that {{employee_name}}, Employee ID: {{employee_id}}, is currently employed with {{company_name}} as {{position_title}}.\n\nAs per our records, their residential address is:\n{{employee_address}}\n\nThis letter is issued upon the request of the employee for official purposes.\n\nSincerely,\n\n___________________________\nHuman Resources Department\n{{company_name}}',
  '["employee_name", "employee_id", "company_name", "position_title", "employee_address", "current_date", "letter_number"]',
  false,
  '00000000-0000-0000-0000-000000000000'
),
(
  'No Objection Certificate',
  'noc',
  'general',
  'NOC for various purposes like visa, loan, etc.',
  'No Objection Certificate - {{employee_name}}',
  E'[Company Letterhead]\n\nDate: {{current_date}}\nRef: {{letter_number}}\n\nTo Whom It May Concern,\n\nThis is to certify that {{employee_name}} is employed with {{company_name}} as {{position_title}} since {{hire_date}}.\n\nWe have no objection to them {{purpose}}.\n\nThis NOC is issued upon the request of the employee.\n\nSincerely,\n\n___________________________\nHuman Resources Department\n{{company_name}}',
  '["employee_name", "company_name", "position_title", "hire_date", "purpose", "current_date", "letter_number"]',
  true,
  '00000000-0000-0000-0000-000000000000'
);