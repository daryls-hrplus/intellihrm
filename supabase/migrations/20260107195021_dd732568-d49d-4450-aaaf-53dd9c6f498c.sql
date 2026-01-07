-- Add reminder event types for ESS change request notifications
INSERT INTO reminder_event_types (code, name, category, description, source_table, is_system)
VALUES
  ('ESS_REQUEST_APPROVED', 'ESS Change Request Approved', 'employee_voice', 
   'Notification when employee self-service data change is approved', 
   'employee_data_change_requests', true),
  ('ESS_REQUEST_REJECTED', 'ESS Change Request Rejected', 'employee_voice',
   'Notification when employee self-service data change is rejected',
   'employee_data_change_requests', true),
  ('ESS_REQUEST_INFO_REQUIRED', 'Additional Info Required', 'employee_voice',
   'Notification when HR needs more information for change request',
   'employee_data_change_requests', true)
ON CONFLICT (code) DO NOTHING;