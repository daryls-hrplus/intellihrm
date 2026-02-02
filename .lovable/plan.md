

# Section 2.2 (TAFoundationTimePolicies.tsx) Rewrite Plan
## Industry-Aligned, Schema-Accurate Documentation

---

## Executive Summary

This plan addresses a **critical documentation gap** where the current Section 2.2 (Attendance Policies Configuration) contains **15 fabricated/incorrect fields** that do not exist in the actual `attendance_policies` database table. The rewrite will:

1. Align all 26 database columns with accurate documentation
2. Apply **enterprise industry-standard terminology** (UKG/Kronos, Workday, SAP patterns)
3. Document the **dual-layer rounding architecture** (Base Policy + Shift Override)
4. Incorporate **FLSA/DOL compliance guidance** including the 7-Minute Rule reference
5. Add **regional compliance considerations** for Caribbean/African labor law contexts

---

## Part 1: Terminology Alignment (Industry Standards)

Based on UKG Workforce Dimensions, Kronos, SAP SuccessFactors, and FLSA guidelines, the following terminology updates will be applied:

| Current (Inconsistent) | Industry Standard Term | Source |
|------------------------|------------------------|--------|
| "Rounding method" | **Punch Rounding** | UKG Dimensions Glossary |
| "Late tolerance" | **Grace Period** | UKG: "Graces determine when shift start and end times round to the previous increment" |
| "Clock punch" | **Punch** or **Time Punch** | UKG: "Entries that mark the beginning (in-punch) or end (out-punch) of a work interval" |
| "Early clock-in" | **Pre-Shift Punch** | Kronos: "Early punch is a punch that is before your scheduled start time" |
| "Late arrival" | **Tardiness** or **Late Punch** | UKG: "Punches that are bordered in a color other than black are exceptions" |
| "Break deduction" | **Automatic Meal Deduction** | SAP SuccessFactors Time Management |
| "Policy" | **Attendance Policy** | UKG: "Attendance policies define the rules for employee attendance behavior" |
| "Auto-terminate shift" | **Auto Clock-Out** | Industry standard terminology |
| "Time record" | **Timecard** or **Timesheet** | UKG: "The type of timecard used by employees who punch in and out" |

---

## Part 2: Schema Correction (Database Alignment)

### Fields to REMOVE (Fabricated - Do Not Exist)

The following 15 fields will be removed from documentation as they do not exist in the `attendance_policies` table:

1. `policy_name` (should be `name`)
2. `rounding_method` (should be `round_clock_in` + `round_clock_out`)
3. `rounding_interval_minutes` (does not exist in base policy; exists in `shift_rounding_rules`)
4. `early_clock_in_minutes` (does not exist)
5. `late_tolerance_minutes` (should be `late_threshold_minutes`)
6. `daily_ot_threshold_hours` (does not exist; overtime is calculated elsewhere)
7. `weekly_ot_threshold_hours` (does not exist; overtime is calculated elsewhere)
8. `require_break_tracking` (does not exist)
9. `auto_deduct_break_minutes` (does not exist; only `min_break_duration_minutes`)
10. `break_deduct_after_hours` (does not exist)

### Correct Schema (26 Columns)

**Group A: Identity & Metadata**
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | Yes | gen_random_uuid() | Primary key |
| `company_id` | uuid | Yes | - | FK to companies table |
| `name` | text | Yes | - | Policy display name (e.g., "Standard Office Policy") |
| `code` | text | Yes | - | Unique policy code (e.g., "STD-OFFICE-001") |
| `description` | text | No | null | Policy description and notes |

**Group B: Threshold Configuration**
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `grace_period_minutes` | integer | No | 0 | Minutes before punch is considered late (UKG: "Grace") |
| `late_threshold_minutes` | integer | No | 15 | Minutes after grace before exception is flagged |
| `early_departure_threshold_minutes` | integer | No | 15 | Minutes before shift end considered early departure |

**Group C: Late Deduction (Payroll Integration)**
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `auto_deduct_late` | boolean | No | false | Automatically deduct minutes for late arrivals |
| `late_deduction_minutes` | integer | No | 0 | Fixed minutes to deduct when late (if auto_deduct_late=true) |

**Group D: Punch Rounding (Per-Punch)**
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `round_clock_in` | text | No | 'none' | Rounding rule for clock-in punches |
| `round_clock_out` | text | No | 'none' | Rounding rule for clock-out punches |

**Valid Values for Rounding Fields:**
- `none` - No rounding, exact times recorded
- `nearest_5` - Round to nearest 5 minutes
- `nearest_6` - Round to nearest 6 minutes (1/10th hour, common in manufacturing)
- `nearest_10` - Round to nearest 10 minutes
- `nearest_15` - Round to nearest 15 minutes (most common, FLSA-compliant)
- `nearest_30` - Round to nearest 30 minutes
- `up` - Always round up (employee-favorable)
- `down` - Always round down (employer-favorable, use with caution)

**Group E: Time Collection Requirements**
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `require_photo_clock_in` | boolean | No | false | Photo capture required on clock-in |
| `require_photo_clock_out` | boolean | No | false | Photo capture required on clock-out |
| `require_geolocation` | boolean | No | false | GPS coordinates required for punches |

**Group F: Operational Limits**
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `max_daily_hours` | numeric | No | 24 | Maximum hours per day (auto-terminate trigger) |
| `min_break_duration_minutes` | integer | No | 0 | Minimum break duration for compliance |
| `auto_clock_out_hours` | numeric | No | null | Auto-terminate shift after X hours (if set) |

**Group G: Status & Lifecycle**
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `is_default` | boolean | No | false | Default policy for new employees |
| `is_active` | boolean | Yes | true | Policy is currently active |
| `start_date` | date | Yes | CURRENT_DATE | Policy effective from date |
| `end_date` | date | No | null | Policy expiration date (effective dating) |

**Group H: Audit**
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `created_at` | timestamptz | Yes | now() | Record creation timestamp |
| `updated_at` | timestamptz | Yes | now() | Last modification timestamp |

**Group I: Internationalization (i18n)**
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `name_en` | text | No | null | English translation of policy name |
| `description_en` | text | No | null | English translation of description |

---

## Part 3: Dual-Layer Rounding Architecture

A critical concept to document is the **two-layer rounding system**, which mirrors enterprise standards from Workday and SAP:

```text
                     PUNCH ROUNDING RESOLUTION FLOW
                     ==============================

    Employee Clocks In
           |
           v
    ┌──────────────────────────────────────────────────┐
    │  LAYER 2: Shift Rounding Rules (shift_rounding_rules)  │
    │  ─────────────────────────────────────────────────────  │
    │  • Shift-specific OR company-wide                      │
    │  • Granular: rule_type, interval, direction, grace     │
    │  • Takes PRECEDENCE when assigned                      │
    └──────────────────────────────────────────────────┘
           |
           │ No Shift Rule? Fall back...
           v
    ┌──────────────────────────────────────────────────┐
    │  LAYER 1: Base Attendance Policy (attendance_policies) │
    │  ───────────────────────────────────────────────────── │
    │  • Company-wide defaults                               │
    │  • Simpler: round_clock_in, round_clock_out            │
    │  • Always applies if no shift override                 │
    └──────────────────────────────────────────────────┘
           |
           v
    Final Rounded Time Applied
```

**Why Two Layers?**
- **Layer 1 (Base Policy):** Provides company-wide defaults. Simple configuration for most organizations.
- **Layer 2 (Shift Override):** Allows different rounding for night shifts, manufacturing lines, or specific roles without creating separate policies.

**Example Resolution:**
1. Employee "John" assigned to "Standard Office Policy" (round_clock_in: nearest_15)
2. John works the "Night Shift" which has a shift_rounding_rule (rule_type: clock_in, interval: 6, direction: nearest)
3. **Result:** Night Shift rule (6-minute nearest) overrides base policy (15-minute nearest) for clock-in punches

---

## Part 4: Business Rules (Updated)

| Rule | Enforcement | Description |
|------|-------------|-------------|
| **Dual-Layer Rounding Override** | System | Shift rounding rules (Layer 2) override base attendance policy rounding (Layer 1) when assigned. |
| **Per-Punch Rounding** | System | `round_clock_in` and `round_clock_out` are configured independently. Different rounding can apply to start vs end of shift. |
| **7-Minute Rule (FLSA)** | Advisory | When using 15-minute rounding with "nearest" direction, punches 1-7 minutes round down, 8-14 minutes round up. This is FLSA-compliant as it averages neutral over time. |
| **Grace Period Application** | System | Grace period applies BEFORE tardiness threshold. If grace = 5 min and late_threshold = 10 min, employee is marked late at minute 16 (5 + 10 + 1). |
| **Late Deduction Integration** | System | When `auto_deduct_late=true`, the system deducts `late_deduction_minutes` from worked hours for payroll. |
| **Effective Dating** | System | `start_date` and `end_date` control when a policy is active. Historical timecards retain the policy rules that were in effect at punch time. |
| **Photo/GPS Enforcement** | System | If `require_photo_clock_in=true`, punch is rejected without photo capture. Same for geolocation. |
| **One Default Per Company** | System | Only one policy can have `is_default=true` per company. Setting a new default automatically unsets the previous. |

---

## Part 5: FLSA/DOL Compliance Section

### The 7-Minute Rule Explained

The Department of Labor (DOL) permits rounding practices under the Fair Labor Standards Act (FLSA) when:
1. Rounding averages out to be neutral over time (not systematically favoring employer or employee)
2. Applied consistently to all punches (both clock-in and clock-out)

**15-Minute Rounding Example (Most Common):**

| Punch Time | Rounds To | Explanation |
|------------|-----------|-------------|
| 8:00 | 8:00 | Exact |
| 8:01 - 8:07 | 8:00 | Within 7 minutes, rounds DOWN |
| 8:08 - 8:14 | 8:15 | 8+ minutes, rounds UP |
| 8:15 | 8:15 | Exact |

**Compliance Warning:**
- **AVOID**: Rounding DOWN for clock-in AND DOWN for clock-out (systematically reduces hours)
- **AVOID**: Rounding UP for clock-in AND UP for clock-out (systematically increases hours)
- **RECOMMENDED**: Use "nearest" direction for both punches, or "up" for clock-out with "down" for clock-in (neutral)

### Caribbean/African Regional Considerations

Labor laws vary by jurisdiction. Key considerations:
- **Trinidad & Tobago:** Industrial Relations Act may require documented rounding policies
- **Jamaica:** Employment (Termination of Employment) Act impacts attendance-based disciplinary actions
- **Dominican Republic:** Code du Travail (Labor Code) has specific overtime thresholds
- **Ghana:** Labour Act, 2003 (Act 651) defines maximum working hours
- **Nigeria:** Labour Act CAP L1 LFN 2004 specifies overtime compensation rules

**Recommendation:** Consult local labor counsel before implementing rounding policies that deviate from exact time recording.

---

## Part 6: Configuration Examples (Updated)

### Common Policy Configurations

| Policy Type | round_clock_in | round_clock_out | grace_period | late_threshold | require_photo |
|-------------|----------------|-----------------|--------------|----------------|---------------|
| Standard Office | nearest_15 | nearest_15 | 5 min | 15 min | false |
| Manufacturing | nearest_6 | nearest_6 | 0 min | 5 min | true |
| Field Staff | none | none | 15 min | 30 min | true + GPS |
| Retail | nearest_15 | nearest_15 | 5 min | 10 min | false |
| Healthcare | nearest_6 | nearest_6 | 3 min | 10 min | true |
| Flex Workers | nearest_15 | none | 30 min | 60 min | false |

### Configuration Examples with Business Context

**Example 1: Hospital Nursing Staff**
- **Context:** 12-hour shifts, strict handoff requirements, OSHA compliance
- **Configuration:**
  - `round_clock_in`: nearest_6 (1/10th hour for decimal payroll)
  - `round_clock_out`: nearest_6
  - `grace_period_minutes`: 3
  - `late_threshold_minutes`: 10
  - `require_photo_clock_in`: true
  - `require_geolocation`: true
- **Outcome:** Precise time tracking for patient care continuity; photo verification prevents buddy punching

**Example 2: Caribbean Resort (Multi-Shift)**
- **Context:** Tourism industry, multiple shifts (day/night/graveyard), seasonal workers
- **Configuration:**
  - `round_clock_in`: nearest_15
  - `round_clock_out`: nearest_15
  - `grace_period_minutes`: 5
  - `late_threshold_minutes`: 15
  - `require_photo_clock_in`: true (for outdoor staff)
  - `require_geolocation`: true (verify on-property)
- **Outcome:** Balanced rounding that complies with Trinidad & Tobago labor law; photo + GPS for distributed workforce

**Example 3: Nigerian Oil & Gas Field Operations**
- **Context:** Remote sites, 14-day rotation, strict safety compliance
- **Configuration:**
  - `round_clock_in`: none (exact times)
  - `round_clock_out`: none (exact times)
  - `grace_period_minutes`: 0
  - `late_threshold_minutes`: 5
  - `require_photo_clock_in`: true
  - `require_geolocation`: true
  - `auto_clock_out_hours`: 14 (safety limit)
- **Outcome:** Exact time for safety compliance audits; automatic clock-out prevents excessive hours

---

## Part 7: Updated Step-by-Step Configuration

1. **Navigate to Attendance Policies**
   - Path: Time & Attendance → Setup → Attendance Policies
   - Note: Requires Time Admin or Super Admin role

2. **Create New Policy**
   - Click "Add Policy"
   - Enter `name` (display name, e.g., "Standard Office Policy")
   - Enter `code` (unique identifier, e.g., "STD-OFFICE-001")
   - Optional: Add `description` for documentation

3. **Configure Threshold Settings**
   - `grace_period_minutes`: Minutes before punch is considered late
   - `late_threshold_minutes`: Minutes after grace before exception flagged
   - `early_departure_threshold_minutes`: Early leave tolerance

4. **Set Per-Punch Rounding**
   - `round_clock_in`: Select rounding method for clock-in punches
   - `round_clock_out`: Select rounding method for clock-out punches
   - **Tip:** Use "nearest_15" for FLSA/DOL compliance (7-Minute Rule)

5. **Configure Time Collection Requirements**
   - Enable `require_photo_clock_in` for photo verification
   - Enable `require_photo_clock_out` if needed
   - Enable `require_geolocation` for GPS validation (pairs with Geofencing in Section 2.9)

6. **Set Late Deduction (Optional)**
   - Enable `auto_deduct_late` if late arrivals should reduce paid hours
   - Set `late_deduction_minutes` for fixed deduction amount

7. **Configure Operational Limits**
   - `max_daily_hours`: Maximum hours per day (safety limit)
   - `min_break_duration_minutes`: Minimum break for compliance
   - `auto_clock_out_hours`: Auto-terminate after X hours (optional)

8. **Set Effective Dates**
   - `start_date`: When policy becomes active
   - `end_date`: When policy expires (leave null for no expiration)
   - `is_default`: Set true if this is the default for new employees

9. **Assign to Employees**
   - Navigate to Section 2.3 (Policy Assignments)
   - Assign by employee, department, location, or job

---

## Part 8: Cross-References (Integration Points)

| Related Section | Relationship |
|-----------------|--------------|
| **Section 2.16: Shift Rounding Rules** | Override mechanism; shift rules take precedence over base policy |
| **Section 2.3: Policy Assignments** | How policies are assigned to employees, departments, locations |
| **Section 2.9: Geofencing Configuration** | GPS boundaries that validate `require_geolocation` flag |
| **Section 4: Day-to-Day Operations** | How policies affect clock entries and exception handling |
| **Payroll Module** | Late deduction and rounding flow to payroll calculations |

---

## Part 9: Learning Objectives (Updated)

After completing this section, administrators will be able to:

1. Configure base attendance policies with accurate `attendance_policies` fields
2. Understand the dual-layer rounding architecture (Base Policy + Shift Override)
3. Apply FLSA-compliant rounding using the 7-Minute Rule pattern
4. Set up time collection requirements (photo, GPS) for workforce verification
5. Configure late deduction rules for payroll integration
6. Manage policy lifecycle with effective dating (`start_date`, `end_date`)
7. Understand regional compliance considerations for Caribbean/African jurisdictions

---

## Implementation Details

### File to Modify
`src/components/enablement/time-attendance-manual/sections/foundation/TAFoundationTimePolicies.tsx`

### Component Structure (Preserved)
- Keep existing component imports (`Card`, `Badge`, `LearningObjectives`, etc.)
- Keep anchor ID: `ta-sec-2-2`
- Keep reading time badge format
- Follow pattern from `TAFoundationShiftRoundingRules.tsx`

### Estimated Size
- Current: ~295 lines
- Rewritten: ~450-500 lines (more comprehensive, accurate content)

### Key Changes Summary
1. Replace 15 fabricated fields with 26 actual schema columns
2. Add dual-layer architecture visual explainer
3. Add 7-Minute Rule FLSA compliance section
4. Update rounding options to actual enum values
5. Add regional compliance callout
6. Update configuration examples with actual field names
7. Add cross-reference integration callout
8. Update business rules to match system behavior

---

## Success Criteria

1. All 26 database columns accurately documented with correct field names
2. Industry-standard terminology applied (UKG/Kronos/SAP alignment)
3. Dual-layer architecture clearly explained with visual diagram
4. FLSA/DOL 7-Minute Rule compliance guidance included
5. Regional (Caribbean/African) compliance considerations documented
6. Business rules match actual system behavior
7. No fabricated fields remain in documentation
8. Cross-references to related sections (2.3, 2.9, 2.16, Payroll) included

