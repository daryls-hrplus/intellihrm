

# Update Act 4 Capabilities: Learning, Goals, Appraisals, 360 Feedback, Continuous Performance, Succession + New Career Development Module

## Root Cause (Same as Acts 2 & 3)

The Table of Contents counts were never synchronized with the component badges. Additionally, Career Development features are embedded inside the Succession component but the user wants them separated into a standalone module (following the Workday "Career Hub" model already established in the codebase).

---

## Gap Analysis

### Learning & LMS (Badge: 130+, TOC: 130+ -- correct)

**Missing from document:**

| Page | What's Missing |
|------|---------------|
| VendorManagementPage.tsx (336 lines) | Training vendor management, contracts, and performance tracking |
| InteractiveTrainingPage.tsx (335 lines) | Interactive training player with program enrollment and progress |
| CompetencyGapAnalysisPage.tsx | Competency gap analysis dashboard linked to training |
| LiveSessionsPage.tsx | Live session scheduling and management |
| CourseCompetenciesPage.tsx | Course-to-competency mapping administration |

**Recommendation:** Add new category "Vendor & External Training" (~5 items) for vendor management. Add items to existing categories for interactive training, live sessions, and competency mapping. Update badge to **140+ Capabilities**.

---

### Goals Management (Badge: 45+, TOC: 45+ -- correct)

No significant gaps found. The component is comprehensive with 7 categories covering frameworks, creation, alignment, progress, quality, dependencies, and analytics.

**No changes needed.**

---

### Performance Appraisals (Badge: 50+, TOC: 50+ -- correct)

**Missing from document:**

| Feature | What's Missing |
|---------|---------------|
| Dispute Workflow | File Dispute with 6 categories (Rating, Comments, Goals, Competencies, Evidence, Process), employee submission, manager rebuttal, HR resolution queue (Uphold/Modify/Overturn) |
| Appraisal Form Preview | Full form preview before submission |
| Performance Intelligence Hub | Unified analytics hub with AI predictions, trend analysis, and workforce insights |

**Recommendation:** Add new category "Dispute & Grievance Resolution" (~5 items). Add form preview to "Review Execution". Update badge to **60+ Capabilities**.

---

### 360 Feedback (Badge: 35+, TOC: 35+ -- correct)

No significant gaps. The component is comprehensive with 7 categories. Blind spot visualization, sentiment analysis, and development actions are all covered.

**No changes needed.**

---

### Continuous Performance (Badge: 55+, TOC: 55+ -- correct)

**Missing from document:**

| Feature | What's Missing |
|---------|---------------|
| Talent Unified Dashboard | Cross-module talent overview combining performance, succession, and development data (570-line page) |
| Performance Intelligence Hub | AI-powered analytics hub with operations analytics, AI insights, and predictive modeling (414-line page) |

**Recommendation:** Add items to "Performance Analytics" for unified talent dashboard and intelligence hub. Update badge to **60+ Capabilities**.

---

### Succession Planning (Currently Badge: 95+)

Career Development features (Career Paths, Career Development, Mentorship) currently live inside this component. These need to be **extracted** into a standalone module.

**After extraction:** Remove "Career Paths", "Career Development", and "Mentorship Programs" categories from SuccessionCapabilities. This reduces the component from 14 categories to 11. Update badge to **75+ Capabilities**.

---

### NEW: Career Development (Standalone Module)

Extract from Succession and expand based on actual codebase pages:

| Source | Content |
|--------|---------|
| SuccessionCapabilities "Career Paths" | Career path configuration, step definitions, skill mapping, milestones |
| SuccessionCapabilities "Career Development" | Career conversations, development themes, goal alignment, skill gap remediation |
| SuccessionCapabilities "Mentorship Programs" | Mentor-mentee pairing, AI matching, session tracking, effectiveness metrics |
| CareerDevelopmentPage.tsx | IDP management, development activity tracking |
| MyCareerPathsPage.tsx | ESS career path viewing and progress |
| MyCareerPlanPage.tsx | Personal career plan with succession readiness |
| MyDevelopmentThemesPage.tsx | AI development themes from 360 feedback |
| TrainingCareerPathsPage.tsx | Admin career path configuration via L&D |
| TrainingMentorshipPage.tsx | Mentorship administration via L&D |

**Recommendation:** Create new `CareerDevelopmentCapabilities.tsx` with ~45 capabilities across 5 categories: Career Paths, Individual Development Plans, Mentorship Programs, Development Themes & AI, Career Analytics.

---

## Changes Required (8 files)

### File 1: NEW `CareerDevelopmentCapabilities.tsx`

Create new component at `src/components/enablement/product-capabilities/sections/act4/CareerDevelopmentCapabilities.tsx`

**5 categories:**
1. **Career Paths & Progression** (~7 items): Path configuration, step definitions, skill requirements, milestone tracking, lateral moves, career aspirations, ladder templates
2. **Individual Development Plans** (~7 items): IDP creation, development goal setting, activity tracking, feedback linkage, progress monitoring, manager collaboration, learning course linkage
3. **Mentorship Programs** (~7 items): Program configuration, mentor-mentee pairing, AI-assisted matching, session scheduling, goal-based mentoring, effectiveness metrics, mentor pool management
4. **Development Themes & AI** (~5 items): AI development theme generation from 360 feedback, career conversation tracking, skill gap remediation planning, development resource matching, progress milestone tracking
5. **Career Analytics** (~5 items): Career progression tracking, path completion rates, mentorship program effectiveness, development investment ROI, career mobility patterns

Badge: **"45+ Capabilities"**
Icon: `TrendingUp` or `Route`
ID: `career-development`

### File 2: `LearningCapabilities.tsx`

- Update badge: "130+" to "140+"
- Add new category: **"Vendor & External Training"** (~5 items): Vendor registration and contract management, vendor performance tracking and ratings, external training record management, vendor cost tracking and budget alignment, preferred vendor catalog
- Expand "Training Administration": add live session management with virtual classroom integration
- Expand "Training Needs & Skills": add competency gap analysis dashboard
- Expand "Content Authoring": add interactive training module builder with branching scenarios

### File 3: `AppraisalsCapabilities.tsx`

- Update badge: "50+" to "60+"
- Add new category: **"Dispute & Grievance Resolution"** (~6 items): Employee dispute filing with 6 dispute categories, dispute submission with evidence and justification, manager rebuttal and response workflow, HR dispute queue with resolution options (Uphold/Modify/Overturn), dispute audit trail and outcome documentation, escalation paths for unresolved disputes
- Expand "Review Execution": add full form preview before submission
- Expand "Appraisal Analytics": add Performance Intelligence Hub with AI predictions

### File 4: `ContinuousPerformanceCapabilities.tsx`

- Update badge: "55+" to "60+"
- Expand "Performance Analytics": add unified talent dashboard with cross-module insights, add Performance Intelligence Hub with AI-powered workforce modeling

### File 5: `SuccessionCapabilities.tsx`

- Update badge: "95+" to "75+"
- **Remove** 3 categories: "Career Paths", "Career Development", "Mentorship Programs" (moved to Career Development module)
- Update integrations list to add cross-reference to Career Development module

### File 6: `sections/index.ts`

- Add export: `export { CareerDevelopmentCapabilities } from "./act4/CareerDevelopmentCapabilities";`

### File 7: `ProductCapabilitiesDocument.tsx`

- Import `CareerDevelopmentCapabilities`
- Add new section between Continuous Performance and Succession:
  ```
  <section id="career-development" className="scroll-mt-20">
    <CareerDevelopmentCapabilities />
  </section>
  ```
- Update Act 4 divider `modules` prop:
  ```
  ["Learning & LMS (140+)", "Goals (45+)", "Appraisals (60+)", "360 Feedback (35+)", "Continuous Performance (60+)", "Career Development (45+)", "Succession (75+)"]
  ```
- This gives Act 4 total: 140+45+60+35+60+45+75 = **460+**

### File 8: `TableOfContents.tsx`

- Update Act 4 title: "Act 4: Develop & Grow (460+)"
- Update children counts:
  - Learning & LMS: "130+" to "140+"
  - Appraisals: "50+" to "60+"
  - Continuous Performance: "55+" to "60+"
  - Succession: "95+" to "75+"
- Add new child: `{ id: "career-development", title: "Career Development (45+)", level: 2 }` (between Continuous Performance and Succession)

---

## What Does Not Change

- `GoalsCapabilities.tsx` -- no gaps found
- `Feedback360Capabilities.tsx` -- no gaps found
- `capabilitiesData.ts` -- not the rendering source

## Technical Notes

- One new file created (CareerDevelopmentCapabilities.tsx)
- Icons needed in new file: `Route`, `Target`, `Heart`, `Brain`, `BarChart3` (all from lucide-react)
- The OOM build error is pre-existing and unrelated to these changes

