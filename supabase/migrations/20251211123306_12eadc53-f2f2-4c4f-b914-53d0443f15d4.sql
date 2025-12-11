-- Create internal divisions table (optional within companies)
CREATE TABLE public.company_divisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Create departments table (required for companies, can belong to company_division)
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  company_division_id UUID REFERENCES public.company_divisions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Create sections table (optional sub-departments)
CREATE TABLE public.sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(department_id, code)
);

-- Enable RLS
ALTER TABLE public.company_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Company Divisions policies
CREATE POLICY "Authenticated users can view company divisions"
ON public.company_divisions FOR SELECT
USING (true);

CREATE POLICY "Admins can insert company divisions"
ON public.company_divisions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update company divisions"
ON public.company_divisions FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete company divisions"
ON public.company_divisions FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Departments policies
CREATE POLICY "Authenticated users can view departments"
ON public.departments FOR SELECT
USING (true);

CREATE POLICY "Admins can insert departments"
ON public.departments FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update departments"
ON public.departments FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete departments"
ON public.departments FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Sections policies
CREATE POLICY "Authenticated users can view sections"
ON public.sections FOR SELECT
USING (true);

CREATE POLICY "Admins can insert sections"
ON public.sections FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sections"
ON public.sections FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sections"
ON public.sections FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_company_divisions_updated_at
BEFORE UPDATE ON public.company_divisions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
BEFORE UPDATE ON public.sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_company_divisions_company_id ON public.company_divisions(company_id);
CREATE INDEX idx_departments_company_id ON public.departments(company_id);
CREATE INDEX idx_departments_company_division_id ON public.departments(company_division_id);
CREATE INDEX idx_sections_department_id ON public.sections(department_id);

-- Add department_id and section_id to profiles for employee assignment
ALTER TABLE public.profiles 
ADD COLUMN department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
ADD COLUMN section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;