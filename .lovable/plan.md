
# Enhance Manager Self-Service Dashboard Analytics

## Executive Summary
The Manager Self-Service (MSS) dashboard currently provides a category-based navigation hub with basic AI coaching and leave intelligence. Based on industry standards (Workday, SAP SuccessFactors, Oracle HCM) and the module categories visible in the uploaded screenshot, this plan proposes adding **consolidated team KPI widgets** directly to the MSS landing page to give managers immediate visibility into their team's status across all areas.

---

## Current State Analysis

### What the MSS Dashboard Currently Shows
1. **Team Leave Intelligence** - AI-powered absence patterns and no-show predictions
2. **Resumption of Duty Widget** - Pending ROD verifications
3. **Coaching Inbox** - AI-generated intervention prompts for team support
4. **Grouped Module Cards** - Navigation links organized into 5 sections

### What's Missing (Industry Benchmark Gap)
Based on Workday, SAP SuccessFactors, and Oracle HCM patterns, manager dashboards typically display:
- **At-a-glance team health KPIs** before navigation
- **Action-required counters** across all modules
- **Performance distribution visualization**
- **Goal progress summaries**
- **Pending approvals consolidation**
- **Risk indicators** (attrition, compliance, overdue items)
- **Team workforce composition metrics**

---

## Proposed Enhancements

### 1. Team Health Summary Row (New Widget)
**Purpose:** Single-glance team status across all categories

| Metric | Source | Description |
|--------|--------|-------------|
| Team Size | profiles | Direct reports count |
| Actions Pending | workflow_approvals | All pending approvals |
| Overdue Items | Multiple tables | Leave, training, appraisals overdue |
| High Performers | appraisals | % rated 4-5 in last cycle |
| At Risk | Multiple signals | Attrition/compliance risk count |

**Industry Pattern:** Workday Team Summary Widget

---

### 2. Performance Snapshot Card (New Widget)
**Purpose:** Quick view of team performance metrics

| Metric | Description |
|--------|-------------|
| Appraisal Completion Rate | % of team with completed appraisals this cycle |
| Team Average Rating | Numeric average from last appraisal |
| Rating Distribution | Mini bar chart showing 1-5 distribution |
| Goals On-Track | % of team goals at or ahead of schedule |
| PIPs Active | Count of active performance improvement plans |

**Industry Pattern:** SAP SuccessFactors Performance Dashboard

---

### 3. Pending Approvals Consolidated Widget (New Widget)
**Purpose:** Single counter for all pending manager actions

| Category | Source |
|----------|--------|
| Leave Requests | leave_requests where approver = manager |
| Time Approvals | time_entries pending |
| Training Requests | training_requests pending |
| Expense Claims | expense_requests pending |
| Workflow Approvals | workflow_approvals pending |

**Industry Pattern:** Oracle HCM Approvals Inbox

---

### 4. Team Composition Mini-Dashboard (New Widget)
**Purpose:** Workforce snapshot for the manager's span of control

| Metric | Description |
|--------|-------------|
| New Hires (90 days) | Recently onboarded team members |
| Probationary | Team members still in probation |
| Upcoming Anniversaries | Work anniversaries next 30 days |
| Expiring Documents | Visas, certifications, licenses expiring |
| Pending Exits | Team members in offboarding |

**Industry Pattern:** Workday Workforce Planning

---

### 5. Training & Development Status Card (New Widget)
**Purpose:** L&D compliance visibility for managers

| Metric | Description |
|--------|-------------|
| Active Enrollments | Team members in training |
| Completion Rate | % of assigned training completed |
| Overdue Training | Count of past-due assignments |
| Expiring Certifications | Certifications expiring in 90 days |
| Development Plans | Active IDPs for team |

**Industry Pattern:** SAP SuccessFactors Learning Dashboard

---

### 6. Succession & Talent Card (New Widget)
**Purpose:** Talent pipeline health for manager's team

| Metric | Description |
|--------|-------------|
| Succession Coverage | % of key positions with successors |
| Ready Now Candidates | Team members flagged as "ready now" |
| High Potentials | Team members in HiPo talent pools |
| Flight Risk | Employees flagged for attrition risk |
| Skill Gaps | Critical skill gaps identified |

**Industry Pattern:** Workday Succession Planning

---

### 7. Compensation Equity Alert (New Widget)
**Purpose:** Pay equity visibility for managers

| Metric | Description |
|--------|-------------|
| Avg Compa-Ratio | Team average pay vs. midpoint |
| Below Midpoint | Count of team members < 95% compa |
| Above Maximum | Count exceeding range maximum |
| Pay Equity Alerts | Gender/role equity flags |

**Industry Pattern:** Oracle HCM Compensation

---

## Technical Implementation

### New Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| `TeamHealthSummary.tsx` | `src/components/mss/` | Consolidated KPI row |
| `PerformanceSnapshotCard.tsx` | `src/components/mss/` | Performance metrics |
| `PendingApprovalsWidget.tsx` | `src/components/mss/` | Approval consolidation |
| `TeamCompositionCard.tsx` | `src/components/mss/` | Workforce composition |
| `TeamTrainingStatusCard.tsx` | `src/components/mss/` | L&D metrics |
| `TeamSuccessionCard.tsx` | `src/components/mss/` | Talent pipeline |
| `CompensationAlertCard.tsx` | `src/components/mss/` | Pay equity indicators |

### Data Hooks to Create

| Hook | Purpose |
|------|---------|
| `useMssTeamMetrics()` | Consolidated team KPIs from multiple tables |
| `useMssPendingApprovals()` | All pending approval counts |
| `useMssRiskIndicators()` | Attrition, compliance, overdue counts |

### Page Modifications

**File:** `src/pages/mss/ManagerSelfServicePage.tsx`

**Changes:**
1. Add `TeamHealthSummary` widget at top (after breadcrumbs)
2. Add new grid section with 3 columns of metric cards
3. Keep existing widgets (Leave Intelligence, ROD, Coaching Inbox)
4. Move navigation cards to bottom (collapsible)

---

## Proposed Layout

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Manager Self-Service                                                             │
│ Manage your team and direct reports                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ TEAM HEALTH SUMMARY (5 stat cards)                                          │ │
│ │ [Team: 12] [Actions: 8] [Overdue: 3⚠] [High Performers: 67%] [At Risk: 2]   │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────┐ ┌────────────────────────────┐ ┌──────────────┐ │
│ │ PERFORMANCE SNAPSHOT       │ │ PENDING APPROVALS          │ │ TEAM         │ │
│ │ - Appraisal: 85% complete  │ │ - Leave: 3                 │ │ COMPOSITION  │ │
│ │ - Avg Rating: 3.8          │ │ - Time: 5                  │ │ - New: 2     │ │
│ │ - On-Track: 72%            │ │ - Training: 2              │ │ - Probation:1│ │
│ │ - [Rating Distribution]    │ │ - Workflow: 1              │ │ - Exits: 0   │ │
│ │ - PIPs: 1                  │ │ [View All] [Quick Approve] │ │ - Expiring:3 │ │
│ └────────────────────────────┘ └────────────────────────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────┐ ┌────────────────────────────┐ ┌──────────────┐ │
│ │ TRAINING & DEVELOPMENT     │ │ SUCCESSION & TALENT        │ │ COMPENSATION │ │
│ │ - Active: 8 enrolled       │ │ - Coverage: 75%            │ │ - Avg Compa: │ │
│ │ - Complete: 92%            │ │ - Ready Now: 3             │ │   0.98       │ │
│ │ - Overdue: 1 ⚠             │ │ - HiPos: 2                 │ │ - Below: 2   │ │
│ │ - Expiring Certs: 2        │ │ - Flight Risk: 1 ⚠         │ │ - Alerts: 0  │ │
│ │ - Active IDPs: 5           │ │ - Skill Gaps: 4            │ │              │ │
│ └────────────────────────────┘ └────────────────────────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [Existing: Team Leave Intelligence Card]                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [Existing: ROD Widget]                                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [Existing: Coaching Inbox]                                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [Navigation Cards - Collapsible Sections]                                        │
│ ▸ Team Management   ▸ Approvals & Attendance   ▸ Performance & Development       │
│ ▸ Team Resources    ▸ Analytics & Support                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Files to Create

| File | Description |
|------|-------------|
| `src/components/mss/TeamHealthSummary.tsx` | Summary stat row with 5 KPI cards |
| `src/components/mss/PerformanceSnapshotCard.tsx` | Performance metrics with mini chart |
| `src/components/mss/PendingApprovalsWidget.tsx` | Consolidated approval counts |
| `src/components/mss/TeamCompositionCard.tsx` | Workforce composition metrics |
| `src/components/mss/TeamTrainingStatusCard.tsx` | L&D progress metrics |
| `src/components/mss/TeamSuccessionCard.tsx` | Succession and talent metrics |
| `src/components/mss/CompensationAlertCard.tsx` | Pay equity indicators |
| `src/hooks/useMssTeamMetrics.ts` | Consolidated data hook |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/mss/ManagerSelfServicePage.tsx` | Add new widget grid, reorganize layout |
| `src/components/mss/index.ts` | Export new components |

---

## Implementation Phases

### Phase 1: Core Metrics (This Implementation)
1. Create `TeamHealthSummary` with consolidated stats
2. Create `PerformanceSnapshotCard` with appraisal data
3. Create `PendingApprovalsWidget` with approval counts
4. Update MSS page layout

### Phase 2: Extended Metrics
1. Create `TeamCompositionCard`
2. Create `TeamTrainingStatusCard`
3. Create `TeamSuccessionCard`
4. Create `CompensationAlertCard`

### Phase 3: Enhancements
1. Add drill-down from each card to detailed views
2. Add AI insights to each metric category
3. Add export/print capabilities
4. Add date range filtering

---

## Industry Alignment Summary

| Benchmark | Features Covered |
|-----------|------------------|
| **Workday** | Team Summary, Workforce Composition, Succession Coverage |
| **SAP SuccessFactors** | Performance Distribution, Training Status, Talent Pools |
| **Oracle HCM** | Consolidated Approvals, Compensation Equity, Risk Indicators |

This enhancement transforms the MSS dashboard from a navigation hub into a true **manager command center** with at-a-glance visibility across all team metrics.
