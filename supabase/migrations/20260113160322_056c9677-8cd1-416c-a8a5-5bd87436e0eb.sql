-- Drop ALL existing policies on these tables to avoid conflicts
DROP POLICY IF EXISTS "Users with company access can view rating scales" ON public.performance_rating_scales;
DROP POLICY IF EXISTS "HR admins with company access can manage rating scales" ON public.performance_rating_scales;
DROP POLICY IF EXISTS "HR admins with company access can insert rating scales" ON public.performance_rating_scales;
DROP POLICY IF EXISTS "HR admins with company access can update rating scales" ON public.performance_rating_scales;
DROP POLICY IF EXISTS "HR admins with company access can delete rating scales" ON public.performance_rating_scales;
DROP POLICY IF EXISTS "HR managers and admins can manage rating scales" ON public.performance_rating_scales;
DROP POLICY IF EXISTS "Users can view rating scales for their company" ON public.performance_rating_scales;

DROP POLICY IF EXISTS "Users with company access can view overall rating scales" ON public.overall_rating_scales;
DROP POLICY IF EXISTS "HR admins with company access can manage overall rating scales" ON public.overall_rating_scales;
DROP POLICY IF EXISTS "HR admins with company access can insert overall rating scales" ON public.overall_rating_scales;
DROP POLICY IF EXISTS "HR admins with company access can update overall rating scales" ON public.overall_rating_scales;
DROP POLICY IF EXISTS "HR admins with company access can delete overall rating scales" ON public.overall_rating_scales;
DROP POLICY IF EXISTS "HR managers and admins can manage overall rating scales" ON public.overall_rating_scales;
DROP POLICY IF EXISTS "Users can view overall rating scales for their company" ON public.overall_rating_scales;

DROP POLICY IF EXISTS "Users with company access can view rating mappings" ON public.overall_rating_mappings;
DROP POLICY IF EXISTS "HR admins with company access can manage rating mappings" ON public.overall_rating_mappings;
DROP POLICY IF EXISTS "HR admins with company access can insert rating mappings" ON public.overall_rating_mappings;
DROP POLICY IF EXISTS "HR admins with company access can update rating mappings" ON public.overall_rating_mappings;
DROP POLICY IF EXISTS "HR admins with company access can delete rating mappings" ON public.overall_rating_mappings;
DROP POLICY IF EXISTS "HR managers and admins can manage rating mappings" ON public.overall_rating_mappings;
DROP POLICY IF EXISTS "Users can view rating mappings for their company" ON public.overall_rating_mappings;

DROP POLICY IF EXISTS "Users with company access can view form templates" ON public.appraisal_form_templates;
DROP POLICY IF EXISTS "HR admins with company access can create form templates" ON public.appraisal_form_templates;
DROP POLICY IF EXISTS "HR admins with company access can update form templates" ON public.appraisal_form_templates;
DROP POLICY IF EXISTS "HR admins with company access can delete form templates" ON public.appraisal_form_templates;

-- Now create fresh policies for performance_rating_scales
CREATE POLICY "Users with company access can view rating scales"
  ON public.performance_rating_scales FOR SELECT
  USING (
    company_id IS NULL
    OR public.user_has_company_access(auth.uid(), company_id)
  );

CREATE POLICY "HR admins can insert rating scales"
  ON public.performance_rating_scales FOR INSERT
  WITH CHECK (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  );

CREATE POLICY "HR admins can update rating scales"
  ON public.performance_rating_scales FOR UPDATE
  USING (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  )
  WITH CHECK (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  );

CREATE POLICY "HR admins can delete rating scales"
  ON public.performance_rating_scales FOR DELETE
  USING (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  );

-- overall_rating_scales policies
CREATE POLICY "Users with company access can view overall rating scales"
  ON public.overall_rating_scales FOR SELECT
  USING (
    company_id IS NULL
    OR public.user_has_company_access(auth.uid(), company_id)
  );

CREATE POLICY "HR admins can insert overall rating scales"
  ON public.overall_rating_scales FOR INSERT
  WITH CHECK (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  );

CREATE POLICY "HR admins can update overall rating scales"
  ON public.overall_rating_scales FOR UPDATE
  USING (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  )
  WITH CHECK (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  );

CREATE POLICY "HR admins can delete overall rating scales"
  ON public.overall_rating_scales FOR DELETE
  USING (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  );

-- overall_rating_mappings policies
CREATE POLICY "Users with company access can view rating mappings"
  ON public.overall_rating_mappings FOR SELECT
  USING (
    company_id IS NULL
    OR public.user_has_company_access(auth.uid(), company_id)
  );

CREATE POLICY "HR admins can insert rating mappings"
  ON public.overall_rating_mappings FOR INSERT
  WITH CHECK (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  );

CREATE POLICY "HR admins can update rating mappings"
  ON public.overall_rating_mappings FOR UPDATE
  USING (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  )
  WITH CHECK (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  );

CREATE POLICY "HR admins can delete rating mappings"
  ON public.overall_rating_mappings FOR DELETE
  USING (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  );

-- appraisal_form_templates policies
CREATE POLICY "Users with company access can view form templates"
  ON public.appraisal_form_templates FOR SELECT
  USING (
    company_id IS NULL
    OR public.user_has_company_access(auth.uid(), company_id)
  );

CREATE POLICY "HR admins can create form templates"
  ON public.appraisal_form_templates FOR INSERT
  WITH CHECK (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  );

CREATE POLICY "HR admins can update form templates"
  ON public.appraisal_form_templates FOR UPDATE
  USING (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  )
  WITH CHECK (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  );

CREATE POLICY "HR admins can delete form templates"
  ON public.appraisal_form_templates FOR DELETE
  USING (
    (company_id IS NULL AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'system_admin'
    ))
    OR (
      public.user_has_company_access(auth.uid(), company_id)
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = ANY(ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
      )
    )
  );