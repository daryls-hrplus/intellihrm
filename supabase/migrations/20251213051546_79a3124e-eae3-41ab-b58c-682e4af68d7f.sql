-- Add workflow_instance_id to headcount_requests if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'headcount_requests' 
    AND column_name = 'workflow_instance_id'
  ) THEN
    ALTER TABLE public.headcount_requests
    ADD COLUMN workflow_instance_id UUID REFERENCES public.workflow_instances(id);
  END IF;
END $$;

-- Add headcount_request_id to job_requisitions if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_requisitions' 
    AND column_name = 'headcount_request_id'
  ) THEN
    ALTER TABLE public.job_requisitions
    ADD COLUMN headcount_request_id UUID REFERENCES public.headcount_requests(id);
  END IF;
END $$;

-- Create a function to automatically create job requisition when headcount request is approved
CREATE OR REPLACE FUNCTION public.create_job_requisition_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_position RECORD;
  v_department RECORD;
  v_headcount_change INTEGER;
BEGIN
  -- Only proceed if status changed to approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Get position details
    SELECT p.*, d.name as department_name, d.company_id
    INTO v_position
    FROM positions p
    JOIN departments d ON p.department_id = d.id
    WHERE p.id = NEW.position_id;
    
    -- Calculate headcount change (only create requisition for increases)
    v_headcount_change := NEW.requested_headcount - NEW.current_headcount;
    
    IF v_headcount_change > 0 THEN
      -- Create job requisition for each additional headcount
      INSERT INTO job_requisitions (
        company_id,
        position_id,
        department_id,
        title,
        employment_type,
        status,
        openings,
        hiring_manager_id,
        headcount_request_id,
        created_by
      ) VALUES (
        v_position.company_id,
        NEW.position_id,
        v_position.department_id,
        v_position.title,
        'full_time',
        'draft',
        v_headcount_change,
        NEW.requested_by,
        NEW.id,
        NEW.reviewed_by
      );
    END IF;
    
    -- Update position authorized headcount
    UPDATE positions
    SET authorized_headcount = NEW.requested_headcount
    WHERE id = NEW.position_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_create_job_requisition_on_approval ON headcount_requests;

CREATE TRIGGER trigger_create_job_requisition_on_approval
  AFTER UPDATE ON headcount_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_job_requisition_on_approval();