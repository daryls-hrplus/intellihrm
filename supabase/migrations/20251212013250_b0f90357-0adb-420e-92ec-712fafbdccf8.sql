-- Create job_goals table
CREATE TABLE public.job_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  goal_description TEXT,
  weighting NUMERIC NOT NULL DEFAULT 0 CHECK (weighting >= 0 AND weighting <= 100),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view job goals"
  ON public.job_goals FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert job goals"
  ON public.job_goals FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update job goals"
  ON public.job_goals FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete job goals"
  ON public.job_goals FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_job_goals_updated_at
  BEFORE UPDATE ON public.job_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create validation function for overlapping date ranges
CREATE OR REPLACE FUNCTION public.validate_job_goal_no_overlap()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.job_goals
    WHERE job_id = NEW.job_id
      AND goal_name = NEW.goal_name
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
      AND (
        (NEW.start_date <= COALESCE(end_date, '9999-12-31'::date))
        AND (start_date <= COALESCE(NEW.end_date, '9999-12-31'::date))
      )
  ) THEN
    RAISE EXCEPTION 'Overlapping date ranges for the same goal are not allowed';
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for overlap validation
CREATE TRIGGER validate_job_goal_no_overlap_trigger
  BEFORE INSERT OR UPDATE ON public.job_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_job_goal_no_overlap();