

# Succession Manual Chapter 9: Comprehensive Audit Report (Revised)
## Documentation vs. Database Schema vs. UI vs. Industry Standards

---

## Executive Summary

This revised plan addresses the comprehensive audit of Succession Manual Chapter 9 with a key clarification: **Where field names differ between documentation and database, the database schema will be updated to match industry-standard naming conventions documented in the manual.**

This approach ensures:
- Consistency with SAP SuccessFactors, Workday, and Oracle HCM naming patterns
- Self-documenting code with descriptive field names
- Long-term maintainability

---

## Audit Results Overview

| Category | Status | Gaps Found | Resolution Direction |
|----------|--------|------------|---------------------|
| Database Schema Accuracy | Partial Match | 23 field discrepancies | **Update DB to match docs** |
| Edge Function Coverage | Good | 4 undocumented modules | Update documentation |
| UI Component Alignment | Good | 2 missing cross-references | Update documentation |
| Industry Standard Alignment | Partial | 5 enhancement opportunities | Add new sections |

---

## Part 1: Database Schema Changes (Industry Standard Naming)

### 1.1 talent_signal_definitions Table

**Current Database vs. Industry Standard Documentation:**

| Current DB Field | Industry Standard Name | Action |
|------------------|----------------------|--------|
| `code` | `signal_code` | **Rename column** |
| `name` | `signal_name` | **Rename column** |
| `signal_category` | `category` | **Rename column** |
| `aggregation_method` | `calculation_method` | **Rename column** |
| `name_en` | `signal_name_en` | **Rename for consistency** |

**Fields to Add (documented but missing):**
| Field | Type | Purpose |
|-------|------|---------|
| `weight_default` | `numeric(5,2)` | Default weight for signal in calculations |
| `source_module` | `text` | Source module identifier (performance, 360, competency) |

**SQL Migration:**
```sql
-- Rename columns to industry standard names
ALTER TABLE talent_signal_definitions RENAME COLUMN code TO signal_code;
ALTER TABLE talent_signal_definitions RENAME COLUMN name TO signal_name;
ALTER TABLE talent_signal_definitions RENAME COLUMN name_en TO signal_name_en;
ALTER TABLE talent_signal_definitions RENAME COLUMN signal_category TO category;
ALTER TABLE talent_signal_definitions RENAME COLUMN aggregation_method TO calculation_method;

-- Add missing fields
ALTER TABLE talent_signal_definitions ADD COLUMN weight_default numeric(5,2) DEFAULT 1.0;
ALTER TABLE talent_signal_definitions ADD COLUMN source_module text;

-- Update existing edge function references
COMMENT ON TABLE talent_signal_definitions IS 'Talent signal definitions with industry-standard field naming';
```

**Updated Complete Schema (17 fields):**
```
id, company_id, signal_code, signal_name, signal_name_en, description, 
category, source_module, calculation_method, weight_default, 
confidence_threshold, bias_risk_factors, is_system_defined, is_active, 
display_order, created_at, updated_at
```

---

### 1.2 talent_signal_snapshots Table

**Current Database vs. Industry Standard Documentation:**

| Current DB Field | Industry Standard Name | Action |
|------------------|----------------------|--------|
| `raw_score` | `raw_value` | **Rename column** |
| `computed_at` | `captured_at` | **Rename column** |
| `valid_until` | `expires_at` | **Rename column** |
| `valid_from` | `effective_from` | **Rename for clarity** |
| `source_type` | `source_record_type` | **Rename column** |

**Fields to Add (documented but missing):**
| Field | Type | Purpose |
|-------|------|---------|
| `data_freshness_days` | `integer` | Computed age of data in days |
| `source_record_id` | `uuid` | Specific source record reference |

**SQL Migration:**
```sql
-- Rename columns to industry standard names
ALTER TABLE talent_signal_snapshots RENAME COLUMN raw_score TO raw_value;
ALTER TABLE talent_signal_snapshots RENAME COLUMN computed_at TO captured_at;
ALTER TABLE talent_signal_snapshots RENAME COLUMN valid_until TO expires_at;
ALTER TABLE talent_signal_snapshots RENAME COLUMN valid_from TO effective_from;
ALTER TABLE talent_signal_snapshots RENAME COLUMN source_type TO source_record_type;

-- Add missing fields
ALTER TABLE talent_signal_snapshots ADD COLUMN data_freshness_days integer 
  GENERATED ALWAYS AS (EXTRACT(DAY FROM (now() - captured_at))::integer) STORED;
ALTER TABLE talent_signal_snapshots ADD COLUMN source_record_id uuid;

-- Add index for source record lookups
CREATE INDEX idx_signal_snapshots_source ON talent_signal_snapshots(source_record_type, source_record_id);
```

**Updated Complete Schema (24 fields):**
```
id, employee_id, company_id, signal_definition_id, source_cycle_id, 
source_record_type, source_record_id, snapshot_version, signal_value, 
raw_value, normalized_score, confidence_score, bias_risk_level, 
bias_factors, evidence_count, evidence_summary, rater_breakdown, 
data_freshness_days, effective_from, expires_at, is_current, 
captured_at, created_at, created_by
```

---

### 1.3 nine_box_signal_mappings Table

**Current Database vs. Industry Standard Documentation:**

| Current DB Field | Industry Standard Name | Action |
|------------------|----------------------|--------|
| `minimum_confidence` | `min_confidence` | **Rename column** |

**Fields to Add (documented but missing):**
| Field | Type | Purpose |
|-------|------|---------|
| `bias_multiplier` | `numeric(3,2)` | Multiplier for bias adjustment |

**SQL Migration:**
```sql
-- Rename column to industry standard
ALTER TABLE nine_box_signal_mappings RENAME COLUMN minimum_confidence TO min_confidence;

-- Add missing field
ALTER TABLE nine_box_signal_mappings ADD COLUMN bias_multiplier numeric(3,2) DEFAULT 1.0;
```

**Updated Complete Schema (11 fields):**
```
id, company_id, signal_definition_id, contributes_to, weight, 
min_confidence, bias_multiplier, is_active, created_at, updated_at
```

---

### 1.4 appraisal_integration_rules Table

**No column renames needed** - Documentation matches database field names.

**Documentation Update Required:**
- Update field count from "20 fields" to "28 fields"
- Add documentation for these 8 missing fields:

| Field | Type | Purpose |
|-------|------|---------|
| `updated_at` | `timestamptz` | Last update timestamp |
| `created_by` | `uuid` | User who created rule |
| `rating_level_codes` | `text[]` | Rating codes for conditions |
| `action_priority` | `integer` | Priority for execution order |
| `action_is_mandatory` | `boolean` | Whether action is mandatory |
| `action_message` | `text` | Custom message for action |
| `requires_hr_override` | `boolean` | HR override requirement |
| `condition_threshold` | `numeric` | Numeric threshold value |

---

### 1.5 appraisal_integration_log Table

**No column renames needed** - Documentation matches database field names.

**Documentation Update Required:**
- Add documentation for these 4 missing fields:

| Field | Type | Purpose |
|-------|------|---------|
| `action_config` | `jsonb` | Action configuration at execution time |
| `executed_by` | `uuid` | User who executed the action |
| `approved_by` | `uuid` | User who approved the action |
| `rejection_reason` | `text` | Reason if action was rejected |

---

### 1.6 compensation_review_flags Table

**Column Renames Required:**

| Current DB Field | Industry Standard Name | Action |
|------------------|----------------------|--------|
| `source_participant_id` | `source_reference_id` | **Rename column** |

**SQL Migration:**
```sql
-- Rename to industry standard
ALTER TABLE compensation_review_flags RENAME COLUMN source_participant_id TO source_reference_id;

-- Add missing field documented in manual
ALTER TABLE compensation_review_flags ADD COLUMN flag_type text;
```

**Documentation Update Required:**
Add these 11 missing fields to Section 9.9:

| Field | Type | Purpose |
|-------|------|---------|
| `source_cycle_id` | `uuid` | Source cycle reference |
| `performance_category_code` | `text` | Performance category |
| `performance_score` | `numeric` | Numeric performance score |
| `recommended_percentage` | `numeric` | Recommended adjustment % |
| `justification` | `text` | Business justification |
| `reviewed_at` | `timestamptz` | Review timestamp |
| `reviewed_by` | `uuid` | Reviewer user |
| `review_notes` | `text` | Review notes |
| `processed_at` | `timestamptz` | Processing timestamp |
| `processed_by` | `uuid` | Processor user |
| `outcome_notes` | `text` | Final outcome notes |

---

## Part 2: Edge Function Updates

### 2.1 Code Changes for Renamed Fields

The following edge functions need updates to reference the new field names:

| Edge Function | Files to Update | Changes |
|---------------|-----------------|---------|
| `feedback-signal-processor` | `index.ts` | `code` → `signal_code`, `name` → `signal_name` |
| `talent-risk-analyzer` | `index.ts` | `raw_score` → `raw_value`, `computed_at` → `captured_at` |
| `appraisal-integration-orchestrator` | Signal queries | Field name updates |

### 2.2 Undocumented Target Modules

Add documentation for these 4 target modules in Section 9.2:

| Target Module | Description | Action Types |
|---------------|-------------|--------------|
| `workforce_analytics` | Triggers performance index calculations | `calculate_index`, `update_metrics` |
| `notifications` | Creates user notifications | `create_notification`, `send_alert` |
| `reminders` | Creates HR reminder tasks | `create_reminder`, `schedule_task` |
| `development` | Generates development themes from 360 | `generate_themes`, `create_goals` |

### 2.3 Undocumented Action Types

| Module | Undocumented Action | Description |
|--------|---------------------|-------------|
| `training` | `add_to_path` | Add employee to learning path |
| `development` | `generate_themes` | AI-generate development themes |
| `notifications` | `create_notification` | Create in-app notification |
| `reminders` | `create_reminder` | Create HR reminder task |

---

## Part 3: Documentation-Only Updates

### 3.1 IntegrationTalentSignals.tsx Updates

**FieldReferenceTable - Signal Definitions (17 fields):**
```typescript
const signalDefinitionFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique identifier', defaultValue: 'Auto-generated' },
  { name: 'company_id', required: false, type: 'uuid', description: 'Company scope (null for system signals)' },
  { name: 'signal_code', required: true, type: 'text', description: 'Unique signal code (e.g., leadership_consistency)', validation: 'snake_case, max 50 chars' },
  { name: 'signal_name', required: true, type: 'text', description: 'Display name for signal' },
  { name: 'signal_name_en', required: false, type: 'text', description: 'English translation of signal name' },
  { name: 'description', required: false, type: 'text', description: 'Detailed signal description' },
  { name: 'category', required: true, type: 'enum', description: 'Signal category', validation: 'leadership | teamwork | technical | values | general' },
  { name: 'source_module', required: false, type: 'text', description: 'Primary data source module', validation: 'performance | feedback_360 | competency | goals' },
  { name: 'calculation_method', required: true, type: 'enum', description: 'Score aggregation method', validation: 'weighted_average | simple_average | median | max | min' },
  { name: 'weight_default', required: false, type: 'numeric(5,2)', description: 'Default weight in calculations', defaultValue: '1.0' },
  { name: 'confidence_threshold', required: true, type: 'numeric(3,2)', description: 'Minimum confidence for signal validity', defaultValue: '0.6' },
  { name: 'bias_risk_factors', required: false, type: 'text[]', description: 'Known bias risk factors for this signal' },
  { name: 'is_system_defined', required: true, type: 'boolean', description: 'System-provided vs. company-defined', defaultValue: 'false' },
  { name: 'is_active', required: true, type: 'boolean', description: 'Active status for calculations', defaultValue: 'true' },
  { name: 'display_order', required: false, type: 'integer', description: 'UI display ordering' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()' },
  { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last update timestamp', defaultValue: 'now()' },
];
```

**FieldReferenceTable - Signal Snapshots (24 fields):**
```typescript
const signalSnapshotFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique identifier' },
  { name: 'employee_id', required: true, type: 'uuid', description: 'Target employee reference' },
  { name: 'company_id', required: true, type: 'uuid', description: 'Company scope' },
  { name: 'signal_definition_id', required: true, type: 'uuid', description: 'Reference to signal definition' },
  { name: 'source_cycle_id', required: false, type: 'uuid', description: 'Source cycle (appraisal, 360, etc.)' },
  { name: 'source_record_type', required: true, type: 'text', description: 'Type of source record', validation: 'appraisal | feedback_360 | competency_assessment | goal' },
  { name: 'source_record_id', required: false, type: 'uuid', description: 'Specific source record reference' },
  { name: 'snapshot_version', required: true, type: 'integer', description: 'Version number for this snapshot', defaultValue: '1' },
  { name: 'signal_value', required: false, type: 'numeric(5,2)', description: 'Final computed signal value (0-100 scale)' },
  { name: 'raw_value', required: false, type: 'numeric(5,2)', description: 'Raw score before normalization' },
  { name: 'normalized_score', required: false, type: 'numeric(5,4)', description: 'Normalized score (0-1 scale)' },
  { name: 'confidence_score', required: false, type: 'numeric(3,2)', description: 'Confidence level (0-1 scale)' },
  { name: 'bias_risk_level', required: true, type: 'enum', description: 'Assessed bias risk', defaultValue: 'low', validation: 'low | medium | high' },
  { name: 'bias_factors', required: false, type: 'text[]', description: 'Detected bias factors' },
  { name: 'evidence_count', required: true, type: 'integer', description: 'Number of evidence sources', defaultValue: '0' },
  { name: 'evidence_summary', required: false, type: 'jsonb', description: 'Summary of evidence (response_count, rater_group_count, score_range)' },
  { name: 'rater_breakdown', required: false, type: 'jsonb', description: 'Breakdown by rater category (avg, count per category)' },
  { name: 'data_freshness_days', required: false, type: 'integer', description: 'Days since data capture (computed)', defaultValue: 'Computed' },
  { name: 'effective_from', required: true, type: 'timestamptz', description: 'Start of validity period' },
  { name: 'expires_at', required: false, type: 'timestamptz', description: 'End of validity period (null = current)' },
  { name: 'is_current', required: true, type: 'boolean', description: 'Current snapshot flag', defaultValue: 'true' },
  { name: 'captured_at', required: true, type: 'timestamptz', description: 'When signal was computed' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp' },
  { name: 'created_by', required: false, type: 'uuid', description: 'User or system that created snapshot' },
];
```

---

### 3.2 IntegrationRulesEngine.tsx Updates

**FieldReferenceTable - Integration Rules (28 fields):**
Add these 8 missing fields to existing table:

```typescript
// Add to existing integrationRuleFields array
{ name: 'updated_at', required: true, type: 'timestamptz', description: 'Last update timestamp', defaultValue: 'now()' },
{ name: 'created_by', required: false, type: 'uuid', description: 'User who created the rule' },
{ name: 'rating_level_codes', required: false, type: 'text[]', description: 'Rating level codes for condition matching', validation: 'Array of valid rating codes' },
{ name: 'action_priority', required: false, type: 'integer', description: 'Priority for action execution ordering', defaultValue: '100' },
{ name: 'action_is_mandatory', required: true, type: 'boolean', description: 'Whether action completion is mandatory', defaultValue: 'false' },
{ name: 'action_message', required: false, type: 'text', description: 'Custom message displayed with action' },
{ name: 'requires_hr_override', required: true, type: 'boolean', description: 'Requires HR override to skip', defaultValue: 'false' },
{ name: 'condition_threshold', required: false, type: 'numeric', description: 'Numeric threshold for condition evaluation' },
```

**Add Target Module Reference Table:**
```typescript
const targetModuleReference = [
  { module: 'nine_box', description: 'Update Nine-Box placement', actions: 'update_placement, create_assessment, recalculate' },
  { module: 'succession', description: 'Update succession candidate status', actions: 'update_readiness, add_candidate, flag_for_review' },
  { module: 'idp', description: 'Create or update development plans', actions: 'create_goal, link_gap, recommend_action' },
  { module: 'pip', description: 'Performance improvement plan triggers', actions: 'create_pip, add_milestone, escalate' },
  { module: 'compensation', description: 'Create compensation review flags', actions: 'create_flag, recommend_adjustment, freeze_action' },
  { module: 'training', description: 'Learning & development actions', actions: 'auto_enroll, create_request, recommend, add_to_path' },
  { module: 'workforce_analytics', description: 'Update performance metrics', actions: 'calculate_index, update_metrics' },
  { module: 'notifications', description: 'User notification triggers', actions: 'create_notification, send_alert' },
  { module: 'reminders', description: 'HR reminder task creation', actions: 'create_reminder, schedule_task' },
  { module: 'development', description: 'Development theme generation', actions: 'generate_themes, create_goals' },
];
```

---

### 3.3 IntegrationExecutionAudit.tsx Updates

**Add 4 Missing Fields:**
```typescript
// Add to existing integrationLogFields array
{ name: 'action_config', required: false, type: 'jsonb', description: 'Action configuration snapshot at execution time' },
{ name: 'executed_by', required: false, type: 'uuid', description: 'User who executed the action (null for auto-execute)' },
{ name: 'approved_by', required: false, type: 'uuid', description: 'User who approved the action (if requires_approval)' },
{ name: 'rejection_reason', required: false, type: 'text', description: 'Reason provided if action was rejected' },
```

---

### 3.4 IntegrationCompensation.tsx Updates

**Complete Rewrite - 23 Fields:**
```typescript
const compensationFlagFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique identifier' },
  { name: 'employee_id', required: true, type: 'uuid', description: 'Target employee reference' },
  { name: 'company_id', required: true, type: 'uuid', description: 'Company scope' },
  { name: 'flag_type', required: true, type: 'text', description: 'Type of compensation flag', validation: 'retention | adjustment | freeze | bonus' },
  { name: 'source_type', required: true, type: 'text', description: 'Source of the flag', validation: 'appraisal | succession | nine_box | manual' },
  { name: 'source_reference_id', required: false, type: 'uuid', description: 'Reference to source record' },
  { name: 'source_cycle_id', required: false, type: 'uuid', description: 'Source cycle reference' },
  { name: 'performance_category_code', required: false, type: 'text', description: 'Performance category from appraisal' },
  { name: 'performance_score', required: false, type: 'numeric(5,2)', description: 'Numeric performance score' },
  { name: 'recommended_action', required: false, type: 'text', description: 'Recommended compensation action' },
  { name: 'recommended_percentage', required: false, type: 'numeric(5,2)', description: 'Recommended adjustment percentage' },
  { name: 'justification', required: false, type: 'text', description: 'Business justification for recommendation' },
  { name: 'priority', required: true, type: 'enum', description: 'Flag priority level', defaultValue: 'medium', validation: 'low | medium | high | critical' },
  { name: 'status', required: true, type: 'enum', description: 'Current flag status', defaultValue: 'pending', validation: 'pending | reviewed | processed | dismissed' },
  { name: 'notes', required: false, type: 'text', description: 'Additional notes' },
  { name: 'reviewed_at', required: false, type: 'timestamptz', description: 'When flag was reviewed' },
  { name: 'reviewed_by', required: false, type: 'uuid', description: 'User who reviewed the flag' },
  { name: 'review_notes', required: false, type: 'text', description: 'Notes from review' },
  { name: 'processed_at', required: false, type: 'timestamptz', description: 'When flag was processed' },
  { name: 'processed_by', required: false, type: 'uuid', description: 'User who processed the flag' },
  { name: 'outcome_notes', required: false, type: 'text', description: 'Final outcome notes' },
  { name: 'expires_at', required: false, type: 'timestamptz', description: 'Flag expiration date' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp' },
  { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last update timestamp' },
];
```

---

## Part 4: TypeScript Type Updates

### 4.1 Update src/types/talentSignals.ts

```typescript
// Update TalentSignalDefinition interface
export interface TalentSignalDefinition {
  id: string;
  company_id: string | null;
  signal_code: string;  // Renamed from 'code'
  signal_name: string;  // Renamed from 'name'
  signal_name_en: string | null;  // Renamed from 'name_en'
  description: string | null;
  category: SignalCategory;  // Renamed from 'signal_category'
  source_module: string | null;  // NEW
  calculation_method: AggregationMethod;  // Renamed from 'aggregation_method'
  weight_default: number;  // NEW
  confidence_threshold: number;
  bias_risk_factors: string[];
  is_system_defined: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Update TalentSignalSnapshot interface
export interface TalentSignalSnapshot {
  id: string;
  employee_id: string;
  company_id: string;
  signal_definition_id: string;
  source_cycle_id: string | null;
  source_record_type: string;  // Renamed from 'source_type'
  source_record_id: string | null;  // NEW
  snapshot_version: number;
  signal_value: number | null;
  raw_value: number | null;  // Renamed from 'raw_score'
  normalized_score: number | null;
  confidence_score: number | null;
  bias_risk_level: BiasRiskLevel;
  bias_factors: string[];
  evidence_count: number;
  evidence_summary: {
    response_count: number;
    rater_group_count: number;
    score_range: { min: number; max: number };
  };
  rater_breakdown: Record<string, { avg: number; count: number }>;
  data_freshness_days: number;  // NEW (computed)
  effective_from: string;  // Renamed from 'valid_from'
  expires_at: string | null;  // Renamed from 'valid_until'
  is_current: boolean;
  captured_at: string;  // Renamed from 'computed_at'
  created_at: string;
  created_by: string | null;
  signal_definition?: TalentSignalDefinition;
}
```

### 4.2 Update src/hooks/feedback/useTalentSignals.ts

Update all query field references to match new column names.

---

## Part 5: Industry Alignment Enhancements (New Sections)

### 5.1 Section 9.13: Calibration Meeting Integration

**Purpose:** Document how talent review/calibration meetings trigger Nine-Box and succession updates.

**Content:**
- Calibration session workflow
- Cross-calibration adjustments
- Nine-Box grid updates from calibration
- Succession candidate re-ranking
- Meeting outcome capture

**Industry Alignment:** SAP SuccessFactors Calibration, Workday Talent Review

---

### 5.2 Section 9.14: Internal Recruitment Integration

**Purpose:** Document succession candidate fast-tracking for internal postings.

**Content:**
- Internal job posting visibility for succession candidates
- Candidate fast-tracking workflow
- Readiness-to-requisition matching
- Hiring manager succession visibility
- Offer impact on succession plans

**Industry Alignment:** Workday Internal Mobility, Oracle Recruiting Cloud

---

### 5.3 Section 9.15: Integration API & Webhooks

**Purpose:** Document external system integration capabilities.

**Content:**
- Webhook event types
- API endpoints for external systems
- Authentication and security
- Event payload structures
- Error handling and retries

**Industry Alignment:** Modern API-first architecture pattern

---

## Implementation Phases

### Phase 1: Database Schema Updates (Priority: Critical)

**SQL Migrations:**

```sql
-- Migration 1: talent_signal_definitions column renames
ALTER TABLE talent_signal_definitions RENAME COLUMN code TO signal_code;
ALTER TABLE talent_signal_definitions RENAME COLUMN name TO signal_name;
ALTER TABLE talent_signal_definitions RENAME COLUMN name_en TO signal_name_en;
ALTER TABLE talent_signal_definitions RENAME COLUMN signal_category TO category;
ALTER TABLE talent_signal_definitions RENAME COLUMN aggregation_method TO calculation_method;
ALTER TABLE talent_signal_definitions ADD COLUMN IF NOT EXISTS weight_default numeric(5,2) DEFAULT 1.0;
ALTER TABLE talent_signal_definitions ADD COLUMN IF NOT EXISTS source_module text;

-- Migration 2: talent_signal_snapshots column renames
ALTER TABLE talent_signal_snapshots RENAME COLUMN raw_score TO raw_value;
ALTER TABLE talent_signal_snapshots RENAME COLUMN computed_at TO captured_at;
ALTER TABLE talent_signal_snapshots RENAME COLUMN valid_until TO expires_at;
ALTER TABLE talent_signal_snapshots RENAME COLUMN valid_from TO effective_from;
ALTER TABLE talent_signal_snapshots RENAME COLUMN source_type TO source_record_type;
ALTER TABLE talent_signal_snapshots ADD COLUMN IF NOT EXISTS source_record_id uuid;

-- Migration 3: nine_box_signal_mappings column renames
ALTER TABLE nine_box_signal_mappings RENAME COLUMN minimum_confidence TO min_confidence;
ALTER TABLE nine_box_signal_mappings ADD COLUMN IF NOT EXISTS bias_multiplier numeric(3,2) DEFAULT 1.0;

-- Migration 4: compensation_review_flags updates
ALTER TABLE compensation_review_flags RENAME COLUMN source_participant_id TO source_reference_id;
ALTER TABLE compensation_review_flags ADD COLUMN IF NOT EXISTS flag_type text;
```

| Table | Column Renames | New Columns |
|-------|----------------|-------------|
| `talent_signal_definitions` | 5 | 2 |
| `talent_signal_snapshots` | 5 | 1 |
| `nine_box_signal_mappings` | 1 | 1 |
| `compensation_review_flags` | 1 | 1 |

---

### Phase 2: Edge Function Updates (Priority: Critical)

| Edge Function | Changes Required |
|---------------|------------------|
| `feedback-signal-processor` | Update field references for signal definitions and snapshots |
| `talent-risk-analyzer` | Update snapshot field references |
| `appraisal-integration-orchestrator` | Update signal query field names |

---

### Phase 3: TypeScript Updates (Priority: High)

| File | Changes |
|------|---------|
| `src/types/talentSignals.ts` | Update interfaces with new field names |
| `src/hooks/feedback/useTalentSignals.ts` | Update query field references |
| Any components using signal data | Update field access patterns |

---

### Phase 4: Documentation Updates (Priority: High)

| File | Changes | Lines |
|------|---------|-------|
| `IntegrationTalentSignals.tsx` | Complete field table rewrites (17 + 24 fields) | ~250 |
| `IntegrationRulesEngine.tsx` | Add 8 fields + 10 target modules | ~120 |
| `IntegrationExecutionAudit.tsx` | Add 4 fields | ~40 |
| `IntegrationCompensation.tsx` | Complete rewrite (23 fields) | ~150 |
| `IntegrationLearningDevelopment.tsx` | Add `add_to_path` action | ~20 |

---

### Phase 5: New Sections (Priority: Medium)

| File | Purpose | Lines |
|------|---------|-------|
| `IntegrationCalibration.tsx` | Calibration meeting integration | ~250 |
| `IntegrationRecruitment.tsx` | Internal recruitment integration | ~200 |
| `IntegrationAPI.tsx` | API/Webhook documentation | ~200 |
| `src/types/successionManual.ts` | Add 3 new section definitions | ~50 |

---

## Files to Modify Summary

| File | Change Type | Priority |
|------|-------------|----------|
| Database migrations | Schema changes | Critical |
| `supabase/functions/feedback-signal-processor/index.ts` | Field name updates | Critical |
| `supabase/functions/talent-risk-analyzer/index.ts` | Field name updates | Critical |
| `supabase/functions/appraisal-integration-orchestrator/index.ts` | Field name updates | Critical |
| `src/types/talentSignals.ts` | Interface updates | High |
| `src/hooks/feedback/useTalentSignals.ts` | Query updates | High |
| `src/components/enablement/manual/succession/sections/integration/IntegrationTalentSignals.tsx` | Field tables | High |
| `src/components/enablement/manual/succession/sections/integration/IntegrationRulesEngine.tsx` | Field tables + modules | High |
| `src/components/enablement/manual/succession/sections/integration/IntegrationExecutionAudit.tsx` | Field additions | High |
| `src/components/enablement/manual/succession/sections/integration/IntegrationCompensation.tsx` | Complete rewrite | High |
| `src/components/enablement/manual/succession/sections/integration/IntegrationLearningDevelopment.tsx` | Action addition | Medium |
| `src/components/enablement/manual/succession/sections/integration/IntegrationCalibration.tsx` | New file | Medium |
| `src/components/enablement/manual/succession/sections/integration/IntegrationRecruitment.tsx` | New file | Medium |
| `src/components/enablement/manual/succession/sections/integration/IntegrationAPI.tsx` | New file | Medium |
| `src/types/successionManual.ts` | Structure update | Medium |

---

## Estimated Effort

| Phase | Files | Effort |
|-------|-------|--------|
| Phase 1: DB Schema | 4 migrations | 1-2 hours |
| Phase 2: Edge Functions | 3 files | 2-3 hours |
| Phase 3: TypeScript | 2 files | 1-2 hours |
| Phase 4: Documentation | 5 files | 3-4 hours |
| Phase 5: New Sections | 4 files | 3-4 hours |
| **Total** | **18 files** | **10-15 hours** |

---

## Quality Metrics After Implementation

| Metric | Current | Target |
|--------|---------|--------|
| Schema field accuracy | ~70% | 100% |
| Field naming consistency | ~60% | 100% (industry standard) |
| Edge function coverage | ~75% | 100% |
| Industry standard alignment | ~80% | 95% |
| Field reference tables complete | 6/12 | 15/15 |

