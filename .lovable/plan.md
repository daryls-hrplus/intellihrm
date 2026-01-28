

# L&D Manual Update Plan
## Documenting Seeded Workflows & Notifications Across Chapters

---

## Current State

The `LndWorkflowHRHubIntegration.tsx` file (Section 4.13) was previously updated and now contains:
- Complete documentation of all 5 seeded workflow templates
- Complete documentation of all 25 notification event types with recommended intervals
- Confirmation alerts showing the templates and notifications are configured

However, **cross-references are missing** from related sections that should link back to these seeded configurations.

---

## Files to Update

### 1. LndWorkflowCertification.tsx (Section 4.12)

**Current State:** Basic certification generation flow without notification references

**Updates Required:**
- Add a "Notification Integration" card documenting:
  - `LMS_CERTIFICATE_ISSUED` - triggered when certificate is generated
  - `LMS_CERTIFICATE_EXPIRING` - triggered 90/60/30/14 days before expiry
  - `LMS_RECERTIFICATION_DUE` - triggered for recertification action
- Add cross-reference to Section 4.13 for configuration details

### 2. LndWorkflowEnrollment.tsx (Section 4.2)

**Current State:** Basic enrollment sources diagram without notification references

**Updates Required:**
- Add a "Notification Integration" card documenting:
  - `LMS_ENROLLMENT_CONFIRMATION` - triggered on enrollment
  - `LMS_COURSE_REMINDER` - triggered approaching due date
  - `LMS_ENROLLMENT_EXPIRING` - triggered before enrollment expires
- Add note about automatic welcome notifications

### 3. LndWorkflowProgressTracking.tsx (Section 4.9)

**Current State:** Basic progress data model without stalled progress alerts

**Updates Required:**
- Add a "Notification Integration" card documenting:
  - `LMS_PROGRESS_STALLED` - triggered when no progress for X days
  - `LMS_OVERDUE_TRAINING` - triggered when past due date
- Add section on proactive engagement through notifications

### 4. LndWorkflowQuizDelivery.tsx (Section 4.10)

**Current State:** Quiz attempt flow without notification references

**Updates Required:**
- Add a "Notification Integration" card documenting:
  - `LMS_QUIZ_DEADLINE` - triggered approaching quiz timeout
  - `LMS_QUIZ_FAILED` - triggered when failed with retakes available
- Add placeholder replacement examples (`{quiz_score}`, `{passing_score}`, `{retakes_remaining}`)

### 5. LndWorkflowExternalRecords.tsx (Section 4.14)

**Current State:** Basic external record entry without workflow or notification references

**Updates Required:**
- Add "Verification Workflow" card referencing `EXTERNAL_TRAINING_VERIFICATION` template (1 step, HR approval)
- Add "Notification Integration" card documenting:
  - `EXTERNAL_TRAINING_SUBMITTED` - confirmation to employee
  - `EXTERNAL_TRAINING_VERIFIED` - HR verification complete
  - `EXTERNAL_CERT_EXPIRING` - external certificate approaching expiry

### 6. LndWorkflowRequestSelfService.tsx (Section 4.5)

**Current State:** Basic self-service flow without workflow template references

**Updates Required:**
- Add reference to `TRAINING_REQUEST_APPROVAL` template (3-step workflow: Manager → HR → Finance)
- Add "Notification Integration" card documenting:
  - `TRAINING_REQUEST_SUBMITTED` - confirmation to employee
  - `TRAINING_REQUEST_APPROVED` - approval notification
  - `TRAINING_REQUEST_REJECTED` - rejection with reason
  - `TRAINING_REQUEST_PENDING` - reminder to approvers

### 7. LndWorkflowVirtualClassroom.tsx (Section 4.17)

**Current State:** Virtual session features without notification references

**Updates Required:**
- Add "Notification Integration" card documenting:
  - `VENDOR_SESSION_REMINDER` - 7, 1 day before session
  - `VENDOR_SESSION_REG_DEADLINE` - registration deadline approaching
  - `VENDOR_SESSION_CONFIRMED` - registration confirmation
  - `VENDOR_SESSION_CANCELLED` - session cancellation alert

### 8. LndIntegrationComponents.tsx (Section 8.8)

**Current State:** Minimal "Workflow Engine" placeholder

**Updates Required:**
- Expand `LndIntegrationWorkflowEngine` to include:
  - Reference to 5 seeded L&D workflow templates
  - Link to Section 4.13 for detailed configuration
  - Summary of SLA tracking and escalation features

### 9. LndSetupCompliance.tsx (Section 2.8)

**Current State:** References reminder_days_before field but not specific event types

**Updates Required:**
- Add a "Notification Event Types" card listing compliance-related triggers:
  - `LMS_COURSE_REMINDER`
  - `LMS_ENROLLMENT_EXPIRING`
  - `LMS_OVERDUE_TRAINING`
  - `LMS_CERTIFICATE_EXPIRING`
- Add cross-reference to Admin → Reminder Management for rule configuration

---

## Technical Implementation

### Pattern for Notification Integration Cards

Each updated section will include a standardized card pattern:

```tsx
<Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-base">
      <Bell className="h-5 w-5 text-blue-600" />
      Notification Integration
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground mb-3">
      The following notification event types are seeded and available for this workflow:
    </p>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event Code</TableHead>
          <TableHead>Trigger</TableHead>
          <TableHead>Recommended Intervals</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Event type rows */}
      </TableBody>
    </Table>
    <p className="text-xs text-muted-foreground mt-3">
      Configure reminder rules in <strong>Admin → Reminder Management</strong>. 
      See Section 4.13 for complete event type reference.
    </p>
  </CardContent>
</Card>
```

### Pattern for Workflow Template References

For sections involving approval workflows:

```tsx
<Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
  <CheckCircle2 className="h-4 w-4 text-green-600" />
  <AlertTitle>Workflow Template Available</AlertTitle>
  <AlertDescription>
    The <code className="bg-muted px-1 rounded">TEMPLATE_CODE</code> workflow template 
    is pre-configured with X approval steps. Enable in 
    <strong> Performance → Setup → Approval Workflows</strong>.
  </AlertDescription>
</Alert>
```

---

## Summary of Changes

| File | Section | Changes |
|------|---------|---------|
| `LndWorkflowCertification.tsx` | 4.12 | Add 3 certificate notification types + cross-reference |
| `LndWorkflowEnrollment.tsx` | 4.2 | Add 3 enrollment notification types |
| `LndWorkflowProgressTracking.tsx` | 4.9 | Add 2 progress/overdue notification types |
| `LndWorkflowQuizDelivery.tsx` | 4.10 | Add 2 quiz notification types + placeholders |
| `LndWorkflowExternalRecords.tsx` | 4.14 | Add verification workflow + 3 notification types |
| `LndWorkflowRequestSelfService.tsx` | 4.5 | Add workflow template reference + 4 notification types |
| `LndWorkflowVirtualClassroom.tsx` | 4.17 | Add 4 session notification types |
| `LndIntegrationComponents.tsx` | 8.8 | Expand with 5 workflow templates summary |
| `LndSetupCompliance.tsx` | 2.8 | Add compliance notification event types reference |

---

## Verification Checklist

After implementation:
- [ ] All 25 notification event types are documented across relevant sections
- [ ] All 5 workflow templates are referenced in appropriate sections
- [ ] Cross-references to Section 4.13 are consistent
- [ ] Admin → Reminder Management navigation path is documented
- [ ] Performance → Setup → Approval Workflows navigation path is documented

