-- Create CSME Certificate Types lookup table
CREATE TABLE IF NOT EXISTS public.csme_certificate_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  requires_expiry BOOLEAN DEFAULT true,
  eligible_countries TEXT[],
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create CSME Issuing Authorities lookup table
CREATE TABLE IF NOT EXISTS public.csme_issuing_authorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  name TEXT NOT NULL,
  authority_type TEXT CHECK (authority_type IN ('ministry', 'department', 'unit', 'other')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add new columns to employee_csme_certificates
ALTER TABLE public.employee_csme_certificates
  ADD COLUMN IF NOT EXISTS certificate_type_id UUID REFERENCES public.csme_certificate_types(id),
  ADD COLUMN IF NOT EXISTS issuing_authority_id UUID REFERENCES public.csme_issuing_authorities(id),
  ADD COLUMN IF NOT EXISTS issuing_authority_name TEXT,
  ADD COLUMN IF NOT EXISTS verified_by_user_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS verified_by_name TEXT,
  ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('manual', 'api', 'government_portal', 'in_person'));

-- Enable RLS on new tables
ALTER TABLE public.csme_certificate_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csme_issuing_authorities ENABLE ROW LEVEL SECURITY;

-- Create read policies for lookup tables (accessible to authenticated users)
CREATE POLICY "Authenticated users can view CSME certificate types"
  ON public.csme_certificate_types
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view CSME issuing authorities"
  ON public.csme_issuing_authorities
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert CARICOM standard certificate types
INSERT INTO public.csme_certificate_types (code, name, description, requires_expiry, display_order) VALUES
  ('SKILLED_NATIONAL', 'Skilled National Certificate', 'For skilled nationals in approved categories', true, 1),
  ('GRADUATE', 'University Graduate', 'For university graduates seeking free movement', false, 2),
  ('MEDIA_WORKER', 'Media Worker', 'For journalists, broadcasters, and media professionals', true, 3),
  ('SPORTSPERSON', 'Sportsperson', 'For professional athletes and sports personnel', true, 4),
  ('ARTISTE', 'Artiste', 'For performing artists and entertainers', true, 5),
  ('MUSICIAN', 'Musician', 'For professional musicians', true, 6),
  ('NURSE', 'Nurse', 'For registered nurses (member state specific)', true, 7),
  ('TEACHER', 'Teacher', 'For qualified teachers (member state specific)', true, 8),
  ('HOUSEHOLD_DOMESTIC', 'Household/Domestic Worker', 'For domestic and household workers', true, 9),
  ('SECURITY_GUARD', 'Security Guard', 'For private security personnel', true, 10),
  ('AGRICULTURAL_WORKER', 'Agricultural Worker', 'For farm and agricultural workers', true, 11),
  ('HOSPITALITY_WORKER', 'Hospitality Worker', 'For hotel and tourism industry workers', true, 12)
ON CONFLICT (code) DO NOTHING;

-- Insert known issuing authorities by country
INSERT INTO public.csme_issuing_authorities (country_code, country_name, name, authority_type) VALUES
  ('TT', 'Trinidad and Tobago', 'Ministry of Labour', 'ministry'),
  ('TT', 'Trinidad and Tobago', 'National CSME Unit', 'unit'),
  ('TT', 'Trinidad and Tobago', 'Immigration Division', 'department'),
  ('JM', 'Jamaica', 'Ministry of Labour and Social Security', 'ministry'),
  ('JM', 'Jamaica', 'Passport, Immigration and Citizenship Agency', 'department'),
  ('BB', 'Barbados', 'Ministry of Labour', 'ministry'),
  ('BB', 'Barbados', 'Immigration Department', 'department'),
  ('GY', 'Guyana', 'Ministry of Labour', 'ministry'),
  ('GY', 'Guyana', 'Ministry of Home Affairs', 'ministry'),
  ('SR', 'Suriname', 'Ministry of Labour', 'ministry'),
  ('BS', 'Bahamas', 'Ministry of Labour', 'ministry'),
  ('BZ', 'Belize', 'Ministry of Labour', 'ministry'),
  ('AG', 'Antigua and Barbuda', 'Ministry of Labour', 'ministry'),
  ('DM', 'Dominica', 'Ministry of Labour', 'ministry'),
  ('GD', 'Grenada', 'Ministry of Labour', 'ministry'),
  ('HT', 'Haiti', 'Ministry of Social Affairs and Labour', 'ministry'),
  ('MS', 'Montserrat', 'Government of Montserrat Labour Department', 'department'),
  ('KN', 'Saint Kitts and Nevis', 'Ministry of Labour', 'ministry'),
  ('LC', 'Saint Lucia', 'Department of Labour', 'department'),
  ('VC', 'Saint Vincent and the Grenadines', 'Ministry of Labour', 'ministry')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_csme_cert_types_active ON public.csme_certificate_types(is_active);
CREATE INDEX IF NOT EXISTS idx_csme_issuing_auth_country ON public.csme_issuing_authorities(country_code);
CREATE INDEX IF NOT EXISTS idx_csme_issuing_auth_active ON public.csme_issuing_authorities(is_active);
CREATE INDEX IF NOT EXISTS idx_emp_csme_cert_type ON public.employee_csme_certificates(certificate_type_id);
CREATE INDEX IF NOT EXISTS idx_emp_csme_issuing_auth ON public.employee_csme_certificates(issuing_authority_id);

-- Add updated_at trigger for new tables
CREATE TRIGGER update_csme_certificate_types_updated_at
  BEFORE UPDATE ON public.csme_certificate_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_csme_issuing_authorities_updated_at
  BEFORE UPDATE ON public.csme_issuing_authorities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();