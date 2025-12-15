-- Add delimiter and default_value columns to gl_cost_center_segments
ALTER TABLE public.gl_cost_center_segments
ADD COLUMN IF NOT EXISTS delimiter VARCHAR(1) DEFAULT '-',
ADD COLUMN IF NOT EXISTS default_value VARCHAR(20);