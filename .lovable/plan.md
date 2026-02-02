

# UI Update Plan: AttendancePoliciesPage.tsx
## Achieving Full Three-Layer Alignment (Database + UI + Documentation)

---

## Current State Analysis

### Database Schema (26 Columns - Source of Truth)
Verified all 26 columns exist in `attendance_policies`:
- Identity: `id`, `company_id`, `name`, `code`, `description`
- Thresholds: `grace_period_minutes`, `late_threshold_minutes`, `early_departure_threshold_minutes`
- Late Deduction: `auto_deduct_late`, `late_deduction_minutes`
- Rounding: `round_clock_in`, `round_clock_out`
- Time Collection: `require_photo_clock_in`, `require_photo_clock_out`, `require_geolocation`
- Operational Limits: `max_daily_hours`, `min_break_duration_minutes`, `auto_clock_out_hours`
- Status/Lifecycle: `is_default`, `is_active`, `start_date`, `end_date`
- Audit: `created_at`, `updated_at`
- i18n: `name_en`, `description_en`

### UI Currently Supports (18 of 26)
The form handles: `name`, `code`, `description`, `grace_period_minutes`, `late_threshold_minutes`, `early_departure_threshold_minutes`, `auto_deduct_late`, `late_deduction_minutes`, `round_clock_in`, `round_clock_out`, `require_photo_clock_in`, `require_photo_clock_out`, `require_geolocation`, `max_daily_hours`, `is_default`

### Gaps Identified (8 Missing Fields)

| Missing Field | Type | Priority | Reason |
|---------------|------|----------|--------|
| `min_break_duration_minutes` | integer | High | Compliance requirement |
| `auto_clock_out_hours` | numeric | High | Safety/operational limit |
| `is_active` | boolean | High | Policy lifecycle control |
| `start_date` | date | High | Effective dating |
| `end_date` | date | Medium | Policy expiration |
| `name_en` | text | Low | i18n support |
| `description_en` | text | Low | i18n support |
| `late_deduction_minutes` (conditional) | integer | High | Already in formData but no UI input |

### Missing Rounding Options
Current options: `none`, `nearest_5`, `nearest_15`, `nearest_30`, `up`, `down`
Missing: `nearest_6`, `nearest_10`

---

## Implementation Plan

### Step 1: Update Interface Definition
Add missing fields to the `AttendancePolicy` interface:

```typescript
interface AttendancePolicy {
  // ... existing fields ...
  min_break_duration_minutes: number;
  auto_clock_out_hours: number | null;
  start_date: string;
  end_date: string | null;
  name_en: string | null;
  description_en: string | null;
}
```

### Step 2: Update Form State
Add missing fields to `formData` initial state:

```typescript
const [formData, setFormData] = useState({
  // ... existing fields ...
  min_break_duration_minutes: 0,
  auto_clock_out_hours: null as number | null,
  is_active: true,
  start_date: new Date().toISOString().split('T')[0],
  end_date: null as string | null,
  name_en: "",
  description_en: "",
});
```

### Step 3: Add Missing Rounding Options
Update `roundingOptions` array:

```typescript
const roundingOptions = [
  { value: "none", label: t("timeAttendance.policies.noRounding") },
  { value: "nearest_5", label: t("timeAttendance.policies.nearest5") },
  { value: "nearest_6", label: t("timeAttendance.policies.nearest6") },  // NEW
  { value: "nearest_10", label: t("timeAttendance.policies.nearest10") }, // NEW
  { value: "nearest_15", label: t("timeAttendance.policies.nearest15") },
  { value: "nearest_30", label: t("timeAttendance.policies.nearest30") },
  { value: "up", label: t("timeAttendance.policies.roundUp") },
  { value: "down", label: t("timeAttendance.policies.roundDown") },
];
```

### Step 4: Add Operational Limits Section (New UI Section)
Add after Requirements section:

**Fields:**
- `min_break_duration_minutes` - Number input (minutes)
- `auto_clock_out_hours` - Number input (hours, nullable)
- `max_daily_hours` - Already exists, move to this section

### Step 5: Add Late Deduction Minutes Input (Conditional)
When `auto_deduct_late` is enabled, show the `late_deduction_minutes` input:

```tsx
{formData.auto_deduct_late && (
  <div className="space-y-2 ml-6">
    <Label>{t("timeAttendance.policies.lateDeductionMinutes")}</Label>
    <Input 
      type="number" 
      value={formData.late_deduction_minutes} 
      onChange={(e) => setFormData({ ...formData, late_deduction_minutes: parseInt(e.target.value) || 0 })} 
    />
  </div>
)}
```

### Step 6: Add Policy Lifecycle Section (New UI Section)
Add after Operational Limits:

**Fields:**
- `is_active` - Switch (Active/Inactive)
- `start_date` - Date input (required)
- `end_date` - Date input (optional, for policy expiration)

### Step 7: Add Internationalization Section (Collapsible - Advanced)
Add at bottom with collapsible accordion:

**Fields:**
- `name_en` - Text input (English name)
- `description_en` - Textarea (English description)

### Step 8: Update Table Display
Add Status column showing `is_active` status:

```tsx
<TableHead>{t("common.status")}</TableHead>
// ...
<TableCell>
  <Badge variant={policy.is_active ? "default" : "secondary"}>
    {policy.is_active ? t("common.active") : t("common.inactive")}
  </Badge>
</TableCell>
```

### Step 9: Update openEdit Function
Map all new fields when editing:

```typescript
const openEdit = (policy: AttendancePolicy) => {
  setEditingPolicy(policy);
  setFormData({
    // ... existing fields ...
    min_break_duration_minutes: policy.min_break_duration_minutes || 0,
    auto_clock_out_hours: policy.auto_clock_out_hours,
    is_active: policy.is_active,
    start_date: policy.start_date,
    end_date: policy.end_date,
    name_en: policy.name_en || "",
    description_en: policy.description_en || "",
  });
  setDialogOpen(true);
};
```

### Step 10: Update resetForm Function
Include all new fields in reset:

```typescript
const resetForm = () => {
  setEditingPolicy(null);
  setFormData({
    // ... existing fields ...
    min_break_duration_minutes: 0,
    auto_clock_out_hours: null,
    is_active: true,
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    name_en: "",
    description_en: "",
  });
};
```

---

## Updated Dialog Structure (Visual Layout)

```text
+--------------------------------------------------+
| Add/Edit Attendance Policy                        |
+--------------------------------------------------+
| IDENTITY                                          |
| [Name *]              [Code *]                    |
| [Description                                   ]  |
+--------------------------------------------------+
| TIME THRESHOLDS                                   |
| [Grace Period] [Late Threshold] [Early Departure] |
+--------------------------------------------------+
| PUNCH ROUNDING                                    |
| [Clock-In Rounding ▼]  [Clock-Out Rounding ▼]    |
+--------------------------------------------------+
| TIME COLLECTION REQUIREMENTS                      |
| [x] Require Photo (Clock-In)                     |
| [x] Require Photo (Clock-Out)                    |
| [x] Require Geolocation                          |
+--------------------------------------------------+
| LATE DEDUCTION                                    |
| [x] Auto-Deduct Late                             |
|     └─ [Late Deduction Minutes: ___]             |
+--------------------------------------------------+
| OPERATIONAL LIMITS (NEW)                          |
| [Max Daily Hours] [Min Break Duration] [Auto Out] |
+--------------------------------------------------+
| POLICY LIFECYCLE (NEW)                            |
| [x] Active        [Start Date] [End Date]        |
| [x] Set as Default                               |
+--------------------------------------------------+
| ▶ INTERNATIONALIZATION (Collapsible)              |
|   [English Name]  [English Description]          |
+--------------------------------------------------+
|                          [Cancel]  [Save]        |
+--------------------------------------------------+
```

---

## Translation Keys to Add

The following translation keys need to be added to support the new fields:

```json
{
  "timeAttendance.policies.nearest6": "Nearest 6 min",
  "timeAttendance.policies.nearest10": "Nearest 10 min",
  "timeAttendance.policies.minBreakDuration": "Min Break Duration",
  "timeAttendance.policies.autoClockOut": "Auto Clock-Out After",
  "timeAttendance.policies.operationalLimits": "Operational Limits",
  "timeAttendance.policies.policyLifecycle": "Policy Lifecycle",
  "timeAttendance.policies.startDate": "Start Date",
  "timeAttendance.policies.endDate": "End Date",
  "timeAttendance.policies.lateDeductionMinutes": "Late Deduction Minutes",
  "timeAttendance.policies.internationalization": "Internationalization",
  "timeAttendance.policies.englishName": "English Name",
  "timeAttendance.policies.englishDescription": "English Description"
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/time-attendance/AttendancePoliciesPage.tsx` | Add 8 missing fields, 2 rounding options, reorganize form sections |
| `public/locales/en/translation.json` | Add new translation keys |

---

## Success Criteria

After implementation:

1. All 26 database columns are represented in the UI form
2. All 8 rounding options available (including `nearest_6`, `nearest_10`)
3. Conditional UI for `late_deduction_minutes` when `auto_deduct_late` is enabled
4. Policy lifecycle management with `is_active`, `start_date`, `end_date`
5. Operational limits section for compliance fields
6. i18n section for multi-language support
7. Table displays policy status (Active/Inactive)
8. Form validation ensures required fields are present
9. Full alignment: Database = UI = Documentation

---

## Technical Notes

- The `Collapsible` component from Radix UI can be used for the i18n section
- Date inputs will use standard HTML date inputs (type="date")
- Nullable number fields (`auto_clock_out_hours`) need special handling for empty state
- The dialog may need increased `max-h-[70vh]` to accommodate new sections

