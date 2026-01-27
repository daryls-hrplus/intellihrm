
# Career Development Module Separation Plan

## Industry Analysis: Workday Approach

Following Workday's modular architecture where Career Development is a standalone module:

| Component | Workday Location | HRplus Current | HRplus Target |
|-----------|-----------------|----------------|---------------|
| Career Paths | Career Hub (standalone) | Succession + L&D | Career Development Module |
| IDP/Development Plans | Career Hub | Succession | Career Development Module |
| Mentorship | Career Hub | Succession + L&D | Career Development Module |
| Succession Integration | Talent Management | Succession | Succession (cross-ref) |

## Database Tables Inventory

**Core Career Development Tables (12 tables, 122 columns total):**

| Table | Columns | Owner Module |
|-------|---------|--------------|
| career_paths | 8 | Career Development |
| career_path_steps | 8 | Career Development |
| individual_development_plans | 13 | Career Development |
| idp_goals | 13 | Career Development |
| idp_activities | 11 | Career Development |
| mentorship_programs | 11 | Career Development |
| mentorship_pairings | 11 | Career Development |
| mentorship_sessions | 10 | Career Development |
| development_themes | 15 | Career Development |
| development_recommendations | 10 | Career Development |
| succession_development_plans | 13 | Succession (integration) |
| succession_gap_development_links | 12 | Succession (integration) |

---

## Part A: New Career Development Administrator Manual

### Manual Structure (10 Chapters)

**Chapter 1: System Overview** (~55 min)
- 1.1 Introduction & Business Value
- 1.2 Core Concepts (Career Pathing, IDP, Mentorship)
- 1.3 User Personas & Journeys (HR, Manager, Employee)
- 1.4 Database Architecture (10 core tables)
- 1.5 Module Access Points (Admin, L&D, ESS routes)

**Chapter 2: Career Paths Configuration** (~50 min)
- 2.1 Career Paths Overview
- 2.2 Career Paths Table Reference (8 fields)
- 2.3 Create Career Path Procedure
- 2.4 Career Path Steps Configuration
- 2.5 Career Path Steps Table Reference (8 fields)
- 2.6 Job Linking & Prerequisites
- 2.7 Path Activation & Lifecycle

**Chapter 3: Mentorship Programs** (~55 min)
- 3.1 Mentorship Programs Overview
- 3.2 Programs Table Reference (11 fields)
- 3.3 Create Mentorship Program
- 3.4 Program Types (succession, development, onboarding, leadership)
- 3.5 Mentor-Mentee Pairings
- 3.6 Pairings Table Reference (11 fields)
- 3.7 Pairing Lifecycle Management
- 3.8 Session Tracking
- 3.9 Sessions Table Reference (10 fields)

**Chapter 4: Individual Development Plans (IDP)** (~65 min)
- 4.1 IDP Architecture Overview
- 4.2 IDP Table Reference (13 fields)
- 4.3 Create & Manage IDPs
- 4.4 IDP Goals Configuration
- 4.5 Goals Table Reference (13 fields)
- 4.6 Goal Categories (skill, knowledge, experience, certification, education)
- 4.7 IDP Activities
- 4.8 Activities Table Reference (11 fields)
- 4.9 Activity Types & Progress Tracking
- 4.10 IDP Lifecycle (draft → active → completed)

**Chapter 5: Development Themes & AI Recommendations** (~45 min)
- 5.1 AI-Driven Development Overview
- 5.2 Development Themes Table Reference (15 fields)
- 5.3 Theme Generation from Talent Signals
- 5.4 Theme Confirmation Workflow
- 5.5 Development Recommendations
- 5.6 Recommendations Table Reference (10 fields)
- 5.7 Learning Path Integration

**Chapter 6: Cross-Module Integration** (~40 min)
- 6.1 Integration Architecture
- 6.2 Succession Planning Integration (cross-ref to Succession Manual Ch 6.8-6.9)
- 6.3 Performance Appraisal Integration
- 6.4 360 Feedback Integration
- 6.5 Learning & Training Module Integration
- 6.6 ESS Self-Service Access

**Chapter 7: Employee Self-Service** (~35 min)
- 7.1 My Career Paths Page
- 7.2 Career Path Milestones & Progress
- 7.3 My Development Plan Page
- 7.4 Goal & Activity Self-Update
- 7.5 My Mentorship Page
- 7.6 Skill Gap Visualization

**Chapter 8: Reporting & Analytics** (~30 min)
- 8.1 Career Path Coverage Metrics
- 8.2 IDP Completion Analytics
- 8.3 Mentorship Program Effectiveness
- 8.4 Development Theme Distribution

**Chapter 9: Troubleshooting & FAQs** (~25 min)
- 9.1 Career Path Issues
- 9.2 IDP Configuration Problems
- 9.3 Mentorship Pairing Conflicts
- 9.4 AI Theme Generation Issues
- 9.5 Integration Sync Problems

**Chapter 10: Appendices** (~15 min)
- 10.1 Quick Reference Card
- 10.2 Field Reference Summary
- 10.3 Glossary
- 10.4 Version History

**Total Estimated Read Time:** ~415 minutes (6.9 hours)

---

## Part B: Revised Succession Manual Chapter 8

### New Chapter 8: Succession-Career Integration (~35 min)

Replaces the current 45-minute placeholder with a lean, integration-focused chapter:

**8.1 Integration Overview** (~8 min)
- Cross-reference to Career Development Manual
- Succession-specific career development use cases
- Data flow from Succession to Career Dev

**8.2 Succession Development Plans** (~12 min)
- succession_development_plans Table Reference (13 fields)
- Link succession candidates to development plans
- Track candidate development progress inline
- Development plan status display on candidate cards

**8.3 Gap-to-Development Linking** (~10 min)
- succession_gap_development_links Table Reference (12 fields)
- Link identified skill gaps to IDP goals
- Cross-module workflow (Succession → IDP → L&D)
- Implementation status note (via IDP module)

**8.4 Mentorship for Succession Candidates** (~5 min)
- Filter mentorship programs by type='succession'
- Pair succession candidates with executive mentors
- Cross-reference to Career Dev Manual Chapter 3

---

## Implementation Plan

### Phase 1: Create Career Development Manual Infrastructure

**New Files to Create:**

```text
src/components/enablement/manual/careerdevelopment/
├── index.ts
├── CareerDevOverviewSection.tsx
├── CareerDevSetupSection.tsx
├── CareerDevMentorshipSection.tsx
├── CareerDevIDPSection.tsx
├── CareerDevAISection.tsx
├── CareerDevIntegrationSection.tsx
├── CareerDevESSSection.tsx
├── CareerDevAnalyticsSection.tsx
├── CareerDevTroubleshootingSection.tsx
├── CareerDevQuickReference.tsx
├── CareerDevDiagrams.tsx
├── CareerDevGlossary.tsx
├── CareerDevVersionHistory.tsx
└── sections/
    ├── overview/
    │   ├── index.ts
    │   ├── CareerDevIntroduction.tsx
    │   ├── CareerDevConcepts.tsx
    │   ├── CareerDevPersonas.tsx
    │   ├── CareerDevArchitecture.tsx
    │   └── CareerDevAccessPoints.tsx
    ├── careerpaths/
    │   ├── index.ts
    │   ├── CareerPathsOverview.tsx
    │   ├── CareerPathsTableRef.tsx
    │   ├── CareerPathCreation.tsx
    │   ├── CareerPathSteps.tsx
    │   ├── CareerPathStepsTableRef.tsx
    │   ├── CareerPathJobLinking.tsx
    │   └── CareerPathLifecycle.tsx
    ├── mentorship/
    │   ├── index.ts
    │   ├── MentorshipOverview.tsx
    │   ├── MentorshipProgramsRef.tsx
    │   ├── MentorshipProgramCreation.tsx
    │   ├── MentorshipProgramTypes.tsx
    │   ├── MentorshipPairings.tsx
    │   ├── MentorshipPairingsRef.tsx
    │   ├── MentorshipPairingLifecycle.tsx
    │   ├── MentorshipSessions.tsx
    │   └── MentorshipSessionsRef.tsx
    ├── idp/
    │   ├── index.ts
    │   ├── IDPOverview.tsx
    │   ├── IDPTableRef.tsx
    │   ├── IDPCreation.tsx
    │   ├── IDPGoalsConfig.tsx
    │   ├── IDPGoalsTableRef.tsx
    │   ├── IDPGoalCategories.tsx
    │   ├── IDPActivities.tsx
    │   ├── IDPActivitiesTableRef.tsx
    │   └── IDPLifecycle.tsx
    ├── ai/
    │   ├── index.ts
    │   ├── DevelopmentThemesOverview.tsx
    │   ├── DevelopmentThemesTableRef.tsx
    │   ├── ThemeGeneration.tsx
    │   ├── ThemeConfirmation.tsx
    │   ├── DevelopmentRecommendations.tsx
    │   └── RecommendationsTableRef.tsx
    ├── integration/
    │   ├── index.ts
    │   ├── IntegrationArchitecture.tsx
    │   ├── SuccessionIntegration.tsx
    │   ├── AppraisalIntegration.tsx
    │   ├── Feedback360Integration.tsx
    │   ├── LearningIntegration.tsx
    │   └── ESSIntegration.tsx
    └── ess/
        ├── index.ts
        ├── MyCareerPathsDoc.tsx
        ├── MilestoneProgress.tsx
        ├── MyDevelopmentPlanDoc.tsx
        ├── GoalActivityUpdate.tsx
        ├── MyMentorshipDoc.tsx
        └── SkillGapVisualization.tsx
```

**New Type Definition File:**

```text
src/types/careerDevelopmentManual.ts
```

**New Manual Page:**

```text
src/pages/enablement/CareerDevelopmentManualPage.tsx
```

### Phase 2: Update Succession Manual Chapter 8

**Files to Modify:**

| File | Changes |
|------|---------|
| `src/types/successionManual.ts` | Replace Part 8 structure (4 sections → 4 integration-focused sections) |
| `src/components/enablement/manual/succession/SuccessionCareerSection.tsx` | Replace placeholder with integration documentation |

**New Succession Section Files:**

```text
src/components/enablement/manual/succession/sections/career/
├── index.ts
├── SuccessionCareerIntegrationOverview.tsx
├── SuccessionDevelopmentPlansRef.tsx
├── SuccessionGapLinking.tsx
└── SuccessionMentorshipIntegration.tsx
```

### Phase 3: Update Route Configuration

**File:** `src/App.tsx` / `src/routes/lazyPages.ts`

- Add `/enablement/manuals/career-development` route
- Register CareerDevelopmentManualPage in lazy loading

### Phase 4: Update Handbook & Cross-References

**Files to Update:**

| File | Changes |
|------|---------|
| `src/data/handbookVersionHistory.ts` | Add career-development manual reference |
| Succession Manual diagrams | Update data architecture to show Career Dev as separate module |
| L&D Manual | Add cross-references to Career Development Manual |

---

## Deliverables Summary

| Deliverable | Files | Est. Lines |
|-------------|-------|-----------|
| Career Development Manual (10 chapters) | ~55 files | ~6,500 lines |
| Type definitions | 1 file | ~400 lines |
| Manual page component | 1 file | ~500 lines |
| Revised Succession Ch 8 | 5 files | ~600 lines |
| Route registration | 2 files | ~20 lines |
| Cross-reference updates | 3 files | ~50 lines |

**Total New Lines:** ~8,070 lines
**Total Files:** ~67 files

---

## Validation Checklist

**Career Development Manual:**
- [ ] All 10 core tables fully documented with field references
- [ ] All UI components documented (CareerPathsTab, MentorshipTab, CareerDevelopmentTab)
- [ ] ESS pages documented (MyCareerPathsPage, MyDevelopmentPlanPage, MyMentorshipPage)
- [ ] Cross-module integration paths documented

**Succession Manual Chapter 8:**
- [ ] Focus on succession_development_plans and succession_gap_development_links only
- [ ] Clear cross-references to Career Development Manual
- [ ] Integration workflow documented
- [ ] Previous career pathing content removed (redirected)

**Routing:**
- [ ] /enablement/manuals/career-development registered
- [ ] Breadcrumbs configured
- [ ] TOC navigation functional

---

## Implementation Sequence

1. **Create type definitions** (`careerDevelopmentManual.ts`)
2. **Create section component structure** (empty shells with exports)
3. **Implement Chapter 1 (Overview)** - establishes architecture
4. **Implement Chapter 2 (Career Paths)** - highest usage feature
5. **Implement Chapter 4 (IDP)** - core functionality
6. **Implement Chapter 3 (Mentorship)** - builds on patterns
7. **Implement Chapter 5 (AI)** - advanced feature
8. **Implement Chapter 6 (Integration)** - cross-module
9. **Implement Chapter 7 (ESS)** - employee view
10. **Implement Chapters 8-10** - analytics, troubleshooting, appendices
11. **Update Succession Chapter 8** - lean integration focus
12. **Create manual page and routing**
13. **Update handbook references**

---

## Benefits of Separation

1. **Clarity**: Career Development is a complete module serving ALL employees, not just succession candidates
2. **Reusability**: L&D, ESS, and Succession all reference the same canonical documentation
3. **Maintenance**: Updates to career pathing don't require changes to succession docs
4. **Alignment**: Matches Workday, SAP SuccessFactors, and Oracle HCM patterns
5. **Scalability**: New career development features documented in their own module
