
-- Delete existing strategic planning, admin, and insights module permissions
DELETE FROM module_permissions WHERE module_code IN ('strategic_planning', 'admin', 'insights');

-- Insert updated Admin module with containers (includes Insights & Analytics)
INSERT INTO module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active, container_code, is_container) VALUES
-- Admin and Insights Containers
('admin', 'Admin & Insights', 'org_structure', 'Organization & Structure', 1, true, 'org_structure', true),
('admin', 'Admin & Insights', 'companies', 'Companies', 2, true, 'org_structure', false),
('admin', 'Admin & Insights', 'locations', 'Locations', 3, true, 'org_structure', false),
('admin', 'Admin & Insights', 'departments', 'Departments', 4, true, 'org_structure', false),
('admin', 'Admin & Insights', 'cost_centers', 'Cost Centers', 5, true, 'org_structure', false),
('admin', 'Admin & Insights', 'job_grades', 'Job Grades', 6, true, 'org_structure', false),
('admin', 'Admin & Insights', 'positions', 'Positions', 7, true, 'org_structure', false),

('admin', 'Admin & Insights', 'users_roles', 'Users, Roles & Access', 10, true, 'users_roles', true),
('admin', 'Admin & Insights', 'users', 'User Management', 11, true, 'users_roles', false),
('admin', 'Admin & Insights', 'roles', 'Role Management', 12, true, 'users_roles', false),
('admin', 'Admin & Insights', 'granular_permissions', 'Granular Permissions', 13, true, 'users_roles', false),
('admin', 'Admin & Insights', 'container_permissions', 'Container Permissions', 14, true, 'users_roles', false),
('admin', 'Admin & Insights', 'access_requests', 'Access Requests', 15, true, 'users_roles', false),

('admin', 'Admin & Insights', 'security_governance', 'Security & Governance', 20, true, 'security_governance', true),
('admin', 'Admin & Insights', 'audit_logs', 'Audit Logs', 21, true, 'security_governance', false),
('admin', 'Admin & Insights', 'security_settings', 'Security Settings', 22, true, 'security_governance', false),
('admin', 'Admin & Insights', 'data_retention', 'Data Retention', 23, true, 'security_governance', false),
('admin', 'Admin & Insights', 'compliance_settings', 'Compliance Settings', 24, true, 'security_governance', false),

('admin', 'Admin & Insights', 'system_config', 'System & Platform Configuration', 30, true, 'system_config', true),
('admin', 'Admin & Insights', 'general_settings', 'General Settings', 31, true, 'system_config', false),
('admin', 'Admin & Insights', 'notification_settings', 'Notification Settings', 32, true, 'system_config', false),
('admin', 'Admin & Insights', 'integration_settings', 'Integration Settings', 33, true, 'system_config', false),
('admin', 'Admin & Insights', 'workflow_config', 'Workflow Configuration', 34, true, 'system_config', false),
('admin', 'Admin & Insights', 'ai_settings', 'AI Settings', 35, true, 'system_config', false),

('admin', 'Admin & Insights', 'insights_analytics', 'Insights & Analytics', 40, true, 'insights_analytics', true),
('admin', 'Admin & Insights', 'workforce_insights', 'Workforce Insights', 41, true, 'insights_analytics', false),
('admin', 'Admin & Insights', 'workforce_analytics', 'Workforce Analytics', 42, true, 'insights_analytics', false),
('admin', 'Admin & Insights', 'talent_insights', 'Talent Insights', 43, true, 'insights_analytics', false),
('admin', 'Admin & Insights', 'compensation_insights', 'Compensation Insights', 44, true, 'insights_analytics', false),
('admin', 'Admin & Insights', 'operational_insights', 'Operational Insights', 45, true, 'insights_analytics', false),
('admin', 'Admin & Insights', 'ai_insights', 'AI-Powered Insights', 46, true, 'insights_analytics', false),
('admin', 'Admin & Insights', 'cross_module_dashboards', 'Cross-Module Dashboards', 47, true, 'insights_analytics', false),
('admin', 'Admin & Insights', 'report_builder', 'Report Builder', 48, true, 'insights_analytics', false),
('admin', 'Admin & Insights', 'data_export', 'Data Export', 49, true, 'insights_analytics', false),

('admin', 'Admin & Insights', 'compliance_risk', 'Compliance & Risk', 50, true, 'compliance_risk', true),
('admin', 'Admin & Insights', 'compliance_dashboard', 'Compliance Dashboard', 51, true, 'compliance_risk', false),
('admin', 'Admin & Insights', 'risk_management', 'Risk Management', 52, true, 'compliance_risk', false),
('admin', 'Admin & Insights', 'policy_management', 'Policy Management', 53, true, 'compliance_risk', false),

('admin', 'Admin & Insights', 'documentation', 'Documentation & Enablement', 60, true, 'documentation', true),
('admin', 'Admin & Insights', 'help_center', 'Help Center', 61, true, 'documentation', false),
('admin', 'Admin & Insights', 'training_materials', 'Training Materials', 62, true, 'documentation', false),
('admin', 'Admin & Insights', 'release_notes', 'Release Notes', 63, true, 'documentation', false),

('admin', 'Admin & Insights', 'billing', 'Billing & Subscriptions', 70, true, 'billing', true),
('admin', 'Admin & Insights', 'subscription', 'Subscription Management', 71, true, 'billing', false),
('admin', 'Admin & Insights', 'invoices', 'Invoices', 72, true, 'billing', false),
('admin', 'Admin & Insights', 'usage', 'Usage & Limits', 73, true, 'billing', false);

-- Insert Strategic Planning module (without analytics)
INSERT INTO module_permissions (module_code, module_name, tab_code, tab_name, display_order, is_active) VALUES
('strategic_planning', 'Strategic Planning', 'workforce_planning', 'Workforce Planning', 1, true),
('strategic_planning', 'Strategic Planning', 'org_design', 'Organization Design', 2, true),
('strategic_planning', 'Strategic Planning', 'scenario_planning', 'Scenario Planning', 3, true),
('strategic_planning', 'Strategic Planning', 'budget_planning', 'Budget Planning', 4, true),
('strategic_planning', 'Strategic Planning', 'headcount_planning', 'Headcount Planning', 5, true),
('strategic_planning', 'Strategic Planning', 'skills_gap_analysis', 'Skills Gap Analysis', 6, true);
