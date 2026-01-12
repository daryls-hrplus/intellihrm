-- Fix RLS policy for performance_rating_scales - use role code instead of name
DROP POLICY IF EXISTS "HR managers and admins can manage rating scales" ON public.performance_rating_scales;

CREATE POLICY "HR managers and admins can manage rating scales" 
ON public.performance_rating_scales 
FOR ALL 
USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.code = ANY (ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
  )
)
WITH CHECK (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.code = ANY (ARRAY['admin', 'hr_manager', 'system_admin', 'hr_admin'])
  )
);