-- Enable btree_gist extension for UUID support in exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create company_fiscal_years table for date-effective fiscal configurations
CREATE TABLE public.company_fiscal_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  fiscal_year_start_month INTEGER NOT NULL DEFAULT 1 CHECK (fiscal_year_start_month >= 1 AND fiscal_year_start_month <= 12),
  fiscal_year_start_day INTEGER NOT NULL DEFAULT 1 CHECK (fiscal_year_start_day >= 1 AND fiscal_year_start_day <= 31),
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  use_country_fiscal_year BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT no_overlapping_fiscal_years EXCLUDE USING gist (
    company_id WITH =,
    daterange(effective_start_date, COALESCE(effective_end_date, '9999-12-31'::date), '[]') WITH &&
  )
);

-- Enable RLS
ALTER TABLE public.company_fiscal_years ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view company fiscal years" 
  ON public.company_fiscal_years FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage company fiscal years" 
  ON public.company_fiscal_years FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Create index for efficient lookups
CREATE INDEX idx_company_fiscal_years_company_effective 
  ON public.company_fiscal_years(company_id, effective_start_date, effective_end_date);

-- Update the get_company_fiscal_config function to use the new table
CREATE OR REPLACE FUNCTION public.get_company_fiscal_config(p_company_id UUID, p_effective_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  fiscal_year_start_month INTEGER,
  fiscal_year_start_day INTEGER,
  use_country_fiscal_year BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_country_code TEXT;
BEGIN
  -- First check company_fiscal_years table for date-effective config
  SELECT cfy.fiscal_year_start_month, cfy.fiscal_year_start_day, cfy.use_country_fiscal_year
  INTO v_config
  FROM company_fiscal_years cfy
  WHERE cfy.company_id = p_company_id
    AND cfy.effective_start_date <= p_effective_date
    AND (cfy.effective_end_date IS NULL OR cfy.effective_end_date >= p_effective_date)
  ORDER BY cfy.effective_start_date DESC
  LIMIT 1;
  
  -- If found and not using country defaults, return company config
  IF FOUND AND NOT v_config.use_country_fiscal_year THEN
    RETURN QUERY SELECT v_config.fiscal_year_start_month, v_config.fiscal_year_start_day, v_config.use_country_fiscal_year;
    RETURN;
  END IF;
  
  -- Fall back to country fiscal year settings
  SELECT c.country INTO v_country_code
  FROM companies c
  WHERE c.id = p_company_id;
  
  IF v_country_code IS NOT NULL THEN
    RETURN QUERY
    SELECT cfy.fiscal_year_start_month, cfy.fiscal_year_start_day, true
    FROM country_fiscal_years cfy
    WHERE cfy.country_code = v_country_code
      AND cfy.is_active = true
    LIMIT 1;
    
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;
  
  -- Default to calendar year
  RETURN QUERY SELECT 1, 1, true;
END;
$$;

-- Migrate existing company fiscal configs to the new table
INSERT INTO public.company_fiscal_years (
  company_id, 
  fiscal_year_start_month, 
  fiscal_year_start_day, 
  use_country_fiscal_year, 
  effective_start_date,
  notes
)
SELECT 
  id,
  COALESCE(fiscal_year_start_month, 1),
  COALESCE(fiscal_year_start_day, 1),
  COALESCE(use_country_fiscal_year, true),
  '2020-01-01'::date,
  'Migrated from companies table'
FROM companies
WHERE fiscal_year_start_month IS NOT NULL 
   OR fiscal_year_start_day IS NOT NULL 
   OR use_country_fiscal_year IS NOT NULL;

-- Drop the columns from companies table (keeping data in new table)
ALTER TABLE public.companies 
  DROP COLUMN IF EXISTS fiscal_year_start_month,
  DROP COLUMN IF EXISTS fiscal_year_start_day,
  DROP COLUMN IF EXISTS use_country_fiscal_year;

-- Add trigger to update updated_at
CREATE TRIGGER update_company_fiscal_years_updated_at
  BEFORE UPDATE ON public.company_fiscal_years
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();