-- Add new lookup categories for employee transactions
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'transaction_type';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'probation_extension_reason';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'promotion_reason';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'transfer_reason';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'acting_reason';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'hire_type';