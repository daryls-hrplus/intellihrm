
# Fix Code Registry Source and Enable Accurate Orphan Categorization

## Problem Summary

The orphan detection system **already has the intelligence** to categorize orphans into:
1. **Duplicates** (merge)
2. **Legacy/Auto-migrated** (archive)
3. **Legitimate granular features** (keep)

However, it's producing **incorrect results** because it compares database entries against a **static hardcoded array of 62 routes** instead of the actual `FEATURE_REGISTRY` with **261 features**.

---

## Current vs Expected State

| Metric | Current (Wrong) | After Fix |
|--------|-----------------|-----------|
| Code baseline | 62 static routes | 261 registry features |
| True orphans | Shown as 817 | ~576 (837 DB - 261 registry) |
| Synced features | Shown as 20 | ~250+ |
| False positives | ~200 features incorrectly flagged | 0 |

---

## Implementation Plan

### Phase 1: Fix the Source of Truth

**File**: `src/hooks/useCodeRegistryScanner.ts`

Replace the static `CODE_ROUTES` array (lines 13-118) with dynamic extraction from `FEATURE_REGISTRY`:

```typescript
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";

// Build code routes dynamically from FEATURE_REGISTRY
const codeRoutes = useMemo((): CodeRegistryEntry[] => {
  const entries: CodeRegistryEntry[] = [];
  
  FEATURE_REGISTRY.forEach(module => {
    // Add all features from all groups
    module.groups.forEach(group => {
      group.features.forEach(feature => {
        entries.push({
          pageName: feature.name,
          routePath: feature.routePath,
          moduleCode: module.code,
          featureCode: feature.code,  // Direct mapping
          hasProtection: true,
          requiredRoles: feature.roleRequirements || [],
          protectedModuleCode: module.code,
          sourceFile: "featureRegistry.ts"
        });
      });
    });
  });
  
  return entries;
}, []);
```

**Impact**: The `useOrphanDetection` hook already uses `codeRoutes` from this scanner, so fixing the source immediately fixes all downstream calculations.

---

### Phase 2: Enhance Duplicate Detection for Prefixed Variants

The current duplicate detection only matches exact `feature_name`. We need to also detect **prefixed variants** like:

| Pattern | Examples |
|---------|----------|
| `admin_{base}` | `admin_announcements` = `announcements` |
| `ess_{base}` | `ess_leave` = `leave` |
| `mss_{base}` | `mss_approvals` = `approvals` |
| `{module}_{base}` | `payroll_audit_trail` = `audit_trail` |

**File**: `src/hooks/useOrphanDetection.ts`

Add prefix-aware duplicate detection:

```typescript
// New: Detect prefixed duplicates
const KNOWN_PREFIXES = ['admin_', 'ess_', 'mss_', 'emp_', 'payroll_', 'perf_', 
                         'recruit_', 'succ_', 'ben_', 'comp_', 'lms_', 'hse_',
                         'wf_', 'hub_', 'enbl_', 'onb_', 'er_', 'rpt_', 'prop_'];

const getBaseCode = (code: string): string => {
  for (const prefix of KNOWN_PREFIXES) {
    if (code.startsWith(prefix)) {
      return code.slice(prefix.length);
    }
  }
  return code;
};

// In duplicate detection logic:
const baseCode = getBaseCode(f.feature_code);
const prefixedVariants = orphanFeatures
  .filter(other => {
    const otherBase = getBaseCode(other.feature_code);
    return otherBase === baseCode && other.feature_code !== f.feature_code;
  })
  .map(v => v.feature_code);
```

---

### Phase 3: Add Migration Batch Detection

Identify entries created in the same second as likely auto-migrations:

```typescript
// Detect batch-created entries (same timestamp = migration)
const batchTimestamps = new Map<string, string[]>();
orphanFeatures.forEach(f => {
  const timestamp = new Date(f.created_at).toISOString().slice(0, 19);
  if (!batchTimestamps.has(timestamp)) {
    batchTimestamps.set(timestamp, []);
  }
  batchTimestamps.get(timestamp)!.push(f.feature_code);
});

// Mark entries from large batches (>10) as auto_migration
const autoMigratedCodes = new Set<string>();
batchTimestamps.forEach((codes, timestamp) => {
  if (codes.length > 10) {
    codes.forEach(code => autoMigratedCodes.add(code));
  }
});
```

---

### Phase 4: Add UI Enhancements to OrphanManagementPanel

**File**: `src/components/enablement/route-registry/OrphanManagementPanel.tsx`

Add new views:

1. **Prefixed Variants Tab**: Shows all `admin_X` / `ess_X` patterns with their base equivalents
2. **Batch Import Tab**: Groups orphans by creation timestamp to identify migration batches
3. **Registry Candidates Tab**: Shows orphans with valid routes that could be added to `FEATURE_REGISTRY`

```typescript
// Add tab for registry candidates
<TabsTrigger value="registry-candidates">
  <Plus className="h-4 w-4 mr-2" />
  Registry Candidates
  <Badge variant="secondary" className="ml-2">
    {orphans.filter(o => o.recommendation === 'keep_as_planned').length}
  </Badge>
</TabsTrigger>
```

---

### Phase 5: Add Bulk Actions for Each Category

Add one-click bulk actions:

| Category | Action | Implementation |
|----------|--------|----------------|
| Prefixed Duplicates | "Delete all variants, keep base" | Bulk delete where `feature_code` starts with prefix |
| Auto-Migration Batch | "Archive entire batch" | Archive by `created_at` timestamp |
| Registry Candidates | "Add to FEATURE_REGISTRY" | Generate registry entries for selected |

---

## Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useCodeRegistryScanner.ts` | **REWRITE** | Replace static array with `FEATURE_REGISTRY` extraction |
| `src/hooks/useOrphanDetection.ts` | **MODIFY** | Add prefix-aware duplicate detection + batch detection |
| `src/components/enablement/route-registry/OrphanManagementPanel.tsx` | **MODIFY** | Add new tabs for categories |
| `src/components/enablement/route-registry/PrefixedVariantsPanel.tsx` | **CREATE** | UI for prefixed variant analysis |
| `src/components/enablement/route-registry/RegistryCandidatesPanel.tsx` | **CREATE** | UI for suggesting registry additions |

---

## Expected Outcomes After Implementation

### Accurate Counts

| Metric | Value |
|--------|-------|
| Registry Features | 261 |
| Database Features | 837 |
| True Orphans | ~576 |
| Prefixed Duplicates | ~100-150 (estimate) |
| Legacy/Migration | ~200-300 (estimate) |
| Registry Candidates | ~100-200 (estimate) |

### Categorization Breakdown (Estimated)

| Category | Count | Recommended Action |
|----------|-------|-------------------|
| **True Duplicates** (exact name match) | ~50 | Merge: keep one, delete others |
| **Prefixed Variants** (admin_X = X) | ~100 | Review: delete variant OR keep if different context |
| **Auto-Migration Batch** | ~200 | Archive: bulk archive old batches |
| **Legacy/Stale** | ~100 | Delete: entries >6 months with no description |
| **Registry Candidates** | ~126 | Add to Registry: have route + description |

---

## Technical Details

### Why This Works

1. **Existing Logic is Sound**: The `useOrphanDetection` hook already has:
   - Levenshtein similarity matching
   - Source classification (`auto_migration`, `manual_entry`)
   - Age-based staleness detection
   - Route presence validation
   - Recommendation engine

2. **Only the Baseline is Wrong**: By fixing `useCodeRegistryScanner` to read from `FEATURE_REGISTRY`, all downstream calculations become accurate.

3. **No Database Changes Required**: All detection is done client-side against existing data.

---

## Validation

After implementation, the Route Registry should show:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CODE REGISTRY (FIXED)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Registry Features: 261                                                     │
│  Database Features: 837                                                     │
│  Synced: 250+                                                               │
│  True Orphans: ~576                                                         │
│                                                                             │
│  ORPHAN BREAKDOWN:                                                          │
│  ├── Duplicates (merge): 50                                                 │
│  ├── Prefixed Variants (review): 100                                        │
│  ├── Auto-Migration (archive): 200                                          │
│  ├── Legacy/Stale (delete): 100                                             │
│  └── Registry Candidates (keep): 126                                        │
│                                                                             │
│  [Run Analysis] [Export Report] [Bulk Cleanup]                              │
└─────────────────────────────────────────────────────────────────────────────┘
```
