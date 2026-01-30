

# Fix Missing Section References in 360 Feedback Manual

## Problem Summary
The **Prerequisites Checklist** (Section 2.1) in the 360 Feedback Manual references sections that don't exist:
- "See Section 2.0a" (Approval Workflows) → No `sec-2-0a` anchor exists
- "See Section 2.0b" (Notifications) → No `sec-2-0b` anchor exists  
- "See Section 2.0c" (Competency Integration) → No `sec-2-0c` anchor exists
- "See Section 2.0d" (Performance Trends) → No `sec-2-0d` anchor exists

**Root Cause:** The components exist and have correct section headers (2.0a, 2.0b, etc.) inside their content, but the `F360SetupSection.tsx` renders them with different section IDs (2.4, 2.8, 2.9, 2.13).

## Solution Options

### Option A: Update References to Match Actual IDs (Recommended)
Update `F360Prerequisites.tsx` to reference the correct existing section IDs:

| Current Reference | Correct Section | Actual ID |
|-------------------|-----------------|-----------|
| See Section 2.0a | Approval Workflows | sec-2-8 |
| See Section 2.0b | Notifications | sec-2-9 |
| See Section 2.0c | Competency Integration | sec-2-4 |
| See Section 2.0d | Performance Trends | sec-2-13 |

### Option B: Add 2.0a-2.0d as Proper Sub-Sections
Create a new "Core Framework Prerequisites" group before section 2.1 with actual `sec-2-0a` through `sec-2-0d` anchors.

**Recommendation:** Option A is simpler and maintains the current structure. The section numbers inside the components (2.0a, 2.0b, etc.) would need to be updated to match their actual positions (2.8, 2.9, etc.).

---

## Files to Modify

### 1. `src/components/enablement/manual/feedback360/sections/setup/F360Prerequisites.tsx`
Update the section references in the prerequisites checklist:

```typescript
// Line 53 - Change from:
section: 'See Section 2.0a'
// To:
section: 'See Section 2.8'

// Line 60 - Change from:  
section: 'See Section 2.0b'
// To:
section: 'See Section 2.9'

// Line 67 - Change from:
section: 'See Section 2.0c'
// To:
section: 'See Section 2.4'

// Line 74 - Change from:
section: 'See Section 2.0d'
// To:
section: 'See Section 2.13'
```

### 2. Update Component Headers to Match Section Numbers

**`F360ApprovalWorkflows.tsx` (Line 174):**
```text
Before: "2.0a Approval Workflows for 360 Feedback"
After:  "2.8 Approval Workflows for 360 Feedback"
```

**`F360Notifications.tsx` (Line 225):**
```text
Before: "2.0b Notifications & Reminders for 360 Feedback"
After:  "2.9 Notifications & Reminders for 360 Feedback"
```

**`F360CompetencyIntegration.tsx` (Line 58):**
```text
Before: "2.0c Competency Framework Integration"
After:  "2.4 Competency Framework Integration"
```

**`F360PerformanceTrends.tsx` (Line 75):**
```text
Before: "2.0d Performance Trends & Index Configuration"
After:  "2.13 Performance Trends & Index Configuration"
```

### 3. Update Index Comment
**`src/components/enablement/manual/feedback360/sections/setup/index.ts`:**
```typescript
// Line 1 - Remove misleading comment:
// OLD: // Core Framework Integration (Sections 2.0a - 2.0d)
// NEW: // Core Framework Integration Components
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `F360Prerequisites.tsx` | Update 4 section references (2.0a→2.8, 2.0b→2.9, 2.0c→2.4, 2.0d→2.13) |
| `F360ApprovalWorkflows.tsx` | Update header from "2.0a" to "2.8" |
| `F360Notifications.tsx` | Update header from "2.0b" to "2.9" |
| `F360CompetencyIntegration.tsx` | Update header from "2.0c" to "2.4" |
| `F360PerformanceTrends.tsx` | Update header from "2.0d" to "2.13" |
| `index.ts` | Update comment to remove incorrect section references |

---

## No Database Changes Required
This is a documentation/UI-only fix to correct cross-reference mismatches.

