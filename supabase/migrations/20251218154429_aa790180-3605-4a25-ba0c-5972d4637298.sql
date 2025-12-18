-- Add institution and account fields to employee_period_deductions
ALTER TABLE public.employee_period_deductions
ADD COLUMN IF NOT EXISTS institution_name text,
ADD COLUMN IF NOT EXISTS account_number text;

-- Add comment for documentation
COMMENT ON COLUMN public.employee_period_deductions.institution_name IS 'Name of the institution receiving the deduction (e.g., bank, credit union)';
COMMENT ON COLUMN public.employee_period_deductions.account_number IS 'Account number at the institution for this deduction';