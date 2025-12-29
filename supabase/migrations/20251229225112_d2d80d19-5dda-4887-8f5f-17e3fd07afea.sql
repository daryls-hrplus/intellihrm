-- Add time_clock_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS time_clock_id text;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.time_clock_id IS 'Time clock/attendance system ID for the employee';