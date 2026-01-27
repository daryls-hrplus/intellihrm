
# Rebrand HRplus to Intelli HRM + TOC Text Wrapping Fix

## Overview
This plan addresses two requirements:
1. **Rebrand**: Replace all references to "HRplus" with "Intelli HRM" across the database and UI
2. **Fix TOC Wrapping**: Ensure text in the Table of Contents sidebar wraps properly instead of being truncated

---

## Scope Analysis

### UI Files (24 files with HRplus references)
| File | Occurrences | Context |
|------|-------------|---------|
| Manual sections (Succession, 360 Feedback, Benefits) | ~15 files | Documentation text references |
| `EnablementAccessGuard.tsx` | 2 | Variable names (backward compat) |
| `useTenantContext.ts` | 3 | Type comments and alias |
| `CalendarSync.tsx` | 1 | iCal PRODID |
| `UIColorSemanticsGuidePage.tsx` | 1 | Documentation text |
| `WorkspaceNavigationStandardPage.tsx` | 1 | Documentation text |
| `PermissionTemplatesTab.tsx` | 1 | Display label (already shows "Intelli HRM Internal Only") |

### Edge Functions (10+ functions)
| Function | Context |
|----------|---------|
| `send-ess-notification` | Email sender: "HRplus Cerebra" |
| `weekly-permissions-report` | Email sender: "HRplus Security" |
| `send-employee-response-notification` | Email sender: "HRplus Cerebra" |
| `send-scenario-notification` | Email sender: "HRplus Cerebra" |
| `send-sla-weekly-report` | Email sender: "HRplus Help Desk" |
| `convert-demo-to-production` | Welcome emails + URLs |
| `generate-voiceover-script` | AI system prompt |

### Database Constraints (3 constraints)
| Table | Constraint | Current Value |
|-------|-----------|---------------|
| `company_groups` | `tenant_type_check` | `'hrplus_internal'` |
| `roles` | `tenant_visibility_check` | `'hrplus_internal'` |
| `companies` | `tenant_type_check` | `'hrplus_internal'` |

### Database Data
| Table | Column | Issue |
|-------|--------|-------|
| `master_skills_library` | `source` | Contains "HRplus Deep Pack" |

### Database Functions
| Function | Issue |
|----------|-------|
| `is_hrplus_internal_user()` | Function name and query contains `hrplus_internal` |

---

## Implementation Plan

### Phase 1: Database Schema Changes

**1.1 Update CHECK constraints to accept both old and new values (backward compatibility)**

```sql
-- Allow both values during transition
ALTER TABLE company_groups 
DROP CONSTRAINT company_groups_tenant_type_check,
ADD CONSTRAINT company_groups_tenant_type_check 
CHECK (tenant_type IN ('hrplus_internal', 'intellihrm_internal', 'client'));

ALTER TABLE roles 
DROP CONSTRAINT roles_tenant_visibility_check,
ADD CONSTRAINT roles_tenant_visibility_check 
CHECK (tenant_visibility IN ('all', 'hrplus_internal', 'intellihrm_internal', 'client'));

ALTER TABLE companies 
DROP CONSTRAINT companies_tenant_type_check,
ADD CONSTRAINT companies_tenant_type_check 
CHECK (tenant_type IN ('hrplus_internal', 'intellihrm_internal', 'client', 'demo'));
```

**1.2 Migrate existing data**

```sql
-- Update existing records
UPDATE company_groups 
SET tenant_type = 'intellihrm_internal' 
WHERE tenant_type = 'hrplus_internal';

UPDATE roles 
SET tenant_visibility = 'intellihrm_internal' 
WHERE tenant_visibility = 'hrplus_internal';

UPDATE companies 
SET tenant_type = 'intellihrm_internal' 
WHERE tenant_type = 'hrplus_internal';

-- Update skills library source
UPDATE master_skills_library 
SET source = 'Intelli HRM Deep Pack' 
WHERE source = 'HRplus Deep Pack';
```

**1.3 Create new function and deprecate old one**

```sql
-- Create new function with updated name
CREATE OR REPLACE FUNCTION public.is_intellihrm_internal_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN companies c ON p.company_id = c.id
    LEFT JOIN company_groups cg ON c.group_id = cg.id
    WHERE p.id = auth.uid()
    AND cg.tenant_type = 'intellihrm_internal'
  );
$$;

-- Keep old function as alias for backward compatibility
CREATE OR REPLACE FUNCTION public.is_hrplus_internal_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT is_intellihrm_internal_user();
$$;
```

**1.4 Remove old constraint values after migration**

```sql
-- Final cleanup - remove old values from constraints
ALTER TABLE company_groups 
DROP CONSTRAINT company_groups_tenant_type_check,
ADD CONSTRAINT company_groups_tenant_type_check 
CHECK (tenant_type IN ('intellihrm_internal', 'client'));

ALTER TABLE roles 
DROP CONSTRAINT roles_tenant_visibility_check,
ADD CONSTRAINT roles_tenant_visibility_check 
CHECK (tenant_visibility IN ('all', 'intellihrm_internal', 'client'));

ALTER TABLE companies 
DROP CONSTRAINT companies_tenant_type_check,
ADD CONSTRAINT companies_tenant_type_check 
CHECK (tenant_type IN ('intellihrm_internal', 'client', 'demo'));
```

---

### Phase 2: Edge Functions Updates

Update email sender names in all affected functions:

| Function | Change |
|----------|--------|
| `send-ess-notification` | `"HRplus Cerebra"` → `"Intelli HRM"` |
| `weekly-permissions-report` | `"HRplus Security"` → `"Intelli HRM Security"` |
| `send-employee-response-notification` | `"HRplus Cerebra"` → `"Intelli HRM"` |
| `send-scenario-notification` | `"HRplus Cerebra"` → `"Intelli HRM"` |
| `send-sla-weekly-report` | `"HRplus Help Desk"` → `"Intelli HRM Help Desk"` |
| `convert-demo-to-production` | All HRplus references → Intelli HRM |
| `generate-voiceover-script` | AI prompt references |

---

### Phase 3: UI Component Updates

**3.1 Core Hook Updates**
- `useTenantContext.ts`: Update comments, keep `isHRPlusInternal` as deprecated alias

**3.2 Documentation/Manual Text Updates (~20 files)**

Replace text references in:
- Succession Manual sections
- 360 Feedback Manual sections
- Benefits Manual sections
- UI Color Semantics Guide
- Workspace Navigation Standard page

**3.3 Calendar Integration**
- `CalendarSync.tsx`: Update iCal PRODID from `HRPlus` to `IntelliHRM`

---

### Phase 4: TOC Text Wrapping Fix

**Problem**: Section 8.4 "Mentorship for Succession Candidates" is truncated in the TOC sidebar.

**Solution**: Remove `truncate` class and allow text to wrap naturally.

**File**: `src/pages/enablement/SuccessionManualPage.tsx`

**Change** (line 338):
```tsx
// Before
<span className="truncate">{sub.sectionNumber} {sub.title}</span>

// After  
<span className="break-words">{sub.sectionNumber} {sub.title}</span>
```

**Additional Change** (line 312):
```tsx
// Before
<span className="flex-1 truncate">{section.sectionNumber}. {section.title}</span>

// After
<span className="flex-1 break-words">{section.sectionNumber}. {section.title}</span>
```

---

## Files to Modify

### Database (1 migration)
- New SQL migration with all schema changes

### Edge Functions (~10 files)
- `send-ess-notification/index.ts`
- `weekly-permissions-report/index.ts`
- `send-employee-response-notification/index.ts`
- `send-scenario-notification/index.ts`
- `send-sla-weekly-report/index.ts`
- `convert-demo-to-production/index.ts`
- `generate-voiceover-script/index.ts`
- And others with HRplus references

### UI Components (~25 files)
- `src/hooks/useTenantContext.ts`
- `src/components/appraisals/CalendarSync.tsx`
- `src/pages/enablement/UIColorSemanticsGuidePage.tsx`
- `src/pages/enablement/WorkspaceNavigationStandardPage.tsx`
- `src/pages/enablement/SuccessionManualPage.tsx` (TOC fix)
- ~20 manual section components

---

## Validation Checklist

- [ ] Database constraints accept `intellihrm_internal`
- [ ] Existing data migrated from `hrplus_internal`
- [ ] `is_intellihrm_internal_user()` function created
- [ ] All edge functions use "Intelli HRM" branding
- [ ] UI documentation text updated
- [ ] TOC subsections wrap properly without truncation
- [ ] Backward compatibility maintained via aliases
