
# Release Command Center Integration & Documentation Sync

## Summary

This plan addresses four critical issues:
1. Confirming manual publishing still works (and integrating version freeze)
2. Creating documentation for the Release Command Center
3. Expanding scope to include all content types (Quick Starts, Checklists, Module Docs)
4. Moving Release Management out of hidden advanced features

---

## Part 1: Move Release Management to Primary Navigation

### File: `src/pages/enablement/EnablementHubPage.tsx`

**Change 1:** Add Release Command Center to `primarySections` (visible by default)

Add a new section after "Publish" in the primary sections:

```typescript
{
  titleKey: "Release Management",
  items: [
    {
      title: "Release Command Center",
      description: "Version lifecycle, milestones, and AI release manager",
      href: "/enablement/release-center",
      icon: Rocket,
      color: "bg-primary/10 text-primary",
      badge: "Pre-Release", // Dynamic from lifecycle
    },
  ],
},
```

**Change 2:** Remove "Release Management" from `advancedSections`

Remove the entire "Release Management" section (lines 274-299) from `advancedSections`. Keep "Release Versions" and "Release Calendar" as deprecated links in advanced for backward compatibility, or remove entirely.

---

## Part 2: Wire Version Freeze to Publishing

### File: `src/hooks/useReleaseLifecycle.ts`

Export helper functions for use in publishing:

```typescript
export function useVersionFreezeStatus() {
  const { lifecycle, isPreRelease } = useReleaseLifecycle();
  
  return {
    isVersionFrozen: lifecycle?.version_freeze_enabled && isPreRelease,
    baseVersion: lifecycle?.base_version || '1.0.0',
    releaseStatus: lifecycle?.release_status || 'pre-release',
  };
}
```

### File: `src/components/kb/SmartVersionSelector.tsx`

Add version freeze awareness:

```typescript
interface SmartVersionSelectorProps {
  // ... existing props
  versionFreezeEnabled?: boolean;
  isPreRelease?: boolean;
}

// In visibleOptions filter:
const visibleOptions = options.filter(opt => {
  // ... existing logic
  
  // When version freeze is enabled and in pre-release:
  if (versionFreezeEnabled && isPreRelease) {
    // Only show initial (first publish) and patch (updates)
    if (opt.value === 'major' || opt.value === 'minor') {
      return false; // Hide major/minor during freeze
    }
  }
  
  return true;
});
```

### File: `src/components/kb/PublishWizard.tsx`

Add version freeze banner and pass props to SmartVersionSelector:

```typescript
import { useVersionFreezeStatus } from "@/hooks/useReleaseLifecycle";

// In component:
const { isVersionFrozen, releaseStatus } = useVersionFreezeStatus();

// In Step 2 (version), before SmartVersionSelector:
{isVersionFrozen && (
  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-amber-600" />
      <span className="font-medium text-amber-700">Pre-Release Mode</span>
    </div>
    <p className="text-sm text-amber-600 mt-1">
      Version freeze is active. All updates will remain at v1.0.x until GA release.
    </p>
  </div>
)}

// Pass to SmartVersionSelector:
<SmartVersionSelector
  // ... existing props
  versionFreezeEnabled={isVersionFrozen}
  isPreRelease={releaseStatus === 'pre-release'}
/>
```

---

## Part 3: Expand Content Type Coverage

### Database Update: Add content type tracking

The AI readiness assessment should cover all content types. Update the `release-manager-agent` edge function to query:

1. **Administrator Manuals** (existing) — via `MANUAL_CONFIGS` or database
2. **Quick Start Guides** — via `enablement_quickstart_templates` table
3. **Implementation Checklists** — currently hardcoded in `ImplementationChecklistsPage.tsx`
4. **Module Documentation** — via `application_modules` table

### File: `supabase/functions/release-manager-agent/index.ts`

Update `assess_readiness` action to include all content types:

```typescript
// Assess all content types
const contentTypes = [
  { type: 'manuals', label: 'Administrator Manuals' },
  { type: 'quickstarts', label: 'Quick Start Guides' },
  { type: 'checklists', label: 'Implementation Checklists' },
  { type: 'module-docs', label: 'Module Documentation' },
];

// For Quick Start Guides:
const { data: quickstarts } = await supabase
  .from('enablement_quickstart_templates')
  .select('module_code, status')
  .eq('status', 'published');

// Include in AI prompt context
```

### File: `src/components/enablement/AIReadinessCard.tsx`

Update to show all content types:

```typescript
// Add content type breakdown
<div className="grid grid-cols-2 gap-4 mt-4">
  <div className="p-3 bg-muted rounded-lg">
    <p className="text-sm text-muted-foreground">Manuals</p>
    <p className="font-medium">10/10 complete</p>
  </div>
  <div className="p-3 bg-muted rounded-lg">
    <p className="text-sm text-muted-foreground">Quick Starts</p>
    <p className="font-medium">8/18 published</p>
  </div>
  <div className="p-3 bg-muted rounded-lg">
    <p className="text-sm text-muted-foreground">Checklists</p>
    <p className="font-medium">5/5 complete</p>
  </div>
  <div className="p-3 bg-muted rounded-lg">
    <p className="text-sm text-muted-foreground">Module Docs</p>
    <p className="font-medium">18/18 indexed</p>
  </div>
</div>
```

---

## Part 4: Add Release Status Badge to Manual Cards

### File: `src/components/enablement/manuals/ManualCard.tsx`

Add release status indicator:

```typescript
import { useReleaseLifecycle } from "@/hooks/useReleaseLifecycle";
import { ReleaseStatusBadge } from "../ReleaseStatusBadge";

// In component:
const { isPreRelease, isGAReleased } = useReleaseLifecycle();

// In card header, next to version badge:
<ReleaseStatusBadge />
```

### File: `src/components/kb/ManualPublishCard.tsx`

Add release status indicator:

```typescript
import { useReleaseLifecycle } from "@/hooks/useReleaseLifecycle";

// In component:
const { lifecycle } = useReleaseLifecycle();

// In card header:
<Badge 
  variant="outline" 
  className={
    lifecycle?.release_status === 'pre-release' 
      ? "bg-amber-50 text-amber-600 border-amber-200" 
      : "bg-green-50 text-green-600 border-green-200"
  }
>
  {lifecycle?.release_status === 'pre-release' ? 'Pre-Release' : 'GA Released'}
</Badge>
```

---

## Part 5: Create Documentation

### New File: `src/pages/enablement/ReleaseCommandCenterGuidePage.tsx`

Create a documentation page explaining:
1. What is the Release Command Center
2. Version Lifecycle States (Pre-Release → Preview → GA → Maintenance)
3. How Version Freeze works
4. Milestones management
5. AI Readiness Assessment
6. Release Notes aggregation

### Update: `src/pages/enablement/EnablementGuidePage.tsx`

Add a section linking to Release Command Center documentation.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/enablement/ReleaseCommandCenterGuidePage.tsx` | User guide for Release Command Center |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/enablement/EnablementHubPage.tsx` | Move Release Management to primary sections |
| `src/components/kb/SmartVersionSelector.tsx` | Add version freeze props |
| `src/components/kb/PublishWizard.tsx` | Add freeze banner, pass props |
| `src/hooks/useReleaseLifecycle.ts` | Export `useVersionFreezeStatus` helper |
| `src/components/enablement/manuals/ManualCard.tsx` | Add release status badge |
| `src/components/kb/ManualPublishCard.tsx` | Add release status badge |
| `src/components/enablement/AIReadinessCard.tsx` | Expand to show all content types |
| `supabase/functions/release-manager-agent/index.ts` | Include Quick Starts, Checklists in assessment |
| `src/routes/lazyPages.ts` | Add ReleaseCommandCenterGuidePage |
| `src/App.tsx` | Add route for guide page |

---

## Summary

| Issue | Solution |
|-------|----------|
| Manual publishing still works? | ✅ Yes, unchanged — but now enhanced with version freeze |
| Documentation exists? | 📝 Creating user guide for Release Command Center |
| Includes all content types? | 🔄 Expanding to cover Quick Starts, Checklists, Module Docs |
| Release Management hidden? | ✅ Moving to primary sections (visible by default) |

---

## Visual: Content Sync Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                    RELEASE COMMAND CENTER                       │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│   │ Version      │  │ Milestones   │  │ AI Readiness        │ │
│   │ Lifecycle    │  │ Timeline     │  │ Assessment          │ │
│   └──────┬───────┘  └──────────────┘  └──────────┬───────────┘ │
│          │                                        │             │
│          ▼                                        ▼             │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │                  CONTENT COVERAGE                         │ │
│   │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐ │ │
│   │  │ Manuals   │ │Quick Starts│ │ Checklists │ │ Module │ │ │
│   │  │ 10/10     │ │ 8/18       │ │ 5/5        │ │ Docs   │ │ │
│   │  └────────────┘ └────────────┘ └────────────┘ └────────┘ │ │
│   └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │                 VERSION FREEZE                            │ │
│   │                                                           │ │
│   │  When enabled: All publishes → v1.0.x (patch only)       │ │
│   │  SmartVersionSelector hides Major/Minor options          │ │
│   │                                                           │ │
│   └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MANUAL PUBLISHING PAGE                       │
│                  (Unchanged — still works!)                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Publish Wizard                                           │   │
│  │                                                          │   │
│  │ Step 1: Select Sections                                  │   │
│  │ Step 2: Version Config  ◄── Version Freeze Applied       │   │
│  │ Step 3: Target Category                                  │   │
│  │ Step 4: Confirm & Publish                                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HELP CENTER                                │
│                                                                 │
│  KB Articles created with source_manual_id → version tracked   │
└─────────────────────────────────────────────────────────────────┘
```
