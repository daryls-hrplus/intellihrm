
-- Employee Certificates table (with file upload support)
CREATE TABLE public.employee_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  certificate_name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  certificate_number TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  file_url TEXT,
  file_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Memberships table
CREATE TABLE public.employee_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  membership_type TEXT NOT NULL,
  membership_number TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Interests table
CREATE TABLE public.employee_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest_name TEXT NOT NULL,
  category TEXT,
  proficiency_level TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Medical Profile table
CREATE TABLE public.employee_medical_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blood_type TEXT,
  allergies TEXT,
  chronic_conditions TEXT,
  medications TEXT,
  disabilities TEXT,
  emergency_medical_info TEXT,
  doctor_name TEXT,
  doctor_phone TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Contacts table
CREATE TABLE public.employee_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL,
  contact_value TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Emergency Contacts table
CREATE TABLE public.employee_emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT,
  address TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Pay Groups table
CREATE TABLE public.employee_pay_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pay_group_name TEXT NOT NULL,
  pay_frequency TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.employee_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_medical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_pay_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_certificates
CREATE POLICY "Users can view own certificates" ON public.employee_certificates FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all certificates" ON public.employee_certificates FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own certificates" ON public.employee_certificates FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all certificates" ON public.employee_certificates FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_memberships
CREATE POLICY "Users can view own memberships" ON public.employee_memberships FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all memberships" ON public.employee_memberships FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own memberships" ON public.employee_memberships FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all memberships" ON public.employee_memberships FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_interests
CREATE POLICY "Users can view own interests" ON public.employee_interests FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all interests" ON public.employee_interests FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own interests" ON public.employee_interests FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all interests" ON public.employee_interests FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_medical_profiles
CREATE POLICY "Users can view own medical profile" ON public.employee_medical_profiles FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all medical profiles" ON public.employee_medical_profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own medical profile" ON public.employee_medical_profiles FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all medical profiles" ON public.employee_medical_profiles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_contacts
CREATE POLICY "Users can view own contacts" ON public.employee_contacts FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all contacts" ON public.employee_contacts FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own contacts" ON public.employee_contacts FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all contacts" ON public.employee_contacts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_emergency_contacts
CREATE POLICY "Users can view own emergency contacts" ON public.employee_emergency_contacts FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all emergency contacts" ON public.employee_emergency_contacts FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own emergency contacts" ON public.employee_emergency_contacts FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all emergency contacts" ON public.employee_emergency_contacts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_pay_groups
CREATE POLICY "Users can view own pay group" ON public.employee_pay_groups FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all pay groups" ON public.employee_pay_groups FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Admins can manage all pay groups" ON public.employee_pay_groups FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
