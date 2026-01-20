-- Fix RLS policies for multi-company ESS administration

-- ============================================
-- 1. ESS_FIELD_PERMISSIONS Table
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "HR admins can manage field permissions" ON ess_field_permissions;
DROP POLICY IF EXISTS "Users can view field permissions for their company" ON ess_field_permissions;

-- Create new SELECT policy (view for accessible companies)
CREATE POLICY "Users can view field permissions for accessible companies"
  ON ess_field_permissions
  FOR SELECT
  USING (public.user_has_company_access(auth.uid(), company_id));

-- Create new management policy (INSERT, UPDATE, DELETE)
CREATE POLICY "Users with company access can manage field permissions"
  ON ess_field_permissions
  FOR ALL
  USING (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      JOIN roles r ON r.id = ur.role_id
      WHERE p.id = auth.uid()
      AND r.code IN ('hr', 'admin', 'super_admin')
    )
  )
  WITH CHECK (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      JOIN roles r ON r.id = ur.role_id
      WHERE p.id = auth.uid()
      AND r.code IN ('hr', 'admin', 'super_admin')
    )
  );

-- ============================================
-- 2. ESS_APPROVAL_POLICIES Table
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "HR users can manage ESS approval policies" ON ess_approval_policies;
DROP POLICY IF EXISTS "Users can view their company's ESS approval policies" ON ess_approval_policies;

-- Create new SELECT policy
CREATE POLICY "Users can view ESS approval policies for accessible companies"
  ON ess_approval_policies
  FOR SELECT
  USING (public.user_has_company_access(auth.uid(), company_id));

-- Create new management policy
CREATE POLICY "Users with company access can manage ESS approval policies"
  ON ess_approval_policies
  FOR ALL
  USING (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      JOIN roles r ON r.id = ur.role_id
      WHERE p.id = auth.uid()
      AND r.code IN ('hr', 'admin', 'super_admin')
    )
  )
  WITH CHECK (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      JOIN roles r ON r.id = ur.role_id
      WHERE p.id = auth.uid()
      AND r.code IN ('hr', 'admin', 'super_admin')
    )
  );

-- ============================================
-- 3. ESS_MODULE_CONFIG Table
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage ESS config" ON ess_module_config;
DROP POLICY IF EXISTS "Users can view ESS config for their company" ON ess_module_config;

-- Create new SELECT policy
CREATE POLICY "Users can view ESS config for accessible companies"
  ON ess_module_config
  FOR SELECT
  USING (public.user_has_company_access(auth.uid(), company_id));

-- Create new management policy
CREATE POLICY "Users with company access can manage ESS config"
  ON ess_module_config
  FOR ALL
  USING (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      JOIN roles r ON r.id = ur.role_id
      WHERE p.id = auth.uid()
      AND r.code IN ('hr', 'admin', 'super_admin')
    )
  )
  WITH CHECK (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      JOIN roles r ON r.id = ur.role_id
      WHERE p.id = auth.uid()
      AND r.code IN ('hr', 'admin', 'super_admin')
    )
  );