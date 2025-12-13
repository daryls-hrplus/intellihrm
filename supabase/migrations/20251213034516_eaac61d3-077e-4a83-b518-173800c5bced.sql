-- Employee Relations Cases (Grievances, Complaints, Investigations)
CREATE TABLE public.er_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  case_type TEXT NOT NULL DEFAULT 'grievance', -- grievance, complaint, investigation, harassment, discrimination, conflict
  category TEXT, -- workplace_safety, harassment, discrimination, policy_violation, manager_conflict, peer_conflict, compensation, other
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  status TEXT NOT NULL DEFAULT 'open', -- open, investigating, pending_resolution, resolved, closed, escalated, appealed
  title TEXT NOT NULL,
  description TEXT,
  reported_by UUID REFERENCES public.profiles(id),
  reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_to UUID REFERENCES public.profiles(id),
  target_resolution_date DATE,
  actual_resolution_date DATE,
  resolution_summary TEXT,
  is_confidential BOOLEAN NOT NULL DEFAULT true,
  witnesses JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Case Notes/Timeline
CREATE TABLE public.er_case_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.er_cases(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL DEFAULT 'note', -- note, action, decision, meeting, update, escalation
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disciplinary Actions
CREATE TABLE public.er_disciplinary_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  case_id UUID REFERENCES public.er_cases(id),
  action_type TEXT NOT NULL, -- verbal_warning, written_warning, final_warning, suspension, demotion, termination
  severity TEXT NOT NULL DEFAULT 'minor', -- minor, moderate, major, severe
  reason TEXT NOT NULL,
  description TEXT,
  issued_by UUID REFERENCES public.profiles(id),
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE, -- when the action expires from record
  acknowledged_by_employee BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  employee_response TEXT,
  appeal_status TEXT DEFAULT 'none', -- none, pending, approved, denied
  appeal_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, expired, appealed, overturned
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Recognition/Awards
CREATE TABLE public.er_recognition (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  recognition_type TEXT NOT NULL, -- award, appreciation, milestone, peer_recognition, spot_bonus
  category TEXT, -- performance, innovation, teamwork, customer_service, safety, leadership, other
  title TEXT NOT NULL,
  description TEXT,
  awarded_by UUID REFERENCES public.profiles(id),
  award_date DATE NOT NULL DEFAULT CURRENT_DATE,
  monetary_value NUMERIC,
  currency TEXT DEFAULT 'USD',
  is_public BOOLEAN NOT NULL DEFAULT true,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exit Interviews
CREATE TABLE public.er_exit_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  interviewer_id UUID REFERENCES public.profiles(id),
  interview_date DATE NOT NULL,
  departure_reason TEXT, -- resignation, retirement, termination, layoff, other
  last_working_date DATE,
  would_rejoin BOOLEAN,
  overall_satisfaction INTEGER, -- 1-5 scale
  management_satisfaction INTEGER,
  culture_satisfaction INTEGER,
  compensation_satisfaction INTEGER,
  growth_satisfaction INTEGER,
  worklife_balance_satisfaction INTEGER,
  feedback_summary TEXT,
  improvement_suggestions TEXT,
  positive_aspects TEXT,
  negative_aspects TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
  is_confidential BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Surveys
CREATE TABLE public.er_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  survey_type TEXT NOT NULL DEFAULT 'engagement', -- engagement, satisfaction, pulse, feedback, climate
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, closed, archived
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  target_departments JSONB DEFAULT '[]'::jsonb,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Survey Responses
CREATE TABLE public.er_survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.er_surveys(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id), -- null if anonymous
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wellness Programs
CREATE TABLE public.er_wellness_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  program_type TEXT NOT NULL, -- mental_health, physical_fitness, nutrition, stress_management, work_life_balance, financial_wellness
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, upcoming
  start_date DATE NOT NULL,
  end_date DATE,
  max_participants INTEGER,
  budget NUMERIC,
  currency TEXT DEFAULT 'USD',
  coordinator_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wellness Program Enrollments
CREATE TABLE public.er_wellness_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.er_wellness_programs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  enrolled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'enrolled', -- enrolled, completed, withdrawn
  completion_date DATE,
  feedback TEXT,
  satisfaction_rating INTEGER, -- 1-5
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_er_cases_company ON public.er_cases(company_id);
CREATE INDEX idx_er_cases_employee ON public.er_cases(employee_id);
CREATE INDEX idx_er_cases_status ON public.er_cases(status);
CREATE INDEX idx_er_disciplinary_company ON public.er_disciplinary_actions(company_id);
CREATE INDEX idx_er_disciplinary_employee ON public.er_disciplinary_actions(employee_id);
CREATE INDEX idx_er_recognition_company ON public.er_recognition(company_id);
CREATE INDEX idx_er_exit_interviews_company ON public.er_exit_interviews(company_id);
CREATE INDEX idx_er_surveys_company ON public.er_surveys(company_id);
CREATE INDEX idx_er_wellness_company ON public.er_wellness_programs(company_id);

-- Enable RLS
ALTER TABLE public.er_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_disciplinary_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_exit_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_wellness_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_wellness_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for er_cases
CREATE POLICY "HR and Admin can manage all cases"
ON public.er_cases FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can view their own cases"
ON public.er_cases FOR SELECT
USING (employee_id = auth.uid() OR reported_by = auth.uid());

-- RLS Policies for er_case_notes
CREATE POLICY "HR and Admin can manage case notes"
ON public.er_case_notes FOR ALL
USING (EXISTS (
  SELECT 1 FROM er_cases c 
  WHERE c.id = er_case_notes.case_id 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role))
));

CREATE POLICY "Case participants can view non-internal notes"
ON public.er_case_notes FOR SELECT
USING (
  is_internal = false AND EXISTS (
    SELECT 1 FROM er_cases c 
    WHERE c.id = er_case_notes.case_id 
    AND (c.employee_id = auth.uid() OR c.reported_by = auth.uid())
  )
);

-- RLS Policies for er_disciplinary_actions
CREATE POLICY "HR and Admin can manage disciplinary actions"
ON public.er_disciplinary_actions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can view own disciplinary actions"
ON public.er_disciplinary_actions FOR SELECT
USING (employee_id = auth.uid());

-- RLS Policies for er_recognition
CREATE POLICY "HR and Admin can manage recognition"
ON public.er_recognition FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Public recognition viewable by all"
ON public.er_recognition FOR SELECT
USING (is_public = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Employees can view own recognition"
ON public.er_recognition FOR SELECT
USING (employee_id = auth.uid());

-- RLS Policies for er_exit_interviews
CREATE POLICY "HR and Admin can manage exit interviews"
ON public.er_exit_interviews FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can view own exit interview"
ON public.er_exit_interviews FOR SELECT
USING (employee_id = auth.uid());

-- RLS Policies for er_surveys
CREATE POLICY "HR and Admin can manage surveys"
ON public.er_surveys FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can view active surveys"
ON public.er_surveys FOR SELECT
USING (status = 'active' AND auth.uid() IS NOT NULL);

-- RLS Policies for er_survey_responses
CREATE POLICY "HR and Admin can view all responses"
ON public.er_survey_responses FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can submit survey responses"
ON public.er_survey_responses FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Employees can view own non-anonymous responses"
ON public.er_survey_responses FOR SELECT
USING (employee_id = auth.uid());

-- RLS Policies for er_wellness_programs
CREATE POLICY "HR and Admin can manage wellness programs"
ON public.er_wellness_programs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can view active wellness programs"
ON public.er_wellness_programs FOR SELECT
USING (status IN ('active', 'upcoming') AND auth.uid() IS NOT NULL);

-- RLS Policies for er_wellness_enrollments
CREATE POLICY "HR and Admin can manage wellness enrollments"
ON public.er_wellness_enrollments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can manage own enrollments"
ON public.er_wellness_enrollments FOR ALL
USING (employee_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_er_cases_updated_at
  BEFORE UPDATE ON public.er_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_er_disciplinary_updated_at
  BEFORE UPDATE ON public.er_disciplinary_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_er_exit_interviews_updated_at
  BEFORE UPDATE ON public.er_exit_interviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_er_surveys_updated_at
  BEFORE UPDATE ON public.er_surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_er_wellness_programs_updated_at
  BEFORE UPDATE ON public.er_wellness_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();