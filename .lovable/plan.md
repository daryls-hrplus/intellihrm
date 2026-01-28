

# Consolidated Implementation Plan: Unified Enablement Documentation System

## Executive Summary

Three separate plans have been proposed to fix the Content Creation Studio. This consolidated plan ensures **zero gaps** by unifying them into a coherent implementation with clear data flow across all phases.

---

## Current State Analysis

### What Exists Today

| System | State | Problem |
|--------|-------|---------|
| **Static Manuals** | 95+ sections per manual in TypeScript (`APPRAISALS_MANUAL_STRUCTURE`) | Rich content, but invisible to database/agent |
| **Database Sections** | 35 generic placeholders in `manual_sections` | Empty `source_feature_codes[]`, no content, wrong titles |
| **Gap Analysis** | Checks `enablement_content_status` + artifacts | Never finds manual sections → false gaps |
| **Publishing** | Publishes from `manual_sections.content` | Content column is `{}` → nothing to publish |
| **Review Workflow** | Exists for Tours (`review_status` column) | Missing for manual sections entirely |

### Data Flow Gap

```text
STATIC TS CONTENT                    DATABASE SYSTEM
┌────────────────────┐              ┌────────────────────┐
│ APPRAISALS_MANUAL_ │              │ manual_sections    │
│ STRUCTURE          │      ╳       │ (35 placeholders)  │
│ - sec-2-5: Forms   │   NO SYNC    │ - 2.2: Setup?      │
│ - sec-2-6: Cycles  │              │ - source_codes=[]  │
│ - 95+ rich sections│              │ - content={}       │
└────────────────────┘              └────────────────────┘
         ↓                                   ↓
    Renders in UI                     Agent queries this
    (What user sees)                  (Reports false gaps)
```

---

## Consolidated Solution: 4 Integrated Components

### Component 1: Feature Coverage Bridge Table

**Purpose**: Link static manual sections to feature codes so gap analysis recognizes existing documentation.

**New Table**: `manual_feature_coverage`

```sql
CREATE TABLE manual_feature_coverage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manual_code TEXT NOT NULL,
  section_id TEXT NOT NULL,           -- e.g., 'sec-2-5' from static structure
  section_title TEXT,                 -- For display/audit
  feature_codes TEXT[] NOT NULL DEFAULT '{}',
  coverage_type TEXT DEFAULT 'documented',  -- documented, mentioned, related
  synced_from_static BOOLEAN DEFAULT true,
  verified_by_human BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manual_code, section_id)
);

CREATE INDEX idx_mfc_feature_codes ON manual_feature_coverage USING GIN (feature_codes);
```

**Seed Data** (Appraisals example):
```sql
INSERT INTO manual_feature_coverage (manual_code, section_id, section_title, feature_codes) VALUES
  ('appraisals', 'sec-2-2', 'Rating Scales Configuration', ARRAY['perf_rating_scales']),
  ('appraisals', 'sec-2-4', 'Competency Framework Configuration', ARRAY['perf_competency_framework', 'admin_competencies']),
  ('appraisals', 'sec-2-5', 'Appraisal Form Templates', ARRAY['appraisal_forms', 'perf_appraisal_forms']),
  ('appraisals', 'sec-2-6', 'Appraisal Cycles', ARRAY['appraisal_cycles', 'perf_appraisal_cycles']),
  ('appraisals', 'sec-3-calibration', 'Calibration Sessions', ARRAY['calibration', 'perf_calibration']);
```

---

### Component 2: Content Review Lifecycle Columns

**Purpose**: Add human review phase before content reaches end users.

**Schema Changes to `manual_sections`**:

```sql
ALTER TABLE manual_sections
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'draft'
  CHECK (review_status IN ('draft', 'pending_review', 'in_review', 'approved', 'rejected', 'published')),
ADD COLUMN IF NOT EXISTS draft_content JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS submitted_for_review_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS static_section_id TEXT;  -- Links to APPRAISALS_MANUAL_STRUCTURE.id
```

**Audit Trail Table**:

```sql
CREATE TABLE manual_section_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  previous_content JSONB,
  proposed_content JSONB NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'edited', 'published')),
  action_by UUID REFERENCES auth.users(id),
  action_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  version_number INTEGER DEFAULT 1
);
```

---

### Component 3: Content Creation Agent Updates

**Purpose**: Fix gap analysis to recognize all documentation sources.

**File**: `supabase/functions/content-creation-agent/index.ts`

**Changes**:

1. **In `analyze_context` action** (~line 380):
```typescript
// NEW: Fetch manual feature coverage mappings
const { data: manualCoverage } = await supabase
  .from("manual_feature_coverage")
  .select("feature_codes");

// Build set of features covered by static manuals
const featuresWithManualCoverage = new Set<string>();
for (const row of manualCoverage || []) {
  (row.feature_codes || []).forEach(code => 
    featuresWithManualCoverage.add(code)
  );
}

// UPDATE isDocumented check (line 381-386)
const isDocumented = status?.documentation_status === 'complete' ||
  status?.documentation_status === 'in_progress' ||
  status?.workflow_status === 'published' ||
  status?.workflow_status === 'documentation' ||
  hasArtifacts ||
  hasManualContent ||
  featuresWithManualCoverage.has(feature.feature_code);  // NEW
```

2. **In `identify_gaps` action** (~line 913):
```typescript
// Same pattern - add manual coverage check
const isDocumented = status?.documentation_status === 'complete' ||
  status?.workflow_status === 'published' ||
  types.size > 0 ||
  featuresWithManualCoverage.has(feature.feature_code);  // NEW
```

3. **Manual-scoped analysis** (already partially implemented):
```typescript
// If manualId is provided, use manual's module_codes for filtering
if (context.manualId) {
  const { data: manual } = await supabase
    .from("manual_definitions")
    .select("module_codes, manual_code")
    .eq("id", context.manualId)
    .single();
    
  // Filter features AND get coverage for this specific manual
  const { data: manualSpecificCoverage } = await supabase
    .from("manual_feature_coverage")
    .select("feature_codes")
    .eq("manual_code", manual.manual_code);
}
```

---

### Component 4: Content Review Center (New Page)

**Purpose**: Intermediate review phase between CREATE and RELEASE.

**New Files**:

| File | Purpose |
|------|---------|
| `src/pages/enablement/ContentReviewCenterPage.tsx` | Main review hub with pending queue |
| `src/components/enablement/ContentReviewPanel.tsx` | Side-by-side diff editor sheet |
| `src/components/enablement/PendingReviewQueue.tsx` | List of sections awaiting review |
| `src/hooks/useContentReview.ts` | Approve/reject/edit operations |

**Integration Points**:

1. **EnablementHubPage.tsx** - Add Phase 1.5:
```typescript
{
  titleKey: "1.5. Review & Edit",
  items: [{
    title: "Content Review Center",
    description: "Review AI-generated content before publishing",
    href: "/enablement/review",
    icon: ClipboardCheck,
    badge: pendingCount > 0 ? `${pendingCount} pending` : undefined,
  }],
},
```

2. **ManualPublishService.ts** - Guard publishing:
```typescript
static async getPublishableSections(manualId: string): Promise<ManualSection[]> {
  const { data } = await supabase
    .from('manual_sections')
    .select('*')
    .eq('manual_id', manualId)
    .in('review_status', ['approved', 'published'])  // NEW FILTER
    .order('display_order');
  return data || [];
}
```

3. **useManualSectionPreview.ts** - Save as draft:
```typescript
const applyChanges = async (saveAsDraft = true) => {
  if (saveAsDraft) {
    await supabase.from('manual_sections').update({
      draft_content: { markdown: proposedContent },
      review_status: 'pending_review',
      submitted_for_review_at: new Date().toISOString(),
    }).eq('id', sectionId);
  } else {
    // Direct apply (for already-approved content)
  }
};
```

---

## Complete Data Flow After Implementation

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│  1. CREATE                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Content Creation Studio                                                    │ │
│  │  • Agent queries manual_feature_coverage → correct coverage %              │ │
│  │  • Generates content → saves to draft_content, review_status='pending'    │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                      ↓                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│  1.5. REVIEW & EDIT (NEW)                                                       │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Content Review Center                                                      │ │
│  │  • Shows all pending_review sections                                        │ │
│  │  • Side-by-side current vs proposed                                         │ │
│  │  • Approve → review_status='approved', content=draft_content                │ │
│  │  • Reject → review_status='rejected', back to creator                       │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                      ↓                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│  2. MANAGE & RELEASE                                                            │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Release Command Center                                                     │ │
│  │  • Publishing tab shows only approved sections                              │ │
│  │  • Coverage % reflects manual_feature_coverage + enablement_content_status  │ │
│  │  • Publish → KB articles created, review_status='published'                 │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                      ↓                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│  3. REFERENCE LIBRARY                                                           │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Help Center (End Users)                                                    │ │
│  │  • Only sees published content from approved sections                       │ │
│  │  • KB articles with source_manual_id for traceability                       │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Gap Verification Checklist

| Requirement | Addressed By | Integration Point |
|-------------|--------------|-------------------|
| Static manuals recognized as documentation | Component 1: manual_feature_coverage | Agent gap analysis queries this table |
| False gaps eliminated | Component 3: Agent updates | isDocumented now checks manual coverage |
| Manual-scoped coverage analysis | Component 3: manualId context | Already in hooks, agent extended |
| Human review before publish | Component 2: review_status column | ManualPublishService filters by approved |
| Audit trail for reviews | Component 2: manual_section_reviews | Tracks all approve/reject actions |
| Content Review UI | Component 4: ContentReviewCenterPage | New page with pending queue |
| Enablement Hub integration | Component 4: Hub updates | Phase 1.5 added to navigation |
| Sync between systems | Component 1 + 2: static_section_id | Links DB rows to static structure IDs |
| Coverage % accuracy everywhere | All components | Same source (manual_feature_coverage) |

---

## Implementation Sequence

| Step | Component | Dependencies | Effort |
|------|-----------|--------------|--------|
| 1 | Create `manual_feature_coverage` table | None | Migration |
| 2 | Seed mappings for all 10 manuals | Step 1 | Data entry |
| 3 | Update content-creation-agent gap logic | Step 1 | Edge function |
| 4 | Add review columns to manual_sections | None | Migration |
| 5 | Create manual_section_reviews table | Step 4 | Migration |
| 6 | Create ContentReviewCenterPage + components | Steps 4, 5 | UI |
| 7 | Update useManualSectionPreview (save as draft) | Step 4 | Hook |
| 8 | Update ManualPublishService (approved filter) | Step 4 | Service |
| 9 | Update EnablementHubPage (Phase 1.5) | Step 6 | UI |
| 10 | Deploy edge function | Step 3 | Deploy |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/xxx_add_manual_feature_coverage.sql` | Create | Coverage bridge table + seed data |
| `supabase/migrations/xxx_add_section_review_columns.sql` | Create | Review lifecycle columns + audit table |
| `supabase/functions/content-creation-agent/index.ts` | Modify | Query manual_feature_coverage in gap logic |
| `src/pages/enablement/ContentReviewCenterPage.tsx` | Create | Review hub page |
| `src/components/enablement/ContentReviewPanel.tsx` | Create | Side-by-side editor |
| `src/components/enablement/PendingReviewQueue.tsx` | Create | Pending items list |
| `src/hooks/useContentReview.ts` | Create | Approve/reject operations |
| `src/hooks/useManualSectionPreview.ts` | Modify | Add saveAsDraft option |
| `src/services/kb/ManualPublishService.ts` | Modify | Filter for approved sections |
| `src/pages/enablement/EnablementHubPage.tsx` | Modify | Add Phase 1.5 navigation |
| `src/App.tsx` | Modify | Add /enablement/review route |

---

## Expected Outcomes

| Metric | Before | After |
|--------|--------|-------|
| Appraisals Forms gap status | "4 gaps - undocumented" | "Documented via sec-2-5" |
| Appraisals coverage | ~6% (false) | ~85% (accurate) |
| Content reaching users without review | Possible | Impossible (requires approval) |
| Gap analysis consistency | Different per page | Same everywhere |
| Audit trail for content | None | Complete history |

This consolidated plan ensures all three requirements work together with no gaps in the workflow.

