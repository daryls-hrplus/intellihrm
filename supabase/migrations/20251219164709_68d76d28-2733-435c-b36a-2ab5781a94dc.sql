-- Add fiscal year and fiscal month columns to pay_periods for reporting
ALTER TABLE public.pay_periods 
ADD COLUMN IF NOT EXISTS fiscal_year integer,
ADD COLUMN IF NOT EXISTS fiscal_month integer;

-- Add index for fiscal year reporting
CREATE INDEX IF NOT EXISTS idx_pay_periods_fiscal_year ON public.pay_periods(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_pay_periods_fiscal_year_month ON public.pay_periods(fiscal_year, fiscal_month);

-- Create a function to calculate fiscal year and month based on company's country settings
CREATE OR REPLACE FUNCTION public.calculate_fiscal_period(
  p_period_end date,
  p_country_code text
)
RETURNS TABLE(fiscal_year integer, fiscal_month integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fiscal_start_month integer;
  v_fiscal_start_day integer;
  v_fiscal_year integer;
  v_fiscal_month integer;
  v_fiscal_start_date date;
BEGIN
  -- Get country fiscal year settings
  SELECT cfy.fiscal_year_start_month, cfy.fiscal_year_start_day
  INTO v_fiscal_start_month, v_fiscal_start_day
  FROM country_fiscal_years cfy
  WHERE cfy.country_code = p_country_code AND cfy.is_active = true;
  
  -- Default to calendar year if country not found
  IF v_fiscal_start_month IS NULL THEN
    v_fiscal_start_month := 1;
    v_fiscal_start_day := 1;
  END IF;
  
  -- Calculate fiscal year start date for the period's calendar year
  v_fiscal_start_date := make_date(EXTRACT(YEAR FROM p_period_end)::integer, v_fiscal_start_month, v_fiscal_start_day);
  
  -- Determine fiscal year
  IF p_period_end >= v_fiscal_start_date THEN
    -- We're in current calendar year's fiscal year
    IF v_fiscal_start_month = 1 AND v_fiscal_start_day = 1 THEN
      v_fiscal_year := EXTRACT(YEAR FROM p_period_end)::integer;
    ELSE
      v_fiscal_year := EXTRACT(YEAR FROM p_period_end)::integer + 1;
    END IF;
  ELSE
    -- We're in previous calendar year's fiscal year
    v_fiscal_year := EXTRACT(YEAR FROM p_period_end)::integer;
  END IF;
  
  -- Calculate fiscal month (1-12)
  IF v_fiscal_start_month = 1 AND v_fiscal_start_day = 1 THEN
    v_fiscal_month := EXTRACT(MONTH FROM p_period_end)::integer;
  ELSE
    v_fiscal_month := (EXTRACT(MONTH FROM p_period_end)::integer - v_fiscal_start_month + 12) % 12 + 1;
    -- Adjust for day offset
    IF EXTRACT(DAY FROM p_period_end)::integer < v_fiscal_start_day THEN
      v_fiscal_month := CASE WHEN v_fiscal_month = 1 THEN 12 ELSE v_fiscal_month - 1 END;
    END IF;
  END IF;
  
  RETURN QUERY SELECT v_fiscal_year, v_fiscal_month;
END;
$$;

-- Comment on new columns
COMMENT ON COLUMN public.pay_periods.fiscal_year IS 'Fiscal year based on company country settings';
COMMENT ON COLUMN public.pay_periods.fiscal_month IS 'Fiscal month (1-12) based on company country settings';