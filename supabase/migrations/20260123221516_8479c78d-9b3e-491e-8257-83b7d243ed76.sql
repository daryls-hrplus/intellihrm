-- Add scheduled job for recertification reminders
INSERT INTO scheduled_jobs (
  job_name, 
  job_description, 
  edge_function_name, 
  is_enabled, 
  interval_minutes, 
  run_days
) VALUES (
  'recertification-reminders',
  'Process expiring certifications and auto-create renewal training requests',
  'process-recertification-reminders',
  true, 
  1440, -- Run daily (every 24 hours)
  ARRAY[1,2,3,4,5] -- Weekdays only (Monday=1 through Friday=5)
)
ON CONFLICT (job_name) DO NOTHING;