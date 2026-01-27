
# Fix 404 Error on "Publish to Help Center" Button

## Problem Identified

When clicking "Publish to Help Center" on the Manual Publishing page, the application navigates to a 404 page.

### Root Cause
The route `/enablement/manual-publishing` is used in navigation links but is NOT registered in `App.tsx`:

| Navigation Source | Route Used | Registered in App.tsx? |
|-------------------|------------|------------------------|
| `EnablementHubPage.tsx` | `/enablement/manual-publishing` | No |
| `ManualsIndexPage.tsx` | `/enablement/manual-publishing` | No |
| `enablementRoutes.tsx` | `/enablement/manual-publishing` | Not used (orphan file) |
| **App.tsx actual route** | `/enablement/manuals/publishing` | Yes (line 618) |

The publish wizard itself (`PublishWizard.tsx`) opens as a **Dialog modal**, not a navigation. However, the user is seeing a 404 because they're on the route `/enablement/manual-publishing` which doesn't exist.

---

## Solution

Add the missing route to `App.tsx` to match the path used by navigation links.

### Step 1: Add Route to App.tsx

Add the following route alongside the existing enablement routes (around line 619):

```tsx
<Route path="/enablement/manual-publishing" element={
  <ProtectedRoute>
    <EnablementAccessGuard>
      <LazyPage><Pages.ManualPublishingPage /></LazyPage>
    </EnablementAccessGuard>
  </ProtectedRoute>
} />
```

This ensures the route `/enablement/manual-publishing` is properly registered.

### Step 2: Remove Duplicate Route (Optional Cleanup)

The existing route at line 618 can be kept as an alias or removed:
```tsx
// Line 618 - existing (can be kept or removed)
<Route path="/enablement/manuals/publishing" element={...} />
```

**Recommendation:** Keep both routes for backwards compatibility, or update all references to use a single consistent path.

---

## Files to Modify

| File | Action |
|------|--------|
| `src/App.tsx` | Add route `/enablement/manual-publishing` |

---

## Expected Result

After this fix:
1. Navigating to `/enablement/manual-publishing` will load the Manual Publishing page
2. Clicking "Publish to Help Center" will open the PublishWizard dialog correctly
3. The publishing workflow will function as designed

---

## Technical Details

The `PublishWizard` component:
- Opens as a Dialog (modal), not navigation
- Is controlled by `tabState.wizardOpen` state
- When `handlePublish(manualId)` is called, it sets `wizardOpen: true`
- The wizard walks through 4 steps: Sections, Version, Category, Confirm
- Uses `ManualPublishService.publishManual()` to create KB articles

The issue is purely a **routing registration problem**, not a component logic issue.
