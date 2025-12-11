
-- Employee Dependents
CREATE TABLE public.employee_dependents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  id_number TEXT,
  is_disabled BOOLEAN DEFAULT false,
  is_student BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Work Permits
CREATE TABLE public.employee_work_permits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permit_type TEXT NOT NULL,
  permit_number TEXT NOT NULL,
  issuing_country TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  sponsoring_company TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Licenses
CREATE TABLE public.employee_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_type TEXT NOT NULL,
  license_number TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  issuing_country TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Background Checks
CREATE TABLE public.employee_background_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  provider TEXT,
  requested_date DATE NOT NULL,
  completed_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  result TEXT,
  reference_number TEXT,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee References
CREATE TABLE public.employee_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  company TEXT,
  position TEXT,
  phone TEXT,
  email TEXT,
  years_known INTEGER,
  reference_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  feedback TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_work_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_background_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_references ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_dependents
CREATE POLICY "Users can view own dependents" ON public.employee_dependents FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all dependents" ON public.employee_dependents FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own dependents" ON public.employee_dependents FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all dependents" ON public.employee_dependents FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_work_permits
CREATE POLICY "Users can view own work permits" ON public.employee_work_permits FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all work permits" ON public.employee_work_permits FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own work permits" ON public.employee_work_permits FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all work permits" ON public.employee_work_permits FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_licenses
CREATE POLICY "Users can view own licenses" ON public.employee_licenses FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all licenses" ON public.employee_licenses FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own licenses" ON public.employee_licenses FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all licenses" ON public.employee_licenses FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_background_checks
CREATE POLICY "Users can view own background checks" ON public.employee_background_checks FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all background checks" ON public.employee_background_checks FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own background checks" ON public.employee_background_checks FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all background checks" ON public.employee_background_checks FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_references
CREATE POLICY "Users can view own references" ON public.employee_references FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all references" ON public.employee_references FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own references" ON public.employee_references FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all references" ON public.employee_references FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- Indexes
CREATE INDEX idx_employee_dependents_employee ON public.employee_dependents(employee_id);
CREATE INDEX idx_employee_work_permits_employee ON public.employee_work_permits(employee_id);
CREATE INDEX idx_employee_licenses_employee ON public.employee_licenses(employee_id);
CREATE INDEX idx_employee_background_checks_employee ON public.employee_background_checks(employee_id);
CREATE INDEX idx_employee_references_employee ON public.employee_references(employee_id);

-- Triggers for updated_at
CREATE TRIGGER update_employee_dependents_updated_at BEFORE UPDATE ON public.employee_dependents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_work_permits_updated_at BEFORE UPDATE ON public.employee_work_permits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_licenses_updated_at BEFORE UPDATE ON public.employee_licenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_background_checks_updated_at BEFORE UPDATE ON public.employee_background_checks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_references_updated_at BEFORE UPDATE ON public.employee_references FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
