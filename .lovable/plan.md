
# Content Creation Studio UI Reorganization

## Problem Analysis

The current UI has several UX issues that create confusion:

| Issue | Current State | Impact |
|-------|---------------|--------|
| **Horizontal Isolation** | Left (Chat) and Right (Context/Gaps) panels are visually disconnected | User doesn't understand the relationship between scope selection and actions |
| **Duplicate Gap Display** | Gaps shown both inline in chat AND in separate GapSummaryCard AND in expandable GapAnalysisPanel | Overwhelming information redundancy |
| **Scattered Quick Actions** | Quick actions in chat area; analyze button in context panel | Unclear where to start |
| **Context Toggle Hidden** | Module/Manual toggle is small and easy to miss | Key workflow switcher is de-emphasized |
| **Three Right-Panel Cards** | Context, Documentation Gaps, Details are stacked separately | Visual clutter without hierarchy |

## Proposed Architecture: Unified Top-to-Bottom Flow

The new design follows a **vertical, progressive workflow**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (existing)                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SCOPE BAR (NEW - Prominent Context Selector)                       │   │
│  │  ┌────────────────────────────────────┐  ┌───────────────────────┐  │   │
│  │  │ [Module ▾] [Manual ▾] Toggle       │  │ Coverage: 6% ━━━━━━━  │  │   │
│  │  │ All modules / Goals Manual         │  │ 220 gaps to address   │  │   │
│  │  └────────────────────────────────────┘  └───────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │  AGENT WORKSPACE (Primary)      │  │  OUTPUT PANEL                   │  │
│  │  ┌────────────────────────────┐ │  │  ┌───────────────────────────┐  │  │
│  │  │ Chat Messages (scrollable) │ │  │  │ Preview / Generated       │  │  │
│  │  │                            │ │  │  │ Content                   │  │  │
│  │  │                            │ │  │  │                           │  │  │
│  │  │                            │ │  │  └───────────────────────────┘  │  │
│  │  └────────────────────────────┘ │  │  ┌───────────────────────────┐  │  │
│  │  ┌────────────────────────────┐ │  │  │ Gap Analysis (Collapsible)│  │  │
│  │  │ Quick Actions Grid         │ │  │  │ [tabs for gap types]      │  │  │
│  │  │ (contextual to scope)      │ │  │  └───────────────────────────┘  │  │
│  │  └────────────────────────────┘ │  └─────────────────────────────────┘  │
│  │  ┌────────────────────────────┐ │                                       │
│  │  │ Input Area                 │ │                                       │
│  │  └────────────────────────────┘ │                                       │
│  └─────────────────────────────────┘                                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ARTIFACTS TRAY (existing - collapsible bottom)                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Part 1: Create New Scope Bar Component

**New File**: `src/components/enablement/ContentCreationScopeBar.tsx`

A prominent horizontal bar at the top that combines:
- **Context Mode Toggle** (Module/Manual) - larger, more visible
- **Cascading Selectors** - Module→Feature OR Manual→Chapter→Section
- **Coverage Summary** - inline progress indicator
- **Primary Action Button** - "Analyze" that respects current scope

```typescript
interface ContentCreationScopeBarProps {
  contextMode: ContextMode;
  onContextModeChange: (mode: ContextMode) => void;
  // Module mode props
  modules: ApplicationModule[];
  features: ApplicationFeature[];
  selectedModule: string;
  selectedFeature: string;
  onModuleChange: (code: string) => void;
  onFeatureChange: (code: string) => void;
  // Manual mode props
  manuals: ManualDefinition[];
  chapters: ChapterInfo[];
  sectionsForChapter: ManualSection[];
  selectedManualId: string;
  selectedChapter: string;
  selectedSectionId: string;
  onManualChange: (id: string) => void;
  onChapterChange: (num: string) => void;
  onSectionChange: (id: string) => void;
  onInitializeSections?: () => void;
  isInitializing?: boolean;
  // Coverage/Analysis
  analysis: ContextAnalysis | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}
```

**Visual Design**:
- Full-width bar with subtle background (`bg-muted/30 border-b`)
- Left side: Mode toggle + cascading selectors (horizontal layout)
- Right side: Coverage indicator + Analyze button
- Compact but prominent (64px height)

---

### Part 2: Refactor Agent Chat Card

**File**: `src/components/enablement/ContentCreationAgentChat.tsx`

**Changes**:
1. **Remove Gap Analysis Results** from inline chat - move to Output Panel
2. **Simplify Quick Actions** - show only 4 contextual actions based on current scope
3. **Remove AI Suggestions section** - integrate into chat response messages
4. **Add scope-aware placeholders** - e.g., "Generate content for {selected feature}..."

```typescript
// Simplified Quick Actions - contextual to scope
const getContextualQuickActions = (contextMode: ContextMode, hasFeature: boolean, hasSection: boolean) => {
  if (contextMode === 'manual') {
    return [
      { id: 'analyze_context', label: 'Analyze Manual Coverage', icon: BarChart3 },
      { id: 'identify_gaps', label: 'Find Gaps in Manual', icon: Search },
      { id: 'regenerate_section', label: 'Regenerate Section', icon: RefreshCw, disabled: !hasSection },
      { id: 'regenerate_chapter', label: 'Regenerate Chapter', icon: BookOpen, disabled: !hasSection },
    ];
  }
  return [
    { id: 'analyze_context', label: 'Analyze Coverage', icon: BarChart3 },
    { id: 'identify_gaps', label: 'Find Gaps', icon: Search },
    { id: 'generate_manual_section', label: 'Generate Manual', icon: BookOpen, disabled: !hasFeature },
    { id: 'generate_kb_article', label: 'Create KB Article', icon: FileText, disabled: !hasFeature },
  ];
};
```

---

### Part 3: Create New Output Panel Component

**New File**: `src/components/enablement/ContentCreationOutputPanel.tsx`

A unified right panel that organizes:
1. **Preview Tab** - Generated content preview (existing logic)
2. **Gaps Tab** - Gap Analysis results (move from GapAnalysisPanel)
3. **Details Tab** - Readiness score, module breakdown (move from AgentContextPanel)

```typescript
interface ContentCreationOutputPanelProps {
  // Preview
  previewContent: string;
  previewTitle: string;
  onSaveContent?: () => void;
  onCopyContent?: () => void;
  // Gap Analysis
  gapAnalysis: { gaps: GapAnalysis; summary: GapSummary } | null;
  isLoadingGaps: boolean;
  onGenerateForGap: (featureCode: string, type: 'kb' | 'manual' | 'sop') => void;
  onRefreshGaps: (moduleCode?: string) => void;
  modules: ApplicationModule[];
  selectedModule: string;
  onModuleChange: (code: string) => void;
  // Details
  analysis: ContextAnalysis | null;
  onDrillIntoModule: (moduleCode: string) => void;
}
```

**Tab Structure**:
```text
┌────────────────────────────────────────┐
│  [Preview]  [Gaps]  [Details]          │
├────────────────────────────────────────┤
│  <TabContent - full height scrollable> │
│                                        │
│                                        │
└────────────────────────────────────────┘
```

---

### Part 4: Update Page Layout

**File**: `src/pages/enablement/ContentCreationStudioPage.tsx`

**Changes**:
1. **Add Scope Bar** below header, above resizable panels
2. **Remove AgentContextPanel** from right panel (replaced by Scope Bar + Output Panel)
3. **Remove inline GapAnalysisPanel** from below chat
4. **Simplify ResizablePanelGroup** to two panels: Agent Workspace (left) + Output Panel (right)

**New Layout Structure**:
```tsx
<AppLayout>
  <div className="flex flex-col h-[calc(100vh-4rem)]">
    {/* Header - existing */}
    <header>...</header>
    
    {/* NEW: Scope Bar */}
    <ContentCreationScopeBar
      contextMode={tabState.contextMode}
      onContextModeChange={handleContextModeChange}
      // ... all selection props
    />
    
    {/* Main Workspace */}
    <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
      {/* Left: Agent Chat */}
      <ResizablePanel defaultSize={55} minSize={40}>
        <ContentCreationAgentChat
          // ... simplified props
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Right: Output Panel */}
      <ResizablePanel defaultSize={45} minSize={30}>
        <ContentCreationOutputPanel
          // ... unified output props
        />
      </ResizablePanel>
    </ResizablePanelGroup>
    
    {/* Bottom: Artifacts Tray - existing */}
    {generatedArtifacts.length > 0 && <ArtifactsTray ... />}
  </div>
</AppLayout>
```

---

### Part 5: Delete/Deprecate Redundant Components

**Files to Remove or Simplify**:
1. `GapSummaryCard.tsx` - merged into Output Panel's Gaps tab header
2. `GapResultsMessage.tsx` - merged into Output Panel's Gaps tab
3. Simplify `AgentContextPanel.tsx` - most logic moves to Scope Bar and Output Panel

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/enablement/ContentCreationScopeBar.tsx` | **Create** | New prominent scope selector bar |
| `src/components/enablement/ContentCreationOutputPanel.tsx` | **Create** | Unified tabbed output panel |
| `src/components/enablement/ContentCreationAgentChat.tsx` | **Modify** | Simplify, remove gap inline display, contextual actions |
| `src/pages/enablement/ContentCreationStudioPage.tsx` | **Modify** | New layout structure with scope bar |
| `src/components/enablement/AgentContextPanel.tsx` | **Modify** | Significantly reduce scope, may become helper only |
| `src/components/enablement/GapSummaryCard.tsx` | **Deprecate** | Merged into Output Panel |

---

## Expected User Workflow

**Before (Confusing)**:
1. User lands on page → sees complex UI with scattered information
2. Unsure where to start → multiple "Analyze" buttons in different places
3. Selects module on right → runs analysis → gaps shown in 3 different places
4. Generates content → preview buried in right panel

**After (Intuitive)**:
1. User lands on page → sees **clear horizontal scope bar** at top
2. Selects scope first (Module or Manual) → **coverage instantly visible**
3. Clicks single "Analyze" button → results appear in **dedicated Gaps tab** on right
4. Uses **contextual quick actions** in chat based on scope
5. Generated content appears in **Preview tab** with clear save/copy actions

---

## Visual Hierarchy

```text
IMPORTANCE FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIGH    →  SCOPE BAR (what are we working on?)
         ↓
MEDIUM  →  CHAT (how do we interact with the agent?)
         ↓
MEDIUM  →  OUTPUT (what did we generate? what gaps exist?)
         ↓
LOW     →  ARTIFACTS TRAY (what did we save?)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

This follows the industry-standard **"Context → Action → Result"** pattern used by documentation tools like Notion AI, Confluence editors, and enterprise content management systems.
