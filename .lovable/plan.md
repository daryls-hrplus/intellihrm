
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
| **Phase 2** | L&D Manual migration (largest) | ✅ Complete (13 sections) |
| **Phase 3** | Remaining 10 manuals | 🔄 Next |
| **Phase 4** | Remove old component files | Pending |

### Completed Work

1. ✅ Created `manual_content` table with full-text search
2. ✅ Built `UniversalManualViewer` component (thin shell)
3. ✅ Built `ManualSectionRenderer` (markdown to React)
4. ✅ Built `ManualTableOfContents` (sidebar navigation)
5. ✅ Created `useManualContent` hook (data fetching with caching)
6. ✅ Added `/enablement/manual/:manualId` route
7. ✅ Deployed `migrate-manual-content` edge function
8. ✅ Migrated L&D Manual content (13 sections from Chapters 1, 2, 4)
9. ✅ Added redirect from legacy route to streaming viewer
10. ✅ Removed L&D manual lazy import from routes

### Migrated Sections (L&D Manual)

| Section ID | Title |
|------------|-------|
| sec-1-1 | 1.1 Introduction to Learning & Development |
| sec-1-2 | 1.2 Core Concepts & Terminology |
| sec-2-3 | 2.3 Course Creation & Structure |
| sec-4-2 | 4.2 Enrollment Management |
| sec-4-21 | 4.3 Training Request by Gap Analysis |
| sec-4-22 | 4.4 Request via Appraisal |
| sec-4-23 | 4.6 Onboarding Requests |
| sec-4-24 | 4.7 HR-Initiated Requests |
| sec-4-25 | 4.8 Training Invitations |
| sec-4-3 | 4.9 Progress Tracking |
| sec-4-28 | 4.16 Session Management & Scheduling |
| sec-4-30 | 4.18 Waitlist Management |
| sec-4-19 | 4.19 Training History & Transcript |

### Next Steps

To continue migrating remaining manuals:
1. Repeat content extraction for each manual (Appraisals, Workforce, etc.)
2. Use same SQL INSERT pattern to populate `manual_content`
3. Update routes to redirect to streaming viewer
4. Remove legacy component imports after verification

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
