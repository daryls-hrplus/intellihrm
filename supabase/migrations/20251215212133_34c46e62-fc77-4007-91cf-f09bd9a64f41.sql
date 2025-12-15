-- Add calculation method and per-monday amount to statutory_rate_bands
ALTER TABLE public.statutory_rate_bands
ADD COLUMN calculation_method TEXT NOT NULL DEFAULT 'percentage' CHECK (calculation_method IN ('percentage', 'per_monday', 'fixed')),
ADD COLUMN per_monday_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN employer_per_monday_amount NUMERIC(15,2) DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.statutory_rate_bands.calculation_method IS 'percentage: uses rate fields, per_monday: multiplies per_monday_amount by monday count, fixed: uses fixed_amount';
COMMENT ON COLUMN public.statutory_rate_bands.per_monday_amount IS 'Employee contribution amount per Monday in pay period';
COMMENT ON COLUMN public.statutory_rate_bands.employer_per_monday_amount IS 'Employer contribution amount per Monday in pay period';