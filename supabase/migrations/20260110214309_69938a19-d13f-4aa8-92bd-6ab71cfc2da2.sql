-- Link headcount_change_requests to workflow_instances
ALTER TABLE public.headcount_change_requests
ADD COLUMN IF NOT EXISTS workflow_instance_id UUID REFERENCES public.workflow_instances(id) ON DELETE SET NULL;

-- Create index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_headcount_requests_workflow_instance 
ON public.headcount_change_requests(workflow_instance_id);

-- Create a workflow template for headcount requests if not exists
INSERT INTO public.workflow_templates (
  id,
  name,
  code,
  category,
  description,
  is_global,
  is_active,
  requires_signature,
  requires_letter,
  allow_return_to_previous,
  created_by
)
SELECT 
  gen_random_uuid(),
  'Headcount Change Request Approval',
  'HEADCOUNT_CHANGE',
  'headcount_request'::workflow_category,
  'Multi-level approval workflow for headcount increase, decrease, freeze, and unfreeze requests',
  true,
  true,
  false,
  false,
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM public.workflow_templates WHERE code = 'HEADCOUNT_CHANGE'
);

-- Create default workflow steps for headcount requests
-- Step 1: Manager Approval
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
  escalation_hours,
  escalation_action,
  is_active,
  sla_warning_hours,
  sla_critical_hours
)
SELECT
  gen_random_uuid(),
  wt.id,
  1,
  'Manager Approval',
  'Direct manager reviews and approves the headcount change request',
  'manager',
  true,
  false,
  true,
  true,
  48,
  'escalate_up',
  true,
  24,
  48
FROM public.workflow_templates wt
WHERE wt.code = 'HEADCOUNT_CHANGE'
AND NOT EXISTS (
  SELECT 1 FROM public.workflow_steps ws 
  WHERE ws.template_id = wt.id AND ws.step_order = 1
);

-- Step 2: HR Review
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
  escalation_hours,
  escalation_action,
  is_active,
  sla_warning_hours,
  sla_critical_hours
)
SELECT
  gen_random_uuid(),
  wt.id,
  2,
  'HR Review',
  'HR reviews headcount impact and compliance',
  'hr',
  false,
  false,
  true,
  true,
  72,
  'notify_alternate',
  true,
  48,
  72
FROM public.workflow_templates wt
WHERE wt.code = 'HEADCOUNT_CHANGE'
AND NOT EXISTS (
  SELECT 1 FROM public.workflow_steps ws 
  WHERE ws.template_id = wt.id AND ws.step_order = 2
);

-- Step 3: Finance Approval (for budget impact)
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
  escalation_hours,
  escalation_action,
  is_active,
  sla_warning_hours,
  sla_critical_hours
)
SELECT
  gen_random_uuid(),
  wt.id,
  3,
  'Finance Approval',
  'Finance reviews budget impact and approves funding',
  'role',
  false,
  false,
  true,
  true,
  72,
  'escalate_up',
  true,
  48,
  72
FROM public.workflow_templates wt
WHERE wt.code = 'HEADCOUNT_CHANGE'
AND NOT EXISTS (
  SELECT 1 FROM public.workflow_steps ws 
  WHERE ws.template_id = wt.id AND ws.step_order = 3
);

-- Create function to initiate headcount workflow
CREATE OR REPLACE FUNCTION public.initiate_headcount_workflow(
  p_headcount_request_id UUID,
  p_company_id UUID,
  p_initiated_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template_id UUID;
  v_first_step_id UUID;
  v_workflow_instance_id UUID;
  v_request_type TEXT;
BEGIN
  -- Get the headcount workflow template
  SELECT id INTO v_template_id
  FROM public.workflow_templates
  WHERE code = 'HEADCOUNT_CHANGE' AND is_active = true
  LIMIT 1;
  
  IF v_template_id IS NULL THEN
    RAISE EXCEPTION 'Headcount workflow template not found';
  END IF;
  
  -- Get the first step
  SELECT id INTO v_first_step_id
  FROM public.workflow_steps
  WHERE template_id = v_template_id AND is_active = true
  ORDER BY step_order ASC
  LIMIT 1;
  
  -- Get request type for metadata
  SELECT request_type INTO v_request_type
  FROM public.headcount_change_requests
  WHERE id = p_headcount_request_id;
  
  -- Create workflow instance
  INSERT INTO public.workflow_instances (
    id,
    template_id,
    category,
    reference_type,
    reference_id,
    status,
    current_step_id,
    current_step_order,
    initiated_by,
    initiated_at,
    company_id,
    metadata,
    current_step_started_at,
    sla_status
  )
  VALUES (
    gen_random_uuid(),
    v_template_id,
    'headcount_request'::workflow_category,
    'headcount_change_request',
    p_headcount_request_id,
    'pending'::workflow_status,
    v_first_step_id,
    1,
    p_initiated_by,
    NOW(),
    p_company_id,
    jsonb_build_object('request_type', v_request_type),
    NOW(),
    'on_track'
  )
  RETURNING id INTO v_workflow_instance_id;
  
  -- Link the workflow instance to the headcount request
  UPDATE public.headcount_change_requests
  SET 
    workflow_instance_id = v_workflow_instance_id,
    status = 'PENDING',
    updated_at = NOW()
  WHERE id = p_headcount_request_id;
  
  -- Create audit event
  INSERT INTO public.workflow_audit_events (
    workflow_instance_id,
    event_type,
    step_id,
    actor_id,
    actor_role,
    previous_status,
    new_status,
    comment,
    metadata
  )
  VALUES (
    v_workflow_instance_id,
    'workflow_initiated',
    v_first_step_id,
    p_initiated_by,
    'initiator',
    NULL,
    'pending',
    'Headcount change request submitted for approval',
    jsonb_build_object('request_type', v_request_type)
  );
  
  RETURN v_workflow_instance_id;
END;
$$;

-- Create function to process workflow step action
CREATE OR REPLACE FUNCTION public.process_headcount_workflow_action(
  p_headcount_request_id UUID,
  p_action TEXT, -- 'approve', 'reject', 'return'
  p_actor_id UUID,
  p_comment TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workflow_instance_id UUID;
  v_current_step_id UUID;
  v_current_step_order INT;
  v_next_step_id UUID;
  v_next_step_order INT;
  v_template_id UUID;
  v_old_status TEXT;
  v_new_status TEXT;
  v_total_steps INT;
  v_result JSONB;
BEGIN
  -- Get workflow instance details
  SELECT 
    hcr.workflow_instance_id,
    wi.current_step_id,
    wi.current_step_order,
    wi.template_id,
    wi.status::text
  INTO 
    v_workflow_instance_id,
    v_current_step_id,
    v_current_step_order,
    v_template_id,
    v_old_status
  FROM public.headcount_change_requests hcr
  JOIN public.workflow_instances wi ON wi.id = hcr.workflow_instance_id
  WHERE hcr.id = p_headcount_request_id;
  
  IF v_workflow_instance_id IS NULL THEN
    RAISE EXCEPTION 'Workflow instance not found for this request';
  END IF;
  
  -- Get total steps count
  SELECT COUNT(*) INTO v_total_steps
  FROM public.workflow_steps
  WHERE template_id = v_template_id AND is_active = true;
  
  IF p_action = 'approve' THEN
    -- Check if there are more steps
    SELECT id, step_order INTO v_next_step_id, v_next_step_order
    FROM public.workflow_steps
    WHERE template_id = v_template_id 
      AND step_order > v_current_step_order 
      AND is_active = true
    ORDER BY step_order ASC
    LIMIT 1;
    
    IF v_next_step_id IS NOT NULL THEN
      -- Move to next step
      v_new_status := 'in_progress';
      
      UPDATE public.workflow_instances
      SET 
        current_step_id = v_next_step_id,
        current_step_order = v_next_step_order,
        status = 'in_progress'::workflow_status,
        current_step_started_at = NOW(),
        updated_at = NOW()
      WHERE id = v_workflow_instance_id;
      
      UPDATE public.headcount_change_requests
      SET 
        status = 'UNDER_REVIEW',
        approval_level = v_next_step_order,
        updated_at = NOW()
      WHERE id = p_headcount_request_id;
      
    ELSE
      -- Final approval - all steps complete
      v_new_status := 'approved';
      
      UPDATE public.workflow_instances
      SET 
        status = 'approved'::workflow_status,
        final_action = 'approved'::workflow_action,
        completed_at = NOW(),
        completed_by = p_actor_id,
        updated_at = NOW()
      WHERE id = v_workflow_instance_id;
      
      UPDATE public.headcount_change_requests
      SET 
        status = 'APPROVED',
        reviewed_by = p_actor_id,
        reviewed_at = NOW(),
        review_notes = p_comment,
        updated_at = NOW()
      WHERE id = p_headcount_request_id;
    END IF;
    
  ELSIF p_action = 'reject' THEN
    v_new_status := 'rejected';
    
    UPDATE public.workflow_instances
    SET 
      status = 'rejected'::workflow_status,
      final_action = 'rejected'::workflow_action,
      completed_at = NOW(),
      completed_by = p_actor_id,
      updated_at = NOW()
    WHERE id = v_workflow_instance_id;
    
    UPDATE public.headcount_change_requests
    SET 
      status = 'REJECTED',
      reviewed_by = p_actor_id,
      reviewed_at = NOW(),
      review_notes = p_comment,
      updated_at = NOW()
    WHERE id = p_headcount_request_id;
    
  ELSIF p_action = 'return' THEN
    -- Return to previous step
    SELECT id, step_order INTO v_next_step_id, v_next_step_order
    FROM public.workflow_steps
    WHERE template_id = v_template_id 
      AND step_order < v_current_step_order 
      AND is_active = true
    ORDER BY step_order DESC
    LIMIT 1;
    
    IF v_next_step_id IS NOT NULL THEN
      v_new_status := 'returned';
      
      UPDATE public.workflow_instances
      SET 
        current_step_id = v_next_step_id,
        current_step_order = v_next_step_order,
        status = 'returned'::workflow_status,
        current_step_started_at = NOW(),
        updated_at = NOW()
      WHERE id = v_workflow_instance_id;
      
      UPDATE public.headcount_change_requests
      SET 
        status = 'UNDER_REVIEW',
        approval_level = v_next_step_order,
        updated_at = NOW()
      WHERE id = p_headcount_request_id;
    ELSE
      RAISE EXCEPTION 'Cannot return - already at first step';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid action: %', p_action;
  END IF;
  
  -- Create audit event
  INSERT INTO public.workflow_audit_events (
    workflow_instance_id,
    event_type,
    step_id,
    actor_id,
    actor_role,
    previous_status,
    new_status,
    comment,
    metadata
  )
  VALUES (
    v_workflow_instance_id,
    'step_' || p_action || 'd',
    v_current_step_id,
    p_actor_id,
    'approver',
    v_old_status,
    v_new_status,
    p_comment,
    jsonb_build_object(
      'step_order', v_current_step_order,
      'next_step_order', v_next_step_order
    )
  );
  
  v_result := jsonb_build_object(
    'success', true,
    'action', p_action,
    'new_status', v_new_status,
    'current_step_order', COALESCE(v_next_step_order, v_current_step_order),
    'total_steps', v_total_steps
  );
  
  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.initiate_headcount_workflow(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_headcount_workflow_action(UUID, TEXT, UUID, TEXT) TO authenticated;