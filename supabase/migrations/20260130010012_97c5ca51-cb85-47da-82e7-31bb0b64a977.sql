-- =====================================================
-- Add Career Development Workflow Categories to Enum
-- Based on Workday Career Hub patterns
-- =====================================================

ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'idp_approval';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'career_path_approval';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'mentorship_approval';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'development_assignment';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'career_move_request';