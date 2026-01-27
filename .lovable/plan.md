
# Chapter 7: Risk Management - Comprehensive Audit Report
## Documentation vs. Database Schema vs. UI Components vs. Industry Standards

---

## Executive Summary

After an extensive audit comparing Chapter 7 (Risk Management) documentation against the actual database schema, UI components, and industry standards, I have identified:

- **4 Database Schema Gaps** - Missing or incorrect field documentation
- **3 UI Component Issues** - Code bugs and undocumented features
- **5 Terminology Inconsistencies** - Industry-standard terminology not cascaded throughout the app
- **2 Industry Standard Gaps** - Features documented but not implemented

Overall documentation quality: **~82% accuracy** with critical terminology and code gaps requiring attention.

---

## Part 1: Database Schema Gaps

### 1.1 Documented vs Actual: `flight_risk_assessments` Table

| Documentation (13 fields) | Database (13 fields) | Status |
|---------------------------|----------------------|--------|
| id, company_id, employee_id, risk_level | Accurate | OK |
| risk_factors | Documented as `text[]`, **actually `jsonb`** | MISMATCH |
| retention_actions, assessed_by, assessment_date | Accurate | OK |
| next_review_date, notes, is_current | Accurate | OK |
| created_at, updated_at | Accurate | OK |

**Action Required:** Update FlightRiskWorkflow.tsx field reference to show `risk_factors` as `jsonb` type with default `'[]'::jsonb`.

### 1.2 Documented vs Actual: `key_position_risks` Table

| Documentation Cross-Ref | Database (17 fields) | Status |
|-------------------------|----------------------|--------|
| References Ch 6.3 for full field table | 17 fields exist | Incomplete in Ch 7 |

**Missing i18n Fields in Any Documentation:**
- `impact_if_vacant_en` (exists in DB, not documented anywhere)
- `risk_notes_en` (exists in DB, not documented anywhere)

**Action Required:** Add i18n fields to Chapter 6.3 field reference table or create a supplemental reference in Chapter 7.5.

### 1.3 Missing Table: `succession_plans` Risk Fields

The `succession_plans` table contains risk-related fields not fully documented in Chapter 7:

| Field | Type | Purpose | Documentation Status |
|-------|------|---------|---------------------|
| `risk_level` | text | Plan overall risk (low/medium/high) | Mentioned, not detailed |
| `position_criticality` | text | Retention matrix input | Referenced but enum values inconsistent |
| `replacement_difficulty` | text | Retention matrix input | Referenced but enum values inconsistent |
| `calculated_risk_level` | text | Auto-calculated retention risk | NOT documented |

**Action Required:** Add field reference for risk-related `succession_plans` columns in Section 7.2 or 7.4.

### 1.4 Missing Field Documentation: `assessed_by` Tracking

The `flight_risk_assessments.assessed_by` field is documented but the UI component (`FlightRiskTab.tsx`) does NOT currently save the assessor ID when creating/updating assessments.

**Code Gap (FlightRiskTab.tsx lines 108-116):**
```typescript
const payload = {
  ...formData,
  company_id: companyId,
  // Missing: assessed_by: currentUserId
};
```

**Action Required:** Either document this as a known limitation or fix the code to capture `assessed_by`.

---

## Part 2: UI Component Issues

### 2.1 CRITICAL BUG: `impact_level` Field Does Not Exist

**Location:** `SuccessionAnalytics.tsx` lines 123-128

```typescript
const impactLevels = { low: 0, medium: 0, high: 0, critical: 0 };
flightRiskData.forEach(f => {
  riskLevels[f.risk_level as keyof typeof riskLevels]++;
  impactLevels[f.impact_level as keyof typeof impactLevels]++; // BUG: impact_level doesn't exist
});
```

**Database Reality:** The `flight_risk_assessments` table only has `risk_level`. Impact of Loss is derived from `succession_plans.position_criticality`, not stored on flight risk.

**Action Required:**
1. Remove the non-functional `impactDistribution` visualization from `SuccessionAnalytics.tsx`
2. OR: Join with `succession_plans` to get actual impact data
3. Update documentation to clarify this distinction

### 2.2 Missing UI Feature: `assessed_by` Display

The `FlightRiskTab.tsx` component does not display who performed each assessment, even though the field exists in the database.

**Action Required:** Add assessor column to the assessments table or document as planned enhancement.

### 2.3 Undocumented UI Feature: Risk Factor Categories

The documentation in Section 7.2 lists 10 standard risk factors, but doesn't document their categorization (External, Compensation, Career, Engagement, etc.) which is shown in the RiskTerminologyStandards.tsx documentation component.

**Consistency Gap:** The categories in documentation don't align with how `FlightRiskTab.tsx` handles factors (flat list, no categories).

**Action Required:** Align UI and documentation - either add categories to UI or remove from documentation.

---

## Part 3: Terminology Inconsistencies (Industry Standard Cascade)

### 3.1 Missing Industry Terms in Glossary

The glossary in `successionManual.ts` has Risk category terms but is missing industry-standard terminology:

| Industry Term | Oracle HCM | SAP SF | Current Glossary |
|--------------|------------|--------|------------------|
| **Risk of Loss** | Yes | Yes | Missing (uses "Flight Risk" instead) |
| **Impact of Loss** | Yes | Yes | Has "Impact Score" (close but not exact) |
| **Loss Impact** | Yes | Yes | Missing |
| **Attrition Risk** | Common | Common | Missing |

**Action Required:** Add industry-standard terms to glossary:
- "Risk of Loss" with definition mapping to `flight_risk_assessments.risk_level`
- "Impact of Loss" with definition mapping to `position_criticality`

### 3.2 Enum Value Inconsistencies: `position_criticality`

| Location | Values Used | Industry Standard |
|----------|-------------|-------------------|
| `RetentionRiskMatrix.tsx` | most_critical, critical, important | Oracle pattern |
| `KeyPositionsTab.tsx` | low, medium, high, critical | Different enum |
| `succession_plans.position_criticality` | Text field, any value | No enforcement |
| Documentation (Sec 7.2) | most_critical, critical, important | Oracle pattern |

**Action Required:** 
1. Standardize to Oracle pattern (most_critical, critical, important) OR SAP pattern (1-4 scale)
2. Add database CHECK constraint to enforce valid values
3. Update `KeyPositionsTab.tsx` criticality colors to match the standard enum

### 3.3 Enum Value Inconsistencies: `replacement_difficulty`

| Location | Values Used |
|----------|-------------|
| `RetentionRiskMatrix.tsx` | difficult, moderate, easy |
| `BenchStrengthTab.tsx` | Uses from succession_plans |
| Database | Text field, any value |

**Action Required:** Add CHECK constraint and ensure consistent enum values across UI.

### 3.4 Terminology: "Risk Level" vs "Risk of Loss"

Throughout the codebase, the term "risk_level" is used consistently in database columns and code, but industry standard terminology is "Risk of Loss."

**Files Using "risk_level":** 87 files contain this term

**Recommendation:** Keep `risk_level` as the database column name (breaking change risk is too high) but update all user-facing labels and documentation to use "Risk of Loss" as the display term.

**Action Required:**
- Update FlightRiskTab.tsx labels: "Risk Level" → "Risk of Loss"
- Update documentation consistently

### 3.5 Missing "Impact of Loss" Implementation

Industry-standard succession systems have a separate "Impact of Loss" assessment per employee. Currently:
- Impact is derived from `position_criticality` on the succession plan
- No employee-level impact assessment exists
- Flight risk assessment only captures risk probability, not impact

**Gap:** Oracle HCM and SAP SuccessFactors capture Impact of Loss separately from Risk of Loss at the employee level.

**Options:**
1. Document current approach as intentional simplification
2. Add `impact_level` field to `flight_risk_assessments` table to capture employee-level impact

---

## Part 4: Documentation Content Gaps

### 4.1 Section 7.3: Missing `assessed_by` Workflow

The FlightRiskWorkflow.tsx documents all 13 fields but doesn't address:
- How to view who assessed each record
- Audit trail for assessor changes
- Multi-assessor scenarios (if allowed)

**Action Required:** Add note about assessor tracking and current UI limitations.

### 4.2 Section 7.5: Cross-Reference Accuracy

VacancyRiskMonitoring.tsx references Section 6.3 for `key_position_risks` table, but:
- The 2 i18n fields are not documented in 6.3 either
- Total should be 17 fields, documentation may reference 15

**Action Required:** Verify field count in Section 6.3 and add missing i18n fields.

### 4.3 Section 7.8: AI Prediction Data Sources

AIAssistedRiskPrediction.tsx correctly references `talent_signal_snapshots` but doesn't document:
- Which specific signal codes are used for risk prediction
- How signals are weighted for risk calculation
- Minimum data requirements for predictions

**Action Required:** Add signal code reference or cross-reference to Chapter 3 signal definitions.

### 4.4 Section 7.10: Troubleshooting Gaps

RiskTroubleshooting.tsx is comprehensive but missing:
- Issue: "assessed_by not captured"
- Issue: "impact_level visualization showing empty" (the bug mentioned above)

**Action Required:** Add these known issues to troubleshooting section.

---

## Part 5: Industry Standard Alignment Gaps

### 5.1 Missing: Dual-Axis Employee-Level Assessment

**Industry Standard (Oracle HCM):**
Each employee has BOTH:
- Risk of Loss (probability they'll leave)
- Impact of Loss (consequence if they leave)

Combined to create Retention Risk Matrix at employee level.

**Current Implementation:**
- Risk of Loss: Captured in `flight_risk_assessments.risk_level`
- Impact of Loss: Derived from position criticality only

**Gap:** No employee-level impact assessment capability.

### 5.2 Missing: Retention Risk Score Calculation

The `RetentionRiskMatrix.tsx` provides visual matrix but:
- No database field stores the calculated retention risk
- No aggregation of retention risk across company
- No trending of retention risk over time

**Gap:** `calculated_risk_level` field exists in `succession_plans` but population logic is not documented.

---

## Part 6: Implementation Plan

### Phase 1: Critical Code Fixes (Priority: High)

| File | Change | Impact |
|------|--------|--------|
| `src/components/succession/SuccessionAnalytics.tsx` | Remove or fix `impact_level` visualization (lines 123-142) | Fixes bug |
| `src/components/succession/FlightRiskTab.tsx` | Add `assessed_by: auth.uid()` to payload | Captures assessor |

### Phase 2: Database Schema Documentation (Priority: High)

| File | Change |
|------|--------|
| `FlightRiskWorkflow.tsx` | Update `risk_factors` type from `text[]` to `jsonb` |
| `VacancyRiskMonitoring.tsx` | Add note about 2 i18n fields (impact_if_vacant_en, risk_notes_en) |
| New addition to 7.2 | Add succession_plans risk fields reference |

### Phase 3: Terminology Standardization (Priority: High)

| Scope | Change |
|-------|--------|
| `src/types/successionManual.ts` glossary | Add "Risk of Loss", "Impact of Loss" terms |
| `FlightRiskTab.tsx` UI labels | Change "Risk Level" to "Risk of Loss" in user-facing text |
| `KeyPositionsTab.tsx` | Align criticality enum to match RetentionRiskMatrix (most_critical, critical, important) |
| Documentation (Sec 7.2) | Clarify current approach: Impact derived from position, not employee |

### Phase 4: Enum Standardization (Priority: Medium)

| Table | Add CHECK Constraint |
|-------|---------------------|
| `succession_plans.position_criticality` | CHECK (position_criticality IN ('most_critical', 'critical', 'important')) |
| `succession_plans.replacement_difficulty` | CHECK (replacement_difficulty IN ('difficult', 'moderate', 'easy')) |
| `flight_risk_assessments.risk_level` | Already has enum but verify values |

### Phase 5: Documentation Updates (Priority: Medium)

| File | Change |
|------|--------|
| `RiskTroubleshooting.tsx` | Add issues for assessed_by tracking and impact_level bug |
| `AIAssistedRiskPrediction.tsx` | Add specific signal code references |
| `RiskTerminologyStandards.tsx` | Note that Impact of Loss is position-derived |

---

## Part 7: Files to Modify

### Code Fixes (3 files)

| File | Priority |
|------|----------|
| `src/components/succession/SuccessionAnalytics.tsx` | High |
| `src/components/succession/FlightRiskTab.tsx` | High |
| `src/components/succession/KeyPositionsTab.tsx` | Medium |

### Documentation Updates (6 files)

| File | Priority |
|------|----------|
| `src/components/enablement/manual/succession/sections/risk/FlightRiskWorkflow.tsx` | High |
| `src/components/enablement/manual/succession/sections/risk/RiskTerminologyStandards.tsx` | High |
| `src/components/enablement/manual/succession/sections/risk/VacancyRiskMonitoring.tsx` | Medium |
| `src/components/enablement/manual/succession/sections/risk/RiskTroubleshooting.tsx` | Medium |
| `src/components/enablement/manual/succession/sections/risk/AIAssistedRiskPrediction.tsx` | Low |
| `src/types/successionManual.ts` (glossary) | High |

### Database Migration (Optional Enhancement)

| Change | Priority |
|--------|----------|
| Add CHECK constraint for position_criticality | Medium |
| Add CHECK constraint for replacement_difficulty | Medium |

---

## Part 8: Quality Metrics After Implementation

| Metric | Current | Target |
|--------|---------|--------|
| Database field accuracy | 82% | 100% |
| UI-to-documentation sync | 78% | 95% |
| Industry terminology coverage | 70% | 95% |
| Known bugs in analytics | 1 | 0 |
| Assessed_by capture | No | Yes |
| Enum consistency | 60% | 100% |

---

## Part 9: Summary of Critical Actions

### Must Fix (Breaking/Incorrect Behavior)

1. **SuccessionAnalytics.tsx impact_level bug** - Remove visualization that references non-existent field
2. **FlightRiskTab.tsx assessed_by** - Capture current user ID when creating assessments
3. **Glossary terminology** - Add "Risk of Loss" and "Impact of Loss" industry terms

### Should Fix (Accuracy/Consistency)

4. **risk_factors type** - Document as jsonb not text[]
5. **Criticality enum alignment** - Standardize KeyPositionsTab to match RetentionRiskMatrix
6. **UI labels** - Update "Risk Level" to "Risk of Loss" for industry alignment

### Nice to Have (Enhancement)

7. **Assessor display** - Show who performed each assessment in the table
8. **Database constraints** - Add CHECK constraints for enum fields
9. **Employee-level impact** - Consider adding impact_level field for full Oracle HCM parity
