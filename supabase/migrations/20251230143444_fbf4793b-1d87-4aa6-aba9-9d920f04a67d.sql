-- Add workflow step for Government ID Submission (HR Review)
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
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  wt.id,
  1,
  'HR Review',
  'HR reviews and verifies the submitted government ID document',
  'role',
  false,
  false,
  false,
  true,
  24,
  'escalate_up',
  true,
  now(),
  now()
FROM public.workflow_templates wt
WHERE wt.code = 'GOVERNMENT_ID_SUBMISSION'
AND NOT EXISTS (
  SELECT 1 FROM public.workflow_steps ws 
  WHERE ws.template_id = wt.id AND ws.step_order = 1
);

-- Add workflow step for Immigration Document Submission (HR Review)
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
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  wt.id,
  1,
  'HR Review',
  'HR reviews and verifies the submitted immigration document',
  'role',
  false,
  false,
  false,
  true,
  24,
  'escalate_up',
  true,
  now(),
  now()
FROM public.workflow_templates wt
WHERE wt.code = 'IMMIGRATION_DOCUMENT_SUBMISSION'
AND NOT EXISTS (
  SELECT 1 FROM public.workflow_steps ws 
  WHERE ws.template_id = wt.id AND ws.step_order = 1
);