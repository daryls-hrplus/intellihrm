-- Add start_date and end_date to company_divisions
ALTER TABLE public.company_divisions
ADD COLUMN start_date date NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN end_date date DEFAULT NULL;

-- Add start_date and end_date to departments
ALTER TABLE public.departments
ADD COLUMN start_date date NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN end_date date DEFAULT NULL;

-- Add start_date and end_date to sections
ALTER TABLE public.sections
ADD COLUMN start_date date NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN end_date date DEFAULT NULL;

-- Add start_date and end_date to positions
ALTER TABLE public.positions
ADD COLUMN start_date date NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN end_date date DEFAULT NULL;

-- Create index for efficient date-based queries
CREATE INDEX idx_company_divisions_dates ON public.company_divisions (start_date, end_date);
CREATE INDEX idx_departments_dates ON public.departments (start_date, end_date);
CREATE INDEX idx_sections_dates ON public.sections (start_date, end_date);
CREATE INDEX idx_positions_dates ON public.positions (start_date, end_date);

-- Create a function to check if an entity is active at a given date
CREATE OR REPLACE FUNCTION public.is_active_at_date(
  p_start_date date,
  p_end_date date,
  p_check_date date DEFAULT CURRENT_DATE
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_start_date <= p_check_date AND (p_end_date IS NULL OR p_end_date >= p_check_date);
$$;