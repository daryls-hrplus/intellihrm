
-- Add employer_fixed_amount column for fixed statutory contributions (e.g., NIS classes)
ALTER TABLE public.statutory_rate_bands 
ADD COLUMN IF NOT EXISTS employer_fixed_amount NUMERIC;

-- Add index for better query performance on date-based lookups
CREATE INDEX IF NOT EXISTS idx_statutory_rate_bands_dates 
ON public.statutory_rate_bands(start_date, end_date) 
WHERE is_active = true;

-- Add comment
COMMENT ON COLUMN public.statutory_rate_bands.employer_fixed_amount IS 'Fixed employer contribution amount for class-based systems like NIS';
