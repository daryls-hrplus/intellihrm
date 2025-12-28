-- Fix UPDATE policy to allow system_admin to change company_id to any company
DROP POLICY IF EXISTS "HR/Admin can update capabilities" ON public.skills_competencies;

CREATE POLICY "HR/Admin can update capabilities" ON public.skills_competencies
FOR UPDATE TO authenticated
USING (
  -- Who can UPDATE (select the row)
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
  -- What values are allowed (for the NEW row)
  -- system_admin can set company_id to ANY value (including any company or null)
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

-- Also fix INSERT policy so system_admin can insert for ANY company
DROP POLICY IF EXISTS "HR/Admin can manage capabilities" ON public.skills_competencies;

CREATE POLICY "HR/Admin can manage capabilities" ON public.skills_competencies
FOR INSERT TO authenticated
WITH CHECK (
  -- system_admin can insert for ANY company (including null for global)
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