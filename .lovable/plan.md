
# Show Creator Information for Orphan Entries

## Problem Summary

You want to see which logged-in user created orphan entries to help assess which ones to keep. Currently, the `application_features` table tracks **how** entries were created (via the `source` column: migration, manual, registry) but not **who** created them.

## Current State

| Field | Status | Purpose |
|-------|--------|---------|
| `source` | ✅ Exists | Tracks creation method (migration, manual, registry) |
| `reviewed_by` | ✅ Exists | Tracks who marked entry as "Kept" |
| `created_by` | ❌ Missing | Does not exist - cannot track creator |

## Solution

### Step 1: Add `created_by` Column to Database

Create a migration to add the `created_by` column that references the `profiles` table:

```sql
-- Add created_by column to application_features
ALTER TABLE public.application_features 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_application_features_created_by 
ON public.application_features(created_by);

-- Comment for documentation
COMMENT ON COLUMN public.application_features.created_by IS 'User ID who created this feature entry';
```

---

### Step 2: Update Types

**File**: `src/types/orphanTypes.ts`

Add `createdBy` and `createdByName` fields to the `OrphanEntry` interface:

```typescript
export interface OrphanEntry {
  // ... existing fields
  
  // Creator tracking (NEW)
  createdBy: string | null;       // User ID
  createdByName: string | null;   // Full name from profiles
}
```

---

### Step 3: Update Detection Hook to Fetch Creator Info

**File**: `src/hooks/useOrphanDetection.ts`

Update the data fetching to:
1. Add `created_by` to the SELECT query
2. Separately fetch profile information for all unique `created_by` IDs
3. Map creator names to each orphan entry

```typescript
// Updated RawDbFeature interface
interface RawDbFeature {
  // ... existing fields
  created_by: string | null;  // NEW
}

// In detectOrphans():
// 1. Fetch features with created_by
const { data: dbFeatures } = await supabase
  .from("application_features")
  .select(`
    id, feature_code, feature_name, ...,
    created_by  // ADD THIS
  `)

// 2. Get unique creator IDs
const creatorIds = [...new Set(
  dbFeatures?.map(f => f.created_by).filter(Boolean) || []
)];

// 3. Fetch creator profiles
let creatorMap = new Map<string, string>();
if (creatorIds.length > 0) {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", creatorIds);
  
  profiles?.forEach(p => creatorMap.set(p.id, p.full_name || 'Unknown'));
}

// 4. Add to OrphanEntry
return {
  // ... existing fields
  createdBy: f.created_by,
  createdByName: f.created_by ? creatorMap.get(f.created_by) || null : null
};
```

---

### Step 4: Update UI Panels to Display Creator

Add creator information to all orphan management panels:

**MigrationBatchesPanel.tsx** - Show creator in batch header and individual entries:

```tsx
{/* In batch header */}
{batchCreators.size > 0 && (
  <div className="flex items-center gap-1 text-xs text-muted-foreground">
    <User className="h-3 w-3" />
    Created by: {Array.from(batchCreators).join(', ')}
  </div>
)}

{/* In entry rows */}
<div className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
  <code className="font-mono text-xs truncate flex-1">
    {orphan.featureCode}
  </code>
  {orphan.createdByName && (
    <Badge variant="outline" className="text-xs mx-2 bg-blue-50 text-blue-700">
      <User className="h-3 w-3 mr-1" />
      {orphan.createdByName}
    </Badge>
  )}
  <Badge variant="outline" className="text-xs ml-2">
    {orphan.moduleCode || 'unassigned'}
  </Badge>
</div>
```

**Apply similar updates to:**
- `RegistryCandidatesPanel.tsx`
- `KeptEntriesPanel.tsx`
- `ArchivedEntriesPanel.tsx`
- `OrphansByModulePanel.tsx` (if it has entry rows)
- `DuplicatesPanel.tsx` (if it has entry rows)

---

### Step 5: Enhance Source Display

Since many existing entries don't have `created_by` set (they pre-date the column), enhance the source display to show more context:

```tsx
{/* Show source if no creator */}
{orphan.createdByName ? (
  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
    <User className="h-3 w-3 mr-1" />
    {orphan.createdByName}
  </Badge>
) : (
  <Badge variant="outline" className="text-xs bg-gray-50">
    <Database className="h-3 w-3 mr-1" />
    {orphan.source === 'auto_migration' ? 'Auto Migration' : 
     orphan.source === 'manual_entry' ? 'Manual Entry' :
     orphan.source === 'registry' ? 'Registry Sync' : 'System'}
  </Badge>
)}
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| Database Migration | Create | Add `created_by` column |
| `src/types/orphanTypes.ts` | Modify | Add `createdBy` and `createdByName` fields |
| `src/hooks/useOrphanDetection.ts` | Modify | Fetch and map creator profiles |
| `src/components/enablement/route-registry/MigrationBatchesPanel.tsx` | Modify | Display creator info |
| `src/components/enablement/route-registry/RegistryCandidatesPanel.tsx` | Modify | Display creator info |
| `src/components/enablement/route-registry/KeptEntriesPanel.tsx` | Modify | Display creator info |
| `src/components/enablement/route-registry/ArchivedEntriesPanel.tsx` | Modify | Display creator info |

---

## Expected Outcome

After implementation:
- New entries will automatically track who created them
- All orphan management panels will display:
  - **Creator name** (if `created_by` is set) with user icon
  - **Source label** (Migration, Manual, Registry) as fallback for legacy entries
- Batch headers will show unique creators for that batch
- This enables informed decision-making about which entries to keep vs. archive

---

## Important Note

Existing entries will have `created_by = NULL` since this is a new column. The UI will gracefully fall back to showing the `source` field for these entries. Going forward, any code that creates new `application_features` entries should set the `created_by` field to the authenticated user's ID.
