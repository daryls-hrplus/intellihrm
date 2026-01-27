-- Phase 1: Industry-Standard Field Naming Migration
-- Aligns database schema with SAP SuccessFactors, Workday, and Oracle HCM naming conventions

-- =====================================================
-- 1. talent_signal_definitions Table Updates
-- =====================================================

-- Rename columns to industry-standard names
ALTER TABLE talent_signal_definitions RENAME COLUMN code TO signal_code;
ALTER TABLE talent_signal_definitions RENAME COLUMN name TO signal_name;
ALTER TABLE talent_signal_definitions RENAME COLUMN name_en TO signal_name_en;
ALTER TABLE talent_signal_definitions RENAME COLUMN signal_category TO category;
ALTER TABLE talent_signal_definitions RENAME COLUMN aggregation_method TO calculation_method;

-- Add missing fields documented in manual
ALTER TABLE talent_signal_definitions ADD COLUMN IF NOT EXISTS weight_default numeric(5,2) DEFAULT 1.0;
ALTER TABLE talent_signal_definitions ADD COLUMN IF NOT EXISTS source_module text;

-- Add comment for documentation
COMMENT ON TABLE talent_signal_definitions IS 'Talent signal definitions with industry-standard field naming (SAP/Workday/Oracle aligned)';
COMMENT ON COLUMN talent_signal_definitions.signal_code IS 'Unique signal code identifier (e.g., leadership_consistency)';
COMMENT ON COLUMN talent_signal_definitions.signal_name IS 'Display name for the signal';
COMMENT ON COLUMN talent_signal_definitions.category IS 'Signal category: leadership, teamwork, technical, values, general';
COMMENT ON COLUMN talent_signal_definitions.calculation_method IS 'Score aggregation method: weighted_average, simple_average, median, max, min';
COMMENT ON COLUMN talent_signal_definitions.weight_default IS 'Default weight used in calculations (0-100 scale)';
COMMENT ON COLUMN talent_signal_definitions.source_module IS 'Primary data source module: performance, feedback_360, competency, goals';

-- =====================================================
-- 2. talent_signal_snapshots Table Updates
-- =====================================================

-- Rename columns to industry-standard names
ALTER TABLE talent_signal_snapshots RENAME COLUMN raw_score TO raw_value;
ALTER TABLE talent_signal_snapshots RENAME COLUMN computed_at TO captured_at;
ALTER TABLE talent_signal_snapshots RENAME COLUMN valid_until TO expires_at;
ALTER TABLE talent_signal_snapshots RENAME COLUMN valid_from TO effective_from;
ALTER TABLE talent_signal_snapshots RENAME COLUMN source_type TO source_record_type;

-- Add missing fields documented in manual
ALTER TABLE talent_signal_snapshots ADD COLUMN IF NOT EXISTS source_record_id uuid;

-- Add index for source record lookups
CREATE INDEX IF NOT EXISTS idx_signal_snapshots_source 
  ON talent_signal_snapshots(source_record_type, source_record_id);

-- Add comments
COMMENT ON TABLE talent_signal_snapshots IS 'Point-in-time signal snapshots with industry-standard field naming';
COMMENT ON COLUMN talent_signal_snapshots.raw_value IS 'Raw score before normalization';
COMMENT ON COLUMN talent_signal_snapshots.captured_at IS 'Timestamp when the signal was computed';
COMMENT ON COLUMN talent_signal_snapshots.expires_at IS 'End of validity period (null = current)';
COMMENT ON COLUMN talent_signal_snapshots.effective_from IS 'Start of validity period';
COMMENT ON COLUMN talent_signal_snapshots.source_record_type IS 'Type of source record: appraisal, feedback_360, competency_assessment, goal';
COMMENT ON COLUMN talent_signal_snapshots.source_record_id IS 'Specific source record reference UUID';

-- =====================================================
-- 3. nine_box_signal_mappings Table Updates
-- =====================================================

-- Rename column to industry-standard name
ALTER TABLE nine_box_signal_mappings RENAME COLUMN minimum_confidence TO min_confidence;

-- Add missing field documented in manual
ALTER TABLE nine_box_signal_mappings ADD COLUMN IF NOT EXISTS bias_multiplier numeric(3,2) DEFAULT 1.0;

-- Add comments
COMMENT ON COLUMN nine_box_signal_mappings.min_confidence IS 'Minimum confidence threshold for signal to contribute';
COMMENT ON COLUMN nine_box_signal_mappings.bias_multiplier IS 'Multiplier for bias adjustment in calculations';

-- =====================================================
-- 4. compensation_review_flags Table Updates
-- =====================================================

-- Rename column to industry-standard name
ALTER TABLE compensation_review_flags RENAME COLUMN source_participant_id TO source_reference_id;

-- Add missing field documented in manual
ALTER TABLE compensation_review_flags ADD COLUMN IF NOT EXISTS flag_type text;

-- Add comments
COMMENT ON COLUMN compensation_review_flags.source_reference_id IS 'Reference to source record (participant, assessment, etc.)';
COMMENT ON COLUMN compensation_review_flags.flag_type IS 'Type of compensation flag: retention, adjustment, freeze, bonus';