-- =====================================================
-- Add new workflow_category enum values
-- =====================================================

-- Performance categories
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'continuous_feedback';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'midcycle_review';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'pip_extension';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'pip_closure';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'appraisal_reopen';

-- Succession categories
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'key_position_designation';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'bench_strength_review';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'flight_risk_acknowledgment';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'retention_action_approval';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'ninebox_override';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'feedback_360_release';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'feedback_360_investigation';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'feedback_360_external';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'feedback_360_cycle';