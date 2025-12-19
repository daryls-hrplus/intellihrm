-- Year End Payroll Closing table to track closings by pay group
CREATE TABLE public.payroll_year_end_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  pay_group_id UUID NOT NULL REFERENCES public.pay_groups(id) ON DELETE CASCADE,
  closing_year INTEGER NOT NULL,
  new_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reports_pending', 'reports_complete', 'closing', 'closed', 'failed')),
  
  -- Report generation tracking
  ytd_report_generated BOOLEAN DEFAULT false,
  ytd_report_generated_at TIMESTAMPTZ,
  statutory_report_generated BOOLEAN DEFAULT false,
  statutory_report_generated_at TIMESTAMPTZ,
  tax_summary_report_generated BOOLEAN DEFAULT false,
  tax_summary_report_generated_at TIMESTAMPTZ,
  employee_annual_report_generated BOOLEAN DEFAULT false,
  employee_annual_report_generated_at TIMESTAMPTZ,
  
  -- Closing process tracking
  ytd_reset_completed BOOLEAN DEFAULT false,
  ytd_reset_completed_at TIMESTAMPTZ,
  new_periods_generated BOOLEAN DEFAULT false,
  new_periods_generated_at TIMESTAMPTZ,
  new_periods_count INTEGER DEFAULT 0,
  first_new_period_start DATE,
  
  -- Audit fields
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Prevent duplicate closings for same pay group and year
  CONSTRAINT unique_pay_group_closing_year UNIQUE (pay_group_id, closing_year)
);

-- Enable RLS
ALTER TABLE public.payroll_year_end_closings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view year end closings for their company" ON public.payroll_year_end_closings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND company_id = payroll_year_end_closings.company_id)
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

CREATE POLICY "HR and admins can insert year end closings" ON public.payroll_year_end_closings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

CREATE POLICY "HR and admins can update year end closings" ON public.payroll_year_end_closings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

-- Trigger for updated_at
CREATE TRIGGER update_payroll_year_end_closings_updated_at
  BEFORE UPDATE ON public.payroll_year_end_closings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_payroll_year_end_closings_company ON public.payroll_year_end_closings(company_id);
CREATE INDEX idx_payroll_year_end_closings_pay_group ON public.payroll_year_end_closings(pay_group_id);
CREATE INDEX idx_payroll_year_end_closings_status ON public.payroll_year_end_closings(status);

-- Function to check if all required reports are generated
CREATE OR REPLACE FUNCTION public.check_year_end_reports_complete(p_closing_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM payroll_year_end_closings
    WHERE id = p_closing_id
      AND ytd_report_generated = true
      AND statutory_report_generated = true
      AND tax_summary_report_generated = true
      AND employee_annual_report_generated = true
  );
END;
$$;

-- Function to generate pay periods for new year based on pay group frequency
CREATE OR REPLACE FUNCTION public.generate_new_year_pay_periods(
  p_pay_group_id UUID,
  p_new_year INTEGER,
  p_created_by UUID
)
RETURNS TABLE(periods_created INTEGER, first_period_start DATE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pay_group RECORD;
  v_company RECORD;
  v_fiscal_config RECORD;
  v_start_date DATE;
  v_end_date DATE;
  v_period_start DATE;
  v_period_end DATE;
  v_pay_date DATE;
  v_cutoff_date DATE;
  v_period_count INTEGER := 0;
  v_fiscal_year INTEGER;
  v_fiscal_month INTEGER;
  v_year_number INTEGER := 1;
BEGIN
  -- Get pay group details
  SELECT * INTO v_pay_group FROM pay_groups WHERE id = p_pay_group_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pay group not found';
  END IF;
  
  -- Get company and country info
  SELECT c.* INTO v_company FROM companies c WHERE c.id = v_pay_group.company_id;
  
  -- Get fiscal year configuration
  SELECT * INTO v_fiscal_config 
  FROM country_fiscal_years 
  WHERE country_code = v_company.country AND is_active = true
  LIMIT 1;
  
  -- Determine fiscal year start date
  IF v_fiscal_config IS NOT NULL THEN
    v_start_date := make_date(p_new_year, v_fiscal_config.fiscal_year_start_month, v_fiscal_config.fiscal_year_start_day);
    -- If fiscal year starts mid-year, end date is next calendar year
    IF v_fiscal_config.fiscal_year_start_month > 1 OR v_fiscal_config.fiscal_year_start_day > 1 THEN
      v_end_date := make_date(p_new_year + 1, v_fiscal_config.fiscal_year_start_month, v_fiscal_config.fiscal_year_start_day) - INTERVAL '1 day';
    ELSE
      v_end_date := make_date(p_new_year, 12, 31);
    END IF;
  ELSE
    v_start_date := make_date(p_new_year, 1, 1);
    v_end_date := make_date(p_new_year, 12, 31);
  END IF;
  
  first_period_start := v_start_date;
  v_period_start := v_start_date;
  
  -- Generate periods based on pay frequency
  WHILE v_period_start <= v_end_date LOOP
    CASE v_pay_group.pay_frequency
      WHEN 'weekly' THEN
        v_period_end := v_period_start + INTERVAL '6 days';
        v_pay_date := v_period_end + INTERVAL '3 days';
      WHEN 'bi_weekly' THEN
        v_period_end := v_period_start + INTERVAL '13 days';
        v_pay_date := v_period_end + INTERVAL '3 days';
      WHEN 'semi_monthly' THEN
        IF EXTRACT(DAY FROM v_period_start) <= 15 THEN
          v_period_end := make_date(EXTRACT(YEAR FROM v_period_start)::INTEGER, EXTRACT(MONTH FROM v_period_start)::INTEGER, 15);
        ELSE
          v_period_end := (date_trunc('month', v_period_start) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
        END IF;
        v_pay_date := v_period_end + INTERVAL '5 days';
      WHEN 'monthly' THEN
        v_period_end := (date_trunc('month', v_period_start) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
        v_pay_date := (date_trunc('month', v_period_end) + INTERVAL '1 month' + INTERVAL '4 days')::DATE;
      ELSE
        v_period_end := (date_trunc('month', v_period_start) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
        v_pay_date := v_period_end + INTERVAL '5 days';
    END CASE;
    
    -- Cap period end at fiscal year end
    IF v_period_end > v_end_date THEN
      v_period_end := v_end_date;
    END IF;
    
    v_cutoff_date := v_pay_date - INTERVAL '3 days';
    
    -- Calculate fiscal period
    v_fiscal_year := p_new_year;
    v_fiscal_month := EXTRACT(MONTH FROM v_period_end)::INTEGER;
    IF v_fiscal_config IS NOT NULL AND v_fiscal_config.fiscal_year_start_month > 1 THEN
      IF EXTRACT(MONTH FROM v_period_end) >= v_fiscal_config.fiscal_year_start_month THEN
        v_fiscal_month := EXTRACT(MONTH FROM v_period_end)::INTEGER - v_fiscal_config.fiscal_year_start_month + 1;
      ELSE
        v_fiscal_month := 12 - v_fiscal_config.fiscal_year_start_month + EXTRACT(MONTH FROM v_period_end)::INTEGER + 1;
      END IF;
    END IF;
    
    -- Insert the pay period
    INSERT INTO pay_periods (
      company_id, pay_group_id, period_start, period_end, pay_date, cutoff_date,
      status, year, fiscal_year, fiscal_month, period_number
    ) VALUES (
      v_pay_group.company_id, p_pay_group_id, v_period_start, v_period_end, v_pay_date::DATE, v_cutoff_date::DATE,
      'open', v_year_number, v_fiscal_year, v_fiscal_month, 
      'PP-' || TO_CHAR(v_period_start, 'YYYYMMDD') || '-' || TO_CHAR(v_period_end, 'YYYYMMDD')
    );
    
    v_period_count := v_period_count + 1;
    v_year_number := v_year_number + 1;
    
    -- Move to next period
    v_period_start := v_period_end + INTERVAL '1 day';
  END LOOP;
  
  periods_created := v_period_count;
  RETURN NEXT;
END;
$$;