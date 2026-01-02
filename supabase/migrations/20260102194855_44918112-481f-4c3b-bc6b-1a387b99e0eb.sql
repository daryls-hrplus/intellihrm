-- Add new appraisal integration event types for HR Reminders bridge
-- First check if they exist to avoid duplicates
INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active)
SELECT 'APPRAISAL_FINALIZED', 'Appraisal Finalized', 'Reminder after appraisal is completed and submitted', 'performance', 'appraisal_participants', 'submitted_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'APPRAISAL_FINALIZED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active)
SELECT 'PIP_CREATED', 'PIP Created', 'Reminder when Performance Improvement Plan is auto-generated from appraisal', 'performance', 'individual_development_plans', 'created_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'PIP_CREATED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active)
SELECT 'IDP_CREATED', 'Development Plan Created', 'Reminder when Individual Development Plan is auto-generated from appraisal', 'performance', 'individual_development_plans', 'created_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'IDP_CREATED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active)
SELECT 'COMPENSATION_FLAG_CREATED', 'Compensation Review Flag Created', 'Reminder when compensation review flag is created from appraisal outcome', 'performance', 'compensation_review_flags', 'created_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'COMPENSATION_FLAG_CREATED');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active)
SELECT 'COMPENSATION_FLAG_EXPIRING', 'Compensation Flag Expiring', 'Reminder before compensation review flag expires (90-day default window)', 'performance', 'compensation_review_flags', 'expires_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'COMPENSATION_FLAG_EXPIRING');

INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active)
SELECT 'SUCCESSION_UPDATED', 'Succession Readiness Updated', 'Reminder when succession candidate readiness is updated from appraisal', 'performance', 'succession_candidates', 'updated_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'SUCCESSION_UPDATED');

-- Add cycle_type_filter column to reminder_rules for performance-related filtering
ALTER TABLE reminder_rules 
ADD COLUMN IF NOT EXISTS cycle_type_filter text[] DEFAULT NULL;

COMMENT ON COLUMN reminder_rules.cycle_type_filter IS 'Filter by appraisal cycle types (annual, quarterly, probation, project). Only applies to performance category event types.';