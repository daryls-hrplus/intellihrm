-- Drop existing policies
DROP POLICY IF EXISTS "Admins can insert translations" ON public.translations;
DROP POLICY IF EXISTS "Admins can update translations" ON public.translations;
DROP POLICY IF EXISTS "Admins can delete translations" ON public.translations;

-- Create policies with correct role names
CREATE POLICY "Admins can insert translations"
ON public.translations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('Administrator', 'System Administrator', 'super_admin', 'admin')
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
    AND r.name IN ('Administrator', 'System Administrator', 'super_admin', 'admin')
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
    AND r.name IN ('Administrator', 'System Administrator', 'super_admin', 'admin')
  )
);