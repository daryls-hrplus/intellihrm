-- Fix search_path for validate_job_goal_no_overlap function
CREATE OR REPLACE FUNCTION public.validate_job_goal_no_overlap()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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