-- =====================================================
-- Add Goal Workflow Categories to Enum
-- =====================================================

ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'goal_cascade';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'goal_modification';