-- Grant EXECUTE permission on can_manage_template_phases to authenticated role
-- This ensures the RLS policy can call the function when evaluating INSERT/UPDATE/DELETE
GRANT EXECUTE ON FUNCTION public.can_manage_template_phases(uuid, uuid) TO authenticated;

-- Update SELECT policy to use the same access logic
-- This ensures admins with cross-company access can both add AND view phases
DROP POLICY IF EXISTS "Users can view template phases for their company" ON public.appraisal_template_phases;

CREATE POLICY "Users can view template phases" 
ON public.appraisal_template_phases 
FOR SELECT 
USING (
  can_manage_template_phases(auth.uid(), template_id)
);