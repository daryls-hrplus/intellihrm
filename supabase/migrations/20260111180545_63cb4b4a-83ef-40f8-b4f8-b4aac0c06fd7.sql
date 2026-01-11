-- Add missing lookup categories for employee imports
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'gender';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'marital_status';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'title';