-- Add contribution type fields to benefit_plans
ALTER TABLE public.benefit_plans 
ADD COLUMN IF NOT EXISTS employee_contribution_type TEXT NOT NULL DEFAULT 'amount' CHECK (employee_contribution_type IN ('amount', 'percentage')),
ADD COLUMN IF NOT EXISTS employer_contribution_type TEXT NOT NULL DEFAULT 'amount' CHECK (employer_contribution_type IN ('amount', 'percentage'));