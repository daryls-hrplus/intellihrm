-- Add RLS policy for HR/Admin users to view notifications for employees in their company
CREATE POLICY "HR can view company notifications"
ON notifications FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN profiles admin_profile ON admin_profile.id = auth.uid()
    JOIN profiles notif_user ON notif_user.id = notifications.user_id
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'system_admin', 'enablement_admin')
    AND admin_profile.company_id = notif_user.company_id
  )
);