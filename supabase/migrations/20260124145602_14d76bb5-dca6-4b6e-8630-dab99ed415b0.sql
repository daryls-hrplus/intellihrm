-- Create function to trigger integration when 360 cycle completes
CREATE OR REPLACE FUNCTION public.trigger_360_integration()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'completed'
  IF OLD.status IS DISTINCT FROM 'completed' AND NEW.status = 'completed' THEN
    -- Log that integration should be triggered (actual invocation happens via app)
    INSERT INTO appraisal_integration_log (
      company_id,
      employee_id,
      trigger_event,
      trigger_data,
      target_module,
      action_type,
      action_result,
      requires_approval
    )
    SELECT 
      NEW.company_id,
      p.employee_id,
      'feedback_360_completed',
      jsonb_build_object(
        'cycle_id', NEW.id,
        'cycle_name', NEW.name,
        'company_id', NEW.company_id,
        'completed_at', now()
      ),
      'development',
      'generate_themes',
      'pending',
      false
    FROM feedback_360_participants p
    WHERE p.cycle_id = NEW.id
    AND p.status = 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for 360 cycle completion
DROP TRIGGER IF EXISTS feedback_360_cycle_completed_integration ON feedback_360_cycles;

CREATE TRIGGER feedback_360_cycle_completed_integration
AFTER UPDATE ON feedback_360_cycles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_360_integration();