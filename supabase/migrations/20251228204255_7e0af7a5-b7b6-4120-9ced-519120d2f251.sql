-- Drop existing RLS policies on job_responsibility_kras
DROP POLICY IF EXISTS "Users can view job responsibility KRAs for their company" ON public.job_responsibility_kras;
DROP POLICY IF EXISTS "Users can insert job responsibility KRAs for their company" ON public.job_responsibility_kras;
DROP POLICY IF EXISTS "Users can update job responsibility KRAs for their company" ON public.job_responsibility_kras;
DROP POLICY IF EXISTS "Users can delete job responsibility KRAs for their company" ON public.job_responsibility_kras;

-- Create new policies that allow:
-- 1. Company-scoped access for regular users (admin, hr_manager)
-- 2. Cross-company access for system_admin role

-- SELECT policy
CREATE POLICY "Users can view job responsibility KRAs"
ON public.job_responsibility_kras
FOR SELECT
USING (
  -- System admins can view all
  public.has_role(auth.uid(), 'system_admin'::app_role)
  OR
  -- Others can view within their company
  EXISTS (
    SELECT 1
    FROM job_responsibilities jr
    JOIN jobs j ON jr.job_id = j.id
    WHERE jr.id = job_responsibility_kras.job_responsibility_id
    AND j.company_id IN (
      SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
    )
  )
);

-- INSERT policy
CREATE POLICY "Users can insert job responsibility KRAs"
ON public.job_responsibility_kras
FOR INSERT
WITH CHECK (
  -- System admins can insert anywhere
  public.has_role(auth.uid(), 'system_admin'::app_role)
  OR
  -- Admin/HR can insert within their company
  (
    (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'hr_manager'::app_role))
    AND EXISTS (
      SELECT 1
      FROM job_responsibilities jr
      JOIN jobs j ON jr.job_id = j.id
      WHERE jr.id = job_responsibility_kras.job_responsibility_id
      AND j.company_id IN (
        SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
      )
    )
  )
);

-- UPDATE policy
CREATE POLICY "Users can update job responsibility KRAs"
ON public.job_responsibility_kras
FOR UPDATE
USING (
  -- System admins can update anywhere
  public.has_role(auth.uid(), 'system_admin'::app_role)
  OR
  -- Admin/HR can update within their company
  (
    (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'hr_manager'::app_role))
    AND EXISTS (
      SELECT 1
      FROM job_responsibilities jr
      JOIN jobs j ON jr.job_id = j.id
      WHERE jr.id = job_responsibility_kras.job_responsibility_id
      AND j.company_id IN (
        SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
      )
    )
  )
);

-- DELETE policy
CREATE POLICY "Users can delete job responsibility KRAs"
ON public.job_responsibility_kras
FOR DELETE
USING (
  -- System admins can delete anywhere
  public.has_role(auth.uid(), 'system_admin'::app_role)
  OR
  -- Admin/HR can delete within their company
  (
    (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'hr_manager'::app_role))
    AND EXISTS (
      SELECT 1
      FROM job_responsibilities jr
      JOIN jobs j ON jr.job_id = j.id
      WHERE jr.id = job_responsibility_kras.job_responsibility_id
      AND j.company_id IN (
        SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
      )
    )
  )
);