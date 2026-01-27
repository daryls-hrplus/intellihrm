

# Chapter 6 Gap Closure Plan: 95% → 100% Alignment

## Overview

This plan addresses the remaining 8 gaps identified in the Chapter 6 audit to achieve full alignment between documentation, database schema, and UI components.

---

## Priority 1: Field Naming and Requirement Corrections

### Task 1.1: Fix Jobs Table Field Names in KeyPositionIdentification.tsx

**File:** `src/components/enablement/manual/succession/sections/successionplans/KeyPositionIdentification.tsx`

**Current Documentation vs Actual Database:**

| Documented | Actual DB Field | Action |
|------------|-----------------|--------|
| `job_code` | `code` | Rename |
| `title` | `name` | Rename |
| `level` | `job_level` | Rename |

**Changes:**
- Locate the jobs table field reference array
- Update field name `job_code` to `code`
- Update field name `title` to `name`
- Update field name `level` to `job_level`

---

### Task 1.2: Fix start_date Requirement in SuccessionPlanCreation.tsx

**File:** `src/components/enablement/manual/succession/sections/successionplans/SuccessionPlanCreation.tsx`

**Gap:** `start_date` is documented as optional, but database shows `NOT NULL` with `CURRENT_DATE` default.

**Changes:**
- Find the `start_date` field in the succession_plans field reference
- Change `required: false` to `required: true`
- Update description to note the automatic default: "Plan start date. Defaults to current date if not specified."

---

### Task 1.3: Fix created_by Requirement in WorkflowApprovalConfiguration.tsx

**File:** `src/components/enablement/manual/succession/sections/successionplans/WorkflowApprovalConfiguration.tsx`

**Gap:** `created_by` in workflow_templates is documented as optional, but database shows `NOT NULL`.

**Changes:**
- Find `created_by` field in the workflowTemplateFields array
- Change `required: false` to `required: true`
- Update description: "User who created the template (system-populated)"

---

## Priority 2: Missing UI Feature Documentation

### Task 2.1: Document "Remove Key Position" Workflow

**File:** `src/components/enablement/manual/succession/sections/successionplans/KeyPositionIdentification.tsx`

**Location:** After the "Mark Position as Key" step-by-step procedure

**Content to Add:**

New Card with title "Remove Key Position"

**Step-by-Step Procedure:**
1. Navigate to Succession → Key Positions tab
2. Locate the key position to remove
3. Click the position row to expand details
4. Click "Remove Key Position" or the unlink icon
5. Confirm the removal in the dialog
6. System removes the key position designation

**Expected Result:** Position is unlinked from the key positions list. The underlying job's `is_key_position` flag is set to false.

**Technical Note Callout:**
Removing a key position does not delete the position or job record. It simply updates the `jobs.is_key_position` flag to `false`, which removes the position from the Key Positions view. Any existing succession plans for this position remain intact but should be reviewed.

---

### Task 2.2: Document Summary Statistics Dashboard

**File:** `src/components/enablement/manual/succession/sections/successionplans/KeyPositionIdentification.tsx`

**Location:** After the Technical Architecture Note

**Content to Add:**

New Card with title "Key Positions Dashboard"

**Description:**
The Key Positions tab displays summary statistics at the top of the view, providing quick insights into your organization's key position coverage.

**Metrics Displayed:**
- **Total Key Positions**: Count of all positions marked as key across the company
- **Covered Positions**: Positions with at least one active succession candidate
- **At-Risk Positions**: Positions with high vacancy or retirement risk
- **Coverage Percentage**: Ratio of covered to total key positions

**Usage:**
Use these metrics to quickly assess succession planning health and identify areas requiring attention.

---

## Priority 3: Completeness Enhancements

### Task 3.1: Expand Jobs Table Field Reference

**File:** `src/components/enablement/manual/succession/sections/successionplans/KeyPositionIdentification.tsx`

**Current:** 10 fields documented
**Target:** 18 fields (all from actual schema)

**Fields to Add:**

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `description` | No | Text | Detailed job description |
| `job_grade` | No | Text | Job grade/band classification |
| `start_date` | No | Date | Job effective start date |
| `end_date` | No | Date | Job effective end date |
| `critical_level` | No | Text | Job criticality (low/medium/high/critical) |
| `job_class` | No | Text | Job classification category |
| `reporting_unit_id` | No | UUID | Link to reporting unit |
| `job_family_id` | No | UUID | Link to job family |

---

### Task 3.2: Clarify Development Plan Inline Display

**File:** `src/components/enablement/manual/succession/sections/successionplans/CandidateNominationRanking.tsx`

**Location:** Within the existing development-related content

**Content to Add:**

Add a clarification note explaining:
- Development plan progress is displayed inline on candidate cards within the Succession Plans tab
- Each candidate card shows a progress bar with completion percentage
- Clicking the progress indicator navigates to the full development plan in the IDP module
- This provides at-a-glance visibility without leaving the succession context

---

### Task 3.3: Add Condensed Readiness Assessment Reference

**File:** `src/components/enablement/manual/succession/sections/successionplans/ReadinessAssessmentIntegration.tsx`

**Location:** After the cross-reference to Chapter 4

**Content to Add:**

Add a condensed field reference table for `readiness_assessment_events`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `candidate_id` | UUID | Link to succession candidate |
| `assessment_date` | Date | When assessment was conducted |
| `overall_score` | Numeric | Calculated readiness score (0-100) |
| `readiness_band` | Text | Mapped band (ready_now, ready_1_year, etc.) |
| `status` | Text | Assessment status (pending/completed) |
| `assessed_by` | UUID | User who completed assessment |

Add a note: "For complete field reference, see Chapter 4: Readiness Assessment Workflow."

---

## Implementation Summary

| Priority | Task | File | Changes |
|----------|------|------|---------|
| P1 | Fix job field names | KeyPositionIdentification.tsx | 3 field renames |
| P1 | Fix start_date requirement | SuccessionPlanCreation.tsx | 1 field update |
| P1 | Fix created_by requirement | WorkflowApprovalConfiguration.tsx | 1 field update |
| P2 | Document remove key position | KeyPositionIdentification.tsx | New procedure card |
| P2 | Document stats dashboard | KeyPositionIdentification.tsx | New info card |
| P3 | Expand jobs field reference | KeyPositionIdentification.tsx | 8 new fields |
| P3 | Clarify dev plan display | CandidateNominationRanking.tsx | New clarification note |
| P3 | Add readiness event reference | ReadinessAssessmentIntegration.tsx | Condensed field table |

**Total Changes:** 8 tasks across 5 files

**Estimated Lines:** ~250 lines

---

## Validation Checklist

After implementation:

**Priority 1:**
- [ ] Jobs table shows `code` (not `job_code`)
- [ ] Jobs table shows `name` (not `title`)
- [ ] Jobs table shows `job_level` (not `level`)
- [ ] `start_date` in succession_plans marked as required with default note
- [ ] `created_by` in workflow_templates marked as required

**Priority 2:**
- [ ] "Remove Key Position" procedure documented with 6 steps
- [ ] Technical note explains job unlinking behavior
- [ ] Dashboard metrics card shows 4 key metrics

**Priority 3:**
- [ ] Jobs table has 18 fields documented
- [ ] Development plan inline display clarified
- [ ] Readiness assessment condensed reference added with Chapter 4 cross-reference

