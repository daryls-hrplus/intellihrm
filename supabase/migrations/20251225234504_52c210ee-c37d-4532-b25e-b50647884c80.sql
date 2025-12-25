-- Add employment_status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS employment_status TEXT DEFAULT 'permanent';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.employment_status IS 'Employment status: on_probation, temporary, permanent, contract, part_time';