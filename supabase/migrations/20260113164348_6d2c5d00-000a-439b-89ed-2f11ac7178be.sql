-- Fix policy function argument order: user_has_company_access(user_id, company_id)

-- implementation_sub_tasks
DROP POLICY IF EXISTS "Users can view sub-tasks for accessible companies" ON public.implementation_sub_tasks;
DROP POLICY IF EXISTS "Users can insert sub-tasks for accessible companies" ON public.implementation_sub_tasks;
DROP POLICY IF EXISTS "Users can update sub-tasks for accessible companies" ON public.implementation_sub_tasks;
DROP POLICY IF EXISTS "Users can delete sub-tasks for accessible companies" ON public.implementation_sub_tasks;

CREATE POLICY "Users can view sub-tasks for accessible companies"
ON public.implementation_sub_tasks
FOR SELECT
USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "Users can insert sub-tasks for accessible companies"
ON public.implementation_sub_tasks
FOR INSERT
WITH CHECK (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "Users can update sub-tasks for accessible companies"
ON public.implementation_sub_tasks
FOR UPDATE
USING (public.user_has_company_access(auth.uid(), company_id))
WITH CHECK (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "Users can delete sub-tasks for accessible companies"
ON public.implementation_sub_tasks
FOR DELETE
USING (public.user_has_company_access(auth.uid(), company_id));

-- implementation_step_progress
DROP POLICY IF EXISTS "Users can view progress for accessible companies" ON public.implementation_step_progress;
DROP POLICY IF EXISTS "Users can insert progress for accessible companies" ON public.implementation_step_progress;
DROP POLICY IF EXISTS "Users can update progress for accessible companies" ON public.implementation_step_progress;
DROP POLICY IF EXISTS "Users can delete progress for accessible companies" ON public.implementation_step_progress;

CREATE POLICY "Users can view progress for accessible companies"
ON public.implementation_step_progress
FOR SELECT
USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "Users can insert progress for accessible companies"
ON public.implementation_step_progress
FOR INSERT
WITH CHECK (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "Users can update progress for accessible companies"
ON public.implementation_step_progress
FOR UPDATE
USING (public.user_has_company_access(auth.uid(), company_id))
WITH CHECK (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "Users can delete progress for accessible companies"
ON public.implementation_step_progress
FOR DELETE
USING (public.user_has_company_access(auth.uid(), company_id));
