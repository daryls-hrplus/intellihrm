-- Create default succession readiness workflow template with system user
INSERT INTO workflow_templates (
  name, code, category, description, is_global, is_active, requires_signature, created_by
) VALUES (
  'Succession Readiness Assessment Approval',
  'SUCCESSION_READINESS_APPROVAL',
  'succession_approval',
  'Multi-assessor readiness assessment workflow for succession candidates',
  true,
  true,
  false,
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (code) DO NOTHING;

-- Add workflow steps (Manager assesses first, then HR reviews)
INSERT INTO workflow_steps (
  template_id,
  step_order,
  name,
  approver_type,
  use_reporting_line,
  can_delegate,
  is_active
) SELECT 
  id, 1, 'Manager Assessment', 'manager', true, true, true
FROM workflow_templates WHERE code = 'SUCCESSION_READINESS_APPROVAL'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_steps (
  template_id,
  step_order,
  name,
  approver_type,
  can_delegate,
  is_active
) SELECT 
  id, 2, 'HR Final Review', 'hr', false, true
FROM workflow_templates WHERE code = 'SUCCESSION_READINESS_APPROVAL'
ON CONFLICT DO NOTHING;

-- Ensure the transaction type exists in lookup_values
INSERT INTO lookup_values (category, code, name, description, display_order, is_active)
VALUES (
  'transaction_type',
  'SUCC_READINESS_APPROVAL',
  'Succession Readiness Approval',
  'Approval workflow for succession candidate readiness assessments',
  100,
  true
) ON CONFLICT (category, code) DO NOTHING;