-- First, add container_code column to module_permissions for hierarchical organization
ALTER TABLE public.module_permissions ADD COLUMN IF NOT EXISTS container_code TEXT;
ALTER TABLE public.module_permissions ADD COLUMN IF NOT EXISTS is_container BOOLEAN DEFAULT false;

-- Clear existing admin module permissions and rebuild with container hierarchy
DELETE FROM public.module_permissions WHERE module_code = 'admin';

-- Insert Admin module with container-based hierarchy
-- Admin Module Level
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active, container_code, is_container)
VALUES ('admin', 'Administration', NULL, NULL, 1000, true, NULL, false);

-- CONTAINER: Organization & Structure
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active, container_code, is_container)
VALUES 
  ('admin', 'Administration', 'org_structure', 'Organization & Structure', 1001, true, NULL, true),
  ('admin', 'Administration', 'companies', 'Companies', 1002, true, 'org_structure', false),
  ('admin', 'Administration', 'company_groups', 'Company Groups', 1003, true, 'org_structure', false),
  ('admin', 'Administration', 'divisions', 'Divisions', 1004, true, 'org_structure', false),
  ('admin', 'Administration', 'departments', 'Departments', 1005, true, 'org_structure', false),
  ('admin', 'Administration', 'sections', 'Sections', 1006, true, 'org_structure', false),
  ('admin', 'Administration', 'positions', 'Positions', 1007, true, 'org_structure', false),
  ('admin', 'Administration', 'org_chart', 'Organization Chart', 1008, true, 'org_structure', false),
  ('admin', 'Administration', 'territories', 'Territories', 1009, true, 'org_structure', false);

-- CONTAINER: Users, Roles & Access
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active, container_code, is_container)
VALUES 
  ('admin', 'Administration', 'users_roles_access', 'Users, Roles & Access', 1010, true, NULL, true),
  ('admin', 'Administration', 'users', 'User Management', 1011, true, 'users_roles_access', false),
  ('admin', 'Administration', 'roles', 'Role Management', 1012, true, 'users_roles_access', false),
  ('admin', 'Administration', 'role_permissions', 'Role Permissions', 1013, true, 'users_roles_access', false),
  ('admin', 'Administration', 'permissions', 'Granular Permissions', 1014, true, 'users_roles_access', false),
  ('admin', 'Administration', 'access_requests', 'Access Requests', 1015, true, 'users_roles_access', false),
  ('admin', 'Administration', 'auto_approval', 'Auto-Approval Rules', 1016, true, 'users_roles_access', false),
  ('admin', 'Administration', 'pii_access', 'PII Access Control', 1017, true, 'users_roles_access', false);

-- CONTAINER: Security & Governance
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active, container_code, is_container)
VALUES 
  ('admin', 'Administration', 'security_governance', 'Security & Governance', 1020, true, NULL, true),
  ('admin', 'Administration', 'security_settings', 'Security Settings', 1021, true, 'security_governance', false),
  ('admin', 'Administration', 'audit_logs', 'Audit Logs', 1022, true, 'security_governance', false),
  ('admin', 'Administration', 'session_management', 'Session Management', 1023, true, 'security_governance', false),
  ('admin', 'Administration', 'mfa_config', 'MFA Configuration', 1024, true, 'security_governance', false),
  ('admin', 'Administration', 'password_policies', 'Password Policies', 1025, true, 'security_governance', false),
  ('admin', 'Administration', 'ip_restrictions', 'IP Restrictions', 1026, true, 'security_governance', false);

-- CONTAINER: System & Platform Configuration
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active, container_code, is_container)
VALUES 
  ('admin', 'Administration', 'system_platform_config', 'System & Platform Configuration', 1030, true, NULL, true),
  ('admin', 'Administration', 'system_settings', 'System Settings', 1031, true, 'system_platform_config', false),
  ('admin', 'Administration', 'branding', 'Branding Configuration', 1032, true, 'system_platform_config', false),
  ('admin', 'Administration', 'email_templates', 'Email Templates', 1033, true, 'system_platform_config', false),
  ('admin', 'Administration', 'notifications', 'Notification Settings', 1034, true, 'system_platform_config', false),
  ('admin', 'Administration', 'integrations', 'Integrations', 1035, true, 'system_platform_config', false),
  ('admin', 'Administration', 'api_keys', 'API Keys', 1036, true, 'system_platform_config', false),
  ('admin', 'Administration', 'webhooks', 'Webhooks', 1037, true, 'system_platform_config', false),
  ('admin', 'Administration', 'ai_settings', 'AI Settings', 1038, true, 'system_platform_config', false),
  ('admin', 'Administration', 'ai_usage', 'AI Usage & Budgets', 1039, true, 'system_platform_config', false);

-- CONTAINER: Strategic Planning & Analytics
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active, container_code, is_container)
VALUES 
  ('admin', 'Administration', 'strategic_analytics', 'Strategic Planning & Analytics', 1040, true, NULL, true),
  ('admin', 'Administration', 'workforce_analytics', 'Workforce Analytics', 1041, true, 'strategic_analytics', false),
  ('admin', 'Administration', 'dashboards', 'Custom Dashboards', 1042, true, 'strategic_analytics', false),
  ('admin', 'Administration', 'reports', 'Report Builder', 1043, true, 'strategic_analytics', false),
  ('admin', 'Administration', 'kpi_management', 'KPI Management', 1044, true, 'strategic_analytics', false),
  ('admin', 'Administration', 'scenario_planning', 'Scenario Planning', 1045, true, 'strategic_analytics', false);

-- CONTAINER: Compliance & Risk
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active, container_code, is_container)
VALUES 
  ('admin', 'Administration', 'compliance_risk', 'Compliance & Risk', 1050, true, NULL, true),
  ('admin', 'Administration', 'compliance_dashboard', 'Compliance Dashboard', 1051, true, 'compliance_risk', false),
  ('admin', 'Administration', 'risk_register', 'Risk Register', 1052, true, 'compliance_risk', false),
  ('admin', 'Administration', 'policy_management', 'Policy Management', 1053, true, 'compliance_risk', false),
  ('admin', 'Administration', 'regulatory_updates', 'Regulatory Updates', 1054, true, 'compliance_risk', false),
  ('admin', 'Administration', 'data_privacy', 'Data Privacy', 1055, true, 'compliance_risk', false);

-- CONTAINER: Documentation & Enablement
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active, container_code, is_container)
VALUES 
  ('admin', 'Administration', 'documentation_enablement', 'Documentation & Enablement', 1060, true, NULL, true),
  ('admin', 'Administration', 'help_center', 'Help Center', 1061, true, 'documentation_enablement', false),
  ('admin', 'Administration', 'knowledge_base', 'Knowledge Base', 1062, true, 'documentation_enablement', false),
  ('admin', 'Administration', 'training_materials', 'Training Materials', 1063, true, 'documentation_enablement', false),
  ('admin', 'Administration', 'release_notes', 'Release Notes', 1064, true, 'documentation_enablement', false),
  ('admin', 'Administration', 'user_guides', 'User Guides', 1065, true, 'documentation_enablement', false);

-- CONTAINER: Billing & Subscriptions
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active, container_code, is_container)
VALUES 
  ('admin', 'Administration', 'billing_subscriptions', 'Billing & Subscriptions', 1070, true, NULL, true),
  ('admin', 'Administration', 'subscription_plans', 'Subscription Plans', 1071, true, 'billing_subscriptions', false),
  ('admin', 'Administration', 'invoices', 'Invoices', 1072, true, 'billing_subscriptions', false),
  ('admin', 'Administration', 'payment_methods', 'Payment Methods', 1073, true, 'billing_subscriptions', false),
  ('admin', 'Administration', 'usage_billing', 'Usage & Billing', 1074, true, 'billing_subscriptions', false);

-- Now update other modules with their proper features/tabs

-- ESS Module
DELETE FROM public.module_permissions WHERE module_code = 'ess';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('ess', 'Employee Self-Service', NULL, NULL, 100, true),
  ('ess', 'Employee Self-Service', 'my_profile', 'My Profile', 101, true),
  ('ess', 'Employee Self-Service', 'my_leave', 'My Leave', 102, true),
  ('ess', 'Employee Self-Service', 'my_time', 'My Time & Attendance', 103, true),
  ('ess', 'Employee Self-Service', 'my_payslips', 'My Payslips', 104, true),
  ('ess', 'Employee Self-Service', 'my_benefits', 'My Benefits', 105, true),
  ('ess', 'Employee Self-Service', 'my_documents', 'My Documents', 106, true),
  ('ess', 'Employee Self-Service', 'my_training', 'My Training', 107, true),
  ('ess', 'Employee Self-Service', 'my_performance', 'My Performance', 108, true),
  ('ess', 'Employee Self-Service', 'my_career', 'My Career Path', 109, true),
  ('ess', 'Employee Self-Service', 'my_expenses', 'My Expenses', 110, true);

-- MSS Module
DELETE FROM public.module_permissions WHERE module_code = 'mss';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('mss', 'Manager Self-Service', NULL, NULL, 120, true),
  ('mss', 'Manager Self-Service', 'my_team', 'My Team', 121, true),
  ('mss', 'Manager Self-Service', 'team_leave', 'Team Leave', 122, true),
  ('mss', 'Manager Self-Service', 'team_time', 'Team Time & Attendance', 123, true),
  ('mss', 'Manager Self-Service', 'team_performance', 'Team Performance', 124, true),
  ('mss', 'Manager Self-Service', 'team_training', 'Team Training', 125, true),
  ('mss', 'Manager Self-Service', 'approvals', 'Approvals', 126, true),
  ('mss', 'Manager Self-Service', 'hiring_requests', 'Hiring Requests', 127, true),
  ('mss', 'Manager Self-Service', 'team_analytics', 'Team Analytics', 128, true);

-- Workforce Module
DELETE FROM public.module_permissions WHERE module_code = 'workforce';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('workforce', 'Workforce', NULL, NULL, 130, true),
  ('workforce', 'Workforce', 'employees', 'Employee Directory', 131, true),
  ('workforce', 'Workforce', 'employee_details', 'Employee Details', 132, true),
  ('workforce', 'Workforce', 'org_chart', 'Organization Chart', 133, true),
  ('workforce', 'Workforce', 'onboarding', 'Onboarding', 134, true),
  ('workforce', 'Workforce', 'offboarding', 'Offboarding', 135, true),
  ('workforce', 'Workforce', 'workforce_planning', 'Workforce Planning', 136, true),
  ('workforce', 'Workforce', 'headcount', 'Headcount Analysis', 137, true),
  ('workforce', 'Workforce', 'positions', 'Position Management', 138, true),
  ('workforce', 'Workforce', 'jobs', 'Job Catalog', 139, true);

-- Leave Module
DELETE FROM public.module_permissions WHERE module_code = 'leave';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('leave', 'Leave Management', NULL, NULL, 140, true),
  ('leave', 'Leave Management', 'leave_requests', 'Leave Requests', 141, true),
  ('leave', 'Leave Management', 'leave_calendar', 'Leave Calendar', 142, true),
  ('leave', 'Leave Management', 'leave_balances', 'Leave Balances', 143, true),
  ('leave', 'Leave Management', 'leave_policies', 'Leave Policies', 144, true),
  ('leave', 'Leave Management', 'leave_types', 'Leave Types', 145, true),
  ('leave', 'Leave Management', 'leave_approvals', 'Approvals', 146, true),
  ('leave', 'Leave Management', 'leave_reports', 'Leave Reports', 147, true),
  ('leave', 'Leave Management', 'holiday_calendar', 'Holiday Calendar', 148, true);

-- Compensation Module
DELETE FROM public.module_permissions WHERE module_code = 'compensation';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('compensation', 'Compensation', NULL, NULL, 150, true),
  ('compensation', 'Compensation', 'salary_structures', 'Salary Structures', 151, true),
  ('compensation', 'Compensation', 'pay_grades', 'Pay Grades', 152, true),
  ('compensation', 'Compensation', 'compensation_reviews', 'Compensation Reviews', 153, true),
  ('compensation', 'Compensation', 'merit_increases', 'Merit Increases', 154, true),
  ('compensation', 'Compensation', 'bonus_management', 'Bonus Management', 155, true),
  ('compensation', 'Compensation', 'market_benchmarking', 'Market Benchmarking', 156, true),
  ('compensation', 'Compensation', 'total_rewards', 'Total Rewards', 157, true);

-- Benefits Module
DELETE FROM public.module_permissions WHERE module_code = 'benefits';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('benefits', 'Benefits', NULL, NULL, 160, true),
  ('benefits', 'Benefits', 'benefit_plans', 'Benefit Plans', 161, true),
  ('benefits', 'Benefits', 'enrollments', 'Enrollments', 162, true),
  ('benefits', 'Benefits', 'claims', 'Claims', 163, true),
  ('benefits', 'Benefits', 'life_events', 'Life Events', 164, true),
  ('benefits', 'Benefits', 'providers', 'Benefit Providers', 165, true),
  ('benefits', 'Benefits', 'eligibility', 'Eligibility Rules', 166, true),
  ('benefits', 'Benefits', 'benefit_reports', 'Benefits Reports', 167, true);

-- Performance Module
DELETE FROM public.module_permissions WHERE module_code = 'performance';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('performance', 'Performance', NULL, NULL, 170, true),
  ('performance', 'Performance', 'appraisal_cycles', 'Appraisal Cycles', 171, true),
  ('performance', 'Performance', 'goals', 'Goals Management', 172, true),
  ('performance', 'Performance', 'competencies', 'Competencies', 173, true),
  ('performance', 'Performance', 'reviews', 'Performance Reviews', 174, true),
  ('performance', 'Performance', 'feedback_360', '360 Feedback', 175, true),
  ('performance', 'Performance', 'pip', 'Performance Improvement', 176, true),
  ('performance', 'Performance', 'calibration', 'Calibration', 177, true),
  ('performance', 'Performance', 'performance_analytics', 'Performance Analytics', 178, true);

-- Training Module
DELETE FROM public.module_permissions WHERE module_code = 'training';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('training', 'Training & LMS', NULL, NULL, 180, true),
  ('training', 'Training & LMS', 'courses', 'Course Catalog', 181, true),
  ('training', 'Training & LMS', 'learning_paths', 'Learning Paths', 182, true),
  ('training', 'Training & LMS', 'enrollments', 'Training Enrollments', 183, true),
  ('training', 'Training & LMS', 'certifications', 'Certifications', 184, true),
  ('training', 'Training & LMS', 'instructors', 'Instructors', 185, true),
  ('training', 'Training & LMS', 'training_calendar', 'Training Calendar', 186, true),
  ('training', 'Training & LMS', 'skills_matrix', 'Skills Matrix', 187, true),
  ('training', 'Training & LMS', 'training_reports', 'Training Reports', 188, true);

-- Succession Module
DELETE FROM public.module_permissions WHERE module_code = 'succession';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('succession', 'Succession Planning', NULL, NULL, 190, true),
  ('succession', 'Succession Planning', 'talent_pools', 'Talent Pools', 191, true),
  ('succession', 'Succession Planning', 'nine_box', '9-Box Grid', 192, true),
  ('succession', 'Succession Planning', 'succession_plans', 'Succession Plans', 193, true),
  ('succession', 'Succession Planning', 'key_positions', 'Key Positions', 194, true),
  ('succession', 'Succession Planning', 'development_plans', 'Development Plans', 195, true),
  ('succession', 'Succession Planning', 'readiness', 'Readiness Assessment', 196, true);

-- Recruitment Module
DELETE FROM public.module_permissions WHERE module_code = 'recruitment';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('recruitment', 'Recruitment', NULL, NULL, 200, true),
  ('recruitment', 'Recruitment', 'requisitions', 'Job Requisitions', 201, true),
  ('recruitment', 'Recruitment', 'candidates', 'Candidates', 202, true),
  ('recruitment', 'Recruitment', 'applications', 'Applications', 203, true),
  ('recruitment', 'Recruitment', 'interviews', 'Interviews', 204, true),
  ('recruitment', 'Recruitment', 'offers', 'Offers', 205, true),
  ('recruitment', 'Recruitment', 'job_postings', 'Job Postings', 206, true),
  ('recruitment', 'Recruitment', 'talent_pipeline', 'Talent Pipeline', 207, true),
  ('recruitment', 'Recruitment', 'recruitment_analytics', 'Recruitment Analytics', 208, true);

-- HSE Module
DELETE FROM public.module_permissions WHERE module_code = 'hse';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('hse', 'Health, Safety & Environment', NULL, NULL, 210, true),
  ('hse', 'Health, Safety & Environment', 'incidents', 'Incident Reports', 211, true),
  ('hse', 'Health, Safety & Environment', 'hazards', 'Hazard Register', 212, true),
  ('hse', 'Health, Safety & Environment', 'inspections', 'Inspections', 213, true),
  ('hse', 'Health, Safety & Environment', 'safety_training', 'Safety Training', 214, true),
  ('hse', 'Health, Safety & Environment', 'ppe_tracking', 'PPE Tracking', 215, true),
  ('hse', 'Health, Safety & Environment', 'wellness', 'Wellness Programs', 216, true),
  ('hse', 'Health, Safety & Environment', 'hse_reports', 'HSE Reports', 217, true);

-- Employee Relations Module
DELETE FROM public.module_permissions WHERE module_code = 'employee_relations';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('employee_relations', 'Employee Relations', NULL, NULL, 220, true),
  ('employee_relations', 'Employee Relations', 'grievances', 'Grievances', 221, true),
  ('employee_relations', 'Employee Relations', 'disciplinary', 'Disciplinary Actions', 222, true),
  ('employee_relations', 'Employee Relations', 'investigations', 'Investigations', 223, true),
  ('employee_relations', 'Employee Relations', 'union_management', 'Union Management', 224, true),
  ('employee_relations', 'Employee Relations', 'employee_engagement', 'Employee Engagement', 225, true),
  ('employee_relations', 'Employee Relations', 'exit_interviews', 'Exit Interviews', 226, true);

-- Property Module
DELETE FROM public.module_permissions WHERE module_code = 'property';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('property', 'Property & Assets', NULL, NULL, 230, true),
  ('property', 'Property & Assets', 'asset_register', 'Asset Register', 231, true),
  ('property', 'Property & Assets', 'asset_assignment', 'Asset Assignment', 232, true),
  ('property', 'Property & Assets', 'asset_maintenance', 'Asset Maintenance', 233, true),
  ('property', 'Property & Assets', 'asset_tracking', 'Asset Tracking', 234, true),
  ('property', 'Property & Assets', 'asset_disposal', 'Asset Disposal', 235, true);

-- Payroll Module
DELETE FROM public.module_permissions WHERE module_code = 'payroll';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('payroll', 'Payroll', NULL, NULL, 240, true),
  ('payroll', 'Payroll', 'payroll_runs', 'Payroll Runs', 241, true),
  ('payroll', 'Payroll', 'pay_elements', 'Pay Elements', 242, true),
  ('payroll', 'Payroll', 'payslips', 'Payslips', 243, true),
  ('payroll', 'Payroll', 'bank_files', 'Bank Files', 244, true),
  ('payroll', 'Payroll', 'tax_config', 'Tax Configuration', 245, true),
  ('payroll', 'Payroll', 'statutory_deductions', 'Statutory Deductions', 246, true),
  ('payroll', 'Payroll', 'payroll_calendar', 'Payroll Calendar', 247, true),
  ('payroll', 'Payroll', 'payroll_reports', 'Payroll Reports', 248, true),
  ('payroll', 'Payroll', 'payroll_reconciliation', 'Reconciliation', 249, true);

-- Time & Attendance (if not exists)
DELETE FROM public.module_permissions WHERE module_code = 'time_attendance';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active)
VALUES 
  ('time_attendance', 'Time & Attendance', NULL, NULL, 250, true),
  ('time_attendance', 'Time & Attendance', 'time_clock', 'Time Clock', 251, true),
  ('time_attendance', 'Time & Attendance', 'timesheets', 'Timesheets', 252, true),
  ('time_attendance', 'Time & Attendance', 'schedules', 'Work Schedules', 253, true),
  ('time_attendance', 'Time & Attendance', 'overtime', 'Overtime Management', 254, true),
  ('time_attendance', 'Time & Attendance', 'attendance_policies', 'Attendance Policies', 255, true),
  ('time_attendance', 'Time & Attendance', 'exceptions', 'Exceptions', 256, true),
  ('time_attendance', 'Time & Attendance', 'attendance_reports', 'Attendance Reports', 257, true);

-- Dashboard/Insights Module with container hierarchy
DELETE FROM public.module_permissions WHERE module_code = 'insights';
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active, container_code, is_container)
VALUES 
  ('insights', 'Insights & Analytics', NULL, NULL, 900, true, NULL, false),
  
  -- Container: Workforce Insights
  ('insights', 'Insights & Analytics', 'workforce_insights', 'Workforce Insights', 901, true, NULL, true),
  ('insights', 'Insights & Analytics', 'headcount_analytics', 'Headcount Analytics', 902, true, 'workforce_insights', false),
  ('insights', 'Insights & Analytics', 'turnover_analysis', 'Turnover Analysis', 903, true, 'workforce_insights', false),
  ('insights', 'Insights & Analytics', 'diversity_metrics', 'Diversity Metrics', 904, true, 'workforce_insights', false),
  ('insights', 'Insights & Analytics', 'workforce_demographics', 'Demographics', 905, true, 'workforce_insights', false),
  
  -- Container: Talent Insights
  ('insights', 'Insights & Analytics', 'talent_insights', 'Talent Insights', 910, true, NULL, true),
  ('insights', 'Insights & Analytics', 'performance_trends', 'Performance Trends', 911, true, 'talent_insights', false),
  ('insights', 'Insights & Analytics', 'skills_gap_analysis', 'Skills Gap Analysis', 912, true, 'talent_insights', false),
  ('insights', 'Insights & Analytics', 'succession_readiness', 'Succession Readiness', 913, true, 'talent_insights', false),
  ('insights', 'Insights & Analytics', 'learning_analytics', 'Learning Analytics', 914, true, 'talent_insights', false),
  
  -- Container: Compensation Insights
  ('insights', 'Insights & Analytics', 'compensation_insights', 'Compensation Insights', 920, true, NULL, true),
  ('insights', 'Insights & Analytics', 'salary_analytics', 'Salary Analytics', 921, true, 'compensation_insights', false),
  ('insights', 'Insights & Analytics', 'compa_ratio_analysis', 'Compa-Ratio Analysis', 922, true, 'compensation_insights', false),
  ('insights', 'Insights & Analytics', 'benefits_utilization', 'Benefits Utilization', 923, true, 'compensation_insights', false),
  ('insights', 'Insights & Analytics', 'payroll_costs', 'Payroll Costs', 924, true, 'compensation_insights', false),
  
  -- Container: Operational Insights
  ('insights', 'Insights & Analytics', 'operational_insights', 'Operational Insights', 930, true, NULL, true),
  ('insights', 'Insights & Analytics', 'attendance_trends', 'Attendance Trends', 931, true, 'operational_insights', false),
  ('insights', 'Insights & Analytics', 'leave_patterns', 'Leave Patterns', 932, true, 'operational_insights', false),
  ('insights', 'Insights & Analytics', 'overtime_analysis', 'Overtime Analysis', 933, true, 'operational_insights', false),
  ('insights', 'Insights & Analytics', 'recruitment_funnel', 'Recruitment Funnel', 934, true, 'operational_insights', false),
  
  -- Container: AI-Powered Insights
  ('insights', 'Insights & Analytics', 'ai_insights', 'AI-Powered Insights', 940, true, NULL, true),
  ('insights', 'Insights & Analytics', 'predictive_attrition', 'Predictive Attrition', 941, true, 'ai_insights', false),
  ('insights', 'Insights & Analytics', 'anomaly_detection', 'Anomaly Detection', 942, true, 'ai_insights', false),
  ('insights', 'Insights & Analytics', 'ai_recommendations', 'AI Recommendations', 943, true, 'ai_insights', false),
  ('insights', 'Insights & Analytics', 'natural_language_queries', 'Natural Language Queries', 944, true, 'ai_insights', false);