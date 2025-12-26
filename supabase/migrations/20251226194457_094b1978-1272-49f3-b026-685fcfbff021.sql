-- Add language columns to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS first_language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS second_language VARCHAR(10);

-- Add comment for documentation
COMMENT ON COLUMN public.companies.first_language IS 'Primary language code (e.g., en, es, fr) - auto-selected based on country';
COMMENT ON COLUMN public.companies.second_language IS 'Secondary language code - optional, auto-selected based on country';