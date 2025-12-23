-- Create employee_csme_certificates table
CREATE TABLE IF NOT EXISTS public.employee_csme_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  occupation TEXT NOT NULL,
  issuing_country TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verified_by_country TEXT,
  verification_date DATE,
  document_url TEXT,
  document_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create employee_travel_documents table
CREATE TABLE IF NOT EXISTS public.employee_travel_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  issuing_country TEXT NOT NULL,
  nationality TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issue_place TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  document_url TEXT,
  document_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create employee_emergency_plans table
CREATE TABLE IF NOT EXISTS public.employee_emergency_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  evacuation_destination TEXT,
  evacuation_contact_name TEXT,
  evacuation_contact_phone TEXT,
  evacuation_contact_relationship TEXT,
  embassy_contact TEXT,
  medical_considerations TEXT,
  travel_restrictions TEXT,
  preferred_airline TEXT,
  notes TEXT,
  last_reviewed_at TIMESTAMPTZ,
  last_reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.employee_csme_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_travel_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_emergency_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_csme_certificates
CREATE POLICY "Users can view their own CSME certificates" ON public.employee_csme_certificates FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all CSME certificates" ON public.employee_csme_certificates FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Admin', 'HR Manager')));
CREATE POLICY "HR can manage CSME certificates" ON public.employee_csme_certificates FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Admin', 'HR Manager')));

-- RLS policies for employee_travel_documents
CREATE POLICY "Users can view their own travel documents" ON public.employee_travel_documents FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all travel documents" ON public.employee_travel_documents FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Admin', 'HR Manager')));
CREATE POLICY "HR can manage travel documents" ON public.employee_travel_documents FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Admin', 'HR Manager')));

-- RLS policies for employee_emergency_plans
CREATE POLICY "Users can view their own emergency plan" ON public.employee_emergency_plans FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all emergency plans" ON public.employee_emergency_plans FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Admin', 'HR Manager')));
CREATE POLICY "HR can manage emergency plans" ON public.employee_emergency_plans FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('Super Admin', 'HR Admin', 'HR Manager')));

-- Create indexes
CREATE INDEX idx_csme_certificates_employee ON public.employee_csme_certificates(employee_id);
CREATE INDEX idx_travel_documents_employee ON public.employee_travel_documents(employee_id);
CREATE INDEX idx_emergency_plans_employee ON public.employee_emergency_plans(employee_id);