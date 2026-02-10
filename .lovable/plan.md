

# Enhance HSE Module: ESS, MSS, and Cross-Module Integration

## Summary

The core HSE admin module (32 tables, 20 pages) is industry-standard. However, the **ESS** and **MSS** HSE pages are significantly underdeveloped, and there are **zero cross-module navigation links** anywhere in the HSE pages. This plan brings all three areas to enterprise standard.

---

## Part 1: ESS HSE Page Enhancement (`MyHSEPage.tsx`)

### Current State (3 tabs)
- My Incidents (report + view)
- Safety Policies (view only, no acknowledgment)
- My Training

### Proposed State (7 tabs)

| Tab | What it Does | DB Table |
|-----|-------------|----------|
| **My Incidents** | Report + track incidents (keep as-is) | `hse_incidents` |
| **Near-Miss Reports** | Report near-misses with anonymous option | `hse_near_misses` (`reported_by`, `is_anonymous`) |
| **Safety Observations** | Submit positive/negative observations | `hse_safety_observations` (`observer_id`) |
| **My PPE** | View issued PPE, request replacements | `hse_ppe_issuances` (`employee_id`) |
| **Safety Policies** | View policies + acknowledge button | `hse_safety_policies` + `hse_policy_acknowledgments` |
| **My Training** | View training records + certifications (keep as-is) | `hse_training_records` |
| **Ergonomic Requests** | Request workstation assessment, view results | `hse_ergonomic_assessments` (`employee_id`) |

### Technical Changes

**New tab: Near-Miss Reports**
- Query `hse_near_misses` filtered by `reported_by = user.id`
- Report dialog with fields: description, location, potential_consequence, potential_severity, hazard_type, immediate_actions, `is_anonymous` toggle
- Card list showing status, severity, corrective actions

**New tab: Safety Observations**
- Query `hse_safety_observations` filtered by `observer_id = user.id`
- Report dialog: observation_type, category, description, behavior_observed, is_positive toggle
- Card list with positive/negative badges

**New tab: My PPE**
- Query `hse_ppe_issuances` filtered by `employee_id = user.id`, joined with `hse_ppe_types` for names
- Read-only card list: PPE type, issued date, quantity, return status
- No create dialog (PPE is issued by safety officers)

**Enhanced tab: Safety Policies**
- Add "Acknowledge" button per policy using `hse_policy_acknowledgments`
- Show acknowledged date if already acknowledged
- Insert record with `policy_id`, `employee_id`, `acknowledged_at`

**New tab: Ergonomic Requests**
- Query `hse_ergonomic_assessments` filtered by `employee_id = user.id`
- Request dialog: workstation_type, location, description (notes field)
- Status defaults to "requested"
- Show results (findings, recommendations, equipment_needed) when completed

**Hook changes: `useHSE.ts`**
- Add queries for `hse_near_misses`, `hse_safety_observations`, `hse_ppe_issuances` (with `hse_ppe_types` join), `hse_policy_acknowledgments`, `hse_ergonomic_assessments`
- Add mutations for creating near-misses, observations, policy acknowledgments, and ergonomic requests

---

## Part 2: MSS HSE Page Enhancement (`MssHSEPage.tsx`)

### Current State (2 tabs)
- Team Incidents (table view)
- Training Compliance (table view)

### Proposed State (5 tabs)

| Tab | What it Does | DB Table |
|-----|-------------|----------|
| **Team Incidents** | View team incidents + near-misses combined (enhanced) | `hse_incidents` + `hse_near_misses` |
| **Training Compliance** | Team training + expiry tracking (keep as-is) | `hse_training_records` |
| **Team Safety** | Safety observations for team, PPE compliance | `hse_safety_observations` + `hse_ppe_issuances` |
| **Inspections & Permits** | Inspections in team areas, pending permit approvals | `hse_inspections` + `hse_work_permits` |
| **Risk Overview** | Risk assessments for team departments, corrective actions | `hse_risk_assessments` + `hse_hazards` |

### Technical Changes

**Enhanced tab: Team Incidents**
- Add a sub-section or merged view showing near-misses reported by direct reports
- Query `hse_near_misses` filtered by `reported_by IN (directReportIds)`
- Add KPI card for near-miss count

**New tab: Team Safety**
- Safety observations where `employee_observed IN (directReportIds)` or `observer_id IN (directReportIds)`
- PPE issuances for team: `hse_ppe_issuances` filtered by `employee_id IN (directReportIds)`
- Show overdue returns and missing PPE

**New tab: Inspections & Permits**
- Inspections where `inspector_id = user.id` or department matches team
- Work permits where `requested_by IN (directReportIds)` or `approved_by = user.id`
- Pending approvals highlighted

**New tab: Risk Overview**
- Risk assessments for departments the manager oversees
- Open hazards with corrective action due dates
- Summary cards: total risks, high/critical count, overdue actions

**New KPI cards (top of page):**
- Near-misses reported (this month)
- PPE compliance rate
- Open corrective actions

---

## Part 3: Cross-Module Navigation Links

Currently there are **zero** cross-module links in any HSE page. The following links should be added using the `useWorkspaceNavigation` pattern:

### HSE Incidents Page (`HSEIncidentsPage.tsx`)
- **Employee link**: Click employee name to navigate to `/workforce/employees/{id}` via `navigateToRecord`
- **Workers' Comp link**: If incident has a linked claim (`hse_workers_comp_claims.incident_id`), show "View Claim" link to `/hse/workers-comp`

### HSE Workers' Comp Page (`HSEWorkersCompPage.tsx`)
- **Incident link**: Click incident number to navigate to `/hse/incidents` (the source incident)
- **Employee link**: Click employee to navigate to `/workforce/employees/{id}`

### HSE Safety Training Page (`HSESafetyTrainingPage.tsx`)
- **LMS link**: If `lms_course_id` is set, show "View in LMS" link to `/training` (L&D module)

### HSE Near-Miss Page (`HSENearMissPage.tsx`)
- **Employee link**: Click `assigned_to` to navigate to employee profile

### HSE Inspections Page (`HSEInspectionsPage.tsx`)
- **Inspector link**: Click inspector name to navigate to employee profile

### ESS HSE Page (`MyHSEPage.tsx`)
- **Training link**: Link training records to `/ess/training` if LMS course exists

### MSS HSE Page (`MssHSEPage.tsx`)
- **Employee links**: Click any employee name to navigate to their profile via `navigateToRecord`

---

## Implementation Sequence

Due to the build memory constraint, this should be implemented in 3 phases:

1. **Phase 1**: Enhance `useHSE.ts` with new queries/mutations for near-misses, observations, PPE issuances, policy acknowledgments, and ergonomic assessments
2. **Phase 2**: Update `MyHSEPage.tsx` (ESS) with 4 new tabs + policy acknowledgment enhancement
3. **Phase 3**: Update `MssHSEPage.tsx` (MSS) with 3 new tabs + enhanced KPIs + cross-module navigation links across all HSE pages

## What Does Not Change
- Database schema (all 32 tables are already complete)
- HSE admin pages (all 20 pages are functionally complete)
- HSE Dashboard organization (already updated to ISO 45001)
- Route definitions (no new routes needed)

