-- =====================================================
-- FIX: Resolve infinite recursion in profiles RLS policy
-- =====================================================

-- 1. Drop the problematic self-referencing policy
DROP POLICY IF EXISTS "Users can view authorized profiles" ON public.profiles;

-- 2. Create a security definer function to safely get current user's company_id
-- This avoids the infinite recursion by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$;

-- 3. Re-create the profiles SELECT policy using the safe function
CREATE POLICY "Users can view authorized profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- User is an admin/HR role
  public.has_any_role(auth.uid(), ARRAY['admin'::text, 'system_admin'::text, 'hr_admin'::text, 'hr_manager'::text])
  OR
  -- User is viewing their own profile
  id = auth.uid()
  OR
  -- User is viewing someone in the same company (using security definer function)
  (
    company_id IS NOT NULL 
    AND company_id = public.get_current_user_company_id()
  )
);