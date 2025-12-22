-- Add renewal_required, file_url, and file_name columns to employee_memberships
ALTER TABLE employee_memberships 
ADD COLUMN IF NOT EXISTS renewal_required text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS file_name text;

COMMENT ON COLUMN employee_memberships.renewal_required IS 'Renewal type: auto, manual, none';
COMMENT ON COLUMN employee_memberships.file_url IS 'Storage path for membership certificate/document';
COMMENT ON COLUMN employee_memberships.file_name IS 'Original filename of uploaded document';