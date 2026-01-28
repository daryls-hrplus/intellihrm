

# Industry-Aligned Orphan Management Action Consistency

## Problem Summary

The Route Registry orphan management system has **inconsistent action availability** across its tabs. Enterprise HCM systems like Workday and SAP SuccessFactors provide uniform action patterns regardless of the view context. Users should be able to Keep, Archive, or Delete entries from any management view, with contextual variations only where semantically required.

## Current State Analysis

| Tab | Keep | Archive | Delete | Current Status |
|-----|------|---------|--------|----------------|
| **Summary** | - | - | - | Stats only (no row actions) |
| **By Module** | Yes | Yes | Yes | Complete |
| **Duplicates** | Yes | Yes | Yes | Complete |
| **Prefixed Variants** | Yes | Yes | Yes | Complete |
| **Batches** | Yes (Bulk) | Yes (Bulk) | No | **Missing Delete** |
| **Candidates** | No | No | No | **Display only - Missing all actions** |
| **Kept** | No | No | No | **Only has "Undo Keep"** |
| **Archived** | No | No | Yes | **Missing Keep action** |
| **All** | Yes | Yes | Yes | Complete |

## Industry Alignment Principles

Following enterprise HCM patterns (Workday, SAP SuccessFactors):

1. **Consistent Action Vocabulary**: Same action labels and icons across all views
2. **Contextual Action Availability**: Actions should be available unless semantically meaningless
3. **Bulk Operations**: Multi-select with bulk actions on all list views
4. **Confirmation Dialogs**: Destructive actions require confirmation with impact summary
5. **Undo Capability**: Soft-delete operations (Archive) should support undo within a time window

## Implementation Plan

### Part 1: Update MigrationBatchesPanel (Add Delete Action)

**File**: `src/components/enablement/route-registry/MigrationBatchesPanel.tsx`

**Changes**:
1. Add `onDeleteBatch` prop to interface
2. Add "Delete Entire Batch" button alongside existing Keep/Archive buttons
3. Use destructive styling for delete button

```typescript
// Updated interface
interface MigrationBatchesPanelProps {
  batches: MigrationBatch[];
  orphans: OrphanEntry[];
  onArchiveBatch: (codes: string[]) => void;
  onKeepBatch: (codes: string[]) => void;
  onDeleteBatch: (codes: string[]) => void; // NEW
}

// New button in expanded batch content
<Button 
  variant="destructive" 
  size="sm"
  onClick={() => onDeleteBatch(batch.codes)}
>
  <Trash2 className="h-4 w-4 mr-2" />
  Delete Entire Batch
</Button>
```

---

### Part 2: Update RegistryCandidatesPanel (Add Keep, Archive, Delete Actions)

**File**: `src/components/enablement/route-registry/RegistryCandidatesPanel.tsx`

**Changes**:
1. Add action handler props to interface
2. Add row-level action buttons (Keep, Archive, Delete)
3. Add bulk selection support with Select All capability
4. Add selection-based bulk action bar

```typescript
// Updated interface
interface RegistryCandidatesPanelProps {
  candidates: OrphanEntry[];
  onKeep: (orphan: OrphanEntry) => void;    // NEW
  onArchive: (orphan: OrphanEntry) => void; // NEW
  onDelete: (orphan: OrphanEntry) => void;  // NEW
  isProcessing?: boolean;                    // NEW
}

// Add to each candidate row
<div className="flex gap-1">
  <Button variant="ghost" size="icon" onClick={() => onKeep(entry)}>
    <CheckCircle className="h-4 w-4 text-green-600" />
  </Button>
  <Button variant="ghost" size="icon" onClick={() => onArchive(entry)}>
    <Archive className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="icon" onClick={() => onDelete(entry)}>
    <Trash2 className="h-4 w-4 text-destructive" />
  </Button>
</div>
```

---

### Part 3: Update KeptEntriesPanel (Add Archive and Delete Actions)

**File**: `src/components/enablement/route-registry/KeptEntriesPanel.tsx`

**Changes**:
1. Add `onArchive` and `onDelete` props
2. Add Archive and Delete buttons alongside Undo button
3. Add tooltip explaining that Archive/Delete are available for entries that were kept by mistake

```typescript
// Updated interface
interface KeptEntriesPanelProps {
  keptEntries: OrphanEntry[];
  onUndoKeep: (orphanId: string) => Promise<void>;
  onArchive: (orphan: OrphanEntry) => void;  // NEW
  onDelete: (orphan: OrphanEntry) => void;   // NEW
  isProcessing: boolean;
}

// Updated action buttons per row
<div className="flex gap-1">
  <Button variant="outline" size="sm" onClick={() => onUndoKeep(entry.id)}>
    <Undo2 className="h-4 w-4 mr-2" />
    Undo Keep
  </Button>
  <Button variant="ghost" size="icon" onClick={() => onArchive(entry)}>
    <Archive className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="icon" onClick={() => onDelete(entry)}>
    <Trash2 className="h-4 w-4 text-destructive" />
  </Button>
</div>
```

---

### Part 4: Update ArchivedEntriesPanel (Add Keep Action)

**File**: `src/components/enablement/route-registry/ArchivedEntriesPanel.tsx`

**Changes**:
1. Add `onMarkAsKept` prop for direct Keep action (not just Restore)
2. Add "Keep" button that restores AND marks as kept in one action
3. Update bulk actions to include "Keep Selected"

```typescript
// Updated interface
interface ArchivedEntriesPanelProps {
  archivedEntries: OrphanEntry[];
  isLoading: boolean;
  onRestore: (id: string) => Promise<void>;
  onRestoreMultiple: (ids: string[]) => Promise<void>;
  onDeletePermanently: (id: string) => Promise<void>;
  onDeleteMultiple: (ids: string[]) => Promise<void>;
  onMarkAsKept: (id: string) => Promise<void>;         // NEW
  onMarkMultipleAsKept: (ids: string[]) => Promise<void>; // NEW
  isProcessing: boolean;
}

// Add Keep button in row actions
<Button
  size="sm"
  variant="ghost"
  className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
  onClick={() => onMarkAsKept(entry.id)}
>
  <CheckCircle className="h-4 w-4 mr-1" />
  Keep
</Button>

// Add to bulk actions
<Button
  size="sm"
  variant="outline"
  className="text-blue-600 border-blue-200 hover:bg-blue-50"
  onClick={() => setConfirmDialog({ open: true, type: 'keep_bulk' })}
>
  <CheckCircle className="h-4 w-4 mr-2" />
  Keep Selected
</Button>
```

---

### Part 5: Add Hook Helper for Restore-and-Keep

**File**: `src/hooks/useOrphanActions.ts`

**Changes**:
Add a combined action that restores an archived entry AND marks it as kept:

```typescript
/**
 * Restore an archived entry and immediately mark as kept
 * (Used from Archived tab for entries that should be retained)
 */
const restoreAndKeep = useCallback(async (orphanId: string, notes?: string): Promise<OrphanActionResult> => {
  setIsProcessing(true);
  try {
    const { error } = await supabase
      .from("application_features")
      .update({
        is_active: true,
        review_status: 'kept',
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id || null,
        review_notes: notes || 'Restored from archive and marked as kept'
      })
      .eq("id", orphanId);

    if (error) throw error;

    toast.success("Feature restored and marked as kept");
    return { success: true, affectedCount: 1, errors: [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to restore and keep';
    toast.error(message);
    return { success: false, affectedCount: 0, errors: [message] };
  } finally {
    setIsProcessing(false);
  }
}, []);

const restoreAndKeepMultiple = useCallback(async (orphanIds: string[], notes?: string): Promise<OrphanActionResult> => {
  // Similar batch implementation
}, []);
```

---

### Part 6: Update OrphanManagementPanel Integration

**File**: `src/components/enablement/route-registry/OrphanManagementPanel.tsx`

**Changes**:
1. Add `deleteByFeatureCodes` hook method for batch deletes
2. Pass new action handlers to all child panels
3. Wire up new restore-and-keep handlers

```typescript
// Batches tab - add onDeleteBatch
<MigrationBatchesPanel
  batches={migrationBatches}
  orphans={orphans}
  onArchiveBatch={async (codes) => {
    await archiveByFeatureCodes(codes);
    detectOrphans();
  }}
  onKeepBatch={async (codes) => {
    const ids = orphans.filter(o => codes.includes(o.featureCode)).map(o => o.id);
    if (ids.length > 0) {
      await markMultipleAsKept(ids);
      detectOrphans();
    }
  }}
  onDeleteBatch={async (codes) => {
    await deleteByFeatureCodes(codes);  // NEW handler
    detectOrphans();
  }}
/>

// Candidates tab - add action handlers
<RegistryCandidatesPanel
  candidates={registryCandidates}
  onKeep={(orphan) => setKeepDialog({ open: true, orphan })}
  onArchive={(orphan) => setActionDialog({ open: true, type: 'archive', orphan })}
  onDelete={(orphan) => setActionDialog({ open: true, type: 'delete', orphan })}
  isProcessing={isProcessing}
/>

// Kept tab - add archive/delete handlers
<KeptEntriesPanel
  keptEntries={keptEntries}
  onUndoKeep={handleUndoKeep}
  onArchive={(orphan) => setActionDialog({ open: true, type: 'archive', orphan })}
  onDelete={(orphan) => setActionDialog({ open: true, type: 'delete', orphan })}
  isProcessing={isProcessing}
/>

// Archived tab - add keep handlers
<ArchivedEntriesPanel
  archivedEntries={archivedEntries}
  isLoading={isLoading}
  onRestore={async (id) => { ... }}
  onRestoreMultiple={async (ids) => { ... }}
  onDeletePermanently={async (id) => { ... }}
  onDeleteMultiple={async (ids) => { ... }}
  onMarkAsKept={async (id) => {
    await restoreAndKeep(id);
    detectOrphans();
  }}
  onMarkMultipleAsKept={async (ids) => {
    await restoreAndKeepMultiple(ids);
    detectOrphans();
  }}
  isProcessing={isProcessing}
/>
```

---

### Part 7: Add deleteByFeatureCodes Hook Method

**File**: `src/hooks/useOrphanActions.ts`

```typescript
/**
 * Delete multiple features by feature code (used for batch operations)
 */
const deleteByFeatureCodes = useCallback(async (featureCodes: string[]): Promise<OrphanActionResult> => {
  if (featureCodes.length === 0) {
    toast.warning("No features to delete");
    return { success: true, affectedCount: 0, errors: [] };
  }

  setIsProcessing(true);
  try {
    const { data: features, error: fetchError } = await supabase
      .from("application_features")
      .select("id")
      .in("feature_code", featureCodes);

    if (fetchError) throw fetchError;

    if (!features || features.length === 0) {
      toast.warning("No features found matching the codes");
      setIsProcessing(false);
      return { success: true, affectedCount: 0, errors: [] };
    }

    const ids = features.map(f => f.id);

    const { error } = await supabase
      .from("application_features")
      .delete()
      .in("id", ids);

    if (error) throw error;

    toast.success(`${ids.length} feature(s) deleted permanently`);
    return { success: true, affectedCount: ids.length, errors: [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete';
    toast.error(message);
    return { success: false, affectedCount: 0, errors: [message] };
  } finally {
    setIsProcessing(false);
  }
}, []);
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useOrphanActions.ts` | Modify | Add `deleteByFeatureCodes`, `restoreAndKeep`, `restoreAndKeepMultiple` |
| `src/components/enablement/route-registry/MigrationBatchesPanel.tsx` | Modify | Add Delete batch action |
| `src/components/enablement/route-registry/RegistryCandidatesPanel.tsx` | Modify | Add Keep, Archive, Delete actions |
| `src/components/enablement/route-registry/KeptEntriesPanel.tsx` | Modify | Add Archive, Delete actions |
| `src/components/enablement/route-registry/ArchivedEntriesPanel.tsx` | Modify | Add Keep action |
| `src/components/enablement/route-registry/OrphanManagementPanel.tsx` | Modify | Wire up new handlers to child panels |

---

## Expected Outcome: Industry-Aligned Action Matrix

| Tab | Keep | Archive | Delete | Notes |
|-----|------|---------|--------|-------|
| **Summary** | - | - | - | Stats view (no row data) |
| **By Module** | Yes | Yes | Yes | Complete |
| **Duplicates** | Yes | Yes | Yes | Complete |
| **Prefixed Variants** | Yes | Yes | Yes | Complete |
| **Batches** | Yes (Bulk) | Yes (Bulk) | **Yes (Bulk)** | Now complete |
| **Candidates** | **Yes** | **Yes** | **Yes** | Now complete |
| **Kept** | Undo Keep | **Yes** | **Yes** | Now complete |
| **Archived** | **Yes** | N/A | Yes | Now complete (Keep = Restore+Mark) |
| **All** | Yes | Yes | Yes | Complete |

This provides full **industry alignment** with consistent action availability across all management views, following enterprise HCM patterns.

