
-- Fix Security Warnings: RLS Policies - Batch 2 (after first batch failed)
-- The first policies already applied, now fix remaining ones

-- 9. Fix fatigue_violations policies (simplified - HR/Admin only for update)
DROP POLICY IF EXISTS "System can create violations" ON fatigue_violations;
DROP POLICY IF EXISTS "Managers can update violations" ON fatigue_violations;

CREATE POLICY "System or Admin can create violations"
  ON fatigue_violations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_hr());

CREATE POLICY "HR Admin can update violations"
  ON fatigue_violations FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_hr());

-- 10. Ensure is_admin_or_hr function has search_path
CREATE OR REPLACE FUNCTION public.is_admin_or_hr()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr_manager')
  )
$$;

-- Also ensure is_admin function has search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
$$;
