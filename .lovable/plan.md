
# Fix Gap Analysis Color Contrast - Semantic Color Compliance

## Problem

The Gap Analysis panels have severe readability issues due to incorrect color usage:

| Component | Current State | Issue |
|-----------|---------------|-------|
| Summary cards (Undocumented, Missing KB, etc.) | Solid red/orange/blue/purple backgrounds with small dark numbers | Text is nearly invisible |
| Orphaned warning banner | Yellow background with dark text | Hard to read |
| Category badges | Using arbitrary color classes | Inconsistent with HRMS semantic standards |

## Solution

Apply the HRMS semantic color tokens defined in `src/index.css` which provide proper contrast:

```css
/* Semantic Background Colors (lighter for badges/pills) */
--semantic-error-bg: 0 84% 97%;        /* Light red */
--semantic-warning-bg: 38 92% 95%;     /* Light amber */
--semantic-info-bg: 199 89% 96%;       /* Light blue */
--semantic-neutral-bg: 210 20% 96%;    /* Light grey */

/* Semantic Text Colors (darker for readability) */
--semantic-error-text: 0 72% 40%;      /* Dark red - readable */
--semantic-warning-text: 38 80% 30%;   /* Dark amber - readable */
--semantic-info-text: 199 89% 35%;     /* Dark blue - readable */
--semantic-neutral-text: 210 16% 40%;  /* Dark grey - readable */
```

### Color Mapping for Gap Categories

| Category | Semantic Meaning | Background Token | Text Token |
|----------|------------------|------------------|------------|
| Undocumented | Error - Critical gap | `semantic-error-bg` | `semantic-error-text` |
| Missing KB | Warning - Needs attention | `semantic-warning-bg` | `semantic-warning-text` |
| No Quick Start | Info - Reference/guidance | `semantic-info-bg` | `semantic-info-text` |
| Missing SOP | Neutral - Pending action | `semantic-neutral-bg` | `semantic-neutral-text` |
| Orphaned | Warning - Needs attention | `semantic-warning-bg` | `semantic-warning-text` |

---

## Files to Modify

### 1. `src/components/enablement/GapResultsMessage.tsx`

**Current (lines 35-64):**
```typescript
const categories = [
  {
    label: "Undocumented",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-600 dark:text-red-400",
  },
  // ... hardcoded Tailwind colors
];
```

**Updated:**
```typescript
const categories = [
  {
    label: "Undocumented",
    // Semantic error - critical gaps
    bgClass: "bg-[hsl(var(--semantic-error-bg))]",
    textClass: "text-[hsl(var(--semantic-error-text))]",
  },
  {
    label: "Missing KB",
    // Semantic warning - needs attention
    bgClass: "bg-[hsl(var(--semantic-warning-bg))]",
    textClass: "text-[hsl(var(--semantic-warning-text))]",
  },
  {
    label: "No Quick Start",
    // Semantic info - guidance
    bgClass: "bg-[hsl(var(--semantic-info-bg))]",
    textClass: "text-[hsl(var(--semantic-info-text))]",
  },
  {
    label: "Missing SOP",
    // Semantic neutral - pending
    bgClass: "bg-[hsl(var(--semantic-neutral-bg))]",
    textClass: "text-[hsl(var(--semantic-neutral-text))]",
  },
];
```

**Also update orphaned warning (lines 102-109):**
```typescript
<div className="flex items-center gap-2 p-2 rounded-lg 
  bg-[hsl(var(--semantic-warning-bg))] 
  border border-[hsl(var(--semantic-warning-border))]">
  <AlertTriangle className="h-4 w-4 text-[hsl(var(--semantic-warning-text))] flex-shrink-0" />
  <span className="text-xs text-[hsl(var(--semantic-warning-text))]">
    {summary.orphanedDocumentation} orphaned section(s)...
  </span>
</div>
```

---

### 2. `src/components/enablement/GapAnalysisPanel.tsx`

**Update categories array (lines 187-223):**
```typescript
const categories = [
  {
    id: "undocumented",
    label: "Undocumented",
    count: summary?.undocumentedFeatures || 0,
    icon: FileX,
    // Use semantic error tokens
    iconColor: "text-[hsl(var(--semantic-error-text))]",
    badgeBg: "bg-[hsl(var(--semantic-error-bg))]",
  },
  {
    id: "noKB",
    label: "Missing KB",
    count: summary?.missingKBArticles || 0,
    icon: FileQuestion,
    // Use semantic warning tokens
    iconColor: "text-[hsl(var(--semantic-warning-text))]",
  },
  {
    id: "noQuickStart",
    label: "No Quick Start",
    count: summary?.missingQuickStarts || 0,
    icon: Rocket,
    // Use semantic info tokens
    iconColor: "text-[hsl(var(--semantic-info-text))]",
  },
  {
    id: "noSOP",
    label: "Missing SOP",
    count: summary?.missingSOPs || 0,
    icon: ClipboardList,
    // Use semantic neutral tokens
    iconColor: "text-[hsl(var(--semantic-neutral-text))]",
  },
  {
    id: "orphaned",
    label: "Orphaned",
    count: summary?.orphanedDocumentation || 0,
    icon: AlertTriangle,
    // Use semantic warning tokens
    iconColor: "text-[hsl(var(--semantic-warning-text))]",
  },
];
```

---

### 3. `src/components/enablement/GapSummaryCard.tsx`

**Update the card styling (line 71) and category badges:**

**Current:**
```typescript
<Card className="border-yellow-500/20 bg-yellow-500/5">
```

**Updated:**
```typescript
<Card className="border-[hsl(var(--semantic-warning-border))] bg-[hsl(var(--semantic-warning-bg))]">
```

**Update the header icon (line 74):**
```typescript
<AlertCircle className="h-4 w-4 text-[hsl(var(--semantic-warning-text))]" />
```

---

## Visual Result (Expected)

After fix:
- **Undocumented**: Light red background (#FEF2F2) with dark red text (#991B1B) - high contrast
- **Missing KB**: Light amber background (#FFFBEB) with dark amber text (#92400E) - readable
- **No Quick Start**: Light blue background (#EFF6FF) with dark blue text (#1E40AF) - clear
- **Missing SOP**: Light grey background (#F3F4F6) with dark grey text (#374151) - visible
- **Orphaned warning**: Light amber with dark amber text and amber border

All text will be clearly readable against their backgrounds with proper WCAG contrast ratios.

---

## Technical Notes

- Using CSS custom property syntax: `hsl(var(--semantic-*))` ensures consistency
- Dark mode will need corresponding tokens if not already defined
- Border colors use `--semantic-*-border` tokens for cohesive look
