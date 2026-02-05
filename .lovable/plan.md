
# Plan: Convert Administrator Manuals to Streamed Content

## Problem Summary

The build process exhausts memory (OOM at ~3GB) because Rollup must analyze 600+ deeply nested manual components at build time, even though they're lazy-loaded. The L&D Manual alone has 100+ sub-components across 10 chapters.

## Solution: Content Streaming Architecture

Move manual content from React components to **runtime-loaded markdown** stored in the database or as static files. The build no longer needs to process this content—it's fetched at runtime.

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                     CURRENT ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│  Build Time                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Vite/Rollup transforms ALL 600+ manual components        │   │
│  │ even though they're lazy-loaded (analyzes full graph)    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↓ OOM at 3GB                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     NEW ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│  Build Time                      Runtime                        │
│  ┌─────────────────────┐         ┌─────────────────────────┐   │
│  │ Thin viewer shell   │         │ Fetch markdown content  │   │
│  │ (~5 components)     │────────>│ from database/CDN       │   │
│  └─────────────────────┘         └─────────────────────────┘   │
│          ↓                                ↓                     │
│     Builds in <1GB                 Renders via react-markdown   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Database Schema for Manual Content

Create a `manual_content` table to store markdown content:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `manual_id` | text | e.g., "learning-development" |
| `section_id` | text | e.g., "sec-4-1" |
| `chapter_id` | text | e.g., "chapter-4" |
| `title` | text | Section title |
| `content_markdown` | text | Full markdown content |
| `read_time_minutes` | integer | Estimated read time |
| `target_roles` | jsonb | Array of applicable personas |
| `order_index` | integer | Display order |
| `updated_at` | timestamptz | Last update |

### Phase 2: Content Migration Edge Function

Create an edge function to convert existing React component content to markdown:

1. Extract text content from each manual section
2. Convert JSX structures to markdown equivalents
3. Store in `manual_content` table
4. Preserve section IDs for navigation continuity

### Phase 3: Universal Manual Viewer Component

Replace all 11 individual manual pages with a single `UniversalManualViewer`:

```text
src/components/enablement/manuals/
├── UniversalManualViewer.tsx    # Main viewer (fetches content at runtime)
├── ManualSectionRenderer.tsx    # Renders markdown via react-markdown
├── ManualTableOfContents.tsx    # TOC sidebar (already exists pattern)
└── ManualSearch.tsx             # Search within loaded content
```

Key features:
- Fetches section list on mount (lightweight metadata query)
- Streams individual section content on-demand
- Uses `react-markdown` (already installed) for rendering
- Preserves existing navigation, progress tracking, and print features

### Phase 4: Route Simplification

Before (11 separate page imports):
```typescript
const LearningDevelopmentManualPage = lazy(() => import("..."));
const SuccessionManualPage = lazy(() => import("..."));
// ... 9 more
```

After (1 universal viewer):
```typescript
const ManualViewerPage = lazy(() => import("@/pages/enablement/ManualViewerPage"));

// Route: /enablement/manuals/:manualId
```

### Phase 5: Content Seeding

Options for initial content population:
1. **Automated extraction**: Parse existing TSX files server-side to extract content
2. **Manual migration**: Export each section's content to markdown files, then bulk import
3. **Hybrid**: Keep current components temporarily, run extraction in background

---

## Technical Details

### Markdown Rendering

Use the already-installed `react-markdown` package with:
- Custom components for callouts (Info, Warning, Tip)
- Code syntax highlighting
- Table support
- Anchor links for cross-references

### Caching Strategy

- **Section metadata**: Cache for 5 minutes (lightweight, frequently accessed)
- **Section content**: Cache for 1 hour (larger, less frequently changing)
- **Invalidation**: On publish from Release Command Center

### Search Implementation

- Query `manual_content` with full-text search
- Highlight matching terms in results
- Jump to specific sections

---

## Impact Assessment

| Metric | Before | After |
|--------|--------|-------|
| Build memory | ~3.5GB (OOM) | ~1GB |
| Manual components in bundle | 600+ | ~10 |
| Content update process | Code change + deploy | Database update |
| Build time | ~45s (when it works) | ~15s |

---

## Migration Progress

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | Database schema + viewer shell | ✅ Complete |
| **Phase 2** | L&D Manual migration (largest) | ✅ Complete |
| **Phase 3** | Remaining 10 manuals (admin-security, appraisals, benefits, career-development, compensation, feedback-360, goals, hr-hub, succession, time-attendance, workforce) | ✅ Complete |
| **Phase 4** | Remove old component files | ✅ Complete |

### Completed Work - All 11 Manuals Migrated ✅

1. ✅ Created `manual_content` table with full-text search
2. ✅ Built `UniversalManualViewer` component (thin shell, ~100 lines)
3. ✅ Built `ManualSectionRenderer` (markdown to React via react-markdown)
4. ✅ Built `ManualTableOfContents` (sidebar navigation)
5. ✅ Created `useManualContent` hook (data fetching with caching)
6. ✅ Added `/enablement/manual/:manualId` dynamic route
7. ✅ Deployed `migrate-manual-content` edge function
8. ✅ Migrated Learning Development Manual (13 sections)
9. ✅ Migrated 10 remaining manuals in alphabetical order
10. ✅ Updated all 11 legacy routes to redirect to streaming viewer
11. ✅ Removed all legacy manual component imports from routes

### Phase 4 Cleanup Complete ✅

1. ✅ Deleted 11 legacy manual page files from src/pages/enablement/
2. ✅ Deleted 8 legacy manual component folders from src/components/enablement/
3. ✅ Removed lazy imports from src/routes/lazyPages.ts
4. ✅ Fixed useContentCurrencyValidation.ts references
5. ✅ Deleted 10 large manual type files from src/types/ (~10,000+ lines total):
   - adminManual.ts, adminSecurityManual.ts, benefitsManual.ts
   - careerDevelopmentManual.ts, feedback360Manual.ts, hrHubManual.ts
   - learningDevelopmentManual.ts, successionManual.ts
   - timeAttendanceManual.ts, workforceManual.ts
6. ✅ Deleted unused ImportStaticManualDialog.tsx
7. ✅ Deleted unused appraisalsManualDocx.ts utility

### Expected Build Improvement

With the removal of:
- 11 page components (each importing 50-100 nested components)
- 8 component directories (600+ total components)
- 10 large type files (~10,000+ lines of data structures)
- 2 unused utility/dialog files

The module count should drop significantly, reducing build memory from ~3.5GB to ~1GB.

---

## Rollback Plan

Keep existing component files in a `legacy-manuals/` folder during migration. If issues arise, routes can be switched back to the component-based pages.

---

## Alternative: Static JSON Bundles

If database storage is undesirable, content can be stored as static JSON files in `public/manuals/`:

```text
public/manuals/
├── learning-development/
│   ├── index.json          # TOC and metadata
│   ├── chapter-1.json      # Chapter content
│   ├── chapter-2.json
│   └── ...
└── succession/
    └── ...
```

This removes content from the Vite module graph while keeping it version-controlled.

---

## Approval Required

This plan requires:
1. Creating new database table (`manual_content`)
2. Creating content migration edge function
3. Building the `UniversalManualViewer` component
4. Migrating content from 11 manuals
5. Removing 600+ component files after verification

Shall I proceed with implementation?
