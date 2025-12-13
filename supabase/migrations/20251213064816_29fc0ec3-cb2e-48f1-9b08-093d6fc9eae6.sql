
-- Training Requests & Approvals
CREATE TABLE public.training_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_number TEXT,
  request_type TEXT NOT NULL DEFAULT 'external', -- external, internal, conference, certification
  training_name TEXT NOT NULL,
  provider_name TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  location TEXT,
  estimated_cost NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  business_justification TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, completed, cancelled
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  workflow_instance_id UUID REFERENCES public.workflow_instances(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- External Training Records
CREATE TABLE public.external_training_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  training_request_id UUID REFERENCES public.training_requests(id),
  training_name TEXT NOT NULL,
  provider_name TEXT,
  training_type TEXT, -- conference, seminar, workshop, online_course, certification
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  duration_hours NUMERIC(6,2),
  location TEXT,
  actual_cost NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  certificate_received BOOLEAN DEFAULT false,
  certificate_url TEXT,
  certificate_expiry_date DATE,
  skills_acquired TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Training Budgets
CREATE TABLE public.training_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id),
  fiscal_year INTEGER NOT NULL,
  allocated_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, department_id, fiscal_year)
);

-- Instructors
CREATE TABLE public.training_instructors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id), -- NULL if external instructor
  instructor_type TEXT NOT NULL DEFAULT 'internal', -- internal, external
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specializations TEXT[],
  bio TEXT,
  hourly_rate NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Instructor Assignments to Courses
CREATE TABLE public.course_instructors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.training_instructors(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, instructor_id)
);

-- Training Evaluations (Kirkpatrick Model)
CREATE TABLE public.training_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  evaluation_level INTEGER NOT NULL DEFAULT 1, -- 1: Reaction, 2: Learning, 3: Behavior, 4: Results
  questions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evaluation Responses
CREATE TABLE public.training_evaluation_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID NOT NULL REFERENCES public.training_evaluations(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.lms_courses(id),
  external_training_id UUID REFERENCES public.external_training_records(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}',
  overall_rating INTEGER,
  comments TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learning Paths
CREATE TABLE public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  estimated_duration_hours INTEGER,
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Learning Path Courses
CREATE TABLE public.learning_path_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(learning_path_id, course_id)
);

-- Learning Path Enrollments
CREATE TABLE public.learning_path_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_completion_date DATE,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, dropped
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(learning_path_id, employee_id)
);

-- Compliance Training Assignments
CREATE TABLE public.compliance_training (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  frequency_months INTEGER, -- recurrence in months, NULL for one-time
  grace_period_days INTEGER DEFAULT 30,
  applies_to_all BOOLEAN DEFAULT true,
  target_departments UUID[],
  target_positions UUID[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compliance Training Assignments per Employee
CREATE TABLE public.compliance_training_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  compliance_training_id UUID NOT NULL REFERENCES public.compliance_training(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, overdue, completed, exempted
  exemption_reason TEXT,
  reminder_sent_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Course-Competency Mapping
CREATE TABLE public.course_competencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES public.competencies(id) ON DELETE CASCADE,
  proficiency_level_achieved UUID REFERENCES public.competency_levels(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, competency_id)
);

-- Recertification Tracking
CREATE TABLE public.recertification_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  description TEXT,
  validity_months INTEGER NOT NULL DEFAULT 12,
  renewal_course_id UUID REFERENCES public.lms_courses(id),
  reminder_days_before INTEGER DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employee Recertifications
CREATE TABLE public.employee_recertifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_id UUID NOT NULL REFERENCES public.recertification_requirements(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  certification_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  certificate_number TEXT,
  certificate_url TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, expiring_soon, expired, renewed
  renewed_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Training Needs Analysis
CREATE TABLE public.training_needs_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  analysis_type TEXT NOT NULL DEFAULT 'organizational', -- organizational, departmental, individual
  department_id UUID REFERENCES public.departments(id),
  status TEXT NOT NULL DEFAULT 'draft', -- draft, in_progress, completed
  findings JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Training Needs (Individual gaps identified)
CREATE TABLE public.training_needs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.training_needs_analysis(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id),
  department_id UUID REFERENCES public.departments(id),
  competency_id UUID REFERENCES public.competencies(id),
  skill_gap_description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  recommended_training TEXT,
  recommended_course_id UUID REFERENCES public.lms_courses(id),
  status TEXT NOT NULL DEFAULT 'identified', -- identified, planned, in_progress, addressed
  target_date DATE,
  addressed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_evaluation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recertification_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_recertifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_needs_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_needs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Authenticated users can view training requests" ON public.training_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage training requests" ON public.training_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view external training" ON public.external_training_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage external training" ON public.external_training_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view training budgets" ON public.training_budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage training budgets" ON public.training_budgets FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view instructors" ON public.training_instructors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage instructors" ON public.training_instructors FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view course instructors" ON public.course_instructors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage course instructors" ON public.course_instructors FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view evaluations" ON public.training_evaluations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage evaluations" ON public.training_evaluations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view evaluation responses" ON public.training_evaluation_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage evaluation responses" ON public.training_evaluation_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view learning paths" ON public.learning_paths FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage learning paths" ON public.learning_paths FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view learning path courses" ON public.learning_path_courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage learning path courses" ON public.learning_path_courses FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view learning path enrollments" ON public.learning_path_enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage learning path enrollments" ON public.learning_path_enrollments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view compliance training" ON public.compliance_training FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage compliance training" ON public.compliance_training FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view compliance assignments" ON public.compliance_training_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage compliance assignments" ON public.compliance_training_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view course competencies" ON public.course_competencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage course competencies" ON public.course_competencies FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view recertification requirements" ON public.recertification_requirements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage recertification requirements" ON public.recertification_requirements FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view employee recertifications" ON public.employee_recertifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage employee recertifications" ON public.employee_recertifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view training needs analysis" ON public.training_needs_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage training needs analysis" ON public.training_needs_analysis FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view training needs" ON public.training_needs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage training needs" ON public.training_needs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_training_requests_company ON public.training_requests(company_id);
CREATE INDEX idx_training_requests_employee ON public.training_requests(employee_id);
CREATE INDEX idx_training_requests_status ON public.training_requests(status);
CREATE INDEX idx_external_training_company ON public.external_training_records(company_id);
CREATE INDEX idx_external_training_employee ON public.external_training_records(employee_id);
CREATE INDEX idx_training_budgets_company ON public.training_budgets(company_id);
CREATE INDEX idx_training_instructors_company ON public.training_instructors(company_id);
CREATE INDEX idx_learning_paths_company ON public.learning_paths(company_id);
CREATE INDEX idx_compliance_training_company ON public.compliance_training(company_id);
CREATE INDEX idx_compliance_assignments_employee ON public.compliance_training_assignments(employee_id);
CREATE INDEX idx_compliance_assignments_status ON public.compliance_training_assignments(status);
CREATE INDEX idx_recertification_req_company ON public.recertification_requirements(company_id);
CREATE INDEX idx_employee_recert_employee ON public.employee_recertifications(employee_id);
CREATE INDEX idx_employee_recert_status ON public.employee_recertifications(status);
CREATE INDEX idx_training_needs_company ON public.training_needs(company_id);
CREATE INDEX idx_training_needs_analysis_company ON public.training_needs_analysis(company_id);

-- Triggers for updated_at
CREATE TRIGGER update_training_requests_updated_at BEFORE UPDATE ON public.training_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_external_training_updated_at BEFORE UPDATE ON public.external_training_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_budgets_updated_at BEFORE UPDATE ON public.training_budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_instructors_updated_at BEFORE UPDATE ON public.training_instructors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_evaluations_updated_at BEFORE UPDATE ON public.training_evaluations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON public.learning_paths FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_path_enrollments_updated_at BEFORE UPDATE ON public.learning_path_enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_compliance_training_updated_at BEFORE UPDATE ON public.compliance_training FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_compliance_assignments_updated_at BEFORE UPDATE ON public.compliance_training_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recertification_req_updated_at BEFORE UPDATE ON public.recertification_requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_recert_updated_at BEFORE UPDATE ON public.employee_recertifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_needs_analysis_updated_at BEFORE UPDATE ON public.training_needs_analysis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_needs_updated_at BEFORE UPDATE ON public.training_needs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate training request number
CREATE OR REPLACE FUNCTION public.generate_training_request_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.request_number := 'TR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_training_request_number_trigger
BEFORE INSERT ON public.training_requests
FOR EACH ROW EXECUTE FUNCTION public.generate_training_request_number();
