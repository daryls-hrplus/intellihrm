# Tab State Migration Guide

## Overview

This guide helps developers migrate existing pages to use the Workspace Tab Navigation system's state persistence features. Following these patterns ensures filters, search terms, and UI state survive tab switches.

---

## When to Use Tab State

### Use `useTabState` When:
- ✅ Filters that users expect to persist (company, status, date range)
- ✅ Search input values
- ✅ Pagination state (current page, page size)
- ✅ Expanded/collapsed sections
- ✅ Selected tab within a page (e.g., "Active" vs "Archived" sub-tab)
- ✅ Sort column and direction

### Use Regular `useState` When:
- ❌ Modal/dialog open state
- ❌ Temporary hover/focus states
- ❌ Loading indicators
- ❌ Error messages (usually)
- ❌ Animation state

---

## Basic Migration

### Before (State Lost on Tab Switch)
```typescript
import { useState } from "react";

function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  
  // This state is lost when user switches tabs!
}
```

### After (State Persists)
```typescript
import { useTabState } from "@/hooks/useTabState";

function EmployeesPage() {
  const [tabState, setTabState] = useTabState({
    defaultState: {
      searchTerm: "",
      selectedCompanyId: "",
      statusFilter: "active",
    },
    syncToUrl: ["selectedCompanyId", "statusFilter"], // Optional: sync to URL
  });

  // Destructure for convenience
  const { searchTerm, selectedCompanyId, statusFilter } = tabState;

  // Update individual fields
  const handleSearchChange = (value: string) => {
    setTabState({ searchTerm: value });
  };

  const handleCompanyChange = (companyId: string) => {
    setTabState({ selectedCompanyId: companyId });
  };
}
```

---

## API Reference

### useTabState

```typescript
function useTabState<T extends Record<string, unknown>>(
  options: UseTabStateOptions<T>
): [T, (updates: Partial<T>) => void, () => void]
```

#### Parameters

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `defaultState` | `T` | Yes | Default values when no persisted state exists |
| `syncToUrl` | `(keyof T)[]` | No | Keys to sync with URL search parameters |

#### Returns

| Index | Type | Description |
|-------|------|-------------|
| 0 | `T` | Current state (merged: defaults + persisted) |
| 1 | `(updates: Partial<T>) => void` | Update function (merges partial updates) |
| 2 | `() => void` | Reset function (clears to defaults) |

---

## URL Synchronization

### When to Sync to URL
- Bookmarkable filters (share a filtered view via URL)
- Deep-linking to specific states
- Browser back/forward navigation support

### Configuration
```typescript
const [tabState, setTabState] = useTabState({
  defaultState: {
    companyId: "",
    department: "",
    status: "active",
    searchTerm: "", // Don't sync search (too volatile)
  },
  syncToUrl: ["companyId", "department", "status"],
});
```

### Resulting URL
```
/workforce/employees?companyId=abc-123&department=engineering&status=active
```

### Complex Values
Non-string values are JSON-serialized:
```typescript
const [tabState, setTabState] = useTabState({
  defaultState: {
    selectedIds: [] as string[],
    dateRange: { start: null, end: null },
  },
  syncToUrl: ["selectedIds", "dateRange"],
});

// URL: ?selectedIds=["id1","id2"]&dateRange={"start":"2026-01-01","end":"2026-01-31"}
```

---

## Common Patterns

### Pattern 1: List Page with Filters

```typescript
function JobsPage() {
  const [tabState, setTabState] = useTabState({
    defaultState: {
      searchTerm: "",
      selectedCompanyId: "",
      statusFilter: "all" as "all" | "active" | "inactive",
      sortColumn: "title" as keyof Job,
      sortDirection: "asc" as "asc" | "desc",
      currentPage: 1,
      pageSize: 20,
    },
    syncToUrl: ["selectedCompanyId", "statusFilter"],
  });

  const { searchTerm, selectedCompanyId, statusFilter, currentPage, pageSize } = tabState;

  // Filter change resets to page 1
  const handleFilterChange = (filter: string) => {
    setTabState({ statusFilter: filter, currentPage: 1 });
  };

  return (
    <div>
      <SearchInput
        value={searchTerm}
        onChange={(v) => setTabState({ searchTerm: v })}
      />
      <CompanyFilter
        value={selectedCompanyId}
        onChange={(v) => setTabState({ selectedCompanyId: v, currentPage: 1 })}
      />
      <StatusFilter
        value={statusFilter}
        onChange={handleFilterChange}
      />
      <DataTable
        page={currentPage}
        pageSize={pageSize}
        onPageChange={(p) => setTabState({ currentPage: p })}
      />
    </div>
  );
}
```

### Pattern 2: Detail Page with Expandable Sections

```typescript
function EmployeeDetailPage() {
  const { id } = useParams();
  
  const [tabState, setTabState] = useTabState({
    defaultState: {
      expandedSections: ["personal", "employment"] as string[],
      activeSubTab: "overview" as "overview" | "history" | "documents",
    },
  });

  const { expandedSections, activeSubTab } = tabState;

  const toggleSection = (section: string) => {
    const isExpanded = expandedSections.includes(section);
    setTabState({
      expandedSections: isExpanded
        ? expandedSections.filter(s => s !== section)
        : [...expandedSections, section],
    });
  };

  return (
    <div>
      <Tabs value={activeSubTab} onValueChange={(v) => setTabState({ activeSubTab: v })}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Accordion type="multiple" value={expandedSections}>
        <AccordionItem value="personal">
          <AccordionTrigger onClick={() => toggleSection("personal")}>
            Personal Information
          </AccordionTrigger>
          <AccordionContent>...</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
```

### Pattern 3: Form with Unsaved Changes Tracking

```typescript
function CreateEmployeePage() {
  const { setUnsavedChanges } = useTabContext();
  
  const [tabState, setTabState] = useTabState({
    defaultState: {
      formStep: 1,
      draftData: {} as Partial<EmployeeFormData>,
    },
  });

  const { formStep, draftData } = tabState;

  // Mark dirty when form data changes
  const updateDraft = (updates: Partial<EmployeeFormData>) => {
    setTabState({ draftData: { ...draftData, ...updates } });
    setUnsavedChanges(true);
  };

  // Clear dirty on successful save
  const handleSave = async () => {
    await saveEmployee(draftData);
    setUnsavedChanges(false);
    // Navigate away
  };

  return (
    <MultiStepForm
      step={formStep}
      onStepChange={(s) => setTabState({ formStep: s })}
      data={draftData}
      onChange={updateDraft}
      onSubmit={handleSave}
    />
  );
}
```

---

## Migration Checklist

When migrating a page:

- [ ] Identify all `useState` calls that should persist
- [ ] Create `defaultState` object with all persistent state
- [ ] Decide which keys to sync to URL (bookmarkable filters)
- [ ] Replace `useState` with `useTabState`
- [ ] Update setter calls to use partial update syntax
- [ ] Test: Switch away and back - state should persist
- [ ] Test: Refresh page - synced URL state should restore
- [ ] Test: Clear URL params - defaults should apply

---

## Troubleshooting

### State Not Persisting
1. Verify component is rendered within `TabProvider`
2. Check that `activeTabId` exists in TabContext
3. Ensure state keys match between `defaultState` and usage

### URL Not Updating
1. Verify key is listed in `syncToUrl` array
2. Check that value is not empty/null (empty values are removed from URL)
3. Ensure no other code is manipulating `searchParams`

### State Resetting Unexpectedly
1. Check if component is remounting (key prop changing?)
2. Verify tab ID is stable (not regenerating)
3. Look for `resetState()` calls

### TypeScript Errors
```typescript
// Ensure proper typing for complex state
const [tabState, setTabState] = useTabState({
  defaultState: {
    selectedIds: [] as string[], // Type assertion for arrays
    dateRange: null as DateRange | null, // Nullable types
  },
});
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/hooks/useTabState.ts` | Main hook implementation |
| `src/contexts/TabContext.tsx` | State storage in context |
| `src/hooks/useWorkspaceNavigation.ts` | Navigation utilities |

---

## Related Documentation
- `docs/architecture/ADR-001-WORKSPACE-TAB-NAVIGATION.md`
- `docs/patterns/TAB-LIFECYCLE-SPECIFICATION.md`
