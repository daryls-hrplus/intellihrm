
-- =====================================================
-- CRITICAL SECURITY FIX: Address Most Urgent RLS Issues
-- =====================================================

-- 1. Enable RLS on value_capability_mapping (currently disabled)
ALTER TABLE public.value_capability_mapping ENABLE ROW LEVEL SECURITY;

-- Create read policy for value_capability_mapping (lookup table - authenticated read)
CREATE POLICY "Authenticated users can view value capability mappings"
ON public.value_capability_mapping
FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify this lookup table
CREATE POLICY "Only admins can modify value capability mappings"
ON public.value_capability_mapping
FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin'::text, 'system_admin'::text]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::text, 'system_admin'::text]));

-- 2. Fix employee_positions SELECT policy - restrict salary data visibility
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view employee positions" ON public.employee_positions;

-- Create proper SELECT policy - users can only see:
-- - Their own positions (compensation visible)
-- - Positions in their company (but only for HR/Admin roles who need compensation data)
CREATE POLICY "Users can view authorized employee positions"
ON public.employee_positions
FOR SELECT
TO authenticated
USING (
  -- User is an admin/HR role (can see all for their company)
  public.has_any_role(auth.uid(), ARRAY['admin'::text, 'system_admin'::text, 'hr_admin'::text, 'hr_manager'::text])
  OR
  -- User owns this position (can see their own compensation)
  employee_id = auth.uid()
);

-- 3. Fix profiles SELECT policy - restrict visibility
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create proper SELECT policy for profiles
-- Users can see:
-- - Their own profile
-- - Profiles of people in their company (for directory lookup - company employees need to collaborate)
-- - All profiles if they are HR/Admin
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
  -- User is viewing someone in the same company (for employee directory)
  (
    company_id IS NOT NULL 
    AND company_id = (SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid())
  )
);
