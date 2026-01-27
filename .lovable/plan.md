
# Content Creation Studio Enhancement: Chapter/Section Selection with Diff Preview

## Overview

This enhancement adds two key capabilities to the Content Creation Studio:

1. **Hierarchical Manual Navigation**: Manual → Chapter → Section dropdowns to select existing documentation for updates
2. **Diff Preview**: See AI-generated changes side-by-side with existing content before applying

These features enable a "review-before-apply" workflow that gives you control over what gets updated in your documentation.

---

## New User Workflow

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. SELECT CONTENT                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Manual        ▼ │  │ Chapter       ▼ │  │ Section       ▼ │              │
│  │ 360 Feedback    │  │ 2. Setup        │  │ 2.1 Config      │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                              │
│  Selected: Section 2.1 - "System Configuration"                             │
│  Last Generated: Jan 15, 2025 • Version 1.2.0                               │
│                                                                              │
│  [Preview Changes]  [Regenerate Section]  [Regenerate Chapter]              │
├──────────────────────────────────────────────────────────────────────────────┤
│  2. REVIEW CHANGES (appears after clicking "Preview Changes")                │
│  ┌──────────────────────────────┬──────────────────────────────┐            │
│  │ Current Version (v1.2.0)    │ Proposed Changes             │            │
│  ├──────────────────────────────┼──────────────────────────────┤            │
│  │ ## Overview                  │ ## Overview                  │            │
│  │ This section covers...       │ This section covers...       │            │
│  │ - Step one                   │ + Step one (with details)    │            │
│  │ - Step two                   │ - Step two (removed)         │            │
│  │                              │ + New step three             │            │
│  └──────────────────────────────┴──────────────────────────────┘            │
│                                                                              │
│  +12 additions  -3 deletions  85 unchanged                                  │
│                                                                              │
│  [Cancel]  [Apply Changes]  [Apply & Publish to KB]                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Phase 1: Manual Content Selector Component

**New file: `src/components/enablement/ManualContentSelector.tsx`**

A collapsible card component with three cascading dropdowns:

| Dropdown | Data Source | Behavior |
|----------|-------------|----------|
| **Manual** | `manual_definitions` table | Loads all available manuals |
| **Chapter** | Extracted from `manual_sections` | Filters to top-level sections (e.g., "1", "2", "3") |
| **Section** | `manual_sections` filtered by chapter | Shows child sections (e.g., "1.1", "1.2") |

Features:
- Displays section metadata (last generated date, version, word count)
- Shows "needs regeneration" badge if section is stale
- Action buttons: Preview Changes, Regenerate Section, Regenerate Chapter

---

### Phase 2: Diff Preview Dialog

**New file: `src/components/enablement/ContentDiffPreview.tsx`**

A dialog that shows the proposed changes before applying them:

```typescript
interface ContentDiffPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  sectionNumber: string;
  currentContent: string;      // Existing markdown
  proposedContent: string;     // AI-generated markdown
  onApply: () => void;         // Apply changes to DB
  onApplyAndPublish: () => void; // Apply + publish to KB
  isApplying: boolean;
}
```

Uses the existing `ContentDiffViewer` component with:
- Side-by-side, inline, and unified view modes
- Statistics (additions, deletions, unchanged)
- Copy diff button

---

### Phase 3: Hook for Preview Generation

**New file: `src/hooks/useManualSectionPreview.ts`**

```typescript
interface ManualSectionPreviewState {
  // Selection state
  selectedManualId: string | null;
  selectedChapter: string | null;
  selectedSectionId: string | null;
  
  // Data
  manuals: ManualDefinition[];
  sections: ManualSection[];
  chapters: ChapterInfo[];
  currentSectionContent: string | null;
  
  // Preview state
  isGeneratingPreview: boolean;
  proposedContent: string | null;
  previewError: string | null;
  
  // Actions
  setSelectedManualId: (id: string | null) => void;
  setSelectedChapter: (chapterNumber: string | null) => void;
  setSelectedSectionId: (id: string | null) => void;
  generatePreview: () => Promise<void>;
  applyChanges: () => Promise<void>;
  clearPreview: () => void;
}
```

This hook:
1. Fetches manuals and sections from the database
2. Extracts chapters using `extractChapters()` from `useChapterGeneration.ts`
3. Calls a new "preview" mode of the content-creation-agent that generates content without saving
4. Stores both current and proposed content for diff display

---

### Phase 4: Edge Function Enhancement

**Modified file: `supabase/functions/content-creation-agent/index.ts`**

Add a new action `preview_section_regeneration`:

```typescript
case 'preview_section_regeneration': {
  const { sectionId, customInstructions } = params;
  
  // 1. Fetch current section content
  const currentContent = await fetchSectionContent(sectionId);
  
  // 2. Generate new content (same as generate_manual_section)
  const proposedContent = await generateContent(sectionId, customInstructions);
  
  // 3. Return BOTH without saving
  return {
    success: true,
    currentContent: convertToMarkdown(currentContent),
    proposedContent: convertToMarkdown(proposedContent),
    sectionInfo: {
      sectionNumber,
      title,
      lastGeneratedAt,
      currentVersion
    }
  };
}
```

This allows previewing changes without committing them to the database.

---

### Phase 5: UI Integration

**Modified file: `src/components/enablement/AgentContextPanel.tsx`**

Add a new collapsible section "Manual Content" below the existing Context card:

```tsx
<Collapsible>
  <CollapsibleTrigger>
    <CardTitle>Manual Content</CardTitle>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <ManualContentSelector
      manuals={manuals}
      chapters={chapters}
      sections={filteredSections}
      selectedManualId={selectedManualId}
      selectedChapter={selectedChapter}
      selectedSectionId={selectedSectionId}
      onManualChange={handleManualChange}
      onChapterChange={handleChapterChange}
      onSectionChange={handleSectionChange}
      onPreviewChanges={handlePreviewChanges}
      onRegenerateSection={handleRegenerateSection}
      onRegenerateChapter={handleRegenerateChapter}
      isLoading={isGeneratingPreview}
    />
  </CollapsibleContent>
</Collapsible>
```

**Modified file: `src/pages/enablement/ContentCreationStudioPage.tsx`**

Add state and handlers:
- Import and use `useManualSectionPreview` hook
- Add state for manual/chapter/section selection
- Add handlers for preview/apply actions
- Render `ContentDiffPreview` dialog when preview is active

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/enablement/ManualContentSelector.tsx` | CREATE | Manual/Chapter/Section dropdowns |
| `src/components/enablement/ContentDiffPreview.tsx` | CREATE | Diff preview dialog with apply buttons |
| `src/hooks/useManualSectionPreview.ts` | CREATE | State management for preview workflow |
| `src/components/enablement/AgentContextPanel.tsx` | MODIFY | Add ManualContentSelector section |
| `src/pages/enablement/ContentCreationStudioPage.tsx` | MODIFY | Integrate preview state and dialog |
| `supabase/functions/content-creation-agent/index.ts` | MODIFY | Add `preview_section_regeneration` action |

---

## Reused Components

| Component | From | Usage |
|-----------|------|-------|
| `ContentDiffViewer` | `src/components/kb/ContentDiffViewer.tsx` | Side-by-side diff display |
| `extractChapters` | `src/hooks/useChapterGeneration.ts` | Chapter extraction from sections |
| `useManualDefinitions` | `src/hooks/useManualGeneration.ts` | Fetch manual list |
| `useManualSections` | `src/hooks/useManualGeneration.ts` | Fetch sections for a manual |

---

## Data Flow

```text
User selects Manual
       ↓
Hook fetches sections (useManualSections)
       ↓
extractChapters() groups sections into chapters
       ↓
User selects Chapter
       ↓
Hook filters sections by chapter number
       ↓
User selects Section
       ↓
Section metadata displayed (last generated, version, etc.)
       ↓
User clicks "Preview Changes"
       ↓
Edge function generates preview (no DB save)
       ↓
ContentDiffPreview dialog opens with side-by-side view
       ↓
User reviews changes
       ↓
User clicks "Apply" → Updates section in DB
User clicks "Apply & Publish" → Updates section + publishes to KB
```

---

## State Persistence

Tab state will persist the selection across tab switches:

```typescript
const [tabState, setTabState] = useTabState({
  defaultState: {
    selectedModule: "",
    selectedFeature: "",
    // New manual navigation state
    selectedManualId: "",
    selectedChapter: "",
    selectedSectionId: "",
    artifactsExpanded: true,
  },
  syncToUrl: ["selectedModule", "selectedManualId", "selectedChapter"],
});
```

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Control** | Review AI-generated changes before applying |
| **Context** | See exactly what changed with side-by-side diff |
| **Safety** | No accidental overwrites - explicit apply action required |
| **Efficiency** | Direct navigation to any section in any manual |
| **Auditability** | Version history preserved with each apply |
