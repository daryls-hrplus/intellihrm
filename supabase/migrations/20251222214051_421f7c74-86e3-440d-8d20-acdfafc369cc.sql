-- Add new columns for industry-standard background checks
ALTER TABLE employee_background_checks 
ADD COLUMN IF NOT EXISTS scope text,
ADD COLUMN IF NOT EXISTS consent_date date,
ADD COLUMN IF NOT EXISTS attachment_url text,
ADD COLUMN IF NOT EXISTS attachment_name text;

-- Add comment for documentation
COMMENT ON COLUMN employee_background_checks.scope IS 'Scope level: local, regional, national, international';
COMMENT ON COLUMN employee_background_checks.consent_date IS 'Date employee provided consent for the check';
COMMENT ON COLUMN employee_background_checks.attachment_url IS 'URL to uploaded document in storage';
COMMENT ON COLUMN employee_background_checks.attachment_name IS 'Original filename of uploaded document';

-- Create storage bucket for background check documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('compliance-documents', 'compliance-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for compliance documents bucket (HR only access)
CREATE POLICY "HR can upload compliance documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'compliance-documents' 
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('System Administrator', 'HR Administrator', 'HR Manager', 'HR Officer')
  )
);

CREATE POLICY "HR can view compliance documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'compliance-documents'
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('System Administrator', 'HR Administrator', 'HR Manager', 'HR Officer')
  )
);

CREATE POLICY "HR can update compliance documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'compliance-documents'
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('System Administrator', 'HR Administrator', 'HR Manager', 'HR Officer')
  )
);

CREATE POLICY "HR can delete compliance documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'compliance-documents'
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('System Administrator', 'HR Administrator', 'HR Manager', 'HR Officer')
  )
);