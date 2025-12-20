-- Add earnings handling columns to semimonthly_payroll_rules
ALTER TABLE public.semimonthly_payroll_rules 
ADD COLUMN IF NOT EXISTS base_salary_handling text NOT NULL DEFAULT 'split',
ADD COLUMN IF NOT EXISTS other_earnings_handling text NOT NULL DEFAULT 'split',
ADD COLUMN IF NOT EXISTS other_earnings_overrides jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.semimonthly_payroll_rules.base_salary_handling IS 'How base salary is split: split (default - 50/50), first_cycle, last_cycle';
COMMENT ON COLUMN public.semimonthly_payroll_rules.other_earnings_handling IS 'How other regular earnings are split: split (default - 50/50), first_cycle, last_cycle (pay fully on second cycle)';
COMMENT ON COLUMN public.semimonthly_payroll_rules.other_earnings_overrides IS 'Pay element codes that should be handled differently from other_earnings_handling';