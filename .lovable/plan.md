

# Synchronize Content Creation Agent Gap Analysis with FEATURE_REGISTRY

## Problem Analysis

The Content Creation Agent's gap analysis (`identify_gaps` action) and the Route Registry page use **different data sources**, causing inconsistent coverage metrics:

| Component | Data Source | Feature Count |
|-----------|-------------|---------------|
| Route Registry Page | `FEATURE_REGISTRY` (code) | ~261 features |
| Content Creation Agent | `application_features` (database) | ~834 features |

The database contains **576 orphaned entries** from legacy migrations that don't exist in the canonical code registry. This creates:
1. Inflated gap counts in Content Creation Studio
2. Misleading coverage percentages
3. Inconsistent sync status between tools

## Root Cause

**Content Creation Agent (`supabase/functions/content-creation-agent/index.ts`)**:
- Lines 829-845: `identify_gaps` queries `application_features` table directly
- Lines 276-292: `analyze_context` also queries `application_features` table

**Route Registry (`useCodeRegistryScanner.ts` + `useFeatureRegistrySync.ts`)**:
- Uses `FEATURE_REGISTRY` from `src/lib/featureRegistry.ts` as source of truth
- Identifies orphans as database entries NOT in code registry

## Solution Architecture

Pass `FEATURE_REGISTRY` from frontend to the edge function (similar to how `sync-feature-registry` works), then filter database queries to only include features that exist in the code registry.

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Before (Current State)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Content Creation Studio                                        │
│          │                                                      │
│          ▼                                                      │
│  content-creation-agent                                         │
│          │                                                      │
│          ▼                                                      │
│  application_features (834 rows)  ← Includes orphaned entries   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     After (Target State)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Content Creation Studio                                        │
│          │                                                      │
│          ├── FEATURE_REGISTRY (261 codes)                       │
│          ▼                                                      │
│  content-creation-agent                                         │
│          │                                                      │
│          ▼                                                      │
│  Filter: application_features WHERE feature_code IN registry    │
│          │                                                      │
│          ▼                                                      │
│  Consistent 261-feature analysis                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Part 1: Update Content Creation Agent Edge Function

**File**: `supabase/functions/content-creation-agent/index.ts`

#### 1.1 Modify Request Interface (line 27-44)

Add optional `registryFeatureCodes` parameter to the request context:

```typescript
interface AgentRequest {
  action: AgentAction;
  context?: {
    // ... existing fields ...
    registryFeatureCodes?: string[];  // NEW: Feature codes from FEATURE_REGISTRY
  };
}
```

#### 1.2 Update `analyze_context` Action (lines 277-292)

Filter features to only those in registry:

```typescript
case 'analyze_context': {
  const registryCodes = context.registryFeatureCodes;
  
  let featuresQuery = supabase
    .from("application_features")
    .select(`
      id, feature_code, feature_name, description, route_path,
      application_modules!inner(module_code, module_name)
    `)
    .eq("is_active", true);

  // NEW: Filter to registry features if provided
  if (registryCodes && registryCodes.length > 0) {
    featuresQuery = featuresQuery.in("feature_code", registryCodes);
  }
  
  // ... rest of logic
}
```

#### 1.3 Update `identify_gaps` Action (lines 829-845)

Apply same registry filter:

```typescript
case 'identify_gaps': {
  const moduleCodeFilter = context.moduleCode;
  const registryCodes = context.registryFeatureCodes;
  
  let featuresQuery = supabase
    .from("application_features")
    .select(`
      feature_code, feature_name, description,
      application_modules!inner(module_code, module_name)
    `)
    .eq("is_active", true);

  // NEW: Filter to registry features if provided
  if (registryCodes && registryCodes.length > 0) {
    featuresQuery = featuresQuery.in("feature_code", registryCodes);
  }

  if (moduleCodeFilter) {
    featuresQuery = featuresQuery.eq("application_modules.module_code", moduleCodeFilter);
  }
  
  // ... rest of logic
}
```

#### 1.4 Update Other Affected Actions

Apply the same pattern to:
- `suggest_next_actions` (lines 967-974)
- `chat` (lines 1057-1061)

---

### Part 2: Create Registry Helper Hook

**File**: `src/hooks/useRegistryFeatureCodes.ts` (new file)

Extract feature codes from `FEATURE_REGISTRY` for passing to edge functions:

```typescript
import { useMemo } from "react";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";

export function useRegistryFeatureCodes() {
  const featureCodes = useMemo(() => {
    const codes: string[] = [];
    FEATURE_REGISTRY.forEach(module => {
      module.groups.forEach(group => {
        group.features.forEach(feature => {
          codes.push(feature.code);
        });
      });
    });
    return codes;
  }, []);

  const getModuleFeatureCodes = (moduleCode: string) => {
    const module = FEATURE_REGISTRY.find(m => m.code === moduleCode);
    if (!module) return [];
    return module.groups.flatMap(g => g.features.map(f => f.code));
  };

  return {
    allFeatureCodes: featureCodes,
    totalCount: featureCodes.length,
    getModuleFeatureCodes,
  };
}
```

---

### Part 3: Update Content Creation Studio Hooks

**File**: `src/hooks/useDocumentationAgent.ts` (or similar)

Modify the hook that calls the Content Creation Agent to include registry codes:

```typescript
import { useRegistryFeatureCodes } from "./useRegistryFeatureCodes";

export function useDocumentationAgent() {
  const { allFeatureCodes } = useRegistryFeatureCodes();

  const analyzeContext = async (moduleCode?: string) => {
    const { data, error } = await supabase.functions.invoke("content-creation-agent", {
      body: {
        action: "analyze_context",
        context: {
          moduleCode,
          registryFeatureCodes: allFeatureCodes,  // NEW
        },
      },
    });
    // ...
  };

  const identifyGaps = async (moduleCode?: string) => {
    const { data, error } = await supabase.functions.invoke("content-creation-agent", {
      body: {
        action: "identify_gaps",
        context: {
          moduleCode,
          registryFeatureCodes: allFeatureCodes,  // NEW
        },
      },
    });
    // ...
  };

  // ... other methods
}
```

---

### Part 4: Update Gap Analysis UI Components

**File**: `src/components/enablement/GapAnalysisPanel.tsx`

Ensure the panel passes registry codes when invoking gap analysis:

```typescript
import { useRegistryFeatureCodes } from "@/hooks/useRegistryFeatureCodes";

export function GapAnalysisPanel() {
  const { allFeatureCodes, totalCount } = useRegistryFeatureCodes();
  
  // Display registry-based total in UI
  <CardDescription>
    Analyzing {totalCount} features from code registry
  </CardDescription>
  
  // Pass codes when calling agent
  // ...
}
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/content-creation-agent/index.ts` | Modify | Add registry filter to all feature queries |
| `src/hooks/useRegistryFeatureCodes.ts` | Create | Extract feature codes from FEATURE_REGISTRY |
| `src/hooks/useDocumentationAgent.ts` | Modify | Pass registry codes in all agent calls |
| `src/components/enablement/GapAnalysisPanel.tsx` | Modify | Use registry-based counts |
| `src/components/enablement/GapResultsMessage.tsx` | Modify | Display registry-filtered results |

---

## Expected Outcome

After implementation:

| Metric | Before | After |
|--------|--------|-------|
| Total Features Analyzed | 834 | 261 |
| Orphan Detection | False positives | Accurate |
| Coverage Percentage | Inflated (orphans counted) | True coverage |
| Consistency with Route Registry | Mismatched | Aligned |

**Both the Route Registry and Content Creation Studio will report the same 261 canonical features**, providing a single source of truth across all enablement tools.

---

## Technical Notes

1. **Performance**: Passing 261 feature codes per request adds minimal overhead (~5KB payload)
2. **Backward Compatibility**: Registry codes are optional; existing calls without them will continue to work (using all DB features)
3. **Module Filtering**: When `moduleCode` is provided, the registry codes are filtered client-side via `getModuleFeatureCodes()`
4. **Future Consideration**: A scheduled job could periodically clean orphaned database entries that aren't in the registry

