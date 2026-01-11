-- Add INSERT policy for privileged roles to create employee profiles (for imports)
CREATE POLICY "Privileged roles can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'hr_admin', 'hr_manager']::text[])
);