

# Chapter 3 (Nine-Box Assessment Configuration) - Comprehensive Gap Closure Plan

## Executive Summary

This plan ensures **bidirectional gap closure** and **industry-standard alignment** by:
1. Documenting ALL 5 database tables with complete field references
2. Documenting ALL 3 specialized hooks with business logic
3. Documenting ALL UI components and workflows
4. Following the enterprise documentation patterns established in 360 Feedback Manual
5. Aligning with McKinsey 9-Box, SAP SuccessFactors, and Workday methodologies

---

## Gap Closure Verification Matrix

### Direction 1: Schema/Code → Documentation (What EXISTS but is NOT documented)

| Table/Hook | Fields/Features | Current Doc | Proposed Fix |
|------------|-----------------|-------------|--------------|
| `nine_box_assessments` (14 fields) | `is_current`, `assessed_by`, `assessment_period`, notes fields | **NOT DOCUMENTED** | NEW Section 3.7 |
| `nine_box_evidence_sources` (11 fields) | `confidence_score`, `weight_applied`, `contribution_summary` | **NOT DOCUMENTED** | NEW Section 3.8 |
| `nine_box_indicator_configs` (12 fields) | `custom_label`, `use_custom_label`, `suggested_actions` | Placeholder | REWRITE Section 3.4 |
| `nine_box_rating_sources` (10 fields) | `source_config` JSON, `priority`, `updated_at` | Partial | REWRITE Section 3.2 |
| `nine_box_signal_mappings` (9 fields) | `minimum_confidence`, FK to `talent_signal_definitions` | Partial | REWRITE Section 3.3 |
| `useNineBoxRatingSources.ts` | `DEFAULT_PERFORMANCE_SOURCES`, `DEFAULT_POTENTIAL_SOURCES`, `CalculatedRating` interface | **NOT DOCUMENTED** | NEW Sections 3.5, 3.6 |
| `useNineBoxSignalMappings.ts` | `DEFAULT_SIGNAL_MAPPINGS` (10 categories), bias risk adjustment | **NOT DOCUMENTED** | REWRITE Section 3.3 |
| `useNineBoxEvidence.ts` | `SaveAssessmentWithEvidenceParams`, override reason capture | **NOT DOCUMENTED** | NEW Section 3.8 |
| `NineBoxAssessmentDialog.tsx` | AI-suggested ratings, override badges, evidence tab | **NOT DOCUMENTED** | NEW Section 3.7 |
| `NineBoxEvidencePanel.tsx` | Performance/Potential tabs, signal aggregation | **NOT DOCUMENTED** | NEW Section 3.8 |
| `NineBoxIndicatorLabelsConfig.tsx` | Initialize defaults, color picker, custom label toggle | Placeholder | REWRITE Section 3.4 |

### Direction 2: Documentation → Schema/Code (What is DOCUMENTED but INCORRECT)

| Documented Item | Current Doc | Actual Implementation | Proposed Fix |
|-----------------|-------------|----------------------|--------------|
| Rating sources table schema | `source_table`, `source_column` | Actually `source_config` (JSON), `priority`, `is_active` | Correct field names in Section 3.2 |
| Signal mappings schema | `normalization_method` | Actually `minimum_confidence`, `contributes_to` enum | Correct field names in Section 3.3 |
| Default performance weights | Not specified | 50% appraisal, 30% goals, 20% competency | Document in Section 3.5 |
| Default potential weights | Not specified | 40% assessment, 40% leadership, 20% values | Document in Section 3.6 |
| Score normalization formula | Not documented | `toRating = score < 0.33 ? 1 : score < 0.67 ? 2 : 3` | Document in Section 3.5/3.6 |
| Bias risk adjustment | Not documented | `high=0.7x`, `medium=0.85x`, `low=1.0x` multipliers | Document in Section 3.3 |

---

## Industry Standard Alignment

### McKinsey 9-Box Grid Methodology
| Standard | HRplus Implementation | Documentation Section |
|----------|----------------------|----------------------|
| 3x3 Performance vs Potential matrix | `nine_box_indicator_configs` with 9 quadrants | 3.1, 3.4 |
| Evidence-based ratings | `nine_box_evidence_sources` audit trail | 3.7, 3.8 |
| Configurable quadrant labels | `custom_label`, `use_custom_label` fields | 3.4 |
| Suggested development actions | `suggested_actions` per quadrant | 3.4 |

### SAP SuccessFactors Alignment
| Standard | HRplus Implementation | Documentation Section |
|----------|----------------------|----------------------|
| Multi-source rating inputs | `nine_box_rating_sources` with weights | 3.2, 3.5, 3.6 |
| Current vs historical assessments | `is_current` flag lifecycle | 3.7 |
| Override with reason capture | `performance_notes`, `potential_notes` when overriding | 3.7 |
| Confidence scoring | `confidence_score` on evidence sources | 3.8 |

### Workday Talent Management Alignment
| Standard | HRplus Implementation | Documentation Section |
|----------|----------------------|----------------------|
| Signal-to-axis mapping | `nine_box_signal_mappings` with `contributes_to` | 3.3 |
| Talent signal integration | FK to `talent_signal_definitions` | 3.3 |
| Bias detection | `bias_risk_level` with weight adjustment | 3.3 |
| AI-suggested ratings | `NineBoxEvidencePanel` with confidence badges | 3.7 |

---

## Proposed Section Structure (8 Sections, ~140 min)

### Section 3.1: Nine-Box Model Overview (~20 min) - EXPAND
**Current:** 70 lines, grid visual only
**Target:** 400 lines with learning objectives, theory, cross-module integration

Content additions:
- Learning objectives card (4 bullets)
- McKinsey 9-Box theory and strategic value
- Performance axis definition (current contribution)
- Potential axis definition (future capability)
- 9 quadrant strategic implications table
- Industry benchmarks callout
- Cross-module integration diagram (Appraisals → Signals → Nine-Box → Succession Plans)

### Section 3.2: Rating Sources Configuration (~25 min) - REWRITE
**Current:** 60 lines, incorrect schema
**Target:** 450 lines with complete field reference

Content additions:
- Learning objectives card
- Navigation path: Performance → Succession → Setup → Nine-Box Config
- Complete field reference table for `nine_box_rating_sources`:
  - `id` (UUID, PK)
  - `company_id` (UUID, FK)
  - `axis` (Text: 'performance' | 'potential')
  - `source_type` (Text: appraisal_overall_score, goal_achievement, etc.)
  - `source_config` (JSONB: custom configuration)
  - `weight` (Numeric: 0.0-1.0)
  - `is_active` (Boolean)
  - `priority` (Integer: ordering)
  - `created_at`, `updated_at` (Timestamps)
- Step-by-step: Add new rating source
- Default seeds table (6 sources from `useNineBoxRatingSources.ts`)
- Weight normalization formula
- Troubleshooting section

### Section 3.3: Signal Mappings (~20 min) - REWRITE
**Current:** 40 lines, formula examples only
**Target:** 400 lines with complete configuration

Content additions:
- Learning objectives card
- Complete field reference table for `nine_box_signal_mappings`:
  - `id`, `company_id`
  - `signal_definition_id` (FK to `talent_signal_definitions`)
  - `contributes_to` ('performance' | 'potential' | 'both')
  - `weight` (Numeric: 0.0-1.0)
  - `minimum_confidence` (Numeric: threshold for inclusion)
  - `is_active` (Boolean)
  - `created_at`, `updated_at`
- Default 10 signal mappings table from `DEFAULT_SIGNAL_MAPPINGS`:
  - leadership → potential (1.0)
  - people_leadership → potential (1.0)
  - strategic_thinking → potential (1.0)
  - influence → potential (1.0)
  - adaptability → potential (0.8)
  - technical → performance (1.0)
  - customer_focus → performance (0.8)
  - teamwork → both (0.7)
  - values → potential (0.6)
  - general → both (0.5)
- Bias risk adjustment formulas (high=0.7x, medium=0.85x, low=1.0x)
- Initialize defaults workflow
- Minimum confidence threshold guidance

### Section 3.4: Box Labels & Descriptions (~20 min) - NEW CONTENT
**Current:** 15 lines placeholder
**Target:** 500 lines with complete configuration

Content additions:
- Learning objectives card
- Complete field reference table for `nine_box_indicator_configs`:
  - `id`, `company_id`
  - `performance_level` (Integer: 1-3)
  - `potential_level` (Integer: 1-3)
  - `default_label` (Text: system label)
  - `custom_label` (Text: company override)
  - `use_custom_label` (Boolean: toggle)
  - `description` (Text: quadrant description)
  - `suggested_actions` (Text: development recommendations)
  - `color_code` (Text: hex color)
  - `created_at`, `updated_at`
- 9 default labels table from `DEFAULT_LABELS`:
  - (3,3) Star Performer - #22c55e
  - (2,3) High Potential - #3b82f6
  - (1,3) Inconsistent Performer - #f59e0b
  - (3,2) Core Player - #06b6d4
  - (2,2) Solid Contributor - #8b5cf6
  - (1,2) Underperformer - #f97316
  - (3,1) Technical Expert - #14b8a6
  - (2,1) Average Performer - #94a3b8
  - (1,1) Low Performer - #ef4444
- Initialize defaults step-by-step
- Custom label override workflow
- Color coding standards
- Suggested actions best practices

### Section 3.5: Performance Axis Configuration (~15 min) - NEW CONTENT
**Current:** 15 lines placeholder
**Target:** 350 lines with formulas and data flow

Content additions:
- Learning objectives card
- Axis definition: "Performance = Current contribution and results"
- Data flow diagram showing source aggregation
- Default performance sources table:
  - `appraisal_overall_score` (weight: 0.5)
  - `goal_achievement` (weight: 0.3)
  - `competency_average` (weight: 0.2)
- Score normalization: Appraisal (1-5 → 0-1), Goals (0-100% → 0-1)
- Rating conversion formula: `rating = score < 0.33 ? 1 : score < 0.67 ? 2 : 3`
- Missing data handling (weight redistribution)
- Confidence calculation

### Section 3.6: Potential Axis Configuration (~15 min) - NEW CONTENT
**Current:** 15 lines placeholder
**Target:** 350 lines with formulas and signal integration

Content additions:
- Learning objectives card
- Axis definition: "Potential = Future capability and growth capacity"
- Default potential sources table:
  - `potential_assessment` (weight: 0.4)
  - `leadership_signals` (weight: 0.4)
  - `values_signals` (weight: 0.2)
- Leadership signal categories: leadership, people_leadership, strategic_thinking, influence
- Values signal categories: values, adaptability
- Integration with `potential_assessments` table
- Bias risk adjustment application

### Section 3.7: Nine-Box Assessment Workflow (~20 min) - NEW SECTION
**Current:** Not documented
**Target:** 400 lines covering complete assessment lifecycle

Content additions:
- Learning objectives card
- Complete field reference table for `nine_box_assessments`:
  - `id`, `company_id`, `employee_id`
  - `assessed_by` (FK to profiles)
  - `assessment_date` (Date)
  - `assessment_period` (Text: e.g., "Q4 2024")
  - `performance_rating` (Integer: 1-3)
  - `potential_rating` (Integer: 1-3)
  - `performance_notes`, `potential_notes`, `overall_notes` (Text)
  - `is_current` (Boolean: active assessment flag)
  - `created_at`, `updated_at`
- Assessment creation workflow (from `NineBoxAssessmentDialog.tsx`):
  1. Select employee
  2. View Evidence & Signals tab
  3. Review AI-suggested ratings with confidence badges
  4. Accept or override ratings
  5. Add notes (required for overrides)
  6. Save assessment
- `is_current` flag behavior:
  - New assessment → previous assessments marked `is_current = false`
  - Only one current assessment per employee
- Historical assessment retention
- Override workflow with reason capture
- Manager vs HR roles

### Section 3.8: Evidence & Audit Trail (~15 min) - NEW SECTION
**Current:** Not documented
**Target:** 300 lines covering evidence capture and compliance

Content additions:
- Learning objectives card
- Complete field reference table for `nine_box_evidence_sources`:
  - `id`, `assessment_id` (FK), `company_id`
  - `axis` ('performance' | 'potential')
  - `source_type` (Text: identifies data source)
  - `source_id` (UUID: optional link to source record)
  - `source_value` (Numeric: normalized score)
  - `weight_applied` (Numeric: weight used)
  - `confidence_score` (Numeric: 0-1)
  - `contribution_summary` (Text: explanation)
  - `created_at`
- Evidence capture on save (from `useSaveNineBoxEvidence.ts`)
- Override evidence format: "Override: {reason}"
- Auto-calculated evidence format: "Auto-calculated from {source}"
- Confidence score requirements
- Audit compliance requirements (SOC 2)
- Evidence panel UI (from `NineBoxEvidencePanel.tsx`)

---

## Implementation Structure

### Directory Structure
```text
src/components/enablement/manual/succession/sections/ninebox/
├── index.ts
├── NineBoxOverview.tsx           (3.1 - 400 lines)
├── NineBoxRatingSources.tsx      (3.2 - 450 lines)
├── NineBoxSignalMappings.tsx     (3.3 - 400 lines)
├── NineBoxIndicatorLabels.tsx    (3.4 - 500 lines)
├── NineBoxPerformanceAxis.tsx    (3.5 - 350 lines)
├── NineBoxPotentialAxis.tsx      (3.6 - 350 lines)
├── NineBoxAssessmentWorkflow.tsx (3.7 - 400 lines) - NEW
└── NineBoxEvidenceAudit.tsx      (3.8 - 300 lines) - NEW
```

### Types Update (`src/types/successionManual.ts`)
- Part 3 `estimatedReadTime`: 90 → 140
- Part 3 subsections: 6 → 8
- Add sec-3-7 and sec-3-8 metadata

### Main Section Update (`SuccessionNineBoxSection.tsx`)
- Convert to modular barrel imports
- Remove placeholder content
- Add new section anchors

---

## Validation Checklist

After implementation:
- [ ] All 5 Nine-Box tables documented with complete field references
- [ ] All 3 hooks documented with interfaces and business logic
- [ ] All default seeds documented (rating sources, signal mappings, labels)
- [ ] All formulas documented (weight normalization, bias adjustment, rating conversion)
- [ ] 8 sections follow 360 Feedback Manual pattern
- [ ] Learning objectives for each section
- [ ] Step-by-step procedures with expected results
- [ ] Troubleshooting sections for major configuration areas
- [ ] TOC navigation anchors (sec-3-1 through sec-3-8)
- [ ] Updated read time in successionManual.ts (140 min)
- [ ] Schema field names match actual database
- [ ] Hook interface names match actual code

---

## Estimated Effort

| Task | Files | Lines | Hours |
|------|-------|-------|-------|
| Create directory + index.ts | 1 | 25 | 0.5 |
| NineBoxOverview.tsx | 1 | 400 | 2 |
| NineBoxRatingSources.tsx | 1 | 450 | 2.5 |
| NineBoxSignalMappings.tsx | 1 | 400 | 2.5 |
| NineBoxIndicatorLabels.tsx | 1 | 500 | 3 |
| NineBoxPerformanceAxis.tsx | 1 | 350 | 2 |
| NineBoxPotentialAxis.tsx | 1 | 350 | 2 |
| NineBoxAssessmentWorkflow.tsx (NEW) | 1 | 400 | 2.5 |
| NineBoxEvidenceAudit.tsx (NEW) | 1 | 300 | 2 |
| Update successionManual.ts | 1 | 100 | 1 |
| Update SuccessionNineBoxSection.tsx | 1 | 60 | 0.5 |
| **Total** | **11** | **~3,335** | **~20 hrs** |

