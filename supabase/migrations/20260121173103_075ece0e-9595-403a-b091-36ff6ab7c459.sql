-- Fix RLS policy for goal_approval_rules to allow INSERT/UPDATE with proper WITH CHECK clause
DROP POLICY IF EXISTS "HR and admins can manage approval rules" ON goal_approval_rules;

CREATE POLICY "HR and admins can manage approval rules" 
ON goal_approval_rules 
FOR ALL 
USING (
  company_id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role))
)
WITH CHECK (
  company_id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid())
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role))
);