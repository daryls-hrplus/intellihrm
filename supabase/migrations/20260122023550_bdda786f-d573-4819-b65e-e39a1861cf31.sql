-- Add missing workflow categories for Performance workflows
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'pip_acknowledgment';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'rating_release_approval';