-- Add employment date fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_hire_date DATE,
ADD COLUMN IF NOT EXISTS last_hire_date DATE,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS continuous_service_date DATE,
ADD COLUMN IF NOT EXISTS seniority_date DATE,
ADD COLUMN IF NOT EXISTS adjusted_service_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.first_hire_date IS 'Original hire date for the employee';
COMMENT ON COLUMN public.profiles.last_hire_date IS 'Most recent hire date (for rehires)';
COMMENT ON COLUMN public.profiles.start_date IS 'First day on the job';
COMMENT ON COLUMN public.profiles.continuous_service_date IS 'Date used for calculating continuous service';
COMMENT ON COLUMN public.profiles.seniority_date IS 'Date used for seniority calculations';
COMMENT ON COLUMN public.profiles.adjusted_service_date IS 'Service date with any adjustments applied';