-- =========================================================
-- LEARNING & DEVELOPMENT REMINDER EVENT TYPES SEED
-- Industry-aligned templates following Workday/SAP/Cornerstone patterns
-- =========================================================

-- ===============================================
-- CATEGORY A: Course Enrollment & Progress
-- ===============================================

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'LMS_ENROLLMENT_CONFIRMATION', 'Course Enrollment Confirmed', 
       'Welcome notification when learner is enrolled in a course', 
       'training', 'lms_enrollments', 'enrolled_at', true, true, 10
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'LMS_ENROLLMENT_CONFIRMATION');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'LMS_ENROLLMENT_EXPIRING', 'Enrollment Expiring', 
       'Final warning before course enrollment expires without completion', 
       'training', 'lms_enrollments', 'due_date', true, true, 15
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'LMS_ENROLLMENT_EXPIRING');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'LMS_COURSE_REMINDER', 'Course Completion Reminder', 
       'Periodic nudge for incomplete courses approaching due date', 
       'training', 'lms_enrollments', 'due_date', true, true, 20
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'LMS_COURSE_REMINDER');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'LMS_OVERDUE_TRAINING', 'Overdue Training Alert', 
       'Escalation notification when training is past due date', 
       'training', 'lms_enrollments', 'due_date', true, true, 25
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'LMS_OVERDUE_TRAINING');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'LMS_PROGRESS_STALLED', 'Learning Progress Stalled', 
       'Alert when no learning progress detected for extended period', 
       'training', 'lms_lesson_progress', 'updated_at', true, true, 28
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'LMS_PROGRESS_STALLED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'LMS_COURSE_COMPLETED', 'Course Completed', 
       'Congratulations notification when course is successfully completed', 
       'training', 'lms_enrollments', 'completed_at', true, true, 29
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'LMS_COURSE_COMPLETED');

-- ===============================================
-- CATEGORY B: Assessment & Certification
-- ===============================================

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'LMS_QUIZ_DEADLINE', 'Quiz Deadline Approaching', 
       'Reminder to complete in-progress quiz before time expires', 
       'training', 'lms_quiz_attempts', 'created_at', true, true, 40
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'LMS_QUIZ_DEADLINE');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'LMS_QUIZ_FAILED', 'Quiz Failed - Retake Available', 
       'Notification when quiz failed with retake attempts remaining', 
       'training', 'lms_quiz_attempts', 'submitted_at', true, true, 42
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'LMS_QUIZ_FAILED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'LMS_CERTIFICATE_ISSUED', 'Certificate Issued', 
       'Notification when course completion certificate is generated', 
       'training', 'lms_certificates', 'issued_at', true, true, 50
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'LMS_CERTIFICATE_ISSUED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'LMS_CERTIFICATE_EXPIRING', 'Certificate Expiring', 
       'Reminder when LMS course certificate is approaching expiry', 
       'training', 'lms_certificates', 'expires_at', true, true, 55
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'LMS_CERTIFICATE_EXPIRING');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'LMS_RECERTIFICATION_DUE', 'Recertification Due', 
       'Trigger to start recertification process before certificate expires', 
       'training', 'lms_certificates', 'expires_at', true, true, 58
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'LMS_RECERTIFICATION_DUE');

-- ===============================================
-- CATEGORY C: Training Requests & Approvals
-- ===============================================

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'TRAINING_REQUEST_SUBMITTED', 'Training Request Submitted', 
       'Confirmation to employee when training request is submitted', 
       'training', 'training_requests', 'created_at', true, true, 60
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'TRAINING_REQUEST_SUBMITTED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'TRAINING_REQUEST_APPROVED', 'Training Request Approved', 
       'Notification when training request has been approved', 
       'training', 'training_requests', 'approved_at', true, true, 62
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'TRAINING_REQUEST_APPROVED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'TRAINING_REQUEST_REJECTED', 'Training Request Rejected', 
       'Notification when training request has been rejected with reason', 
       'training', 'training_requests', 'updated_at', true, true, 64
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'TRAINING_REQUEST_REJECTED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'TRAINING_REQUEST_PENDING', 'Training Request Pending Approval', 
       'Reminder to approvers about pending training requests', 
       'training', 'training_requests', 'created_at', true, true, 66
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'TRAINING_REQUEST_PENDING');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'TRAINING_BUDGET_ALERT', 'Training Budget Threshold', 
       'Alert when department training budget is nearing limit', 
       'training', 'training_budgets', 'updated_at', true, true, 68
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'TRAINING_BUDGET_ALERT');

-- ===============================================
-- CATEGORY D: ILT/Vendor Sessions
-- ===============================================

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'VENDOR_SESSION_REMINDER', 'Vendor Session Reminder', 
       'Reminder before scheduled ILT or virtual classroom session', 
       'training', 'training_vendor_sessions', 'start_date', true, true, 70
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'VENDOR_SESSION_REMINDER');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'VENDOR_SESSION_REG_DEADLINE', 'Registration Deadline Approaching', 
       'Reminder before session registration deadline closes', 
       'training', 'training_vendor_sessions', 'registration_deadline', true, true, 72
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'VENDOR_SESSION_REG_DEADLINE');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'VENDOR_SESSION_CONFIRMED', 'Session Registration Confirmed', 
       'Confirmation when employee registers for vendor session', 
       'training', 'vendor_session_enrollments', 'created_at', true, true, 74
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'VENDOR_SESSION_CONFIRMED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'VENDOR_SESSION_CANCELLED', 'Session Cancelled', 
       'Notification when scheduled vendor session is cancelled', 
       'training', 'training_vendor_sessions', 'updated_at', true, true, 76
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'VENDOR_SESSION_CANCELLED');

-- ===============================================
-- CATEGORY E: External Training & Verification
-- ===============================================

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'EXTERNAL_TRAINING_SUBMITTED', 'External Training Submitted', 
       'Confirmation when employee submits external training record', 
       'training', 'external_training_records', 'created_at', true, true, 80
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'EXTERNAL_TRAINING_SUBMITTED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'EXTERNAL_TRAINING_VERIFIED', 'External Training Verified', 
       'Notification when HR verifies external training record', 
       'training', 'external_training_records', 'updated_at', true, true, 82
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'EXTERNAL_TRAINING_VERIFIED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'EXTERNAL_CERT_EXPIRING', 'External Certificate Expiring', 
       'Reminder when external training certificate is approaching expiry', 
       'training', 'external_training_records', 'certificate_expiry_date', true, true, 85
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'EXTERNAL_CERT_EXPIRING');

-- ===============================================
-- CATEGORY F: Post-Training Evaluation
-- ===============================================

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'TRAINING_EVALUATION_DUE', 'Training Evaluation Due', 
       'Reminder to complete post-training feedback (Kirkpatrick L1)', 
       'training', 'training_evaluation_responses', 'created_at', true, true, 90
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'TRAINING_EVALUATION_DUE');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active, sequence_order)
SELECT 'TRAINING_EVALUATION_REMINDER', 'Evaluation Follow-up', 
       'Follow-up reminder for incomplete post-training evaluations', 
       'training', 'training_evaluation_responses', 'updated_at', true, true, 92
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'TRAINING_EVALUATION_REMINDER');