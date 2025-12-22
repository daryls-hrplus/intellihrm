-- Add jurisdiction and category columns to employee_background_checks table
ALTER TABLE employee_background_checks 
ADD COLUMN IF NOT EXISTS jurisdiction text;

ALTER TABLE employee_background_checks 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'background_check';

-- Add comment for documentation
COMMENT ON COLUMN employee_background_checks.jurisdiction IS 'The jurisdiction (country/state/region) where the check applies';
COMMENT ON COLUMN employee_background_checks.category IS 'Category of record: background_check, certificate_of_character, regulatory_clearance';