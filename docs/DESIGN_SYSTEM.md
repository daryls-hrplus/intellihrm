# HRplus Implementation Manual Design System

This document provides a comprehensive reference for all standardized components used across HRplus implementation manuals.

## Overview

The design system ensures:
- **Visual Consistency**: All manuals share the same visual language
- **Semantic Colors**: Colors have meaning, not just aesthetics  
- **Accessibility**: Proper contrast in both light and dark modes
- **Maintainability**: Change styles in one place, updates everywhere

---

## Component Imports

All design system components are exported from `@/components/enablement/manual/components`:

```tsx
import { 
  // Callout variants (12 types)
  Callout,
  InfoCallout, 
  WarningCallout, 
  TipCallout, 
  NoteCallout, 
  SuccessCallout,
  CriticalCallout,
  ComplianceCallout,
  IndustryCallout,
  IntegrationCallout,
  SecurityCallout,
  FutureCallout,
  
  // FeatureCard variants (7 types)
  FeatureCard,
  PrimaryFeatureCard,
  SuccessFeatureCard,
  InfoFeatureCard,
  WarningFeatureCard,
  PurpleFeatureCard,
  OrangeFeatureCard,
  
  // Grid layout
  FeatureCardGrid,
  
  // Status badges (5 types)
  StatusBadge,
  HighStatusBadge,
  MediumStatusBadge,
  LowStatusBadge,
  CriticalStatusBadge,
  InfoStatusBadge
} from '@/components/enablement/manual/components';
```

---

## Callout Components

Use Callouts for tips, warnings, important information, and special notices. All Callouts have a left border accent with subtle background.

### Variants

| Variant | Use Case | Border Color | Icon |
|---------|----------|--------------|------|
| `info` | General information, helpful context | Blue | Info |
| `warning` | Cautions, prerequisites | Amber | AlertTriangle |
| `tip` | Best practices, recommendations | Emerald | Lightbulb |
| `note` | Additional context, references | Purple | FileText |
| `success` | Confirmations, completed actions | Green | CheckCircle |
| `critical` | Critical warnings, high-risk items | Red | AlertTriangle |
| `compliance` | Regulatory requirements | Red | Shield |
| `industry` | Industry standards, benchmarks | Blue | Building |
| `integration` | Cross-module connections | Violet | Link2 |
| `security` | Security notices | Red | Lock |
| `future` | Roadmap, planned features | Indigo | Sparkles |

### Usage Examples

```tsx
// Using specific callout component
<InfoCallout title="Important Note">
  This is general information for users.
</InfoCallout>

// Using generic Callout with variant
<Callout variant="warning" title="Prerequisite">
  Complete the previous step before continuing.
</Callout>
```

---

## FeatureCard Components

Use FeatureCards for feature grids, category listings, and service overviews. Each variant has semantic meaning.

### Variants

| Variant | Use Case | Background | Example |
|---------|----------|------------|---------|
| `primary` | Main features, employee empowerment | Blue | Core HR features |
| `success` | Approvals, completions, certifications | Emerald | Certification tracking |
| `info` | Information, controlled access | Teal | Access control |
| `warning` | Alerts, cautions, pending items | Amber | Pending actions |
| `purple` | Licenses, real-time, special features | Purple | Real-time updates |
| `orange` | Time-related, memberships, offboarding | Orange | Membership tracking |
| `neutral` | Default, low priority | Gray | Secondary features |

### Props

```tsx
interface FeatureCardProps {
  variant?: 'primary' | 'success' | 'info' | 'warning' | 'purple' | 'orange' | 'neutral';
  icon?: LucideIcon;      // Optional icon component
  title: string;          // Card title
  description?: string;   // Short description paragraph
  children?: ReactNode;   // Content (lists, custom elements)
  centered?: boolean;     // Center-align content (for compact cards)
  className?: string;     // Additional CSS classes
}
```

### Usage Examples

```tsx
// With list content
<FeatureCard variant="primary" icon={GraduationCap} title="Education">
  <ul className="space-y-1 mt-2">
    <li>• Degrees and diplomas</li>
    <li>• Institution and graduation date</li>
  </ul>
</FeatureCard>

// With description (compact card)
<FeatureCard 
  variant="success" 
  icon={Award} 
  title="Certifications"
  description="Professional certifications with expiry tracking"
  centered
/>
```

---

## FeatureCardGrid Component

Wrapper for consistent grid layouts of FeatureCards.

### Props

```tsx
interface FeatureCardGridProps {
  columns?: 2 | 3 | 4;   // Number of columns on md+ screens
  children: ReactNode;    // FeatureCard children
  className?: string;     // Additional CSS classes
}
```

### Usage

```tsx
<FeatureCardGrid columns={3}>
  <FeatureCard variant="primary" ... />
  <FeatureCard variant="success" ... />
  <FeatureCard variant="purple" ... />
</FeatureCardGrid>
```

---

## StatusBadge Components

Use StatusBadges for confidence levels, feasibility indicators, and status displays.

### Variants

| Variant | Use Case | Color |
|---------|----------|-------|
| `high` | High confidence, success | Emerald |
| `medium` | Medium, caution | Amber |
| `low` | Low, pending | Gray |
| `critical` | Critical, errors | Red |
| `info` | Informational | Blue |

### Usage

```tsx
<StatusBadge variant="high">High Confidence</StatusBadge>
<StatusBadge variant="medium">Medium</StatusBadge>
```

---

## Color Semantic Reference

Colors have consistent meaning across all components:

| Color | Callout Use | FeatureCard Use | StatusBadge Use |
|-------|-------------|-----------------|-----------------|
| **Blue** | Info, Industry | Primary features | Informational |
| **Emerald/Green** | Tip, Success | Approvals, certifications | High confidence |
| **Amber** | Warning, Prerequisite | Cautions, pending | Medium confidence |
| **Red** | Critical, Compliance, Security | — | Critical |
| **Purple** | Note | Licenses, real-time | — |
| **Violet** | Integration | — | — |
| **Orange** | — | Time-related, memberships | — |
| **Teal** | — | Info, controlled access | — |
| **Indigo** | Future/Roadmap | — | — |

---

## Usage Guidelines

### When to Use Callout
- Tips and best practices
- Warnings and cautions
- Important information blocks
- Prerequisites before actions
- Compliance and regulatory notes
- Security warnings
- Cross-module integrations
- Future roadmap items

### When to Use FeatureCard
- Feature category grids (2-4 columns)
- Service/capability overviews
- Category listings with icons
- Module component summaries
- Quick reference cards

### When to Use StatusBadge
- Confidence levels (AI predictions)
- Feasibility indicators
- Implementation status
- Priority levels

---

## Migration Guide

When updating existing manual files to use the design system:

### Replace Alert Components

**Before:**
```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

<Alert className="border-primary/20 bg-primary/5">
  <Info className="h-4 w-4" />
  <AlertTitle>Important</AlertTitle>
  <AlertDescription>Some information here.</AlertDescription>
</Alert>
```

**After:**
```tsx
import { InfoCallout } from '@/components/enablement/manual/components';

<InfoCallout title="Important">
  Some information here.
</InfoCallout>
```

### Replace Inline Colored Boxes

**Before:**
```tsx
<div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
  <Icon className="h-6 w-6 text-blue-600 mb-2" />
  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Title</h4>
  <p className="text-sm text-blue-700 dark:text-blue-300">Description</p>
</div>
```

**After:**
```tsx
import { FeatureCard } from '@/components/enablement/manual/components';

<FeatureCard variant="primary" icon={Icon} title="Title" description="Description" />
```

---

## Best Practices

1. **Use semantic variants** - Match the variant to the content's meaning, not just for visual variety
2. **Consistent grids** - Use FeatureCardGrid for all card layouts
3. **Keep content concise** - Callouts should be brief; detailed content goes in regular sections
4. **Avoid nesting** - Don't nest Callouts or FeatureCards inside each other
5. **Dark mode** - All components support dark mode automatically

---

## Visual Reference

For a live visual reference of all components, see:
`src/components/enablement/manual/components/DesignSystemGuide.tsx`

This component can be rendered to see all variants and their appearances in both light and dark modes.
