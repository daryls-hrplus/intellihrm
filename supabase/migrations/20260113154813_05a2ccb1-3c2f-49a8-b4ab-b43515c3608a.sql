-- Create helper function to get accessible companies for a user
CREATE OR REPLACE FUNCTION public.get_user_accessible_companies(p_user_id UUID)
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name
  FROM companies c
  WHERE c.is_active = true
  AND public.user_has_company_access(p_user_id, c.id)
  ORDER BY c.name;
$$;

-- Drop existing policies on performance_rating_scales
DROP POLICY IF EXISTS "HR managers and admins can manage rating scales" ON public.performance_rating_scales;
DROP POLICY IF EXISTS "Users can view rating scales for their company" ON public.performance_rating_scales;

-- Create new policies using existing security function
CREATE POLICY "Users with company access can view rating scales"
  ON public.performance_rating_scales FOR SELECT
  USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "HR admins with company access can manage rating scales"
  ON public.performance_rating_scales FOR INSERT
  WITH CHECK (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

CREATE POLICY "HR admins with company access can update rating scales"
  ON public.performance_rating_scales FOR UPDATE
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

CREATE POLICY "HR admins with company access can delete rating scales"
  ON public.performance_rating_scales FOR DELETE
  USING (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

-- Apply same pattern to overall_rating_scales
DROP POLICY IF EXISTS "HR managers and admins can manage overall rating scales" ON public.overall_rating_scales;
DROP POLICY IF EXISTS "Users can view overall rating scales for their company" ON public.overall_rating_scales;

CREATE POLICY "Users with company access can view overall rating scales"
  ON public.overall_rating_scales FOR SELECT
  USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "HR admins with company access can manage overall rating scales"
  ON public.overall_rating_scales FOR INSERT
  WITH CHECK (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

CREATE POLICY "HR admins with company access can update overall rating scales"
  ON public.overall_rating_scales FOR UPDATE
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

CREATE POLICY "HR admins with company access can delete overall rating scales"
  ON public.overall_rating_scales FOR DELETE
  USING (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

-- Apply same pattern to overall_rating_mappings
DROP POLICY IF EXISTS "HR managers and admins can manage rating mappings" ON public.overall_rating_mappings;
DROP POLICY IF EXISTS "Users can view rating mappings for their company" ON public.overall_rating_mappings;

CREATE POLICY "Users with company access can view rating mappings"
  ON public.overall_rating_mappings FOR SELECT
  USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "HR admins with company access can manage rating mappings"
  ON public.overall_rating_mappings FOR INSERT
  WITH CHECK (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );

CREATE POLICY "HR admins with company access can update rating mappings"
  ON public.overall_rating_mappings FOR UPDATE
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

CREATE POLICY "HR admins with company access can delete rating mappings"
  ON public.overall_rating_mappings FOR DELETE
  USING (
    public.user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
    )
  );