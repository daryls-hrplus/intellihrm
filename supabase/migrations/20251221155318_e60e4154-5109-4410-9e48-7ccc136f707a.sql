-- ============================================
-- PHASE 1: INSERT 4 NEW CATEGORIES
-- ============================================

-- 1. Strategic Planning Category
INSERT INTO application_modules (
  module_code, module_name, description, icon_name, 
  route_path, display_order, is_active, parent_module_code
) VALUES (
  'cat_strategic_planning', 
  'Strategic Planning', 
  'Forward-looking workforce planning, analytics, and organizational design',
  'TrendingUp',
  '/strategic-planning',
  2,
  true,
  NULL
);

-- 2. Reporting & Analytics Category
INSERT INTO application_modules (
  module_code, module_name, description, icon_name, 
  route_path, display_order, is_active, parent_module_code
) VALUES (
  'cat_reporting_analytics', 
  'Reporting & Analytics', 
  'Cross-module dashboards, custom reports, and AI-powered insights',
  'BarChart3',
  '/reporting',
  7,
  true,
  NULL
);

-- 3. Global/Regional Compliance Category
INSERT INTO application_modules (
  module_code, module_name, description, icon_name, 
  route_path, display_order, is_active, parent_module_code
) VALUES (
  'cat_global_compliance', 
  'Global/Regional Compliance', 
  'Multi-country payroll rules, tax configurations, and labor law compliance',
  'Globe',
  '/global-compliance',
  8,
  true,
  NULL
);

-- 4. Integration & Administration Category
INSERT INTO application_modules (
  module_code, module_name, description, icon_name, 
  route_path, display_order, is_active, parent_module_code
) VALUES (
  'cat_integration_admin', 
  'Integration & Administration', 
  'API management, system settings, audit logs, and security configuration',
  'Settings',
  '/system',
  9,
  true,
  NULL
);

-- ============================================
-- PHASE 2: REORGANIZE EXISTING MODULES
-- ============================================

-- Move Workforce Planning to Strategic Planning
UPDATE application_modules 
SET parent_module_code = 'cat_strategic_planning', 
    display_order = 1
WHERE module_code = 'workforce';

-- Move Administration to Integration & Administration
UPDATE application_modules 
SET parent_module_code = 'cat_integration_admin', 
    display_order = 5
WHERE module_code = 'admin';

-- Update display order for all categories
UPDATE application_modules SET display_order = 1 WHERE module_code = 'cat_core_hr';
UPDATE application_modules SET display_order = 3 WHERE module_code = 'cat_talent_management';
UPDATE application_modules SET display_order = 4 WHERE module_code = 'cat_compensation_benefits';
UPDATE application_modules SET display_order = 5 WHERE module_code = 'cat_employee_experience';
UPDATE application_modules SET display_order = 6 WHERE module_code = 'cat_compliance_risk';
UPDATE application_modules SET display_order = 10 WHERE module_code = 'cat_asset_management';

-- ============================================
-- PHASE 3: ADD NEW MODULES UNDER STRATEGIC PLANNING
-- ============================================

INSERT INTO application_modules (
  module_code, module_name, description, icon_name, 
  route_path, display_order, is_active, parent_module_code
) VALUES 
(
  'workforce_analytics', 
  'Workforce Analytics', 
  'Insights, dashboards, and predictive workforce models',
  'BarChart2',
  '/workforce-analytics',
  2,
  true,
  'cat_strategic_planning'
),
(
  'org_design', 
  'Organization Design', 
  'Organizational structure, restructuring scenarios, and what-if analysis',
  'Network',
  '/org-design',
  3,
  true,
  'cat_strategic_planning'
),
(
  'scenario_planning', 
  'Scenario Planning', 
  'What-if analysis, budget impact modeling, and timeline projections',
  'GitBranch',
  '/scenario-planning',
  4,
  true,
  'cat_strategic_planning'
);

-- ============================================
-- PHASE 4: ADD NEW MODULES UNDER REPORTING & ANALYTICS
-- ============================================

INSERT INTO application_modules (
  module_code, module_name, description, icon_name, 
  route_path, display_order, is_active, parent_module_code
) VALUES 
(
  'dashboards', 
  'Cross-Module Dashboards', 
  'Unified dashboards spanning all HR modules',
  'LayoutDashboard',
  '/dashboards',
  1,
  true,
  'cat_reporting_analytics'
),
(
  'report_builder', 
  'Report Builder', 
  'Custom report creation with templates and scheduling',
  'FileBarChart',
  '/report-builder',
  2,
  true,
  'cat_reporting_analytics'
),
(
  'ai_insights', 
  'AI Insights', 
  'AI-powered recommendations, anomaly detection, and forecasting',
  'Brain',
  '/ai-insights',
  3,
  true,
  'cat_reporting_analytics'
),
(
  'data_export', 
  'Data Export', 
  'Bulk export, scheduled exports, and API data access',
  'Download',
  '/data-export',
  4,
  true,
  'cat_reporting_analytics'
);

-- ============================================
-- PHASE 5: ADD NEW MODULES UNDER GLOBAL/REGIONAL COMPLIANCE
-- ============================================

INSERT INTO application_modules (
  module_code, module_name, description, icon_name, 
  route_path, display_order, is_active, parent_module_code
) VALUES 
(
  'multi_country_rules', 
  'Multi-Country Rules', 
  'Country-specific rule configuration and profiles',
  'Globe2',
  '/multi-country-rules',
  1,
  true,
  'cat_global_compliance'
),
(
  'tax_config', 
  'Tax Configuration', 
  'Tax tables, deduction rules, thresholds, and reporting',
  'Receipt',
  '/tax-config',
  2,
  true,
  'cat_global_compliance'
),
(
  'labor_law', 
  'Labor Law Compliance', 
  'Leave policies, working hours, overtime rules, and holidays by region',
  'Scale',
  '/labor-law',
  3,
  true,
  'cat_global_compliance'
),
(
  'statutory_reporting', 
  'Statutory Reporting', 
  'Government report templates, filing schedules, and submission tracking',
  'FileCheck',
  '/statutory-reporting',
  4,
  true,
  'cat_global_compliance'
);

-- ============================================
-- PHASE 6: ADD NEW MODULES UNDER INTEGRATION & ADMINISTRATION
-- ============================================

INSERT INTO application_modules (
  module_code, module_name, description, icon_name, 
  route_path, display_order, is_active, parent_module_code
) VALUES 
(
  'api_management', 
  'API Management', 
  'API keys, webhooks, rate limits, and documentation',
  'Webhook',
  '/api-management',
  1,
  true,
  'cat_integration_admin'
),
(
  'audit_logs', 
  'Audit Logs', 
  'Activity log, user actions, data changes, and export',
  'History',
  '/audit-logs',
  2,
  true,
  'cat_integration_admin'
),
(
  'security_settings', 
  'Security Settings', 
  'Role management, permissions, MFA settings, and session management',
  'Shield',
  '/security-settings',
  3,
  true,
  'cat_integration_admin'
),
(
  'system_config', 
  'System Configuration', 
  'Company settings, localization, branding, and feature flags',
  'Cog',
  '/system-config',
  4,
  true,
  'cat_integration_admin'
);