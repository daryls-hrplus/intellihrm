-- Immigration Document Types (work permits, CSME, travel docs, etc.)
CREATE TABLE public.immigration_document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  category TEXT NOT NULL CHECK (category IN ('work_permit', 'csme', 'travel_document', 'visa', 'other')),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  requires_expiry BOOLEAN DEFAULT true,
  requires_fee BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Immigration Categories (worker class, visa category)
CREATE TABLE public.immigration_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  country_code TEXT,
  permit_duration_months INTEGER,
  is_renewable BOOLEAN DEFAULT true,
  max_renewals INTEGER,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Immigration Permit Statuses
CREATE TABLE public.immigration_permit_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_terminal BOOLEAN DEFAULT false,
  status_color TEXT DEFAULT 'gray',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- CSME Skill Categories (Caribbean-specific)
CREATE TABLE public.csme_skill_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  eligible_countries TEXT[],
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Immigration Dependent Types
CREATE TABLE public.immigration_dependent_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Travel Document Types
CREATE TABLE public.travel_document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_identity_doc BOOLEAN DEFAULT false,
  requires_expiry BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Enable RLS on all tables
ALTER TABLE public.immigration_document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immigration_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immigration_permit_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csme_skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immigration_dependent_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_document_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for immigration_document_types
CREATE POLICY "Users can view immigration document types" ON public.immigration_document_types
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage immigration document types" ON public.immigration_document_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

-- RLS Policies for immigration_categories
CREATE POLICY "Users can view immigration categories" ON public.immigration_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage immigration categories" ON public.immigration_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

-- RLS Policies for immigration_permit_statuses
CREATE POLICY "Users can view immigration permit statuses" ON public.immigration_permit_statuses
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage immigration permit statuses" ON public.immigration_permit_statuses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

-- RLS Policies for csme_skill_categories
CREATE POLICY "Users can view CSME skill categories" ON public.csme_skill_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage CSME skill categories" ON public.csme_skill_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

-- RLS Policies for immigration_dependent_types
CREATE POLICY "Users can view immigration dependent types" ON public.immigration_dependent_types
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage immigration dependent types" ON public.immigration_dependent_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

-- RLS Policies for travel_document_types
CREATE POLICY "Users can view travel document types" ON public.travel_document_types
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage travel document types" ON public.travel_document_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

-- Create updated_at triggers
CREATE TRIGGER update_immigration_document_types_updated_at
  BEFORE UPDATE ON public.immigration_document_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_immigration_categories_updated_at
  BEFORE UPDATE ON public.immigration_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_immigration_permit_statuses_updated_at
  BEFORE UPDATE ON public.immigration_permit_statuses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_csme_skill_categories_updated_at
  BEFORE UPDATE ON public.csme_skill_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_immigration_dependent_types_updated_at
  BEFORE UPDATE ON public.immigration_dependent_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_travel_document_types_updated_at
  BEFORE UPDATE ON public.travel_document_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default immigration document types
INSERT INTO public.immigration_document_types (company_id, category, code, name, description, requires_expiry, requires_fee, display_order) VALUES
  (NULL, 'work_permit', 'WORK_PERMIT', 'Work Permit', 'Standard work authorization permit', true, true, 1),
  (NULL, 'work_permit', 'EMPLOYMENT_VISA', 'Employment Visa', 'Work-authorized visa', true, true, 2),
  (NULL, 'csme', 'CSME_SKILL_CERT', 'CSME Skills Certificate', 'CARICOM Skills Certificate', true, true, 3),
  (NULL, 'travel_document', 'PASSPORT', 'Passport', 'International travel passport', true, false, 4),
  (NULL, 'travel_document', 'NATIONAL_ID', 'National ID Card', 'Government-issued identity card', true, false, 5),
  (NULL, 'visa', 'TOURIST_VISA', 'Tourist Visa', 'Tourist/visitor visa', true, true, 6),
  (NULL, 'visa', 'TRANSIT_VISA', 'Transit Visa', 'Transit visa for layovers', true, true, 7);

-- Insert default immigration categories
INSERT INTO public.immigration_categories (company_id, code, name, description, permit_duration_months, is_renewable, max_renewals, display_order) VALUES
  (NULL, 'SKILLED_WORKER', 'Skilled Worker', 'Skilled professional category', 12, true, 5, 1),
  (NULL, 'UNSKILLED_WORKER', 'Unskilled Worker', 'General labor category', 12, true, 3, 2),
  (NULL, 'INTRA_TRANSFER', 'Intra-Company Transfer', 'Internal company transfer', 24, true, 2, 3),
  (NULL, 'INVESTOR', 'Investor Category', 'Business investment category', 36, true, NULL, 4),
  (NULL, 'SPOUSE_DEPENDENT', 'Spouse/Dependent', 'Dependent of permit holder', 12, true, NULL, 5);

-- Insert default permit statuses
INSERT INTO public.immigration_permit_statuses (company_id, code, name, description, is_terminal, status_color, display_order) VALUES
  (NULL, 'PENDING', 'Pending', 'Application submitted, awaiting decision', false, 'yellow', 1),
  (NULL, 'APPROVED', 'Approved', 'Application approved', false, 'green', 2),
  (NULL, 'ACTIVE', 'Active', 'Permit currently valid and in use', false, 'green', 3),
  (NULL, 'EXPIRING_SOON', 'Expiring Soon', 'Permit expiring within 90 days', false, 'orange', 4),
  (NULL, 'EXPIRED', 'Expired', 'Permit has expired', true, 'red', 5),
  (NULL, 'CANCELLED', 'Cancelled', 'Permit cancelled', true, 'gray', 6),
  (NULL, 'REVOKED', 'Revoked', 'Permit revoked by authorities', true, 'red', 7),
  (NULL, 'RENEWAL_PENDING', 'Renewal Pending', 'Renewal application in progress', false, 'blue', 8);

-- Insert default CSME skill categories
INSERT INTO public.csme_skill_categories (company_id, code, name, description, eligible_countries, display_order) VALUES
  (NULL, 'UNIVERSITY_GRADUATE', 'University Graduates', 'Holders of university degrees', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 1),
  (NULL, 'MEDIA_WORKER', 'Media Workers', 'Journalists, broadcasters, media professionals', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 2),
  (NULL, 'ARTIST', 'Artists', 'Musicians, visual artists, performers', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 3),
  (NULL, 'SPORTSPERSON', 'Sportspersons', 'Professional athletes and coaches', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 4),
  (NULL, 'MUSICIAN', 'Musicians', 'Professional musicians', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 5),
  (NULL, 'NURSE', 'Nurses', 'Registered and licensed nurses', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 6),
  (NULL, 'TEACHER', 'Teachers', 'Qualified teachers with certifications', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 7),
  (NULL, 'ARTISAN', 'Artisans', 'Skilled craftspersons with vocational qualifications', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 8),
  (NULL, 'DOMESTIC_WORKER', 'Household Domestic Workers', 'Domestic service workers', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 9),
  (NULL, 'SECURITY_WORKER', 'Private Security Workers', 'Licensed security personnel', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 10),
  (NULL, 'AGRICULTURAL_WORKER', 'Agricultural Workers', 'Farm and agricultural workers', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 11),
  (NULL, 'HOSPITALITY_WORKER', 'Hospitality Workers', 'Hotel and tourism workers', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 12),
  (NULL, 'BEAUTY_SERVICE', 'Beauty Service Workers', 'Beauticians and hairdressers', ARRAY['BB', 'JM', 'TT', 'GY', 'SR', 'BZ', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'HT'], 13);

-- Insert default immigration dependent types
INSERT INTO public.immigration_dependent_types (company_id, code, name, description, display_order) VALUES
  (NULL, 'SPOUSE', 'Spouse', 'Legal spouse of permit holder', 1),
  (NULL, 'CHILD', 'Child', 'Dependent child under age limit', 2),
  (NULL, 'PARENT', 'Parent', 'Dependent parent', 3),
  (NULL, 'DOMESTIC_PARTNER', 'Domestic Partner', 'Registered domestic partner', 4);

-- Insert default travel document types
INSERT INTO public.travel_document_types (company_id, code, name, description, is_identity_doc, requires_expiry, display_order) VALUES
  (NULL, 'PASSPORT', 'Passport', 'International travel passport', true, true, 1),
  (NULL, 'NATIONAL_ID', 'National ID Card', 'Government-issued national ID', true, true, 2),
  (NULL, 'DRIVERS_LICENSE', 'Drivers License', 'Valid driving license', true, true, 3),
  (NULL, 'REFUGEE_TRAVEL_DOC', 'Refugee Travel Document', 'UN refugee travel document', true, true, 4),
  (NULL, 'STATELESS_TRAVEL_DOC', 'Stateless Travel Document', 'Document for stateless persons', true, true, 5),
  (NULL, 'EMERGENCY_PASSPORT', 'Emergency Passport', 'Temporary emergency travel document', true, true, 6);