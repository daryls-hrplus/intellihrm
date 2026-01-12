-- Drop existing restrictive policies for employee_positions
DROP POLICY IF EXISTS "Admins can insert employee positions" ON employee_positions;
DROP POLICY IF EXISTS "Admins can update employee positions" ON employee_positions;
DROP POLICY IF EXISTS "Admins can delete employee positions" ON employee_positions;

-- Create new policies that include HR roles for employee_positions management
CREATE POLICY "HR and Admin roles can insert employee positions" ON employee_positions
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'hr_admin', 'hr_manager']));

CREATE POLICY "HR and Admin roles can update employee positions" ON employee_positions
  FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'hr_admin', 'hr_manager']))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'hr_admin', 'hr_manager']));

CREATE POLICY "HR and Admin roles can delete employee positions" ON employee_positions
  FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'hr_admin', 'hr_manager']));