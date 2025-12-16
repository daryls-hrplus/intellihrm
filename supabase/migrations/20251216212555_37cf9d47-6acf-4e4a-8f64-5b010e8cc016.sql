
-- ==========================================
-- ENHANCE EMPLOYEE DOCUMENTS FOR CENTRAL REPOSITORY
-- ==========================================

-- Add new columns to employee_documents for central document repository
ALTER TABLE public.employee_documents 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS issue_date DATE,
ADD COLUMN IF NOT EXISTS issuing_authority TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS source_module TEXT DEFAULT 'Documents',
ADD COLUMN IF NOT EXISTS source_record_id UUID,
ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS is_reference BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Add document_url column to employee_qualifications for document upload support
ALTER TABLE public.employee_qualifications
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS document_name TEXT,
ADD COLUMN IF NOT EXISTS document_size INTEGER,
ADD COLUMN IF NOT EXISTS document_mime_type TEXT;

-- Add document_url column to employee_work_permits for document upload support
ALTER TABLE public.employee_work_permits
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS document_name TEXT,
ADD COLUMN IF NOT EXISTS document_size INTEGER,
ADD COLUMN IF NOT EXISTS document_mime_type TEXT;

-- Create a separate document_categories table for structured categories
CREATE TABLE IF NOT EXISTS public.document_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create document_types table with category reference
CREATE TABLE IF NOT EXISTS public.document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_code TEXT NOT NULL REFERENCES public.document_categories(code),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  managed_by_module TEXT, -- If not null, indicates which module manages this document type
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_categories (readable by all authenticated users)
CREATE POLICY "document_categories_select" ON public.document_categories
FOR SELECT TO authenticated USING (true);

-- RLS policies for document_types (readable by all authenticated users)
CREATE POLICY "document_types_select" ON public.document_types
FOR SELECT TO authenticated USING (true);

-- Insert document categories
INSERT INTO public.document_categories (code, name, description, display_order) VALUES
('civil_identity', 'Civil & Identity', 'Birth certificates, marriage certificates, passports, national IDs', 1),
('background_compliance', 'Background & Compliance', 'Certificates of character, medical fitness, references, drug tests', 2),
('qualifications_licenses', 'Qualifications & Licenses', 'Degrees, diplomas, certificates, professional licenses', 3),
('work_authorization', 'Work Authorization', 'Work permits, residence permits, visas, immigration documentation', 4),
('employment_lifecycle', 'Employment Lifecycle', 'Contracts, offer letters, disciplinary letters, appraisals', 5)
ON CONFLICT (code) DO NOTHING;

-- Insert document types with category mapping
INSERT INTO public.document_types (category_code, code, name, description, managed_by_module, display_order) VALUES
-- Civil & Identity Documents
('civil_identity', 'birth_certificate', 'Birth Certificate', 'Official birth certificate', NULL, 1),
('civil_identity', 'marriage_certificate', 'Marriage Certificate', 'Marriage certificate or divorce decree', NULL, 2),
('civil_identity', 'divorce_decree', 'Divorce Decree', 'Divorce decree document', NULL, 3),
('civil_identity', 'national_id', 'National ID', 'Government issued national ID card', NULL, 4),
('civil_identity', 'passport', 'Passport', 'Valid passport document', NULL, 5),
('civil_identity', 'dependent_proof', 'Dependent Proof', 'Proof documents for dependents', NULL, 6),
('civil_identity', 'name_change', 'Name Change / Legal Declaration', 'Legal name change documentation', NULL, 7),

-- Background & Compliance Documents
('background_compliance', 'certificate_of_character', 'Certificate of Character / Police Report', 'Police clearance or character certificate', NULL, 10),
('background_compliance', 'medical_fitness', 'Medical Fitness Certificate', 'Medical fitness or health certificate', NULL, 11),
('background_compliance', 'employment_reference', 'Employment Reference', 'Reference letter from previous employer', NULL, 12),
('background_compliance', 'personal_reference', 'Personal Reference', 'Personal character reference', NULL, 13),
('background_compliance', 'drug_test', 'Drug/Health Test', 'Drug screening or health test results', NULL, 14),
('background_compliance', 'background_check', 'Background Check Report', 'Background verification report', NULL, 15),

-- Qualifications & Licenses Documents
('qualifications_licenses', 'degree', 'Degree', 'University or college degree', 'Qualifications', 20),
('qualifications_licenses', 'diploma', 'Diploma', 'Diploma certificate', 'Qualifications', 21),
('qualifications_licenses', 'certificate', 'Certificate', 'Professional or training certificate', 'Qualifications', 22),
('qualifications_licenses', 'professional_license', 'Professional License', 'Professional license or certification', 'Qualifications', 23),
('qualifications_licenses', 'training_certificate', 'Training Certificate', 'Training completion certificate', 'Qualifications', 24),
('qualifications_licenses', 'transcript', 'Academic Transcript', 'Academic transcript or records', 'Qualifications', 25),

-- Work Authorization Documents
('work_authorization', 'work_permit', 'Work Permit', 'Work permit document', 'Work Authorization', 30),
('work_authorization', 'residence_permit', 'Residence Permit', 'Residence permit or card', 'Work Authorization', 31),
('work_authorization', 'visa', 'Visa', 'Visa document', 'Work Authorization', 32),
('work_authorization', 'immigration_doc', 'Immigration Documentation', 'Other immigration documentation', 'Work Authorization', 33),

-- Employment Lifecycle Documents
('employment_lifecycle', 'employment_contract', 'Employment Contract', 'Employment agreement or contract', NULL, 40),
('employment_lifecycle', 'offer_letter', 'Offer Letter', 'Job offer letter', NULL, 41),
('employment_lifecycle', 'disciplinary_letter', 'Disciplinary Letter', 'Disciplinary action letter', NULL, 42),
('employment_lifecycle', 'appraisal_review', 'Appraisal / 360 Review', 'Performance appraisal document', NULL, 43),
('employment_lifecycle', 'development_plan', 'Development Plan', 'Individual development plan', NULL, 44),
('employment_lifecycle', 'succession_record', 'Succession Record', 'Succession planning record', NULL, 45),
('employment_lifecycle', 'termination_letter', 'Termination Letter', 'Termination or separation letter', NULL, 46),
('employment_lifecycle', 'resignation_letter', 'Resignation Letter', 'Employee resignation letter', NULL, 47)
ON CONFLICT (code) DO NOTHING;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_employee_documents_category ON public.employee_documents(category);
CREATE INDEX IF NOT EXISTS idx_employee_documents_source_module ON public.employee_documents(source_module);
CREATE INDEX IF NOT EXISTS idx_employee_documents_status ON public.employee_documents(status);
CREATE INDEX IF NOT EXISTS idx_employee_documents_expiry_date ON public.employee_documents(expiry_date);

-- Create a function to sync qualification documents to employee_documents
CREATE OR REPLACE FUNCTION sync_qualification_document()
RETURNS TRIGGER AS $$
BEGIN
  -- When a qualification document is added/updated
  IF NEW.document_url IS NOT NULL AND (OLD IS NULL OR OLD.document_url IS DISTINCT FROM NEW.document_url) THEN
    -- Check if reference already exists
    IF EXISTS (SELECT 1 FROM public.employee_documents WHERE source_module = 'Qualifications' AND source_record_id = NEW.id) THEN
      -- Update existing reference
      UPDATE public.employee_documents
      SET 
        document_name = COALESCE(NEW.document_name, NEW.name),
        file_url = NEW.document_url,
        file_size = NEW.document_size,
        mime_type = NEW.document_mime_type,
        expiry_date = NEW.expiry_date,
        issue_date = COALESCE(NEW.issued_date, NEW.date_awarded),
        updated_at = now()
      WHERE source_module = 'Qualifications' AND source_record_id = NEW.id;
    ELSE
      -- Insert new reference
      INSERT INTO public.employee_documents (
        employee_id, company_id, document_type, document_name, file_url, file_size, mime_type,
        category, issue_date, expiry_date, issuing_authority, status, source_module, source_record_id, is_reference
      ) VALUES (
        NEW.employee_id, NEW.company_id,
        CASE WHEN NEW.record_type = 'academic' THEN 'degree' ELSE 'professional_license' END,
        COALESCE(NEW.document_name, NEW.name),
        NEW.document_url,
        NEW.document_size,
        NEW.document_mime_type,
        'qualifications_licenses',
        COALESCE(NEW.issued_date, NEW.date_awarded),
        NEW.expiry_date,
        COALESCE(NEW.accrediting_body, NEW.institution_name),
        CASE WHEN NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURRENT_DATE THEN 'expired' ELSE 'active' END,
        'Qualifications',
        NEW.id,
        true
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for qualification document sync
DROP TRIGGER IF EXISTS sync_qualification_document_trigger ON public.employee_qualifications;
CREATE TRIGGER sync_qualification_document_trigger
AFTER INSERT OR UPDATE ON public.employee_qualifications
FOR EACH ROW EXECUTE FUNCTION sync_qualification_document();

-- Create a function to sync work permit documents to employee_documents
CREATE OR REPLACE FUNCTION sync_work_permit_document()
RETURNS TRIGGER AS $$
BEGIN
  -- When a work permit document is added/updated
  IF NEW.document_url IS NOT NULL AND (OLD IS NULL OR OLD.document_url IS DISTINCT FROM NEW.document_url) THEN
    -- Check if reference already exists
    IF EXISTS (SELECT 1 FROM public.employee_documents WHERE source_module = 'Work Authorization' AND source_record_id = NEW.id) THEN
      -- Update existing reference
      UPDATE public.employee_documents
      SET 
        document_name = COALESCE(NEW.document_name, NEW.permit_type || ' - ' || NEW.permit_number),
        file_url = NEW.document_url,
        file_size = NEW.document_size,
        mime_type = NEW.document_mime_type,
        issue_date = NEW.issue_date,
        expiry_date = NEW.expiry_date,
        issuing_authority = NEW.issuing_country,
        updated_at = now()
      WHERE source_module = 'Work Authorization' AND source_record_id = NEW.id;
    ELSE
      -- Insert new reference
      INSERT INTO public.employee_documents (
        employee_id, document_type, document_name, file_url, file_size, mime_type,
        category, issue_date, expiry_date, issuing_authority, status, source_module, source_record_id, is_reference
      ) VALUES (
        NEW.employee_id,
        'work_permit',
        COALESCE(NEW.document_name, NEW.permit_type || ' - ' || NEW.permit_number),
        NEW.document_url,
        NEW.document_size,
        NEW.document_mime_type,
        'work_authorization',
        NEW.issue_date,
        NEW.expiry_date,
        NEW.issuing_country,
        CASE WHEN NEW.expiry_date < CURRENT_DATE THEN 'expired' ELSE 'active' END,
        'Work Authorization',
        NEW.id,
        true
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for work permit document sync
DROP TRIGGER IF EXISTS sync_work_permit_document_trigger ON public.employee_work_permits;
CREATE TRIGGER sync_work_permit_document_trigger
AFTER INSERT OR UPDATE ON public.employee_work_permits
FOR EACH ROW EXECUTE FUNCTION sync_work_permit_document();
