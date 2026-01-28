
# Fix Chapter Selection in Content Creation Studio

## Problem Summary

The Content Creation Studio cannot display chapters for the "Performance Appraisal - Administrator Guide" because:

1. **Database has no sections**: The `manual_sections` table has 0 rows for the Appraisals manual (`id: 7405b449-6cd0-4c37-9a1e-d6ed23b9c1ea`)
2. **Content lives in static TypeScript**: The actual manual structure is defined in `APPRAISALS_MANUAL_STRUCTURE` in `src/types/adminManual.ts` (8 chapters, ~100+ sections)
3. **Hook queries wrong source**: `useManualSectionPreview` calls `useManualSections(manualId)` which queries the empty database table

Only 2 manuals have database sections:
- Benefits Administrator Manual (35 sections)
- HR Hub Admin Guide (35 sections)

---

## Root Cause

The Content Creation Studio uses `useManualSections()` which queries `manual_sections` table, but the Appraisals manual content was never synced to this table. The static `APPRAISALS_MANUAL_STRUCTURE` in `src/types/adminManual.ts` contains 8 chapters with subsections, but this isn't being used by the Studio.

---

## Solution Options

### Option A: Sync Static Structure to Database (Recommended)
Initialize the `manual_sections` table with the content from `APPRAISALS_MANUAL_STRUCTURE`. This ensures the Content Creation Studio has chapters to select.

**Implementation:**
1. Create a utility function that converts `APPRAISALS_MANUAL_STRUCTURE` to database section format
2. Call the `initialize-manual-sections` edge function with proper mapping
3. Alternatively, create a direct sync script

**Changes Required:**
- Add a "Sync Structure" button in the Manual Content selector when no sections exist
- Call `useInitializeSections` mutation to populate the database from the static structure

### Option B: Support Both Static and Database Sources
Modify `useManualSectionPreview` to fallback to static structures when database is empty.

**Changes Required:**
- Detect if `manual_sections` returns empty for specific manual codes
- Fall back to `APPRAISALS_MANUAL_STRUCTURE` for appraisals, similar static for other manuals
- Map static structure to `ChapterInfo[]` format

---

## Recommended Implementation: Option A

This is the cleaner approach because:
1. The database becomes the single source of truth
2. AI regeneration can update database sections
3. Version tracking and change detection work properly
4. No special-case handling needed for different manuals

### Step 1: Add Helper to Detect Empty Manual

Update `ManualContentSelector.tsx` to show a sync prompt when manual has no sections:

```typescript
// When chapters.length === 0 and selectedManualId exists
<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
  <p className="text-sm text-amber-800 mb-2">
    This manual has no sections in the database yet.
  </p>
  <Button size="sm" onClick={handleInitializeSections}>
    Initialize Sections
  </Button>
</div>
```

### Step 2: Update ContentCreationStudioPage

Add initialization capability:

```typescript
const { mutate: initializeSections, isPending: isInitializing } = useInitializeSections();

const handleInitializeSections = () => {
  const manual = manuals.find(m => m.id === selectedManualId);
  if (!manual) return;
  
  initializeSections({
    manualId: selectedManualId,
    moduleName: manual.manual_name,
    moduleCodes: manual.module_codes,
    targetRoles: ['admin', 'hr_user', 'consultant']
  });
};
```

### Step 3: Pass Handler to ManualContentSelector

```typescript
<ManualContentSelector
  // ... existing props
  onInitializeSections={handleInitializeSections}
  isInitializing={isInitializing}
  hasSections={chapters.length > 0}
/>
```

### Step 4: Update ManualContentSelector UI

Add empty state with initialization action:

```typescript
{selectedManualId && !isLoadingSections && chapters.length === 0 && (
  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
    <div className="flex items-start gap-2">
      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          No sections found
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          Initialize sections from the standard template to enable AI regeneration.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={onInitializeSections}
          disabled={isInitializing}
        >
          {isInitializing ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          Initialize Sections
        </Button>
      </div>
    </div>
  </div>
)}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/enablement/ManualContentSelector.tsx` | Add empty state with initialization prompt, new props for `onInitializeSections`, `isInitializing`, `hasSections` |
| `src/pages/enablement/ContentCreationStudioPage.tsx` | Add `useInitializeSections` mutation, create handler, pass to `ManualContentSelector` via `AgentContextPanel` |
| `src/components/enablement/AgentContextPanel.tsx` | Pass through new initialization props to `ManualContentSelector` |

---

## Database Impact

After initialization, the `manual_sections` table will be populated with ~100+ rows for the Appraisals manual, matching the structure in `APPRAISALS_MANUAL_STRUCTURE`. This enables:
- Chapter dropdown to populate correctly
- Section selection to work
- Preview Changes and Regenerate actions to function
- AI-powered content updates

---

## Expected User Experience

**Before Fix:**
1. User selects "Performance Appraisal - Administrator Guide"
2. Chapter dropdown shows "Select a chapter..." but clicking does nothing
3. No sections available for regeneration

**After Fix:**
1. User selects "Performance Appraisal - Administrator Guide"  
2. UI shows "No sections found. Initialize sections from standard template."
3. User clicks "Initialize Sections"
4. ~100 sections are created in database
5. Chapter dropdown now populates with 8 chapters
6. User can select chapter, then section, and use AI regeneration

---

## Alternative Quick Fix

If immediate functionality is needed before full implementation, manually run the section initialization:

```sql
-- This would need to be done via the edge function
-- Call: initialize-manual-sections with manualId for appraisals
```

Or trigger via the existing "Start Bulk Generation" button which should call the initialization edge function.
