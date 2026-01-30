

# Prevent Duplicate Template Usage in Automation Rules

## Overview
Add logic to prevent users from creating duplicate automation rules for templates that are already in use. When a template is already linked to an automation rule for the selected company, show a visual indicator and change the "Use in Rule" button to "Edit Rule" that navigates to the existing rule.

---

## Current Behavior
- The "Use in Rule" button always appears for all templates
- Clicking it always opens the **create** dialog for a new rule
- Users can accidentally create multiple rules using the same template
- No visual feedback showing which templates are already associated with rules

## Desired Behavior
- Templates already linked to a rule for the current company show an "In Use" indicator
- The "Use in Rule" button is replaced with "Edit Rule" for templates already in use
- Clicking "Edit Rule" switches to the Automation Rules tab and opens the edit dialog for the existing rule
- Users can still view/duplicate templates regardless of usage status

---

## Technical Approach

### 1. Fetch Template Usage Status

In `ReminderEmailTemplates.tsx`, query `reminder_rules` to find which templates are already linked to rules for the current company:

```sql
SELECT email_template_id, id as rule_id, name as rule_name 
FROM reminder_rules 
WHERE company_id = :companyId 
  AND email_template_id IS NOT NULL
```

This returns a mapping of `template_id` → `{ rule_id, rule_name }` to identify which templates are in use.

### 2. Add Template Usage State

Add new state and fetch logic in `ReminderEmailTemplates`:

```typescript
const [templateUsage, setTemplateUsage] = useState<Map<string, { ruleId: string; ruleName: string }>>(new Map());

// Fetch in useEffect alongside templates
const fetchTemplateUsage = async () => {
  const { data } = await supabase
    .from('reminder_rules')
    .select('email_template_id, id, name')
    .eq('company_id', companyId)
    .not('email_template_id', 'is', null);
  
  const usageMap = new Map();
  data?.forEach(rule => {
    usageMap.set(rule.email_template_id, { ruleId: rule.id, ruleName: rule.name });
  });
  setTemplateUsage(usageMap);
};
```

### 3. Add onEditRule Callback

Add a new prop to allow editing existing rules:

```typescript
interface ReminderEmailTemplatesProps {
  companyId: string;
  companyName?: string;
  onUseTemplate?: (template: EmailTemplate) => void;
  onEditRule?: (ruleId: string, ruleName: string) => void; // NEW
}
```

### 4. Update Template Card UI

Modify `renderTemplateCard` to show usage status and conditional button:

```tsx
const usage = templateUsage.get(template.id);
const isInUse = !!usage;

// Show "In Use" badge next to template name
{isInUse && (
  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
    <Zap className="h-3 w-3 mr-1" />
    In Use
  </Badge>
)}

// Change button based on usage status
{onUseTemplate && !isInUse && (
  <Button variant="default" size="sm" onClick={() => onUseTemplate(template)}>
    <Zap className="h-3.5 w-3.5 mr-1" />
    Use in Rule
  </Button>
)}
{onEditRule && isInUse && (
  <Button variant="secondary" size="sm" onClick={() => onEditRule(usage.ruleId, usage.ruleName)}>
    <Edit className="h-3.5 w-3.5 mr-1" />
    Edit Rule
  </Button>
)}
```

### 5. Handle Edit Rule in Parent Page

Update `HRRemindersPage.tsx` to add the edit handler:

```typescript
const handleEditRule = (ruleId: string, ruleName: string) => {
  setTabState({ activeTab: 'rules' });
  setTimeout(() => {
    rulesManagerRef.current?.openEditDialog(ruleId);
  }, 100);
};
```

Pass it to the component:
```tsx
<ReminderEmailTemplates 
  companyId={selectedCompanyId}
  companyName={companies.find(c => c.id === selectedCompanyId)?.name}
  onUseTemplate={handleUseTemplate}
  onEditRule={handleEditRule}
/>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/reminders/ReminderEmailTemplates.tsx` | Add `templateUsage` state, `fetchTemplateUsage()` query, `onEditRule` prop, update `renderTemplateCard()` with conditional button and "In Use" badge |
| `src/pages/hr-hub/HRRemindersPage.tsx` | Add `handleEditRule` callback and pass to `ReminderEmailTemplates` |

---

## UI Changes Summary

| State | Badge | Button |
|-------|-------|--------|
| Template **not** in use | None | "Use in Rule" (primary, blue) |
| Template **in use** | "In Use" (green badge with Zap icon) | "Edit Rule" (secondary variant) |

---

## No Database Changes Required
This uses existing `reminder_rules.email_template_id` relationship. No schema modifications needed.

