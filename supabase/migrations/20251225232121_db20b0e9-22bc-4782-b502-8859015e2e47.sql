-- Add employment_relation column to positions table
ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS employment_relation TEXT DEFAULT 'EMPLOYEE';

-- Add comment for documentation
COMMENT ON COLUMN public.positions.employment_relation IS 'Employment relation type: EMPLOYEE, CONTRACTOR, INTERN_TRAINEE';