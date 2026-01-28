
# Fix: Gap Analysis Not Checking manual_feature_coverage Table

## Problem Identified

The `identify_gaps` action in the Content Creation Agent edge function does not query the `manual_feature_coverage` table that was added as part of the consolidated plan. This causes the Gaps tab to show false positives for features that ARE documented in static manuals.

**Current Code (lines 919-922)**:
```typescript
const isDocumented = status?.documentation_status === 'complete' ||
  status?.workflow_status === 'published';

if (!isDocumented && types.size === 0) {
  gaps.noDocumentation.push(...);
}
```

**Missing**: Query to `manual_feature_coverage` table and check for `featuresWithManualCoverage.has(feature.feature_code)`

---

## Solution

Update the `identify_gaps` action in `supabase/functions/content-creation-agent/index.ts` to:

1. **Query** the `manual_feature_coverage` table at the start of the action
2. **Build** a Set of all feature codes that have manual coverage
3. **Include** this check in the `isDocumented` condition

---

## Implementation

### File: `supabase/functions/content-creation-agent/index.ts`

**Step 1**: Add manual_feature_coverage query after line 894 (after artifacts query):

```typescript
// NEW: Query manual feature coverage (links static manuals to features)
const { data: manualCoverage } = await supabase
  .from("manual_feature_coverage")
  .select("feature_codes");

// Build set of features covered by static manuals
const featuresWithManualCoverage = new Set<string>();
for (const row of manualCoverage || []) {
  (row.feature_codes || []).forEach((code: string) => 
    featuresWithManualCoverage.add(code)
  );
}
```

**Step 2**: Update the isDocumented check (lines 919-920) to include manual coverage:

```typescript
// BEFORE
const isDocumented = status?.documentation_status === 'complete' ||
  status?.workflow_status === 'published';

// AFTER
const isDocumented = status?.documentation_status === 'complete' ||
  status?.workflow_status === 'published' ||
  featuresWithManualCoverage.has(feature.feature_code);  // NEW
```

**Step 3**: Also update the KB article gap check to recognize documented features:

```typescript
// Line 931 - Missing KB should only flag features that are NOT in manual coverage
if (!types.has('kb_article') && !featuresWithManualCoverage.has(feature.feature_code)) {
  gaps.noKBArticle.push({ feature_code: feature.feature_code, feature_name: feature.feature_name });
}
```

---

## Expected Result

| Metric | Before Fix | After Fix |
|--------|------------|-----------|
| Appraisals - Undocumented | 4 (false) | 0 (correct) |
| Appraisals - Missing KB | 4 (false) | 0 (correct) |
| Coverage shown | 100% but 42 gaps | 100% with 0 gaps |

---

## Verification

After deployment, visiting `/enablement/create?selectedModule=appraisals` and clicking "Analyze" should show:
- Undocumented: 0
- Missing KB: 0 (or only features genuinely missing KB articles)
- Features like "Appraisal Forms", "Calibration Sessions" no longer appear as gaps
