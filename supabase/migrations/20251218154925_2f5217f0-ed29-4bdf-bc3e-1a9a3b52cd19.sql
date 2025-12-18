-- Add account_number to employee_regular_deductions
ALTER TABLE public.employee_regular_deductions
ADD COLUMN IF NOT EXISTS account_number text;

COMMENT ON COLUMN public.employee_regular_deductions.account_number IS 'Account number at the institution for this deduction';