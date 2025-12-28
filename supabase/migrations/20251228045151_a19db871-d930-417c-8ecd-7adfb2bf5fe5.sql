-- Fix SELECT policy to allow system_admin to view ALL capabilities
DROP POLICY IF EXISTS "Users can view active capabilities in their company" ON public.skills_competencies;

CREATE POLICY "Users can view active capabilities in their company" ON public.skills_competencies
FOR SELECT TO authenticated
USING (
  -- system_admin can view ALL capabilities regardless of company
  (public.has_role(auth.uid(), 'system_admin'::app_role) = true)
  OR
  -- Regular users see their company's capabilities OR global ones
  (
    (
      company_id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid())
      OR company_id IS NULL
    )
    AND (
      status = 'active'::capability_status 
      OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
    )
  )
);