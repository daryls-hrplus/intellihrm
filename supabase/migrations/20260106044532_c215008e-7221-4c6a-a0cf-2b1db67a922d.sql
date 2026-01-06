-- Add timekeeper override columns to time_clock_entries
ALTER TABLE public.time_clock_entries
ADD COLUMN IF NOT EXISTS override_clock_in TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS override_clock_out TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS override_reason TEXT,
ADD COLUMN IF NOT EXISTS override_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS override_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payable_hours NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS payable_regular_hours NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS payable_overtime_hours NUMERIC(10,2);

-- Create index for override queries
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_override_by ON public.time_clock_entries(override_by);

-- Create function to calculate payable hours based on override or rounded times
CREATE OR REPLACE FUNCTION public.calculate_payable_hours()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  effective_in TIMESTAMPTZ;
  effective_out TIMESTAMPTZ;
  work_hours NUMERIC(10,2);
  break_mins INTEGER;
  reg_hours NUMERIC(10,2);
  ot_hours NUMERIC(10,2);
  daily_threshold NUMERIC := 8.0;
BEGIN
  -- Determine effective clock in: override > rounded > actual
  effective_in := COALESCE(NEW.override_clock_in, NEW.rounded_clock_in, NEW.clock_in);
  effective_out := COALESCE(NEW.override_clock_out, NEW.rounded_clock_out, NEW.clock_out);
  
  -- Only calculate if we have both in and out
  IF effective_in IS NOT NULL AND effective_out IS NOT NULL THEN
    -- Calculate raw hours
    work_hours := EXTRACT(EPOCH FROM (effective_out - effective_in)) / 3600.0;
    
    -- Subtract break time
    break_mins := COALESCE(NEW.break_duration_minutes, 0);
    work_hours := work_hours - (break_mins / 60.0);
    
    -- Ensure non-negative
    work_hours := GREATEST(work_hours, 0);
    
    -- Calculate regular vs overtime (simple 8-hour threshold)
    reg_hours := LEAST(work_hours, daily_threshold);
    ot_hours := GREATEST(work_hours - daily_threshold, 0);
    
    NEW.payable_hours := ROUND(work_hours, 2);
    NEW.payable_regular_hours := ROUND(reg_hours, 2);
    NEW.payable_overtime_hours := ROUND(ot_hours, 2);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-calculate payable hours
DROP TRIGGER IF EXISTS calculate_payable_hours_trigger ON public.time_clock_entries;
CREATE TRIGGER calculate_payable_hours_trigger
BEFORE INSERT OR UPDATE OF clock_in, clock_out, rounded_clock_in, rounded_clock_out, 
  override_clock_in, override_clock_out, break_duration_minutes
ON public.time_clock_entries
FOR EACH ROW
EXECUTE FUNCTION public.calculate_payable_hours();

-- Backfill existing records with payable hours
UPDATE public.time_clock_entries
SET payable_hours = ROUND(
  GREATEST(
    EXTRACT(EPOCH FROM (
      COALESCE(override_clock_out, rounded_clock_out, clock_out) - 
      COALESCE(override_clock_in, rounded_clock_in, clock_in)
    )) / 3600.0 - COALESCE(break_duration_minutes, 0) / 60.0,
    0
  ), 2
)
WHERE clock_out IS NOT NULL;