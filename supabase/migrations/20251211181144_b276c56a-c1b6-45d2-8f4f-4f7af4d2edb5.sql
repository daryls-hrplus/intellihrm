-- Insert sample workflow steps for Leave Request
INSERT INTO workflow_steps (template_id, step_order, name, description, approver_type, requires_signature, requires_comment, can_delegate, escalation_hours, is_active)
SELECT 
  wt.id,
  1,
  'Manager Approval',
  'Direct manager reviews and approves the leave request',
  'manager',
  false,
  false,
  true,
  48,
  true
FROM workflow_templates wt
WHERE wt.code = 'LEAVE_REQUEST'
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id);

INSERT INTO workflow_steps (template_id, step_order, name, description, approver_type, requires_signature, requires_comment, can_delegate, escalation_hours, is_active)
SELECT 
  wt.id,
  2,
  'HR Confirmation',
  'HR confirms leave balance and records the leave',
  'hr',
  false,
  false,
  true,
  24,
  true
FROM workflow_templates wt
WHERE wt.code = 'LEAVE_REQUEST'
AND EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 1)
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 2);

-- Insert sample workflow steps for Probation Confirmation
INSERT INTO workflow_steps (template_id, step_order, name, description, approver_type, requires_signature, requires_comment, can_delegate, escalation_hours, is_active)
SELECT 
  wt.id,
  1,
  'Manager Evaluation',
  'Direct manager completes probation evaluation',
  'manager',
  true,
  true,
  false,
  72,
  true
FROM workflow_templates wt
WHERE wt.code = 'PROBATION_CONFIRM'
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id);

INSERT INTO workflow_steps (template_id, step_order, name, description, approver_type, requires_signature, requires_comment, can_delegate, escalation_hours, is_active)
SELECT 
  wt.id,
  2,
  'HR Review',
  'HR reviews and finalizes the confirmation',
  'hr',
  true,
  true,
  true,
  48,
  true
FROM workflow_templates wt
WHERE wt.code = 'PROBATION_CONFIRM'
AND EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 1)
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 2);

-- Insert sample workflow steps for Training Request
INSERT INTO workflow_steps (template_id, step_order, name, description, approver_type, requires_signature, requires_comment, can_delegate, escalation_hours, is_active)
SELECT 
  wt.id,
  1,
  'Manager Approval',
  'Manager approves the training request',
  'manager',
  false,
  false,
  true,
  48,
  true
FROM workflow_templates wt
WHERE wt.code = 'TRAINING_REQUEST'
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id);

-- Insert sample workflow steps for Expense Claim
INSERT INTO workflow_steps (template_id, step_order, name, description, approver_type, requires_signature, requires_comment, can_delegate, escalation_hours, is_active)
SELECT 
  wt.id,
  1,
  'Manager Approval',
  'Manager approves the expense claim',
  'manager',
  false,
  false,
  true,
  72,
  true
FROM workflow_templates wt
WHERE wt.code = 'EXPENSE_CLAIM'
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id);

INSERT INTO workflow_steps (template_id, step_order, name, description, approver_type, requires_signature, requires_comment, can_delegate, escalation_hours, is_active)
SELECT 
  wt.id,
  2,
  'Finance Review',
  'Finance team reviews and processes reimbursement',
  'hr',
  false,
  false,
  true,
  48,
  true
FROM workflow_templates wt
WHERE wt.code = 'EXPENSE_CLAIM'
AND EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 1)
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 2);

-- Insert workflow steps for Headcount Request
INSERT INTO workflow_steps (template_id, step_order, name, description, approver_type, requires_signature, requires_comment, can_delegate, escalation_hours, is_active)
SELECT 
  wt.id,
  1,
  'Department Head Approval',
  'Department head reviews headcount justification',
  'manager',
  false,
  true,
  false,
  72,
  true
FROM workflow_templates wt
WHERE wt.code = 'HEADCOUNT_REQUEST'
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id);

INSERT INTO workflow_steps (template_id, step_order, name, description, approver_type, requires_signature, requires_comment, can_delegate, escalation_hours, is_active)
SELECT 
  wt.id,
  2,
  'HR Budget Review',
  'HR reviews budget impact and headcount allocation',
  'hr',
  false,
  true,
  true,
  48,
  true
FROM workflow_templates wt
WHERE wt.code = 'HEADCOUNT_REQUEST'
AND EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 1)
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 2);

INSERT INTO workflow_steps (template_id, step_order, name, description, approver_type, use_reporting_line, requires_signature, requires_comment, can_delegate, escalation_hours, is_active)
SELECT 
  wt.id,
  3,
  'Executive Approval',
  'Executive committee or governance body final approval',
  'governance_body',
  false,
  true,
  true,
  false,
  168,
  true
FROM workflow_templates wt
WHERE wt.code = 'HEADCOUNT_REQUEST'
AND EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 2)
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 3);

-- Insert workflow steps for Employee Transfer
INSERT INTO workflow_steps (template_id, step_order, name, description, approver_type, requires_signature, requires_comment, can_delegate, escalation_hours, is_active)
SELECT 
  wt.id,
  1,
  'Current Manager Approval',
  'Current manager approves the transfer request',
  'manager',
  true,
  true,
  false,
  72,
  true
FROM workflow_templates wt
WHERE wt.code = 'EMPLOYEE_TRANSFER'
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id);

INSERT INTO workflow_steps (template_id, step_order, name, description, approver_type, requires_signature, requires_comment, can_delegate, escalation_hours, is_active)
SELECT 
  wt.id,
  2,
  'HR Review',
  'HR reviews and coordinates the transfer',
  'hr',
  true,
  true,
  true,
  48,
  true
FROM workflow_templates wt
WHERE wt.code = 'EMPLOYEE_TRANSFER'
AND EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 1)
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 2);