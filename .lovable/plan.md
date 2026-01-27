

# Knowledge Base & Administrator Manuals Alignment Plan
## Complete Module Coverage with Industry-Standard Structure

---

## Part 1: Complete Module Inventory

### Current Application Modules (30 modules from `application_modules` table)

| Module Code | Module Name | Current Manual? | Future Manual? |
|-------------|-------------|-----------------|----------------|
| admin | Administration | ✅ admin-security | - |
| hr_hub | HR Hub | ✅ hr-hub | - |
| workforce | Workforce Management | ✅ workforce | - |
| time_attendance | Time & Attendance | ✅ time-attendance | - |
| benefits | Benefits | ✅ benefits | - |
| performance | Talent/Performance | ✅ appraisals | - |
| goals | Goals | ✅ goals | - |
| 360_feedback | 360 Feedback | ✅ feedback-360 | - |
| succession | Succession Planning | ✅ succession | - |
| ess | Employee Self-Service | ❌ | 🔜 ESS Guide |
| mss | Manager Self-Service | ❌ | 🔜 MSS Guide |
| payroll | Payroll | ❌ | 🔜 Payroll Guide |
| compensation | Compensation | ❌ | 🔜 Compensation Guide |
| leave | Leave Management | ❌ | 🔜 Leave Guide |
| recruitment | Recruitment | ❌ | 🔜 Recruitment Guide |
| training | Training & Development | ❌ | 🔜 L&D Guide |
| learning | Learning | ❌ | 🔜 Learning Guide |
| hse | Health & Safety | ❌ | 🔜 HSE Guide |
| safety | Safety | ❌ | Part of HSE |
| employee_relations | Employee Relations | ❌ | 🔜 ER Guide |
| company_property | Company Property | ❌ | 🔜 Property Guide |
| onboarding | Onboarding | ❌ | Part of Workforce |
| offboarding | Offboarding | ❌ | Part of Workforce |
| scheduling | Scheduling | ❌ | Part of T&A |
| analytics | Analytics | ❌ | Cross-module |
| dashboard | Dashboard | ❌ | N/A |
| enablement | Enablement Center | ❌ | N/A (internal) |
| help | Help Center | ❌ | N/A (destination) |
| capabilities | Product Capabilities | ❌ | N/A |

### Current Administrator Manuals (10 manuals in `manualsStructure.ts`)

| Manual ID | Title | Chapters | Sections | Status |
|-----------|-------|----------|----------|--------|
| admin-security | Admin & Security Guide | 8 | 55 | ✅ Complete |
| hr-hub | HR Hub Guide | 8 | 32 | ✅ Complete |
| workforce | Workforce Guide | 8 | 80 | ✅ Complete |
| time-attendance | Time & Attendance Guide | 8 | 65 | ✅ Complete |
| benefits | Benefits Administrator Guide | 8 | 45 | ✅ Complete |
| appraisals | Performance Appraisal Guide | 8 | 48 | ✅ Complete |
| goals | Goals Manual | 6 | 24 | ✅ Complete |
| feedback-360 | 360 Feedback Guide | 8 | 59 | ✅ Complete |
| succession | Succession Planning Guide | 11 | 55 | ✅ Complete |
| career-development | Career Development Guide | 10 | 52 | ✅ Complete |

---

## Part 2: Industry-Standard KB Category Structure

### Proposed KB Categories (Aligned with Manuals + Future Modules)

```text
HELP CENTER KNOWLEDGE BASE CATEGORIES
─────────────────────────────────────────────────────────────

TIER 1: PLATFORM FOUNDATION
├── Platform & Security        ← admin-security manual
├── HR Hub                     ← hr-hub manual
└── Getting Started            ← Onboarding articles

TIER 2: CORE HR
├── Workforce                  ← workforce manual
├── ESS (Employee Self-Service) ← Future ESS guide
└── MSS (Manager Self-Service)  ← Future MSS guide

TIER 3: TIME & OPERATIONS  
├── Time & Attendance          ← time-attendance manual
├── Leave Management           ← Future leave guide
└── Scheduling                 ← Part of T&A

TIER 4: COMPENSATION & BENEFITS
├── Payroll                    ← Future payroll guide
├── Compensation               ← Future compensation guide
└── Benefits                   ← benefits manual

TIER 5: TALENT & PERFORMANCE
├── Performance Management     ← appraisals + goals manuals
├── 360 Feedback               ← feedback-360 manual
├── Succession & Talent        ← succession manual
└── Career Development         ← career-development manual

TIER 6: LEARNING & DEVELOPMENT
└── Training & Learning        ← Future L&D guide

TIER 7: RECRUITMENT
└── Recruitment                ← Future recruitment guide

TIER 8: EMPLOYEE WELLBEING
├── Health & Safety            ← Future HSE guide
├── Employee Relations         ← Future ER guide
└── Company Property           ← Future property guide
```

### KB Categories Database Update

| Slug | Name | Maps to Manual(s) | Icon | Status |
|------|------|-------------------|------|--------|
| `admin-security` | Platform & Security | admin-security | Shield | Keep (rename) |
| `hr-hub` | HR Hub | hr-hub | Briefcase | Keep |
| `getting-started` | Getting Started | (onboarding content) | BookOpen | Keep |
| `workforce` | Workforce | workforce | Users | Keep |
| `ess` | Employee Self-Service | (future) | UserCircle | Keep |
| `mss` | Manager Self-Service | (future) | UserCog | Keep |
| `time-attendance` | Time & Attendance | time-attendance | Clock | Keep |
| `leave-management` | Leave Management | (future) | Calendar | Keep |
| `payroll-compensation` | Payroll & Compensation | (future) | DollarSign | Keep |
| `benefits` | Benefits | benefits | Heart | Keep |
| `performance-management` | Performance Management | appraisals, goals | Target | Keep |
| `feedback-360` | 360 Feedback | feedback-360 | Radar | **NEW** |
| `succession-planning` | Succession & Talent | succession | TrendingUp | Keep |
| `career-development` | Career Development | career-development | TrendingUp | **NEW** |
| `training-learning` | Training & Learning | (future) | GraduationCap | Keep |
| `recruitment` | Recruitment | (future) | UserPlus | Keep |
| `health-safety` | Health & Safety | (future) | Shield | Keep |
| `employee-relations` | Employee Relations | (future) | Users | Keep |
| `company-property` | Company Property | (future) | Package | Keep |

---

## Part 3: Content Cleanup Strategy

### Current State
- **336 KB articles** exist with `source_manual_id = NULL`
- **0 published manuals** in `kb_published_manuals` table
- All current content is **seed/static data** - NOT from Enablement publishing

### Cleanup Actions

**Option A: Archive (Recommended)**
```sql
-- Archive all seed articles (keep for reference)
UPDATE kb_articles 
SET 
  is_published = false, 
  archived_at = NOW(), 
  archived_reason = 'Pre-Enablement seed content - awaiting manual publishing'
WHERE source_manual_id IS NULL;
```

**Option B: Delete (Clean slate)**
```sql
-- Remove all seed articles
DELETE FROM kb_articles WHERE source_manual_id IS NULL;
```

### Result
- KB starts empty (0 published articles)
- Content appears ONLY when published from Enablement Center
- Single Source of Truth architecture established

---

## Part 4: Technical Implementation

### Step 1: Database Migration - Update KB Categories

```sql
-- 1. Rename "Admin & Security" to "Platform & Security" (cleaner)
UPDATE kb_categories 
SET name = 'Platform & Security', 
    description = 'Security configuration, user management, system administration, and AI governance'
WHERE slug = 'admin-security';

-- 2. Add 360 Feedback category
INSERT INTO kb_categories (name, slug, description, icon, display_order, is_active)
VALUES ('360 Feedback', 'feedback-360', 'Multi-rater feedback systems, cycles, and development insights', 'Radar', 10, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

-- 3. Add Career Development category  
INSERT INTO kb_categories (name, slug, description, icon, display_order, is_active)
VALUES ('Career Development', 'career-development', 'Career paths, IDPs, mentorship programs, and AI-driven development', 'TrendingUp', 11, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

-- 4. Deactivate "Onboarding" (redundant with Getting Started)
UPDATE kb_categories SET is_active = false WHERE slug = 'onboarding';

-- 5. Deactivate "Policies & Compliance" (merge into Platform & Security or HR Hub)
UPDATE kb_categories SET is_active = false WHERE slug = 'policies-compliance';

-- 6. Deactivate "Workflow & Approvals" (cross-cutting, covered in manuals)
UPDATE kb_categories SET is_active = false WHERE slug = 'workflow-approvals';

-- 7. Archive all seed articles
UPDATE kb_articles 
SET 
  is_published = false, 
  archived_at = NOW(), 
  archived_reason = 'Pre-Enablement seed content - awaiting manual publishing'
WHERE source_manual_id IS NULL;
```

### Step 2: Create Category-to-Manual Mapping

**File:** `src/services/kb/categoryManualMapping.ts`

```typescript
export const MANUAL_TO_CATEGORY_MAP: Record<string, string> = {
  // Current manuals → KB categories
  'admin-security': 'admin-security',
  'hr-hub': 'hr-hub',
  'workforce': 'workforce',
  'time-attendance': 'time-attendance',
  'benefits': 'benefits',
  'appraisals': 'performance-management',
  'goals': 'performance-management',
  'feedback-360': 'feedback-360',
  'succession': 'succession-planning',
  'career-development': 'career-development',
  
  // Future manuals → KB categories (placeholder)
  'ess': 'ess',
  'mss': 'mss',
  'payroll': 'payroll-compensation',
  'compensation': 'payroll-compensation',
  'leave': 'leave-management',
  'recruitment': 'recruitment',
  'training': 'training-learning',
  'hse': 'health-safety',
  'employee-relations': 'employee-relations',
  'company-property': 'company-property',
};

export const CATEGORY_MANUAL_REVERSE_MAP: Record<string, string[]> = {
  'admin-security': ['admin-security'],
  'hr-hub': ['hr-hub'],
  'workforce': ['workforce'],
  'time-attendance': ['time-attendance'],
  'benefits': ['benefits'],
  'performance-management': ['appraisals', 'goals'],
  'feedback-360': ['feedback-360'],
  'succession-planning': ['succession'],
  'career-development': ['career-development'],
};
```

### Step 3: Update KnowledgeBasePage

**File:** `src/pages/help/KnowledgeBasePage.tsx`

Add empty state and filter for published content only:

```tsx
// Empty state component
function EmptyKnowledgeBase() {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Knowledge Base Coming Soon</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Our documentation is being prepared. Articles will appear here once published from the Enablement Center.
        </p>
      </CardContent>
    </Card>
  );
}

// Update fetchArticlesByCategory to only get published manual content
const fetchArticlesByCategory = async (categoryId: string) => {
  setLoading(true);
  const { data } = await supabase
    .from("kb_articles")
    .select("*")
    .eq("is_published", true)
    .eq("category_id", categoryId)
    .not("source_manual_id", "is", null)  // Only manual-published content
    .order("title");

  if (data) setArticles(data);
  setLoading(false);
};

// Update categories to only show those with articles
const fetchCategories = async () => {
  const { data: categoriesData } = await supabase
    .from("kb_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
    
  // Get article counts per category (only published from manuals)
  const { data: articleCounts } = await supabase
    .from("kb_articles")
    .select("category_id, id")
    .eq("is_published", true)
    .not("source_manual_id", "is", null);
    
  // Filter categories with articles OR keep all for future content
  const categoriesWithCounts = categoriesData?.map(cat => ({
    ...cat,
    articleCount: articleCounts?.filter(a => a.category_id === cat.id).length || 0
  }));
  
  setCategories(categoriesWithCounts || []);
  setLoading(false);
};
```

### Step 4: Update HelpCenterPage Stats

**File:** `src/pages/help/HelpCenterPage.tsx`

```tsx
// Update article count to only show Enablement-published content
const fetchArticleCount = async () => {
  const { count } = await supabase
    .from("kb_articles")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)
    .not("source_manual_id", "is", null);
    
  setArticleCount(count || 0);
};
```

---

## Part 5: Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| **Database** | **Migrate** | Add new categories, archive seed articles |
| `src/services/kb/categoryManualMapping.ts` | **Create** | Manual → Category mapping |
| `src/pages/help/KnowledgeBasePage.tsx` | **Modify** | Empty state, filter published content |
| `src/pages/help/HelpCenterPage.tsx` | **Modify** | Update article count logic |
| `src/services/kb/ManualPublishService.ts` | **Modify** | Add category mapping lookup |

---

## Part 6: Publishing Flow (Already Exists)

The publishing infrastructure is already in place:

```text
PUBLISHING FLOW
───────────────────────────────────────────────────

1. Admin opens Enablement Center → Manuals → [Manual Name]

2. Clicks "Publish to Help Center"

3. Publishing Wizard:
   ├── Select target KB category (from mapping)
   ├── Choose version increment (major/minor/patch)
   ├── Add changelog notes
   └── Confirm sections to publish

4. ManualPublishService executes:
   ├── Creates kb_published_manuals record
   ├── Creates/updates kb_articles with source_manual_id
   └── Creates kb_article_versions for audit

5. Articles appear in Help Center KB immediately
```

---

## Part 7: Visual Result

### Before (Current State)
```text
KB Categories: 17 (misaligned, some inactive)
KB Articles: 336 (all seed data, source_manual_id = NULL)
Published Manuals: 0
```

### After (Aligned State)
```text
KB Categories: 19 (aligned with manuals + future modules)
KB Articles: 0 (initially, until published from Enablement)
Published Manuals: 0 (ready for publishing)

Empty State Message:
┌─────────────────────────────────────────────────┐
│  📚 Knowledge Base Coming Soon                  │
│                                                 │
│  Our documentation is being prepared.           │
│  Articles will appear here once published       │
│  from the Enablement Center.                    │
└─────────────────────────────────────────────────┘
```

---

## Part 8: Future Module Expansion

When new Administrator Manuals are created:

1. **Add manual definition** to `src/constants/manualsStructure.ts`
2. **Add manual structure** to `src/types/[module]Manual.ts`
3. **Add category mapping** to `src/services/kb/categoryManualMapping.ts`
4. **Publish** via Enablement Center → KB automatically populated

### Planned Future Manuals

| Priority | Manual | Target Category |
|----------|--------|-----------------|
| High | ESS Guide | ess |
| High | MSS Guide | mss |
| High | Payroll Guide | payroll-compensation |
| High | Leave Management Guide | leave-management |
| Medium | Recruitment Guide | recruitment |
| Medium | L&D Guide | training-learning |
| Medium | HSE Guide | health-safety |
| Low | Employee Relations Guide | employee-relations |
| Low | Company Property Guide | company-property |

---

## Summary

| Change | Impact |
|--------|--------|
| Add 2 new KB categories | feedback-360, career-development |
| Deactivate 3 redundant categories | onboarding, policies-compliance, workflow-approvals |
| Archive 336 seed articles | Clean slate for manual-sourced content |
| Create category mapping | Streamlined publishing |
| Update KnowledgeBasePage | Empty state + filtered queries |
| Update HelpCenterPage | Accurate article counts |

This approach ensures:
- ✅ Single Source of Truth (Enablement → KB)
- ✅ Industry-standard category structure
- ✅ Future-proof for upcoming module guides
- ✅ Clean separation between internal docs and user-facing help

