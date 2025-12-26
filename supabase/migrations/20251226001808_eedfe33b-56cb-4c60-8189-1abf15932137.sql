
-- Create government identification types table (maintained by HR Admin)
CREATE TABLE public.government_id_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code VARCHAR(2) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_employee_type BOOLEAN NOT NULL DEFAULT true,
  is_employer_type BOOLEAN NOT NULL DEFAULT false,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  validation_pattern VARCHAR(255),
  validation_message VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(country_code, code)
);

-- Create employee government identifiers table
CREATE TABLE public.employee_government_ids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  government_id_type_id UUID NOT NULL REFERENCES public.government_id_types(id) ON DELETE RESTRICT,
  id_number VARCHAR(100) NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  issuing_authority VARCHAR(255),
  notes TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(employee_id, government_id_type_id)
);

-- Add nationality field to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality VARCHAR(2);

-- Enable RLS
ALTER TABLE public.government_id_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_government_ids ENABLE ROW LEVEL SECURITY;

-- RLS policies for government_id_types (read by all authenticated, write by admin/hr)
CREATE POLICY "Authenticated users can view government ID types"
  ON public.government_id_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and HR can manage government ID types"
  ON public.government_id_types FOR ALL
  TO authenticated
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'hr_admin'])
  )
  WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'hr_admin'])
  );

-- RLS policies for employee_government_ids
CREATE POLICY "Users can view their own government IDs"
  ON public.employee_government_ids FOR SELECT
  TO authenticated
  USING (
    employee_id = auth.uid() OR
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'hr_admin'])
  );

CREATE POLICY "Admins and HR can manage employee government IDs"
  ON public.employee_government_ids FOR ALL
  TO authenticated
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'hr_admin'])
  )
  WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'hr_admin'])
  );

-- Create updated_at triggers
CREATE TRIGGER update_government_id_types_updated_at
  BEFORE UPDATE ON public.government_id_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_government_ids_updated_at
  BEFORE UPDATE ON public.employee_government_ids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for Trinidad and Tobago
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_employer_type, is_mandatory, display_order) VALUES
  ('TT', 'NIS_EE', 'NIS Number (Employee)', 'National Insurance Number for employees', true, false, true, 1),
  ('TT', 'BIR_EE', 'BIR Number (Employee)', 'Board of Inland Revenue Number for employees', true, false, true, 2),
  ('TT', 'NIS_ER', 'NIS Number (Employer)', 'National Insurance Number for employers', false, true, true, 3),
  ('TT', 'BIR_ER', 'BIR Number (Employer)', 'Board of Inland Revenue Number for employers', false, true, true, 4);

-- Insert sample data for Jamaica
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_employer_type, is_mandatory, display_order) VALUES
  ('JM', 'TRN', 'TRN (Employee)', 'Taxpayer Registration Number for employees', true, false, true, 1),
  ('JM', 'NIS_EE', 'NIS Number (Employee)', 'National Insurance Scheme Number for employees', true, false, true, 2),
  ('JM', 'TRN_ER', 'TRN (Employer)', 'Taxpayer Registration Number for employers', false, true, true, 3),
  ('JM', 'NIS_ER', 'NIS Number (Employer)', 'National Insurance Scheme Number for employers', false, true, true, 4);

-- Insert sample data for Barbados
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_employer_type, is_mandatory, display_order) VALUES
  ('BB', 'NIS_EE', 'NIS Number (Employee)', 'National Insurance Scheme Number for employees', true, false, true, 1),
  ('BB', 'TIN_EE', 'TIN (Employee)', 'Tax Identification Number for employees', true, false, true, 2),
  ('BB', 'NIS_ER', 'NIS Number (Employer)', 'National Insurance Scheme Number for employers', false, true, true, 3),
  ('BB', 'TIN_ER', 'TIN (Employer)', 'Tax Identification Number for employers', false, true, true, 4);

-- Create indexes for performance
CREATE INDEX idx_government_id_types_country ON public.government_id_types(country_code);
CREATE INDEX idx_government_id_types_active ON public.government_id_types(is_active);
CREATE INDEX idx_employee_government_ids_employee ON public.employee_government_ids(employee_id);
CREATE INDEX idx_employee_government_ids_type ON public.employee_government_ids(government_id_type_id);
