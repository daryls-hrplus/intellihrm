

# Chapter 6 Documentation Remediation Plan

## Summary

Based on the comprehensive audit comparing Chapter 6 documentation against the actual database schema and UI components, I have identified **25 specific gaps** that require correction. This plan details the exact changes needed to align documentation with the actual implementation.

---

## Phase 1: Critical Field Reference Corrections

### 1.1 PositionRiskAssessment.tsx (Section 6.3)

**File:** `src/components/enablement/manual/succession/sections/successionplans/PositionRiskAssessment.tsx`

**Gaps Identified:**

| Line | Current Documentation | Actual Database | Fix Required |
|------|----------------------|-----------------|--------------|
| 30 | `retirement_risk` type: Text, validation: 'none, low, medium, high' | Boolean, default: false | Change to Boolean type |
| 31 | `flight_risk` type: Text, validation: 'none, low, medium, high' | Boolean, default: false | Change to Boolean type |
| 32 | `market_competitiveness` field exists | **DOES NOT EXIST** | Remove field entirely |
| 34 | `last_assessed_at` field name | Actual name: `assessed_at` | Rename field |
| 26 | `criticality_level` default: 'medium' | Actual default: 'high' | Fix default value |
| Missing | `impact_if_vacant_en` not documented | EXISTS in DB | Add field |
| Missing | `risk_notes_en` not documented | EXISTS in DB | Add field |

**Changes to Make:**
- Update `keyPositionRiskFields` array (lines 21-38):
  - Line 26: Change `defaultValue` from 'medium' to 'high'
  - Line 30: Change `type` to 'Boolean', `defaultValue` to 'false', remove text validation
  - Line 31: Change `type` to 'Boolean', `defaultValue` to 'false', remove text validation
  - Line 32: Remove `market_competitiveness` field entirely
  - Line 34: Rename `last_assessed_at` to `assessed_at`
  - Add new field for `impact_if_vacant_en`
  - Add new field for `risk_notes_en`

---

### 1.2 WorkflowApprovalConfiguration.tsx (Section 6.10)

**File:** `src/components/enablement/manual/succession/sections/successionplans/WorkflowApprovalConfiguration.tsx`

**Gaps Identified - workflow_templates table:**

| Line | Current Documentation | Actual Database | Fix Required |
|------|----------------------|-----------------|--------------|
| 22 | `template_code` | Actual name: `code` | Rename field |
| 23 | `template_name` | Actual name: `name` | Rename field |
| 27 | `steps` JSONB array exists | **DOES NOT EXIST** | Remove field |
| Missing | Multiple fields not documented | `requires_signature`, `requires_letter`, `letter_template_id`, `auto_terminate_hours`, `allow_return_to_previous`, `start_date`, `end_date`, `is_global`, `department_id`, `section_id` | Add fields |

**Gaps Identified - company_transaction_workflow_settings table:**

| Line | Current Documentation | Actual Database | Fix Required |
|------|----------------------|-----------------|--------------|
| 35 | `transaction_type_code` (Text) | Actual: `transaction_type_id` (UUID FK) | Rename and change type |
| 36 | `requires_workflow` | Actual name: `workflow_enabled` | Rename field |
| Missing | Multiple fields not documented | `requires_approval_before_effective`, `auto_start_workflow`, `effective_date`, `end_date`, `is_active`, `created_by` | Add fields |

**Changes to Make:**
- Update `workflowTemplateFields` array (lines 19-30):
  - Rename `template_code` to `code`
  - Rename `template_name` to `name`
  - Remove `steps` field
  - Add: `is_global` (Boolean, default false)
  - Add: `requires_signature` (Boolean, default false)
  - Add: `requires_letter` (Boolean, default false)
  - Add: `letter_template_id` (UUID, optional)
  - Add: `auto_terminate_hours` (Integer, optional)
  - Add: `allow_return_to_previous` (Boolean, default true)
  - Add: `start_date` (Date, optional)
  - Add: `end_date` (Date, optional)
  - Add: `department_id` (UUID, optional)
  - Add: `section_id` (UUID, optional)

- Update `transactionWorkflowFields` array (lines 32-40):
  - Change `transaction_type_code` to `transaction_type_id` with type UUID
  - Rename `requires_workflow` to `workflow_enabled`
  - Add: `requires_approval_before_effective` (Boolean, default false)
  - Add: `auto_start_workflow` (Boolean, default false)
  - Add: `effective_date` (Date, optional)
  - Add: `end_date` (Date, optional)
  - Add: `is_active` (Boolean, default true)
  - Add: `created_by` (UUID, optional)

---

### 1.3 GapDevelopmentLinking.tsx (Section 6.8)

**File:** `src/components/enablement/manual/succession/sections/successionplans/GapDevelopmentLinking.tsx`

**Gaps Identified:**

| Line | Current Documentation | Actual Database | Fix Required |
|------|----------------------|-----------------|--------------|
| 22 | `candidate_id` required: true | is_nullable: YES | Change to optional |
| 23 | `company_id` required: true | is_nullable: YES | Change to optional |
| 25 | `gap_description` required: true | is_nullable: YES | Change to optional |
| 26 | `gap_severity` required: true | is_nullable: YES | Change to optional |
| 30 | `status` required: true | is_nullable: YES | Change to optional |
| 31 | `created_at` required: true | is_nullable: YES | Change to optional |
| 32 | `updated_at` required: true | is_nullable: YES | Change to optional |

**Changes to Make:**
- Update `gapDevelopmentFields` array (lines 20-33):
  - Line 22: Change `candidate_id` to `required: false`
  - Line 23: Change `company_id` to `required: false`
  - Line 25: Change `gap_description` to `required: false`
  - Line 26: Change `gap_severity` to `required: false`
  - Line 30: Change `status` to `required: false`
  - Line 31: Change `created_at` to `required: false`
  - Line 32: Change `updated_at` to `required: false`
- Update Business Rules (lines 103-110):
  - Line 104: Remove "Candidate required" rule or change to "Candidate optional"
  - Line 106: Change "Description required" to note it's recommended but optional

**Add Implementation Status Note:**
- Add a callout after the Navigation Path card explaining that Gap-Development Linking is managed primarily via integration with the IDP and Learning modules, not through a dedicated Succession UI tab.

---

### 1.4 CandidateEvidenceCollection.tsx (Section 6.9)

**File:** `src/components/enablement/manual/succession/sections/successionplans/CandidateEvidenceCollection.tsx`

**Gaps Identified:**

| Line | Current Documentation | Actual Database | Fix Required |
|------|----------------------|-----------------|--------------|
| 21 | `candidate_id` required: true | is_nullable: YES | Change to optional |
| 22 | `company_id` required: true | is_nullable: YES | Change to optional |
| 29 | `created_at` required: true | is_nullable: YES | Change to optional |

**Changes to Make:**
- Update `candidateEvidenceFields` array (lines 19-30):
  - Line 21: Change `candidate_id` to `required: false`
  - Line 22: Change `company_id` to `required: false`
  - Line 29: Change `created_at` to `required: false`
- Update Business Rules (lines 127-134):
  - Line 128: Soften "Candidate required" to indicate system recommendation

**Add Implementation Status Note:**
- Add a callout after the "Add Manual Evidence" step-by-step explaining that manual evidence upload UI is planned but not yet implemented. Evidence is currently auto-collected from Nine-Box and Talent Signals.

---

### 1.5 CandidateNominationRanking.tsx (Section 6.5)

**File:** `src/components/enablement/manual/succession/sections/successionplans/CandidateNominationRanking.tsx`

**Gaps Identified:**

| Line | Current Documentation | Actual Database | Fix Required |
|------|----------------------|-----------------|--------------|
| 29 | `ranking` defaultValue: 'null' | Actual default: 1 | Change default to '1' |

**Changes to Make:**
- Update `successionCandidateFields` array (line 29):
  - Change `defaultValue` from 'null' to '1'

---

## Phase 2: UI Feature Documentation

### 2.1 Add ValuesPromotionCheck Documentation (CandidateNominationRanking.tsx)

**Location:** After the "Candidate Card Display" card (after line 320)

**Content to Add:**
A new Card documenting the ValuesPromotionCheck component:
- **Title:** "Values Promotion Check"
- **Purpose:** Validates candidate against company values before promotion decisions
- **Integration:** Queries from `skills_competencies` where type='VALUE' and `appraisal_capability_scores`
- **Display Modes:** Compact (badge) and Full (detailed card with rating breakdown)
- **Key Fields:** `is_promotion_factor`, rating threshold (>=3 meets criteria)
- **Visual:** Badge showing "Values OK" (green) or "X/Y Values" (amber)

---

### 2.2 Add Leadership Signals Documentation (CandidateNominationRanking.tsx)

**Location:** After the Values Promotion Check documentation

**Content to Add:**
A new Card documenting the SuccessorProfileLeadershipSignals component:
- **Title:** "Leadership Signals Display"
- **Purpose:** Shows leadership-category talent signals for succession candidates
- **Data Source:** `talent_signal_snapshots` table filtered by `signal_category = 'leadership'`
- **Display:** Score (1-5), confidence percentage, trend indicator (up/down/stable)
- **Compact Mode:** Shows top 3 signals with tooltips
- **Full Mode:** Shows up to 5 signals with progress bars

---

### 2.3 Add Candidate Signal Comparison Documentation (CandidateNominationRanking.tsx)

**Location:** After the Leadership Signals documentation

**Content to Add:**
A new Card documenting the CandidateSignalComparison component:
- **Title:** "Candidate Signal Comparison"
- **Purpose:** Side-by-side comparison of talent signals across candidates
- **Availability:** Appears when 2+ candidates exist in a succession plan
- **Usage Context:** Succession committee meetings, calibration discussions
- **Features:** Expandable panel, comparative signal visualization

---

### 2.4 Clarify Key Position Identification Workflow (KeyPositionIdentification.tsx)

**File:** `src/components/enablement/manual/succession/sections/successionplans/KeyPositionIdentification.tsx`

**Clarification to Add:**
- After the "Key Positions Tab Overview" card, add a Technical Architecture Note explaining:
  - Key positions are identified via the `jobs.is_key_position` flag
  - The KeyPositionsTab UI shows positions linked to jobs where `is_key_position = true`
  - The position → job relationship is used (positions reference jobs via job_id)
  - Unmarking a job as key removes its positions from the Key Positions view

---

## Phase 3: Clarification Notes

### 3.1 Gap-Development Linking Implementation Status

**Location:** GapDevelopmentLinking.tsx, after Navigation Path card

**Add Callout:**
```
Implementation Note: Gap-to-Development linking in HRplus is primarily 
managed through the IDP (Individual Development Plan) and Learning modules. 
While the succession_gap_development_links table stores the associations, 
the user interface for creating and managing these links is accessed via:
- IDP Module: Link development goals to succession gaps
- Learning Module: Assign courses addressing identified gaps
A dedicated Succession UI for gap management is planned for future release.
```

---

### 3.2 Manual Evidence Upload Status

**Location:** CandidateEvidenceCollection.tsx, after "Add Manual Evidence" steps

**Add Callout:**
```
Implementation Note: Manual evidence upload functionality is currently 
in development. The succession_candidate_evidence table supports manual 
evidence types, but the UI form for adding manual evidence is pending 
implementation. Currently, evidence is automatically collected from:
- Nine-Box Assessments (when completed)
- Talent Signal Snapshots (when captured)
```

---

### 3.3 Development Plans Display Clarification

**Location:** DevelopmentPlanManagement.tsx (if exists) or CandidateNominationRanking.tsx

**Add Note:**
- Development progress is displayed inline on candidate cards in SuccessionPlansTab.tsx
- The Progress component shows completion percentage for each development plan
- Full development plan CRUD is managed via the IDP module

---

## Implementation Summary

| Phase | Files Modified | Changes |
|-------|---------------|---------|
| Phase 1.1 | PositionRiskAssessment.tsx | Fix 7 field definitions, add 2 missing fields |
| Phase 1.2 | WorkflowApprovalConfiguration.tsx | Rename 4 fields, remove 1 field, add 14 missing fields |
| Phase 1.3 | GapDevelopmentLinking.tsx | Fix 7 nullable constraints, update 2 business rules |
| Phase 1.4 | CandidateEvidenceCollection.tsx | Fix 3 nullable constraints |
| Phase 1.5 | CandidateNominationRanking.tsx | Fix 1 default value |
| Phase 2.1-2.3 | CandidateNominationRanking.tsx | Add 3 UI feature documentation cards |
| Phase 2.4 | KeyPositionIdentification.tsx | Add technical architecture clarification |
| Phase 3 | GapDevelopmentLinking.tsx, CandidateEvidenceCollection.tsx | Add 3 implementation status callouts |

**Total Corrections:** 25 gaps addressed

**Estimated Lines Changed:** ~400 lines across 6 files

---

## Validation Checklist

After implementation, verify:

**Field Reference Accuracy:**
- [ ] `key_position_risks.retirement_risk` shown as Boolean
- [ ] `key_position_risks.flight_risk` shown as Boolean
- [ ] `market_competitiveness` field removed
- [ ] `assessed_at` field name correct (not `last_assessed_at`)
- [ ] `criticality_level` default shown as 'high'
- [ ] `workflow_templates.code` and `name` (not template_code/name)
- [ ] `steps` field removed from workflow_templates
- [ ] `workflow_enabled` and `transaction_type_id` correct
- [ ] Gap/Evidence tables show nullable constraints correctly
- [ ] `ranking` default shown as '1'

**UI Feature Documentation:**
- [ ] ValuesPromotionCheck component documented
- [ ] SuccessorProfileLeadershipSignals component documented
- [ ] CandidateSignalComparison feature documented
- [ ] Key Position → Job relationship explained

**Implementation Status Notes:**
- [ ] Gap-Development section has integration note
- [ ] Manual evidence section has pending UI note
- [ ] Development plans clarification added

