-- Add missing MSS module permission definitions for complete appraisal & performance coverage
-- Get the max display_order for MSS to continue from there
DO $$
DECLARE
  max_order INT;
BEGIN
  SELECT COALESCE(MAX(display_order), 130) INTO max_order FROM module_permissions WHERE module_code = 'mss';

  -- Insert missing permission definitions (ON CONFLICT to avoid duplicates)
  INSERT INTO module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
  VALUES
    -- Performance & Development
    ('mss', 'Manager Self-Service', 'appraisals', 'Team Appraisals', max_order + 1, true),
    ('mss', 'Manager Self-Service', 'appraisal_interviews', 'Appraisal Interviews', max_order + 2, true),
    ('mss', 'Manager Self-Service', 'goals', 'Team Goals', max_order + 3, true),
    ('mss', 'Manager Self-Service', 'goal_interviews', 'Goal Interviews', max_order + 4, true),
    ('mss', 'Manager Self-Service', 'feedback_360', '360 Feedback', max_order + 5, true),
    ('mss', 'Manager Self-Service', 'calibration', 'Calibration', max_order + 6, true),
    ('mss', 'Manager Self-Service', 'pips', 'Performance Improvement', max_order + 7, true),
    ('mss', 'Manager Self-Service', 'feedback', 'Continuous Feedback', max_order + 8, true),
    ('mss', 'Manager Self-Service', 'recognition', 'Recognition', max_order + 9, true),
    ('mss', 'Manager Self-Service', 'development', 'Development Plans', max_order + 10, true),
    ('mss', 'Manager Self-Service', 'succession', 'Succession Planning', max_order + 11, true),
    -- Team Management
    ('mss', 'Manager Self-Service', 'onboarding', 'Team Onboarding', max_order + 12, true),
    ('mss', 'Manager Self-Service', 'offboarding', 'Team Offboarding', max_order + 13, true),
    -- Approvals & Attendance
    ('mss', 'Manager Self-Service', 'delegates', 'My Delegates', max_order + 14, true),
    ('mss', 'Manager Self-Service', 'time_attendance', 'Team Time & Attendance', max_order + 15, true),
    -- Team Resources
    ('mss', 'Manager Self-Service', 'benefits', 'Team Benefits', max_order + 16, true),
    ('mss', 'Manager Self-Service', 'compensation', 'Team Compensation', max_order + 17, true),
    ('mss', 'Manager Self-Service', 'compa_ratio', 'Compa-Ratio Analysis', max_order + 18, true),
    ('mss', 'Manager Self-Service', 'equity', 'Equity & Stock', max_order + 19, true),
    ('mss', 'Manager Self-Service', 'property', 'Team Property', max_order + 20, true),
    ('mss', 'Manager Self-Service', 'relations', 'Employee Relations', max_order + 21, true),
    ('mss', 'Manager Self-Service', 'hse', 'Health, Safety & Environment', max_order + 22, true),
    -- Analytics & Support
    ('mss', 'Manager Self-Service', 'reminders', 'Team Reminders', max_order + 23, true),
    ('mss', 'Manager Self-Service', 'tickets', 'Submit Ticket', max_order + 24, true)
  ON CONFLICT (module_code, tab_code) DO UPDATE SET
    tab_name = EXCLUDED.tab_name,
    is_active = true;
END $$;

-- Seed default full-access permissions for HR Manager and Administrator roles on all new MSS tabs
INSERT INTO role_permissions (role_id, module_permission_id, can_view, can_create, can_edit, can_delete)
SELECT r.id, mp.id, true, true, true, true
FROM roles r
CROSS JOIN module_permissions mp
WHERE r.code IN ('hr_manager', 'administrator', 'system_admin')
  AND mp.module_code = 'mss'
  AND mp.is_active = true
ON CONFLICT (role_id, module_permission_id) DO NOTHING;