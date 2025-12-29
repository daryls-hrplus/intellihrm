-- Add termination and separation date fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS termination_date DATE,
ADD COLUMN IF NOT EXISTS separation_date DATE,
ADD COLUMN IF NOT EXISTS termination_reason TEXT;