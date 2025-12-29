-- Add personal information fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS marital_status text;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.gender IS 'Employee gender: male, female, other, prefer_not_to_say';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'Employee date of birth';
COMMENT ON COLUMN public.profiles.marital_status IS 'Employee marital status: single, married, divorced, widowed, separated, domestic_partnership';