-- Fix RLS for updating employee profiles by privileged roles
-- Previous policy checked roles.name values that don't match our seeded role names.

DROP POLICY IF EXISTS "Admins and HR Managers can update any profile" ON public.profiles;

-- SECURITY DEFINER helper to avoid RLS recursion and to keep policies readable
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND (ur.role::text = ANY (_roles))
  );
$$;

-- Allow privileged roles to update any profile (employee record)
CREATE POLICY "Privileged roles can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin','system_admin','hr_admin','hr_manager'])
)
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin','system_admin','hr_admin','hr_manager'])
);
