-- Fix SECURITY DEFINER functions without search_path set
-- This prevents search path hijacking attacks

-- Fix log_evidence_changes function
CREATE OR REPLACE FUNCTION public.log_evidence_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.evidence_change_log (
    evidence_id,
    change_type,
    changed_by,
    old_values,
    new_values
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix update_participant_scores function
CREATE OR REPLACE FUNCTION public.update_participant_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participant_id uuid;
  v_total_score numeric;
  v_section_count integer;
BEGIN
  -- Get participant_id from either NEW or OLD record
  v_participant_id := COALESCE(NEW.participant_id, OLD.participant_id);
  
  -- Calculate average score across all sections
  SELECT 
    COALESCE(AVG(total_score), 0),
    COUNT(*)
  INTO v_total_score, v_section_count
  FROM public.appraisal_section_scores
  WHERE participant_id = v_participant_id;
  
  -- Update the participant's overall score
  UPDATE public.appraisal_participants
  SET 
    overall_score = v_total_score,
    updated_at = now()
  WHERE id = v_participant_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix validate_employee_score_update function
CREATE OR REPLACE FUNCTION public.validate_employee_score_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate score is within acceptable range
  IF NEW.overall_score IS NOT NULL AND (NEW.overall_score < 0 OR NEW.overall_score > 5) THEN
    RAISE EXCEPTION 'Score must be between 0 and 5';
  END IF;
  
  RETURN NEW;
END;
$$;