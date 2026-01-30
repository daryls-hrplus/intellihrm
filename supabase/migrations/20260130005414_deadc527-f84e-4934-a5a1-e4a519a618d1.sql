-- =====================================================
-- Seed Industry-Standard Performance Appraisal Workflow Templates
-- Based on SAP SuccessFactors, Workday, Oracle HCM patterns
-- =====================================================

-- Phase 1: Add missing transaction types for appraisals
INSERT INTO lookup_values (category, code, name, description, is_active)
VALUES 
  ('transaction_type', 'PERF_APPRAISAL_ACKNOWLEDGMENT', 'Appraisal Acknowledgment', 'Employee acknowledgment of performance appraisal results', true),
  ('transaction_type', 'PERF_CALIBRATION_APPROVAL', 'Calibration Session Approval', 'Approval for calibration session outcomes', true)
ON CONFLICT (category, code) DO NOTHING;

-- Phase 2: Seed 5 Industry-Standard Appraisal Workflow Templates
-- Use existing system user for created_by

-- Template 1: Performance Rating Approval (Manager → Skip-Level → HR)
INSERT INTO workflow_templates (
  name, code, description, category, is_global, is_active, created_by
) 
SELECT
  'Performance Rating Approval',
  'PERF_RATING_APPROVAL',
  'Multi-level approval for manager-submitted performance ratings. Routes through skip-level manager and HR for governance before release to employee.',
  'rating_approval'::workflow_category,
  true,
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM workflow_templates WHERE code = 'PERF_RATING_APPROVAL' AND is_global = true);

-- Template 2: Rating Release Approval (HR Review before Employee Visibility)
INSERT INTO workflow_templates (
  name, code, description, category, is_global, is_active, created_by
)
SELECT
  'Rating Release Approval',
  'PERF_RATING_RELEASE',
  'HR review and approval before performance ratings are released and visible to employees. Ensures consistency and compliance before disclosure.',
  'rating_release_approval'::workflow_category,
  true,
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM workflow_templates WHERE code = 'PERF_RATING_RELEASE' AND is_global = true);

-- Template 3: Appraisal Acknowledgment (Employee Acknowledgment)
INSERT INTO workflow_templates (
  name, code, description, category, is_global, is_active, requires_signature, created_by
)
SELECT
  'Appraisal Acknowledgment',
  'PERF_APPRAISAL_ACK',
  'Employee acknowledgment of performance appraisal results. Tracks formal receipt and agreement with documented ratings.',
  'performance'::workflow_category,
  true,
  true,
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM workflow_templates WHERE code = 'PERF_APPRAISAL_ACK' AND is_global = true);

-- Template 4: Calibration Session Approval (HR/Leadership Review)
INSERT INTO workflow_templates (
  name, code, description, category, is_global, is_active, created_by
)
SELECT
  'Calibration Session Approval',
  'PERF_CALIBRATION_APPROVAL',
  'Approval for calibration session outcomes. Ensures rating distributions and adjustments are reviewed by HR and senior leadership before finalization.',
  'calibration_approval'::workflow_category,
  true,
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM workflow_templates WHERE code = 'PERF_CALIBRATION_APPROVAL' AND is_global = true);

-- Template 5: PIP Acknowledgment (Employee Acknowledgment of Performance Improvement Plan)
INSERT INTO workflow_templates (
  name, code, description, category, is_global, is_active, requires_signature, created_by
)
SELECT
  'PIP Acknowledgment',
  'PERF_PIP_ACK',
  'Employee acknowledgment of Performance Improvement Plan terms and objectives. Captures formal acceptance and commitment to improvement goals.',
  'pip_acknowledgment'::workflow_category,
  true,
  true,
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM workflow_templates WHERE code = 'PERF_PIP_ACK' AND is_global = true);

-- Phase 3: Insert Workflow Steps for each template

-- Steps for Performance Rating Approval (2 steps: Skip-Level Manager → HR)
INSERT INTO workflow_steps (
  template_id, step_order, name, approver_type,
  sla_warning_hours, sla_critical_hours, 
  use_reporting_line, requires_signature, requires_comment
)
SELECT 
  t.id, 1, 'Skip-Level Manager Review', 'manager',
  48, 72,
  true, false, true
FROM workflow_templates t WHERE t.code = 'PERF_RATING_APPROVAL' AND t.is_global = true
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = t.id AND ws.step_order = 1);

INSERT INTO workflow_steps (
  template_id, step_order, name, approver_type,
  sla_warning_hours, sla_critical_hours,
  requires_signature, requires_comment
)
SELECT 
  t.id, 2, 'HR Representative Review', 'hr',
  36, 48,
  false, true
FROM workflow_templates t WHERE t.code = 'PERF_RATING_APPROVAL' AND t.is_global = true
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = t.id AND ws.step_order = 2);

-- Steps for Rating Release Approval (1 step: HR)
INSERT INTO workflow_steps (
  template_id, step_order, name, approver_type,
  sla_warning_hours, sla_critical_hours,
  requires_signature, requires_comment
)
SELECT 
  t.id, 1, 'HR Review & Release', 'hr',
  48, 72,
  false, false
FROM workflow_templates t WHERE t.code = 'PERF_RATING_RELEASE' AND t.is_global = true
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = t.id AND ws.step_order = 1);

-- Steps for Appraisal Acknowledgment (1 step: Employee)
INSERT INTO workflow_steps (
  template_id, step_order, name, approver_type,
  sla_warning_hours, sla_critical_hours,
  requires_signature, requires_comment
)
SELECT 
  t.id, 1, 'Employee Acknowledgment', 'employee',
  72, 120,
  true, false
FROM workflow_templates t WHERE t.code = 'PERF_APPRAISAL_ACK' AND t.is_global = true
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = t.id AND ws.step_order = 1);

-- Steps for Calibration Session Approval (2 steps: HR Manager → Senior Leadership)
INSERT INTO workflow_steps (
  template_id, step_order, name, approver_type,
  sla_warning_hours, sla_critical_hours,
  requires_signature, requires_comment
)
SELECT 
  t.id, 1, 'HR Manager Review', 'hr',
  48, 72,
  false, true
FROM workflow_templates t WHERE t.code = 'PERF_CALIBRATION_APPROVAL' AND t.is_global = true
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = t.id AND ws.step_order = 1);

INSERT INTO workflow_steps (
  template_id, step_order, name, approver_type,
  sla_warning_hours, sla_critical_hours,
  requires_signature, requires_comment
)
SELECT 
  t.id, 2, 'Senior Leadership Approval', 'role',
  24, 48,
  true, true
FROM workflow_templates t WHERE t.code = 'PERF_CALIBRATION_APPROVAL' AND t.is_global = true
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = t.id AND ws.step_order = 2);

-- Steps for PIP Acknowledgment (1 step: Employee)
INSERT INTO workflow_steps (
  template_id, step_order, name, approver_type,
  sla_warning_hours, sla_critical_hours,
  requires_signature, requires_comment
)
SELECT 
  t.id, 1, 'Employee PIP Acknowledgment', 'employee',
  48, 72,
  true, true
FROM workflow_templates t WHERE t.code = 'PERF_PIP_ACK' AND t.is_global = true
AND NOT EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = t.id AND ws.step_order = 1);