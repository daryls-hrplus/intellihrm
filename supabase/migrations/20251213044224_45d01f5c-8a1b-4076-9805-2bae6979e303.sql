-- Create recruitment job requisitions table
CREATE TABLE public.job_requisitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  position_id UUID REFERENCES public.positions(id),
  requisition_number TEXT UNIQUE,
  title TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  location TEXT,
  employment_type TEXT NOT NULL DEFAULT 'full_time',
  experience_level TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT DEFAULT 'USD',
  description TEXT,
  requirements TEXT,
  responsibilities TEXT,
  benefits TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  priority TEXT DEFAULT 'normal',
  openings INTEGER DEFAULT 1,
  filled_count INTEGER DEFAULT 0,
  hiring_manager_id UUID REFERENCES public.profiles(id),
  recruiter_id UUID REFERENCES public.profiles(id),
  target_hire_date DATE,
  posted_date DATE,
  closed_date DATE,
  workflow_instance_id UUID,
  is_remote BOOLEAN DEFAULT false,
  is_internal_only BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to generate requisition number
CREATE OR REPLACE FUNCTION public.generate_requisition_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.requisition_number := 'REQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_requisition_number
  BEFORE INSERT ON public.job_requisitions
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_requisition_number();

-- Create job board configurations table
CREATE TABLE public.job_board_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  webhook_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  auto_post BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Create job postings table (tracks where jobs are posted)
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requisition_id UUID NOT NULL REFERENCES public.job_requisitions(id) ON DELETE CASCADE,
  job_board_config_id UUID NOT NULL REFERENCES public.job_board_configs(id) ON DELETE CASCADE,
  external_job_id TEXT,
  posting_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  posted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  external_candidate_id TEXT,
  source TEXT DEFAULT 'direct',
  source_job_board TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  current_company TEXT,
  current_title TEXT,
  years_experience INTEGER,
  skills JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  notes TEXT,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requisition_id UUID NOT NULL REFERENCES public.job_requisitions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  application_number TEXT UNIQUE,
  external_application_id TEXT,
  source TEXT DEFAULT 'direct',
  source_job_board TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  stage TEXT NOT NULL DEFAULT 'applied',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  cover_letter TEXT,
  expected_salary NUMERIC,
  notice_period_days INTEGER,
  available_start_date DATE,
  screening_answers JSONB DEFAULT '[]',
  interview_scores JSONB DEFAULT '[]',
  notes TEXT,
  rejection_reason TEXT,
  offer_details JSONB,
  hired_at TIMESTAMP WITH TIME ZONE,
  hired_employee_id UUID REFERENCES public.profiles(id),
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to generate application number
CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.application_number := 'APP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_application_number
  BEFORE INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_application_number();

-- Create interview schedules table
CREATE TABLE public.interview_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL DEFAULT 'video',
  interview_round INTEGER DEFAULT 1,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  interviewer_ids UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'scheduled',
  feedback JSONB,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  recommendation TEXT,
  notes TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offer letters table
CREATE TABLE public.offer_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  offer_number TEXT UNIQUE,
  position_title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT,
  salary_amount NUMERIC NOT NULL,
  salary_currency TEXT DEFAULT 'USD',
  salary_period TEXT DEFAULT 'annual',
  bonus_details JSONB,
  benefits_summary TEXT,
  start_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  decline_reason TEXT,
  signed_document_url TEXT,
  workflow_instance_id UUID,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to generate offer number
CREATE OR REPLACE FUNCTION public.generate_offer_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.offer_number := 'OFR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_offer_number
  BEFORE INSERT ON public.offer_letters
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_offer_number();

-- Create job board webhook logs table
CREATE TABLE public.job_board_webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_board_config_id UUID REFERENCES public.job_board_configs(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_board_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_board_webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_requisitions
CREATE POLICY "Users can view job requisitions" ON public.job_requisitions
  FOR SELECT USING (true);
CREATE POLICY "Admin/HR can manage job requisitions" ON public.job_requisitions
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for job_board_configs
CREATE POLICY "Admin can view job board configs" ON public.job_board_configs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admin can manage job board configs" ON public.job_board_configs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for job_postings
CREATE POLICY "Admin/HR can view job postings" ON public.job_postings
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admin/HR can manage job postings" ON public.job_postings
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for candidates
CREATE POLICY "Admin/HR can view candidates" ON public.candidates
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admin/HR can manage candidates" ON public.candidates
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for applications
CREATE POLICY "Admin/HR can view applications" ON public.applications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admin/HR can manage applications" ON public.applications
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for interview_schedules
CREATE POLICY "Admin/HR can view interview schedules" ON public.interview_schedules
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admin/HR can manage interview schedules" ON public.interview_schedules
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for offer_letters
CREATE POLICY "Admin/HR can view offer letters" ON public.offer_letters
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admin/HR can manage offer letters" ON public.offer_letters
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for webhook logs (admin only)
CREATE POLICY "Admin can view webhook logs" ON public.job_board_webhook_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Service role can insert webhook logs" ON public.job_board_webhook_logs
  FOR INSERT WITH CHECK (true);

-- Create update triggers
CREATE TRIGGER update_job_requisitions_updated_at BEFORE UPDATE ON public.job_requisitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_board_configs_updated_at BEFORE UPDATE ON public.job_board_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_interview_schedules_updated_at BEFORE UPDATE ON public.interview_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_offer_letters_updated_at BEFORE UPDATE ON public.offer_letters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();