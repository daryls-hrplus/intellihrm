-- Add enterprise-grade columns to employee_references for industry-standard compliance

-- Reference type classification
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS reference_type TEXT DEFAULT 'employment';
COMMENT ON COLUMN employee_references.reference_type IS 'Type: employment, character, academic, professional';

-- Enhanced contact information
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS phone_extension TEXT;
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'phone';
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS best_time_to_contact TEXT;

-- Consent & Compliance (GDPR/Privacy)
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS consent_obtained BOOLEAN DEFAULT false;
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS consent_date DATE;
COMMENT ON COLUMN employee_references.consent_obtained IS 'Required for GDPR/privacy compliance before contacting';

-- Verification workflow
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS verification_method TEXT;
COMMENT ON COLUMN employee_references.verification_method IS 'Method: phone_call, email, written, third_party, video_call';
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id);
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS verified_date DATE;

-- Verification results & ratings
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS questions_responses JSONB DEFAULT '{}';
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5);
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS would_rehire TEXT;
COMMENT ON COLUMN employee_references.would_rehire IS 'Would rehire: yes, no, with_reservations, not_applicable';
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS employment_dates_confirmed BOOLEAN;
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS title_confirmed BOOLEAN;
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS strengths TEXT;
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS areas_for_improvement TEXT;

-- Document attachment
ALTER TABLE employee_references ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_employee_references_status ON employee_references(status);
CREATE INDEX IF NOT EXISTS idx_employee_references_consent ON employee_references(consent_obtained);