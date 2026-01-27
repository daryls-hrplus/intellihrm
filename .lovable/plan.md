
# Remove Deprecated Enablement Pages - Implementation Plan

## Summary

This plan removes 7 deprecated pages from the codebase, replacing their routes with redirects to the consolidated destinations. This will declutter both the navigation UI and the codebase itself.

---

## Deprecated Pages to Remove

| Page File | Current Route | Redirect To |
|-----------|---------------|-------------|
| `ApplicationDocsGeneratorPage.tsx` | `/enablement/docs-generator` | `/enablement/create` |
| `TemplateLibraryPage.tsx` | `/enablement/template-library` | `/enablement/create?activeTab=templates` |
| `FeatureCatalogPage.tsx` | `/enablement/feature-catalog` | `/enablement/audit` |
| `FeatureDatabasePage.tsx` | `/enablement/feature-database` | `/enablement/audit` |
| `ReleaseCalendarPage.tsx` | `/enablement/release-calendar` | `/enablement/release-center?activeTab=milestones` |
| `ContentLifecyclePage.tsx` | `/enablement/content-lifecycle` | `/enablement/release-center` |

---

## Implementation Steps

### Step 1: Update App.tsx Routes (Replace Pages with Redirects)

Replace the deprecated route definitions in `src/App.tsx` (lines 589-592, 595, 620) with `Navigate` components:

**Before:**
```tsx
<Route path="/enablement/docs-generator" element={<ProtectedRoute>...<Pages.ApplicationDocsGeneratorPage />...</ProtectedRoute>} />
<Route path="/enablement/feature-catalog" element={<ProtectedRoute>...<Pages.FeatureCatalogPage />...</ProtectedRoute>} />
// etc.
```

**After:**
```tsx
<Route path="/enablement/docs-generator" element={<Navigate to="/enablement/create" replace />} />
<Route path="/enablement/template-library" element={<Navigate to="/enablement/create?activeTab=templates" replace />} />
<Route path="/enablement/feature-catalog" element={<Navigate to="/enablement/audit" replace />} />
<Route path="/enablement/feature-database" element={<Navigate to="/enablement/audit" replace />} />
<Route path="/enablement/release-calendar" element={<Navigate to="/enablement/release-center?activeTab=milestones" replace />} />
<Route path="/enablement/content-lifecycle" element={<Navigate to="/enablement/release-center" replace />} />
```

### Step 2: Remove Lazy Imports from lazyPages.ts

Remove these exports from `src/routes/lazyPages.ts` (lines 81-84, 87, 109):

```typescript
// REMOVE these lines:
export const ApplicationDocsGeneratorPage = lazy(() => import('@/pages/enablement/ApplicationDocsGeneratorPage'));
export const FeatureCatalogPage = lazy(() => import('@/pages/enablement/FeatureCatalogPage'));
export const FeatureDatabasePage = lazy(() => import('@/pages/enablement/FeatureDatabasePage'));
export const TemplateLibraryPage = lazy(() => import('@/pages/enablement/TemplateLibraryPage'));
export const ReleaseCalendarPage = lazy(() => import('@/pages/enablement/ReleaseCalendarPage'));
export const ContentLifecyclePage = lazy(() => import('@/pages/enablement/ContentLifecyclePage'));
```

### Step 3: Fix Internal References

Update pages that still link to deprecated routes:

**File: `src/pages/enablement/FeatureAuditDashboard.tsx` (line 219)**
```typescript
// BEFORE:
<Button onClick={() => navigate("/enablement/feature-database")}>

// AFTER:
// Remove this button entirely OR change to stay on current page
<Button onClick={() => navigate("/enablement/audit")}>
```

**File: `src/pages/enablement/ManualsIndexPage.tsx` (line 191)**
```typescript
// BEFORE:
route: "/enablement/docs-generator",

// AFTER:
route: "/enablement/create",
```

**File: `src/pages/enablement/FeatureCatalogPage.tsx` (line 88)**
This file is being deleted, so no fix needed.

### Step 4: Delete Page Files

Remove the following files from `src/pages/enablement/`:

1. `ApplicationDocsGeneratorPage.tsx`
2. `TemplateLibraryPage.tsx`
3. `FeatureCatalogPage.tsx`
4. `FeatureDatabasePage.tsx`
5. `ReleaseCalendarPage.tsx`
6. `ContentLifecyclePage.tsx`

### Step 5: Clean Up enablementRoutes.tsx

The redirects are already defined in `src/routes/enablementRoutes.tsx` (lines 67-68, 74-75, 81-82), but the lazy imports at the top are now unused. Since App.tsx is the primary router, we should remove the duplicate route file references or consolidate.

**However**, since `enablementRoutes.tsx` already has the correct redirects, we only need to ensure App.tsx uses the same pattern.

### Step 6: Remove from useCodeRegistryScanner.ts

Remove the deprecated page entries from the scanner (line 110):

```typescript
// REMOVE:
{ pageName: "FeatureCatalogPage", routePath: "/enablement/feature-catalog", ... }
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/App.tsx` | Replace 6 route definitions with `Navigate` redirects |
| `src/routes/lazyPages.ts` | Remove 6 lazy imports |
| `src/pages/enablement/FeatureAuditDashboard.tsx` | Fix button link to `/enablement/audit` |
| `src/pages/enablement/ManualsIndexPage.tsx` | Fix link to `/enablement/create` |
| `src/hooks/useCodeRegistryScanner.ts` | Remove deprecated route entry |

## Files to Delete

| File | Reason |
|------|--------|
| `src/pages/enablement/ApplicationDocsGeneratorPage.tsx` | Replaced by Content Creation Studio |
| `src/pages/enablement/TemplateLibraryPage.tsx` | Replaced by Content Creation Studio |
| `src/pages/enablement/FeatureCatalogPage.tsx` | Replaced by Feature Audit Dashboard |
| `src/pages/enablement/FeatureDatabasePage.tsx` | Replaced by Feature Audit Dashboard |
| `src/pages/enablement/ReleaseCalendarPage.tsx` | Replaced by Release Command Center |
| `src/pages/enablement/ContentLifecyclePage.tsx` | Replaced by Release Command Center |

---

## Result

| Metric | Before | After |
|--------|--------|-------|
| Enablement page files | 46 | 40 |
| Duplicate navigation paths | 6 | 0 |
| Bundle size | Includes 6 unused pages | Reduced |
| Route confusion | High | Eliminated |

All existing bookmarks and links to deprecated routes will automatically redirect to the correct consolidated pages.
