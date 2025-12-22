-- Add missing event types for comprehensive coverage
-- Check if they don't already exist before inserting

INSERT INTO reminder_event_types (
  code, name, description, category, source_table, date_field, is_active, is_system
) 
SELECT 'membership_expiry', 'Professional Membership Expiring', 'Reminder when employee professional membership is about to expire', 'document', 'employee_memberships', 'end_date', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'membership_expiry');

INSERT INTO reminder_event_types (
  code, name, description, category, source_table, date_field, is_active, is_system
) 
SELECT 'union_membership_end', 'Union Membership Ending', 'Reminder when union membership is ending', 'document', 'union_memberships', 'leave_date', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'union_membership_end');

INSERT INTO reminder_event_types (
  code, name, description, category, source_table, date_field, is_active, is_system
) 
SELECT 'skill_expiry', 'Skill/Competency Expiring', 'Reminder when employee skill certification expires', 'training', 'employee_skills', 'expiry_date', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'skill_expiry');

INSERT INTO reminder_event_types (
  code, name, description, category, source_table, date_field, is_active, is_system
) 
SELECT 'training_due', 'Training Due/Overdue', 'Reminder for required training completion', 'training', 'learning_assignments', 'due_date', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'training_due');

INSERT INTO reminder_event_types (
  code, name, description, category, source_table, date_field, is_active, is_system
) 
SELECT 'benefit_enrollment_deadline', 'Benefits Enrollment Deadline', 'Reminder for benefits enrollment period ending', 'benefits', 'benefit_enrollment_periods', 'end_date', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'benefit_enrollment_deadline');

INSERT INTO reminder_event_types (
  code, name, description, category, source_table, date_field, is_active, is_system
) 
SELECT 'insurance_expiry', 'Insurance Policy Expiring', 'Reminder when employee insurance policy expires', 'benefits', 'benefit_enrollments', 'termination_date', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'insurance_expiry');

INSERT INTO reminder_event_types (
  code, name, description, category, source_table, date_field, is_active, is_system
) 
SELECT 'appraisal_deadline', 'Appraisal/Review Deadline', 'Reminder for performance appraisal deadline', 'performance', 'appraisal_cycles', 'evaluation_deadline', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'appraisal_deadline');

INSERT INTO reminder_event_types (
  code, name, description, category, source_table, date_field, is_active, is_system
) 
SELECT 'document_expiry', 'Document Expiring', 'Reminder when employee document expires', 'document', 'employee_documents', 'expiry_date', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'document_expiry');