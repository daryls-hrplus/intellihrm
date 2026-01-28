

# Redesign Content Creation Studio: Unified Context & Action Architecture

## Problem Summary

You've identified three critical issues with the Content Creation Studio:

| Issue | Current State | Expected Behavior |
|-------|---------------|-------------------|
| **Disconnected Selection** | Manual Content selection is isolated from Coverage analysis | Coverage should filter/highlight based on selected manual/chapter |
| **Confusing UI Organization** | Two separate context panels (Module/Feature vs Manual Content) with no clear relationship | Single unified workflow: Select context → See relevant gaps → Generate content |
| **Multiple Data Sources** | Agent uses `registryFeatureCodes` but doesn't pass manual selection context | All selections should flow to analysis functions |

## Root Cause Analysis

```text
Current Data Flow (Broken):
┌─────────────────────────────────────────────────────────────┐
│  Context Panel (Right)                                      │
│  ┌──────────────────┐   ┌──────────────────────────────┐   │
│  │ Module/Feature   │   │ Manual/Chapter/Section       │   │
│  │ Selection        │   │ Selection                    │   │
│  │                  │   │                              │   │
│  │ Feeds: Coverage  │   │ Feeds: Preview/Regenerate   │   │
│  │ & Gap Analysis   │   │ (ISOLATED - not connected   │   │
│  │                  │   │  to coverage analysis)       │   │
│  └──────────────────┘   └──────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Gap Summary Card                                      │  │
│  │ Shows global gaps (235 undocumented)                  │  │
│  │ NOT filtered by manual selection                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

When you select a manual and chapter, then click "Analyze Coverage", the system:
1. Analyzes **all features** (or module-filtered features) 
2. Does NOT cross-reference the selected manual's `module_codes`
3. Does NOT show coverage specific to that manual's scope

---

## Solution: Unified Selection → Analysis → Action Flow

### New Architecture

```text
Proposed Data Flow (Connected):
┌─────────────────────────────────────────────────────────────┐
│  UNIFIED CONTEXT SELECTOR                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Primary Context Mode: [Module] or [Manual]    [Toggle] │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │ When "Module" mode: │  │ When "Manual" mode:         │  │
│  │ • Module dropdown   │  │ • Manual dropdown           │  │
│  │ • Feature dropdown  │  │ • Chapter dropdown          │  │
│  │                     │  │ • Section dropdown          │  │
│  │ Coverage = Module   │  │ Coverage = Manual's         │  │
│  │ scope               │  │ module_codes scope          │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ CONTEXTUAL COVERAGE CARD                               │ │
│  │ Shows: "Admin & Security Guide - 55 sections"          │ │
│  │        "23 features documented / 12 gaps in scope"     │ │
│  │        [Analyze Coverage] updates THIS scope           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Part 1: Add Manual-Scoped Coverage Analysis

**File**: `supabase/functions/content-creation-agent/index.ts`

Update `analyze_context` action to accept manual context and filter accordingly:

```typescript
case 'analyze_context': {
  const registryCodes = context.registryFeatureCodes;
  const manualId = context.manualId;
  
  let moduleCodesFilter: string[] | null = null;
  
  // If manual is selected, use its module_codes for filtering
  if (manualId) {
    const { data: manual } = await supabase
      .from("manual_definitions")
      .select("module_codes")
      .eq("id", manualId)
      .single();
    
    if (manual?.module_codes) {
      moduleCodesFilter = manual.module_codes;
    }
  }
  
  // Filter features by module_codes if manual selected
  if (moduleCodesFilter && moduleCodesFilter.length > 0) {
    featuresQuery = featuresQuery.in(
      "application_modules.module_code", 
      moduleCodesFilter
    );
  } else if (context.moduleCode) {
    // Fallback to single module filter
    featuresQuery = featuresQuery.eq(
      "application_modules.module_code", 
      context.moduleCode
    );
  }
  // ... rest of analysis logic
}
```

---

### Part 2: Unify Context Selection UI

**File**: `src/components/enablement/AgentContextPanel.tsx`

Replace the two separate sections with a unified selector that maintains mode state:

```typescript
// Add context mode state
const [contextMode, setContextMode] = useState<'module' | 'manual'>('module');

// Render unified context card
<Card>
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm font-medium">Context</CardTitle>
      <Tabs value={contextMode} onValueChange={setContextMode}>
        <TabsList className="h-7">
          <TabsTrigger value="module" className="text-xs px-2">
            <Layers className="h-3 w-3 mr-1" />
            Module
          </TabsTrigger>
          <TabsTrigger value="manual" className="text-xs px-2">
            <BookOpen className="h-3 w-3 mr-1" />
            Manual
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  </CardHeader>
  
  <CardContent>
    {contextMode === 'module' ? (
      // Existing Module/Feature selectors
      <ModuleFeatureSelector ... />
    ) : (
      // Manual/Chapter/Section selectors
      <ManualContentSelector ... />
    )}
    
    {/* Coverage summary always visible, reflects active context */}
    <ContextualCoverageSummary 
      mode={contextMode}
      selectedManualId={selectedManualId}
      selectedModuleCode={selectedModule}
      onAnalyze={handleAnalyzeCoverage}
    />
  </CardContent>
</Card>
```

---

### Part 3: Create Contextual Coverage Summary Component

**New File**: `src/components/enablement/ContextualCoverageSummary.tsx`

This component displays coverage stats that reflect the current selection:

```typescript
interface ContextualCoverageSummaryProps {
  mode: 'module' | 'manual';
  selectedManualId?: string;
  selectedModuleCode?: string;
  analysis: ContextAnalysis | null;
  isLoading: boolean;
  onAnalyze: () => void;
}

export function ContextualCoverageSummary({
  mode,
  selectedManualId,
  selectedModuleCode,
  analysis,
  isLoading,
  onAnalyze,
}: ContextualCoverageSummaryProps) {
  const contextLabel = mode === 'manual' 
    ? `Coverage for selected manual` 
    : selectedModuleCode 
      ? `Coverage for ${selectedModuleCode}` 
      : `System-wide coverage`;
  
  return (
    <div className="mt-4 p-3 rounded-lg bg-muted/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{contextLabel}</span>
        <Button variant="ghost" size="sm" onClick={onAnalyze} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        </Button>
      </div>
      
      {analysis ? (
        <div className="space-y-2">
          <Progress value={analysis.coveragePercentage} className="h-2" />
          <div className="flex justify-between text-xs">
            <span>{analysis.documented} documented</span>
            <span className="font-medium">{analysis.coveragePercentage}%</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">
          Click to analyze coverage for this context
        </p>
      )}
    </div>
  );
}
```

---

### Part 4: Update Page to Wire Context Mode

**File**: `src/pages/enablement/ContentCreationStudioPage.tsx`

Add context mode state and pass manual context to analysis:

```typescript
// Add context mode state
const [contextMode, setContextMode] = useState<'module' | 'manual'>('module');

// Update analyze handler to pass manual context
const handleAnalyzeCoverage = async () => {
  if (contextMode === 'manual' && selectedManualId) {
    // Pass manual ID so edge function filters by manual's module_codes
    await analyzeContext(undefined, { manualId: selectedManualId });
  } else {
    await analyzeContext(tabState.selectedModule || undefined);
  }
};

// Update quick action handler
const handleQuickAction = async (action: string, params?: Record<string, unknown>) => {
  const moduleCode = params?.moduleCode as string || tabState.selectedModule;
  const featureCode = params?.featureCode as string || tabState.selectedFeature;
  const manualContext = contextMode === 'manual' && selectedManualId 
    ? { manualId: selectedManualId } 
    : {};

  switch (action) {
    case 'analyze_context':
      await analyzeContext(moduleCode || undefined, manualContext);
      break;
    // ... other cases
  }
};
```

---

### Part 5: Update Hook to Accept Manual Context

**File**: `src/hooks/useContentCreationAgent.ts`

Update `analyzeContext` to accept optional manual context:

```typescript
const analyzeContext = useCallback(async (
  moduleCode?: string, 
  manualContext?: { manualId?: string }
): Promise<ContextAnalysis | null> => {
  setIsLoading(true);
  setCurrentAction('analyze_context');
  try {
    const data = await invokeAgent('analyze_context', { 
      moduleCode,
      ...manualContext  // Spread manualId if provided
    });
    if (data?.analysis) {
      setContextAnalysis(data.analysis);
      return data.analysis;
    }
    return null;
  } catch (error) {
    toast.error("Failed to analyze context");
    return null;
  } finally {
    setIsLoading(false);
    setCurrentAction(null);
  }
}, [invokeAgent]);
```

---

## Industry Standard Alignment

This redesign follows established UX patterns for AI documentation agents:

| Pattern | Implementation |
|---------|----------------|
| **Context-First Design** | User selects scope BEFORE analysis runs |
| **Progressive Disclosure** | Mode toggle reveals relevant selectors only |
| **Visual Feedback** | Coverage summary reflects current selection |
| **Unified Data Flow** | All selections feed into analysis function |
| **Clear AI Decision Display** | Gap summary explains what's missing in scope |

---

## Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/content-creation-agent/index.ts` | Modify | Accept `manualId` in analyze_context, filter by manual's module_codes |
| `src/hooks/useContentCreationAgent.ts` | Modify | Update analyzeContext signature to accept manual context |
| `src/components/enablement/AgentContextPanel.tsx` | Modify | Add context mode toggle, unify selection flow |
| `src/components/enablement/ContextualCoverageSummary.tsx` | Create | New component for scope-aware coverage display |
| `src/pages/enablement/ContentCreationStudioPage.tsx` | Modify | Wire context mode state and handlers |

---

## Expected Outcome

After implementation:

1. **Module Mode**: Select module → See coverage for that module → Generate content for its features
2. **Manual Mode**: Select manual → See coverage for manual's scope → Regenerate sections or generate new content
3. **Coverage Analysis** always reflects the active selection
4. **Gap Summary** filters to show gaps within the selected context
5. **Quick Actions** operate on the selected scope
6. **Clear visual indication** of which mode is active

The user experience becomes: **Select Scope → See Relevant Stats → Take Action**

