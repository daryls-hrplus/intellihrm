-- Fix RLS policy on goal_approval_chain to include WITH CHECK using has_role function
DROP POLICY IF EXISTS "HR and admins can manage approval chains" ON public.goal_approval_chain;

CREATE POLICY "HR and admins can manage approval chains"
ON public.goal_approval_chain
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.goal_approval_rules gar
    JOIN public.profiles p ON p.company_id = gar.company_id
    WHERE gar.id = goal_approval_chain.rule_id
    AND p.id = auth.uid()
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.goal_approval_rules gar
    JOIN public.profiles p ON p.company_id = gar.company_id
    WHERE gar.id = goal_approval_chain.rule_id
    AND p.id = auth.uid()
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role))
  )
);