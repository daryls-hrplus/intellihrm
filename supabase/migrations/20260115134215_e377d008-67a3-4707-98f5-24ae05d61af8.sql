-- Drop the existing ALL policy that doesn't have WITH CHECK
DROP POLICY IF EXISTS "HR can manage template phases" ON public.appraisal_template_phases;

-- Create separate policies for better control

-- SELECT policy (already exists, but recreate for completeness)
DROP POLICY IF EXISTS "Users can view template phases for their company" ON public.appraisal_template_phases;

CREATE POLICY "Users can view template phases for their company" 
ON public.appraisal_template_phases 
FOR SELECT 
USING (
  (EXISTS (
    SELECT 1 FROM appraisal_form_templates t
    JOIN profiles p ON p.company_id = t.company_id
    WHERE t.id = appraisal_template_phases.template_id 
    AND p.id = auth.uid()
  ))
  OR 
  (EXISTS (
    SELECT 1 FROM appraisal_form_templates t
    WHERE t.id = appraisal_template_phases.template_id 
    AND t.company_id IS NULL
  ))
);

-- INSERT policy with proper WITH CHECK
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
);

-- UPDATE policy
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
);

-- DELETE policy
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
);