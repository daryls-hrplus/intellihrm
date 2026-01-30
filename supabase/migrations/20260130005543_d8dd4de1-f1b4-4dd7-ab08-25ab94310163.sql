-- =====================================================
-- Add Succession Planning Workflow Categories to Enum
-- Based on SAP SuccessFactors, Workday, Oracle HCM patterns
-- =====================================================

-- Add new workflow category values for succession planning
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'succession_nomination';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'succession_plan_approval';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'talent_pool_nomination';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'succession_emergency';