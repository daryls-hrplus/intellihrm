
# Update Succession Manual Types for Chapter 2

## Overview

Update `src/types/successionManual.ts` to reflect the newly implemented 10-section Chapter 2 structure, ensuring TOC navigation and section metadata accurately match the modular components.

---

## Current State vs. Target State

| Attribute | Current | Target |
|-----------|---------|--------|
| Read Time | 60 min | 99 min |
| Subsections | 5 | 10 |
| Description | Basic | Comprehensive |

### Current Subsections (5)
- 2.1 Prerequisites Checklist (10 min)
- 2.2 Assessor Types Configuration (10 min)
- 2.3 Readiness Rating Bands (15 min)
- 2.4 Availability Reasons (10 min)
- 2.5 Company-Specific Settings (15 min)

### Target Subsections (10)
- 2.1 Prerequisites Checklist (12 min)
- 2.2 Assessor Types Configuration (12 min)
- **2.2a Multi-Assessor Score Aggregation (8 min)** - NEW
- 2.3 Readiness Rating Bands (10 min)
- 2.4 Readiness Indicators & BARS (18 min) - EXPANDED
- **2.4a Weight Normalization Rules (6 min)** - NEW
- 2.5 Readiness Forms (10 min) - REFOCUSED
- **2.5a Staff Type Form Selection (5 min)** - NEW
- 2.6 Availability Reasons (8 min) - RENUMBERED
- 2.7 Company-Specific Settings (10 min) - RENUMBERED

---

## Implementation Details

### File to Modify
`src/types/successionManual.ts` (Lines 117-200)

### Changes Required

**1. Update Part 2 Header (Line 118)**
```typescript
// PART 2: FOUNDATION SETUP (~99 min)
```

**2. Update Part 2 Object Properties (Lines 121-127)**
- Change `estimatedReadTime` from 60 to 99
- Update `description` to include new sections

**3. Replace Subsections Array (Lines 128-199)**
Add 10 subsections with proper IDs matching scroll anchors:

```typescript
subsections: [
  {
    id: 'sec-2-1',
    sectionNumber: '2.1',
    title: 'Prerequisites Checklist',
    description: 'Required configurations from Core Framework, Workforce, Performance, and Competency modules before succession setup',
    contentLevel: 'procedure',
    estimatedReadTime: 12,
    targetRoles: ['Admin', 'Consultant'],
    industryContext: {
      frequency: 'One-time',
      timing: 'Pre-implementation',
      benchmark: 'Job architecture, competency framework, and org structure must be in place'
    }
  },
  {
    id: 'sec-2-2',
    sectionNumber: '2.2',
    title: 'Assessor Types Configuration',
    description: 'Configure Manager, HR, Executive, and Skip-Level assessor roles with permissions and weights',
    contentLevel: 'procedure',
    estimatedReadTime: 12,
    targetRoles: ['Admin'],
    industryContext: {
      frequency: 'One-time setup',
      timing: 'Pre-implementation',
      benchmark: 'Multi-assessor validation for objective readiness evaluation (SAP SuccessFactors)'
    }
  },
  {
    id: 'sec-2-2a',
    sectionNumber: '2.2a',
    title: 'Multi-Assessor Score Aggregation',
    description: 'Weighted average formulas, partial assessment handling, variance detection, and calibration triggers',
    contentLevel: 'reference',
    estimatedReadTime: 8,
    targetRoles: ['Admin', 'Consultant'],
    industryContext: {
      frequency: 'Reference',
      timing: 'Post assessor types',
      benchmark: 'Multi-rater consolidation following Workday patterns'
    }
  },
  {
    id: 'sec-2-3',
    sectionNumber: '2.3',
    title: 'Readiness Rating Bands',
    description: 'Define Ready Now, 1-3 Years, 3-5 Years, Developing, and Not a Successor bands with score ranges and strategic implications',
    contentLevel: 'procedure',
    estimatedReadTime: 10,
    targetRoles: ['Admin', 'HR Partner'],
    industryContext: {
      frequency: 'One-time, annual review',
      timing: 'Pre-implementation',
      benchmark: '5-band model aligned with SAP SuccessFactors and Workday patterns'
    }
  },
  {
    id: 'sec-2-4',
    sectionNumber: '2.4',
    title: 'Readiness Indicators & BARS',
    description: '8 categories, 32 default indicators with behaviorally anchored rating scales (BARS) for consistent assessment',
    contentLevel: 'procedure',
    estimatedReadTime: 18,
    targetRoles: ['Admin', 'Consultant'],
    industryContext: {
      frequency: 'One-time, annual review',
      timing: 'Post readiness bands',
      benchmark: 'BARS methodology for objective behavioral assessment'
    }
  },
  {
    id: 'sec-2-4a',
    sectionNumber: '2.4a',
    title: 'Weight Normalization Rules',
    description: 'Indicator weight normalization, skipped indicator handling, validation rules, and relative vs absolute weights',
    contentLevel: 'reference',
    estimatedReadTime: 6,
    targetRoles: ['Admin', 'Consultant'],
    industryContext: {
      frequency: 'Reference',
      timing: 'Post indicators',
      benchmark: 'Normalized scoring for partial assessments'
    }
  },
  {
    id: 'sec-2-5',
    sectionNumber: '2.5',
    title: 'Readiness Forms',
    description: 'Build readiness assessment forms using form builder, organize indicators into categories, configure staff-type-specific forms',
    contentLevel: 'procedure',
    estimatedReadTime: 10,
    targetRoles: ['Admin'],
    industryContext: {
      frequency: 'Per staff type',
      timing: 'Post indicators',
      benchmark: 'Role-appropriate assessment depth and questions'
    }
  },
  {
    id: 'sec-2-5a',
    sectionNumber: '2.5a',
    title: 'Staff Type Form Selection',
    description: 'Automatic form selection algorithm, staff type hierarchy, and override capabilities',
    contentLevel: 'reference',
    estimatedReadTime: 5,
    targetRoles: ['Admin', 'Consultant'],
    industryContext: {
      frequency: 'Reference',
      timing: 'Post forms',
      benchmark: 'Role-based form assignment automation'
    }
  },
  {
    id: 'sec-2-6',
    sectionNumber: '2.6',
    title: 'Availability Reasons',
    description: 'Configure planned vs unplanned departure reasons with urgency levels and notification triggers',
    contentLevel: 'procedure',
    estimatedReadTime: 8,
    targetRoles: ['Admin'],
    industryContext: {
      frequency: 'One-time setup',
      timing: 'Post forms',
      benchmark: 'Standardized reason codes for vacancy planning'
    }
  },
  {
    id: 'sec-2-7',
    sectionNumber: '2.7',
    title: 'Company-Specific Settings',
    description: 'Multi-company configuration inheritance, regional compliance settings, and cross-company talent pools',
    contentLevel: 'procedure',
    estimatedReadTime: 10,
    targetRoles: ['Admin'],
    industryContext: {
      frequency: 'Per company',
      timing: 'Post foundation setup',
      benchmark: 'Multi-entity support for global organizations'
    }
  }
]
```

---

## Validation Checklist

After implementation:
- [ ] Part 2 `estimatedReadTime` = 99
- [ ] Part 2 has 10 subsections
- [ ] All section IDs match scroll anchors in `SuccessionFoundationSection.tsx`:
  - sec-2-1, sec-2-2, sec-2-2a, sec-2-3, sec-2-4, sec-2-4a, sec-2-5, sec-2-5a, sec-2-6, sec-2-7
- [ ] All new sections have proper industry context
- [ ] Total subsection read times sum to 99 minutes (12+12+8+10+18+6+10+5+8+10 = 99)
- [ ] TOC navigation correctly scrolls to each section

---

## Technical Notes

- Section IDs use the pattern `sec-X-Y` to match `data-manual-anchor` attributes
- Subsections 2.2a, 2.4a, and 2.5a use lowercase 'a' suffix for sub-subsections
- The `contentLevel: 'reference'` is used for the new aggregation/normalization sections as they are formula-focused rather than procedural
