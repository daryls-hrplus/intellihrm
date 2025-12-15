-- Add pay_frequency to statutory_rate_bands to support different ranges per frequency
ALTER TABLE public.statutory_rate_bands 
ADD COLUMN pay_frequency TEXT DEFAULT 'monthly';

-- Add comment explaining the field
COMMENT ON COLUMN public.statutory_rate_bands.pay_frequency IS 'Pay frequency this rate band applies to: weekly, fortnightly, monthly. For fortnightly lookups, divide earnings by 2 and use weekly ranges.';

-- Create index for efficient lookups by statutory type and frequency
CREATE INDEX idx_statutory_rate_bands_frequency ON public.statutory_rate_bands(statutory_type_id, pay_frequency);