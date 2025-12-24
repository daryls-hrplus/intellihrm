-- Add secondment fields to employee_transactions
ALTER TABLE public.employee_transactions
ADD COLUMN IF NOT EXISTS secondment_position_id uuid REFERENCES public.positions(id),
ADD COLUMN IF NOT EXISTS secondment_start_date date,
ADD COLUMN IF NOT EXISTS secondment_end_date date,
ADD COLUMN IF NOT EXISTS secondment_reason_id uuid REFERENCES public.lookup_values(id),
ADD COLUMN IF NOT EXISTS suspended_position_id uuid REFERENCES public.positions(id);

-- Add comment for clarity
COMMENT ON COLUMN public.employee_transactions.secondment_position_id IS 'The position the employee is seconded to';
COMMENT ON COLUMN public.employee_transactions.suspended_position_id IS 'The primary position that is suspended during secondment';
COMMENT ON COLUMN public.employee_transactions.secondment_start_date IS 'When the secondment begins';
COMMENT ON COLUMN public.employee_transactions.secondment_end_date IS 'Expected end date of the secondment';
COMMENT ON COLUMN public.employee_transactions.secondment_reason_id IS 'Reason for the secondment';