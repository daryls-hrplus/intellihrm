

# Sync Manual Publishing Configuration with Complete Manuals Structure

## Problem

The Manual Publishing Center only shows **5 manuals**, but the Administrator Manuals Index has **10 manuals**. This is because `useManualPublishing.ts` has a hardcoded `MANUAL_CONFIGS` array that was never updated to include all manuals.

## Current State

| Source | Manual Count |
|--------|--------------|
| `manualsStructure.ts` (source of truth) | 10 manuals |
| `useManualPublishing.ts` (publishing page) | 5 manuals ❌ |

## Missing Manuals

These 5 manuals exist in `manualsStructure.ts` but are missing from `MANUAL_CONFIGS`:

1. **Time & Attendance Guide** - 65 sections, 8 chapters
2. **Benefits Administrator Guide** - 45 sections, 8 chapters  
3. **360 Feedback Guide** - 59 sections, 8 chapters
4. **Succession Planning Guide** - 55 sections, 11 chapters
5. **Career Development Guide** - 52 sections, 10 chapters

## Solution

Refactor `useManualPublishing.ts` to import the manuals from `manualsStructure.ts` instead of maintaining a separate hardcoded list. This ensures both pages always stay in sync.

---

## Implementation

### File: `src/hooks/useManualPublishing.ts`

**Change 1:** Remove the hardcoded `MANUAL_CONFIGS` array (lines 8-55)

**Change 2:** Import from `manualsStructure.ts` and transform the data

```typescript
import { getAllManuals, type ManualDefinition } from "@/constants/manualsStructure";

// Transform ManualDefinition to publishing format
function transformToPublishConfig(manuals: ManualDefinition[]) {
  return manuals.map(m => ({
    id: m.id,
    name: m.title,
    version: `v${m.version}.0`,
    sectionsCount: m.sections,
    href: m.href,
    icon: m.icon.displayName || 'BookOpen',
    color: m.color,
  }));
}

// Dynamic MANUAL_CONFIGS from single source of truth
export const MANUAL_CONFIGS = transformToPublishConfig(getAllManuals());
```

**Note:** The icon field needs special handling since `manualsStructure.ts` uses actual Lucide icon components, but the publishing card uses string icon names.

---

## Alternative Approach (Simpler)

If the transformation is complex, simply add the 5 missing manuals to `MANUAL_CONFIGS`:

### File: `src/hooks/useManualPublishing.ts`

Add after line 54:

```typescript
  {
    id: 'time-attendance',
    name: 'Time & Attendance - Administrator Guide',
    version: 'v1.0.0',
    sectionsCount: 65,
    href: '/enablement/manuals/time-attendance',
    icon: 'Clock',
    color: 'bg-indigo-500/10 text-indigo-600',
  },
  {
    id: 'benefits',
    name: 'Benefits - Administrator Guide',
    version: 'v1.0.0',
    sectionsCount: 45,
    href: '/enablement/manuals/benefits',
    icon: 'Heart',
    color: 'bg-pink-500/10 text-pink-600',
  },
  {
    id: 'feedback-360',
    name: '360 Feedback - Administrator Guide',
    version: 'v1.0.0',
    sectionsCount: 59,
    href: '/enablement/manuals/feedback-360',
    icon: 'Radar',
    color: 'bg-cyan-500/10 text-cyan-600',
  },
  {
    id: 'succession',
    name: 'Succession Planning - Administrator Guide',
    version: 'v1.0.0',
    sectionsCount: 55,
    href: '/enablement/manuals/succession',
    icon: 'Grid3X3',
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    id: 'career-development',
    name: 'Career Development - Administrator Guide',
    version: 'v1.0.0',
    sectionsCount: 52,
    href: '/enablement/manuals/career-development',
    icon: 'TrendingUp',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
```

---

## Update Icon Map

### File: `src/components/kb/ManualPublishCard.tsx`

The component uses `ICON_MAP` to resolve string icon names to Lucide components. Currently:

```typescript
const ICON_MAP: Record<string, typeof Shield> = {
  Shield,
  Users,
  HelpCircle,
  BookOpen,
  Target,
};
```

Add the missing icons:

```typescript
import { 
  Shield, Users, HelpCircle, BookOpen, Target,
  Clock, Heart, Radar, Grid3X3, TrendingUp 
} from "lucide-react";

const ICON_MAP: Record<string, typeof Shield> = {
  Shield,
  Users,
  HelpCircle,
  BookOpen,
  Target,
  Clock,
  Heart,
  Radar,
  Grid3X3,
  TrendingUp,
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useManualPublishing.ts` | Add 5 missing manuals to MANUAL_CONFIGS |
| `src/components/kb/ManualPublishCard.tsx` | Add 5 icons to ICON_MAP |

---

## Recommendation

I recommend **Option 1 (refactor to use single source of truth)** for long-term maintainability, but **Option 2 (add missing manuals)** is faster to implement and lower risk.

---

## After Fix

| Metric | Before | After |
|--------|--------|-------|
| Total Manuals | 5 | 10 |
| Total Sections | 239 | 515 |
| Alignment with Manuals Index | ❌ Out of sync | ✅ Aligned |

