-- =====================================================
-- Fix RLS Policies for Appraisal Configuration Tables
-- Use existing user_has_company_access() function
-- =====================================================

-- 1. Fix appraisal_form_templates RLS
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "HR can manage templates" ON public.appraisal_form_templates;
DROP POLICY IF EXISTS "Users can view templates in their company" ON public.appraisal_form_templates;
DROP POLICY IF EXISTS "Users with company access can view form templates" ON public.appraisal_form_templates;
DROP POLICY IF EXISTS "HR admins with company access can create form templates" ON public.appraisal_form_templates;
DROP POLICY IF EXISTS "HR admins with company access can update form templates" ON public.appraisal_form_templates;
DROP POLICY IF EXISTS "HR admins with company access can delete form templates" ON public.appraisal_form_templates;

-- New SELECT policy using existing security function
CREATE POLICY "Users with company access can view form templates"
  ON public.appraisal_form_templates FOR SELECT
  USING (public.user_has_company_access(auth.uid(), company_id));

-- New INSERT policy
CREATE POLICY "HR admins with company access can create form templates"
  ON public.appraisal_form_templates FOR INSERT
  WITH CHECK (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

-- New UPDATE policy
CREATE POLICY "HR admins with company access can update form templates"
  ON public.appraisal_form_templates FOR UPDATE
  USING (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  )
  WITH CHECK (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

-- New DELETE policy
CREATE POLICY "HR admins with company access can delete form templates"
  ON public.appraisal_form_templates FOR DELETE
  USING (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

-- 2. Fix appraisal_outcome_action_rules RLS
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "HR can manage action rules" ON public.appraisal_outcome_action_rules;
DROP POLICY IF EXISTS "Users can view action rules in their company" ON public.appraisal_outcome_action_rules;
DROP POLICY IF EXISTS "Users with company access can view action rules" ON public.appraisal_outcome_action_rules;
DROP POLICY IF EXISTS "HR admins with company access can manage action rules" ON public.appraisal_outcome_action_rules;

-- New SELECT policy
CREATE POLICY "Users with company access can view action rules"
  ON public.appraisal_outcome_action_rules FOR SELECT
  USING (public.user_has_company_access(auth.uid(), company_id));

-- New INSERT policy
CREATE POLICY "HR admins with company access can create action rules"
  ON public.appraisal_outcome_action_rules FOR INSERT
  WITH CHECK (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

-- New UPDATE policy
CREATE POLICY "HR admins with company access can update action rules"
  ON public.appraisal_outcome_action_rules FOR UPDATE
  USING (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  )
  WITH CHECK (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

-- New DELETE policy
CREATE POLICY "HR admins with company access can delete action rules"
  ON public.appraisal_outcome_action_rules FOR DELETE
  USING (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

-- 3. Fix appraisal_integration_rules RLS
-- Drop existing policies
DROP POLICY IF EXISTS "Admins and HR can manage integration rules" ON public.appraisal_integration_rules;
DROP POLICY IF EXISTS "Users can view integration rules for their company" ON public.appraisal_integration_rules;
DROP POLICY IF EXISTS "Users with company access can view integration rules" ON public.appraisal_integration_rules;
DROP POLICY IF EXISTS "HR admins with company access can manage integration rules" ON public.appraisal_integration_rules;

-- New SELECT policy
CREATE POLICY "Users with company access can view integration rules"
  ON public.appraisal_integration_rules FOR SELECT
  USING (public.user_has_company_access(auth.uid(), company_id));

-- New INSERT policy
CREATE POLICY "HR admins with company access can create integration rules"
  ON public.appraisal_integration_rules FOR INSERT
  WITH CHECK (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

-- New UPDATE policy
CREATE POLICY "HR admins with company access can update integration rules"
  ON public.appraisal_integration_rules FOR UPDATE
  USING (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  )
  WITH CHECK (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

-- New DELETE policy
CREATE POLICY "HR admins with company access can delete integration rules"
  ON public.appraisal_integration_rules FOR DELETE
  USING (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );