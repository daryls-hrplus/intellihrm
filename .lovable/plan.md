
# Succession Module: Field Name Cascade Audit & Readiness Trend Chart Implementation

## Executive Summary

This plan addresses two critical issues:
1. **Field name inconsistencies**: Database columns were renamed to industry standards, but 7 code files still use old column names
2. **Missing UI feature**: Section 10.7 documents Readiness Trend Analysis but no UI component exists for historical trend visualization

---

## Part 1: Field Name Cascade Audit Results

### Database Schema (Confirmed Updated)

| Table | New Standard Names | Status |
|-------|-------------------|--------|
| `talent_signal_definitions` | `signal_code`, `signal_name`, `category`, `calculation_method` | Migrated |
| `talent_signal_snapshots` | `raw_value`, `captured_at`, `expires_at`, `effective_from`, `source_record_type` | Migrated |
| `nine_box_signal_mappings` | `min_confidence`, `bias_multiplier` | Migrated |

### Code Files Using OLD Field Names (Broken Queries)

| File | Old Names Used | New Names Required |
|------|---------------|-------------------|
| `src/components/succession/NineBoxEvidencePanel.tsx` (line 78) | `code, name, signal_category` | `signal_code, signal_name, category` |
| `src/components/succession/SuccessorProfileLeadershipSignals.tsx` (line 46-47) | `name, signal_category` | `signal_name, category` |
| `src/hooks/succession/useNineBoxRatingSources.ts` (line 168) | `code, name, signal_category` | `signal_code, signal_name, category` |
| `src/hooks/useTalentProfileEvidence.ts` (line 67) | `name, signal_category` | `signal_name, category` |
| `src/hooks/useTalentPoolReviewPackets.ts` (line 93) | `name, signal_category` | `signal_name, category` |
| `src/components/succession/CalibrationEvidenceComparison.tsx` (line 88) | `signal_category` | `category` |

### Code Files Already Updated (No Action Needed)

| File | Status |
|------|--------|
| `src/hooks/feedback/useTalentSignals.ts` | Uses `signal_code, signal_name, category` |
| `src/hooks/feedback/useModuleEvidence.ts` | Uses `signal_code, signal_name, category` |
| `src/hooks/succession/useNineBoxSignalMappings.ts` | Uses `signal_code, signal_name, category` |
| `src/types/talentSignals.ts` | Type definitions updated |
| `src/components/feedback/signals/SignalTrendChart.tsx` | Uses `signal_name, signal_code` |

---

## Part 2: Implementation Plan - Field Name Cascade Fixes

### 2.1 NineBoxEvidencePanel.tsx

**Location**: `src/components/succession/NineBoxEvidencePanel.tsx`

**Change** (line 78):
```typescript
// FROM:
signal_definition:talent_signal_definitions(code, name, signal_category)

// TO:
signal_definition:talent_signal_definitions(signal_code, signal_name, category)
```

**Additional changes** (where old field names are accessed):
- Update any references to `signal_definition?.code` → `signal_definition?.signal_code`
- Update any references to `signal_definition?.name` → `signal_definition?.signal_name`
- Update any references to `signal_definition?.signal_category` → `signal_definition?.category`

---

### 2.2 SuccessorProfileLeadershipSignals.tsx

**Location**: `src/components/succession/SuccessorProfileLeadershipSignals.tsx`

**Change** (lines 45-48):
```typescript
// FROM:
talent_signal_definitions(
  name,
  signal_category
)

// TO:
talent_signal_definitions(
  signal_name,
  category
)
```

**Change** (lines 55, 58):
```typescript
// FROM:
.filter(s => (s.talent_signal_definitions as any)?.signal_category === 'leadership')
name: (s.talent_signal_definitions as any)?.name || 'Unknown',

// TO:
.filter(s => (s.talent_signal_definitions as any)?.category === 'leadership')
name: (s.talent_signal_definitions as any)?.signal_name || 'Unknown',
```

---

### 2.3 useNineBoxRatingSources.ts

**Location**: `src/hooks/succession/useNineBoxRatingSources.ts`

**Change** (line 168):
```typescript
// FROM:
signal_definition:talent_signal_definitions(code, name, signal_category)

// TO:
signal_definition:talent_signal_definitions(signal_code, signal_name, category)
```

**Change** (lines 219-220 where accessed):
- Update references to access new field names in the rating calculation logic

---

### 2.4 useTalentProfileEvidence.ts

**Location**: `src/hooks/useTalentProfileEvidence.ts`

**Change** (line 67):
```typescript
// FROM:
talent_signal_definitions(name, signal_category)

// TO:
talent_signal_definitions(signal_name, category)
```

**Change** (line 96):
```typescript
// FROM:
const name = (signal.talent_signal_definitions as any)?.name || 'Unknown';

// TO:
const name = (signal.talent_signal_definitions as any)?.signal_name || 'Unknown';
```

---

### 2.5 useTalentPoolReviewPackets.ts

**Location**: `src/hooks/useTalentPoolReviewPackets.ts`

**Change** (line 93):
```typescript
// FROM:
talent_signal_definitions(name, signal_category)

// TO:
talent_signal_definitions(signal_name, category)
```

**Change** (lines 99-100):
```typescript
// FROM:
(s.talent_signal_definitions as any)?.signal_category === 'leadership'

// TO:
(s.talent_signal_definitions as any)?.category === 'leadership'
```

---

### 2.6 CalibrationEvidenceComparison.tsx

**Location**: `src/components/succession/CalibrationEvidenceComparison.tsx`

**Change** (line 88):
```typescript
// FROM:
talent_signal_definitions(signal_category)

// TO:
talent_signal_definitions(category)
```

**Change** (line 102):
```typescript
// FROM:
(s.talent_signal_definitions as any)?.signal_category === 'leadership'

// TO:
(s.talent_signal_definitions as any)?.category === 'leadership'
```

---

## Part 3: Readiness Trend Chart Implementation

### Current Gap

The existing `SignalTrendChart.tsx` component visualizes **talent signal** history over time, but there is no equivalent for **readiness score** history. Section 10.7 of the Succession Manual documents readiness trends, but the UI lacks this visualization.

### Data Source

Historical readiness data is available from:

```text
readiness_assessment_events table:
- id, candidate_id, overall_score, readiness_band, completed_at

succession_candidates table:
- latest_readiness_score, latest_readiness_band, readiness_assessed_at
```

The `readiness_assessment_events` table stores each assessment event, providing the historical data needed for trend visualization.

### Implementation Approach

#### 3.1 Create New Hook: `useReadinessTrendHistory`

**Location**: `src/hooks/succession/useReadinessTrendHistory.ts`

**Purpose**: Fetch historical readiness assessments for a candidate

```typescript
// New hook structure
export function useReadinessTrendHistory(candidateId?: string) {
  return useQuery({
    queryKey: ["readiness-trend-history", candidateId],
    queryFn: async () => {
      // Query readiness_assessment_events ordered by completed_at
      // Return array of { date, score, band, assessor } objects
    },
    enabled: !!candidateId,
  });
}
```

#### 3.2 Create New Component: `ReadinessTrendChart.tsx`

**Location**: `src/components/succession/ReadinessTrendChart.tsx`

**Features**:
- Line chart showing readiness score progression over time
- Reference line showing target readiness threshold
- Band indicators (Ready Now, Ready 1-2 Years, etc.) as colored zones
- Tooltips showing assessment date, score, band, and assessor
- Filter by candidate or view aggregate trends
- Mobile responsive using Recharts

**Visual Design** (following existing patterns from `SignalTrendChart.tsx` and `HeadcountTrend.tsx`):
- Uses Recharts `LineChart` with `ResponsiveContainer`
- HSL CSS variable colors for theme consistency
- Reference lines for score thresholds
- Custom tooltip with readiness band context

#### 3.3 Integrate into SuccessionAnalytics.tsx

**Location**: `src/components/succession/SuccessionAnalytics.tsx`

Add a new "Readiness Trends" section to the existing analytics component, either as:
- A new tab alongside Overview, Mentorship, Flight Risk, Career Development, Bench Strength
- Or embedded within an appropriate existing tab

---

## Part 4: Documentation Update

### 4.1 Update Section 10.7 ReadinessTrendAnalysis.tsx

Add a note that the UI now includes the `ReadinessTrendChart` component:

```text
UI Component Reference: ReadinessTrendChart.tsx
Navigation: Succession → Analytics → Readiness Trends tab
Features: Historical score progression, band thresholds, development correlation
```

---

## Part 5: Files to Modify

### Field Name Cascade Fixes (6 files)

| File | Change Type | Priority |
|------|-------------|----------|
| `src/components/succession/NineBoxEvidencePanel.tsx` | Query + field access | Critical |
| `src/components/succession/SuccessorProfileLeadershipSignals.tsx` | Query + field access | Critical |
| `src/hooks/succession/useNineBoxRatingSources.ts` | Query + field access | Critical |
| `src/hooks/useTalentProfileEvidence.ts` | Query + field access | Critical |
| `src/hooks/useTalentPoolReviewPackets.ts` | Query + field access | Critical |
| `src/components/succession/CalibrationEvidenceComparison.tsx` | Query + field access | Critical |

### Readiness Trend Chart (3 new files, 2 modified)

| File | Change Type | Priority |
|------|-------------|----------|
| `src/hooks/succession/useReadinessTrendHistory.ts` | New file | High |
| `src/components/succession/ReadinessTrendChart.tsx` | New file | High |
| `src/components/succession/SuccessionAnalytics.tsx` | Add Readiness Trends tab | High |
| `src/components/enablement/manual/succession/sections/analytics/ReadinessTrendAnalysis.tsx` | Add UI component reference | Medium |
| `src/components/succession/index.ts` | Export new component (if exists) | Low |

---

## Part 6: Estimated Effort

| Task | Files | Lines Changed | Time |
|------|-------|---------------|------|
| Field name cascade fixes | 6 | ~60 | 30 min |
| useReadinessTrendHistory hook | 1 new | ~50 | 20 min |
| ReadinessTrendChart component | 1 new | ~180 | 45 min |
| SuccessionAnalytics integration | 1 | ~80 | 20 min |
| Documentation update | 1 | ~20 | 10 min |
| **Total** | **10** | **~390** | **~2 hours** |

---

## Part 7: Testing Checklist

### Field Name Fixes
- [ ] NineBoxEvidencePanel renders without console errors
- [ ] SuccessorProfileLeadershipSignals displays leadership signals correctly
- [ ] Talent Pool review packets generate with correct signal names
- [ ] Nine-Box rating calculation uses correct category filters

### Readiness Trend Chart
- [ ] Chart renders with historical data when assessments exist
- [ ] Empty state shown when no historical data
- [ ] Tooltips display correct date, score, and band
- [ ] Chart is responsive on mobile
- [ ] Integration with SuccessionAnalytics works correctly
