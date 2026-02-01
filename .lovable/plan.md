

# Updated Plan: Complete Coverage of Shift Rounding Rules & Payment Rules

## Critical Gap Discovery

Your screenshots reveal **two major undocumented features** that were NOT adequately addressed in my previous Chapter 2 plan:

| Feature | DB Table | DB Columns | UI Page | Current Doc Status |
|---------|----------|------------|---------|-------------------|
| **Shift Rounding Rules** | `shift_rounding_rules` | 16 columns | `/time-attendance/shifts/rounding-rules` | Was in Ch 2 plan as Section 2.16 |
| **Shift Payment Rules** | `shift_payment_rules` | 20 columns | `/time-attendance/shifts/payment-rules` | **MISSING FROM PLAN** |
| **Shifts (Base Definition)** | `shifts` | 18 columns | `/time-attendance/shifts` | Chapter 3 placeholder only |

---

## Architecture Clarification

Based on database analysis, IntelliHRM has a **three-layer shift configuration architecture**:

```text
Layer 1: SHIFTS (Base Definition)
Table: shifts
Purpose: Define the shift itself (name, times, breaks)

Layer 2: SHIFT ROUNDING RULES
Table: shift_rounding_rules  
Purpose: How punches are rounded for this shift

Layer 3: SHIFT PAYMENT RULES
Table: shift_payment_rules
Purpose: Premium pay for this shift (differentials, OT multipliers)
```

All three tables have `shift_id` as a foreign key, allowing rules to apply to:
- **All Shifts** (when `shift_id` is null)
- **Specific Shifts** (when `shift_id` references a shift)

---

## Complete Database Schema Analysis

### shifts Table (18 columns)
| Column | Type | Required | Default | UI Field |
|--------|------|----------|---------|----------|
| `id` | uuid | Yes | auto | — |
| `company_id` | uuid | Yes | — | Company selector |
| `name` | varchar | Yes | — | Name* |
| `code` | varchar | Yes | — | Code* |
| `description` | text | No | null | Description |
| `start_time` | time | Yes | — | Start Time |
| `end_time` | time | Yes | — | End Time |
| `crosses_midnight` | boolean | No | false | Crosses Midnight toggle |
| `break_duration_minutes` | integer | No | 60 | Break Duration (minutes) |
| `minimum_hours` | numeric | No | 8 | Minimum Hours |
| `is_overnight` | boolean | No | false | (internal) |
| `color` | varchar | No | '#3b82f6' | Color picker |
| `is_active` | boolean | No | true | (Active toggle) |
| `start_date` | date | Yes | CURRENT_DATE | Start Date |
| `end_date` | date | No | null | End Date |
| `location_id` | uuid | No | null | (location filter) |
| `created_at` | timestamptz | Yes | now() | — |
| `updated_at` | timestamptz | Yes | now() | — |

### shift_rounding_rules Table (16 columns)
| Column | Type | Required | Default | UI Field |
|--------|------|----------|---------|----------|
| `id` | uuid | Yes | auto | — |
| `company_id` | uuid | Yes | — | Company selector |
| `shift_id` | uuid | No | null | Apply to Shift dropdown |
| `name` | varchar | Yes | — | Name* |
| `description` | text | No | null | Description |
| `rule_type` | varchar | Yes | — | Rule Type (clock_in/clock_out/both) |
| `rounding_interval` | integer | Yes | 15 | Rounding Interval dropdown |
| `rounding_direction` | varchar | Yes | — | Rounding Direction (up/down/nearest) |
| `grace_period_minutes` | integer | No | 0 | Grace Period input |
| `grace_period_direction` | varchar | No | null | (direction for grace) |
| `apply_to_overtime` | boolean | No | true | Apply to Overtime toggle |
| `is_active` | boolean | No | true | Active toggle |
| `start_date` | date | Yes | CURRENT_DATE | — |
| `end_date` | date | No | null | — |
| `created_at` | timestamptz | Yes | now() | — |
| `updated_at` | timestamptz | Yes | now() | — |

### shift_payment_rules Table (20 columns)
| Column | Type | Required | Default | UI Field |
|--------|------|----------|---------|----------|
| `id` | uuid | Yes | auto | — |
| `company_id` | uuid | Yes | — | Company selector |
| `shift_id` | uuid | No | null | Apply to Shift dropdown |
| `name` | varchar | Yes | — | Name* |
| `code` | varchar | Yes | — | Code* |
| `description` | text | No | null | Description |
| `payment_type` | varchar | Yes | — | Payment Type (percentage/flat_rate/multiplier) |
| `amount` | numeric | Yes | — | Amount |
| `applies_to` | varchar | Yes | — | Applies To (all_hours/overtime/night_shift/weekend/holiday) |
| `day_of_week` | integer[] | No | null | (Day filter) |
| `start_time` | time | No | null | (Time range) |
| `end_time` | time | No | null | (Time range) |
| `minimum_hours_threshold` | numeric | No | null | (Hours threshold) |
| `is_taxable` | boolean | No | true | Taxable toggle |
| `is_active` | boolean | No | true | Active toggle |
| `priority` | integer | No | 0 | Priority |
| `start_date` | date | Yes | CURRENT_DATE | — |
| `end_date` | date | No | null | — |
| `created_at` | timestamptz | Yes | now() | — |
| `updated_at` | timestamptz | Yes | now() | — |

---

## Revised Implementation Plan

### Decision: Keep Rounding Rules in Chapter 2 or Move to Chapter 3?

**Recommendation: Keep Section 2.16 (Shift Rounding Rules) in Chapter 2**

Rationale:
- Rounding rules affect how time is *captured* (foundation-level)
- They work alongside attendance policies
- Industry standard: Kronos/UKG groups rounding with policy setup

**Add Payment Rules to Chapter 3 (Shift Management)**

Rationale:
- Payment rules affect *compensation* (shift-level concern)
- They're about differentials and premiums
- Industry standard: These belong with shift configuration

---

## Updated File Changes

### Chapter 2 Changes (From Previous Plan + Fix)

| Section | File | Status |
|---------|------|--------|
| 2.16 Shift Rounding Rules | `TAFoundationShiftRoundingRules.tsx` | **Correct fields now confirmed** |

### NEW: Chapter 3 Comprehensive Upgrade

#### Proposed Chapter 3 Structure (New Sections)

```text
Chapter 3: Shift Management (~80 min read)

A. Shift Definitions (2 sections)
   3.1  Shifts Overview [NEW]
   3.2  Shift Configuration [NEW - covers shifts table]

B. Shift Assignments (2 sections)
   3.3  Employee Shift Assignments [NEW]
   3.4  Shift Calendar [NEW]

C. Rotation & Patterns (2 sections)
   3.5  Rotation Patterns [NEW]
   3.6  Shift Templates [NEW - covers shift_templates]

D. Shift Compensation (2 sections)
   3.7  Shift Differentials [NEW]
   3.8  Payment Rules [NEW - covers shift_payment_rules]

E. Advanced (2 sections)
   3.9  Shift Swaps [NEW]
   3.10 Shift Coverage Requirements [NEW]
```

### Files to Create

| File | Section | Tables Covered |
|------|---------|----------------|
| `TAShiftOverview.tsx` | 3.1 | — (concepts) |
| `TAShiftConfiguration.tsx` | 3.2 | `shifts` (18 cols) |
| `TAShiftAssignments.tsx` | 3.3 | `employee_shift_assignments` |
| `TAShiftCalendar.tsx` | 3.4 | — (UI reference) |
| `TARotationPatterns.tsx` | 3.5 | `shift_rotation_patterns`, `rotation_entries` |
| `TAShiftTemplates.tsx` | 3.6 | `shift_templates`, `shift_template_entries` |
| `TAShiftDifferentials.tsx` | 3.7 | `shift_differentials` |
| `TAShiftPaymentRules.tsx` | 3.8 | `shift_payment_rules` (20 cols) |
| `TAShiftSwaps.tsx` | 3.9 | `shift_swap_requests` |
| `TAShiftCoverage.tsx` | 3.10 | `shift_coverage_requirements` |

### Files to Update

| File | Changes |
|------|---------|
| `TimeAttendanceManualShiftSection.tsx` | Transform to grouped accordion structure (like Ch 2) |
| `sections/shift/index.ts` | Create and export new components |
| `timeAttendanceManual.ts` | Add 10 new section definitions for Ch 3 |

---

## Immediate Priority: Complete Section 2.16 + Add Payment Rules Doc

### Step 1: Fix Section 2.16 (Shift Rounding Rules)

The plan already included this, but now with confirmed fields:

```typescript
// Verified field list for shift_rounding_rules
const shiftRoundingRulesFields = [
  { name: 'name', required: true, type: 'varchar', description: 'Rule display name' },
  { name: 'description', required: false, type: 'text', description: 'Rule description' },
  { name: 'shift_id', required: false, type: 'uuid', description: 'Apply to specific shift or All Shifts (null)' },
  { name: 'rule_type', required: true, type: 'enum', description: 'clock_in, clock_out, or both' },
  { name: 'rounding_interval', required: true, type: 'integer', description: '5, 6, 10, 15, or 30 minutes' },
  { name: 'rounding_direction', required: true, type: 'enum', description: 'up, down, or nearest' },
  { name: 'grace_period_minutes', required: false, type: 'integer', description: 'Minutes before rounding applies' },
  { name: 'apply_to_overtime', required: false, type: 'boolean', description: 'Also apply to overtime punches' },
  { name: 'is_active', required: false, type: 'boolean', description: 'Rule is active' },
];
```

### Step 2: Create Section 3.8 (Shift Payment Rules) - NEW

```typescript
// Verified field list for shift_payment_rules
const shiftPaymentRulesFields = [
  { name: 'name', required: true, type: 'varchar', description: 'Rule display name' },
  { name: 'code', required: true, type: 'varchar', description: 'Unique rule code' },
  { name: 'description', required: false, type: 'text', description: 'Rule description' },
  { name: 'shift_id', required: false, type: 'uuid', description: 'Apply to specific shift or All Shifts (null)' },
  { name: 'payment_type', required: true, type: 'enum', description: 'percentage, flat_rate, or multiplier' },
  { name: 'amount', required: true, type: 'numeric', description: 'Percentage %, flat $, or multiplier X' },
  { name: 'applies_to', required: true, type: 'enum', description: 'all_hours, overtime, night_shift, weekend, holiday' },
  { name: 'day_of_week', required: false, type: 'integer[]', description: 'Restrict to specific days (0=Sun, 6=Sat)' },
  { name: 'start_time', required: false, type: 'time', description: 'Time range start' },
  { name: 'end_time', required: false, type: 'time', description: 'Time range end' },
  { name: 'minimum_hours_threshold', required: false, type: 'numeric', description: 'Min hours to trigger' },
  { name: 'is_taxable', required: false, type: 'boolean', description: 'Payment is taxable' },
  { name: 'priority', required: false, type: 'integer', description: 'Processing order (higher = first)' },
  { name: 'is_active', required: false, type: 'boolean', description: 'Rule is active' },
];
```

---

## Industry Comparison After Full Implementation

| Feature | Kronos/UKG | Workday | SAP | Oracle | IntelliHRM (After) |
|---------|-----------|---------|-----|--------|-------------------|
| Shift definitions with time/breaks | Yes | Yes | Yes | Yes | **Yes (3.2)** |
| Separate rounding per punch type | Yes | Yes | Yes | Yes | **Yes (2.16)** |
| Shift-specific rounding overrides | Yes | Yes | Yes | Yes | **Yes (2.16)** |
| Grace period on rounding | Yes | Yes | Yes | Yes | **Yes (2.16)** |
| Apply rounding to OT | Yes | Yes | Yes | Yes | **Yes (2.16)** |
| Payment type options | Yes | Yes | Yes | Yes | **Yes (3.8)** |
| Shift differentials | Yes | Yes | Yes | Yes | **Yes (3.7-3.8)** |
| Day-of-week restrictions | Yes | Yes | Yes | Yes | **Yes (3.8)** |
| Priority-based rule processing | Yes | Yes | Yes | Yes | **Yes (3.8)** |

---

## Implementation Summary

### Immediate (With This Request)

1. **Create `TAFoundationShiftRoundingRules.tsx`** (Section 2.16)
   - Full field reference table with verified schema
   - Business rules documentation
   - Step-by-step configuration guide
   - UI page reference: `/time-attendance/shifts/rounding-rules`

2. **Create `TAShiftPaymentRules.tsx`** (Section 3.8)
   - Full field reference table for `shift_payment_rules`
   - Payment type explanations (percentage vs flat vs multiplier)
   - Applies-to category documentation
   - UI page reference: `/time-attendance/shifts/payment-rules`

3. **Update `TimeAttendanceManualShiftSection.tsx`**
   - Transform from placeholder to grouped accordion
   - Include new sections

### Follow-Up (Chapter 3 Full Upgrade)

4. Create remaining 8 section components for Chapter 3
5. Update types and exports
6. Add cross-references to Payroll (payment rules → earnings)

---

## Technical Details

### Dual-Layer Documentation Approach

The manual will explain IntelliHRM's two-layer rounding system:

```text
Layer 1: Attendance Policy (Base)
- Applies company-wide
- Simpler options: none, nearest_5/15/30, up, down
- Per-punch-type (round_clock_in, round_clock_out)

Layer 2: Shift Rounding Rules (Override)
- Applies to specific shifts (or all)
- More granular: rule_type, interval, direction, grace
- Can override base policy per shift
```

This dual-layer architecture is similar to Workday's approach and should be clearly documented.

### Payment Rules → Payroll Integration Note

The documentation will include a cross-reference note:

```text
Shift payment rules integrate with Payroll via:
- earning_types table (payment_type maps to earning category)
- payroll_entries (calculated amounts flow as line items)

When creating payment rules, ensure corresponding earning types
exist in Payroll → Earnings Configuration.
```

---

## Files Changed Summary

| File | Action |
|------|--------|
| `src/components/enablement/time-attendance-manual/sections/foundation/TAFoundationShiftRoundingRules.tsx` | **CREATE** |
| `src/components/enablement/time-attendance-manual/sections/shift/TAShiftPaymentRules.tsx` | **CREATE** |
| `src/components/enablement/time-attendance-manual/sections/shift/index.ts` | **CREATE** |
| `src/components/enablement/time-attendance-manual/TimeAttendanceManualShiftSection.tsx` | **UPDATE** |
| `src/components/enablement/time-attendance-manual/sections/foundation/index.ts` | **UPDATE** |
| `src/types/timeAttendanceManual.ts` | **UPDATE** |

