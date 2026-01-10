-- Add optional FTE tracking columns to employee_compensation
ALTER TABLE public.employee_compensation
ADD COLUMN IF NOT EXISTS fte_percentage DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS seat_occupant_id UUID DEFAULT NULL REFERENCES public.seat_occupants(id) ON DELETE SET NULL;

-- Add index for seat_occupant lookups
CREATE INDEX IF NOT EXISTS idx_employee_compensation_seat_occupant 
ON public.employee_compensation(seat_occupant_id) 
WHERE seat_occupant_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.employee_compensation.fte_percentage IS 'Snapshot of FTE percentage at time of compensation creation (informational)';
COMMENT ON COLUMN public.employee_compensation.seat_occupant_id IS 'Optional link to seat_occupant record for FTE tracking';