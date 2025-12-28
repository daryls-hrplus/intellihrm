-- Drop existing INSERT policy
DROP POLICY IF EXISTS "HR/Admin can manage capabilities" ON public.skills_competencies;

-- Create new INSERT policy that allows:
-- 1. System admins to insert for any company
-- 2. Admin/HR managers to insert for their own company or global (null company_id)
CREATE POLICY "HR/Admin can manage capabilities" ON public.skills_competencies
FOR INSERT TO authenticated
WITH CHECK (
  -- System admins can insert for any company
  public.has_role(auth.uid(), 'system_admin')
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

-- Also update UPDATE policy
DROP POLICY IF EXISTS "HR/Admin can update capabilities" ON public.skills_competencies;

CREATE POLICY "HR/Admin can update capabilities" ON public.skills_competencies
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin')
  OR
  (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
    AND (
      company_id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid())
      OR company_id IS NULL
    )
  )
);

-- Also update DELETE policy
DROP POLICY IF EXISTS "HR/Admin can delete capabilities" ON public.skills_competencies;

CREATE POLICY "HR/Admin can delete capabilities" ON public.skills_competencies
FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin')
  OR
  (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
    AND (
      company_id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid())
      OR company_id IS NULL
    )
  )
);