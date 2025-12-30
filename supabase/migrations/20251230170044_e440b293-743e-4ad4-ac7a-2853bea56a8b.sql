-- Add new performance-related event types for Employee Voice feature
INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active) 
SELECT 'REVIEW_RESPONSE_REQUIRED', 'Manager Review Response Required', 'Reminder for employee to respond to manager review', 'performance', 'appraisal_participants', 'employee_response_due_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'REVIEW_RESPONSE_REQUIRED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active) 
SELECT 'REVIEW_RESPONSE_DEADLINE', 'Response Deadline Approaching', 'Urgent reminder when response deadline is near', 'performance', 'appraisal_participants', 'employee_response_due_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'REVIEW_RESPONSE_DEADLINE');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active) 
SELECT 'EMPLOYEE_ESCALATION_NEW', 'New Employee Escalation', 'HR notification when employee escalates review response', 'performance', 'employee_review_responses', 'escalated_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'EMPLOYEE_ESCALATION_NEW');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active) 
SELECT 'MANAGER_REBUTTAL_RECEIVED', 'Manager Responded to Your Feedback', 'Notification when manager responds to employee feedback', 'performance', 'employee_review_responses', 'manager_rebuttal_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'MANAGER_REBUTTAL_RECEIVED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active) 
SELECT 'HR_ESCALATION_RESOLVED', 'HR Resolved Your Escalation', 'Notification when HR resolves employee escalation', 'performance', 'employee_review_responses', 'hr_reviewed_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'HR_ESCALATION_RESOLVED');

-- Add new notification preference columns for performance reviews
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS performance_review_updates BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS review_response_reminders BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS escalation_updates BOOLEAN DEFAULT TRUE;