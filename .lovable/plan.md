

# Add Collapsible Analytics Sections with "Collapse All" Control

## Overview
Add a "Collapse All" button at the top of the Manager Self-Service dashboard that allows managers to toggle the visibility of all analytics widget sections. Each section will be expanded by default on page load, but managers can collapse them individually or all at once for a cleaner view when they want quick access to the navigation cards.

---

## Implementation Approach

### Component Architecture
Create a new wrapper component `CollapsibleDashboardSection` that can be used to wrap each analytics section, allowing individual collapse/expand while also being controlled by a master "Collapse All" toggle.

### State Management
Use React state to track:
- Individual section collapse states
- Global collapse/expand state
- Persist preference in localStorage (optional enhancement)

---

## Technical Implementation

### New Component

**File: `src/components/mss/CollapsibleDashboardSection.tsx`**

A reusable wrapper that provides:
- Collapsible content with smooth animation
- Section header with title and collapse indicator
- Optional icon for section identification
- Controlled collapse state from parent

### Updated Components

**File: `src/pages/mss/ManagerSelfServicePage.tsx`**

Changes:
1. Add state management for section collapse states
2. Add "Collapse All" / "Expand All" button at top right (after page title)
3. Wrap each analytics section in `CollapsibleDashboardSection`:
   - Team Health Summary
   - Performance & Approvals Row (3 cards)
   - Training & Talent Row (3 cards)
   - Team Leave Intelligence
   - Resumption of Duty Widget

### UI Design (Based on Screenshot Reference)

```
┌─────────────────────────────────────────────────────────────────┐
│ Manager Self-Service                           [↕ Collapse All] │
│ Manage your team and direct reports                             │
├─────────────────────────────────────────────────────────────────┤
│ ▼ Team Health Summary                                           │
│   [Team: 12] [Actions: 8] [Overdue: 3] [High: 67%] [Risk: 2]   │
├─────────────────────────────────────────────────────────────────┤
│ ▼ Performance & Approvals                                       │
│   [Performance Snapshot] [Pending Approvals] [Team Composition] │
├─────────────────────────────────────────────────────────────────┤
│ ▼ Training & Talent Pipeline                                    │
│   [Training Status] [Succession] [Compensation]                 │
├─────────────────────────────────────────────────────────────────┤
│ ▼ Team Intelligence                                             │
│   [Leave Intelligence] [Resumption of Duty]                     │
├─────────────────────────────────────────────────────────────────┤
│ ▸ Team Management                                               │
│ ▸ Approvals & Attendance                                        │
│ ...                                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/mss/CollapsibleDashboardSection.tsx` | Reusable collapsible section wrapper |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/mss/ManagerSelfServicePage.tsx` | Add collapse state, button, and wrap sections |
| `src/components/mss/index.ts` | Export new component |

---

## Behavior Specification

| Feature | Behavior |
|---------|----------|
| Default state | All sections expanded on page load |
| Collapse All button | Collapses all analytics sections at once |
| Expand All button | Expands all analytics sections at once |
| Individual toggle | Each section has its own collapse/expand toggle |
| Button text | Dynamically shows "Collapse All" or "Expand All" based on state |
| Animation | Smooth collapse/expand animation using Radix Collapsible |
| Icon | Uses `ChevronsUpDown` icon matching existing patterns |

---

## Section Groupings

The dashboard sections will be organized as:

1. **Team Health Summary** - KPI stat row
2. **Performance & Approvals** - 3-column grid with Performance Snapshot, Pending Approvals, Team Composition
3. **Training & Talent Pipeline** - 3-column grid with Training Status, Succession, Compensation
4. **Team Intelligence** - Leave Intelligence and ROD widgets side-by-side or stacked
5. **Navigation** - Existing GroupedModuleCards (already has its own collapse)

---

## Component Props

```typescript
interface CollapsibleDashboardSectionProps {
  title: string;
  icon?: LucideIcon;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}
```

