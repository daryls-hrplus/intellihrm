-- Add text columns to employee_qualifications for storing lookup values
ALTER TABLE public.employee_qualifications 
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS qualification_type TEXT,
ADD COLUMN IF NOT EXISTS field_of_study TEXT,
ADD COLUMN IF NOT EXISTS certification_type TEXT,
ADD COLUMN IF NOT EXISTS accrediting_body TEXT;

-- Add comment explaining the columns
COMMENT ON COLUMN public.employee_qualifications.education_level IS 'Education level from lookup_values';
COMMENT ON COLUMN public.employee_qualifications.qualification_type IS 'Qualification type from lookup_values';
COMMENT ON COLUMN public.employee_qualifications.field_of_study IS 'Field of study from lookup_values';
COMMENT ON COLUMN public.employee_qualifications.certification_type IS 'Certification type from lookup_values';
COMMENT ON COLUMN public.employee_qualifications.accrediting_body IS 'Accrediting body from lookup_values';