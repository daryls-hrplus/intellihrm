-- Allow employees to INSERT their own self-rating scores
CREATE POLICY "Employees can insert own self-ratings"
ON appraisal_scores
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM appraisal_participants ap
    WHERE ap.id = appraisal_scores.participant_id
    AND ap.employee_id = auth.uid()
  )
);

-- Allow employees to UPDATE their own self-rating scores  
CREATE POLICY "Employees can update own self-ratings"
ON appraisal_scores
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM appraisal_participants ap
    WHERE ap.id = appraisal_scores.participant_id
    AND ap.employee_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM appraisal_participants ap
    WHERE ap.id = appraisal_scores.participant_id  
    AND ap.employee_id = auth.uid()
  )
);

-- Trigger to prevent employees from modifying manager-only fields
CREATE OR REPLACE FUNCTION validate_employee_score_update()
RETURNS TRIGGER AS $$
DECLARE
  is_employee_only BOOLEAN;
BEGIN
  SELECT (ap.employee_id = auth.uid() AND (ap.evaluator_id IS NULL OR ap.evaluator_id != auth.uid()))
  INTO is_employee_only
  FROM appraisal_participants ap
  WHERE ap.id = NEW.participant_id;

  IF is_employee_only AND TG_OP = 'UPDATE' THEN
    IF NEW.rating IS DISTINCT FROM OLD.rating OR
       NEW.comments IS DISTINCT FROM OLD.comments OR
       NEW.rated_at IS DISTINCT FROM OLD.rated_at THEN
      RAISE EXCEPTION 'Employees cannot modify manager evaluation fields';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_employee_score_restrictions
BEFORE UPDATE ON appraisal_scores
FOR EACH ROW EXECUTE FUNCTION validate_employee_score_update();