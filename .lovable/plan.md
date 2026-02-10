

# Fix TOC Text Wrapping and Rename "Learning & LMS" to "Learning & Development"

## Two Issues

### 1. TOC Text Wrapping
The `truncate` CSS class on line 79 of `TableOfContents.tsx` clips long titles (like "Continuous Performance (60+)") instead of wrapping them. The flex container also uses `items-center` which misaligns the chevron icon when text wraps.

**Fix in `TableOfContents.tsx`:**
- Line 53: Change `items-center` to `items-start` so chevron/icon aligns to the top of multi-line text
- Line 79: Remove `truncate` class so text wraps naturally

### 2. Rename "Learning & LMS" to "Learning & Development"
The component title already says "Learning & Development" but 7 other files still reference "Learning & LMS".

**Files to update (simple find-and-replace in each):**

| File | Change |
|------|--------|
| `TableOfContents.tsx` | "Learning & LMS (140+)" to "Learning & Development (140+)" |
| `ProductCapabilitiesDocument.tsx` | "Learning & LMS (140+)" to "Learning & Development (140+)" in Act 4 divider modules |
| `productCapabilitiesContent.ts` | Two occurrences: module name and Act 4 module list |
| `PlatformAtGlance.tsx` | Act 4 module list entry |
| `ModuleDependencyAnalysis.tsx` | Module name reference |
| `CareerDevelopmentCapabilities.tsx` | Integration reference |
| `PrintableIntegrationDiagram.tsx` | Module name entry |

## What Does Not Change
- `LearningCapabilities.tsx` -- already says "Learning & Development"
- No structural or content changes beyond the rename and CSS fix
