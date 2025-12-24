
-- =====================================================
-- PHASE 1: Create ALL missing canonical modules first
-- =====================================================

-- Insert all 25 canonical modules (will skip existing ones via ON CONFLICT)
INSERT INTO application_modules (module_code, module_name, description, icon_name, route_path, display_order, is_active, parent_module_code)
VALUES 
  ('hr_hub', 'HR Hub', 'Central HR dashboard and navigation', 'LayoutDashboard', '/hr-hub', 1, true, NULL),
  ('dashboard', 'Dashboard', 'Analytics and insights dashboard', 'BarChart3', '/dashboard', 2, true, NULL),
  ('ess', 'Employee Self-Service', 'Employee self-service portal', 'User', '/ess', 3, true, NULL),
  ('mss', 'Manager Self-Service', 'Manager self-service portal', 'UserCog', '/mss', 4, true, NULL),
  ('workforce', 'Workforce', 'Core HR and workforce management', 'Users', '/workforce', 5, true, NULL),
  ('onboarding', 'Onboarding', 'New hire onboarding management', 'UserPlus', '/workforce/onboarding', 6, true, 'workforce'),
  ('offboarding', 'Offboarding', 'Employee exit and offboarding management', 'UserMinus', '/workforce/offboarding', 7, true, 'workforce'),
  ('recruitment', 'Recruitment', 'Talent acquisition and hiring', 'Briefcase', '/recruitment', 8, true, NULL),
  ('performance', 'Performance', 'Performance management system', 'TrendingUp', '/performance', 9, true, NULL),
  ('goals', 'Goals', 'Goal setting and tracking', 'Target', '/performance/goals', 10, true, 'performance'),
  ('appraisals', 'Appraisals', 'Performance appraisal cycles and evaluations', 'ClipboardCheck', '/performance/appraisals', 11, true, 'performance'),
  ('360_feedback', '360 Feedback', 'Multi-rater feedback and assessments', 'Users', '/performance/360-feedback', 12, true, 'performance'),
  ('learning', 'Learning', 'Learning management system', 'GraduationCap', '/learning', 13, true, NULL),
  ('succession', 'Succession', 'Succession planning and talent pools', 'GitBranch', '/succession', 14, true, NULL),
  ('compensation', 'Compensation', 'Compensation and salary management', 'DollarSign', '/compensation', 15, true, NULL),
  ('benefits', 'Benefits', 'Employee benefits administration', 'Heart', '/benefits', 16, true, NULL),
  ('payroll', 'Payroll', 'Payroll processing and management', 'Wallet', '/payroll', 17, true, NULL),
  ('time_attendance', 'Time & Attendance', 'Time tracking and attendance management', 'Clock', '/time-attendance', 18, true, NULL),
  ('scheduling', 'Scheduling', 'Work schedule management', 'Calendar', '/scheduling', 19, true, NULL),
  ('leave', 'Leave', 'Leave and absence management', 'CalendarOff', '/leave', 20, true, NULL),
  ('employee_relations', 'Employee Relations', 'Employee relations and compliance', 'Scale', '/employee-relations', 21, true, NULL),
  ('safety', 'Safety', 'Health and safety management', 'Shield', '/safety', 22, true, NULL),
  ('company_property', 'Company Property', 'Asset and property management', 'Package', '/company-property', 23, true, NULL),
  ('analytics', 'Analytics', 'HR analytics and reporting', 'LineChart', '/analytics', 24, true, NULL),
  ('admin', 'Administration', 'System administration and settings', 'Settings', '/admin', 25, true, NULL)
ON CONFLICT (module_code) DO UPDATE SET
  parent_module_code = EXCLUDED.parent_module_code,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- =====================================================
-- PHASE 2: Remap features - now all canonical modules exist
-- =====================================================

-- Remap training → learning
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'learning'),
    module_code = 'learning'
WHERE module_code = 'training';

-- Remap ai_insights, api_management, etc → admin
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'admin'),
    module_code = 'admin'
WHERE module_code IN ('ai_insights', 'api_management', 'audit_logs', 'security_settings', 'system_config', 'workflow', 'data_export', 'report_builder', 'ai_governance', 'ai_assistant', 'enablement');

-- Remap leave_mgmt → leave
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'leave'),
    module_code = 'leave'
WHERE module_code = 'leave_mgmt';

-- Remap dashboards, insights, reporting → dashboard
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'dashboard'),
    module_code = 'dashboard'
WHERE module_code IN ('dashboards', 'insights', 'reporting');

-- Remap property → company_property
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'company_property'),
    module_code = 'company_property'
WHERE module_code = 'property';

-- Remap org_design, scenario_planning, strategic, core_hr, people → workforce
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'workforce'),
    module_code = 'workforce'
WHERE module_code IN ('org_design', 'scenario_planning', 'strategic', 'core_hr', 'people');

-- Remap multi_country_rules, tax_config, statutory_reporting → payroll
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'payroll'),
    module_code = 'payroll'
WHERE module_code IN ('multi_country_rules', 'tax_config', 'statutory_reporting');

-- Remap labor_law, disciplinary, grievance, compliance → employee_relations
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'employee_relations'),
    module_code = 'employee_relations'
WHERE module_code IN ('labor_law', 'disciplinary', 'grievance', 'compliance');

-- Remap talent → performance
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'performance'),
    module_code = 'performance'
WHERE module_code = 'talent';

-- Remap hiring → recruitment
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'recruitment'),
    module_code = 'recruitment'
WHERE module_code = 'hiring';

-- Remap salary → compensation
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'compensation'),
    module_code = 'compensation'
WHERE module_code = 'salary';

-- Remap timekeeping → time_attendance
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'time_attendance'),
    module_code = 'time_attendance'
WHERE module_code = 'timekeeping';

-- Remap health_safety, osha → safety
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'safety'),
    module_code = 'safety'
WHERE module_code IN ('health_safety', 'osha');

-- Remap career_planning → succession
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'succession'),
    module_code = 'succession'
WHERE module_code = 'career_planning';

-- =====================================================
-- PHASE 3: Update enablement_content_status with same remapping
-- =====================================================

UPDATE enablement_content_status SET module_code = 'learning' WHERE module_code = 'training';
UPDATE enablement_content_status SET module_code = 'admin' WHERE module_code IN ('ai_insights', 'api_management', 'audit_logs', 'security_settings', 'system_config', 'workflow', 'data_export', 'report_builder', 'ai_governance', 'ai_assistant', 'enablement');
UPDATE enablement_content_status SET module_code = 'leave' WHERE module_code = 'leave_mgmt';
UPDATE enablement_content_status SET module_code = 'dashboard' WHERE module_code IN ('dashboards', 'insights', 'reporting');
UPDATE enablement_content_status SET module_code = 'company_property' WHERE module_code = 'property';
UPDATE enablement_content_status SET module_code = 'workforce' WHERE module_code IN ('org_design', 'scenario_planning', 'strategic', 'core_hr', 'people');
UPDATE enablement_content_status SET module_code = 'payroll' WHERE module_code IN ('multi_country_rules', 'tax_config', 'statutory_reporting');
UPDATE enablement_content_status SET module_code = 'employee_relations' WHERE module_code IN ('labor_law', 'disciplinary', 'grievance', 'compliance');
UPDATE enablement_content_status SET module_code = 'performance' WHERE module_code = 'talent';
UPDATE enablement_content_status SET module_code = 'recruitment' WHERE module_code = 'hiring';
UPDATE enablement_content_status SET module_code = 'compensation' WHERE module_code = 'salary';
UPDATE enablement_content_status SET module_code = 'time_attendance' WHERE module_code = 'timekeeping';
UPDATE enablement_content_status SET module_code = 'safety' WHERE module_code IN ('health_safety', 'osha');
UPDATE enablement_content_status SET module_code = 'succession' WHERE module_code = 'career_planning';

-- =====================================================
-- PHASE 4: Delete non-canonical modules
-- =====================================================

DELETE FROM application_modules 
WHERE module_code NOT IN (
  'admin', 'leave', 'dashboard', 'company_property', 'workforce', 'payroll', 
  'employee_relations', 'performance', 'learning', 'recruitment', 'compensation', 
  'benefits', 'time_attendance', 'scheduling', 'safety', 'succession', 'analytics', 
  'ess', 'mss', 'hr_hub', 'onboarding', 'offboarding', 'goals', 'appraisals', '360_feedback'
)
AND NOT EXISTS (
  SELECT 1 FROM application_features af WHERE af.module_id = application_modules.id
);
