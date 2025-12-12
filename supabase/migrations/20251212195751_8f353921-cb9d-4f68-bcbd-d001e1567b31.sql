-- Fix infinite recursion by simplifying RLS policies on bi_dashboard_shares

DO $$
DECLARE
  r record;
BEGIN
  -- Drop all existing policies on bi_dashboard_shares to remove recursive dependencies
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bi_dashboard_shares'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, 'bi_dashboard_shares');
  END LOOP;
END$$;

-- Allow authenticated users to create share records for dashboards
CREATE POLICY "Users create dashboard shares"
ON public.bi_dashboard_shares
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Allow users to view shares that are relevant to them (creator, direct share, role-based share, or admin/HR)
CREATE POLICY "Users view relevant dashboard shares"
ON public.bi_dashboard_shares
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR shared_with_user_id = auth.uid()
  OR shared_with_role IN (
    SELECT role::text
    FROM public.user_roles
    WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'hr_manager')
  )
);

-- Allow users to update their own share records
CREATE POLICY "Users update own dashboard shares"
ON public.bi_dashboard_shares
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Allow admins and HR managers to fully manage all share records
CREATE POLICY "Admins manage all dashboard shares"
ON public.bi_dashboard_shares
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'hr_manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'hr_manager')
  )
);
