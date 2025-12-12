-- Create report templates table
CREATE TABLE public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  is_global BOOLEAN NOT NULL DEFAULT false,
  company_id UUID REFERENCES public.companies(id),
  data_source TEXT NOT NULL,
  layout JSONB NOT NULL DEFAULT '{}',
  bands JSONB NOT NULL DEFAULT '[]',
  parameters JSONB NOT NULL DEFAULT '[]',
  grouping JSONB NOT NULL DEFAULT '[]',
  sorting JSONB NOT NULL DEFAULT '[]',
  calculations JSONB NOT NULL DEFAULT '[]',
  page_settings JSONB NOT NULL DEFAULT '{"orientation": "portrait", "size": "A4", "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20}}',
  created_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_report_template_code UNIQUE (code, company_id)
);

-- Create report template bands table for detailed band configuration
CREATE TABLE public.report_template_bands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.report_templates(id) ON DELETE CASCADE,
  band_type TEXT NOT NULL CHECK (band_type IN ('report_header', 'page_header', 'group_header', 'detail', 'group_footer', 'page_footer', 'report_footer', 'sub_report')),
  band_order INTEGER NOT NULL DEFAULT 0,
  group_field TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  height INTEGER DEFAULT 50,
  visible BOOLEAN NOT NULL DEFAULT true,
  page_break_before BOOLEAN NOT NULL DEFAULT false,
  page_break_after BOOLEAN NOT NULL DEFAULT false,
  repeat_on_each_page BOOLEAN NOT NULL DEFAULT false,
  sub_report_template_id UUID REFERENCES public.report_templates(id),
  sub_report_link_field TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report fields table for available fields per data source
CREATE TABLE public.report_data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  module TEXT NOT NULL,
  description TEXT,
  base_table TEXT NOT NULL,
  join_config JSONB NOT NULL DEFAULT '[]',
  available_fields JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated reports table for storing executed reports
CREATE TABLE public.generated_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.report_templates(id),
  report_number TEXT NOT NULL,
  generated_by UUID REFERENCES public.profiles(id),
  parameters_used JSONB NOT NULL DEFAULT '{}',
  output_format TEXT NOT NULL CHECK (output_format IN ('pdf', 'excel', 'csv', 'pptx')),
  file_url TEXT,
  row_count INTEGER,
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved report configurations for quick access
CREATE TABLE public.saved_report_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.report_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  parameters JSONB NOT NULL DEFAULT '{}',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to generate report number
CREATE OR REPLACE FUNCTION public.generate_report_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  year_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  year_prefix := to_char(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(report_number FROM 5) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM generated_reports
  WHERE report_number LIKE 'RPT-' || year_prefix || '-%';
  
  NEW.report_number := 'RPT-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

-- Create trigger for report number
CREATE TRIGGER set_report_number
  BEFORE INSERT ON public.generated_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_report_number();

-- Enable RLS
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_template_bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_report_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies for report_templates
CREATE POLICY "Users can view global templates or their company templates"
ON public.report_templates FOR SELECT
USING (
  is_global = true 
  OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'hr_manager')
);

CREATE POLICY "Admins and HR managers can create templates"
ON public.report_templates FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins and HR managers can update templates"
ON public.report_templates FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins can delete templates"
ON public.report_templates FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for report_template_bands
CREATE POLICY "Users can view bands for accessible templates"
ON public.report_template_bands FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM report_templates rt
    WHERE rt.id = template_id
    AND (rt.is_global = true OR rt.company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
         OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'))
  )
);

CREATE POLICY "Admins and HR managers can manage bands"
ON public.report_template_bands FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS policies for report_data_sources
CREATE POLICY "All authenticated users can view data sources"
ON public.report_data_sources FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage data sources"
ON public.report_data_sources FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for generated_reports
CREATE POLICY "Users can view their own generated reports"
ON public.generated_reports FOR SELECT
USING (generated_by = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Authenticated users can generate reports"
ON public.generated_reports FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS policies for saved_report_configs
CREATE POLICY "Users can manage their own saved configs"
ON public.saved_report_configs FOR ALL
USING (user_id = auth.uid());

-- Create updated_at triggers
CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_template_bands_updated_at
  BEFORE UPDATE ON public.report_template_bands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_data_sources_updated_at
  BEFORE UPDATE ON public.report_data_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_report_configs_updated_at
  BEFORE UPDATE ON public.saved_report_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data sources for each module
INSERT INTO public.report_data_sources (name, code, module, description, base_table, available_fields) VALUES
('Employees', 'employees', 'workforce', 'Employee master data', 'profiles', '[
  {"name": "id", "label": "Employee ID", "type": "uuid"},
  {"name": "full_name", "label": "Full Name", "type": "text"},
  {"name": "email", "label": "Email", "type": "text"},
  {"name": "hire_date", "label": "Hire Date", "type": "date"},
  {"name": "company_id", "label": "Company", "type": "uuid", "lookup": "companies"},
  {"name": "department_id", "label": "Department", "type": "uuid", "lookup": "departments"}
]'::jsonb),
('Positions', 'positions', 'workforce', 'Position data', 'positions', '[
  {"name": "id", "label": "Position ID", "type": "uuid"},
  {"name": "title", "label": "Title", "type": "text"},
  {"name": "code", "label": "Code", "type": "text"},
  {"name": "department_id", "label": "Department", "type": "uuid", "lookup": "departments"},
  {"name": "authorized_headcount", "label": "Authorized Headcount", "type": "integer"}
]'::jsonb),
('Goals', 'goals', 'performance', 'Performance goals', 'goals', '[
  {"name": "id", "label": "Goal ID", "type": "uuid"},
  {"name": "title", "label": "Title", "type": "text"},
  {"name": "status", "label": "Status", "type": "text"},
  {"name": "progress", "label": "Progress %", "type": "integer"},
  {"name": "employee_id", "label": "Employee", "type": "uuid", "lookup": "profiles"},
  {"name": "due_date", "label": "Due Date", "type": "date"}
]'::jsonb),
('Appraisals', 'appraisals', 'performance', 'Performance appraisals', 'appraisal_participants', '[
  {"name": "id", "label": "Participant ID", "type": "uuid"},
  {"name": "employee_id", "label": "Employee", "type": "uuid", "lookup": "profiles"},
  {"name": "cycle_id", "label": "Cycle", "type": "uuid", "lookup": "appraisal_cycles"},
  {"name": "status", "label": "Status", "type": "text"},
  {"name": "overall_score", "label": "Overall Score", "type": "numeric"}
]'::jsonb),
('360 Reviews', 'reviews_360', 'performance', '360-degree feedback reviews', 'review_participants', '[
  {"name": "id", "label": "Participant ID", "type": "uuid"},
  {"name": "employee_id", "label": "Employee", "type": "uuid", "lookup": "profiles"},
  {"name": "cycle_id", "label": "Cycle", "type": "uuid", "lookup": "review_cycles"},
  {"name": "status", "label": "Status", "type": "text"},
  {"name": "overall_score", "label": "Overall Score", "type": "numeric"}
]'::jsonb),
('Benefit Enrollments', 'benefit_enrollments', 'benefits', 'Benefit enrollment data', 'benefit_enrollments', '[
  {"name": "id", "label": "Enrollment ID", "type": "uuid"},
  {"name": "employee_id", "label": "Employee", "type": "uuid", "lookup": "profiles"},
  {"name": "plan_id", "label": "Plan", "type": "uuid", "lookup": "benefit_plans"},
  {"name": "status", "label": "Status", "type": "text"},
  {"name": "effective_date", "label": "Effective Date", "type": "date"}
]'::jsonb),
('Training Enrollments', 'training_enrollments', 'training', 'Course enrollments', 'course_enrollments', '[
  {"name": "id", "label": "Enrollment ID", "type": "uuid"},
  {"name": "employee_id", "label": "Employee", "type": "uuid", "lookup": "profiles"},
  {"name": "course_id", "label": "Course", "type": "uuid", "lookup": "courses"},
  {"name": "status", "label": "Status", "type": "text"},
  {"name": "progress_percent", "label": "Progress %", "type": "integer"}
]'::jsonb),
('Tickets', 'tickets', 'helpdesk', 'Support tickets', 'tickets', '[
  {"name": "id", "label": "Ticket ID", "type": "uuid"},
  {"name": "ticket_number", "label": "Ticket Number", "type": "text"},
  {"name": "title", "label": "Title", "type": "text"},
  {"name": "status", "label": "Status", "type": "text"},
  {"name": "requester_id", "label": "Requester", "type": "uuid", "lookup": "profiles"},
  {"name": "assignee_id", "label": "Assignee", "type": "uuid", "lookup": "profiles"}
]'::jsonb),
('Compensation', 'compensation', 'compensation', 'Position compensation data', 'position_compensation', '[
  {"name": "id", "label": "Compensation ID", "type": "uuid"},
  {"name": "position_id", "label": "Position", "type": "uuid", "lookup": "positions"},
  {"name": "pay_element_id", "label": "Pay Element", "type": "uuid", "lookup": "pay_elements"},
  {"name": "amount", "label": "Amount", "type": "numeric"},
  {"name": "currency", "label": "Currency", "type": "text"}
]'::jsonb);