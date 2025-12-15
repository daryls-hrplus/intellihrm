
-- Add compensation model to positions
ALTER TABLE public.positions 
ADD COLUMN compensation_model TEXT NOT NULL DEFAULT 'salary_grade' 
CHECK (compensation_model IN ('salary_grade', 'spinal_point', 'hybrid'));

-- Add spinal point range to positions (for positions using spinal points)
ALTER TABLE public.positions
ADD COLUMN pay_spine_id UUID REFERENCES public.pay_spines(id) ON DELETE SET NULL,
ADD COLUMN min_spinal_point INTEGER,
ADD COLUMN max_spinal_point INTEGER,
ADD COLUMN entry_spinal_point INTEGER;

-- Add constraint for spinal point range validity
ALTER TABLE public.positions
ADD CONSTRAINT valid_spinal_point_range 
CHECK (min_spinal_point IS NULL OR max_spinal_point IS NULL OR min_spinal_point <= max_spinal_point);

ALTER TABLE public.positions
ADD CONSTRAINT valid_entry_spinal_point 
CHECK (entry_spinal_point IS NULL OR (entry_spinal_point >= min_spinal_point AND entry_spinal_point <= max_spinal_point));

-- Add current spinal point to employee_positions
ALTER TABLE public.employee_positions
ADD COLUMN spinal_point_id UUID REFERENCES public.spinal_points(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_positions_compensation_model ON public.positions(compensation_model);
CREATE INDEX idx_positions_pay_spine ON public.positions(pay_spine_id);
CREATE INDEX idx_employee_positions_spinal_point ON public.employee_positions(spinal_point_id);
