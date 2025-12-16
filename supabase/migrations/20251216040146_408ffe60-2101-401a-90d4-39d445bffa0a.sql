-- Add position_id to employee_compensation to track which position the compensation is associated with
ALTER TABLE public.employee_compensation
ADD COLUMN position_id uuid REFERENCES public.positions(id);

-- Add index for better query performance
CREATE INDEX idx_employee_compensation_position_id ON public.employee_compensation(position_id);

-- Add comment for documentation
COMMENT ON COLUMN public.employee_compensation.position_id IS 'Optional reference to the position this compensation item is associated with';