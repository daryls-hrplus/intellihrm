-- =====================================================
-- Seed Industry-Standard Workflow Steps for Performance & Succession
-- =====================================================

-- Continuous Feedback Approval (Manager → HR optional)
INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 1, 'Manager Review', 'reporting_manager', 'Direct manager reviews the feedback submission'
FROM workflow_templates WHERE code = 'PERF_CONTINUOUS_FEEDBACK' AND is_global = true
ON CONFLICT DO NOTHING;

INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 2, 'HR Partner Review', 'hr_partner', 'HR Partner reviews if escalated'
FROM workflow_templates WHERE code = 'PERF_CONTINUOUS_FEEDBACK' AND is_global = true
ON CONFLICT DO NOTHING;

-- Mid-Cycle Review Approval (Skip-Level → HR Partner)
INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 1, 'Skip-Level Manager Review', 'skip_level_manager', 'Skip-level manager reviews mid-cycle assessment'
FROM workflow_templates WHERE code = 'PERF_MIDCYCLE_REVIEW' AND is_global = true
ON CONFLICT DO NOTHING;

INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 2, 'HR Partner Approval', 'hr_partner', 'HR Partner approves mid-cycle review'
FROM workflow_templates WHERE code = 'PERF_MIDCYCLE_REVIEW' AND is_global = true
ON CONFLICT DO NOTHING;

-- PIP Extension Request (HR Partner → HR Director)
INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 1, 'HR Partner Review', 'hr_partner', 'HR Partner reviews extension request'
FROM workflow_templates WHERE code = 'PERF_PIP_EXTENSION' AND is_global = true
ON CONFLICT DO NOTHING;

INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 2, 'HR Director Approval', 'specific_role', 'HR Director approves PIP extension'
FROM workflow_templates WHERE code = 'PERF_PIP_EXTENSION' AND is_global = true
ON CONFLICT DO NOTHING;

-- PIP Closure Approval (HR Partner → Employee Relations)
INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 1, 'HR Partner Review', 'hr_partner', 'HR Partner reviews PIP outcome documentation'
FROM workflow_templates WHERE code = 'PERF_PIP_CLOSURE' AND is_global = true
ON CONFLICT DO NOTHING;

INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 2, 'Employee Relations Review', 'specific_role', 'Employee Relations/Legal reviews for compliance'
FROM workflow_templates WHERE code = 'PERF_PIP_CLOSURE' AND is_global = true
ON CONFLICT DO NOTHING;

-- Appraisal Re-Open Request (HR Manager → HR Director → System Admin)
INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 1, 'HR Manager Review', 'hr_partner', 'HR Manager reviews reopen justification'
FROM workflow_templates WHERE code = 'PERF_APPRAISAL_REOPEN' AND is_global = true
ON CONFLICT DO NOTHING;

INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 2, 'HR Director Approval', 'specific_role', 'HR Director approves the reopen request'
FROM workflow_templates WHERE code = 'PERF_APPRAISAL_REOPEN' AND is_global = true
ON CONFLICT DO NOTHING;

INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 3, 'System Unlock', 'specific_role', 'System Admin unlocks the appraisal record'
FROM workflow_templates WHERE code = 'PERF_APPRAISAL_REOPEN' AND is_global = true
ON CONFLICT DO NOTHING;

-- Key Position Designation (Department Head → CHRO)
INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 1, 'Department Head Review', 'department_head', 'Department Head proposes position criticality'
FROM workflow_templates WHERE code = 'SUCC_KEY_POSITION' AND is_global = true
ON CONFLICT DO NOTHING;

INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 2, 'CHRO Approval', 'specific_role', 'CHRO approves key position designation'
FROM workflow_templates WHERE code = 'SUCC_KEY_POSITION' AND is_global = true
ON CONFLICT DO NOTHING;

-- Bench Strength Review (HR Partner → CHRO)
INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 1, 'HR Partner Assessment', 'hr_partner', 'HR Partner validates succession coverage data'
FROM workflow_templates WHERE code = 'SUCC_BENCH_REVIEW' AND is_global = true
ON CONFLICT DO NOTHING;

INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 2, 'CHRO Sign-off', 'specific_role', 'CHRO signs off on bench strength assessment'
FROM workflow_templates WHERE code = 'SUCC_BENCH_REVIEW' AND is_global = true
ON CONFLICT DO NOTHING;

-- Flight Risk Acknowledgment (Single step - Manager)
INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 1, 'Manager Acknowledgment', 'reporting_manager', 'Manager acknowledges flight risk alert and commits to action'
FROM workflow_templates WHERE code = 'SUCC_FLIGHT_RISK_ACK' AND is_global = true
ON CONFLICT DO NOTHING;

-- Retention Action Approval (HR Partner → Finance → CHRO)
INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 1, 'HR Partner Review', 'hr_partner', 'HR Partner validates retention proposal'
FROM workflow_templates WHERE code = 'SUCC_RETENTION_ACTION' AND is_global = true
ON CONFLICT DO NOTHING;

INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 2, 'Finance Review', 'specific_role', 'Finance reviews budget impact'
FROM workflow_templates WHERE code = 'SUCC_RETENTION_ACTION' AND is_global = true
ON CONFLICT DO NOTHING;

INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 3, 'CHRO Approval', 'specific_role', 'CHRO approves retention package'
FROM workflow_templates WHERE code = 'SUCC_RETENTION_ACTION' AND is_global = true
ON CONFLICT DO NOTHING;

-- Nine-Box Placement Override (Calibration Committee → HR Director)
INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 1, 'Calibration Committee Review', 'specific_role', 'Calibration committee reviews override justification'
FROM workflow_templates WHERE code = 'SUCC_NINEBOX_OVERRIDE' AND is_global = true
ON CONFLICT DO NOTHING;

INSERT INTO workflow_steps (template_id, step_order, name, approver_type, description)
SELECT id, 2, 'HR Director Approval', 'specific_role', 'HR Director approves the placement override'
FROM workflow_templates WHERE code = 'SUCC_NINEBOX_OVERRIDE' AND is_global = true
ON CONFLICT DO NOTHING;