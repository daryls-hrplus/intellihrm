-- Add features for Strategic Planning modules
INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'workforce_dashboard', 'Workforce Dashboard', 'Overview of workforce planning metrics and KPIs', '/workforce', 1, true
FROM public.application_modules m WHERE m.module_code = 'workforce'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'attrition_forecast', 'Attrition Forecasting', 'AI-powered attrition prediction and risk analysis', '/workforce-analytics', 1, true
FROM public.application_modules m WHERE m.module_code = 'workforce_analytics'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'trend_analysis', 'Trend Analysis', 'Historical workforce trends and patterns', '/workforce-analytics', 2, true
FROM public.application_modules m WHERE m.module_code = 'workforce_analytics'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'predictive_models', 'Predictive Models', 'Machine learning models for workforce predictions', '/workforce-analytics', 3, true
FROM public.application_modules m WHERE m.module_code = 'workforce_analytics'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'org_chart_editor', 'Org Chart Editor', 'Visual organization chart design and editing', '/org-design', 1, true
FROM public.application_modules m WHERE m.module_code = 'org_design'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'scenario_comparison', 'Scenario Comparison', 'Compare different organizational scenarios', '/org-design', 2, true
FROM public.application_modules m WHERE m.module_code = 'org_design'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'role_hierarchy', 'Role Hierarchy', 'Define and manage role hierarchies', '/org-design', 3, true
FROM public.application_modules m WHERE m.module_code = 'org_design'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'what_if_analysis', 'What-If Analysis', 'Model different workforce scenarios', '/scenario-planning', 1, true
FROM public.application_modules m WHERE m.module_code = 'scenario_planning'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'budget_impact', 'Budget Impact Modeling', 'Calculate budget impact of workforce changes', '/scenario-planning', 2, true
FROM public.application_modules m WHERE m.module_code = 'scenario_planning'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'timeline_projections', 'Timeline Projections', 'Project workforce changes over time', '/scenario-planning', 3, true
FROM public.application_modules m WHERE m.module_code = 'scenario_planning'
ON CONFLICT DO NOTHING;

-- Add features for Reporting & Analytics modules
INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'dashboard_builder', 'Dashboard Builder', 'Create custom dashboards with drag-and-drop', '/dashboards', 1, true
FROM public.application_modules m WHERE m.module_code = 'dashboards'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'widget_library', 'Widget Library', 'Library of pre-built dashboard widgets', '/dashboards', 2, true
FROM public.application_modules m WHERE m.module_code = 'dashboards'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'dashboard_sharing', 'Dashboard Sharing', 'Share dashboards with team members', '/dashboards', 3, true
FROM public.application_modules m WHERE m.module_code = 'dashboards'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'template_library', 'Template Library', 'Pre-built report templates', '/report-builder', 1, true
FROM public.application_modules m WHERE m.module_code = 'report_builder'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'custom_reports', 'Custom Reports', 'Build custom reports from scratch', '/report-builder', 2, true
FROM public.application_modules m WHERE m.module_code = 'report_builder'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'report_scheduling', 'Report Scheduling', 'Schedule automated report generation', '/report-builder', 3, true
FROM public.application_modules m WHERE m.module_code = 'report_builder'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'ai_recommendations', 'AI Recommendations', 'AI-powered insights and recommendations', '/ai-insights', 1, true
FROM public.application_modules m WHERE m.module_code = 'ai_insights'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'anomaly_detection', 'Anomaly Detection', 'Detect anomalies in workforce data', '/ai-insights', 2, true
FROM public.application_modules m WHERE m.module_code = 'ai_insights'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'natural_language', 'Natural Language Queries', 'Ask questions in plain language', '/ai-insights', 3, true
FROM public.application_modules m WHERE m.module_code = 'ai_insights'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'bulk_export', 'Bulk Export', 'Export large datasets efficiently', '/data-export', 1, true
FROM public.application_modules m WHERE m.module_code = 'data_export'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'scheduled_exports', 'Scheduled Exports', 'Schedule recurring data exports', '/data-export', 2, true
FROM public.application_modules m WHERE m.module_code = 'data_export'
ON CONFLICT DO NOTHING;

-- Add features for Global Compliance modules
INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'country_profiles', 'Country Profiles', 'Manage country-specific compliance profiles', '/multi-country-rules', 1, true
FROM public.application_modules m WHERE m.module_code = 'multi_country_rules'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'rule_configuration', 'Rule Configuration', 'Configure compliance rules by country', '/multi-country-rules', 2, true
FROM public.application_modules m WHERE m.module_code = 'multi_country_rules'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'effective_dates', 'Effective Dates', 'Manage rule effective dates and versioning', '/multi-country-rules', 3, true
FROM public.application_modules m WHERE m.module_code = 'multi_country_rules'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'tax_tables', 'Tax Tables', 'Configure tax tables and rates', '/tax-config', 1, true
FROM public.application_modules m WHERE m.module_code = 'tax_config'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'deduction_rules', 'Deduction Rules', 'Set up tax deduction rules', '/tax-config', 2, true
FROM public.application_modules m WHERE m.module_code = 'tax_config'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'thresholds', 'Tax Thresholds', 'Configure tax thresholds and brackets', '/tax-config', 3, true
FROM public.application_modules m WHERE m.module_code = 'tax_config'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'leave_policies', 'Leave Policies', 'Configure leave policies by jurisdiction', '/labor-law', 1, true
FROM public.application_modules m WHERE m.module_code = 'labor_law'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'working_hours', 'Working Hours', 'Set working hour regulations', '/labor-law', 2, true
FROM public.application_modules m WHERE m.module_code = 'labor_law'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'overtime_rules', 'Overtime Rules', 'Configure overtime regulations', '/labor-law', 3, true
FROM public.application_modules m WHERE m.module_code = 'labor_law'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'report_templates', 'Report Templates', 'Statutory report templates', '/statutory-reporting', 1, true
FROM public.application_modules m WHERE m.module_code = 'statutory_reporting'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'filing_schedules', 'Filing Schedules', 'Manage filing deadlines and schedules', '/statutory-reporting', 2, true
FROM public.application_modules m WHERE m.module_code = 'statutory_reporting'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'submission_tracking', 'Submission Tracking', 'Track report submissions', '/statutory-reporting', 3, true
FROM public.application_modules m WHERE m.module_code = 'statutory_reporting'
ON CONFLICT DO NOTHING;

-- Add features for Integration & Administration modules
INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'api_keys', 'API Keys', 'Manage API keys and access tokens', '/system/api-management', 1, true
FROM public.application_modules m WHERE m.module_code = 'api_management'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'webhooks', 'Webhooks', 'Configure webhook endpoints', '/system/api-management', 2, true
FROM public.application_modules m WHERE m.module_code = 'api_management'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'rate_limits', 'Rate Limits', 'Set API rate limits', '/system/api-management', 3, true
FROM public.application_modules m WHERE m.module_code = 'api_management'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'activity_log', 'Activity Log', 'View all system activity', '/system/audit-logs', 1, true
FROM public.application_modules m WHERE m.module_code = 'audit_logs'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'user_actions', 'User Actions', 'Track user actions and changes', '/system/audit-logs', 2, true
FROM public.application_modules m WHERE m.module_code = 'audit_logs'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'data_changes', 'Data Changes', 'Audit trail of data modifications', '/system/audit-logs', 3, true
FROM public.application_modules m WHERE m.module_code = 'audit_logs'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'role_management', 'Role Management', 'Manage security roles', '/system/security', 1, true
FROM public.application_modules m WHERE m.module_code = 'security_settings'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'permission_settings', 'Permission Settings', 'Configure granular permissions', '/system/security', 2, true
FROM public.application_modules m WHERE m.module_code = 'security_settings'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'session_management', 'Session Management', 'Manage user sessions', '/system/security', 3, true
FROM public.application_modules m WHERE m.module_code = 'security_settings'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'company_settings', 'Company Settings', 'Configure company-level settings', '/system/config', 1, true
FROM public.application_modules m WHERE m.module_code = 'system_config'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'localization', 'Localization', 'Language and regional settings', '/system/config', 2, true
FROM public.application_modules m WHERE m.module_code = 'system_config'
ON CONFLICT DO NOTHING;

INSERT INTO public.application_features (module_id, feature_code, feature_name, description, route_path, display_order, is_active)
SELECT m.id, 'feature_flags', 'Feature Flags', 'Enable or disable features', '/system/config', 3, true
FROM public.application_modules m WHERE m.module_code = 'system_config'
ON CONFLICT DO NOTHING;