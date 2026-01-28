

# Add "Keep" Action to All Orphan Views

## Problem Summary

The "Keep" (mark as reviewed and retained) action was only implemented in the main orphan list but is missing from four other key views:

| View | Current Actions | Missing |
|------|----------------|---------|
| **Migration Batches** | Archive Batch | Keep, Keep Batch |
| **Duplicate Feature Names** | Archive, Delete | Keep |
| **By Module Accordion** | Archive, Delete | Keep |
| **Prefixed Variants** | Archive, Delete | Keep |

This creates an inconsistent experience where administrators cannot mark entries as "intentionally kept" from specialized views.

---

## Solution

Add the "Keep" action to all four components by:
1. Adding `onKeep` callback prop to each component
2. Adding a Keep button (green CheckCircle icon) alongside existing Archive/Delete buttons
3. For batch views, also add "Keep Entire Batch" option

---

## File Changes

### 1. MigrationBatchesPanel.tsx

**Add props:**
```typescript
interface MigrationBatchesPanelProps {
  batches: MigrationBatch[];
  orphans: OrphanEntry[];
  onArchiveBatch: (codes: string[]) => void;
  onKeepBatch: (codes: string[]) => void;  // NEW
}
```

**Add "Keep Entire Batch" button (line 117-125):**
```typescript
<div className="flex justify-end gap-2 mb-3">
  <Button 
    variant="outline" 
    size="sm"
    className="text-green-600 border-green-200 hover:bg-green-50"
    onClick={() => onKeepBatch(batch.codes)}
  >
    <CheckCircle className="h-4 w-4 mr-2" />
    Keep Entire Batch
  </Button>
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => onArchiveBatch(batch.codes)}
  >
    <Archive className="h-4 w-4 mr-2" />
    Archive Entire Batch
  </Button>
</div>
```

**Import CheckCircle:**
```typescript
import { Archive, ChevronDown, Database, Clock, CheckCircle } from "lucide-react";
```

---

### 2. OrphanDuplicatesPanel.tsx

**Add prop:**
```typescript
interface OrphanDuplicatesPanelProps {
  duplicates: OrphanDuplicate[];
  routeConflicts: OrphanRouteConflict[];
  onArchive: (orphan: OrphanEntry) => void;
  onDelete: (orphan: OrphanEntry) => void;
  onKeep: (orphan: OrphanEntry) => void;  // NEW
  onViewDuplicate: (duplicate: OrphanDuplicate) => void;
}
```

**Add Keep button in duplicate entries table (lines 128-147):**
```typescript
<TableCell>
  <div className="flex gap-1">
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
      onClick={() => onKeep(entry)}
      title="Mark as reviewed and keep"
    >
      <CheckCircle className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => onArchive(entry)}
      title="Archive"
    >
      <Archive className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive hover:text-destructive"
      onClick={() => onDelete(entry)}
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</TableCell>
```

**Add same Keep button in route conflicts table (lines 221-240)**

**Import CheckCircle:**
```typescript
import { Archive, Trash2, ExternalLink, Copy, GitMerge, Route, CheckCircle } from "lucide-react";
```

---

### 3. OrphanModuleAccordion.tsx

**Add prop:**
```typescript
interface OrphanModuleAccordionProps {
  moduleGroups: ModuleGroup[];
  selectedOrphans: Set<string>;
  onToggleSelection: (id: string) => void;
  onArchive: (orphan: OrphanEntry) => void;
  onDelete: (orphan: OrphanEntry) => void;
  onKeep: (orphan: OrphanEntry) => void;  // NEW
  onViewDuplicate: (duplicate: OrphanDuplicate) => void;
  duplicates: OrphanDuplicate[];
  getRecommendationBadge: (recommendation: OrphanRecommendation) => React.ReactNode;
  getSourceBadge: (source: OrphanSource) => React.ReactNode;
}
```

**Add Keep button in actions column (lines 188-206):**
```typescript
<TableCell>
  <div className="flex gap-1">
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
      onClick={() => onKeep(orphan)}
      title="Mark as reviewed and keep"
    >
      <CheckCircle className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => onArchive(orphan)}
      title="Archive (soft delete)"
    >
      <Archive className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive hover:text-destructive"
      onClick={() => onDelete(orphan)}
      title="Delete permanently"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</TableCell>
```

**Import CheckCircle:**
```typescript
import { Archive, Trash2, ExternalLink, FolderOpen, Copy, CheckCircle } from "lucide-react";
```

---

### 4. PrefixedVariantsPanel.tsx

**Add prop:**
```typescript
interface PrefixedVariantsPanelProps {
  prefixedVariants: OrphanDuplicate[];
  onArchive: (orphan: OrphanEntry) => void;
  onDelete: (orphan: OrphanEntry) => void;
  onKeep: (orphan: OrphanEntry) => void;  // NEW
}
```

**Add Keep button (lines 83-100):**
```typescript
{cluster.suggestedPrimary !== entry.featureCode && (
  <div className="flex gap-1">
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
      onClick={() => onKeep(entry)}
      title="Mark as reviewed and keep"
    >
      <CheckCircle className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => onArchive(entry)}
    >
      <Archive className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive hover:text-destructive"
      onClick={() => onDelete(entry)}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
)}
```

**Import CheckCircle:**
```typescript
import { Archive, Trash2, GitMerge, CheckCircle } from "lucide-react";
```

---

### 5. OrphanManagementPanel.tsx

**Update component usages to pass `onKeep` handler:**

```typescript
// For By Module tab:
<OrphanModuleAccordion
  moduleGroups={moduleGroups}
  selectedOrphans={selectedOrphans}
  onToggleSelection={toggleSelection}
  onArchive={(o) => setActionDialog({ open: true, type: 'archive', orphan: o })}
  onDelete={(o) => setActionDialog({ open: true, type: 'delete', orphan: o })}
  onKeep={(o) => setKeepDialog({ open: true, orphan: o })}  // NEW
  onViewDuplicate={(d) => setDuplicateDialog({ open: true, duplicate: d })}
  duplicates={duplicates}
  getRecommendationBadge={getRecommendationBadge}
  getSourceBadge={getSourceBadge}
/>

// For Duplicates tab:
<OrphanDuplicatesPanel
  duplicates={duplicates}
  routeConflicts={routeConflicts}
  onArchive={(o) => setActionDialog({ open: true, type: 'archive', orphan: o })}
  onDelete={(o) => setActionDialog({ open: true, type: 'delete', orphan: o })}
  onKeep={(o) => setKeepDialog({ open: true, orphan: o })}  // NEW
  onViewDuplicate={(d) => setDuplicateDialog({ open: true, duplicate: d })}
/>

// For Prefixed Variants tab:
<PrefixedVariantsPanel
  prefixedVariants={prefixedVariants}
  onArchive={(o) => setActionDialog({ open: true, type: 'archive', orphan: o })}
  onDelete={(o) => setActionDialog({ open: true, type: 'delete', orphan: o })}
  onKeep={(o) => setKeepDialog({ open: true, orphan: o })}  // NEW
/>

// For Migration Batches tab:
<MigrationBatchesPanel
  batches={migrationBatches}
  orphans={orphans}
  onArchiveBatch={handleBatchArchive}
  onKeepBatch={handleBatchKeep}  // NEW
/>
```

**Add batch keep handler:**
```typescript
const handleBatchKeep = async (codes: string[]) => {
  // Find orphan IDs by feature codes
  const orphanIds = orphans
    .filter(o => codes.includes(o.featureCode))
    .map(o => o.id);
  
  if (orphanIds.length > 0) {
    setKeepDialog({ open: true, count: orphanIds.length });
    // Store codes for the dialog to use
    setBatchKeepCodes(codes);
  }
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/enablement/route-registry/MigrationBatchesPanel.tsx` | Add `onKeepBatch` prop, "Keep Entire Batch" button |
| `src/components/enablement/route-registry/OrphanDuplicatesPanel.tsx` | Add `onKeep` prop, Keep buttons in both tables |
| `src/components/enablement/route-registry/OrphanModuleAccordion.tsx` | Add `onKeep` prop, Keep button in actions column |
| `src/components/enablement/route-registry/PrefixedVariantsPanel.tsx` | Add `onKeep` prop, Keep button for non-primary entries |
| `src/components/enablement/route-registry/OrphanManagementPanel.tsx` | Pass `onKeep` handlers to all child components |

---

## Visual Result

After implementation, all views will have consistent actions:

| View | Actions Available |
|------|-------------------|
| Migration Batches | Keep Batch, Archive Batch |
| Duplicate Names | Keep, Archive, Delete |
| By Module | Keep, Archive, Delete |
| Prefixed Variants | Keep, Archive, Delete |
| Registry Candidates | Keep, Archive, Delete |
| All Orphans | Keep, Archive, Delete |

Each "Keep" button will trigger the existing `KeepActionDialog` for notes and confirmation.

