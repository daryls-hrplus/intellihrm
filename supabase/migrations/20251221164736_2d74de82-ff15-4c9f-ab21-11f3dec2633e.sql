-- Fix trigger function search path for security
CREATE OR REPLACE FUNCTION public.update_role_pii_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Phase 2: Seed Default Roles with PII Access and Container Permissions

-- Insert seeded role templates (using ON CONFLICT to be idempotent)
-- 1. System Administrator
INSERT INTO public.roles (name, code, description, is_system, is_active, role_type, is_seeded, seeded_role_code, tenant_visibility, menu_permissions, can_view_pii)
VALUES (
  'System Administrator', 
  'system_admin', 
  'Full system access with all administrative capabilities. Can configure all platform settings and manage all users.',
  true, true, 'system', true, 'system_admin', 'all',
  '["dashboard", "workforce", "leave", "compensation", "benefits", "performance", "training", "succession", "recruitment", "hse", "employee_relations", "property", "admin", "profile"]'::jsonb,
  true
) ON CONFLICT (code) DO NOTHING;

-- 2. HR Administrator
INSERT INTO public.roles (name, code, description, is_system, is_active, role_type, is_seeded, seeded_role_code, tenant_visibility, menu_permissions, can_view_pii)
VALUES (
  'HR Administrator', 
  'hr_admin', 
  'Full HR administrative access. Can manage all HR operations, employee data, and HR policies.',
  true, true, 'hr', true, 'hr_admin', 'all',
  '["dashboard", "workforce", "leave", "compensation", "benefits", "performance", "training", "succession", "recruitment", "hse", "employee_relations", "property", "admin", "profile"]'::jsonb,
  true
) ON CONFLICT (code) DO NOTHING;

-- 3. HR Manager
INSERT INTO public.roles (name, code, description, is_system, is_active, role_type, is_seeded, seeded_role_code, tenant_visibility, menu_permissions, can_view_pii)
VALUES (
  'HR Manager', 
  'hr_manager', 
  'HR management access with limited PII visibility. Can manage day-to-day HR operations and employee relations.',
  true, true, 'hr', true, 'hr_manager', 'all',
  '["dashboard", "workforce", "leave", "compensation", "benefits", "performance", "training", "succession", "recruitment", "hse", "employee_relations", "profile"]'::jsonb,
  true
) ON CONFLICT (code) DO NOTHING;

-- 4. Manager
INSERT INTO public.roles (name, code, description, is_system, is_active, role_type, is_seeded, seeded_role_code, tenant_visibility, menu_permissions, can_view_pii)
VALUES (
  'Manager', 
  'manager', 
  'People manager with access to direct reports data. Can view team performance, approve leave, and manage team operations.',
  true, true, 'business', true, 'manager', 'all',
  '["dashboard", "workforce", "leave", "performance", "training", "profile"]'::jsonb,
  false
) ON CONFLICT (code) DO NOTHING;

-- 5. Employee
INSERT INTO public.roles (name, code, description, is_system, is_active, role_type, is_seeded, seeded_role_code, tenant_visibility, menu_permissions, can_view_pii)
VALUES (
  'Employee', 
  'employee', 
  'Standard employee access. Can view own profile, request leave, access training, and view company information.',
  true, true, 'business', true, 'employee', 'all',
  '["dashboard", "leave", "performance", "training", "profile"]'::jsonb,
  false
) ON CONFLICT (code) DO NOTHING;

-- 6. Executive
INSERT INTO public.roles (name, code, description, is_system, is_active, role_type, is_seeded, seeded_role_code, tenant_visibility, menu_permissions, can_view_pii)
VALUES (
  'Executive', 
  'executive', 
  'Executive leadership access with strategic insights and analytics. Limited PII access to direct reports only.',
  true, true, 'business', true, 'executive', 'all',
  '["dashboard", "workforce", "leave", "compensation", "performance", "succession", "profile"]'::jsonb,
  false
) ON CONFLICT (code) DO NOTHING;

-- 7. Billing Admin
INSERT INTO public.roles (name, code, description, is_system, is_active, role_type, is_seeded, seeded_role_code, tenant_visibility, menu_permissions, can_view_pii)
VALUES (
  'Billing Administrator', 
  'billing_admin', 
  'Billing and subscription management access. Can manage invoices, payments, and subscription settings.',
  true, true, 'commercial', true, 'billing_admin', 'all',
  '["dashboard", "admin", "profile"]'::jsonb,
  false
) ON CONFLICT (code) DO NOTHING;

-- 8. Support Read-Only
INSERT INTO public.roles (name, code, description, is_system, is_active, role_type, is_seeded, seeded_role_code, tenant_visibility, menu_permissions, can_view_pii)
VALUES (
  'Support Read-Only', 
  'support_readonly', 
  'Support team read-only access for troubleshooting. Can view but not modify system data.',
  true, true, 'system', true, 'support_readonly', 'hrplus_internal',
  '["dashboard", "workforce", "leave", "compensation", "benefits", "performance", "admin", "profile"]'::jsonb,
  false
) ON CONFLICT (code) DO NOTHING;

-- 9. Enablement Admin (HRplus Internal only)
INSERT INTO public.roles (name, code, description, is_system, is_active, role_type, is_seeded, seeded_role_code, tenant_visibility, menu_permissions, can_view_pii)
VALUES (
  'Enablement Administrator', 
  'enablement_admin', 
  'Documentation and enablement management for HRplus internal use. Can manage training materials and documentation.',
  true, true, 'internal', true, 'enablement_admin', 'hrplus_internal',
  '["dashboard", "admin", "profile"]'::jsonb,
  false
) ON CONFLICT (code) DO NOTHING;

-- Create function to insert PII access for seeded roles
CREATE OR REPLACE FUNCTION public.seed_role_pii_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role RECORD;
BEGIN
  FOR v_role IN SELECT id, seeded_role_code, can_view_pii FROM roles WHERE is_seeded = true LOOP
    INSERT INTO role_pii_access (role_id, pii_level, access_personal_details, access_compensation, access_banking, access_medical, access_disciplinary, masking_enabled, export_permission)
    VALUES (
      v_role.id,
      CASE 
        WHEN v_role.seeded_role_code IN ('system_admin', 'hr_admin') THEN 'full'
        WHEN v_role.seeded_role_code IN ('hr_manager', 'support_readonly') THEN 'limited'
        ELSE 'none'
      END,
      v_role.seeded_role_code IN ('system_admin', 'hr_admin', 'hr_manager'),
      v_role.seeded_role_code IN ('system_admin', 'hr_admin', 'hr_manager'),
      v_role.seeded_role_code IN ('system_admin', 'hr_admin'),
      v_role.seeded_role_code IN ('system_admin', 'hr_admin'),
      v_role.seeded_role_code IN ('system_admin', 'hr_admin'),
      v_role.seeded_role_code NOT IN ('system_admin', 'hr_admin'),
      CASE 
        WHEN v_role.seeded_role_code IN ('system_admin', 'hr_admin') THEN 'allowed'
        WHEN v_role.seeded_role_code = 'hr_manager' THEN 'approval_required'
        ELSE 'none'
      END
    ) ON CONFLICT (role_id) DO NOTHING;
  END LOOP;
END;
$$;

-- Execute the seeding function
SELECT seed_role_pii_access();

-- Create function to seed container access for seeded roles
CREATE OR REPLACE FUNCTION public.seed_role_container_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role RECORD;
  v_containers TEXT[] := ARRAY[
    'org_structure', 'users_roles_access', 'security_governance',
    'system_platform_config', 'strategic_analytics', 'compliance_risk',
    'documentation_enablement', 'billing_subscriptions'
  ];
  v_container TEXT;
  v_permission admin_container_permission;
BEGIN
  FOR v_role IN SELECT id, seeded_role_code FROM roles WHERE is_seeded = true LOOP
    FOREACH v_container IN ARRAY v_containers LOOP
      -- Determine permission level based on role and container
      v_permission := CASE 
        -- System Admin: Configure all
        WHEN v_role.seeded_role_code = 'system_admin' THEN 'configure'::admin_container_permission
        
        -- HR Admin: Configure HR-related, View others
        WHEN v_role.seeded_role_code = 'hr_admin' THEN
          CASE v_container
            WHEN 'users_roles_access' THEN 'configure'::admin_container_permission
            WHEN 'security_governance' THEN 'configure'::admin_container_permission
            WHEN 'org_structure' THEN 'configure'::admin_container_permission
            WHEN 'compliance_risk' THEN 'view'::admin_container_permission
            WHEN 'strategic_analytics' THEN 'view'::admin_container_permission
            ELSE 'view'::admin_container_permission
          END
          
        -- HR Manager: View HR-related
        WHEN v_role.seeded_role_code = 'hr_manager' THEN
          CASE v_container
            WHEN 'users_roles_access' THEN 'view'::admin_container_permission
            WHEN 'strategic_analytics' THEN 'view'::admin_container_permission
            ELSE 'none'::admin_container_permission
          END
          
        -- Executive: View analytics
        WHEN v_role.seeded_role_code = 'executive' THEN
          CASE v_container
            WHEN 'strategic_analytics' THEN 'view'::admin_container_permission
            ELSE 'none'::admin_container_permission
          END
          
        -- Billing Admin: Configure billing only
        WHEN v_role.seeded_role_code = 'billing_admin' THEN
          CASE v_container
            WHEN 'billing_subscriptions' THEN 'configure'::admin_container_permission
            ELSE 'none'::admin_container_permission
          END
          
        -- Support Read-Only: View all
        WHEN v_role.seeded_role_code = 'support_readonly' THEN 'view'::admin_container_permission
        
        -- Enablement Admin: Configure documentation
        WHEN v_role.seeded_role_code = 'enablement_admin' THEN
          CASE v_container
            WHEN 'documentation_enablement' THEN 'configure'::admin_container_permission
            ELSE 'none'::admin_container_permission
          END
          
        ELSE 'none'::admin_container_permission
      END;
      
      INSERT INTO role_container_access (role_id, container_code, permission_level)
      VALUES (v_role.id, v_container, v_permission)
      ON CONFLICT (role_id, container_code) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;

-- Execute the container access seeding
SELECT seed_role_container_access();