-- Add letter templates for HR documents
INSERT INTO public.letter_templates (id, name, code, category, subject, body_template, available_variables, is_active, requires_approval, created_by)
VALUES 
('b1c2d3e4-f5a6-7890-bcde-1234567890ab', 'Performance Improvement Plan Letter', 'pip_letter', 'employment', 'Performance Improvement Plan Notice', 
'Date: {{current_date}}

To: {{employee_name}}
Position: {{current_position}}
Department: {{department_name}}

Subject: Performance Improvement Plan

Dear {{employee_name}},

This letter serves as formal notification that you are being placed on a Performance Improvement Plan (PIP) effective {{effective_date}}.

Performance Areas Requiring Improvement:
{{improvement_areas}}

Expected Standards:
{{expected_standards}}

Review Period: {{review_period_days}} days, ending on {{target_date}}.

Manager: {{manager_name}}

Please acknowledge receipt of this letter by signing below.

Employee Acknowledgment:
I acknowledge receipt of this Performance Improvement Plan.

_________________________     _______________
Employee Signature             Date',
'["current_date", "employee_name", "current_position", "department_name", "effective_date", "improvement_areas", "expected_standards", "review_period_days", "target_date", "manager_name"]'::jsonb,
true, false, 'e1cd5551-bab4-4127-9f24-107629936fc1')
ON CONFLICT (code) DO UPDATE SET body_template = EXCLUDED.body_template, is_active = true;

INSERT INTO public.letter_templates (id, name, code, category, subject, body_template, available_variables, is_active, requires_approval, created_by)
VALUES 
('c2d3e4f5-a6b7-8901-cdef-2345678901bc', 'Disciplinary Warning Letter', 'disciplinary_warning_letter', 'employment', 'Disciplinary Warning Notice',
'Date: {{current_date}}

To: {{employee_name}}
Position: {{current_position}}
Department: {{department_name}}

Subject: {{warning_level}} Warning

Dear {{employee_name}},

This letter confirms the outcome of the disciplinary meeting held on {{meeting_date}}.

Nature of Issue: {{issue_description}}
Policy Violated: {{policy_violated}}

This warning will remain on your file for {{warning_validity_months}} months.

Employee Acknowledgment:
I acknowledge receipt of this disciplinary warning.

_________________________     _______________
Employee Signature             Date',
'["current_date", "employee_name", "current_position", "department_name", "warning_level", "meeting_date", "issue_description", "policy_violated", "warning_validity_months"]'::jsonb,
true, false, 'e1cd5551-bab4-4127-9f24-107629936fc1')
ON CONFLICT (code) DO UPDATE SET body_template = EXCLUDED.body_template, is_active = true;

-- Create workflow templates
INSERT INTO public.workflow_templates (id, name, code, category, description, is_global, is_active, requires_signature, requires_letter, letter_template_id, created_by)
VALUES 
('e4f5a6b7-c8d9-0123-efab-4567890123de', 'PIP Acknowledgment', 'PIP_ACKNOWLEDGMENT', 'performance', 'Workflow for PIP acknowledgment', true, true, true, true, 'b1c2d3e4-f5a6-7890-bcde-1234567890ab', 'e1cd5551-bab4-4127-9f24-107629936fc1'),
('f5a6b7c8-d9e0-1234-fabc-5678901234ef', 'Disciplinary Acknowledgment', 'DISCIPLINARY_ACKNOWLEDGMENT', 'termination', 'Workflow for disciplinary acknowledgment', true, true, true, true, 'c2d3e4f5-a6b7-8901-cdef-2345678901bc', 'e1cd5551-bab4-4127-9f24-107629936fc1'),
('a6b7c8d9-e0f1-2345-abcd-6789012345fa', 'Promotion Acknowledgment', 'PROMOTION_ACKNOWLEDGMENT', 'promotion', 'Workflow for promotion acknowledgment', true, true, true, true, '56c4d636-10bb-45b1-8efc-24e7fce437b3', 'e1cd5551-bab4-4127-9f24-107629936fc1')
ON CONFLICT (code) DO UPDATE SET requires_signature = true, requires_letter = true, is_active = true;

-- Create workflow steps with valid approver_type 'employee'
INSERT INTO public.workflow_steps (template_id, step_order, name, description, approver_type, requires_signature)
SELECT 'e4f5a6b7-c8d9-0123-efab-4567890123de', 1, 'Employee Acknowledgment', 'Employee acknowledges receipt', 'employee', true
WHERE NOT EXISTS (SELECT 1 FROM workflow_steps WHERE template_id = 'e4f5a6b7-c8d9-0123-efab-4567890123de' AND step_order = 1);

INSERT INTO public.workflow_steps (template_id, step_order, name, description, approver_type, requires_signature)
SELECT 'f5a6b7c8-d9e0-1234-fabc-5678901234ef', 1, 'Employee Acknowledgment', 'Employee acknowledges receipt', 'employee', true
WHERE NOT EXISTS (SELECT 1 FROM workflow_steps WHERE template_id = 'f5a6b7c8-d9e0-1234-fabc-5678901234ef' AND step_order = 1);

INSERT INTO public.workflow_steps (template_id, step_order, name, description, approver_type, requires_signature)
SELECT 'a6b7c8d9-e0f1-2345-abcd-6789012345fa', 1, 'Employee Acceptance', 'Employee accepts promotion', 'employee', true
WHERE NOT EXISTS (SELECT 1 FROM workflow_steps WHERE template_id = 'a6b7c8d9-e0f1-2345-abcd-6789012345fa' AND step_order = 1);