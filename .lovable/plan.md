

# Employee Relations Module: Deep Dive Review and Gap Analysis

## Summary of Findings

The Employee Relations module has a **solid foundation** with 31 database tables and 12 UI pages. However, there are notable gaps when benchmarked against enterprise standards (BambooHR, SAP SuccessFactors, Workday). This review covers database coverage, UI completeness, dashboard organization, ESS/MSS gaps, cross-module integration, and capabilities document alignment.

---

## 1. Database Layer Assessment

### Tables Inventory (31 total)

| Group | Tables | Status |
|-------|--------|--------|
| **Core Cases** | `er_cases`, `er_case_notes` | Complete |
| **Disciplinary** | `er_disciplinary_actions` | Complete |
| **Recognition** | `er_recognition` | Complete |
| **Exit** | `er_exit_interviews` | Complete |
| **Surveys** | `er_surveys`, `er_survey_responses` | Complete |
| **Wellness** | `er_wellness_programs`, `er_wellness_enrollments` | Complete |
| **Grievances** | `grievances`, `grievance_procedures`, `grievance_procedure_steps`, `grievance_step_history`, `grievance_documents` | Complete |
| **Unions** | `unions`, `union_memberships`, `union_representatives` | Complete |
| **Collective Agreements** | `collective_agreements` | Complete |
| **CBA Engine** | `cba_agreements`, `cba_articles`, `cba_clauses`, `cba_rules`, `cba_time_rules`, `cba_unsupported_rules`, `cba_violations`, `cba_negotiations`, `cba_proposals`, `cba_amendments`, `cba_versions`, `cba_extension_requests` | Complete |
| **Legal** | `industrial_court_judgements` | Complete |

**Database Verdict: Strong.** 31 tables cover all enterprise ER domains. The CBA engine alone has 12 tables, which is above what most HRMS platforms offer.

---

## 2. UI Pages Assessment (12 pages)

| Page | Route | Assessment |
|------|-------|-----------|
| Dashboard | `/employee-relations` | Good - has stats, grouped cards |
| Analytics | `/employee-relations/analytics` | Good - 6 KPIs, 8 charts |
| Cases | `/employee-relations/cases` | Good - CRUD, status workflow, view dialog |
| Disciplinary | `/employee-relations/disciplinary` | Good - CRUD, document generation, acknowledge |
| Grievances | `/employee-relations/grievances` | Good - CRUD, procedures tab, union integration |
| Recognition | `/employee-relations/recognition` | Good - card grid, monetary values, categories |
| Surveys | `/employee-relations/surveys` | Advanced - pulse surveys, sentiment dashboard, eNPS, coaching nudges |
| Wellness | `/employee-relations/wellness` | Good - program CRUD, enrollment tracking |
| Exit Interviews | `/employee-relations/exit-interviews` | Good - scheduling, conduct interview, satisfaction ratings |
| Unions | `/employee-relations/unions` | Good - unions, agreements, memberships tabs |
| CBA Detail | `/employee-relations/unions/:id` | Advanced - 6 tabs (overview, articles, rules, negotiations, amendments, compliance) with AI import |
| Court Judgements | `/employee-relations/court-judgements` | Good - comprehensive form, precedent tracking, keyword search |

---

## 3. Gaps Identified

### Gap 1: Dashboard Category Organization Needs Refinement
**Current grouping:**
1. Cases & Disciplinary (Cases, Disciplinary, Grievances)
2. Recognition & Engagement (Recognition, Surveys, Wellness)
3. Exit & Legal (Exit Interviews, Unions, Court Judgements)
4. Analytics (Analytics)

**Issue:** This is functional but not industry-aligned. Enterprise platforms (SAP SuccessFactors) organize by lifecycle stage. Grievances are separate from Cases in enterprise terminology. Unions and Court Judgements are distinct domains.

**Recommended grouping (industry-standard):**
1. **Case & Dispute Resolution** -- Cases, Grievances, Disciplinary
2. **Employee Engagement** -- Recognition, Pulse Surveys, Wellness
3. **Union & Labor Relations** -- Unions & CBA, Court Judgements
4. **Workforce Transitions** -- Exit Interviews
5. **Insights & Reporting** -- Analytics

### Gap 2: No ESS/MSS Pages for Employee Relations
**Finding:** There are zero ESS or MSS pages for Employee Relations. Unlike HSE (which now has MyHSEPage and MssHSEPage), employees and managers have no self-service portal for ER.

**Enterprise standard requires:**

**ESS (Employee):**
- View my cases (filed by or about me)
- View my disciplinary history (with acknowledgment)
- View recognitions I've received
- View my exit interview (if applicable)
- Submit a complaint/concern (feeds into er_cases)
- View my wellness program enrollments
- Respond to pulse surveys

**MSS (Manager):**
- View team cases and grievances
- View team disciplinary actions
- Give team recognition
- View team exit interview insights
- View team wellness participation
- View team survey sentiment scores

### Gap 3: Cross-Module Navigation Links Missing
**Finding:** Zero `navigateToRecord` calls in any ER page. No clickable employee names linking to Workforce profiles.

**Required links:**
- Cases: employee name links to `/workforce/employees/{id}`
- Disciplinary: employee name links to `/workforce/employees/{id}`; case_id links to the related case
- Grievances: employee name links to `/workforce/employees/{id}`
- Recognition: employee name links to `/workforce/employees/{id}`
- Exit Interviews: employee name links to `/workforce/employees/{id}`
- Unions tab: CBA detail already uses `navigateToList` (good), but `useNavigate` is still used (needs migration)
- Court Judgements: no employee links needed (external parties)

### Gap 4: ERUnionsTab Uses Legacy `useNavigate` Instead of Workspace Navigation
**Finding:** `ERUnionsTab.tsx` line 3 imports `useNavigate` from react-router-dom and line 25 uses `navigate()`. This should use `useWorkspaceNavigation.navigateToRecord()` per the migration standard.

### Gap 5: Capabilities Document Alignment Issues
**Current badge:** "95+ Capabilities"
**Current categories:** 14 categories documented

**Missing from capabilities doc:**
- No mention of Pulse Surveys (only "Engagement survey deployment" listed under generic "Employee Surveys")
- No mention of Sentiment Dashboard or eNPS Analytics
- No mention of Manager Coaching Nudges
- No mention of CBA AI Import Wizard
- No ESS/MSS capabilities documented (since they don't exist yet)
- "Offboarding Workflows" and "Policy & Compliance" categories are listed in capabilities but have no dedicated pages or database tables in the ER module (these may live in other modules)

### Gap 6: Missing Statistics on Dashboard
**Current stats:** Open Cases, Pending Grievances, Recognitions This Month, Active Unions
**Missing (industry standard):** Active Disciplinary Actions, Pending Exit Interviews, Active Surveys, Active Wellness Programs (these are shown in Analytics but not on the main dashboard)

---

## 4. Implementation Plan

### Phase 1: Dashboard and Navigation Fixes (Quick Wins)

**1a. Reorganize dashboard categories** to match enterprise grouping:
- Case & Dispute Resolution (Cases, Grievances, Disciplinary)
- Employee Engagement (Recognition, Surveys, Wellness)
- Union & Labor Relations (Unions, Court Judgements)
- Workforce Transitions (Exit Interviews)
- Insights & Reporting (Analytics)

**1b. Add missing dashboard stats:** Active Disciplinary, Pending Exits, Active Surveys, Wellness Programs (expand from 4 to 8 stat cards in 2 rows)

**1c. Migrate ERUnionsTab from `useNavigate` to `useWorkspaceNavigation`** for CBA detail navigation

**1d. Add cross-module navigation links** (employee name clicks) across Cases, Disciplinary, Grievances, Recognition, and Exit Interview pages using `navigateToRecord`

### Phase 2: ESS Page for Employee Relations

Create `src/pages/ess/MyERPage.tsx` with tabs:
- **My Cases** -- View cases where `employee_id = user.id` or `reported_by = user.id`
- **My Disciplinary** -- View disciplinary actions where `employee_id = user.id` (read-only with acknowledge button)
- **My Recognitions** -- View recognitions where `employee_id = user.id`
- **Submit Concern** -- Dialog to create a new ER case (simplified form for employees)
- **My Wellness** -- View wellness enrollments where `employee_id = user.id`
- **Surveys** -- List active pulse surveys for response

Route: `/ess/employee-relations`

### Phase 3: MSS Page for Employee Relations

Create `src/pages/mss/MssERPage.tsx` with tabs:
- **Team Cases** -- Cases where `employee_id IN (directReportIds)`
- **Team Disciplinary** -- Actions for direct reports
- **Team Recognition** -- Give recognition + view team recognitions
- **Team Exits** -- Exit interviews for team members
- **Team Sentiment** -- Survey scores and wellness participation for team

Route: `/mss/employee-relations`

### Phase 4: Update Capabilities Document

After all changes are implemented, update `EmployeeRelationsCapabilities.tsx` to:
- Add "Pulse Surveys & Sentiment Analysis" category (sentiment dashboard, eNPS, coaching nudges)
- Add "CBA Intelligence" category (AI import wizard, rule extraction, unsupported rule tracking)
- Add "Employee Self-Service (ESS)" category
- Add "Manager Self-Service (MSS)" category
- Update integration points to include Workforce drill-down links
- Update badge from "95+" to new count

---

## Technical Details

### Files to Create
- `src/pages/ess/MyERPage.tsx` (ESS portal)
- `src/pages/mss/MssERPage.tsx` (MSS portal)

### Files to Modify
- `src/pages/employee-relations/EmployeeRelationsDashboardPage.tsx` (dashboard reorganization + extra stats)
- `src/components/employee-relations/ERUnionsTab.tsx` (migrate from `useNavigate` to `useWorkspaceNavigation`)
- `src/components/employee-relations/ERCasesTab.tsx` (add employee name click links)
- `src/components/employee-relations/ERDisciplinaryTab.tsx` (add employee name click links)
- `src/components/employee-relations/ERGrievancesTab.tsx` (add employee name click links)
- `src/components/employee-relations/ERRecognitionTab.tsx` (add employee name click links)
- `src/components/employee-relations/ERExitInterviewsTab.tsx` (add employee name click links)
- `src/routes/groups/employeeRelationsRoutes.tsx` (no change needed -- routes already exist)
- ESS/MSS route files (add new ER routes)
- `src/hooks/useEmployeeRelations.ts` (add employee-scoped and team-scoped queries for ESS/MSS)
- `src/components/enablement/product-capabilities/sections/act5/EmployeeRelationsCapabilities.tsx` (Phase 4)
- `src/components/enablement/product-capabilities/content/productCapabilitiesContent.ts` (update count)

### What Does NOT Change
- All 31 database tables (schema is complete)
- CBA detail page (already enterprise-grade with 6 tabs + AI import)
- Pulse surveys system (already advanced with sentiment + eNPS + nudges)
- Analytics page (comprehensive)
- Court Judgements page (comprehensive)

