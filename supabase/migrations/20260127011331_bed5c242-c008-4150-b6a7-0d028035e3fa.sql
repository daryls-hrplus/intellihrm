-- Phase 1: Rebrand HRplus to Intelli HRM

-- 1.1 Update CHECK constraints to accept both old and new values
ALTER TABLE company_groups 
DROP CONSTRAINT IF EXISTS company_groups_tenant_type_check;

ALTER TABLE company_groups 
ADD CONSTRAINT company_groups_tenant_type_check 
CHECK (tenant_type IN ('hrplus_internal', 'intellihrm_internal', 'client'));

ALTER TABLE roles 
DROP CONSTRAINT IF EXISTS roles_tenant_visibility_check;

ALTER TABLE roles 
ADD CONSTRAINT roles_tenant_visibility_check 
CHECK (tenant_visibility IN ('all', 'hrplus_internal', 'intellihrm_internal', 'client'));

ALTER TABLE companies 
DROP CONSTRAINT IF EXISTS companies_tenant_type_check;

ALTER TABLE companies 
ADD CONSTRAINT companies_tenant_type_check 
CHECK (tenant_type IN ('hrplus_internal', 'intellihrm_internal', 'client', 'demo'));

-- 1.2 Migrate existing data
UPDATE company_groups 
SET tenant_type = 'intellihrm_internal' 
WHERE tenant_type = 'hrplus_internal';

UPDATE roles 
SET tenant_visibility = 'intellihrm_internal' 
WHERE tenant_visibility = 'hrplus_internal';

UPDATE companies 
SET tenant_type = 'intellihrm_internal' 
WHERE tenant_type = 'hrplus_internal';

UPDATE master_skills_library 
SET source = 'Intelli HRM Deep Pack' 
WHERE source = 'HRplus Deep Pack';

-- 1.3 Create new function with updated name
CREATE OR REPLACE FUNCTION public.is_intellihrm_internal_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN companies c ON p.company_id = c.id
    LEFT JOIN company_groups cg ON c.group_id = cg.id
    WHERE p.id = auth.uid()
    AND cg.tenant_type = 'intellihrm_internal'
  );
$$;

-- Keep old function as alias for backward compatibility
CREATE OR REPLACE FUNCTION public.is_hrplus_internal_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT is_intellihrm_internal_user();
$$;

-- 1.4 Final cleanup - remove old values from constraints
ALTER TABLE company_groups 
DROP CONSTRAINT company_groups_tenant_type_check;

ALTER TABLE company_groups 
ADD CONSTRAINT company_groups_tenant_type_check 
CHECK (tenant_type IN ('intellihrm_internal', 'client'));

ALTER TABLE roles 
DROP CONSTRAINT roles_tenant_visibility_check;

ALTER TABLE roles 
ADD CONSTRAINT roles_tenant_visibility_check 
CHECK (tenant_visibility IN ('all', 'intellihrm_internal', 'client'));

ALTER TABLE companies 
DROP CONSTRAINT companies_tenant_type_check;

ALTER TABLE companies 
ADD CONSTRAINT companies_tenant_type_check 
CHECK (tenant_type IN ('intellihrm_internal', 'client', 'demo'));