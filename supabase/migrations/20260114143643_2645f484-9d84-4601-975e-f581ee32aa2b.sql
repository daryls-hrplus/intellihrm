-- Drop existing policies on reminder_email_templates
DROP POLICY IF EXISTS "HR and Admin can create templates" ON reminder_email_templates;
DROP POLICY IF EXISTS "HR and Admin can update company templates" ON reminder_email_templates;
DROP POLICY IF EXISTS "HR and Admin can delete company templates" ON reminder_email_templates;
DROP POLICY IF EXISTS "Users can view their company templates and defaults" ON reminder_email_templates;

-- Create new policies using user_has_company_access function for role-based access
CREATE POLICY "Users can view accessible company templates and defaults"
ON reminder_email_templates FOR SELECT
TO authenticated
USING (
  is_default = true 
  OR public.user_has_company_access(auth.uid(), company_id)
);

CREATE POLICY "Users can create templates for accessible companies"
ON reminder_email_templates FOR INSERT
TO authenticated
WITH CHECK (
  public.user_has_company_access(auth.uid(), company_id)
);

CREATE POLICY "Users can update templates for accessible companies"
ON reminder_email_templates FOR UPDATE
TO authenticated
USING (
  public.user_has_company_access(auth.uid(), company_id)
);

CREATE POLICY "Users can delete non-default templates for accessible companies"
ON reminder_email_templates FOR DELETE
TO authenticated
USING (
  is_default = false 
  AND public.user_has_company_access(auth.uid(), company_id)
);