
# Chapter 6: AI-Powered Learning - Restructuring Plan

## Executive Summary

Chapter 6 currently consists of **7 placeholder components** with 1-sentence stubs. This plan restructures the chapter into **8 focused sections** that document the **actual implemented features** without over-engineering.

---

## Current State Analysis

### Existing Chapter 6 (Placeholder Status)
```text
LndAISection.tsx (12 lines)
├── 6.1 AI Course Recommendations → 1 sentence
├── 6.2 Competency Gap Detection → 1 sentence
├── 6.3 Training Needs Analysis → 1 sentence
├── 6.4 Intelligent Quiz Generation → 1 sentence
├── 6.5 Learning Analytics Predictions → 1 sentence
└── 6.6 AI Governance → 1 sentence
```

### Implemented Database Infrastructure
| Table | Fields | Status |
|-------|--------|--------|
| `employee_skill_gaps` | 18 fields (gap_score, priority, recommended_actions, idp_item_id) | Fully implemented |
| `training_needs` | 17 fields (priority, competency_id, recommended_course_id) | Fully implemented |
| `training_needs_analysis` | 13 fields (analysis_type, findings, recommendations) | Fully implemented |
| `competency_course_mappings` | 10 fields (course_id, competency_id, is_mandatory) | Fully implemented |
| `ai_explainability_logs` | 14 fields (confidence_score, decision_factors, citations) | Fully implemented |
| `ai_governance_metrics` | 17 fields (compliance_rate, bias_incidents, human_reviews) | Fully implemented |
| `ai_model_registry` | 20+ fields (risk_classification, approved_use_cases, audit_schedule) | Fully implemented |

### Implemented UI Components
| Component | Location | Functionality |
|-----------|----------|---------------|
| `TrainingNeedsTab.tsx` | `/training` | 448 lines - Full CRUD for training needs + analyses |
| `CourseCompetenciesTab.tsx` | `/training` | 265 lines - Course-competency mapping |
| `TrainingAnalytics.tsx` | `/training` | 471 lines - 8 KPIs, 4 chart types |
| `AIModelRegistryPanel.tsx` | `/ai-governance` | Model registry viewer |
| `AIAuditTrailPanel.tsx` | `/ai-governance` | Human override audit trail |

---

## Proposed Structure: 8 Focused Sections

```text
Chapter 6: AI-Powered Learning Intelligence
├── 6.1 Overview & Architecture
├── 6.2 Skill Gap Detection & Analysis
├── 6.3 Training Needs Analysis
├── 6.4 Course-Competency Recommendations
├── 6.5 Learning Analytics & Predictions
├── 6.6 AI Content Generation (Future)
├── 6.7 AI Governance & Explainability
└── 6.8 Model Configuration & Registry
```

---

## Section Content Specifications

### 6.1 Overview & Architecture
**Purpose**: Introduction to AI capabilities within L&D module

**Content**:
- AI feature summary and value proposition
- Integration points with other modules (Performance, Succession, IDP)
- Data flow diagram showing how skill gaps flow to recommendations
- Role-based access (who sees what AI features)

**Estimated Length**: ~80 lines

---

### 6.2 Skill Gap Detection & Analysis
**Purpose**: Document the employee_skill_gaps system

**Database Schema** (`employee_skill_gaps`):
| Field | Type | Purpose |
|-------|------|---------|
| `capability_name` | string | Skill/competency being measured |
| `current_level` | number | Employee's assessed level (1-5) |
| `required_level` | number | Target level for role |
| `gap_score` | number | Calculated gap (required - current) |
| `priority` | string | critical/high/medium/low |
| `recommended_actions` | JSONB | AI-suggested remediation |
| `source` | string | appraisal/360/assessment/manual |
| `idp_item_id` | FK | Link to development plan item |
| `status` | string | identified/in_progress/addressed |

**UI Navigation**: Training → Gap Analysis → Employee Gaps

**Content**:
- Gap detection sources (appraisals, 360 feedback, assessments)
- Gap score calculation formula
- Priority classification rules
- Linking gaps to IDP items
- Edge function: `skill-gap-processor`

**Estimated Length**: ~150 lines

---

### 6.3 Training Needs Analysis
**Purpose**: Document organizational/departmental training needs

**Database Schemas**:

`training_needs_analysis`:
| Field | Type | Purpose |
|-------|------|---------|
| `analysis_type` | string | organizational/departmental/individual |
| `findings` | JSONB | Analysis results |
| `recommendations` | JSONB | AI-generated recommendations |
| `status` | string | draft/in_progress/completed |

`training_needs`:
| Field | Type | Purpose |
|-------|------|---------|
| `skill_gap_description` | string | Free-text gap description |
| `priority` | string | critical/high/medium/low |
| `recommended_course_id` | FK | Suggested course |
| `target_date` | date | Remediation target |
| `analysis_id` | FK | Parent analysis |

**UI Navigation**: Training → Training Needs (Tab)

**Content**:
- Creating organizational analyses
- Department-level gap aggregation
- Priority-based need identification
- Status workflow (identified → planned → in_progress → addressed)

**Estimated Length**: ~140 lines

---

### 6.4 Course-Competency Recommendations
**Purpose**: Document competency-to-course mapping for recommendations

**Database Schema** (`competency_course_mappings`):
| Field | Type | Purpose |
|-------|------|---------|
| `competency_id` | FK | Target competency |
| `course_id` | FK | Internal course |
| `vendor_course_id` | FK | External vendor course |
| `is_mandatory` | boolean | Required for role |
| `min_gap_level` | number | Minimum gap to trigger |

**UI Navigation**: Training → Course Competencies (Tab)

**Content**:
- Mapping courses to competencies
- Gap-triggered course recommendations
- Proficiency level targeting
- Integration with vendor catalog

**Estimated Length**: ~120 lines

---

### 6.5 Learning Analytics & Predictions
**Purpose**: Document the analytics dashboard and predictive capabilities

**UI Component**: `TrainingAnalytics.tsx` (471 lines)

**KPIs Documented**:
1. Total Courses (published)
2. Total Enrollments
3. Completion Rate (%)
4. Average Quiz Score (%)
5. Certifications Issued
6. Total Training Hours
7. Compliance Rate (%)
8. Budget Utilization (%)

**Charts**:
- Monthly Enrollments (Bar)
- Enrollment Status (Pie)
- Completions & Certifications Trend (Area)
- Courses by Category (Pie)
- Top 5 Courses

**Content**:
- Dashboard navigation
- Year-over-year filtering
- Predictive indicators (future enhancement notes)

**Estimated Length**: ~130 lines

---

### 6.6 AI Content Generation
**Purpose**: Document AI-assisted content creation capabilities

**Status**: Placeholder for future enhancement

**Content**:
- Vision for AI quiz generation
- Course outline generation roadmap
- Learning objective suggestions
- Assessment rubric creation
- Current manual process vs. future AI-assisted

**Estimated Length**: ~60 lines

---

### 6.7 AI Governance & Explainability
**Purpose**: Document ISO 42001 compliance for L&D AI features

**Database Schemas**:

`ai_explainability_logs`:
| Field | Type | Purpose |
|-------|------|---------|
| `confidence_score` | number | AI confidence (0-1) |
| `decision_factors` | JSONB | Why AI made this recommendation |
| `citations` | JSONB | Source data references |
| `uncertainty_areas` | string[] | Known limitations |

`ai_governance_metrics`:
| Field | Type | Purpose |
|-------|------|---------|
| `compliance_rate` | number | ISO 42001 compliance % |
| `bias_incidents_detected` | number | Count of bias flags |
| `human_reviews_completed` | number | Oversight actions |
| `overrides_count` | number | Human corrections |

**Content**:
- Explainability requirements for L&D recommendations
- Human oversight workflows
- Bias detection in skill assessments
- Audit trail requirements

**Estimated Length**: ~120 lines

---

### 6.8 Model Configuration & Registry
**Purpose**: Document AI model administration for L&D

**Database Schema** (`ai_model_registry`):
| Field | Type | Purpose |
|-------|------|---------|
| `model_identifier` | string | e.g., google/gemini-2.5-flash |
| `display_name` | string | User-friendly name |
| `risk_classification` | string | low/medium/high/critical |
| `approved_use_cases` | string[] | Permitted L&D functions |
| `next_audit_due` | date | Compliance audit schedule |
| `compliance_status` | string | compliant/pending/non_compliant |

**UI Navigation**: Admin → AI Governance → Model Registry

**Content**:
- Registering models for L&D use
- Risk classification guidelines
- Audit scheduling
- Use case approval process

**Estimated Length**: ~100 lines

---

## Implementation Plan

### Phase 1: Create Section Components
**Files to Create** (in `src/components/enablement/learning-development-manual/sections/ai/`):

| File | Section | Est. Lines |
|------|---------|------------|
| `LndAIOverview.tsx` | 6.1 | ~80 |
| `LndAISkillGapDetection.tsx` | 6.2 | ~150 |
| `LndAITrainingNeedsAnalysis.tsx` | 6.3 | ~140 |
| `LndAICourseRecommendations.tsx` | 6.4 | ~120 |
| `LndAILearningAnalytics.tsx` | 6.5 | ~130 |
| `LndAIContentGeneration.tsx` | 6.6 | ~60 |
| `LndAIGovernance.tsx` | 6.7 | ~120 |
| `LndAIModelRegistry.tsx` | 6.8 | ~100 |

**Total**: 8 files, ~900 lines (vs. 7 placeholder files with ~70 lines)

### Phase 2: Update Main Section & Index
**Files to Update**:
- `LndAISection.tsx` - New architecture with proper section groups
- `sections/ai/index.ts` - Export all new components

### Phase 3: Content Population
Each section will include:
1. **Learning Objectives** (3-4 bullets)
2. **Database Schema Table** (using FieldReferenceTable pattern)
3. **UI Navigation Path** (step-by-step)
4. **Business Rules** (3-5 key rules)
5. **Integration Points** (cross-module references)

---

## Comparison: Before vs. After

| Metric | Current | Proposed |
|--------|---------|----------|
| Total Sections | 7 placeholder | 8 focused |
| Total Lines | ~70 | ~900 |
| Database Tables Documented | 0 | 7 |
| UI Navigation Paths | 0 | 8 |
| Schema Field References | 0 | 50+ |
| Business Rules | 0 | 30+ |

---

## Timeline

| Phase | Effort |
|-------|--------|
| Phase 1: Create 8 section components | 2-3 hours |
| Phase 2: Update main section & index | 30 minutes |
| Phase 3: Content population | Included in Phase 1 |
| **Total** | **3-4 hours** |

---

## Key Principles Applied

1. **Right-sized**: 8 sections (not 28) - documents what exists
2. **Schema-driven**: Each section references actual database tables
3. **UI-linked**: Navigation paths to real implemented components
4. **Industry-aligned**: Follows ADDIE/Kirkpatrick patterns
5. **Governance-compliant**: ISO 42001 documentation included
