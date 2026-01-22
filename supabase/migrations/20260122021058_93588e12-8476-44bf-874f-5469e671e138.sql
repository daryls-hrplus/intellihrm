-- First, add new workflow categories to the workflow_category enum
-- PostgreSQL requires using ALTER TYPE to add enum values

ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'goal_approval';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'rating_approval';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'feedback_360_approval';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'calibration_approval';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'succession_approval';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'learning_approval';