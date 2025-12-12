-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins and HR managers can manage all BI dashboards" ON public.bi_dashboards;
DROP POLICY IF EXISTS "Users can view shared dashboards" ON public.bi_dashboards;
DROP POLICY IF EXISTS "Users can manage their own dashboards" ON public.bi_dashboards;
DROP POLICY IF EXISTS "Users can view global dashboards" ON public.bi_dashboards;

-- Create simpler non-recursive policies for bi_dashboards
-- Policy 1: Users can insert their own dashboards
CREATE POLICY "Users can create dashboards"
ON public.bi_dashboards
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Policy 2: Admins and HR managers can view all dashboards
CREATE POLICY "Admins can view all dashboards"
ON public.bi_dashboards
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr_manager')
  )
);

-- Policy 3: Users can view global dashboards
CREATE POLICY "Users view global dashboards"
ON public.bi_dashboards
FOR SELECT
TO authenticated
USING (is_global = true);

-- Policy 4: Users can view their own dashboards
CREATE POLICY "Users view own dashboards"
ON public.bi_dashboards
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Policy 5: Users can update their own dashboards
CREATE POLICY "Users update own dashboards"
ON public.bi_dashboards
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Policy 6: Admins can update all dashboards
CREATE POLICY "Admins update all dashboards"
ON public.bi_dashboards
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr_manager')
  )
);

-- Policy 7: Users can delete their own dashboards
CREATE POLICY "Users delete own dashboards"
ON public.bi_dashboards
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Policy 8: Admins can delete all dashboards
CREATE POLICY "Admins delete all dashboards"
ON public.bi_dashboards
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr_manager')
  )
);