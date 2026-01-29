

# Chapter 5 TOC: Add Collapsible Section Groups (A-F)

## Problem Identified

The Chapter 5 content (`LndComplianceSection.tsx`) displays collapsible Section Groups A-F:
- Section A: Compliance Program Framework (5.1-5.3)
- Section B: Assignment Management (5.4-5.7)
- Section C: Monitoring & Dashboards (5.8-5.11)
- Section D: Escalation & Enforcement (5.12-5.15)
- Section E: Audit & Reporting (5.16-5.19)
- Section F: HSE & Industry Compliance (5.20-5.23)

However, the **Table of Contents sidebar** renders all 23 subsections as a **flat list** without showing these logical groupings.

## Root Cause

1. **Type Definition**: In `learningDevelopmentManual.ts`, the A-F groupings exist only as code comments, not as structural data
2. **TOC Rendering**: The manual page renders `section.subsections` directly without support for nested groupings

## Solution: Nested Subsection Groups

### Option 1: Add `sectionGroup` Metadata (Recommended)

Add a `sectionGroup` field to each subsection in the type definition:

```typescript
// Example for Section 5.1
{
  id: 'sec-5-1',
  sectionNumber: '5.1',
  title: 'Regulatory Compliance Overview',
  sectionGroup: {
    code: 'A',
    title: 'Compliance Program Framework',
    range: '5.1-5.3'
  },
  // ...existing fields
}
```

Then update the TOC renderer to group subsections by `sectionGroup.code` with collapsible headers.

### Option 2: Nested Subsections Array

Modify the data structure to support hierarchical subsections:

```typescript
subsections: [
  {
    id: 'group-a',
    sectionNumber: 'A',
    title: 'Compliance Program Framework (5.1-5.3)',
    subsections: [
      { id: 'sec-5-1', sectionNumber: '5.1', title: '...' },
      { id: 'sec-5-2', sectionNumber: '5.2', title: '...' },
      { id: 'sec-5-3', sectionNumber: '5.3', title: '...' },
    ]
  },
  // ... groups B-F
]
```

---

## Recommended Implementation: Option 1 (Minimal Data Model Change)

### Files to Modify

| File | Change |
|------|--------|
| `src/types/learningDevelopmentManual.ts` | Add `sectionGroup?: { code: string; title: string; range: string }` to `LndSection` interface |
| `src/types/learningDevelopmentManual.ts` | Add `sectionGroup` metadata to Chapter 5 subsections (5.1-5.23) |
| `src/pages/enablement/LearningDevelopmentManualPage.tsx` | Update TOC rendering logic to group subsections by `sectionGroup` and render collapsible group headers |

---

## Technical Implementation Details

### 1. Update Type Definition

```typescript
// In LndSection interface
export interface LndSection {
  // ...existing fields
  sectionGroup?: {
    code: string;      // 'A', 'B', 'C', 'D', 'E', 'F'
    title: string;     // 'Compliance Program Framework'
    range: string;     // '5.1-5.3'
  };
}
```

### 2. Add Section Group Metadata to Chapter 5

```text
Sections 5.1-5.3  -> sectionGroup: { code: 'A', title: 'Compliance Program Framework', range: '5.1-5.3' }
Sections 5.4-5.7  -> sectionGroup: { code: 'B', title: 'Assignment Management', range: '5.4-5.7' }
Sections 5.8-5.11 -> sectionGroup: { code: 'C', title: 'Monitoring & Dashboards', range: '5.8-5.11' }
Sections 5.12-5.15 -> sectionGroup: { code: 'D', title: 'Escalation & Enforcement', range: '5.12-5.15' }
Sections 5.16-5.19 -> sectionGroup: { code: 'E', title: 'Audit & Reporting', range: '5.16-5.19' }
Sections 5.20-5.23 -> sectionGroup: { code: 'F', title: 'HSE & Industry Compliance', range: '5.20-5.23' }
```

### 3. Update TOC Rendering Logic

The `LearningDevelopmentManualPage.tsx` TOC renderer (lines 315-338) currently renders subsections as:

```tsx
{section.subsections.map((sub) => (
  <button key={sub.id}>...</button>
))}
```

Change to a grouped rendering approach:

```text
Pseudocode:
1. Group subsections by sectionGroup.code
2. For each group:
   - Render a collapsible group header (e.g., "A. Compliance Program Framework")
   - Inside the collapsible, render the subsections (5.1, 5.2, 5.3)
3. For subsections without sectionGroup, render normally (flat list)
```

### 4. Visual Result in TOC

```text
Before (flat):                      After (grouped):
5. Compliance Training              5. Compliance Training
   5.1 Regulatory Compliance           A. Compliance Program Framework
   5.2 Compliance Categories             5.1 Regulatory Compliance
   5.3 Compliance Calendar               5.2 Compliance Categories
   5.4 Bulk Assignment                   5.3 Compliance Calendar
   5.5 Individual Assignment           B. Assignment Management
   ...23 items flat...                   5.4 Bulk Assignment
                                         5.5 Individual Assignment
                                         ...collapsed groups...
```

---

## Also Apply To: Chapter 4 (Operational Workflows)

Chapter 4 also has section groups (A-D) that should follow the same pattern:

```text
Section A: Course Delivery Lifecycle (4.1-4.6)
Section B: Training Request Lifecycle (4.7-4.13)
Section C: Session & Delivery Operations (4.14-4.18)
Section D: Historical Records & Transcripts (4.19-4.21)
```

---

## Summary

| Item | Count |
|------|-------|
| Type Definition Changes | 1 interface update |
| Chapter 5 Subsection Updates | 23 sections get `sectionGroup` |
| Chapter 4 Subsection Updates | 21 sections get `sectionGroup` |
| TOC Renderer Updates | 1 component logic change |
| Result | TOC mirrors the A-F groupings visible in content |

