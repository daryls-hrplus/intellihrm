

# Unify Manual Data Sources: Database as Single Source of Truth

## Problem Summary

The Content Creation Studio shows only **5 manuals** because it reads from the `manual_definitions` database table, which is incomplete and missing rich metadata. Meanwhile, the static `MANUALS_BY_ACT` in `manualsStructure.ts` has all 10 manuals with complete information.

## Current Data State Comparison

| Manual | In Database | In Static | Notes |
|--------|-------------|-----------|-------|
| admin-security | ✅ | ✅ | DB missing sections/chapters count |
| appraisals | ✅ | ✅ | DB missing sections/chapters count |
| goals | ✅ | ✅ | DB missing sections/chapters count |
| hr-hub | ✅ | ✅ | DB missing sections/chapters count |
| workforce | ✅ | ✅ | DB missing sections/chapters count |
| time-attendance | ❌ Missing | ✅ | Not in DB |
| benefits | ❌ Missing | ✅ | Not in DB |
| feedback-360 | ❌ Missing | ✅ | Not in DB |
| succession | ❌ Missing | ✅ | Not in DB |
| career-development | ❌ Missing | ✅ | Not in DB |

### Static Structure Has Richer Data

The static `MANUALS_BY_ACT` includes fields not in the database:
- `sections` (count) - e.g., 55, 80, 32
- `chapters` (count) - e.g., 8, 6, 10
- `functionalAreas` (array) - e.g., ["talent", "core-hr"]
- `badgeColor` - styling for badges

---

## Will You Lose Content?

**No, you will not lose any content.** 

The database stores:
- **Manual definitions** (metadata about manuals)
- **Manual sections** (actual content in `manual_sections` table)

This migration will:
1. **Add** the 5 missing manuals to `manual_definitions`
2. **Update** existing 5 manuals with richer metadata (sections count, chapters count, description, functional areas)
3. **Preserve** all existing `manual_sections` content (no changes to section content)

---

## Solution: Enrich Database Schema + Sync All Manuals

### Part 1: Add Missing Columns to Database Schema

Add columns to store the richer metadata currently in static config:

```sql
-- Add missing columns to manual_definitions
ALTER TABLE public.manual_definitions 
ADD COLUMN IF NOT EXISTS sections_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS chapters_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS functional_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS badge_color TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.manual_definitions.sections_count IS 'Number of sections in the manual';
COMMENT ON COLUMN public.manual_definitions.chapters_count IS 'Number of chapters in the manual';
COMMENT ON COLUMN public.manual_definitions.functional_areas IS 'Functional area tags: core-hr, talent, compensation, time-leave, platform';
COMMENT ON COLUMN public.manual_definitions.badge_color IS 'CSS classes for badge styling';
```

---

### Part 2: Insert Missing Manuals + Update Existing Ones

Sync all 10 manuals from the static structure to the database:

```sql
-- Upsert all 10 manuals with complete metadata
INSERT INTO manual_definitions (
  manual_code, manual_name, description, current_version, 
  icon_name, color_class, href, module_codes,
  sections_count, chapters_count, functional_areas, badge_color
) VALUES
  -- Prologue: Foundation
  ('admin-security', 'Admin & Security Guide', 
   'Complete guide to administration, security configuration, user management, and system settings',
   '1.0.0', 'Shield', 'bg-red-500/10 text-red-600 border-red-500/20', 
   '/enablement/manuals/admin-security', ARRAY['admin', 'security', 'access-control'],
   55, 8, ARRAY['platform', 'core-hr'], 'bg-red-500/10 text-red-700 border-red-500/30'),
   
  ('hr-hub', 'HR Hub Guide',
   'HR Hub configuration including policies, documents, knowledge base, and employee communications',
   '1.0.0', 'HelpCircle', 'bg-purple-500/10 text-purple-600 border-purple-500/20',
   '/enablement/manuals/hr-hub', ARRAY['hr-hub', 'employee-relations', 'grievances'],
   32, 8, ARRAY['core-hr', 'platform'], 'bg-purple-500/10 text-purple-700 border-purple-500/30'),

  -- Act 1: Attract, Onboard & Transition
  ('workforce', 'Workforce Guide',
   'Comprehensive workforce management including org structure, positions, departments, and employee lifecycle',
   '1.0.0', 'Users', 'bg-blue-500/10 text-blue-600 border-blue-500/20',
   '/enablement/manuals/workforce', ARRAY['workforce', 'employee-management', 'org-structure'],
   80, 8, ARRAY['core-hr'], 'bg-blue-500/10 text-blue-700 border-blue-500/30'),

  -- Act 2: Enable & Engage
  ('time-attendance', 'Time & Attendance Guide',
   'Complete guide to time tracking, shifts, schedules, overtime, and attendance management',
   '1.0.0', 'Clock', 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
   '/enablement/manuals/time-attendance', ARRAY['time-attendance', 'schedules', 'shifts'],
   65, 8, ARRAY['time-leave'], 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30'),

  -- Act 3: Pay & Reward
  ('benefits', 'Benefits Administrator Guide',
   'Complete benefits management including plans, enrollment, claims, life events, and analytics',
   '1.0.0', 'Heart', 'bg-pink-500/10 text-pink-600 border-pink-500/20',
   '/enablement/manuals/benefits', ARRAY['benefits', 'enrollment', 'claims'],
   45, 8, ARRAY['compensation'], 'bg-pink-500/10 text-pink-700 border-pink-500/30'),

  -- Act 4: Develop & Grow
  ('appraisals', 'Performance Appraisal Guide',
   'Performance appraisal configuration including cycles, templates, workflows, and calibration',
   '1.0.0', 'BookOpen', 'bg-primary/10 text-primary border-primary/20',
   '/enablement/manuals/appraisals', ARRAY['appraisals', 'performance', 'reviews'],
   48, 8, ARRAY['talent'], 'bg-primary/10 text-primary border-primary/30'),

  ('goals', 'Goals Manual',
   'Goals management configuration including goal frameworks, cascading, tracking, and alignment',
   '1.0.0', 'Target', 'bg-green-500/10 text-green-600 border-green-500/20',
   '/enablement/manuals/goals', ARRAY['goals', 'okrs', 'objectives'],
   24, 6, ARRAY['talent'], 'bg-green-500/10 text-green-700 border-green-500/30'),

  ('feedback-360', '360 Feedback Guide',
   'Multi-rater feedback system including cycles, anonymity, rater management, AI insights, and development themes',
   '1.0.0', 'Radar', 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
   '/enablement/manuals/feedback-360', ARRAY['feedback-360', 'multi-rater', 'anonymity'],
   59, 8, ARRAY['talent'], 'bg-cyan-500/10 text-cyan-700 border-cyan-500/30'),

  ('succession', 'Succession Planning Guide',
   'Comprehensive succession planning including 9-box assessments, talent pools, readiness frameworks, and career paths',
   '1.0.0', 'Grid3X3', 'bg-amber-500/10 text-amber-600 border-amber-500/20',
   '/enablement/manuals/succession', ARRAY['succession', 'talent-pools', '9-box'],
   55, 11, ARRAY['talent'], 'bg-amber-500/10 text-amber-700 border-amber-500/30'),

  ('career-development', 'Career Development Guide',
   'Career paths, individual development plans (IDPs), mentorship programs, and AI-driven development recommendations',
   '1.0.0', 'TrendingUp', 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
   '/enablement/manuals/career-development', ARRAY['career-development', 'idp', 'mentorship'],
   52, 10, ARRAY['talent'], 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30')

ON CONFLICT (manual_code) DO UPDATE SET
  manual_name = EXCLUDED.manual_name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  color_class = EXCLUDED.color_class,
  href = EXCLUDED.href,
  module_codes = EXCLUDED.module_codes,
  sections_count = EXCLUDED.sections_count,
  chapters_count = EXCLUDED.chapters_count,
  functional_areas = EXCLUDED.functional_areas,
  badge_color = EXCLUDED.badge_color,
  updated_at = now();
```

---

### Part 3: Update TypeScript Types

**File**: `src/hooks/useManualGeneration.ts`

Update the `ManualDefinition` interface to include new fields:

```typescript
export interface ManualDefinition {
  id: string;
  manual_code: string;
  manual_name: string;
  description: string | null;
  current_version: string;
  module_codes: string[];
  icon_name: string | null;
  color_class: string | null;
  href: string | null;
  // NEW fields
  sections_count: number;
  chapters_count: number;
  functional_areas: string[];
  badge_color: string | null;
  // Existing fields
  last_generated_at: string | null;
  generation_status: 'idle' | 'generating' | 'review_pending' | 'failed';
  created_at: string;
  updated_at: string;
}
```

---

### Part 4: Create Unified Manual Hook

**New File**: `src/hooks/useManuals.ts`

Create a single hook that provides consistent access for both flat lists and act-organized views:

```typescript
import { useMemo } from "react";
import { useManualDefinitions, ManualDefinition as DbManual } from "./useManualGeneration";

// Act metadata (static - defines the journey structure)
const ACT_METADATA = [
  { id: "prologue", label: "Prologue", title: "Setting the Stage", manualCodes: ["admin-security", "hr-hub"] },
  { id: "act1", label: "Act 1", title: "Attract, Onboard & Transition", manualCodes: ["workforce"] },
  { id: "act2", label: "Act 2", title: "Enable & Engage", manualCodes: ["time-attendance"] },
  { id: "act3", label: "Act 3", title: "Pay & Reward", manualCodes: ["benefits"] },
  { id: "act4", label: "Act 4", title: "Develop & Grow", manualCodes: ["appraisals", "goals", "feedback-360", "succession", "career-development"] },
];

export function useManuals() {
  const { data: dbManuals = [], isLoading, error } = useManualDefinitions();
  
  // Organize manuals by act
  const manualsByAct = useMemo(() => {
    return ACT_METADATA.map(act => ({
      ...act,
      manuals: dbManuals.filter(m => act.manualCodes.includes(m.manual_code)),
    }));
  }, [dbManuals]);
  
  // Find manual by code
  const getManualByCode = (code: string) => 
    dbManuals.find(m => m.manual_code === code);
  
  return {
    manuals: dbManuals,
    manualsByAct,
    getManualByCode,
    isLoading,
    error,
  };
}
```

---

### Part 5: Update ManualsIndexPage to Use Database

**File**: `src/pages/enablement/ManualsIndexPage.tsx`

Update to use the new unified hook while preserving the act-based organization:

```typescript
// Replace static imports with hook
import { useManuals } from "@/hooks/useManuals";

// In component:
const { manualsByAct, manuals, isLoading } = useManuals();

// Use manualsByAct for the act sections
// Use manuals for flat list operations
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| Database Migration | Create | Add columns + upsert all 10 manuals |
| `src/hooks/useManualGeneration.ts` | Modify | Update ManualDefinition interface |
| `src/hooks/useManuals.ts` | Create | Unified hook for all manual access |
| `src/pages/enablement/ManualsIndexPage.tsx` | Modify | Use database-backed data |
| `src/constants/manualsStructure.ts` | Keep | Preserve for backward compatibility, gradually deprecate |

---

## Expected Outcome

After implementation:

1. **Content Creation Studio** will show all 10 manuals in the dropdown
2. **Administrator Manuals Index** will show all 10 manuals organized by acts
3. **Manual Publishing** will have all 10 manuals available
4. **No content loss** - all existing `manual_sections` content is preserved
5. **Single source of truth** - database `manual_definitions` table
6. **Richer metadata** - sections count, chapters count, functional areas all stored in DB
7. **Future-proof** - new manuals can be added via database without code changes

---

## Technical Notes

### Backward Compatibility
The static `MANUALS_BY_ACT` in `manualsStructure.ts` will remain for now as a fallback. Components can gradually migrate to use `useManuals()` hook.

### Act Organization
The journey-based "Act" structure is preserved by maintaining a static mapping of which manuals belong to which act. The act metadata (narratives, themes, outcomes) can optionally be moved to a database table later.

### Existing Manual Sections
All content stored in `manual_sections` table is **untouched** - this migration only enriches the `manual_definitions` metadata.

