-- Add secondment_reason to lookup_category enum
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'secondment_reason';