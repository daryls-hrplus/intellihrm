-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can manage translations" ON public.translations;

-- Create separate policies for each operation with simpler admin check
CREATE POLICY "Admins can insert translations"
ON public.translations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('super_admin', 'admin', 'hr_admin')
  )
);

CREATE POLICY "Admins can update translations"
ON public.translations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('super_admin', 'admin', 'hr_admin')
  )
);

CREATE POLICY "Admins can delete translations"
ON public.translations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('super_admin', 'admin', 'hr_admin')
  )
);