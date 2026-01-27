
# Unified Version & Release Management System with AI Release Manager Agent

## Executive Summary

This plan consolidates the fragmented Release Management and Version Lifecycle concerns into a single, simplified **Release Command Center** with an AI-powered **Release Manager Agent**. The approach follows enterprise patterns from SAP SuccessFactors (bi-annual release model), Workday (release readiness), and ServiceNow (feature flag lifecycle).

---

## Current State Analysis

### Fragmented Components (Complexity Issue)

| Current Component | Location | Function | Problem |
|-------------------|----------|----------|---------|
| `ReleaseManager.tsx` | Enablement Hub | Create releases, generate notes | Feature-release focus, not documentation |
| `ReleaseWorkflowDashboard.tsx` | Enablement Hub | Content pipeline by release | Complex 8-stage workflow |
| `ReleaseCalendarPage.tsx` | Standalone page | Simple timeline view | Disconnected from lifecycle |
| `ContentLifecyclePage.tsx` | Standalone page | Review/expiry tracking | KB-focused, not manual-focused |
| Manual Version History | 8+ component files | Individual manual versions | No central control |
| `ManualPublishService.ts` | Publishing | Version increment logic | No freeze awareness |

### Industry Gap

Enterprise documentation systems (Workday, SAP) use a **single release lifecycle model** where:
1. All documentation is tied to a **product release** (e.g., "2025.1 Spring Release")
2. Version freeze is automatic during preview periods
3. AI assists with release readiness scoring and notes generation

---

## Solution Architecture

### New Unified Hub: Release Command Center

Replace scattered release management with a single destination:

```
/enablement/release-center
│
├── Overview Tab (Dashboard)
│   ├── Current Release Status Card
│   ├── Version Lifecycle State (Pre-Release / GA / Maintenance)
│   ├── Content Readiness Score (AI-generated)
│   └── Quick Actions
│
├── Releases Tab (Simplified)
│   ├── Active Release
│   ├── Upcoming Releases
│   └── Release Archive
│
├── Milestones Tab
│   ├── Release Milestones Timeline
│   ├── Milestone Checklist
│   └── AI Readiness Assessment
│
├── Release Notes Tab
│   ├── Aggregated Changelog
│   ├── Export Options
│   └── AI Generation
│
└── Settings Tab
    ├── Version Freeze Toggle
    ├── GA Release Date
    └── Notification Preferences
```

---

## AI Release Manager Agent

### Purpose
An intelligent agent that helps manage the release lifecycle by:
1. Assessing content readiness across all manuals
2. Identifying gaps in documentation coverage
3. Generating aggregated release notes
4. Recommending version increments
5. Alerting on stale or incomplete content

### Edge Function: `release-manager-agent`

```typescript
interface ReleaseManagerRequest {
  action: 
    | 'assess_readiness'      // Score all manuals for release readiness
    | 'generate_changelog'    // Aggregate all changes for release notes
    | 'recommend_version'     // Suggest version increment type
    | 'identify_gaps'         // Find incomplete or stale documentation
    | 'plan_milestones'       // Suggest milestone dates
    | 'summarize_status';     // Executive summary of release state
  
  releaseId?: string;
  context?: {
    manuals?: string[];
    targetDate?: string;
    currentVersion?: string;
  };
}

interface ReadinessResult {
  overallScore: number;  // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  manuals: Array<{
    manualId: string;
    name: string;
    readinessScore: number;
    issues: string[];
    recommendations: string[];
  }>;
  blockers: string[];
  warnings: string[];
  readyForRelease: boolean;
}
```

### Agent Capabilities

| Action | Description | AI Output |
|--------|-------------|-----------|
| **assess_readiness** | Analyzes all manual content completeness | Readiness score, blockers, recommendations |
| **generate_changelog** | Aggregates version history across manuals | Markdown changelog for release notes |
| **recommend_version** | Based on changes scope, recommends increment | "Patch (1.0.1)" or "Minor (1.1.0)" with reasoning |
| **identify_gaps** | Scans for incomplete sections, missing screenshots | Gap report with prioritized fix list |
| **plan_milestones** | Given target GA date, suggests milestone schedule | Alpha, Beta, RC1, RC2, GA dates |
| **summarize_status** | Executive summary for stakeholders | Plain-English release status |

---

## Database Schema

### New Table: `enablement_release_lifecycle`

```sql
CREATE TABLE public.enablement_release_lifecycle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Release Status
  release_status text NOT NULL DEFAULT 'pre-release' 
    CHECK (release_status IN ('pre-release', 'preview', 'ga-released', 'maintenance')),
  current_release_id uuid REFERENCES public.enablement_releases(id),
  
  -- Version Control
  version_freeze_enabled boolean NOT NULL DEFAULT true,
  base_version text NOT NULL DEFAULT '1.0.0',
  
  -- Milestones
  target_ga_date date,
  milestones jsonb DEFAULT '[]'::jsonb,
  
  -- AI Assessments (cached)
  last_readiness_score integer,
  last_readiness_assessment jsonb,
  last_assessment_at timestamptz,
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  
  UNIQUE(company_id)
);

-- Milestone Structure (JSONB)
-- [
--   { "id": "...", "name": "Alpha", "targetDate": "2026-02-01", "completed": true },
--   { "id": "...", "name": "Beta", "targetDate": "2026-02-15", "completed": false },
--   { "id": "...", "name": "GA", "targetDate": "2026-03-01", "completed": false }
-- ]
```

### Update Table: `enablement_releases`

Add fields for enhanced tracking:

```sql
ALTER TABLE public.enablement_releases ADD COLUMN IF NOT EXISTS
  release_type text DEFAULT 'product' 
    CHECK (release_type IN ('product', 'documentation', 'hotfix'));

ALTER TABLE public.enablement_releases ADD COLUMN IF NOT EXISTS
  is_active boolean DEFAULT false;

ALTER TABLE public.enablement_releases ADD COLUMN IF NOT EXISTS
  readiness_score integer;

ALTER TABLE public.enablement_releases ADD COLUMN IF NOT EXISTS
  ai_changelog text;
```

---

## UI Components

### 1. Release Command Center Page

**File:** `src/pages/enablement/ReleaseCommandCenterPage.tsx`

Single-page hub replacing scattered release management:

- **Header**: Current release name, status badge, days to GA
- **Tabs**: Overview | Releases | Milestones | Release Notes | Settings
- **AI Assistant Button**: Opens AI Release Manager chat panel

### 2. Release Status Banner

**File:** `src/components/enablement/ReleaseStatusBanner.tsx`

Compact banner showing release status at top of Enablement pages:

```tsx
<ReleaseStatusBanner>
  <Badge variant="outline" className="bg-amber-50 text-amber-600">
    Pre-Release v1.0
  </Badge>
  <span>Target GA: March 1, 2026</span>
  <span>Readiness: 85%</span>
</ReleaseStatusBanner>
```

### 3. AI Readiness Assessment Card

**File:** `src/components/enablement/AIReadinessCard.tsx`

Shows AI-generated readiness score with drill-down:

- Overall score (A-F grade)
- Per-manual scores
- Blockers and recommendations
- "Assess Now" button to trigger fresh analysis

### 4. Milestone Timeline

**File:** `src/components/enablement/MilestoneTimeline.tsx`

Visual timeline of release milestones with:
- Progress indicators
- Automated checklist items
- AI-suggested dates

### 5. Aggregated Release Notes

**File:** `src/components/enablement/AggregatedReleaseNotes.tsx`

Combines version history from all manuals into unified release notes:
- Grouped by module
- Export to Markdown/PDF/Word
- AI generation for prose summary

---

## Simplified Workflow

### Before (Complex)

```
User clicks "Publish to Help Center"
  → Selects version type (initial/major/minor/patch)
  → No awareness of release lifecycle
  → Version increments independently
```

### After (Unified)

```
1. Admin sets release lifecycle status (Pre-Release / Preview / GA)
2. Version freeze auto-enabled during Pre-Release
3. All manual updates contribute to current release
4. AI assesses readiness as content is published
5. At GA, all manuals transition to released state
6. Release notes auto-generated from aggregated changelogs
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/enablement/ReleaseCommandCenterPage.tsx` | Main hub page |
| `src/hooks/useReleaseLifecycle.ts` | State management hook |
| `src/components/enablement/ReleaseStatusBanner.tsx` | Status banner |
| `src/components/enablement/AIReadinessCard.tsx` | AI assessment display |
| `src/components/enablement/MilestoneTimeline.tsx` | Visual milestone tracker |
| `src/components/enablement/AggregatedReleaseNotes.tsx` | Changelog aggregator |
| `src/components/enablement/ReleaseManagerChat.tsx` | AI agent chat panel |
| `supabase/functions/release-manager-agent/index.ts` | AI agent edge function |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/enablement/EnablementHubPage.tsx` | Add Release Status Banner, update Release Management links |
| `src/components/kb/SmartVersionSelector.tsx` | Add version freeze awareness |
| `src/components/kb/PublishWizard.tsx` | Show release context, freeze status |
| `src/components/enablement/manuals/ManualCard.tsx` | Add release status badge |
| `src/routes/lazyPages.ts` | Add ReleaseCommandCenterPage |
| `src/App.tsx` | Add route for /enablement/release-center |
| `src/lib/iconRegistry.ts` | Add Milestone, RocketLaunch icons |

## Files to Deprecate/Remove

| File | Action |
|------|--------|
| `src/pages/enablement/ReleaseCalendarPage.tsx` | Migrate to Release Command Center |
| `src/components/enablement/ReleaseManager.tsx` | Migrate to Release Command Center |
| `src/components/enablement/ReleaseWorkflowDashboard.tsx` | Keep as secondary view, simplify |

---

## Navigation Updates

### Enablement Hub Accordion (Simplified)

**Before:**
```
Release Management
├── Release Versions → /enablement?tab=releases
└── Release Calendar → /enablement/release-calendar
```

**After:**
```
Release Management
└── Release Command Center → /enablement/release-center
    (Combines versions, calendar, lifecycle, notes)
```

### Quick Access Card on Hub Dashboard

```tsx
<Card className="border-2 border-primary/20">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Rocket className="h-5 w-5" />
      Release Command Center
      <Badge variant="outline" className="ml-auto">Pre-Release v1.0</Badge>
    </CardTitle>
    <CardDescription>
      Manage version lifecycle, milestones, and release notes
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex gap-2">
      <Button>Open Command Center</Button>
      <Button variant="outline">Ask AI</Button>
    </div>
  </CardContent>
</Card>
```

---

## AI Agent User Experience

### Chat-Style Interface

The AI Release Manager appears as a slide-out panel accessible from:
1. Release Command Center page
2. AI button in the Enablement Hub header
3. "Ask AI" quick actions throughout the module

### Example Interactions

**User:** "Is the documentation ready for release?"

**AI Agent:**
> **Release Readiness Assessment: 78% (B Grade)**
>
> ✅ **Ready Manuals (6/10)**
> - Admin & Security: 100%
> - Workforce: 95%
> - Appraisals: 92%
> - Goals: 88%
> - HR Hub: 85%
> - Succession: 82%
>
> ⚠️ **Needs Attention (4/10)**
> - 360 Feedback: 72% - Missing troubleshooting chapter
> - Career Development: 68% - 3 sections incomplete
> - Time & Attendance: 65% - Screenshots needed
> - Benefits: 60% - Content review overdue
>
> **Blockers:**
> 1. 360 Feedback troubleshooting chapter incomplete
> 2. Benefits manual has 2 expired content flags
>
> **Recommendation:** Address blockers before GA. Estimated effort: 8-12 hours.

---

## Implementation Phases

### Phase 1: Foundation (This Sprint)
1. Create `enablement_release_lifecycle` table
2. Create `useReleaseLifecycle.ts` hook
3. Build `ReleaseCommandCenterPage.tsx` with Overview and Settings tabs
4. Add Release Status Banner to Enablement Hub
5. Integrate with existing version reset (v1.0)

### Phase 2: AI Agent (Next Sprint)
1. Create `release-manager-agent` edge function
2. Build `AIReadinessCard.tsx` component
3. Implement `ReleaseManagerChat.tsx` panel
4. Add readiness assessment capability

### Phase 3: Milestones & Notes (Following Sprint)
1. Build `MilestoneTimeline.tsx` component
2. Create `AggregatedReleaseNotes.tsx` component
3. Add export functionality (Markdown, PDF, DOCX)
4. Implement AI changelog generation

### Phase 4: Cleanup (Final Sprint)
1. Deprecate old release management components
2. Update all navigation references
3. Migration guide for any database records

---

## Industry Alignment

| Feature | SAP SuccessFactors | Workday | HRplus (Proposed) |
|---------|-------------------|---------|-------------------|
| Release Cadence | Bi-annual | Continuous | Configurable |
| Version Freeze | Automatic during preview | Manual | Automatic with toggle |
| Readiness Score | Innovation Alerts | Tenant Preview | AI-assessed |
| Release Notes | WhatsNew Portal | Community | Aggregated + AI |
| Milestone Tracking | Release Calendar | Deployment Dashboard | Visual Timeline |

---

## Success Metrics

1. **Simplified Navigation**: 1 destination vs 4 scattered components
2. **AI Assistance**: Automated readiness scoring reduces manual review time by 50%
3. **Version Control**: Zero accidental version increments during freeze
4. **Release Visibility**: All stakeholders see consistent status across all manuals
5. **Documentation Quality**: AI identifies gaps before release

---

## Technical Notes

- All components use existing design system (shadcn/ui)
- State persisted via `useTabState` pattern
- AI agent uses Lovable AI (Gemini Flash) via existing gateway
- Release lifecycle data cached in database for performance
- Export uses existing `jspdf` and `docx` libraries
