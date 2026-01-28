-- =========================================================
-- PART 1: Add new workflow categories for L&D
-- These must be committed before being used in inserts
-- =========================================================

ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'certification_request';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'external_training';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'recertification_request';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'training_budget';