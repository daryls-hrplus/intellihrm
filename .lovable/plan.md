
# Chapter 2 Documentation vs. Schema/UI Audit - Gap Analysis & Remediation Plan

## Executive Summary

This audit compares the Chapter 2 (Foundation Setup) documentation against the actual database schema in `src/integrations/supabase/types.ts`, the hooks in `src/hooks/succession/`, and UI components in `src/components/succession/config/`. **35 gaps identified** across 6 tables, requiring updates to both documentation and code.

---

## Audit Methodology

| Source | Purpose |
|--------|---------|
| Documentation Files | `src/components/enablement/manual/succession/sections/foundation/*.tsx` |
| Database Schema | `src/integrations/supabase/types.ts` (lines 60760-68875) |
| Hooks | `src/hooks/succession/use*.ts` |
| UI Config Components | `src/components/succession/config/*.tsx` |

---

## Gap Analysis by Table

### 1. succession_assessor_types

#### Documentation Claims vs. Actual Schema

| Field | Documented | In DB Schema | In Hook | In UI | Gap Type |
|-------|------------|--------------|---------|-------|----------|
| `id` | Yes | Yes | Yes | N/A | None |
| `company_id` | Yes | Yes | Yes | N/A | None |
| `type_code` | Yes | Yes | Yes | Yes | None |
| `type_label` | Yes | Yes | Yes | Yes | None |
| `is_required` | Yes | Yes | Yes | Yes | None |
| `is_enabled` | Yes (as toggle action) | Yes | Yes | N/A | None |
| `applies_to_staff_types` | Yes | Yes | Yes | N/A | None |
| `sort_order` | Yes | Yes | Yes | N/A | None |
| `weight_percentage` | **DOCUMENTED** | **NOT IN DB** | **NOT IN HOOK** | **NOT IN UI** | **DOC ONLY** |
| `can_view_other_assessments` | **DOCUMENTED** | **NOT IN DB** | **NOT IN HOOK** | **NOT IN UI** | **DOC ONLY** |
| `can_override_score` | **DOCUMENTED** | **NOT IN DB** | **NOT IN HOOK** | **NOT IN UI** | **DOC ONLY** |
| `description` | **NOT DOCUMENTED** | **NOT IN DB** | **NOT IN HOOK** | **NOT IN UI** | **ASPIRATIONAL** |
| `created_at` | Yes | Yes | Yes | N/A | None |
| `updated_at` | NOT DOCUMENTED | **NOT IN DB** | N/A | N/A | None |

**Critical Gap:** Documentation describes `weight_percentage`, `can_view_other_assessments`, and `can_override_score` fields that **DO NOT EXIST** in the database schema.

**Seed Defaults Mismatch:**
- Documentation: 4 defaults (manager, hr, executive, skip_level)
- Hook code: 3 defaults (manager, hr, executive) - missing `skip_level`

---

### 2. readiness_rating_bands

#### Documentation Claims vs. Actual Schema

| Field | Documented | In DB Schema | In Hook | In UI | Gap Type |
|-------|------------|--------------|---------|-------|----------|
| `id` | NOT DOCUMENTED | Yes | Yes | N/A | **MISSING DOC** |
| `company_id` | NOT DOCUMENTED | Yes | Yes | N/A | **MISSING DOC** |
| `band_code` | **DOCUMENTED** | **NOT IN DB** | **NOT IN HOOK** | **NOT IN UI** | **DOC ONLY** |
| `rating_label` | Yes | Yes | Yes | Yes | None |
| `min_percentage` | Yes | Yes | Yes | Yes | None |
| `max_percentage` | Yes | Yes | Yes | Yes | None |
| `color_code` | Yes | Yes | Yes | Yes | None |
| `sort_order` | NOT DOCUMENTED | Yes | Yes | Yes | **MISSING DOC** |
| `strategic_implication` | **DOCUMENTED** | **NOT IN DB** | **NOT IN HOOK** | **NOT IN UI** | **DOC ONLY** |
| `is_successor_eligible` | **DOCUMENTED** | **NOT IN DB** | **NOT IN HOOK** | **NOT IN UI** | **DOC ONLY** |
| `created_at` | NOT DOCUMENTED | Yes | Yes | N/A | **MISSING DOC** |

**Critical Gap:** Documentation describes `band_code`, `strategic_implication`, and `is_successor_eligible` fields that **DO NOT EXIST** in the database.

---

### 3. readiness_assessment_indicators

#### Documentation Claims vs. Actual Schema

| Field | Documented | In DB Schema | In Hook | Gap Type |
|-------|------------|--------------|---------|----------|
| `id` | NOT DOCUMENTED | Yes | Yes | **MISSING DOC** |
| `company_id` | NOT DOCUMENTED | **NOT IN DB** | N/A | None (correct) |
| `form_id` | NOT DOCUMENTED | Yes | Yes | **MISSING DOC** |
| `indicator_name` | Yes | Yes | Yes | None |
| `category_id` | Yes | Yes | Yes | None |
| `weight_percent` | Yes | Yes | Yes | None |
| `rating_scale_max` | Yes | Yes | Yes | None |
| `assessor_type` | NOT DOCUMENTED | Yes | Yes | **MISSING DOC** |
| `scoring_guide_1` | **DOCUMENTED** | **NOT IN DB** (named `scoring_guide_low`) | N/A | **NAMING MISMATCH** |
| `scoring_guide_3` | **DOCUMENTED** | **NOT IN DB** (named `scoring_guide_mid`) | N/A | **NAMING MISMATCH** |
| `scoring_guide_5` | **DOCUMENTED** | **NOT IN DB** (named `scoring_guide_high`) | N/A | **NAMING MISMATCH** |
| `indicator_code` | **DOCUMENTED** | **NOT IN DB** | N/A | **DOC ONLY** |
| `description` | **DOCUMENTED** | **NOT IN DB** | N/A | **DOC ONLY** |
| `is_required` | **DOCUMENTED** | **NOT IN DB** | N/A | **DOC ONLY** |
| `is_active` | **DOCUMENTED** | **NOT IN DB** | N/A | **DOC ONLY** |
| `linked_competency_id` | **DOCUMENTED** | **NOT IN DB** | N/A | **DOC ONLY** |
| `sort_order` | NOT DOCUMENTED | Yes | N/A | **MISSING DOC** |
| `created_at` | NOT DOCUMENTED | Yes | N/A | **MISSING DOC** |

**Critical Gap:** BARS scoring guide fields use different naming convention (`scoring_guide_1/3/5` vs `scoring_guide_low/mid/high`).

---

### 4. readiness_assessment_categories

#### Documentation Claims vs. Actual Schema

| Field | Documented | In DB Schema | Gap Type |
|-------|------------|--------------|----------|
| `id` | NOT DOCUMENTED | Yes | **MISSING DOC** |
| `company_id` | NOT DOCUMENTED | Yes | **MISSING DOC** |
| `form_id` | NOT DOCUMENTED | Yes | **MISSING DOC** |
| `category_name` | Yes (implied) | Yes | None |
| `category_code` | **DOCUMENTED** | **NOT IN DB** | **DOC ONLY** |
| `description` | **DOCUMENTED** | **NOT IN DB** | **DOC ONLY** |
| `weight_percent` | **DOCUMENTED** | **NOT IN DB** | **DOC ONLY** |
| `icon_name` | **DOCUMENTED** | **NOT IN DB** | **DOC ONLY** |
| `color_code` | **DOCUMENTED** | **NOT IN DB** | **DOC ONLY** |
| `sort_order` | Yes | Yes | None |
| `created_at` | NOT DOCUMENTED | Yes | **MISSING DOC** |

---

### 5. succession_availability_reasons

#### Documentation Claims vs. Actual Schema

| Field | Documented | In DB Schema | In Hook | In UI | Gap Type |
|-------|------------|--------------|---------|-------|----------|
| `id` | NOT DOCUMENTED | Yes | Yes | N/A | **MISSING DOC** |
| `company_id` | NOT DOCUMENTED | Yes | Yes | N/A | **MISSING DOC** |
| `code` | Yes | Yes | Yes | Yes | None |
| `label` | **DOCUMENTED** | **NOT IN DB** (field is `description`) | N/A | N/A | **NAMING MISMATCH** |
| `description` | NOT DOCUMENTED AS FIELD | Yes | Yes | Yes | **NAMING MISMATCH** |
| `is_active` | Yes | Yes | Yes | Yes | None |
| `sort_order` | Yes | Yes | Yes | Yes | None |
| `category` | **DOCUMENTED** (planned/unplanned) | **NOT IN DB** | **NOT IN HOOK** | **NOT IN UI** | **DOC ONLY** |
| `typical_notice_months` | **DOCUMENTED** | **NOT IN DB** | **NOT IN HOOK** | **NOT IN UI** | **DOC ONLY** |
| `urgency_level` | **DOCUMENTED** | **NOT IN DB** | **NOT IN HOOK** | **NOT IN UI** | **DOC ONLY** |
| `triggers_notification` | **DOCUMENTED** | **NOT IN DB** | **NOT IN HOOK** | **NOT IN UI** | **DOC ONLY** |
| `created_at` | NOT DOCUMENTED | Yes | Yes | N/A | **MISSING DOC** |

**Critical Gap:** Documentation describes a rich availability reasons model with `category`, `urgency_level`, `typical_notice_months`, and `triggers_notification` that **DO NOT EXIST** in the database. The actual table is much simpler.

**Seed Defaults Mismatch:**
- Documentation: 8 defaults (RET, PRO, TRF, RES, TRM, MED, REL, REO)
- Hook code: 6 defaults (RET, PRO, RES, TRM, REL, REO) - missing `TRF` and `MED`

---

### 6. readiness_assessment_forms

#### Documentation Claims vs. Actual Schema

| Field | Documented | In DB Schema | Gap Type |
|-------|------------|--------------|----------|
| `id` | NOT DOCUMENTED | Yes | **MISSING DOC** |
| `company_id` | NOT DOCUMENTED | Yes | **MISSING DOC** |
| `name` | Yes | Yes | None |
| `code` | **DOCUMENTED** | **NOT IN DB** | **DOC ONLY** |
| `description` | Yes | Yes | None |
| `staff_type_id` | **DOCUMENTED** | **NOT IN DB** (field is `staff_type` as Text) | **TYPE MISMATCH** |
| `version` | **DOCUMENTED** | **NOT IN DB** | **DOC ONLY** |
| `is_active` | Yes | Yes | None |
| `is_template` | **DOCUMENTED** | **NOT IN DB** | **DOC ONLY** |
| `total_indicators` | **DOCUMENTED** | **NOT IN DB** | **DOC ONLY** |
| `total_weight` | **DOCUMENTED** | **NOT IN DB** | **DOC ONLY** |
| `created_by` | **DOCUMENTED** | **NOT IN DB** | **DOC ONLY** |
| `created_at` | Yes | Yes | None |
| `published_at` | **DOCUMENTED** | **NOT IN DB** | **DOC ONLY** |
| `updated_at` | NOT DOCUMENTED | Yes | **MISSING DOC** |

---

## Gap Summary

### Direction 1: Documentation Describes Features NOT in Code/DB

| Count | Table | Fields |
|-------|-------|--------|
| 3 | succession_assessor_types | weight_percentage, can_view_other_assessments, can_override_score |
| 3 | readiness_rating_bands | band_code, strategic_implication, is_successor_eligible |
| 5 | readiness_assessment_indicators | indicator_code, description, is_required, is_active, linked_competency_id |
| 5 | readiness_assessment_categories | category_code, description, weight_percent, icon_name, color_code |
| 4 | succession_availability_reasons | category, typical_notice_months, urgency_level, triggers_notification |
| 7 | readiness_assessment_forms | code, version, is_template, total_indicators, total_weight, created_by, published_at |
| **27** | **TOTAL** | **Fields documented but not implemented** |

### Direction 2: Code/DB Has Features NOT in Documentation

| Count | Table | Fields |
|-------|-------|--------|
| 0 | succession_assessor_types | (well documented) |
| 3 | readiness_rating_bands | id, company_id, created_at |
| 4 | readiness_assessment_indicators | id, form_id, assessor_type, sort_order, created_at |
| 3 | readiness_assessment_categories | id, company_id, form_id, created_at |
| 2 | succession_availability_reasons | id, company_id, created_at |
| 2 | readiness_assessment_forms | id, company_id, updated_at |
| **14** | **TOTAL** | **Fields in DB not documented** |

### Direction 3: Naming Mismatches

| Table | Doc Name | Actual DB Name |
|-------|----------|----------------|
| readiness_assessment_indicators | scoring_guide_1 | scoring_guide_low |
| readiness_assessment_indicators | scoring_guide_3 | scoring_guide_mid |
| readiness_assessment_indicators | scoring_guide_5 | scoring_guide_high |
| succession_availability_reasons | label | description |
| readiness_assessment_forms | staff_type_id (UUID) | staff_type (Text) |

### Direction 4: Seed Data Mismatches

| Table | Doc Count | Hook Count | Missing in Hook |
|-------|-----------|------------|-----------------|
| succession_assessor_types | 4 | 3 | skip_level |
| succession_availability_reasons | 8 | 6 | TRF, MED |

---

## Remediation Plan

### Phase 1: Critical Decisions (Requires Product Decision)

Before making changes, the following strategic decisions must be made:

**Decision 1:** For features documented but not in DB, should we:
- **Option A:** Add columns to DB to match documentation (implement the feature)
- **Option B:** Remove from documentation (descope the feature)

**Recommendation:** Prioritize based on enterprise value:
- **IMPLEMENT (High Value):** 
  - `succession_assessor_types.weight_percentage` (core to multi-assessor aggregation)
  - `succession_availability_reasons.urgency_level` and `category` (core to urgency-based planning)
  - `readiness_rating_bands.is_successor_eligible` (core to successor eligibility)
- **DESCOPE (Lower Priority):**
  - `can_view_other_assessments`, `can_override_score` (advanced calibration features)
  - `readiness_assessment_forms.version`, `published_at` (form versioning)

---

### Phase 2: Documentation Corrections (No DB Changes)

**2.1 Fix Field Naming in Documentation**

| File | Current | Correct |
|------|---------|---------|
| FoundationReadinessIndicators.tsx | `scoring_guide_1`, `scoring_guide_3`, `scoring_guide_5` | `scoring_guide_low`, `scoring_guide_mid`, `scoring_guide_high` |
| FoundationAvailabilityReasons.tsx | `label` field | `description` field |
| FoundationReadinessForms.tsx | `staff_type_id (UUID)` | `staff_type (Text)` |

**2.2 Add Missing Documented Fields**

Add to documentation tables:
- `id`, `company_id`, `created_at` for all tables
- `assessor_type`, `sort_order` for indicators
- `form_id` for categories

**2.3 Remove/Mark Aspirational Features**

Add "Future Enhancement" badge to documented features not yet implemented:
- `can_view_other_assessments`, `can_override_score`
- `band_code`, `strategic_implication`
- `indicator_code`, `linked_competency_id`
- Form versioning fields

---

### Phase 3: Database Schema Enhancements

**3.1 High-Priority Column Additions**

```sql
-- Add weight_percentage to assessor types
ALTER TABLE succession_assessor_types 
ADD COLUMN weight_percentage numeric(5,2) DEFAULT NULL;

-- Add urgency and category to availability reasons
ALTER TABLE succession_availability_reasons 
ADD COLUMN category text DEFAULT 'planned' CHECK (category IN ('planned', 'unplanned', 'either')),
ADD COLUMN urgency_level text DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN typical_notice_months integer DEFAULT NULL;

-- Add successor eligibility to readiness bands
ALTER TABLE readiness_rating_bands 
ADD COLUMN is_successor_eligible boolean DEFAULT true;
```

**3.2 Hook Updates**

Update `useSuccessionAssessorTypes.ts`:
- Add `weight_percentage` to interface and CRUD operations
- Add `skip_level` to default seeds

Update `useAvailabilityReasons.ts`:
- Add `category`, `urgency_level`, `typical_notice_months` to interface
- Add `TRF` and `MED` to default seeds

Update `useReadinessRatingBands.ts`:
- Add `is_successor_eligible` to interface and CRUD operations

---

### Phase 4: UI Component Updates

**4.1 AssessorTypesConfig.tsx**
- Add weight_percentage input field
- Add visual weight sum validation

**4.2 AvailabilityReasonsConfig.tsx**
- Add category dropdown (Planned/Unplanned/Either)
- Add urgency level dropdown
- Add notice months input

**4.3 ReadinessRatingBandsConfig.tsx**
- Add successor eligibility toggle

---

### Phase 5: Implementation Sequence

| Order | Task | Estimated Effort |
|-------|------|------------------|
| 1 | Get product decision on scope | Decision meeting |
| 2 | Documentation naming corrections | 1 hour |
| 3 | Documentation: add missing standard fields | 2 hours |
| 4 | Documentation: mark aspirational features | 1 hour |
| 5 | DB migrations for approved columns | 1 hour |
| 6 | Hook interface updates | 2 hours |
| 7 | Hook CRUD operation updates | 2 hours |
| 8 | Hook seed data updates | 30 min |
| 9 | UI config component updates | 3 hours |
| 10 | End-to-end testing | 2 hours |
| **Total** | | **~15 hours** |

---

## Files to Modify

### Documentation Files (Read-Only Mode - Will Require Implementation)

| File | Changes |
|------|---------|
| `FoundationAssessorTypes.tsx` | Fix field table, add weight_percentage, mark aspirational |
| `FoundationReadinessBands.tsx` | Fix field table, add missing fields, remove band_code |
| `FoundationReadinessIndicators.tsx` | Fix scoring_guide naming |
| `FoundationAvailabilityReasons.tsx` | Fix label→description, add missing fields |
| `FoundationReadinessForms.tsx` | Fix staff_type type, mark versioning as future |
| `FoundationStaffTypeMapping.tsx` | Align with actual staff_type field |

### Database Migrations

| Migration | Tables Affected |
|-----------|----------------|
| `add_assessor_type_weights.sql` | succession_assessor_types |
| `add_availability_reason_metadata.sql` | succession_availability_reasons |
| `add_band_eligibility.sql` | readiness_rating_bands |

### Hook Files

| File | Changes |
|------|---------|
| `useSuccessionAssessorTypes.ts` | Interface + CRUD + seeds |
| `useAvailabilityReasons.ts` | Interface + CRUD + seeds |
| `useReadinessRatingBands.ts` | Interface + CRUD |

### UI Config Files

| File | Changes |
|------|---------|
| `AssessorTypesConfig.tsx` (to be created or modified) | Add weight field |
| `AvailabilityReasonsConfig.tsx` | Add category, urgency, notice fields |
| `ReadinessRatingBandsConfig.tsx` | Add eligibility toggle |

---

## Validation Checklist

After implementation:
- [ ] All documented fields exist in DB or are marked as "Future Enhancement"
- [ ] All DB fields are documented
- [ ] Scoring guide field names match between docs and DB
- [ ] Hook interfaces match DB schema
- [ ] UI config components match hook interfaces
- [ ] Seed defaults match between docs and hooks
- [ ] No orphaned references in documentation
