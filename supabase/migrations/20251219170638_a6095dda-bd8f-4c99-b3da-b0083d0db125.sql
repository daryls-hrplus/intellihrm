-- Add fiscal year configuration directly to companies table
ALTER TABLE public.companies
ADD COLUMN fiscal_year_start_month INTEGER DEFAULT 1 CHECK (fiscal_year_start_month BETWEEN 1 AND 12),
ADD COLUMN fiscal_year_start_day INTEGER DEFAULT 1 CHECK (fiscal_year_start_day BETWEEN 1 AND 31),
ADD COLUMN use_country_fiscal_year BOOLEAN DEFAULT true;

-- Add comment explaining the fields
COMMENT ON COLUMN public.companies.fiscal_year_start_month IS 'Month when fiscal year starts (1-12). If use_country_fiscal_year is true, this is ignored.';
COMMENT ON COLUMN public.companies.fiscal_year_start_day IS 'Day of month when fiscal year starts (1-31). If use_country_fiscal_year is true, this is ignored.';
COMMENT ON COLUMN public.companies.use_country_fiscal_year IS 'If true, uses country_fiscal_years configuration. If false, uses company-specific settings.';

-- Function to get company fiscal year configuration
CREATE OR REPLACE FUNCTION public.get_company_fiscal_config(p_company_id UUID)
RETURNS TABLE(fiscal_year_start_month INTEGER, fiscal_year_start_day INTEGER)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN c.use_country_fiscal_year = true AND cfy.fiscal_year_start_month IS NOT NULL 
      THEN cfy.fiscal_year_start_month
      ELSE COALESCE(c.fiscal_year_start_month, 1)
    END as fiscal_year_start_month,
    CASE 
      WHEN c.use_country_fiscal_year = true AND cfy.fiscal_year_start_day IS NOT NULL 
      THEN cfy.fiscal_year_start_day
      ELSE COALESCE(c.fiscal_year_start_day, 1)
    END as fiscal_year_start_day
  FROM companies c
  LEFT JOIN country_fiscal_years cfy ON cfy.country_code = c.country AND cfy.is_active = true
  WHERE c.id = p_company_id;
END;
$$;

-- Function to validate fiscal period on pay period insert/update
CREATE OR REPLACE FUNCTION public.validate_pay_period_fiscal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_fiscal_config RECORD;
  v_expected_fiscal_year INTEGER;
  v_expected_fiscal_month INTEGER;
  v_period_end_date DATE;
  v_fiscal_start_month INTEGER;
  v_fiscal_start_day INTEGER;
BEGIN
  -- Get company fiscal configuration
  SELECT * INTO v_fiscal_config FROM get_company_fiscal_config(NEW.company_id);
  
  v_fiscal_start_month := COALESCE(v_fiscal_config.fiscal_year_start_month, 1);
  v_fiscal_start_day := COALESCE(v_fiscal_config.fiscal_year_start_day, 1);
  v_period_end_date := NEW.period_end;
  
  -- Calculate expected fiscal year
  IF v_fiscal_start_month = 1 AND v_fiscal_start_day = 1 THEN
    -- Calendar year
    v_expected_fiscal_year := EXTRACT(YEAR FROM v_period_end_date)::INTEGER;
    v_expected_fiscal_month := EXTRACT(MONTH FROM v_period_end_date)::INTEGER;
  ELSE
    -- Non-calendar fiscal year
    IF (EXTRACT(MONTH FROM v_period_end_date) > v_fiscal_start_month) OR 
       (EXTRACT(MONTH FROM v_period_end_date) = v_fiscal_start_month AND EXTRACT(DAY FROM v_period_end_date) >= v_fiscal_start_day) THEN
      v_expected_fiscal_year := EXTRACT(YEAR FROM v_period_end_date)::INTEGER;
    ELSE
      v_expected_fiscal_year := EXTRACT(YEAR FROM v_period_end_date)::INTEGER - 1;
    END IF;
    
    -- Calculate fiscal month (1-12 within the fiscal year)
    IF EXTRACT(MONTH FROM v_period_end_date) >= v_fiscal_start_month THEN
      v_expected_fiscal_month := EXTRACT(MONTH FROM v_period_end_date)::INTEGER - v_fiscal_start_month + 1;
    ELSE
      v_expected_fiscal_month := 12 - v_fiscal_start_month + EXTRACT(MONTH FROM v_period_end_date)::INTEGER + 1;
    END IF;
  END IF;
  
  -- Auto-set fiscal year/month if not provided or if they don't match
  IF NEW.fiscal_year IS NULL OR NEW.fiscal_year != v_expected_fiscal_year THEN
    NEW.fiscal_year := v_expected_fiscal_year;
  END IF;
  
  IF NEW.fiscal_month IS NULL OR NEW.fiscal_month != v_expected_fiscal_month THEN
    NEW.fiscal_month := v_expected_fiscal_month;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-validate and set fiscal period on pay_periods
DROP TRIGGER IF EXISTS validate_pay_period_fiscal_trigger ON public.pay_periods;
CREATE TRIGGER validate_pay_period_fiscal_trigger
  BEFORE INSERT OR UPDATE ON public.pay_periods
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_pay_period_fiscal();