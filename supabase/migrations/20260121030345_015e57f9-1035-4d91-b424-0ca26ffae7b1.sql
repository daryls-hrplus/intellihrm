-- Add policy for employees to update their own self-assessment fields
CREATE POLICY "Employees can update own self-assessment"
ON appraisal_participants
FOR UPDATE
USING (auth.uid() = employee_id)
WITH CHECK (auth.uid() = employee_id);

-- Create validation function to prevent employees from modifying manager-controlled fields
CREATE OR REPLACE FUNCTION validate_employee_self_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is the employee (not evaluator/admin)
  IF auth.uid() = NEW.employee_id AND (OLD.evaluator_id IS NULL OR auth.uid() != OLD.evaluator_id) THEN
    -- Prevent employees from modifying evaluator-controlled fields
    IF NEW.overall_score IS DISTINCT FROM OLD.overall_score OR
       NEW.goal_score IS DISTINCT FROM OLD.goal_score OR
       NEW.competency_score IS DISTINCT FROM OLD.competency_score OR
       NEW.responsibility_score IS DISTINCT FROM OLD.responsibility_score OR
       NEW.final_comments IS DISTINCT FROM OLD.final_comments OR
       NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at OR
       NEW.evaluator_id IS DISTINCT FROM OLD.evaluator_id THEN
      RAISE EXCEPTION 'Employees cannot modify manager evaluation fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce restrictions
CREATE TRIGGER enforce_employee_update_restrictions
BEFORE UPDATE ON appraisal_participants
FOR EACH ROW EXECUTE FUNCTION validate_employee_self_update();