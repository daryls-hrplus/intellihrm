-- First, add the new enum values to lookup_category
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'demotion_reason';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'retirement_type';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'employment_status';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'contract_extension_reason';