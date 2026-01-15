-- Create a SECURITY DEFINER function to check template phase management access
-- This bypasses RLS on underlying tables to avoid nested RLS conflicts

CREATE OR REPLACE FUNCTION public.can_manage_template_phases(p_user_id uuid, p_template_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_template_company_id uuid;
BEGIN
  -- Get the template's company_id
  SELECT company_id INTO v_template_company_id
  FROM appraisal_form_templates
  WHERE id = p_template_id;
  
  IF v_template_company_id IS NULL THEN
    -- Template doesn't exist or has no company - check if user is system_admin
    RETURN EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = p_user_id
      AND r.code = 'system_admin'
    );
  END IF;
  
  -- Check if user has admin role with company access
  RETURN (
    -- Check direct profile company match with appropriate role
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      JOIN roles r ON r.id = ur.role_id
      WHERE p.id = p_user_id
      AND p.company_id = v_template_company_id
      AND r.code = ANY (ARRAY['admin', 'hr_director', 'hr_manager', 'super_admin', 'system_admin', 'enablement_admin', 'hr_admin'])
    )
    OR
    -- Check role_company_access for the template's company
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_company_access rca ON rca.role_id = ur.role_id
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = p_user_id
      AND rca.company_id = v_template_company_id
      AND r.code = ANY (ARRAY['admin', 'hr_director', 'hr_manager', 'super_admin', 'system_admin', 'enablement_admin', 'hr_admin'])
    )
    OR
    -- Fallback: user has super admin access to all companies
    public.has_role(p_user_id, 'admin')
  );
END;
$$;

-- Drop existing policies on appraisal_template_phases
DROP POLICY IF EXISTS "HR can insert template phases" ON public.appraisal_template_phases;
DROP POLICY IF EXISTS "HR can update template phases" ON public.appraisal_template_phases;
DROP POLICY IF EXISTS "HR can delete template phases" ON public.appraisal_template_phases;

-- Simplified INSERT policy using SECURITY DEFINER function
CREATE POLICY "HR can insert template phases" 
ON public.appraisal_template_phases 
FOR INSERT 
WITH CHECK (
  can_manage_template_phases(auth.uid(), template_id)
);

-- Simplified UPDATE policy
CREATE POLICY "HR can update template phases" 
ON public.appraisal_template_phases 
FOR UPDATE 
USING (can_manage_template_phases(auth.uid(), template_id))
WITH CHECK (can_manage_template_phases(auth.uid(), template_id));

-- Simplified DELETE policy
CREATE POLICY "HR can delete template phases" 
ON public.appraisal_template_phases 
FOR DELETE 
USING (can_manage_template_phases(auth.uid(), template_id));