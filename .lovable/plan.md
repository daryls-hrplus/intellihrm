
# L&D Reminder Handlers Implementation Plan
## Making the 25 Seeded Event Types Actually Work

---

## Executive Summary

This plan adds **25 case handlers** to the `process-reminders` edge function to activate all seeded L&D notification event types. The handlers will query the correct source tables (`lms_enrollments`, `lms_certificates`, `training_requests`, etc.) and generate employee reminders following the established patterns in the function.

---

## Current Architecture Analysis

### Pattern Used in `process-reminders/index.ts`

Each event type follows this pattern:

```typescript
case 'EVENT_TYPE_CODE': {
  const { data: records } = await supabase
    .from('source_table')
    .select(`
      id, date_field,
      profiles:employee_id(id, full_name, email, company_id, ...)
    `)
    .eq('date_field', targetDateStr)
    // Additional filters
    
  records = (results || [])
    .filter((r) => r.profiles?.company_id === rule.company_id)
    .map((r) => ({
      id: r.id,
      employee: r.profiles,
      eventDate: r.date_field,
      itemName: 'Display Name',
      sourceTable: 'source_table'
    }));
  break;
}
```

### Key Considerations

1. **Company Scoping**: LMS tables don't have direct `company_id` - must join through `profiles` or `lms_courses`
2. **Date Matching**: Use `targetDateStr` for date-based events
3. **Status Filtering**: Filter by appropriate status values (`enrolled`, `in_progress`, `pending`, etc.)
4. **Placeholder Data**: Enhanced placeholders (`{course_name}`, `{progress_percent}`, etc.) already exist in `templatePlaceholders.ts`

---

## Implementation Details

### File to Modify

**`supabase/functions/process-reminders/index.ts`**

Add 25 new case handlers inside the switch statement (after line 1043, before `default:`).

---

## Case Handler Specifications

### Category A: Course Enrollment & Progress (6 handlers)

#### 1. LMS_ENROLLMENT_CONFIRMATION
- **Trigger**: Day employee is enrolled
- **Source Table**: `lms_enrollments`
- **Date Field**: `enrolled_at` (timestamp, convert to date)
- **Filter**: `status = 'enrolled'`
- **Item Name**: Course title from `lms_courses`

```typescript
case 'LMS_ENROLLMENT_CONFIRMATION': {
  // Get today's date for comparison
  const { data: enrollments } = await supabase
    .from('lms_enrollments')
    .select(`
      id, enrolled_at, status, progress_percentage, due_date,
      course:lms_courses!inner(id, title, company_id),
      profiles:user_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
    `)
    .gte('enrolled_at', `${targetDateStr}T00:00:00`)
    .lt('enrolled_at', `${targetDateStr}T23:59:59`);
  
  records = (enrollments || [])
    .filter((e: any) => e.profiles?.company_id === rule.company_id || e.course?.company_id === rule.company_id)
    .map((e: any) => ({
      id: e.id,
      employee: e.profiles,
      eventDate: e.enrolled_at?.split('T')[0] || targetDateStr,
      itemName: e.course?.title || 'Course Enrollment',
      sourceTable: 'lms_enrollments'
    }));
  break;
}
```

#### 2. LMS_ENROLLMENT_EXPIRING
- **Trigger**: X days before `due_date`
- **Source Table**: `lms_enrollments`
- **Date Field**: `due_date`
- **Filter**: `status NOT IN ('completed', 'passed')`

#### 3. LMS_COURSE_REMINDER
- **Trigger**: X days before `due_date`
- **Source Table**: `lms_enrollments`
- **Date Field**: `due_date`
- **Filter**: `status = 'in_progress'` AND `progress_percentage < 100`

#### 4. LMS_OVERDUE_TRAINING
- **Trigger**: Negative days (after due_date)
- **Source Table**: `lms_enrollments`
- **Date Field**: `due_date`
- **Filter**: `status NOT IN ('completed', 'passed')` AND `due_date < today`

#### 5. LMS_PROGRESS_STALLED
- **Trigger**: No `updated_at` change in X days
- **Source Table**: `lms_enrollments`
- **Logic**: `updated_at < (today - X days)` AND `status = 'in_progress'`

#### 6. LMS_COURSE_COMPLETED
- **Trigger**: Day course is completed
- **Source Table**: `lms_enrollments`
- **Date Field**: `completed_at`
- **Filter**: `status = 'completed'`

---

### Category B: Assessment & Certification (5 handlers)

#### 7. LMS_QUIZ_DEADLINE
- **Source Table**: `lms_quiz_attempts`
- **Logic**: Started but not submitted, approaching time limit
- **Filter**: `submitted_at IS NULL`

#### 8. LMS_QUIZ_FAILED
- **Source Table**: `lms_quiz_attempts`
- **Date Field**: `submitted_at`
- **Filter**: `passed = false` AND `attempt_number < max_attempts`

#### 9. LMS_CERTIFICATE_ISSUED
- **Source Table**: `lms_certificates`
- **Date Field**: `issued_at`
- **Filter**: None (notification only)

#### 10. LMS_CERTIFICATE_EXPIRING
- **Source Table**: `lms_certificates`
- **Date Field**: `expires_at`
- **Filter**: `expires_at IS NOT NULL`

#### 11. LMS_RECERTIFICATION_DUE
- **Source Table**: `lms_certificates`
- **Date Field**: `expires_at`
- **Filter**: Same as above, different messaging for action

---

### Category C: Training Requests & Approvals (5 handlers)

#### 12. TRAINING_REQUEST_SUBMITTED
- **Source Table**: `training_requests`
- **Date Field**: `created_at`
- **Filter**: `status = 'pending'`

#### 13. TRAINING_REQUEST_APPROVED
- **Source Table**: `training_requests`
- **Date Field**: `approved_at`
- **Filter**: `status = 'approved'`

#### 14. TRAINING_REQUEST_REJECTED
- **Source Table**: `training_requests`
- **Date Field**: `updated_at`
- **Filter**: `status = 'rejected'`

#### 15. TRAINING_REQUEST_PENDING
- **Source Table**: `training_requests`
- **Date Field**: `created_at`
- **Filter**: `status = 'pending'`, reminder to approvers

#### 16. TRAINING_BUDGET_ALERT
- **Note**: Deferred - requires `training_budgets` table analysis
- **Placeholder handler logging "Not yet implemented"**

---

### Category D: ILT/Vendor Sessions (4 handlers)

#### 17. VENDOR_SESSION_REMINDER
- **Source Table**: `training_vendor_sessions` → `vendor_session_enrollments`
- **Date Field**: `start_date`
- **Filter**: `status = 'scheduled'`, employee enrolled

#### 18. VENDOR_SESSION_REG_DEADLINE
- **Source Table**: `training_vendor_sessions`
- **Date Field**: `registration_deadline`
- **Filter**: `status = 'scheduled'`, capacity not full

#### 19. VENDOR_SESSION_CONFIRMED
- **Source Table**: `vendor_session_enrollments`
- **Date Field**: `confirmed_at`
- **Filter**: `status = 'confirmed'`

#### 20. VENDOR_SESSION_CANCELLED
- **Source Table**: `training_vendor_sessions`
- **Date Field**: `updated_at`
- **Filter**: `status = 'cancelled'`

---

### Category E: External Training & Verification (3 handlers)

#### 21. EXTERNAL_TRAINING_SUBMITTED
- **Source Table**: `external_training_records`
- **Date Field**: `created_at`
- **Filter**: Recently created (confirmation)

#### 22. EXTERNAL_TRAINING_VERIFIED
- **Source Table**: `external_training_records`
- **Date Field**: `updated_at`
- **Logic**: Needs verification status field or join

#### 23. EXTERNAL_CERT_EXPIRING
- **Source Table**: `external_training_records`
- **Date Field**: `certificate_expiry_date`
- **Filter**: `certificate_received = true`

---

### Category F: Post-Training Evaluation (2 handlers)

#### 24. TRAINING_EVALUATION_DUE
- **Note**: Requires `training_evaluation_responses` table
- **Placeholder handler if table doesn't exist

#### 25. TRAINING_EVALUATION_REMINDER
- **Same as above, follow-up reminder

---

## Enhanced Placeholder Replacement

Update `replaceMessagePlaceholders` function to handle L&D-specific placeholders:

```typescript
// Add to replaceMessagePlaceholders function (around line 96-137)
.replace(/{course_name}/gi, data.courseName || data.itemName || '')
.replace(/{progress_percent}/gi, data.progressPercent?.toString() || '0')
.replace(/{due_date}/gi, data.dueDate || data.eventDate)
.replace(/{certificate_number}/gi, data.certificateNumber || '')
.replace(/{training_provider}/gi, data.trainingProvider || '')
.replace(/{session_date}/gi, data.sessionDate || data.eventDate)
.replace(/{session_location}/gi, data.sessionLocation || '')
.replace(/{quiz_score}/gi, data.quizScore?.toString() || '')
.replace(/{passing_score}/gi, data.passingScore?.toString() || '')
.replace(/\{\{course_name\}\}/gi, data.courseName || data.itemName || '')
.replace(/\{\{progress_percent\}\}/gi, data.progressPercent?.toString() || '0')
// ... additional double-curly variants
```

---

## Summary of Changes

| File | Action | Lines Modified |
|------|--------|----------------|
| `supabase/functions/process-reminders/index.ts` | UPDATE | +400-500 lines (25 case handlers) |
| `supabase/functions/process-reminders/index.ts` | UPDATE | ~40 lines (enhanced placeholder function) |

---

## Sample Case Handler Structure

```typescript
// ========================
// L&D: COURSE ENROLLMENT & PROGRESS
// ========================

case 'LMS_ENROLLMENT_CONFIRMATION': {
  const { data: enrollments } = await supabase
    .from('lms_enrollments')
    .select(`
      id, enrolled_at, status, progress_percentage, due_date,
      course:lms_courses(id, title, code, company_id),
      profiles:user_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
    `)
    .gte('enrolled_at', `${targetDateStr}T00:00:00`)
    .lt('enrolled_at', `${targetDateStr}T23:59:59`);
  
  records = (enrollments || [])
    .filter((e: any) => {
      const empCompany = e.profiles?.company_id;
      const courseCompany = e.course?.company_id;
      return empCompany === rule.company_id || courseCompany === rule.company_id;
    })
    .map((e: any) => ({
      id: e.id,
      employee: e.profiles,
      eventDate: e.enrolled_at?.split('T')[0] || targetDateStr,
      itemName: e.course?.title || 'Course Enrollment',
      sourceTable: 'lms_enrollments'
    }));
  break;
}

case 'LMS_COURSE_REMINDER':
case 'LMS_ENROLLMENT_EXPIRING': {
  const { data: enrollments } = await supabase
    .from('lms_enrollments')
    .select(`
      id, due_date, status, progress_percentage,
      course:lms_courses(id, title, code, company_id),
      profiles:user_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
    `)
    .eq('due_date', targetDateStr)
    .not('status', 'in', '("completed","passed")');
  
  records = (enrollments || [])
    .filter((e: any) => {
      const empCompany = e.profiles?.company_id;
      const courseCompany = e.course?.company_id;
      return empCompany === rule.company_id || courseCompany === rule.company_id;
    })
    .map((e: any) => ({
      id: e.id,
      employee: e.profiles,
      eventDate: e.due_date,
      itemName: e.course?.title || 'Training Course',
      sourceTable: 'lms_enrollments'
    }));
  break;
}

case 'LMS_OVERDUE_TRAINING': {
  // For overdue, we look BEFORE targetDate (negative days_before)
  const { data: enrollments } = await supabase
    .from('lms_enrollments')
    .select(`
      id, due_date, status, progress_percentage,
      course:lms_courses(id, title, code, company_id),
      profiles:user_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
    `)
    .eq('due_date', targetDateStr)
    .not('status', 'in', '("completed","passed")');
  
  records = (enrollments || [])
    .filter((e: any) => {
      const empCompany = e.profiles?.company_id;
      const courseCompany = e.course?.company_id;
      return empCompany === rule.company_id || courseCompany === rule.company_id;
    })
    .map((e: any) => ({
      id: e.id,
      employee: e.profiles,
      eventDate: e.due_date,
      itemName: `OVERDUE: ${e.course?.title || 'Training Course'}`,
      sourceTable: 'lms_enrollments'
    }));
  break;
}

case 'LMS_COURSE_COMPLETED': {
  const { data: enrollments } = await supabase
    .from('lms_enrollments')
    .select(`
      id, completed_at, status, progress_percentage,
      course:lms_courses(id, title, code, company_id),
      profiles:user_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
    `)
    .eq('status', 'completed')
    .gte('completed_at', `${targetDateStr}T00:00:00`)
    .lt('completed_at', `${targetDateStr}T23:59:59`);
  
  records = (enrollments || [])
    .filter((e: any) => {
      const empCompany = e.profiles?.company_id;
      const courseCompany = e.course?.company_id;
      return empCompany === rule.company_id || courseCompany === rule.company_id;
    })
    .map((e: any) => ({
      id: e.id,
      employee: e.profiles,
      eventDate: e.completed_at?.split('T')[0] || targetDateStr,
      itemName: `Completed: ${e.course?.title || 'Course'}`,
      sourceTable: 'lms_enrollments'
    }));
  break;
}

// ... Additional 21 case handlers following same pattern
```

---

## Verification Query

After implementation, run this to verify handlers work:

```sql
-- Create a test reminder rule for one of the new event types
INSERT INTO reminder_rules (
  company_id, event_type_id, name, days_before, 
  send_to_employee, notification_method, is_active
)
SELECT 
  'YOUR_COMPANY_ID',
  ret.id,
  'Test LMS Enrollment Reminder',
  7,
  true,
  'in_app',
  true
FROM reminder_event_types ret
WHERE ret.code = 'LMS_COURSE_REMINDER';

-- Then invoke edge function and check logs
```

---

## Technical Notes

1. **Timestamp vs Date**: LMS tables use timestamps (`enrolled_at`, `completed_at`), so queries use range filtering (`>=` and `<`) instead of exact date match
2. **Company Scoping**: LMS enrollments link user via `user_id` to `profiles`, which has `company_id`. Course may also have `company_id`.
3. **Combined Cases**: Some handlers can share logic (e.g., `LMS_COURSE_REMINDER` and `LMS_ENROLLMENT_EXPIRING` query same data with different messaging)
4. **Progress Stalled**: Requires comparing `updated_at` against a threshold, not a target date

---

## Post-Implementation Testing

1. Deploy edge function
2. Create test reminder rules for each event type
3. Insert test data in `lms_enrollments` with appropriate dates
4. Invoke `process-reminders` function
5. Verify `employee_reminders` table has new records
6. Check edge function logs for processing output
