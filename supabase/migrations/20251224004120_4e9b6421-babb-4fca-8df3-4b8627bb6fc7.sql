-- Add assignment_type column to employee_positions table
ALTER TABLE public.employee_positions 
ADD COLUMN assignment_type text NOT NULL DEFAULT 'primary';

-- Add a comment explaining the valid values
COMMENT ON COLUMN public.employee_positions.assignment_type IS 'Type of position assignment: primary, acting, interim, secondary, secondment';