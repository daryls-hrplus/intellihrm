-- Make department_id nullable to allow company-level job families (industry standard)
ALTER TABLE public.job_families 
ALTER COLUMN department_id DROP NOT NULL;

-- Add comment explaining the design decision
COMMENT ON COLUMN public.job_families.department_id IS 'Optional department association. Job Families are typically company-level classifications, not department-specific.';
COMMENT ON COLUMN public.job_families.company_division_id IS 'Optional division association. Job Families are typically company-level classifications.';