-- Add new workflow category enum values for employee transaction types
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'hire';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'rehire';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'confirmation';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'probation_extension';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'acting';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'secondment';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'salary_change';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'rate_change';