
# Redesign Documentation Agent UX - Enhanced Gap Analysis

## Problem Summary

The current Documentation Agent has significant UX issues:

| Issue | Current State | Impact |
|-------|---------------|--------|
| **Toast-only feedback** | "Found 834 gaps" shows as toast, data is lost | User can't see or act on specific gaps |
| **No gap breakdown** | Data returned by API but not displayed | User doesn't know WHERE gaps are |
| **No action options** | Only a number shown | No way to fix gaps from the interface |
| **No quality checks** | Agent doesn't validate content quality | Placeholders and missing screenshots go undetected |
| **Context not visible** | Module/feature selection is sidebar, not integrated | Disconnected experience |

---

## Solution: Enhanced Agent Dashboard with Gap Explorer

Replace the simple toast notification with an interactive Gap Analysis panel that shows detailed breakdown and provides inline actions.

---

## UI Redesign Overview

### Current Layout (Problems)
```text
+------------------------+-------------------+
| Documentation Agent    | Context Panel     |
| - Quick Actions grid   | - Module selector |
| - Empty chat area      | - Manual selector |
| - (Gaps show as toast) | - Coverage stats  |
+------------------------+-------------------+
```

### Proposed Layout (Solution)
```text
+------------------------+-------------------+
| Documentation Agent    | Context Panel     |
| - Quick Actions (top)  | - Context selectors|
| - Analysis Results     | - Manual Content   |
|   (expandable panels)  | - Coverage + Gaps  |
|   * Gap Categories     |   MERGED PANEL     |
|   * Actionable Items   |                   |
| - Chat (bottom)        |                   |
+------------------------+-------------------+
```

---

## Detailed Component Changes

### 1. New `GapAnalysisPanel` Component

Create a new component that displays gap analysis results with actionable items.

**File: `src/components/enablement/GapAnalysisPanel.tsx`**

```typescript
interface GapAnalysisPanelProps {
  gaps: GapAnalysis | null;
  summary: GapSummary | null;
  isLoading: boolean;
  onGenerateForFeature: (featureCode: string, type: 'kb' | 'manual' | 'sop') => void;
  onDismissGap: (featureCode: string) => void;
  onRefresh: () => void;
}
```

**UI Structure:**
- **Summary Header**: "Gap Analysis: X total issues"
- **Category Tabs**:
  - Undocumented (X)
  - Missing KB Articles (X)
  - Missing Quick Starts (X)
  - Missing SOPs (X)
  - Orphaned Docs (X)
- **Per-Category List**:
  - Feature name + module badge
  - Action buttons: Generate, Mark N/A, View Feature
- **Bulk Actions**: "Generate All" for selected category

### 2. Enhanced Coverage Panel

Merge Coverage stats with Gap summary in `AgentContextPanel`.

**Changes to `AgentContextPanel.tsx`:**
- Add collapsible "Gap Summary" section below Coverage stats
- Show gap counts by category with clickable badges
- Clicking a badge filters the gap list

### 3. Gap Results in Chat Area

When "Find Gaps" is clicked, display results inline in the chat area as a structured message, not just a toast.

**Changes to `ContentCreationAgentChat.tsx`:**
- Add special rendering for `identify_gaps` results
- Show collapsible gap categories with items
- Include inline "Generate" buttons for each gap

### 4. Content Quality Indicators (Future Enhancement)

Add quality checks to the agent that detect:
- Sections with placeholder text (`[Screenshot]`, `TODO`, `TBD`)
- Sections without images
- Sections below readability threshold
- Stale content (not updated in 90+ days)

---

## Component File Changes

### New Files

| File | Purpose |
|------|---------|
| `src/components/enablement/GapAnalysisPanel.tsx` | Displays detailed gap analysis with actions |
| `src/components/enablement/GapCategoryList.tsx` | Renders list of gaps for a specific category |
| `src/components/enablement/GapItemCard.tsx` | Individual gap item with action buttons |

### Modified Files

| File | Changes |
|------|---------|
| `src/components/enablement/ContentCreationAgentChat.tsx` | Add gap results rendering in chat, store `identifyGaps` result in state for display |
| `src/components/enablement/AgentContextPanel.tsx` | Add gap summary section with badge counts linking to detailed view |
| `src/pages/enablement/ContentCreationStudioPage.tsx` | Add state for gap analysis results, wire up generate actions from gap panel |
| `src/hooks/useContentCreationAgent.ts` | Return gap data to caller for display, not just show toast |

---

## Detailed Implementation

### Step 1: Store Gap Analysis Results in State

**File: `src/pages/enablement/ContentCreationStudioPage.tsx`**

Add state to track gap analysis results:

```typescript
const [gapAnalysis, setGapAnalysis] = useState<{
  gaps: GapAnalysis;
  summary: GapSummary;
} | null>(null);
```

Update `handleQuickAction` to capture and store results:

```typescript
case 'identify_gaps':
  const gapResult = await identifyGaps();
  if (gapResult) {
    setGapAnalysis(gapResult);
  }
  break;
```

### Step 2: Create GapAnalysisPanel Component

**File: `src/components/enablement/GapAnalysisPanel.tsx`**

```typescript
export function GapAnalysisPanel({ 
  gaps, 
  summary, 
  isLoading, 
  onGenerateForFeature,
  onRefresh 
}: GapAnalysisPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>('noDocumentation');

  const categories = [
    { id: 'noDocumentation', label: 'Undocumented', count: summary?.undocumentedFeatures || 0, icon: FileX },
    { id: 'noKBArticle', label: 'Missing KB', count: summary?.missingKBArticles || 0, icon: FileQuestion },
    { id: 'noQuickStart', label: 'Missing Quick Start', count: summary?.missingQuickStarts || 0, icon: Rocket },
    { id: 'noSOP', label: 'Missing SOP', count: summary?.missingSOPs || 0, icon: ClipboardList },
    { id: 'orphanedDocumentation', label: 'Orphaned', count: summary?.orphanedDocumentation || 0, icon: AlertTriangle },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Gap Analysis
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(cat => (
            <Badge
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveCategory(cat.id)}
            >
              <cat.icon className="h-3 w-3 mr-1" />
              {cat.label} ({cat.count})
            </Badge>
          ))}
        </div>

        {/* Gap Items List */}
        <ScrollArea className="h-[300px]">
          {activeCategory === 'noDocumentation' && (
            <div className="space-y-2">
              {gaps?.noDocumentation.map(gap => (
                <div key={gap.feature_code} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="font-medium text-sm">{gap.feature_name}</p>
                    <p className="text-xs text-muted-foreground">{gap.module_name}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onGenerateForFeature(gap.feature_code, 'manual')}>
                      <BookOpen className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onGenerateForFeature(gap.feature_code, 'kb')}>
                      <FileText className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Similar sections for other categories */}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Add Gap Summary to AgentContextPanel

**File: `src/components/enablement/AgentContextPanel.tsx`**

Add after the Coverage section:

```typescript
{/* Gap Summary - Quick Overview */}
{gapSummary && (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        Documentation Gaps
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between p-2 rounded bg-muted/50">
          <span>Undocumented</span>
          <Badge variant="destructive">{gapSummary.undocumentedFeatures}</Badge>
        </div>
        <div className="flex justify-between p-2 rounded bg-muted/50">
          <span>Missing KB</span>
          <Badge variant="secondary">{gapSummary.missingKBArticles}</Badge>
        </div>
        <div className="flex justify-between p-2 rounded bg-muted/50">
          <span>Missing QS</span>
          <Badge variant="secondary">{gapSummary.missingQuickStarts}</Badge>
        </div>
        <div className="flex justify-between p-2 rounded bg-muted/50">
          <span>Orphaned</span>
          <Badge variant="outline">{gapSummary.orphanedDocumentation}</Badge>
        </div>
      </div>
      <Button 
        variant="link" 
        size="sm" 
        className="mt-2 p-0 h-auto"
        onClick={onViewGapDetails}
      >
        View detailed breakdown
      </Button>
    </CardContent>
  </Card>
)}
```

### Step 4: Render Gap Results in Chat

**File: `src/components/enablement/ContentCreationAgentChat.tsx`**

Add special message type for gap results:

```typescript
// In message rendering section, add special case for gap analysis
{message.type === 'gap_analysis' && message.gapData && (
  <div className="mt-3 space-y-2">
    <p className="text-sm font-medium">Documentation Gap Analysis</p>
    <div className="grid grid-cols-2 gap-2">
      <div className="p-2 rounded bg-red-50 dark:bg-red-950/20">
        <span className="text-lg font-bold text-red-600">{message.gapData.summary.undocumentedFeatures}</span>
        <p className="text-xs text-muted-foreground">Undocumented</p>
      </div>
      {/* Similar for other categories */}
    </div>
    {message.gapData.gaps.noDocumentation.length > 0 && (
      <div className="mt-2">
        <p className="text-xs text-muted-foreground mb-1">Top gaps to address:</p>
        {message.gapData.gaps.noDocumentation.slice(0, 3).map(gap => (
          <div key={gap.feature_code} className="flex items-center justify-between py-1">
            <span className="text-sm">{gap.feature_name}</span>
            <Button size="sm" variant="ghost" onClick={() => onQuickAction('generate_kb_article', { featureCode: gap.feature_code })}>
              Generate
            </Button>
          </div>
        ))}
      </div>
    )}
  </div>
)}
```

---

## Future Enhancement: Content Quality Checks

### Add to Edge Function (`content-creation-agent/index.ts`)

New action `validate_content_quality`:

```typescript
case 'validate_content_quality': {
  const { data: sections } = await supabase
    .from('manual_sections')
    .select('id, title, content_markdown, updated_at');

  const issues = [];
  
  for (const section of sections || []) {
    const content = section.content_markdown || '';
    
    // Check for placeholders
    if (/\[(Screenshot|TODO|TBD|Placeholder)\]/i.test(content)) {
      issues.push({
        sectionId: section.id,
        title: section.title,
        issue: 'placeholder_detected',
        severity: 'warning',
        details: 'Contains placeholder text that needs to be replaced'
      });
    }
    
    // Check for missing images
    if (!content.includes('![') && content.length > 500) {
      issues.push({
        sectionId: section.id,
        title: section.title,
        issue: 'no_images',
        severity: 'info',
        details: 'Long section without any images'
      });
    }
  }
  
  return new Response(
    JSON.stringify({ success: true, qualityIssues: issues }),
    { headers }
  );
}
```

---

## Files to Create/Modify Summary

### New Files
| File | Description |
|------|-------------|
| `src/components/enablement/GapAnalysisPanel.tsx` | Main gap analysis display component |
| `src/components/enablement/GapCategoryList.tsx` | List of gaps for a category |
| `src/components/enablement/GapItemCard.tsx` | Individual gap card with actions |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/enablement/ContentCreationStudioPage.tsx` | Add gapAnalysis state, wire up gap panel |
| `src/components/enablement/ContentCreationAgentChat.tsx` | Render gap results inline with action buttons |
| `src/components/enablement/AgentContextPanel.tsx` | Add gap summary section with counts |
| `src/hooks/useContentCreationAgent.ts` | Ensure identifyGaps returns data (not just toast) |
| `supabase/functions/content-creation-agent/index.ts` | (Future) Add content quality validation action |

---

## Expected User Experience After Implementation

### Current Flow (Problems)
1. User clicks "Find Gaps"
2. Toast shows "Found 834 undocumented features"
3. Toast disappears after 3 seconds
4. User has no idea what to do next

### New Flow (Solution)
1. User clicks "Find Gaps"
2. Gap Analysis panel appears with category breakdown:
   - "Undocumented (120)" - "Missing KB (340)" - "Missing SOP (280)" - etc.
3. User clicks a category to see specific items
4. Each item shows feature name + module + action buttons
5. User can click "Generate" directly on any gap
6. Summary also appears in right-side Coverage panel for quick reference
7. Chat displays structured gap summary with top priorities

---

## Visual Mockup (Text-Based)

```text
+-----------------------------------------------------+
| Documentation Agent                                 |
| AI-powered content creation                    [X]  |
+-----------------------------------------------------+
| Quick Actions                                       |
| [Analyze Coverage] [Find Gaps] [Gen Manual] [KB]    |
+-----------------------------------------------------+
| Gap Analysis Results                           [R]  |
| +-----------------------------------------------+   |
| | [Undocumented (120)] [KB (340)] [SOP (280)]   |   |
| +-----------------------------------------------+   |
| | evaluations        Appraisals    [📖] [📄]    |   |
| | cycles             Appraisals    [📖] [📄]    |   |
| | calibration        Appraisals    [📖] [📄]    |   |
| | ... 117 more                                  |   |
| +-----------------------------------------------+   |
+-----------------------------------------------------+
| Chat                                                |
| [Sparkle] Ask me to generate documentation...       |
|                                                     |
| [Input field...                            ] [Send] |
+-----------------------------------------------------+
```
