-- Create leave request workflow template if it doesn't exist
INSERT INTO workflow_templates (
  code,
  name,
  category,
  description,
  is_global,
  is_active,
  requires_signature,
  requires_letter,
  auto_terminate_hours,
  allow_return_to_previous,
  start_date,
  created_by
)
SELECT 
  'LEAVE_REQUEST',
  'Leave Request Approval',
  'leave_request',
  'Standard workflow for leave request approvals. Routes to direct manager for approval.',
  true,
  true,
  false,
  false,
  168, -- 7 days auto-terminate
  true,
  now(),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM workflow_templates WHERE code = 'LEAVE_REQUEST'
);

-- Create default workflow step (Manager Approval) for leave request if template was created
INSERT INTO workflow_steps (
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
  is_active
)
SELECT 
  wt.id,
  1,
  'Manager Approval',
  'Direct manager reviews and approves the leave request',
  'manager',
  true,
  false,
  false,
  true,
  48, -- 2 days escalation
  'notify_alternate',
  true
FROM workflow_templates wt
WHERE wt.code = 'LEAVE_REQUEST'
AND NOT EXISTS (
  SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id
);