
# Seed Missing Industry-Standard Workflows for Performance & Succession

## Summary
Add 10 additional must-have workflow templates to align with enterprise HRMS benchmarks (Workday, SAP SuccessFactors, Oracle HCM). These workflows address gaps in continuous feedback, PIP lifecycle management, and succession governance.

---

## Current vs. Target State

### Performance Module

| Category | Current Count | New Templates | Total |
|----------|---------------|---------------|-------|
| Appraisals | 4 | +2 (Continuous Feedback, Mid-Cycle Review) | 6 |
| Performance Improvement | 1 | +3 (PIP Extension, PIP Closure, Appraisal Re-Open) | 4 |
| Goals | 5 | 0 | 5 |
| 360 Feedback | 5 | 0 | 5 |
| **Total** | **15** | **+5** | **20** |

### Succession Module

| Category | Current Count | New Templates | Total |
|----------|---------------|---------------|-------|
| Candidate Management | 2 | 0 | 2 |
| Plan Governance | 2 | +2 (Key Position Designation, Bench Strength Review) | 4 |
| Emergency Succession | 1 | 0 | 1 |
| Risk Management | 0 | +3 (Flight Risk Acknowledgment, Retention Action, Nine-Box Override) | 3 |
| **Total** | **5** | **+5** | **10** |

---

## New Workflows to Seed

### Performance Module Additions

#### 1. Continuous Feedback Approval
- **Code**: `PERF_CONTINUOUS_FEEDBACK`
- **Category**: `continuous_feedback`
- **Purpose**: Approve ad-hoc feedback shared outside formal cycles
- **Workflow Steps**: Manager → HR (optional)
- **Industry Pattern**: Workday Continuous Performance Management

#### 2. Mid-Cycle Review Approval
- **Code**: `PERF_MIDCYCLE_REVIEW`
- **Category**: `midcycle_review`
- **Purpose**: Formal checkpoint during long appraisal cycles (annual → semi-annual check-in)
- **Workflow Steps**: Skip-Level Manager → HR Partner
- **Industry Pattern**: SAP SuccessFactors Career Development Planning

#### 3. PIP Extension Request
- **Code**: `PERF_PIP_EXTENSION`
- **Category**: `pip_extension`
- **Purpose**: Approve extension of PIP duration when more time is needed
- **Workflow Steps**: HR Partner → HR Director
- **Industry Pattern**: Oracle HCM Talent Management

#### 4. PIP Closure Approval
- **Code**: `PERF_PIP_CLOSURE`
- **Category**: `pip_closure`
- **Purpose**: Formal sign-off on PIP completion (successful or unsuccessful)
- **Workflow Steps**: HR Partner → Legal/Employee Relations
- **Industry Pattern**: Enterprise standard for audit trail

#### 5. Appraisal Re-Open Request
- **Code**: `PERF_APPRAISAL_REOPEN`
- **Category**: `appraisal_reopen`
- **Purpose**: Allow corrections to finalized appraisals with approval
- **Workflow Steps**: HR Manager → HR Director → System Admin
- **Industry Pattern**: SAP SuccessFactors Performance Management

---

### Succession Module Additions

#### 6. Key Position Designation Approval
- **Code**: `SUCC_KEY_POSITION`
- **Category**: `key_position_designation`
- **Purpose**: Approve marking a position as succession-critical
- **Workflow Steps**: Department Head → CHRO
- **Industry Pattern**: Workday Succession Planning

#### 7. Bench Strength Review Approval
- **Code**: `SUCC_BENCH_REVIEW`
- **Category**: `bench_strength_review`
- **Purpose**: Sign-off on annual succession coverage assessments
- **Workflow Steps**: HR Partner → CHRO
- **Industry Pattern**: SAP SuccessFactors Succession & Development

#### 8. Flight Risk Acknowledgment
- **Code**: `SUCC_FLIGHT_RISK_ACK`
- **Category**: `flight_risk_acknowledgment`
- **Purpose**: Manager acknowledges high-value employee flight risk alert
- **Workflow Steps**: Manager Acknowledgment (single step)
- **Industry Pattern**: Workday Prism Analytics triggers

#### 9. Retention Action Approval
- **Code**: `SUCC_RETENTION_ACTION`
- **Category**: `retention_action_approval`
- **Purpose**: Approve retention interventions (counter-offer, promotion, etc.)
- **Workflow Steps**: HR Partner → Finance → CHRO
- **Industry Pattern**: Oracle HCM Workforce Compensation

#### 10. Nine-Box Placement Override
- **Code**: `SUCC_NINEBOX_OVERRIDE`
- **Category**: `ninebox_override`
- **Purpose**: Approve manual override of algorithm-calculated 9-box placement
- **Workflow Steps**: Calibration Committee → HR Director
- **Industry Pattern**: SAP SuccessFactors Calibration Sessions

---

## Technical Implementation

### 1. Database Migration

**File**: `supabase/migrations/[timestamp]_seed_performance_succession_workflows.sql`

```sql
-- Add new transaction types to lookup_values
INSERT INTO lookup_values (category, code, name, description, display_order, is_active)
VALUES
  -- Performance additions
  ('transaction_type', 'PERF_CONTINUOUS_FEEDBACK', 'Continuous Feedback Approval', 'Approval for ad-hoc feedback outside formal cycles', 200, true),
  ('transaction_type', 'PERF_MIDCYCLE_REVIEW', 'Mid-Cycle Review Approval', 'Checkpoint review during long appraisal cycles', 201, true),
  ('transaction_type', 'PERF_PIP_EXTENSION', 'PIP Extension Approval', 'Extend performance improvement plan duration', 202, true),
  ('transaction_type', 'PERF_PIP_CLOSURE', 'PIP Closure Approval', 'Sign-off on PIP completion', 203, true),
  ('transaction_type', 'PERF_APPRAISAL_REOPEN', 'Appraisal Re-Open Request', 'Request to reopen finalized appraisal', 204, true),
  -- Succession additions
  ('transaction_type', 'SUCC_KEY_POSITION', 'Key Position Designation', 'Approve position as succession-critical', 300, true),
  ('transaction_type', 'SUCC_BENCH_REVIEW', 'Bench Strength Review', 'Annual succession coverage sign-off', 301, true),
  ('transaction_type', 'SUCC_FLIGHT_RISK_ACK', 'Flight Risk Acknowledgment', 'Manager acknowledges flight risk alert', 302, true),
  ('transaction_type', 'SUCC_RETENTION_ACTION', 'Retention Action Approval', 'Approve retention intervention', 303, true),
  ('transaction_type', 'SUCC_NINEBOX_OVERRIDE', 'Nine-Box Override Approval', 'Override algorithm 9-box placement', 304, true)
ON CONFLICT (category, code) DO NOTHING;

-- Insert new workflow templates
INSERT INTO workflow_templates (name, code, category, description, is_global, is_active)
VALUES
  -- Performance templates
  ('Continuous Feedback Approval', 'PERF_CONTINUOUS_FEEDBACK', 'continuous_feedback', 'Approval workflow for ad-hoc feedback submissions', true, true),
  ('Mid-Cycle Review Approval', 'PERF_MIDCYCLE_REVIEW', 'midcycle_review', 'Approval for checkpoint reviews during long cycles', true, true),
  ('PIP Extension Request', 'PERF_PIP_EXTENSION', 'pip_extension', 'Approval to extend PIP duration', true, true),
  ('PIP Closure Approval', 'PERF_PIP_CLOSURE', 'pip_closure', 'Sign-off on PIP completion or termination', true, true),
  ('Appraisal Re-Open Request', 'PERF_APPRAISAL_REOPEN', 'appraisal_reopen', 'Request to reopen a finalized appraisal for corrections', true, true),
  -- Succession templates
  ('Key Position Designation Approval', 'SUCC_KEY_POSITION', 'key_position_designation', 'Approve marking a position as succession-critical', true, true),
  ('Bench Strength Review Approval', 'SUCC_BENCH_REVIEW', 'bench_strength_review', 'Annual succession coverage assessment sign-off', true, true),
  ('Flight Risk Acknowledgment', 'SUCC_FLIGHT_RISK_ACK', 'flight_risk_acknowledgment', 'Manager acknowledges high-value employee at risk', true, true),
  ('Retention Action Approval', 'SUCC_RETENTION_ACTION', 'retention_action_approval', 'Approve retention interventions for at-risk talent', true, true),
  ('Nine-Box Placement Override', 'SUCC_NINEBOX_OVERRIDE', 'ninebox_override', 'Override algorithm-calculated 9-box placement', true, true)
ON CONFLICT (code) WHERE is_global = true DO NOTHING;

-- Insert workflow steps for each template
-- (Separate INSERT statements for each template's steps)
```

### 2. Update Module Structure

**File**: `src/constants/workflowModuleStructure.ts`

Add new workflows to the appropriate categories:

**Performance Module Updates:**
- Add `continuous_feedback` category under Appraisals
- Add 3 new workflows to PIP category
- Add `midcycle_review` under Appraisals

**Succession Module Updates:**
- Add new `risk_management` category with 3 workflows
- Add 2 workflows to Plan Governance category

---

## Updated Module Structure

### Performance Module (Final Structure)

```typescript
{
  id: "performance",
  name: "Performance",
  categories: [
    {
      id: "appraisals",
      name: "Appraisals",
      workflows: [
        { code: "rating_approval", name: "Rating Approval" },
        { code: "rating_release_approval", name: "Rating Release" },
        { code: "performance", name: "Appraisal Acknowledgment" },
        { code: "calibration_approval", name: "Calibration Approval" },
        { code: "continuous_feedback", name: "Continuous Feedback Approval" }, // NEW
        { code: "midcycle_review", name: "Mid-Cycle Review Approval" }  // NEW
      ]
    },
    {
      id: "pip",
      name: "Performance Improvement",
      workflows: [
        { code: "pip_acknowledgment", name: "PIP Acknowledgment" },
        { code: "pip_extension", name: "PIP Extension Request" },       // NEW
        { code: "pip_closure", name: "PIP Closure Approval" },          // NEW
        { code: "appraisal_reopen", name: "Appraisal Re-Open Request" } // NEW
      ]
    },
    // Goals and 360 Feedback remain unchanged
  ]
}
```

### Succession Module (Final Structure)

```typescript
{
  id: "succession",
  name: "Succession Planning",
  categories: [
    {
      id: "succession_candidates",
      name: "Candidate Management",
      workflows: [
        { code: "succession_nomination", name: "Candidate Nomination" },
        { code: "talent_pool_nomination", name: "Talent Pool Nomination" }
      ]
    },
    {
      id: "succession_plans",
      name: "Plan Governance",
      workflows: [
        { code: "succession_approval", name: "Readiness Assessment Approval" },
        { code: "succession_plan_approval", name: "Succession Plan Approval" },
        { code: "key_position_designation", name: "Key Position Designation" }, // NEW
        { code: "bench_strength_review", name: "Bench Strength Review" }        // NEW
      ]
    },
    {
      id: "succession_emergency",
      name: "Emergency Succession",
      workflows: [
        { code: "succession_emergency", name: "Emergency Activation" }
      ]
    },
    {
      id: "succession_risk",  // NEW CATEGORY
      name: "Risk Management",
      workflows: [
        { code: "flight_risk_ack", name: "Flight Risk Acknowledgment" },    // NEW
        { code: "retention_action", name: "Retention Action Approval" },    // NEW
        { code: "ninebox_override", name: "Nine-Box Placement Override" }   // NEW
      ]
    }
  ]
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/[new].sql` | Seed 10 new transaction types and workflow templates with steps |
| `src/constants/workflowModuleStructure.ts` | Add new workflows and Risk Management category |

---

## Industry Alignment Summary

| Benchmark | Workflows Covered |
|-----------|-------------------|
| **Workday** | Continuous Feedback, Flight Risk, Key Position Designation |
| **SAP SuccessFactors** | Mid-Cycle Review, Nine-Box Override, Appraisal Re-Open |
| **Oracle HCM** | PIP Extension, Retention Action, Bench Strength Review |
| **General Enterprise** | PIP Closure (audit compliance) |

This brings the Performance module to **20 total workflows** and Succession module to **10 total workflows**, achieving full industry parity.
