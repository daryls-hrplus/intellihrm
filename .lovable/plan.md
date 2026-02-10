

# Product Capabilities Document -- Gap Analysis: Recruitment, Onboarding, Offboarding & Workforce Management

## Summary

After comparing implemented pages against the current Product Capabilities document, I identified **18 gaps** -- heavily concentrated in **Recruitment** (6 gaps) and **Workforce Management** (10 gaps). Onboarding and Offboarding are well-covered (2 minor gaps).

---

## Module 1: Recruitment -- Gaps Found

The current document has 4 categories with ~24 line items. The actual implementation has **13 dedicated sub-modules** organized into Core Recruitment, Evaluation, Configuration, and Analytics groups.

### Gap 1: Referral Program (MISSING CATEGORY)
**Page:** `ReferralsPage.tsx` with `ReferralProgramTab` component
The document mentions nothing about employee referral programs. This is a dedicated sub-module with its own page.

**Recommendation:** Add new category "Referral & Employee Advocacy" with items:
- Employee referral program management with reward tracking
- Referral submission portal with candidate linking
- Referral bonus tracking and payout automation
- Referral source analytics and ROI measurement

### Gap 2: Interview Panels (MISSING)
**Page:** `InterviewPanelsPage.tsx` with `InterviewPanelsTab` component
The doc mentions "Panel review workflows" as one line item. The actual implementation is a full panel management system.

**Recommendation:** Expand "Selection & Assessment" or add items:
- Interview panel creation with member assignment and expertise tagging
- Panel scheduling coordination with availability management
- Interviewer workload balancing and assignment tracking

### Gap 3: Assessments (UNDER-DOCUMENTED)
**Page:** `AssessmentsPage.tsx` with `AssessmentsTab` component (dedicated page)
The doc says "Assessment integrations" as a single line item. The implementation is a full assessment management system.

**Recommendation:** Expand to:
- Assessment template creation with configurable question types
- Candidate assessment assignment and tracking
- Assessment scoring with rubric-based evaluation
- Assessment results analytics and comparison

### Gap 4: Offer Management (UNDER-DOCUMENTED)
**Page:** `OffersPage.tsx` with `OfferManagementTab` component (dedicated page)
The doc mentions "Offer comparison tools" as one line. The implementation is complete offer lifecycle management.

**Recommendation:** Add new category "Offer Management" with items:
- Offer creation with salary, benefits, and terms configuration
- Multi-level offer approval workflows
- Offer letter generation with customizable templates
- Offer tracking with acceptance/rejection/counter workflows
- Compensation benchmarking integration for offer validation

### Gap 5: Email Templates & Communication (MISSING)
**Page:** `EmailTemplatesPage.tsx` with `EmailTemplatesTab` component
No mention of recruitment communication templates in the document.

**Recommendation:** Add new category "Recruitment Communication" or expand existing:
- Email template management with variable placeholders
- Stage-based automated candidate communication
- Branded email templates for employer experience
- Communication history and audit trail per candidate

### Gap 6: Source Effectiveness & Job Board Configuration (UNDER-DOCUMENTED)
**Pages:** `SourcesPage.tsx` (source analytics), `JobBoardsPage.tsx` (209-line config UI)
The doc mentions "Job board API integrations" and "Social media amplification" but doesn't cover the actual source effectiveness analysis tool or the job board configuration interface.

**Recommendation:** Expand "Job Posting & Sourcing" with:
- Source effectiveness tracking with cost-per-hire by channel
- Job board integration configuration with API key management
- Automated job posting syndication with status tracking
- Source ROI analytics with conversion funnel by channel

---

## Module 2: Onboarding -- Gaps Found (Minor)

### Gap 7: Onboarding Analytics (MINOR)
The implementation includes detailed progress tracking with completion percentages per hire. The doc covers this adequately at a conceptual level. No change needed.

**Recommendation:** No change required -- current coverage is adequate.

---

## Module 3: Offboarding -- Gaps Found (Minor)

### Gap 8: Offboarding Task Templates (MINOR)
**Page:** `OffboardingPage.tsx` (985 lines) includes template management, task assignment, and clearance tracking. The doc covers exit types well but could mention template configurability more explicitly.

**Recommendation:** Add to "Exit Processing":
- Configurable exit task templates by departure type and department

---

## Module 4: Workforce Management -- Gaps Found (Major)

The current document has 4 categories with ~24 line items. The actual implementation has **26 dedicated sub-modules** organized into 5 dashboard groups. This is the most under-documented module.

### Gap 9: Divisions Management (MISSING)
**Page:** `DivisionsPage.tsx` (611 lines)
Full division hierarchy management with parent-child relationships and department linking. Not mentioned anywhere in the document.

**Recommendation:** Add to "Organization Structure":
- Division management with hierarchical parent-child relationships
- Division-to-department linking and organizational mapping

### Gap 10: Governance & Company Boards (MISSING)
**Pages:** `GovernancePage.tsx` (134 lines), `CompanyBoardsPage.tsx` (698 lines)
Board of directors management, management team tracking, and governance oversight. Zero mention in the document.

**Recommendation:** Add new category "Corporate Governance" with items:
- Board of directors management with member profiles and term tracking
- Management team composition and reporting structure
- Board meeting scheduling and attendance tracking
- Governance compliance reporting and oversight

### Gap 11: Capability Framework / Registry (UNDER-DOCUMENTED)
**Page:** `CapabilityRegistryPage.tsx` (1,028 lines)
A comprehensive capability management system with skills, competencies, and organizational values -- including audit filters for governance gaps (per memory). The doc mentions "Competency and skill requirements" as one position management line item.

**Recommendation:** Add new category "Capability Framework" with items:
- Skills registry with proficiency levels and behavioral indicators
- Competency framework management with job linkage
- Organizational values definition with recognition alignment
- Capability audit filters for governance gap identification (missing indicators, unlinked skills)
- Capability-to-position mapping for talent architecture

### Gap 12: Responsibilities Management (MISSING)
**Page:** `ResponsibilitiesPage.tsx` (1,152 lines)
Full responsibility definition and assignment system. Not mentioned in the document.

**Recommendation:** Add to "Position Management" or new category:
- Responsibility catalog with categorization and ownership
- Position-to-responsibility mapping
- Responsibility assignment tracking and accountability matrix

### Gap 13: Qualifications Management (MISSING)
**Page:** `QualificationsPage.tsx`
Academic qualifications and professional certification tracking. Not mentioned in the document.

**Recommendation:** Add to "Employee Master Data":
- Academic qualification tracking with institution and date management
- Professional certification management with expiry alerts
- Qualification verification workflows and document attachment

### Gap 14: Employee Assignments (MISSING)
**Page:** `EmployeeAssignmentsPage.tsx` (1,049 lines)
Multi-assignment management for employees (concurrent positions, acting roles, secondments). Not mentioned.

**Recommendation:** Add new category or expand "Lifecycle & Transactions":
- Multi-assignment management with concurrent position support
- Acting and secondment assignment tracking with date ranges
- Primary vs. secondary assignment designation
- Assignment history and timeline visualization

### Gap 15: Employee Transactions Dashboard (UNDER-DOCUMENTED)
**Page:** `EmployeeTransactionsPage.tsx` with module-based categorization (per memory: Entry, Movement, Exit, Compensation, Status)
The doc mentions "Promotions and transfers with approval workflows" generically. The actual implementation is a full governance dashboard with 5 transaction modules.

**Recommendation:** Expand "Lifecycle & Transactions" significantly:
- Module-based transaction categorization (Entry, Movement, Exit, Compensation, Status)
- Transaction dashboard with KPI summary (Pending, Draft, Completed counts)
- Visual transaction status timeline (Draft to Completed)
- Contract extensions and conversions
- Secondment and acting appointment management
- Salary and rate change workflows
- Probation confirmation and extension processing
- Card and table view modes with persistent preferences

### Gap 16: Headcount Planning Suite (UNDER-DOCUMENTED)
**Pages:** `HeadcountRequestsPage.tsx`, `HeadcountAnalyticsPage.tsx`, `HeadcountForecastPage.tsx`
The doc mentions "Headcount planning and requests" as one line item. The implementation is 3 dedicated pages.

**Recommendation:** Add new category "Headcount Planning & Forecasting":
- Headcount request workflows with approval routing
- Headcount analytics dashboard with trend visualization
- AI-powered headcount forecasting with scenario modeling
- Monte Carlo simulation for workforce demand projections
- Shareable forecast scenarios with stakeholder collaboration

### Gap 17: Position Control & Vacancies (UNDER-DOCUMENTED)
**Page:** `PositionControlVacanciesPage.tsx` (129 lines) with `VacancyDashboard` component
The doc mentions "Vacancy tracking and reporting" as one line. The implementation is a full vacancy dashboard.

**Recommendation:** Expand "Position Management":
- Position control dashboard with fill rate analytics
- Vacancy tracking with aging metrics and recruitment linkage
- Budget vs. actual headcount comparison by department
- Vacancy-to-requisition conversion workflow

### Gap 18: Org Changes Reporting & Org Structure Config (MISSING)
**Pages:** `OrgChangesPage.tsx`, `OrgStructureConfigPage.tsx`
Organizational change reporting and structure configuration. Not documented.

**Recommendation:** Add to "Organization Structure":
- Org changes reporting with historical comparison and scheduled reports
- Org structure configuration with hierarchy rule management
- Date-effective organizational restructuring with impact analysis

---

## Proposed Changes to `capabilitiesData.ts`

### For Recruitment module:
1. **Add new category: "Offer Management"** with ~5 items
2. **Add new category: "Referral & Employee Advocacy"** with ~4 items
3. **Add new category: "Recruitment Communication"** with ~4 items
4. **Expand "Selection & Assessment"** with ~6 additional items for panels, assessments, and scorecards
5. **Expand "Job Posting & Sourcing"** with ~4 items for source analytics and job board configuration
6. **Update badge** from "85+ Capabilities" to "110+ Capabilities"

### For Onboarding module:
1. No significant changes needed -- current coverage is adequate

### For Offboarding module:
1. **Add 1 item** to "Exit Processing" for configurable exit task templates
2. No badge change needed

### For Workforce Management module:
1. **Add new category: "Corporate Governance"** with ~4 items
2. **Add new category: "Capability Framework"** with ~5 items
3. **Add new category: "Headcount Planning & Forecasting"** with ~5 items
4. **Add new category: "Employee Assignments & Transactions"** with ~8 items (or expand "Lifecycle & Transactions" heavily)
5. **Expand "Organization Structure"** with ~4 items for divisions, org changes, config
6. **Expand "Employee Master Data"** with ~3 items for qualifications and responsibilities
7. **Expand "Position Management"** with ~4 items for vacancy dashboard and position control
8. **Update badge** from "150+ Capabilities" to "195+ Capabilities"

### Executive Summary:
- Update total capabilities count from "1,710+" to "1,760+" (approximate net increase of ~50 new documented capabilities)

---

## Technical Implementation

All changes are confined to a single file:
- `src/components/enablement/product-capabilities/data/capabilitiesData.ts`

Each gap translates to either new `categories` entries or expanded `items` arrays within the existing Recruitment and Workforce module objects. No structural or schema changes needed.

