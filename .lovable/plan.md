

# Hybrid Administrator Manuals Reorganization Plan
## Employee Lifecycle (Acts) + Functional Area Tags

---

## Executive Summary

This plan implements a **Hybrid Organization Model** that combines:
1. **Primary grouping by Employee Lifecycle stages (Acts)** - for intuitive discovery
2. **Secondary Functional Area tags** - for cross-reference and filtering (Workday-style)

This approach provides the best of both worlds: the narrative journey that guides administrators through the employee lifecycle, while also allowing quick filtering by functional domain for administrators who think in terms of business areas.

---

## Proposed Visual Design

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Administrator Manuals                                                      │
│  Comprehensive configuration guides organized by employee lifecycle         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Filter by Functional Area:                                          │   │
│  │  [All] [Core HR] [Talent] [Compensation] [Time & Leave] [Platform]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  515 Total Sections  •  10 Guides  •  6 Functional Areas                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🏛️ PROLOGUE: Setting the Stage (87 sections)                         │ │
│  │ "Before employees can be managed, the foundation must be set..."      │ │
│  │                                                                       │ │
│  │  ┌─────────────────────────┐  ┌─────────────────────────┐            │ │
│  │  │ 🔒 Admin & Security     │  │ 📋 HR Hub Guide         │            │ │
│  │  │ 55 sections             │  │ 32 sections             │            │ │
│  │  │ ┌────────┐ ┌────────┐   │  │ ┌────────┐ ┌────────┐   │            │ │
│  │  │ │Platform│ │Core HR │   │  │ │Core HR │ │Platform│   │            │ │
│  │  │ └────────┘ └────────┘   │  │ └────────┘ └────────┘   │            │ │
│  │  └─────────────────────────┘  └─────────────────────────┘            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🔷 ACT 1: Attract, Onboard & Transition (80 sections)                 │ │
│  │ "Every great organization starts with great people..."                │ │
│  │                                                                       │ │
│  │  ┌─────────────────────────┐                                         │ │
│  │  │ 👥 Workforce Guide      │                                         │ │
│  │  │ 80 sections             │                                         │ │
│  │  │ ┌────────┐              │                                         │ │
│  │  │ │Core HR │              │                                         │ │
│  │  │ └────────┘              │                                         │ │
│  │  └─────────────────────────┘                                         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🟢 ACT 2: Enable & Engage (65 sections)                               │ │
│  │ "Empowered employees drive organizational success..."                 │ │
│  │                                                                       │ │
│  │  ┌─────────────────────────┐                                         │ │
│  │  │ ⏱️ Time & Attendance    │                                         │ │
│  │  │ 65 sections             │                                         │ │
│  │  │ ┌───────────┐           │                                         │ │
│  │  │ │Time&Leave │           │                                         │ │
│  │  │ └───────────┘           │                                         │ │
│  │  └─────────────────────────┘                                         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🟡 ACT 3: Pay & Reward (45 sections)                                  │ │
│  │ "Fair compensation builds trust and retention..."                     │ │
│  │                                                                       │ │
│  │  ┌─────────────────────────┐                                         │ │
│  │  │ 💊 Benefits Guide       │                                         │ │
│  │  │ 45 sections             │                                         │ │
│  │  │ ┌──────────────┐        │                                         │ │
│  │  │ │Compensation  │        │                                         │ │
│  │  │ └──────────────┘        │                                         │ │
│  │  └─────────────────────────┘                                         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🟣 ACT 4: Develop & Grow (238 sections)                               │ │
│  │ "Growth is not optional—it's the engine of retention..."             │ │
│  │                                                                       │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐             │ │
│  │  │ 📝 Appraisals │  │ 🎯 Goals      │  │ 📡 360 Fdbk   │             │ │
│  │  │ 48 sections   │  │ 24 sections   │  │ 59 sections   │             │ │
│  │  │ ┌──────┐      │  │ ┌──────┐      │  │ ┌──────┐      │             │ │
│  │  │ │Talent│      │  │ │Talent│      │  │ │Talent│      │             │ │
│  │  │ └──────┘      │  │ └──────┘      │  │ └──────┘      │             │ │
│  │  └───────────────┘  └───────────────┘  └───────────────┘             │ │
│  │                                                                       │ │
│  │  ┌───────────────┐  ┌───────────────┐                                │ │
│  │  │ 🔲 Succession │  │ 📈 Career Dev │                                │ │
│  │  │ 55 sections   │  │ 52 sections   │                                │ │
│  │  │ ┌──────┐      │  │ ┌──────┐      │                                │ │
│  │  │ │Talent│      │  │ │Talent│      │                                │ │
│  │  │ └──────┘      │  │ └──────┘      │                                │ │
│  │  └───────────────┘  └───────────────┘                                │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Functional Area Tags (Workday-Style Categories)

Each manual receives 1-2 functional area tags for cross-reference filtering:

| Manual | Primary Act | Functional Tags |
|--------|-------------|-----------------|
| Admin & Security Guide | Prologue | `Platform`, `Core HR` |
| HR Hub Guide | Prologue | `Core HR`, `Platform` |
| Workforce Guide | Act 1 | `Core HR` |
| Time & Attendance Guide | Act 2 | `Time & Leave` |
| Benefits Administrator Guide | Act 3 | `Compensation` |
| Performance Appraisal Guide | Act 4 | `Talent` |
| Goals Manual | Act 4 | `Talent` |
| 360 Feedback Guide | Act 4 | `Talent` |
| Succession Planning Guide | Act 4 | `Talent` |
| Career Development Guide | Act 4 | `Talent` |

### Functional Area Definitions

| Functional Area | Color | Description |
|-----------------|-------|-------------|
| Core HR | Blue | Organization structure, employee data, HR operations |
| Talent | Purple | Performance, learning, succession, career development |
| Compensation | Amber | Pay, benefits, rewards, total compensation |
| Time & Leave | Emerald | Attendance, scheduling, absence management |
| Platform | Slate | Security, administration, integrations, AI |

---

## Data Structure

### File: `src/constants/manualsStructure.ts`

```typescript
import { LucideIcon, Shield, Users, HelpCircle, Clock, Target, 
         BookOpen, Radar, Grid3X3, TrendingUp, Heart } from "lucide-react";

export type FunctionalArea = 
  | "core-hr" 
  | "talent" 
  | "compensation" 
  | "time-leave" 
  | "platform";

export const FUNCTIONAL_AREAS: Record<FunctionalArea, {
  label: string;
  color: string;
  badgeClass: string;
}> = {
  "core-hr": {
    label: "Core HR",
    color: "blue",
    badgeClass: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  },
  "talent": {
    label: "Talent",
    color: "purple",
    badgeClass: "bg-purple-500/10 text-purple-700 border-purple-500/30",
  },
  "compensation": {
    label: "Compensation",
    color: "amber",
    badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  },
  "time-leave": {
    label: "Time & Leave",
    color: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  },
  "platform": {
    label: "Platform",
    color: "slate",
    badgeClass: "bg-slate-500/10 text-slate-700 border-slate-500/30",
  },
};

export interface ManualDefinition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  sections: number;
  href: string;
  version: string;
  functionalAreas: FunctionalArea[];
  color: string;
  badgeColor: string;
}

export interface ActDefinition {
  id: string;
  actType: "prologue" | "act1" | "act2" | "act3" | "act4" | "act5" | "epilogue";
  title: string;
  subtitle: string;
  icon: LucideIcon;
  narrative: string;
  themes: { title: string; description: string }[];
  outcomes: string[];
  manuals: ManualDefinition[];
}

export const MANUALS_BY_ACT: ActDefinition[] = [
  {
    id: "prologue",
    actType: "prologue",
    title: "Prologue: Setting the Stage",
    subtitle: "Foundation & Governance",
    icon: Shield,
    narrative: "Before employees can be managed, the foundation must be set. Security configurations, access controls, and governance policies form the bedrock upon which all other modules operate.",
    themes: [
      { title: "Security First", description: "Zero-trust architecture" },
      { title: "Governance", description: "Policies and audits" },
      { title: "Operational Control", description: "Central command" },
      { title: "AI Infrastructure", description: "Intelligent foundation" },
    ],
    outcomes: [
      "Enterprise-grade security without complexity",
      "Complete audit trails for compliance",
      "Central command for HR operations",
    ],
    manuals: [
      {
        id: "admin-security",
        title: "Admin & Security Guide",
        description: "Complete guide to administration, security configuration, user management, and system settings",
        icon: Shield,
        sections: 55,
        href: "/enablement/manuals/admin-security",
        version: "2.4",
        functionalAreas: ["platform", "core-hr"],
        color: "bg-red-500/10 text-red-600 border-red-500/20",
        badgeColor: "bg-red-500/10 text-red-700 border-red-500/30",
      },
      {
        id: "hr-hub",
        title: "HR Hub Guide",
        description: "HR Hub configuration including policies, documents, knowledge base, and communications",
        icon: HelpCircle,
        sections: 32,
        href: "/enablement/manuals/hr-hub",
        version: "2.4",
        functionalAreas: ["core-hr", "platform"],
        color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        badgeColor: "bg-purple-500/10 text-purple-700 border-purple-500/30",
      },
    ],
  },
  // ... Act 1-4 definitions continue
];
```

---

## Implementation Steps

### Step 1: Create Data Structure File

**File:** `src/constants/manualsStructure.ts`

- Define `FunctionalArea` type and `FUNCTIONAL_AREAS` config
- Define `ManualDefinition` and `ActDefinition` interfaces
- Create `MANUALS_BY_ACT` array with all 10 manuals organized into Acts
- Export helper functions for filtering and aggregation

### Step 2: Create Reusable Components

**File:** `src/components/enablement/manuals/ManualsActSection.tsx`

Component that renders an Act section with:
- ActDivider header with narrative
- Grid of ManualCard components
- Collapsible/expandable behavior
- Section count aggregation

**File:** `src/components/enablement/manuals/ManualCard.tsx`

Enhanced card component featuring:
- Manual icon and title
- Section count badge
- Functional area tags (small pills)
- Hover state with drill-down affordance

**File:** `src/components/enablement/manuals/FunctionalAreaFilter.tsx`

Filter bar component with:
- Toggle buttons for each functional area
- "All" default state
- Multi-select capability
- Active filter indicators

### Step 3: Update ManualsIndexPage

**File:** `src/pages/enablement/ManualsIndexPage.tsx`

Replace the flat card grid with:
1. Import new components and data structure
2. Add `useTabState` for filter persistence and accordion expansion state
3. Render FunctionalAreaFilter component
4. Map through `MANUALS_BY_ACT` rendering ManualsActSection for each Act
5. Apply functional area filtering logic
6. Add URL hash sync for deep-linking (e.g., `#act4`)

### Step 4: Add Icon Registry Entries

**File:** `src/lib/iconRegistry.ts`

Ensure all Act and Manual icons are registered for tab serialization.

---

## Filtering Behavior

### When "All" is selected (default):
- Show all Acts in order
- Show all manuals within each Act
- Functional area tags visible on each card

### When a specific Functional Area is selected (e.g., "Talent"):
- Show only Acts that contain manuals with that tag
- Within each visible Act, show only manuals matching the filter
- Highlight the active filter badge
- Update section count to show filtered total

**Example: Filtering by "Talent"**
```text
Showing 5 guides with 238 sections tagged "Talent"

🟣 ACT 4: Develop & Grow (238 sections matching "Talent")

  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
  │ 📝 Appraisals │  │ 🎯 Goals      │  │ 📡 360 Fdbk   │
  │ 48 sections   │  │ 24 sections   │  │ 59 sections   │
  │ [Talent]      │  │ [Talent]      │  │ [Talent]      │
  └───────────────┘  └───────────────┘  └───────────────┘

  ┌───────────────┐  ┌───────────────┐
  │ 🔲 Succession │  │ 📈 Career Dev │
  │ 55 sections   │  │ 52 sections   │
  │ [Talent]      │  │ [Talent]      │
  └───────────────┘  └───────────────┘
```

---

## State Persistence

Using `useTabState` to persist:

```typescript
const [tabState, setTabState] = useTabState({
  defaultState: {
    activeFunctionalArea: "all" as FunctionalArea | "all",
    expandedActs: ["prologue", "act1", "act2", "act3", "act4"] as string[],
  },
  syncToUrl: ["activeFunctionalArea"],
});
```

This ensures:
- Filter selection persists when switching tabs
- Accordion expansion state is remembered
- URL is bookmarkable (e.g., `/enablement/manuals?filter=talent`)

---

## Component Hierarchy

```text
ManualsIndexPage
├── Breadcrumbs
├── Header (title, stats)
├── FunctionalAreaFilter
│   └── Toggle buttons for each area
├── Stats Banner (filtered counts)
└── Acts Container
    ├── ManualsActSection (Prologue)
    │   ├── ActDivider (collapsible header)
    │   └── ManualCard[] (Admin, HR Hub)
    ├── ManualsActSection (Act 1)
    │   ├── ActDivider
    │   └── ManualCard[] (Workforce)
    ├── ManualsActSection (Act 2)
    │   ├── ActDivider
    │   └── ManualCard[] (Time & Attendance)
    ├── ManualsActSection (Act 3)
    │   ├── ActDivider
    │   └── ManualCard[] (Benefits)
    └── ManualsActSection (Act 4)
        ├── ActDivider
        └── ManualCard[] (Appraisals, Goals, 360, Succession, Career)
```

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/constants/manualsStructure.ts` | Create | Data structure with Acts and Functional Areas |
| `src/components/enablement/manuals/ManualsActSection.tsx` | Create | Act container with collapsible header |
| `src/components/enablement/manuals/ManualCard.tsx` | Create | Enhanced card with functional area tags |
| `src/components/enablement/manuals/FunctionalAreaFilter.tsx` | Create | Filter toggle bar |
| `src/components/enablement/manuals/index.ts` | Create | Barrel export |
| `src/pages/enablement/ManualsIndexPage.tsx` | Modify | Replace grid with Act-based layout |
| `src/lib/iconRegistry.ts` | Modify | Add any missing icons |

---

## Benefits of Hybrid Approach

| Benefit | Description |
|---------|-------------|
| Intuitive Discovery | Lifecycle-based Acts guide new administrators through the system |
| Quick Cross-Reference | Functional area tags allow experienced users to filter by domain |
| Consistent with Product Capabilities | Mirrors the existing document structure |
| SHRM/AIHR Aligned | Follows industry-standard employee lifecycle model |
| Workday-Compatible Mental Model | Functional areas match Workday HCM categorization |
| Scalable | Easy to add new manuals to existing Acts or create new Acts |
| State Persistent | Filter and expansion states survive tab switches |

---

## Comparison: Before vs After

| Aspect | Current (Flat Grid) | Hybrid (Acts + Tags) |
|--------|---------------------|----------------------|
| Organization | 10 cards in random order | 5 Acts with narrative context |
| Discovery | Scan all cards | Browse by lifecycle stage |
| Cross-Reference | None | Filter by functional area |
| Context | Technical descriptions only | Story-driven with outcomes |
| Consistency | Different from Capabilities doc | Matches Capabilities structure |
| Section Counts | Per manual only | Per Act + filtered totals |

