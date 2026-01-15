-- Drop existing policies
DROP POLICY IF EXISTS "HR can insert template phases" ON public.appraisal_template_phases;
DROP POLICY IF EXISTS "HR can update template phases" ON public.appraisal_template_phases;
DROP POLICY IF EXISTS "HR can delete template phases" ON public.appraisal_template_phases;

-- INSERT policy with multi-company support
CREATE POLICY "HR can insert template phases" 
ON public.appraisal_template_phases 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM appraisal_form_templates t
    JOIN profiles p ON p.company_id = t.company_id
    JOIN user_roles ur ON ur.user_id = p.id
    JOIN roles r ON r.id = ur.role_id
    WHERE t.id = template_id 
    AND p.id = auth.uid() 
    AND r.code = ANY (ARRAY['admin', 'hr_director', 'hr_manager', 'super_admin'])
  )
  OR
  EXISTS (
    SELECT 1 FROM appraisal_form_templates t
    JOIN role_company_access rca ON rca.company_id = t.company_id
    JOIN user_roles ur ON ur.role_id = rca.role_id AND ur.user_id = auth.uid()
    JOIN roles r ON r.id = ur.role_id
    WHERE t.id = template_id 
    AND r.code = ANY (ARRAY['admin', 'hr_director', 'hr_manager', 'super_admin', 'system_admin', 'enablement_admin'])
  )
);

-- UPDATE policy with multi-company support
CREATE POLICY "HR can update template phases" 
ON public.appraisal_template_phases 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM appraisal_form_templates t
    JOIN profiles p ON p.company_id = t.company_id
    JOIN user_roles ur ON ur.user_id = p.id
    JOIN roles r ON r.id = ur.role_id
    WHERE t.id = appraisal_template_phases.template_id 
    AND p.id = auth.uid() 
    AND r.code = ANY (ARRAY['admin', 'hr_director', 'hr_manager', 'super_admin'])
  )
  OR
  EXISTS (
    SELECT 1 FROM appraisal_form_templates t
    JOIN role_company_access rca ON rca.company_id = t.company_id
    JOIN user_roles ur ON ur.role_id = rca.role_id AND ur.user_id = auth.uid()
    JOIN roles r ON r.id = ur.role_id
    WHERE t.id = appraisal_template_phases.template_id 
    AND r.code = ANY (ARRAY['admin', 'hr_director', 'hr_manager', 'super_admin', 'system_admin', 'enablement_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM appraisal_form_templates t
    JOIN profiles p ON p.company_id = t.company_id
    JOIN user_roles ur ON ur.user_id = p.id
    JOIN roles r ON r.id = ur.role_id
    WHERE t.id = template_id 
    AND p.id = auth.uid() 
    AND r.code = ANY (ARRAY['admin', 'hr_director', 'hr_manager', 'super_admin'])
  )
  OR
  EXISTS (
    SELECT 1 FROM appraisal_form_templates t
    JOIN role_company_access rca ON rca.company_id = t.company_id
    JOIN user_roles ur ON ur.role_id = rca.role_id AND ur.user_id = auth.uid()
    JOIN roles r ON r.id = ur.role_id
    WHERE t.id = template_id 
    AND r.code = ANY (ARRAY['admin', 'hr_director', 'hr_manager', 'super_admin', 'system_admin', 'enablement_admin'])
  )
);

-- DELETE policy with multi-company support
CREATE POLICY "HR can delete template phases" 
ON public.appraisal_template_phases 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM appraisal_form_templates t
    JOIN profiles p ON p.company_id = t.company_id
    JOIN user_roles ur ON ur.user_id = p.id
    JOIN roles r ON r.id = ur.role_id
    WHERE t.id = appraisal_template_phases.template_id 
    AND p.id = auth.uid() 
    AND r.code = ANY (ARRAY['admin', 'hr_director', 'hr_manager', 'super_admin'])
  )
  OR
  EXISTS (
    SELECT 1 FROM appraisal_form_templates t
    JOIN role_company_access rca ON rca.company_id = t.company_id
    JOIN user_roles ur ON ur.role_id = rca.role_id AND ur.user_id = auth.uid()
    JOIN roles r ON r.id = ur.role_id
    WHERE t.id = appraisal_template_phases.template_id 
    AND r.code = ANY (ARRAY['admin', 'hr_director', 'hr_manager', 'super_admin', 'system_admin', 'enablement_admin'])
  )
);