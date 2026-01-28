
# Add "Keep/Retain" Action to Orphan Management

## Overview

This plan adds an explicit **"Mark as Reviewed"** (Keep) action to the orphan management system, allowing administrators to intentionally flag database entries as reviewed and retained. This prevents legitimate features from appearing in future orphan scans and creates an audit trail.

---

## Current State Analysis

### What Exists Today
| Action | Database Effect | UI Available |
|--------|----------------|--------------|
| **Archive** | Sets `is_active = false` | Yes |
| **Delete** | Permanently removes row | Yes |
| **Keep** | None - no way to mark as reviewed | **Missing** |

### The Problem
- Entries marked as "Keep" recommendation still appear in every scan
- No audit trail of who reviewed and approved retention
- Administrators must re-review the same orphans repeatedly
- No way to distinguish "not yet reviewed" from "reviewed and intentional"

---

## Solution Design

### Database Changes

Add a new column to `application_features` table:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `reviewed_at` | `timestamp with time zone` | `null` | When the entry was reviewed |
| `reviewed_by` | `uuid` | `null` | Who reviewed (references auth.users) |
| `review_status` | `text` | `null` | 'kept', 'needs_review', null |
| `review_notes` | `text` | `null` | Optional reason for keeping |

**SQL Migration:**
```sql
ALTER TABLE public.application_features
ADD COLUMN reviewed_at timestamp with time zone,
ADD COLUMN reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN review_status text CHECK (review_status IN ('kept', 'needs_review')),
ADD COLUMN review_notes text;
```

---

### Code Changes

#### 1. Update Types (`src/types/orphanTypes.ts`)

Add review-related fields to `OrphanEntry`:

```typescript
export interface OrphanEntry {
  // ... existing fields ...
  
  // New review fields
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewStatus: 'kept' | 'needs_review' | null;
  reviewNotes: string | null;
}
```

---

#### 2. Update useOrphanDetection Hook

**File:** `src/hooks/useOrphanDetection.ts`

**Changes:**
1. Add `reviewed_at`, `reviewed_by`, `review_status`, `review_notes` to the SELECT query
2. Filter out entries where `review_status = 'kept'` from orphan results (unless showing all)
3. Add optional `includeReviewed` parameter to `detectOrphans()`

```typescript
// In detectOrphans query:
const { data: dbFeatures } = await supabase
  .from("application_features")
  .select(`
    id,
    feature_code,
    // ... existing fields ...
    reviewed_at,
    reviewed_by,
    review_status,
    review_notes
  `)
  .order("module_code");

// Filter out reviewed entries from orphan detection
const orphanFeatures = allDbFeatures.filter(f => 
  !codeFeatureSet.has(f.feature_code) && 
  f.review_status !== 'kept'  // Exclude already-reviewed entries
);
```

---

#### 3. Update useOrphanActions Hook

**File:** `src/hooks/useOrphanActions.ts`

**Add new functions:**

```typescript
/**
 * Mark an orphan as reviewed and kept
 */
const markAsKept = useCallback(async (
  orphanId: string, 
  notes?: string
): Promise<OrphanActionResult> => {
  setIsProcessing(true);
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("application_features")
      .update({ 
        review_status: 'kept',
        reviewed_at: new Date().toISOString(),
        reviewed_by: userData.user?.id,
        review_notes: notes || null
      })
      .eq("id", orphanId);

    if (error) throw error;

    toast.success("Feature marked as reviewed and kept");
    return { success: true, affectedCount: 1, errors: [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to mark as kept';
    toast.error(message);
    return { success: false, affectedCount: 0, errors: [message] };
  } finally {
    setIsProcessing(false);
  }
}, []);

/**
 * Bulk mark orphans as kept
 */
const markMultipleAsKept = useCallback(async (
  orphanIds: string[],
  notes?: string
): Promise<OrphanActionResult> => {
  // Similar implementation with .in("id", orphanIds)
}, []);

/**
 * Undo keep action (reset review status)
 */
const undoKeep = useCallback(async (orphanId: string): Promise<boolean> => {
  // Sets review_status, reviewed_at, reviewed_by back to null
}, []);
```

---

#### 4. Update OrphanManagementPanel UI

**File:** `src/components/enablement/route-registry/OrphanManagementPanel.tsx`

**Changes:**

1. **Add "Kept" tab** to show entries that were marked as reviewed:
```typescript
<TabsTrigger value="kept" className="gap-2">
  <CheckCircle className="h-4 w-4" />
  Kept ({keptCount})
</TabsTrigger>
```

2. **Add Keep button** next to Archive/Delete buttons:
```typescript
<Button
  variant="ghost"
  size="icon"
  onClick={() => setActionDialog({ open: true, type: 'keep', orphan })}
  disabled={isProcessing}
  title="Mark as reviewed and keep"
>
  <CheckCircle className="h-4 w-4 text-green-600" />
</Button>
```

3. **Add bulk "Keep Selected" action** in selection bar:
```typescript
<Button 
  size="sm" 
  variant="outline"
  onClick={() => setActionDialog({ open: true, type: 'keep_bulk', count: selectedOrphans.size })}
>
  <CheckCircle className="h-4 w-4 mr-2" />
  Keep Selected
</Button>
```

4. **Toggle to show/hide kept entries:**
```typescript
<Switch 
  checked={showKept} 
  onCheckedChange={setShowKept}
/>
<Label>Show previously reviewed entries</Label>
```

---

#### 5. Create KeepActionDialog Component

**File:** `src/components/enablement/route-registry/KeepActionDialog.tsx`

A dialog for confirming "Keep" actions with optional notes:

```typescript
interface KeepActionDialogProps {
  open: boolean;
  orphan?: OrphanEntry;
  count?: number;
  isProcessing: boolean;
  onConfirm: (notes?: string) => Promise<void>;
  onCancel: () => void;
}

export function KeepActionDialog({...props}) {
  const [notes, setNotes] = useState("");
  
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <CheckCircle className="text-green-600" />
            Mark as Reviewed & Keep
          </DialogTitle>
        </DialogHeader>
        
        {/* Show feature details */}
        <div className="space-y-2">
          <Badge>{orphan.featureCode}</Badge>
          <p>{orphan.featureName}</p>
        </div>
        
        {/* Optional notes */}
        <div>
          <Label>Reason for keeping (optional)</Label>
          <Textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Planned for Q2 release..."
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onConfirm(notes)} className="bg-green-600">
            <CheckCircle className="mr-2" />
            Mark as Kept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

#### 6. Add "Kept" Tab Content

Show reviewed entries with:
- Feature details
- Who reviewed and when
- Review notes
- Option to "Un-keep" (reset review status)

```typescript
<TabsContent value="kept">
  <Card>
    <CardHeader>
      <CardTitle>Reviewed & Kept Features</CardTitle>
      <CardDescription>
        These entries were reviewed and intentionally kept in the database.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {keptEntries.map(entry => (
        <div key={entry.id} className="flex items-center justify-between">
          <div>
            <code>{entry.featureCode}</code>
            <p>{entry.featureName}</p>
            {entry.reviewNotes && (
              <p className="text-sm italic">"{entry.reviewNotes}"</p>
            )}
            <p className="text-xs text-muted-foreground">
              Reviewed by {entry.reviewedBy} on {format(entry.reviewedAt, 'PPP')}
            </p>
          </div>
          <Button variant="ghost" onClick={() => undoKeep(entry.id)}>
            <Undo className="h-4 w-4" />
            Undo
          </Button>
        </div>
      ))}
    </CardContent>
  </Card>
</TabsContent>
```

---

## Files to Modify/Create

| File | Action | Purpose |
|------|--------|---------|
| **Database** | MIGRATE | Add `reviewed_at`, `reviewed_by`, `review_status`, `review_notes` columns |
| `src/types/orphanTypes.ts` | MODIFY | Add review fields to OrphanEntry interface |
| `src/hooks/useOrphanDetection.ts` | MODIFY | Query new fields, filter out kept entries |
| `src/hooks/useOrphanActions.ts` | MODIFY | Add `markAsKept()`, `markMultipleAsKept()`, `undoKeep()` functions |
| `src/components/enablement/route-registry/OrphanManagementPanel.tsx` | MODIFY | Add Keep button, Kept tab, toggle for showing kept |
| `src/components/enablement/route-registry/KeepActionDialog.tsx` | CREATE | Dialog for confirming keep action with notes |
| `src/components/enablement/route-registry/KeptEntriesPanel.tsx` | CREATE | Panel showing reviewed/kept entries |

---

## User Experience

### Before
1. Administrator sees 500+ orphans
2. Reviews each one, decides to keep some
3. Next scan: same 500+ orphans appear again
4. No memory of previous review decisions

### After
1. Administrator sees 500+ orphans
2. Reviews each one, clicks "Keep" for legitimate entries
3. Enters optional note: "Planned for Q3 release"
4. Next scan: only unreviewed orphans appear
5. Can view "Kept" tab to see all approved entries
6. Full audit trail: who kept what, when, and why

---

## Industry Alignment

This approach matches enterprise HRMS standards:

| Feature | SAP SuccessFactors | Workday | HRplus (After) |
|---------|-------------------|---------|----------------|
| Explicit "Keep" action | Yes | Yes | Yes |
| Review audit trail | Yes | Yes | Yes |
| Notes/justification | Yes | Yes | Yes |
| Hide reviewed items | Yes | Yes | Yes |
| Bulk keep | Yes | Yes | Yes |
| Undo capability | Limited | Yes | Yes |

---

## Summary Stats After Implementation

The Orphan Management panel will show:

```text
┌─────────────────────────────────────────────────────────────────┐
│  DB Features: 837  |  Registry: 261  |  Synced: 250            │
│  Orphans: 350      |  Kept: 226      |  Total Unreviewed: 350  │
├─────────────────────────────────────────────────────────────────┤
│  Tabs: Summary | By Module | Duplicates | Batches | Kept       │
│        ────────────────────────────────────         ^^^^ NEW   │
│                                                                 │
│  [☑] Show previously reviewed entries                          │
│                                                                 │
│  Each orphan row:                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ admin_leave_calendar  [Archive] [Keep ✓] [Delete]       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```
