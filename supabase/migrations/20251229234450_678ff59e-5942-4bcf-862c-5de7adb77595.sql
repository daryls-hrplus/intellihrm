-- Rename termination_date to last_working_date in profiles table
ALTER TABLE public.profiles 
RENAME COLUMN termination_date TO last_working_date;