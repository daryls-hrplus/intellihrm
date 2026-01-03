-- Add the missing verification_code column to training_enrollments
ALTER TABLE public.training_enrollments 
ADD COLUMN IF NOT EXISTS verification_code TEXT;