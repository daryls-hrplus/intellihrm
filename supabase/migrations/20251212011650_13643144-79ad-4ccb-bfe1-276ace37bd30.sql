-- Add start_date and end_date columns to job_competencies
ALTER TABLE public.job_competencies
ADD COLUMN start_date date NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN end_date date;

-- Drop the existing unique constraint that prevents same competency
ALTER TABLE public.job_competencies DROP CONSTRAINT IF EXISTS job_competencies_job_id_competency_id_key;

-- Create a function to validate no overlapping date ranges for same competency on same job
CREATE OR REPLACE FUNCTION public.validate_job_competency_no_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for overlapping date ranges for the same job and competency
  IF EXISTS (
    SELECT 1 FROM public.job_competencies
    WHERE job_id = NEW.job_id
      AND competency_id = NEW.competency_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
      AND (
        -- Overlapping logic: ranges overlap if start1 <= end2 AND start2 <= end1
        -- Handle null end_date as "ongoing" (infinite future)
        (NEW.start_date <= COALESCE(end_date, '9999-12-31'::date))
        AND (start_date <= COALESCE(NEW.end_date, '9999-12-31'::date))
      )
  ) THEN
    RAISE EXCEPTION 'Overlapping date ranges for the same competency are not allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate no overlapping competencies
CREATE TRIGGER validate_job_competency_overlap
BEFORE INSERT OR UPDATE ON public.job_competencies
FOR EACH ROW
EXECUTE FUNCTION public.validate_job_competency_no_overlap();