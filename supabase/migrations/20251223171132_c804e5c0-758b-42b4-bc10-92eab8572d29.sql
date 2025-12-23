-- Add enterprise fields to employee_travel_documents table

-- Document Classification
ALTER TABLE public.employee_travel_documents 
ADD COLUMN IF NOT EXISTS document_subtype text,
ADD COLUMN IF NOT EXISTS is_biometric boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_machine_readable boolean DEFAULT false;

-- MRZ (Machine Readable Zone) Data
ALTER TABLE public.employee_travel_documents 
ADD COLUMN IF NOT EXISTS mrz_line_1 text,
ADD COLUMN IF NOT EXISTS mrz_line_2 text,
ADD COLUMN IF NOT EXISTS mrz_surname text,
ADD COLUMN IF NOT EXISTS mrz_given_names text,
ADD COLUMN IF NOT EXISTS mrz_check_digit_valid boolean;

-- Alert Configuration
ALTER TABLE public.employee_travel_documents 
ADD COLUMN IF NOT EXISTS expiry_alert_days integer DEFAULT 90;

-- Verification/Audit Trail
ALTER TABLE public.employee_travel_documents 
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS verification_method text,
ADD COLUMN IF NOT EXISTS verification_notes text,
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';

-- Additional Enterprise Fields
ALTER TABLE public.employee_travel_documents 
ADD COLUMN IF NOT EXISTS issuing_authority text,
ADD COLUMN IF NOT EXISTS visa_pages_remaining integer,
ADD COLUMN IF NOT EXISTS previous_document_number text,
ADD COLUMN IF NOT EXISTS date_of_birth_on_doc date,
ADD COLUMN IF NOT EXISTS gender_on_doc text,
ADD COLUMN IF NOT EXISTS machine_readable_name text;

-- Add comments for documentation
COMMENT ON COLUMN public.employee_travel_documents.document_subtype IS 'Sub-type: regular, diplomatic, official, service, emergency, refugee';
COMMENT ON COLUMN public.employee_travel_documents.is_biometric IS 'ePassport with biometric chip';
COMMENT ON COLUMN public.employee_travel_documents.mrz_line_1 IS 'Machine Readable Zone line 1';
COMMENT ON COLUMN public.employee_travel_documents.mrz_line_2 IS 'Machine Readable Zone line 2';
COMMENT ON COLUMN public.employee_travel_documents.expiry_alert_days IS 'Days before expiry to trigger alert';
COMMENT ON COLUMN public.employee_travel_documents.verification_status IS 'pending, verified, rejected, expired';