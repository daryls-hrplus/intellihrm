
# Add Configuration Status Filters to Capability Framework Dashboard

## Overview
Add two new quick filter buttons to the Capability Framework page that allow users to quickly identify capabilities that are missing configuration:
1. **No Behavioral Indicators** - Competencies/Skills/Values without proficiency/behavioral indicators defined
2. **Not Linked to Jobs** - Competencies and Skills that are not assigned to any job positions

These filters will help administrators identify gaps in their capability configuration and take action.

---

## Current State
- The page has type filters (All, Skills, Competencies, Values)
- Category and Status dropdown filters exist
- Date filter popover exists
- Each capability card already shows configuration status (indicators, jobs) via `CompletionIndicator` icons
- The `enrichedCapabilities` array already computes `has_behavioral_indicators` and `job_count` for each capability

## Desired Behavior
- Add a new "Configuration" filter dropdown or toggle group above or near the existing filters
- Filter options:
  - "All" (default) - no configuration filter applied
  - "No Indicators" - show only capabilities where `has_behavioral_indicators === false`
  - "Not Linked to Jobs" - show only capabilities where `job_count === 0`
- Filters can combine with existing type/category/status filters
- Show count badges on each filter option

---

## Technical Approach

### 1. Add State for Configuration Filter

In `CapabilityRegistryPage.tsx`, add new state:

```typescript
type ConfigStatusFilter = 'all' | 'no-indicators' | 'not-linked-jobs';
const [configStatusFilter, setConfigStatusFilter] = useState<ConfigStatusFilter>('all');
```

### 2. Filter enrichedCapabilities in useMemo

Add a second useMemo or extend existing filtering to apply config status filter:

```typescript
const filteredCapabilities = useMemo(() => {
  return enrichedCapabilities.filter(cap => {
    // Apply configuration status filter
    if (configStatusFilter === 'no-indicators') {
      return !cap.has_behavioral_indicators;
    }
    if (configStatusFilter === 'not-linked-jobs') {
      // Only applies to SKILL and COMPETENCY types (Values don't link to jobs)
      if (cap.type === 'VALUE') return false;
      return (cap.job_count ?? 0) === 0;
    }
    return true;
  });
}, [enrichedCapabilities, configStatusFilter]);
```

### 3. Add Filter UI Component

Add a new filter control in the filter bar. Option: A dropdown menu or a set of filter chips/badges.

**Recommended UI:** Add filter chips/buttons that work as toggles:

```tsx
{/* Configuration Status Filters - Add below the main filter bar */}
<div className="flex items-center gap-2 flex-wrap">
  <span className="text-sm text-muted-foreground">Configuration:</span>
  <Button
    variant={configStatusFilter === 'all' ? 'secondary' : 'ghost'}
    size="sm"
    onClick={() => setConfigStatusFilter('all')}
  >
    All
  </Button>
  <Button
    variant={configStatusFilter === 'no-indicators' ? 'secondary' : 'ghost'}
    size="sm"
    onClick={() => setConfigStatusFilter('no-indicators')}
    className="gap-1"
  >
    <ListChecks className="h-3.5 w-3.5" />
    No Indicators
    <Badge variant="outline" className="ml-1">{noIndicatorsCount}</Badge>
  </Button>
  <Button
    variant={configStatusFilter === 'not-linked-jobs' ? 'secondary' : 'ghost'}
    size="sm"
    onClick={() => setConfigStatusFilter('not-linked-jobs')}
    className="gap-1"
  >
    <Briefcase className="h-3.5 w-3.5" />
    Not Linked to Jobs
    <Badge variant="outline" className="ml-1">{notLinkedCount}</Badge>
  </Button>
</div>
```

### 4. Compute Filter Counts

Add counts to show how many items match each filter:

```typescript
const noIndicatorsCount = useMemo(() => {
  return enrichedCapabilities.filter(c => !c.has_behavioral_indicators).length;
}, [enrichedCapabilities]);

const notLinkedCount = useMemo(() => {
  return enrichedCapabilities.filter(c => c.type !== 'VALUE' && (c.job_count ?? 0) === 0).length;
}, [enrichedCapabilities]);
```

### 5. Update Tab Content Rendering

Replace `enrichedCapabilities` with `filteredCapabilities` in all TabsContent grid renders:

```tsx
// Before
{enrichedCapabilities.map((capability) => (

// After  
{filteredCapabilities.map((capability) => (
```

Also update the type-filtered views:

```tsx
// Before
{enrichedCapabilities.filter(c => c.type === "SKILL").map((capability) => (

// After
{filteredCapabilities.filter(c => c.type === "SKILL").map((capability) => (
```

### 6. Update Summary Counts

The tab badges should show filtered counts:

```typescript
const filteredSkillCount = filteredCapabilities.filter(c => c.type === "SKILL").length;
const filteredCompetencyCount = filteredCapabilities.filter(c => c.type === "COMPETENCY").length;
const filteredValueCount = filteredCapabilities.filter(c => c.type === "VALUE").length;
```

---

## UI Placement

The configuration filter will be placed in a secondary row below the main filter bar, inside the Card header area:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Capability Framework     [Search] [Category▼] [Status▼] [Date] [Company▼] │
├─────────────────────────────────────────────────────────────────────────┤
│ Configuration: [All] [🔘 No Indicators (12)] [💼 Not Linked to Jobs (8)]  │
├─────────────────────────────────────────────────────────────────────────┤
│ [All 78] [Skills 48] [Competencies 29] [Values 1]                        │
│                                                                         │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐                                   │
│ │ Card 1  │  │ Card 2  │  │ Card 3  │                                   │
│ └─────────┘  └─────────┘  └─────────┘                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/workforce/CapabilityRegistryPage.tsx` | Add `configStatusFilter` state, compute filter counts, add filter UI row, update grid renders to use filtered list |

---

## Summary of Changes

1. **State**: Add `configStatusFilter` state with type `'all' | 'no-indicators' | 'not-linked-jobs'`
2. **Filter Logic**: Add `filteredCapabilities` useMemo that applies config filter to `enrichedCapabilities`
3. **Counts**: Compute `noIndicatorsCount` and `notLinkedCount` for badge display
4. **UI**: Add configuration filter row with toggle buttons and count badges
5. **Rendering**: Update all grid maps to use `filteredCapabilities` instead of `enrichedCapabilities`
6. **Tab Counts**: Update tab badges to show filtered counts

---

## No Database Changes Required
This feature uses data already computed on the frontend (`has_behavioral_indicators`, `job_count`). No new queries or schema changes needed.
