-- Drop existing incorrect policies
DROP POLICY IF EXISTS "HR can view all company change requests" ON employee_data_change_requests;
DROP POLICY IF EXISTS "HR can update change requests" ON employee_data_change_requests;

-- Recreate SELECT policy with correct role names
CREATE POLICY "HR can view all company change requests"
ON employee_data_change_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = ANY (ARRAY['Administrator', 'HR Administrator', 'HR Manager', 'System Administrator'])
  )
);

-- Recreate UPDATE policy with correct role names
CREATE POLICY "HR can update change requests"
ON employee_data_change_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = ANY (ARRAY['Administrator', 'HR Administrator', 'HR Manager', 'System Administrator'])
  )
);