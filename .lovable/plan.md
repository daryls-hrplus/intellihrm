
# Remove Template Codes from Workflow Management UI

## Overview
Remove the internal template codes (e.g., `PERF_RATING_APPROVAL`, `PERF_APPRAISAL_ACKNOWLEDGMENT`) displayed next to workflow template names throughout the Workflow Management interface. These technical identifiers are not useful for end-users and clutter the UI.

---

## Current State
The template/transaction type codes are currently displayed in three locations:

| Location | Component | Code Displayed |
|----------|-----------|---------------|
| Workflow list rows | `UnifiedWorkflowCard.tsx` | Transaction type code (e.g., `PERF_RATING_APPROVAL`) |
| Template Library details panel | `WorkflowTemplateLibrary.tsx` | Template code in monospace badge |
| Step Configuration details panel | `WorkflowStepConfiguration.tsx` | Template code in monospace badge |

---

## Files to Modify

### 1. `src/components/workflow/UnifiedWorkflowCard.tsx`
**Remove lines 105-109** - the span showing `workflow.transactionTypeCode`:

```text
Before:
<div className="flex items-center gap-2">
  <span className="font-medium text-sm">{workflow.name}</span>
  {workflow.transactionTypeCode && (
    <span className="text-xs text-muted-foreground">
      {workflow.transactionTypeCode}
    </span>
  )}
</div>

After:
<div className="flex items-center gap-2">
  <span className="font-medium text-sm">{workflow.name}</span>
</div>
```

### 2. `src/components/workflow/WorkflowTemplateLibrary.tsx`
**Remove lines 475-479** - the monospace code badge showing `selectedTemplate.code`:

```text
Before:
<p className="text-sm text-muted-foreground mt-1">
  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded mr-2">
    {selectedTemplate.code}
  </span>
  {CATEGORY_LABELS[selectedTemplate.category] || selectedTemplate.category}
</p>

After:
<p className="text-sm text-muted-foreground mt-1">
  {CATEGORY_LABELS[selectedTemplate.category] || selectedTemplate.category}
</p>
```

### 3. `src/components/workflow/WorkflowStepConfiguration.tsx`
**Remove lines 234-238** - the monospace code badge showing `selectedTemplate.code`:

```text
Before:
<p className="text-sm text-muted-foreground mt-1">
  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded mr-2">
    {selectedTemplate.code}
  </span>
  {CATEGORY_LABELS[selectedTemplate.category] || selectedTemplate.category}
</p>

After:
<p className="text-sm text-muted-foreground mt-1">
  {CATEGORY_LABELS[selectedTemplate.category] || selectedTemplate.category}
</p>
```

---

## Result
After these changes:
- Workflow list rows will show only the human-readable name (e.g., "Rating Approval")
- Template details panels will show only the category label (e.g., "Performance Rating")
- Internal codes remain in the database for system use but are hidden from the UI

---

## No Database Changes Required
This is a UI-only change. The codes remain stored in the database and continue to function for system operations.
