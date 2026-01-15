-- Update the INSERT policy for appraisal_form_templates to include more admin roles
-- and use explicit role_company_access check for multi-company scenarios

DROP POLICY IF EXISTS "HR admins can create form templates" ON public.appraisal_form_templates;

CREATE POLICY "HR admins can create form templates" 
ON public.appraisal_form_templates 
FOR INSERT 
WITH CHECK (
  -- Option 1: System admin with NULL company (global templates)
  (
    company_id IS NULL 
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.code = 'system_admin'
    )
  )
  OR
  -- Option 2: User has direct company access via profile + matching role
  (
    company_id IS NOT NULL
    AND user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.code = ANY (ARRAY['admin', 'hr_manager', 'hr_director', 'system_admin', 'hr_admin', 'super_admin', 'enablement_admin'])
    )
  )
);

-- Also update UPDATE policy for consistency
DROP POLICY IF EXISTS "HR admins can update form templates" ON public.appraisal_form_templates;

CREATE POLICY "HR admins can update form templates" 
ON public.appraisal_form_templates 
FOR UPDATE 
USING (
  (
    company_id IS NULL 
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.code = 'system_admin'
    )
  )
  OR
  (
    company_id IS NOT NULL
    AND user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.code = ANY (ARRAY['admin', 'hr_manager', 'hr_director', 'system_admin', 'hr_admin', 'super_admin', 'enablement_admin'])
    )
  )
)
WITH CHECK (
  (
    company_id IS NULL 
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.code = 'system_admin'
    )
  )
  OR
  (
    company_id IS NOT NULL
    AND user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.code = ANY (ARRAY['admin', 'hr_manager', 'hr_director', 'system_admin', 'hr_admin', 'super_admin', 'enablement_admin'])
    )
  )
);

-- Also update DELETE policy for consistency
DROP POLICY IF EXISTS "HR admins can delete form templates" ON public.appraisal_form_templates;

CREATE POLICY "HR admins can delete form templates" 
ON public.appraisal_form_templates 
FOR DELETE 
USING (
  (
    company_id IS NULL 
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.code = 'system_admin'
    )
  )
  OR
  (
    company_id IS NOT NULL
    AND user_has_company_access(auth.uid(), company_id)
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.code = ANY (ARRAY['admin', 'hr_manager', 'hr_director', 'system_admin', 'hr_admin', 'super_admin', 'enablement_admin'])
    )
  )
);