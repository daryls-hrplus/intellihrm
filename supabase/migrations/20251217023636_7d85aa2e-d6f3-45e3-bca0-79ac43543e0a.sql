-- Add employee policy number field to benefit_enrollments
ALTER TABLE public.benefit_enrollments 
ADD COLUMN IF NOT EXISTS employee_policy_number TEXT;