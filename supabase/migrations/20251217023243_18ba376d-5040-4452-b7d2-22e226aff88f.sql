-- Add contribution type fields to benefit_enrollments
ALTER TABLE public.benefit_enrollments 
ADD COLUMN IF NOT EXISTS employee_contribution_type TEXT NOT NULL DEFAULT 'amount' CHECK (employee_contribution_type IN ('amount', 'percentage')),
ADD COLUMN IF NOT EXISTS employer_contribution_type TEXT NOT NULL DEFAULT 'amount' CHECK (employer_contribution_type IN ('amount', 'percentage'));