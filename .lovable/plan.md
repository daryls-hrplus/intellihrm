
# Sync Manual Structure and Update Feature Documentation Status

## Problem Summary

The Coverage panel shows **0%** and **4 gaps** for the Appraisals module because:

1. The `manual_sections` table has **0 rows** for the Appraisals manual (despite the static `APPRAISALS_MANUAL_STRUCTURE` existing in TypeScript)
2. The `enablement_content_status` records for all 4 Appraisal features show `documentation_status: 'not_started'`
3. The coverage calculation only considers features with `documentation_status === 'complete'` or `workflow_status === 'published'`

## Solution Overview

Implement **both options** as requested:

1. **Option A**: When manual sections are initialized, update the coverage calculation to also check for existing `manual_sections` records
2. **Option B**: Automatically update related features' `documentation_status` to reflect the presence of manual sections

---

## Implementation Plan

### Part 1: Enhance the Initialize Sections Edge Function

Modify `initialize-manual-sections/index.ts` to also update the `enablement_content_status` table for related features.

**Changes:**
- After creating manual sections, fetch features that match the module codes
- Upsert `enablement_content_status` records with `documentation_status: 'in_progress'` for each feature
- This ensures that when sections exist, the features are marked as having documentation work in progress

```typescript
// After creating sections, update related feature documentation status
const { data: relatedFeatures } = await supabase
  .from('application_features')
  .select('feature_code, application_modules!inner(module_code)')
  .in('application_modules.module_code', moduleCodes);

if (relatedFeatures && relatedFeatures.length > 0) {
  for (const feature of relatedFeatures) {
    const moduleCode = (feature.application_modules as any)?.module_code;
    await supabase
      .from('enablement_content_status')
      .upsert({
        feature_code: feature.feature_code,
        module_code: moduleCode,
        documentation_status: 'in_progress',
        workflow_status: 'documentation',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'feature_code',
        ignoreDuplicates: false
      });
  }
}
```

### Part 2: Enhance Coverage Calculation

Modify `content-creation-agent/index.ts` in the `analyze_context` action to also consider `manual_sections` when determining if a feature is documented.

**Changes:**
- Fetch `manual_sections` grouped by source module codes
- When calculating `isDocumented`, also check if the feature's module has manual sections

```typescript
// Fetch manual sections coverage
const { data: manualSections } = await supabase
  .from('manual_sections')
  .select('id, source_module_codes')
  .not('source_module_codes', 'is', null);

// Build a set of module codes that have manual sections
const modulesWithManualSections = new Set<string>();
for (const section of manualSections || []) {
  const codes = (section.source_module_codes as string[]) || [];
  codes.forEach(code => modulesWithManualSections.add(code));
}

// In the coverage loop, update isDocumented check:
const hasManualContent = modulesWithManualSections.has(modCode);
const isDocumented = 
  status?.documentation_status === 'complete' ||
  status?.workflow_status === 'published' ||
  hasArtifacts ||
  hasManualContent; // NEW: Consider manual sections
```

### Part 3: Add Manual Count to Coverage Response

Add a new field to the coverage analysis response showing manual section coverage.

```typescript
// Add to response
manualSectionCoverage: {
  totalModulesWithSections: modulesWithManualSections.size,
  totalSections: manualSections?.length || 0,
  modulesWithContent: Array.from(modulesWithManualSections)
}
```

### Part 4: Update UI to Show Manual Section Coverage

Update `AgentContextPanel.tsx` to display manual section coverage in the stats.

**Changes:**
- Add a new stat row showing "Manual Sections" count when available
- Show which modules have manual documentation vs which don't

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/initialize-manual-sections/index.ts` | Add upsert for `enablement_content_status` with `documentation_status: 'in_progress'` after creating sections |
| `supabase/functions/content-creation-agent/index.ts` | Update `analyze_context` to include `manual_sections` in coverage calculation |
| `src/components/enablement/AgentContextPanel.tsx` | (Optional) Add visual indicator for manual section coverage |

---

## Expected Outcome

**After Implementation:**

1. **Initialize Sections** for Appraisals manual → Creates ~30 sections in `manual_sections`
2. The 4 Appraisal features get their `documentation_status` updated to `'in_progress'`
3. Coverage panel refreshes and shows:
   - **25% - 100%** coverage (depending on exact calculation logic)
   - **0-4 gaps** (instead of 4)
4. The Coverage calculation now considers both `enablement_content_status` AND `manual_sections`

---

## Database Impact

- **`manual_sections`**: Will be populated with standard structure sections (~30-35 rows per manual)
- **`enablement_content_status`**: Existing `not_started` records will be updated to `in_progress`

---

## Alternative: Immediate Database Fix

If you want to immediately fix the coverage without waiting for code changes, we can run a database update to mark the 4 Appraisal features as having documentation:

```sql
UPDATE enablement_content_status 
SET documentation_status = 'in_progress',
    workflow_status = 'documentation',
    updated_at = NOW()
WHERE module_code = 'appraisals';
```

This would show the features as "in progress" rather than gaps, while the full solution adds the proper sync logic.
