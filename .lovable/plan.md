
# 360 Feedback Workflow Templates Implementation Plan

## Overview

Add industry-standard workflow templates for 360 Feedback to the HR Hub Workflow Templates module, linked to existing notification events and transaction types.

---

## Current State Analysis

### Existing Infrastructure
- **Enum value exists**: `feedback_360_approval` in `workflow_category` enum
- **Transaction type exists**: `PERF_360_RELEASE` in `lookup_values` (category: transaction_type)
- **Notification events exist**: 
  - `360_CYCLE_ACTIVATED`
  - `360_FEEDBACK_DUE`
  - `360_SELF_REVIEW_DUE`
  - `360_RESULTS_RELEASED`
- **No templates exist** for `feedback_360_approval` category

### Gap
The workflow_templates table has no records for 360 Feedback despite the infrastructure being in place.

---

## Industry-Standard 360 Workflow Templates

Based on SAP SuccessFactors, Workday, and Oracle HCM patterns:

| Template | Purpose | Typical Steps | Transaction Type |
|----------|---------|---------------|------------------|
| **Peer Nomination Approval** | Manager approves employee peer selections | 1-2 steps (Manager → Optional HR) | `FEEDBACK_360_NOMINATION` |
| **Results Release Approval** | HR reviews before results visible | 1-2 steps (HR → Optional Manager) | `PERF_360_RELEASE` |
| **Investigation Access Approval** | Legal/HR approval for de-anonymization | 2+ steps (Skip-level → HR/Legal) | `FEEDBACK_360_INVESTIGATION` |
| **External Rater Approval** | Approve non-employee raters | 1 step (HR) | `FEEDBACK_360_EXTERNAL_RATER` |
| **Cycle Activation Approval** | HR/Leadership approval to launch cycle | 1-2 steps (HR → Leadership) | `FEEDBACK_360_CYCLE_LAUNCH` |

---

## Implementation Details

### Phase 1: Add Missing Transaction Types to lookup_values

```sql
INSERT INTO lookup_values (category, code, name, description, is_active)
VALUES 
  ('transaction_type', 'FEEDBACK_360_NOMINATION', '360 Peer Nomination Approval', 'Approval for employee peer/rater nominations', true),
  ('transaction_type', 'FEEDBACK_360_INVESTIGATION', '360 Investigation Access', 'Approval for de-anonymized feedback access', true),
  ('transaction_type', 'FEEDBACK_360_EXTERNAL_RATER', '360 External Rater Approval', 'Approval for non-employee raters', true),
  ('transaction_type', 'FEEDBACK_360_CYCLE_LAUNCH', '360 Cycle Launch Approval', 'Approval to activate a 360 cycle', true);
```

### Phase 2: Seed Global Workflow Templates

Insert 5 industry-standard templates with pre-configured steps:

| Template Name | Code | Category | Steps |
|--------------|------|----------|-------|
| 360 Peer Nomination Approval | `360_PEER_NOMINATION` | `feedback_360_approval` | Manager (48h SLA) |
| 360 Results Release Approval | `360_RESULTS_RELEASE` | `feedback_360_approval` | HR (72h SLA) → Optional Manager |
| 360 Investigation Access | `360_INVESTIGATION_ACCESS` | `feedback_360_approval` | Skip-level Manager (48h) → HR/Legal (24h) |
| 360 External Rater Approval | `360_EXTERNAL_RATER` | `feedback_360_approval` | HR (24h SLA) |
| 360 Cycle Launch Approval | `360_CYCLE_LAUNCH` | `feedback_360_approval` | HR (48h) → Leadership (24h) |

### Phase 3: Update workflowModuleStructure.ts

Add 360 Feedback category to the Performance module:

```typescript
{
  id: "feedback_360",
  name: "360 Feedback",
  color: "violet",
  icon: Users,
  workflows: [
    { code: "feedback_360_approval", name: "Peer Nomination Approval", transactionTypeCode: "FEEDBACK_360_NOMINATION" },
    { code: "feedback_360_release", name: "Results Release", transactionTypeCode: "PERF_360_RELEASE" },
    { code: "feedback_360_investigation", name: "Investigation Access", transactionTypeCode: "FEEDBACK_360_INVESTIGATION" },
    { code: "feedback_360_external", name: "External Rater Approval", transactionTypeCode: "FEEDBACK_360_EXTERNAL_RATER" },
    { code: "feedback_360_cycle", name: "Cycle Launch Approval", transactionTypeCode: "FEEDBACK_360_CYCLE_LAUNCH" }
  ]
}
```

### Phase 4: Update WorkflowTemplateLibrary.tsx

Add category labels for new 360 workflow types:

```typescript
const CATEGORY_LABELS = {
  // ... existing
  feedback_360_approval: "360 Feedback",
  feedback_360_release: "360 Results Release",
  feedback_360_investigation: "360 Investigation",
  feedback_360_external: "360 External Rater",
  feedback_360_cycle: "360 Cycle Launch",
};
```

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `src/constants/workflowModuleStructure.ts` | Add "360 Feedback" category under Performance module with 5 workflow definitions |
| `src/components/workflow/WorkflowTemplateLibrary.tsx` | Add CATEGORY_LABELS for 360 workflow types |

### Database Migration

Single migration with:
1. Insert 4 new transaction types to `lookup_values`
2. Insert 5 global workflow templates to `workflow_templates`
3. Insert workflow steps for each template to `workflow_steps`

---

## Workflow Step Configuration Details

### 1. 360 Peer Nomination Approval
- **Step 1**: Direct Manager (48h SLA)
- **SLA Behavior**: Escalate to skip-level on breach
- **Auto-approve**: No (nominations must be reviewed)

### 2. 360 Results Release Approval  
- **Step 1**: HR Representative (72h SLA)
- **Step 2** (optional): Manager Review (24h)
- **Auto-approve**: Yes after 72h (prevents blocking)

### 3. 360 Investigation Access
- **Step 1**: Skip-level Manager (48h SLA)
- **Step 2**: HR/Legal Team (24h SLA)
- **Require All Approvers**: Yes (dual approval required)
- **Auto-approve**: No (sensitive action)

### 4. 360 External Rater Approval
- **Step 1**: HR Administrator (24h SLA)
- **Auto-approve**: Yes after 24h

### 5. 360 Cycle Launch Approval
- **Step 1**: HR Manager (48h SLA)
- **Step 2**: Leadership/Executive (24h SLA)
- **Auto-approve**: No

---

## Event Linkage

| Template | Triggers On | Linked Notification Events |
|----------|------------|---------------------------|
| Peer Nomination Approval | Nomination submitted | `feedback_request_pending` |
| Results Release | Cycle processing complete | `360_RESULTS_RELEASED` |
| Investigation Access | Investigation requested | (Manual trigger) |
| External Rater Approval | External rater added | (On rater invite) |
| Cycle Launch Approval | Cycle activated | `360_CYCLE_ACTIVATED` |

---

## Summary

This implementation adds 5 industry-standard 360 Feedback workflow templates with appropriate approval chains, SLA configurations, and links to existing notification events. The templates appear in the HR Hub Workflow Template Library under the Performance module.
