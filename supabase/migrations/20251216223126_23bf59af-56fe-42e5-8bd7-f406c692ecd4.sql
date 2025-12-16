-- Add pay group fields to employee_positions table
ALTER TABLE public.employee_positions 
ADD COLUMN IF NOT EXISTS pay_group_id UUID REFERENCES public.pay_groups(id),
ADD COLUMN IF NOT EXISTS pay_group_start_date DATE,
ADD COLUMN IF NOT EXISTS pay_group_end_date DATE;

-- Add index for pay group lookups
CREATE INDEX IF NOT EXISTS idx_employee_positions_pay_group ON public.employee_positions(pay_group_id);

-- Add comment explaining the relationship
COMMENT ON COLUMN public.employee_positions.pay_group_id IS 'Pay group for this specific position assignment - allows different pay groups per position';
COMMENT ON COLUMN public.employee_positions.pay_group_start_date IS 'Start date for pay group assignment (can differ from position start)';
COMMENT ON COLUMN public.employee_positions.pay_group_end_date IS 'End date for pay group assignment (allows changing pay group while staying in same position)';