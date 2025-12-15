-- Add age range fields to statutory_rate_bands for exemptions
ALTER TABLE public.statutory_rate_bands
ADD COLUMN min_age integer DEFAULT NULL,
ADD COLUMN max_age integer DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.statutory_rate_bands.min_age IS 'Minimum age for this band to apply (NULL = no minimum)';
COMMENT ON COLUMN public.statutory_rate_bands.max_age IS 'Maximum age for this band to apply (NULL = no maximum)';