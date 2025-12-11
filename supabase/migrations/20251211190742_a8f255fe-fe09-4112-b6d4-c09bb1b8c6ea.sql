-- Add pay element categories to lookup_category enum
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'pay_element_type';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'proration_method';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'payment_frequency';