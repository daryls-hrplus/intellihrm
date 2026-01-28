
# L&D Manual Chapter 2: TOC Alignment Fix

## Problem Analysis

The Table of Contents (TOC) in `src/types/learningDevelopmentManual.ts` for Chapter 2 is **completely misaligned** with the actual component sections. When users click a TOC item, they scroll to the wrong section because:

1. **TOC section titles don't match component titles**
2. **TOC has outdated/wrong section names** (e.g., "Delivery Methods" → actually "Modules & Lessons")
3. **16 components exist but TOC describes different content**

### Current Misalignment Map

| Section ID | TOC Says | Actual Component Shows |
|------------|----------|------------------------|
| sec-2-1 | Prerequisites Checklist | Prerequisites & Implementation ✓ |
| sec-2-2 | Course Categories Setup | Course Categories Setup ✓ |
| sec-2-3 | Course Creation & Structure | Course Creation & Structure ✓ |
| sec-2-4 | **Delivery Methods Configuration** | **Modules & Lessons** |
| sec-2-5 | **Rating Codes Setup** | **Quiz Configuration** |
| sec-2-6 | **Cost Types Configuration** | **Learning Paths** |
| sec-2-7 | **Reject & Cancel Reasons** | **Competency Mapping** |
| sec-2-8 | **Training Staff Assignment** | **Compliance Training Rules** |
| sec-2-9 | **Quiz & Assessment Config** | **Instructors** |
| sec-2-10 | **Learning Paths Setup** | **Training Budgets** |
| sec-2-11 | **Competency-Course Mapping** | **Training Evaluations** |
| sec-2-12 | **Compliance Training Rules** | **Badges & Gamification** |
| sec-2-13 | **Budget Configuration** | **SCORM/xAPI Integration** |
| sec-2-14 | **Instructor Management** | **Certificate Templates** |
| sec-2-15 | **Certificate Templates** | **Training Requests Config** |
| sec-2-16 | **SCORM/xAPI Configuration** | **Company L&D Settings** |

**13 of 16 sections are misaligned.**

---

## Implementation Plan

### Single File Update: `src/types/learningDevelopmentManual.ts`

Update Chapter 2 subsections (lines 143-304) to match the actual component titles and order:

```typescript
subsections: [
  {
    id: 'sec-2-1',
    sectionNumber: '2.1',
    title: 'Prerequisites & Implementation Sequence',
    description: 'Required configurations from Workforce, Performance, and Competency modules',
    // ... rest of metadata
  },
  {
    id: 'sec-2-2',
    sectionNumber: '2.2',
    title: 'Course Categories Setup',
    description: 'Create logical groupings for training content',
    // ... (ALIGNED - no change needed)
  },
  {
    id: 'sec-2-3',
    sectionNumber: '2.3',
    title: 'Course Creation & Structure',
    description: 'Course creation, content types, duration estimates, thumbnails',
    // ... (ALIGNED - no change needed)
  },
  {
    id: 'sec-2-4',
    sectionNumber: '2.4',
    title: 'Modules & Lessons', // WAS: Delivery Methods Configuration
    description: 'Course → Module → Lesson hierarchy and content structure',
    // ...
  },
  {
    id: 'sec-2-5',
    sectionNumber: '2.5',
    title: 'Quiz Configuration', // WAS: Rating Codes Setup
    description: 'Question types, passing scores, time limits, retake policies',
    // ...
  },
  {
    id: 'sec-2-6',
    sectionNumber: '2.6',
    title: 'Learning Paths', // WAS: Cost Types Configuration
    description: 'Structured learning journeys, prerequisite courses, milestones',
    // ...
  },
  {
    id: 'sec-2-7',
    sectionNumber: '2.7',
    title: 'Competency Mapping', // WAS: Reject & Cancel Reasons
    description: 'Link courses to skills and competencies for gap-based recommendations',
    // ...
  },
  {
    id: 'sec-2-8',
    sectionNumber: '2.8',
    title: 'Compliance Training Rules', // WAS: Training Staff Assignment
    description: 'Mandatory training configuration, recertification periods',
    // ...
  },
  {
    id: 'sec-2-9',
    sectionNumber: '2.9',
    title: 'Instructors', // WAS: Quiz & Assessment
    description: 'Internal and external instructor profiles, qualifications',
    // ...
  },
  {
    id: 'sec-2-10',
    sectionNumber: '2.10',
    title: 'Training Budgets', // WAS: Learning Paths Setup
    description: 'Department and company training budgets, spending thresholds',
    // ...
  },
  {
    id: 'sec-2-11',
    sectionNumber: '2.11',
    title: 'Training Evaluations', // WAS: Competency-Course Mapping
    description: 'Kirkpatrick evaluation levels, feedback collection, surveys',
    // ...
  },
  {
    id: 'sec-2-12',
    sectionNumber: '2.12',
    title: 'Badges & Gamification', // WAS: Compliance Training Rules
    description: 'Achievement badges, points, leaderboards, learner engagement',
    // ...
  },
  {
    id: 'sec-2-13',
    sectionNumber: '2.13',
    title: 'SCORM/xAPI Integration', // WAS: Budget Configuration
    description: 'Import eLearning packages, tracking settings, completion criteria',
    // ...
  },
  {
    id: 'sec-2-14',
    sectionNumber: '2.14',
    title: 'Certificate Templates', // WAS: Instructor Management
    description: 'Design certificate templates with dynamic fields and expiry',
    // ...
  },
  {
    id: 'sec-2-15',
    sectionNumber: '2.15',
    title: 'Training Requests Configuration', // WAS: Certificate Templates
    description: 'Request types, approval workflows, source integrations',
    // ...
  },
  {
    id: 'sec-2-16',
    sectionNumber: '2.16',
    title: 'Company L&D Settings', // WAS: SCORM/xAPI
    description: 'Company-specific L&D configuration and defaults',
    // ...
  }
]
```

---

## Technical Details

### File to Modify
- `src/types/learningDevelopmentManual.ts` (lines 143-304)

### Changes Summary
| Section | Old Title | New Title (Matches Component) |
|---------|-----------|-------------------------------|
| 2.4 | Delivery Methods Configuration | Modules & Lessons |
| 2.5 | Rating Codes Setup | Quiz Configuration |
| 2.6 | Cost Types Configuration | Learning Paths |
| 2.7 | Reject & Cancel Reasons Setup | Competency Mapping |
| 2.8 | Training Staff Assignment | Compliance Training Rules |
| 2.9 | Quiz & Assessment Configuration | Instructors |
| 2.10 | Learning Paths Setup | Training Budgets |
| 2.11 | Competency-Course Mapping | Training Evaluations |
| 2.12 | Compliance Training Rules | Badges & Gamification |
| 2.13 | Budget Configuration | SCORM/xAPI Integration |
| 2.14 | Instructor Management | Certificate Templates |
| 2.15 | Certificate Templates | Training Requests Configuration |
| 2.16 | SCORM/xAPI Package Configuration | Company L&D Settings |

### Effort Estimate
- ~30 minutes to update all 13 misaligned section definitions
- Zero component changes needed (components are correct)
