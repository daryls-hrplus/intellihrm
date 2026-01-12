-- Insert the Appraisal Acknowledgment workflow template
INSERT INTO public.workflow_templates (
  id,
  code,
  name,
  description,
  category,
  is_global,
  is_active,
  requires_signature,
  requires_letter,
  allow_return_to_previous,
  created_by,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'APPRAISAL_ACKNOWLEDGMENT',
  'Appraisal Acknowledgment',
  'Workflow for employees to formally acknowledge receipt and review of their performance appraisal.',
  'performance',
  true,
  true,
  true,
  false,
  false,
  'e1cd5551-bab4-4127-9f24-107629936fc1',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Step 1: Employee Acknowledgment
INSERT INTO public.workflow_steps (
  id,
  template_id,
  step_order,
  name,
  description,
  approver_type,
  use_reporting_line,
  requires_signature,
  requires_comment,
  can_delegate,
  is_active,
  created_at,
  updated_at
) VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  1,
  'Employee Acknowledgment',
  'Employee acknowledges receipt and review of the performance appraisal.',
  'employee',
  false,
  true,
  false,
  false,
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Manager Delivery Confirmation (with correct column order)
INSERT INTO public.workflow_steps (
  id,
  template_id,
  step_order,
  name,
  description,
  approver_type,
  use_reporting_line,
  requires_signature,
  requires_comment,
  can_delegate,
  is_active,
  expiration_days,
  created_at,
  updated_at
) VALUES (
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  2,
  'Manager Delivery Confirmation',
  'Manager confirms the appraisal was delivered and discussed with the employee.',
  'manager',
  true,
  true,
  false,
  true,
  true,
  7,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Create trigger function for auto-creating acknowledgment workflow
CREATE OR REPLACE FUNCTION public.create_appraisal_acknowledgment_workflow()
RETURNS TRIGGER AS $$
DECLARE
  v_workflow_instance_id UUID;
  v_cycle_name TEXT;
BEGIN
  IF NEW.reviewed_at IS NOT NULL AND OLD.reviewed_at IS NULL THEN
    SELECT ac.name INTO v_cycle_name FROM appraisal_cycles ac WHERE ac.id = NEW.cycle_id;
    
    INSERT INTO workflow_instances (id, template_id, reference_type, reference_id, initiated_by, status, current_step, metadata, created_at, updated_at)
    VALUES (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'appraisal_participant', NEW.id, NEW.reviewer_id, 'pending', 1,
      jsonb_build_object('employee_id', NEW.employee_id, 'cycle_id', NEW.cycle_id, 'cycle_name', v_cycle_name), now(), now())
    RETURNING id INTO v_workflow_instance_id;
    
    NEW.acknowledgment_workflow_instance_id := v_workflow_instance_id;
    
    INSERT INTO workflow_approvals (id, instance_id, step_id, approver_id, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_workflow_instance_id, 'b2c3d4e5-f6a7-8901-bcde-f23456789012', NEW.employee_id, 'pending', now(), now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_create_appraisal_acknowledgment_workflow ON appraisal_participants;
CREATE TRIGGER trigger_create_appraisal_acknowledgment_workflow
  BEFORE UPDATE ON appraisal_participants FOR EACH ROW
  EXECUTE FUNCTION create_appraisal_acknowledgment_workflow();

-- Create trigger function for updating appraisal on workflow completion
CREATE OR REPLACE FUNCTION public.update_appraisal_on_workflow_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.reference_type = 'appraisal_participant' THEN
    UPDATE appraisal_participants SET status = 'acknowledged', acknowledged_at = now(), updated_at = now() WHERE id = NEW.reference_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_update_appraisal_on_workflow_completion ON workflow_instances;
CREATE TRIGGER trigger_update_appraisal_on_workflow_completion
  AFTER UPDATE ON workflow_instances FOR EACH ROW
  EXECUTE FUNCTION update_appraisal_on_workflow_completion();