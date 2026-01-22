# Semantic Components Registry

> **Purpose**: Centralized index of all purpose-built semantic UI components. Before creating any colored badge, callout, or status indicator, check this registry first.

---

## Quick Reference

| Use Case | Component | Import Path |
|----------|-----------|-------------|
| Required proficiency level | `RequiredLevelBadge` | `@/components/ui/required-level-badge` |
| Achievement/rating score | `RatingScoreBadge` | `@/components/ui/rating-score-badge` |
| Proficiency gap status | `ProficiencyGapStatusBadge` | `@/components/ui/proficiency-gap-status-badge` |
| Entity active/inactive | `EntityStatusBadge` | `@/components/ui/entity-status-badge` |
| Generic semantic badge | `SemanticBadge` | `@/components/ui/semantic-badge` |
| Pre-built intent badges | `InfoBadge`, `SuccessBadge`, `WarningBadge`, `ErrorBadge` | `@/components/ui/semantic-badge` |
| Semantic callouts | `SemanticCallout`, `InfoCallout`, `WarningCallout`, etc. | `@/components/ui/semantic-callout` |
| Info tooltip with icon | `SemanticTooltip`, `InfoIcon` | `@/components/ui/semantic-tooltip` |

---

## Badge Components

### RequiredLevelBadge

**Use for**: Role requirements, job expectations, target proficiency levels (reference values)

```tsx
import { RequiredLevelBadge } from "@/components/ui/required-level-badge";

<RequiredLevelBadge level={3} label="Role: L3" size="sm" />
```

**Styling**: Light blue background (`--semantic-info-bg`) with dark blue text (`--semantic-info-text`)

---

### RatingScoreBadge

**Use for**: Performance ratings, achievement scores, assessment results (earned values)

```tsx
import { RatingScoreBadge } from "@/components/ui/rating-score-badge";

<RatingScoreBadge score={4} maxScore={5} label="Rating" />
```

**Styling**: Green for high scores, amber for medium, red for low

---

### ProficiencyGapStatusBadge

**Use for**: Gap analysis indicators showing above/below/at target status

```tsx
import { ProficiencyGapStatusBadge } from "@/components/ui/proficiency-gap-status-badge";

<ProficiencyGapStatusBadge gap={-1} /> // Shows "1 Below" in red
<ProficiencyGapStatusBadge gap={0} />  // Shows "At Target" in green
<ProficiencyGapStatusBadge gap={2} />  // Shows "2 Above" in green
```

---

### EntityStatusBadge

**Use for**: Active/inactive entity states (employees, records, configurations)

```tsx
import { EntityStatusBadge } from "@/components/ui/entity-status-badge";

<EntityStatusBadge status="active" />   // Green badge
<EntityStatusBadge status="inactive" /> // Grey badge
<EntityStatusBadge status="pending" />  // Amber badge
```

---

### SemanticBadge (Generic)

**Use for**: Custom semantic badges when specialized components don't fit

```tsx
import { SemanticBadge, InfoBadge, SuccessBadge, WarningBadge, ErrorBadge } from "@/components/ui/semantic-badge";

// Generic with intent
<SemanticBadge intent="info">Reference Value</SemanticBadge>
<SemanticBadge intent="success">Completed</SemanticBadge>
<SemanticBadge intent="warning">Needs Review</SemanticBadge>
<SemanticBadge intent="error">Failed</SemanticBadge>

// Pre-built convenience components
<InfoBadge>Info</InfoBadge>
<SuccessBadge>Success</SuccessBadge>
<WarningBadge>Warning</WarningBadge>
<ErrorBadge>Error</ErrorBadge>
```

---

## Callout Components

### SemanticCallout

**Use for**: Contextual information blocks, tips, warnings, alerts

```tsx
import { 
  SemanticCallout, 
  InfoCallout, 
  WarningCallout, 
  SuccessCallout, 
  ErrorCallout 
} from "@/components/ui/semantic-callout";

<InfoCallout title="Note">
  Additional context here
</InfoCallout>

<WarningCallout title="Caution">
  Important consideration
</WarningCallout>
```

---

## Tooltip Components

### SemanticTooltip & InfoIcon

**Use for**: Inline help icons with semantic coloring

```tsx
import { SemanticTooltip, InfoIcon } from "@/components/ui/semantic-tooltip";

// Standalone info icon
<InfoIcon className="h-4 w-4" />

// With tooltip
<SemanticTooltip content="Helpful information">
  <InfoIcon className="h-4 w-4" />
</SemanticTooltip>
```

---

## Color Token Reference

| Intent | Background Token | Text Token | Use Case |
|--------|------------------|------------|----------|
| `info` | `--semantic-info-bg` (light blue) | `--semantic-info-text` (dark blue) | Reference values, requirements |
| `success` | `--semantic-success-bg` (light green) | `--semantic-success-text` (dark green) | Achievement, completion |
| `warning` | `--semantic-warning-bg` (light amber) | `--semantic-warning-text` (dark amber) | Attention, in-progress |
| `error` | `--semantic-error-bg` (light red) | `--semantic-error-text` (dark red) | Failures, blocks |
| `neutral` | `--muted` | `--muted-foreground` | Pending, placeholder |

---

## ⚠️ Anti-Patterns to Avoid

| ❌ Don't Do This | ✅ Do This Instead |
|-----------------|-------------------|
| `bg-info/10 text-info-foreground` | `<InfoBadge>` or `<RequiredLevelBadge>` |
| `bg-green-100 text-green-800` | `<SuccessBadge>` or `intent="success"` |
| `Badge variant="default"` for Active | `<EntityStatusBadge status="active">` |
| Raw `text-blue-600` | `text-info` or semantic component |

---

## Governance

- **ESLint**: Contrast violations are blocked in migrated modules
- **Audit Script**: Run `npx tsx scripts/color-audit.ts` for compliance report
- **Standards Doc**: See `docs/DESIGN_SYSTEM.md` for full guidelines
