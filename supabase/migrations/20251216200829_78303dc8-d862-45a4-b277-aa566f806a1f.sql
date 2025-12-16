-- =============================================
-- QUALIFICATIONS MODULE - ENTERPRISE SCHEMA
-- =============================================

-- CATALOG TABLES

-- Education Levels (ISCED Classification)
CREATE TABLE public.education_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  isced_level INTEGER,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Qualification Types (with participation included)
CREATE TABLE public.qualification_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('academic', 'certification', 'license', 'membership', 'participation')),
  description TEXT,
  requires_expiry BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fields of Study
CREATE TABLE public.fields_of_study (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Institutions
CREATE TABLE public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  short_name TEXT,
  institution_type TEXT CHECK (institution_type IN ('university', 'college', 'vocational', 'high_school', 'online', 'professional_body', 'other')),
  country TEXT NOT NULL,
  city TEXT,
  website TEXT,
  is_accredited BOOLEAN DEFAULT true,
  accreditation_body TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Accrediting Bodies
CREATE TABLE public.accrediting_bodies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  short_name TEXT,
  body_type TEXT CHECK (body_type IN ('certification', 'licensing', 'membership', 'accreditation')),
  country TEXT,
  industry TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- MAIN QUALIFICATIONS TABLE
CREATE TABLE public.employee_qualifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('academic', 'certification', 'license', 'membership', 'participation')),
  qualification_type_id UUID REFERENCES public.qualification_types(id),
  name TEXT NOT NULL,
  description TEXT,
  country TEXT,
  education_level_id UUID REFERENCES public.education_levels(id),
  field_of_study_id UUID REFERENCES public.fields_of_study(id),
  specialization TEXT,
  minor TEXT,
  institution_id UUID REFERENCES public.institutions(id),
  institution_name TEXT,
  campus_location TEXT,
  accrediting_body_id UUID REFERENCES public.accrediting_bodies(id),
  accrediting_body_name TEXT,
  license_number TEXT,
  start_date DATE,
  end_date DATE,
  date_awarded DATE,
  issued_date DATE,
  expiry_date DATE,
  renewal_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('ongoing', 'completed', 'withdrawn', 'deferred', 'active', 'expired', 'suspended', 'revoked', 'in_progress', 'pending')),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id),
  verification_date TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  document_url TEXT,
  document_name TEXT,
  document_type TEXT,
  linked_competency_ids UUID[] DEFAULT '{}',
  comments TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- QUALIFICATION RENEWALS
CREATE TABLE public.qualification_renewals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qualification_id UUID NOT NULL REFERENCES public.employee_qualifications(id) ON DELETE CASCADE,
  previous_expiry_date DATE,
  new_expiry_date DATE NOT NULL,
  renewal_date DATE NOT NULL,
  renewal_cost NUMERIC(12,2),
  currency TEXT,
  notes TEXT,
  renewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- JOB QUALIFICATION REQUIREMENTS
CREATE TABLE public.job_qualification_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('education', 'certification', 'license')),
  education_level_id UUID REFERENCES public.education_levels(id),
  field_of_study_id UUID REFERENCES public.fields_of_study(id),
  min_education_level_order INTEGER,
  qualification_type_id UUID REFERENCES public.qualification_types(id),
  accrediting_body_id UUID REFERENCES public.accrediting_bodies(id),
  specific_qualification_name TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  is_preferred BOOLEAN DEFAULT false,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- VERIFICATION REQUESTS
CREATE TABLE public.qualification_verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qualification_id UUID NOT NULL REFERENCES public.employee_qualifications(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'verified', 'rejected', 'deferred')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- COMPANY SETTINGS
CREATE TABLE public.company_qualification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  expiry_reminder_days INTEGER[] DEFAULT '{90, 60, 30, 14, 7}',
  verification_sla_days INTEGER DEFAULT 7,
  allow_employee_self_entry BOOLEAN DEFAULT true,
  require_verification BOOLEAN DEFAULT true,
  allow_document_upload BOOLEAN DEFAULT true,
  max_document_size_mb INTEGER DEFAULT 10,
  allowed_document_types TEXT[] DEFAULT '{pdf,jpg,jpeg,png}',
  auto_expire_certifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_employee_qualifications_employee ON public.employee_qualifications(employee_id);
CREATE INDEX idx_employee_qualifications_company ON public.employee_qualifications(company_id);
CREATE INDEX idx_employee_qualifications_record_type ON public.employee_qualifications(record_type);
CREATE INDEX idx_employee_qualifications_expiry ON public.employee_qualifications(expiry_date);
CREATE INDEX idx_job_qualification_requirements_job ON public.job_qualification_requirements(job_id);

-- ENABLE RLS
ALTER TABLE public.education_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields_of_study ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accrediting_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_qualification_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_qualification_settings ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Read catalogs" ON public.education_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read catalogs" ON public.qualification_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read catalogs" ON public.fields_of_study FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read catalogs" ON public.institutions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read catalogs" ON public.accrediting_bodies FOR SELECT TO authenticated USING (true);

CREATE POLICY "View qualifications" ON public.employee_qualifications FOR SELECT TO authenticated 
USING (employee_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Insert qualifications" ON public.employee_qualifications FOR INSERT TO authenticated 
WITH CHECK (employee_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Update qualifications" ON public.employee_qualifications FOR UPDATE TO authenticated 
USING (employee_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Delete qualifications" ON public.employee_qualifications FOR DELETE TO authenticated 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "View job requirements" ON public.job_qualification_requirements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage job requirements" ON public.job_qualification_requirements FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "View verification" ON public.qualification_verification_requests FOR SELECT TO authenticated 
USING (requested_by = auth.uid() OR assigned_to = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Manage verification" ON public.qualification_verification_requests FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Manage settings" ON public.company_qualification_settings FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "View renewals" ON public.qualification_renewals FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.employee_qualifications eq WHERE eq.id = qualification_id AND (eq.employee_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'))));

CREATE POLICY "Manage renewals" ON public.qualification_renewals FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- TRIGGERS
CREATE TRIGGER update_education_levels_updated_at BEFORE UPDATE ON public.education_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qualification_types_updated_at BEFORE UPDATE ON public.qualification_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fields_of_study_updated_at BEFORE UPDATE ON public.fields_of_study FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accrediting_bodies_updated_at BEFORE UPDATE ON public.accrediting_bodies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_qualifications_updated_at BEFORE UPDATE ON public.employee_qualifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_requirements_updated_at BEFORE UPDATE ON public.job_qualification_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verification_updated_at BEFORE UPDATE ON public.qualification_verification_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.company_qualification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SEED DATA
INSERT INTO public.education_levels (code, name, isced_level, display_order) VALUES
('SECONDARY', 'Secondary Education', 3, 1),
('POST_SECONDARY', 'Post-Secondary Non-Tertiary', 4, 2),
('VOCATIONAL', 'Vocational/Technical', 5, 3),
('ASSOCIATE', 'Associate Degree', 5, 4),
('BACHELOR', 'Bachelor''s Degree', 6, 5),
('POSTGRAD_CERT', 'Postgraduate Certificate/Diploma', 7, 6),
('MASTER', 'Master''s Degree', 7, 7),
('DOCTORATE', 'Doctorate/PhD', 8, 8);

INSERT INTO public.qualification_types (code, name, record_type, requires_expiry, display_order) VALUES
('DIPLOMA', 'Diploma', 'academic', false, 1),
('ASSOCIATE', 'Associate Degree', 'academic', false, 2),
('BACHELOR', 'Bachelor''s Degree', 'academic', false, 3),
('MASTER', 'Master''s Degree', 'academic', false, 4),
('DOCTORATE', 'Doctorate/PhD', 'academic', false, 5),
('PROF_CERT', 'Professional Certification', 'certification', true, 10),
('TECH_CERT', 'Technical Certification', 'certification', true, 11),
('LICENSE', 'Professional License', 'license', true, 20),
('MEMBERSHIP', 'Professional Membership', 'membership', true, 30),
('COMPLETION', 'Certificate of Completion', 'participation', false, 40);

INSERT INTO public.fields_of_study (code, name, category) VALUES
('CS', 'Computer Science', 'STEM'),
('IT', 'Information Technology', 'STEM'),
('BA', 'Business Administration', 'Business'),
('HR', 'Human Resources', 'Business'),
('ACCT', 'Accounting', 'Business'),
('FIN', 'Finance', 'Business'),
('ENG', 'Engineering', 'STEM'),
('MED', 'Medicine', 'Healthcare'),
('NURS', 'Nursing', 'Healthcare'),
('LAW', 'Law', 'Legal'),
('EDU', 'Education', 'Education'),
('PSYCH', 'Psychology', 'Social Sciences');

INSERT INTO public.accrediting_bodies (code, name, short_name, body_type, industry) VALUES
('SHRM', 'Society for Human Resource Management', 'SHRM', 'certification', 'HR'),
('HRCI', 'HR Certification Institute', 'HRCI', 'certification', 'HR'),
('PMI', 'Project Management Institute', 'PMI', 'certification', 'Project Management'),
('ISACA', 'Information Systems Audit and Control Association', 'ISACA', 'certification', 'IT'),
('COMPTIA', 'Computing Technology Industry Association', 'CompTIA', 'certification', 'IT'),
('CFA', 'CFA Institute', 'CFA', 'certification', 'Finance'),
('ACCA', 'Association of Chartered Certified Accountants', 'ACCA', 'certification', 'Accounting'),
('CIMA', 'Chartered Institute of Management Accountants', 'CIMA', 'certification', 'Accounting');