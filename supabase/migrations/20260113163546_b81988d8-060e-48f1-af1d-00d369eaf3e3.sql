-- Drop existing restrictive policies on implementation_sub_tasks
DROP POLICY IF EXISTS "Users can view sub-tasks for their company" 
  ON public.implementation_sub_tasks;
DROP POLICY IF EXISTS "Users can insert sub-tasks for their company" 
  ON public.implementation_sub_tasks;
DROP POLICY IF EXISTS "Users can update sub-tasks for their company" 
  ON public.implementation_sub_tasks;

-- Create new policies using user_has_company_access function
CREATE POLICY "Users can view sub-tasks for accessible companies" 
  ON public.implementation_sub_tasks FOR SELECT
  USING (public.user_has_company_access(company_id, auth.uid()));

CREATE POLICY "Users can insert sub-tasks for accessible companies" 
  ON public.implementation_sub_tasks FOR INSERT
  WITH CHECK (public.user_has_company_access(company_id, auth.uid()));

CREATE POLICY "Users can update sub-tasks for accessible companies" 
  ON public.implementation_sub_tasks FOR UPDATE
  USING (public.user_has_company_access(company_id, auth.uid()));

-- Drop existing restrictive policies on implementation_step_progress
DROP POLICY IF EXISTS "Users can view progress for their company" 
  ON public.implementation_step_progress;
DROP POLICY IF EXISTS "Users can insert progress for their company" 
  ON public.implementation_step_progress;
DROP POLICY IF EXISTS "Users can update progress for their company" 
  ON public.implementation_step_progress;
DROP POLICY IF EXISTS "Users can delete progress for their company" 
  ON public.implementation_step_progress;

-- Create new policies using user_has_company_access function
CREATE POLICY "Users can view progress for accessible companies" 
  ON public.implementation_step_progress FOR SELECT
  USING (public.user_has_company_access(company_id, auth.uid()));

CREATE POLICY "Users can insert progress for accessible companies" 
  ON public.implementation_step_progress FOR INSERT
  WITH CHECK (public.user_has_company_access(company_id, auth.uid()));

CREATE POLICY "Users can update progress for accessible companies" 
  ON public.implementation_step_progress FOR UPDATE
  USING (public.user_has_company_access(company_id, auth.uid()));

CREATE POLICY "Users can delete progress for accessible companies" 
  ON public.implementation_step_progress FOR DELETE
  USING (public.user_has_company_access(company_id, auth.uid()));

-- Create RPC function to get accessible companies for the current user
CREATE OR REPLACE FUNCTION public.get_user_accessible_companies()
RETURNS TABLE (id uuid, name text) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name::text
  FROM companies c
  WHERE public.user_has_company_access(c.id, auth.uid())
  ORDER BY c.name;
END;
$$;