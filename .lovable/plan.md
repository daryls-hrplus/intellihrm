

# Add Cycle Selection to Appraisal & 360 Reminder Rules

## Overview
Enhance the Notifications and Reminders system to allow selecting a specific **Appraisal Cycle** or **360 Review Cycle** when creating automation rules for performance-related events. This ensures notification dates are accurate and based on the actual cycle's timeline (start date, end date, deadlines).

---

## Current State
- Reminder rules have a `cycle_type_filter` array that filters by **cycle type** (e.g., "annual", "quarterly")
- There's no way to bind a rule to a **specific cycle** (e.g., "2025 Annual Performance Appraisal")
- Notification dates are calculated generically, not from the selected cycle's actual dates

## Desired Behavior
- For **Appraisals** event types: Allow selecting a specific Appraisal Cycle
- For **360 Feedback** event types: Allow selecting a specific Review Cycle
- The cycle selection should be **optional** (rules can apply to all cycles or a specific one)
- When a cycle is selected, display its dates for reference
- The rule should use the cycle's actual dates (start_date, end_date, deadlines) for notification timing

---

## Technical Approach

### 1. Database Schema Changes

Add two new columns to `reminder_rules` table:

```sql
ALTER TABLE reminder_rules 
ADD COLUMN appraisal_cycle_id UUID REFERENCES appraisal_cycles(id) ON DELETE SET NULL,
ADD COLUMN review_cycle_id UUID REFERENCES review_cycles(id) ON DELETE SET NULL;

COMMENT ON COLUMN reminder_rules.appraisal_cycle_id IS 'Optional: Link rule to a specific appraisal cycle';
COMMENT ON COLUMN reminder_rules.review_cycle_id IS 'Optional: Link rule to a specific 360 review cycle';
```

### 2. Update TypeScript Types

Update `src/types/reminders.ts` to include the new cycle reference fields:

```typescript
export interface ReminderRule {
  // ... existing fields
  appraisal_cycle_id: string | null;
  review_cycle_id: string | null;
  appraisal_cycle?: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
  };
  review_cycle?: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
  };
}
```

### 3. Create Cycle Selector Component

Create `src/components/reminders/CycleSelector.tsx`:

| Prop | Type | Description |
|------|------|-------------|
| `companyId` | string | Filter cycles by company |
| `cycleType` | 'appraisal' \| '360' | Determines which cycle table to query |
| `selectedCycleId` | string \| null | Currently selected cycle |
| `onSelect` | (cycleId) => void | Callback when selection changes |

The component will:
- Fetch cycles from `appraisal_cycles` or `review_cycles` based on `cycleType`
- Display a dropdown with cycle names, status badges (Active, Draft, Completed)
- Show "All Cycles" as the default option
- When a cycle is selected, show an info card with dates:
  - Start Date, End Date
  - Key deadlines (self-assessment, manager review, etc.)

### 4. Update UnifiedRuleDialog Form

Modify `src/components/reminders/UnifiedRuleDialog.tsx`:

**Form State:**
```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  appraisal_cycle_id: null as string | null,
  review_cycle_id: null as string | null,
});
```

**Conditional Rendering Logic:**
```typescript
const selectedEventType = eventTypes.find(t => t.id === formData.event_type_id);
const showAppraisalCycleSelector = selectedEventType?.category === 'performance_appraisals';
const showReviewCycleSelector = selectedEventType?.category === 'performance_360';
```

**UI Placement:**
- Insert the `CycleSelector` component after the Event Type selector
- Only visible when event type category is `performance_appraisals` or `performance_360`
- Replace the existing `cycle_type_filter` UI with the new cycle selector for these categories

### 5. Update Rule Source Preview

Modify `src/hooks/useReminderSourcePreview.ts` to filter by specific cycle when set:

```typescript
// In fetchPreview(), add cycle filtering:
if (cycleId) {
  baseQuery = baseQuery.eq('cycle_id', cycleId);
}
```

### 6. Update Rules Manager Display

Modify `src/components/reminders/ReminderRulesManager.tsx` to show which cycle a rule is linked to:

```tsx
// In renderRuleRow():
{rule.appraisal_cycle && (
  <Badge variant="outline" className="text-xs">
    Cycle: {rule.appraisal_cycle.name}
  </Badge>
)}
{rule.review_cycle && (
  <Badge variant="outline" className="text-xs">
    360 Cycle: {rule.review_cycle.name}
  </Badge>
)}
```

### 7. Update Rules Fetch Query

Modify the `fetchRules` function in `src/hooks/useReminders.ts` to include cycle relations:

```typescript
const { data, error } = await supabase
  .from('reminder_rules')
  .select(`
    *,
    event_type:reminder_event_types(*),
    appraisal_cycle:appraisal_cycles(id, name, start_date, end_date, status),
    review_cycle:review_cycles(id, name, start_date, end_date, status)
  `)
  .eq('company_id', companyId)
  .order('created_at', { ascending: false });
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/[new].sql` | Add `appraisal_cycle_id` and `review_cycle_id` columns to `reminder_rules` |
| `src/types/reminders.ts` | Add new cycle reference fields to `ReminderRule` interface |
| `src/components/reminders/CycleSelector.tsx` | **NEW FILE** - Cycle dropdown with date preview |
| `src/components/reminders/UnifiedRuleDialog.tsx` | Add cycle selector UI, update form state and save logic |
| `src/components/reminders/ReminderRulesManager.tsx` | Display linked cycle in rule rows |
| `src/hooks/useReminders.ts` | Include cycle relations in fetch query |
| `src/hooks/useReminderSourcePreview.ts` | Filter preview by selected cycle |

---

## UI Flow

```text
1. User selects Event Type: "Appraisal Cycle Starting"
   ↓
2. Cycle Selector appears: "Select Appraisal Cycle (Optional)"
   ↓
3. User selects: "2025 Annual Performance Appraisal"
   ↓
4. Info card displays:
   ┌─────────────────────────────────────────┐
   │ 📅 2025 Annual Performance Appraisal    │
   │ Status: Active                          │
   │ Start: Jan 1, 2025  │  End: Dec 31, 2025│
   │ Self-Assessment Due: Feb 15, 2025       │
   └─────────────────────────────────────────┘
   ↓
5. Source Preview updates to show only records from this cycle
   ↓
6. Rule saves with appraisal_cycle_id linked
```

---

## Notification Date Accuracy

When a rule is linked to a specific cycle:
- The `process-reminders` edge function will use the cycle's actual dates
- Template placeholders like `{cycle_start_date}`, `{cycle_end_date}`, `{deadline}` will resolve to the correct values
- No more generic "X days before event" - dates come from the cycle record

---

## Edge Case Handling

| Scenario | Behavior |
|----------|----------|
| Cycle is deleted | Foreign key `ON DELETE SET NULL` - rule becomes "All Cycles" |
| Cycle status changes | Rule remains linked, preview updates dynamically |
| No cycle selected | Rule applies to all matching cycles (current behavior) |
| Cycle from different company | Filter prevents selection; query enforces company scope |

