-- Drop and recreate INSERT policy with explicit parentheses
DROP POLICY IF EXISTS "HR/Admin can manage capabilities" ON public.skills_competencies;

CREATE POLICY "HR/Admin can manage capabilities" ON public.skills_competencies
FOR INSERT TO authenticated
WITH CHECK (
  -- System admins can insert for any company - this check should succeed first
  (public.has_role(auth.uid(), 'system_admin'::app_role) = true)
  OR
  -- Admin/HR managers can insert for their company or global
  (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
    AND (
      company_id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid())
      OR company_id IS NULL
    )
  )
);

-- Also ensure UPDATE policy has correct parentheses
DROP POLICY IF EXISTS "HR/Admin can update capabilities" ON public.skills_competencies;

CREATE POLICY "HR/Admin can update capabilities" ON public.skills_competencies
FOR UPDATE TO authenticated
USING (
  (public.has_role(auth.uid(), 'system_admin'::app_role) = true)
  OR
  (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
    AND (
      company_id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid())
      OR company_id IS NULL
    )
  )
)
WITH CHECK (
  (public.has_role(auth.uid(), 'system_admin'::app_role) = true)
  OR
  (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
    AND (
      company_id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid())
      OR company_id IS NULL
    )
  )
);

-- Also ensure DELETE policy has correct parentheses  
DROP POLICY IF EXISTS "HR/Admin can delete capabilities" ON public.skills_competencies;

CREATE POLICY "HR/Admin can delete capabilities" ON public.skills_competencies
FOR DELETE TO authenticated
USING (
  (public.has_role(auth.uid(), 'system_admin'::app_role) = true)
  OR
  (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
    AND (
      company_id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid())
      OR company_id IS NULL
    )
  )
);