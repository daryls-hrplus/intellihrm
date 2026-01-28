
# L&D Notifications & Reminders Seeding Plan
## Industry-Aligned Templates for Learning & Development

---

## Executive Summary

This plan implements **industry-standard notification and reminder event types** for the Learning & Development module, aligned with best practices from Workday Learning, SAP SuccessFactors, Cornerstone OnDemand, and SCORM compliance frameworks.

### Current State Analysis

| Component | Status | Gap |
|-----------|--------|-----|
| `training` category | EXISTS | Only 4 event types (minimal coverage) |
| LMS Certificate expiry | MISSING | No `lms_certificates.expires_at` trigger |
| Course enrollment notification | MISSING | No welcome/enrollment confirmation |
| Quiz/Assessment reminders | MISSING | No deadline or retake reminders |
| Training request status | MISSING | No approval/rejection notifications |
| Session/ILT reminders | MISSING | No vendor session date triggers |
| Recertification reminders | MISSING | No auto-recert triggers |
| Evaluation/Feedback due | MISSING | No post-training evaluation reminders |
| External training verification | MISSING | No status change notifications |

**Existing L&D Reminder Event Types (4 total):**
1. `TRAINING_DUE` - Training Due Date (lms_enrollments.due_date)
2. `TRAINING_START` - Training Starting (lms_courses.start_date)
3. `skill_expiry` - Competency/Skill Expiring (employee_competencies.end_date)
4. `safety_training_expiry` - Safety/HSE Training Expiring (hse_training_records.expiry_date)

---

## Industry-Standard L&D Reminder Event Types to Seed

### Category A: Course Enrollment & Progress (6 new types)

| Code | Name | Source Table | Date Field | Description |
|------|------|--------------|------------|-------------|
| `LMS_ENROLLMENT_CONFIRMATION` | Course Enrollment Confirmed | lms_enrollments | enrolled_at | Welcome notification when learner is enrolled |
| `LMS_ENROLLMENT_EXPIRING` | Enrollment Expiring | lms_enrollments | due_date | Final warning before enrollment expires |
| `LMS_COURSE_REMINDER` | Course Completion Reminder | lms_enrollments | due_date | Periodic nudge for incomplete courses |
| `LMS_OVERDUE_TRAINING` | Overdue Training Alert | lms_enrollments | due_date | Escalation when training is past due |
| `LMS_PROGRESS_STALLED` | Learning Progress Stalled | lms_lesson_progress | updated_at | No progress detected for X days |
| `LMS_COURSE_COMPLETED` | Course Completed | lms_enrollments | completed_at | Congratulations notification |

### Category B: Assessment & Certification (5 new types)

| Code | Name | Source Table | Date Field | Description |
|------|------|--------------|------------|-------------|
| `LMS_QUIZ_DEADLINE` | Quiz Deadline Approaching | lms_quiz_attempts | created_at | Reminder to complete started quiz |
| `LMS_QUIZ_FAILED` | Quiz Failed - Retake Available | lms_quiz_attempts | submitted_at | Notification when quiz failed with retakes remaining |
| `LMS_CERTIFICATE_ISSUED` | Certificate Issued | lms_certificates | issued_at | Notification when certificate is generated |
| `LMS_CERTIFICATE_EXPIRING` | Certificate Expiring | lms_certificates | expires_at | Recertification reminder |
| `LMS_RECERTIFICATION_DUE` | Recertification Due | lms_certificates | expires_at | Trigger to start recertification process |

### Category C: Training Requests & Approvals (5 new types)

| Code | Name | Source Table | Date Field | Description |
|------|------|--------------|------------|-------------|
| `TRAINING_REQUEST_SUBMITTED` | Training Request Submitted | training_requests | created_at | Confirmation to employee |
| `TRAINING_REQUEST_APPROVED` | Training Request Approved | training_requests | approved_at | Approval notification |
| `TRAINING_REQUEST_REJECTED` | Training Request Rejected | training_requests | updated_at | Rejection notification with reason |
| `TRAINING_REQUEST_PENDING` | Training Request Pending Approval | training_requests | created_at | Reminder to approvers |
| `TRAINING_BUDGET_ALERT` | Training Budget Threshold | training_budgets | updated_at | Alert when budget nearing limit |

### Category D: ILT/Vendor Sessions (4 new types)

| Code | Name | Source Table | Date Field | Description |
|------|------|--------------|------------|-------------|
| `VENDOR_SESSION_REMINDER` | Vendor Session Reminder | training_vendor_sessions | start_date | Reminder before ILT/virtual session |
| `VENDOR_SESSION_REGISTRATION_DEADLINE` | Registration Deadline Approaching | training_vendor_sessions | registration_deadline | Deadline to register for session |
| `VENDOR_SESSION_CONFIRMATION` | Session Registration Confirmed | vendor_session_enrollments | created_at | Confirmation of session registration |
| `VENDOR_SESSION_CANCELLED` | Session Cancelled | training_vendor_sessions | updated_at | Notification when session is cancelled |

### Category E: External Training & Verification (3 new types)

| Code | Name | Source Table | Date Field | Description |
|------|------|--------------|------------|-------------|
| `EXTERNAL_TRAINING_SUBMITTED` | External Training Submitted | external_training_records | created_at | Confirmation to employee |
| `EXTERNAL_TRAINING_VERIFIED` | External Training Verified | external_training_records | updated_at | HR approved the record |
| `EXTERNAL_CERT_EXPIRING` | External Certificate Expiring | external_training_records | certificate_expiry_date | Reminder for external cert renewal |

### Category F: Post-Training Evaluation (2 new types)

| Code | Name | Source Table | Date Field | Description |
|------|------|--------------|------------|-------------|
| `TRAINING_EVALUATION_DUE` | Training Evaluation Due | training_evaluation_responses | created_at | Reminder to complete post-training feedback |
| `TRAINING_EVALUATION_REMINDER` | Evaluation Reminder | training_evaluation_responses | updated_at | Follow-up for incomplete evaluations |

---

## Implementation Details

### Phase 1: Database Migration

**File:** `supabase/migrations/XXXXXX_seed_lnd_reminder_event_types.sql`

```sql
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
```

---

### Phase 2: Template Placeholder Enhancements

**File:** `src/components/reminders/templatePlaceholders.ts`

Add L&D-specific placeholders:

```typescript
// L&D-specific placeholders
{ key: '{course_name}', label: 'Course Name', description: 'Name of the training course' },
{ key: '{course_code}', label: 'Course Code', description: 'Course identifier code' },
{ key: '{enrollment_date}', label: 'Enrollment Date', description: 'Date enrolled in course' },
{ key: '{due_date}', label: 'Due Date', description: 'Training completion deadline' },
{ key: '{progress_percent}', label: 'Progress %', description: 'Current completion percentage' },
{ key: '{certificate_number}', label: 'Certificate #', description: 'Certificate number if issued' },
{ key: '{certificate_expiry}', label: 'Certificate Expiry', description: 'Certificate expiration date' },
{ key: '{training_provider}', label: 'Training Provider', description: 'Vendor or provider name' },
{ key: '{session_date}', label: 'Session Date', description: 'ILT/virtual session date' },
{ key: '{session_location}', label: 'Session Location', description: 'Training session location' },
{ key: '{quiz_score}', label: 'Quiz Score', description: 'Quiz result score' },
{ key: '{passing_score}', label: 'Passing Score', description: 'Required score to pass' },
{ key: '{retakes_remaining}', label: 'Retakes Remaining', description: 'Number of quiz retakes left' },
```

---

### Phase 3: Documentation Update

**File:** `src/components/enablement/learning-development-manual/sections/workflows/LndWorkflowHRHubIntegration.tsx`

Add a new section documenting all seeded notification types with their:
- Trigger conditions
- Default recipients (employee/manager/HR)
- Recommended reminder intervals
- Message template examples

---

## Summary of Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/XXXXXX_seed_lnd_reminder_event_types.sql` | CREATE | Seed 25 new L&D reminder event types |
| `src/components/reminders/templatePlaceholders.ts` | UPDATE | Add 13 L&D-specific placeholders |
| `LndWorkflowHRHubIntegration.tsx` | UPDATE | Document notification types in manual |

---

## Industry Alignment Verification

| Standard | Alignment |
|----------|-----------|
| **Workday Learning** | Enrollment confirmations, due date reminders, completion notifications |
| **SAP SuccessFactors** | Certificate expiry, recertification triggers, session reminders |
| **Cornerstone OnDemand** | Training request status, external training verification |
| **SCORM/xAPI** | Progress tracking, quiz completion, assessment notifications |
| **Kirkpatrick Model** | Post-training evaluation reminders (Level 1 reactions) |

---

## Post-Implementation Verification

```sql
-- Verify L&D reminder event type counts
SELECT category, COUNT(*) as count 
FROM reminder_event_types 
WHERE category = 'training' 
GROUP BY category;

-- Expected: training = 29 (4 existing + 25 new)

-- List all L&D event types
SELECT code, name, source_table, date_field 
FROM reminder_event_types 
WHERE category = 'training' 
ORDER BY sequence_order;
```

---

## Recommended Reminder Rule Defaults

After seeding event types, companies can configure rules with these industry-standard defaults:

| Event Type | Days Before | Recipients | Priority |
|------------|-------------|------------|----------|
| LMS_COURSE_REMINDER | 7, 3, 1 | Employee | Medium |
| LMS_ENROLLMENT_EXPIRING | 3, 1 | Employee, Manager | High |
| LMS_OVERDUE_TRAINING | -1, -3, -7 | Employee, Manager, HR | Critical |
| LMS_CERTIFICATE_EXPIRING | 90, 60, 30, 14 | Employee, Manager | High |
| LMS_RECERTIFICATION_DUE | 60, 30 | Employee, HR | High |
| VENDOR_SESSION_REMINDER | 7, 1 | Employee | Medium |
| TRAINING_EVALUATION_DUE | 3, 1 | Employee | Medium |
