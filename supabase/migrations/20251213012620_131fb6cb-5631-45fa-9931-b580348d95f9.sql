-- Add temporal validity to leave_accrual_rules
ALTER TABLE public.leave_accrual_rules 
ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add temporal validity to leave_rollover_rules
ALTER TABLE public.leave_rollover_rules 
ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Create a table to track balance recalculation history
CREATE TABLE IF NOT EXISTS public.leave_balance_recalculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  calculation_type TEXT NOT NULL, -- 'current_year', 'from_hire_date', 'custom_range'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  old_balance JSONB, -- snapshot of balances before recalculation
  new_balance JSONB, -- snapshot of balances after recalculation
  triggered_by TEXT NOT NULL, -- 'manual', 'rule_change'
  initiated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.leave_balance_recalculations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins and HR can view all recalculations"
ON public.leave_balance_recalculations FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins and HR can create recalculations"
ON public.leave_balance_recalculations FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view own recalculations"
ON public.leave_balance_recalculations FOR SELECT
USING (auth.uid() = employee_id);

-- Create the recalculation stored procedure
CREATE OR REPLACE FUNCTION public.recalculate_leave_balance(
  p_employee_id UUID,
  p_company_id UUID,
  p_calculation_type TEXT DEFAULT 'current_year',
  p_period_start DATE DEFAULT NULL,
  p_period_end DATE DEFAULT NULL,
  p_triggered_by TEXT DEFAULT 'manual',
  p_initiated_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_hire_date DATE;
  v_start_date DATE;
  v_end_date DATE;
  v_old_balances JSONB;
  v_new_balances JSONB := '[]'::jsonb;
  v_leave_type RECORD;
  v_rule RECORD;
  v_accrued_days NUMERIC := 0;
  v_taken_days NUMERIC := 0;
  v_rollover_days NUMERIC := 0;
  v_new_balance NUMERIC := 0;
  v_months_worked INTEGER;
  v_years_of_service INTEGER;
BEGIN
  -- Get employee hire date
  SELECT hire_date INTO v_hire_date
  FROM profiles WHERE id = p_employee_id;
  
  -- Determine calculation period
  CASE p_calculation_type
    WHEN 'current_year' THEN
      v_start_date := date_trunc('year', CURRENT_DATE)::DATE;
      v_end_date := CURRENT_DATE;
    WHEN 'from_hire_date' THEN
      v_start_date := COALESCE(v_hire_date, date_trunc('year', CURRENT_DATE)::DATE);
      v_end_date := CURRENT_DATE;
    WHEN 'custom_range' THEN
      v_start_date := COALESCE(p_period_start, date_trunc('year', CURRENT_DATE)::DATE);
      v_end_date := COALESCE(p_period_end, CURRENT_DATE);
    ELSE
      v_start_date := date_trunc('year', CURRENT_DATE)::DATE;
      v_end_date := CURRENT_DATE;
  END CASE;
  
  -- Capture old balances
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'leave_type_id', leave_type_id,
    'balance', balance,
    'used', used,
    'pending', pending,
    'carried_over', carried_over
  )), '[]'::jsonb)
  INTO v_old_balances
  FROM leave_balances
  WHERE employee_id = p_employee_id AND company_id = p_company_id;
  
  -- Calculate years of service
  v_years_of_service := EXTRACT(YEAR FROM age(CURRENT_DATE, COALESCE(v_hire_date, CURRENT_DATE)));
  
  -- Calculate months in period
  v_months_worked := EXTRACT(MONTH FROM age(v_end_date, v_start_date)) + 1;
  
  -- Process each leave type for this company
  FOR v_leave_type IN 
    SELECT * FROM leave_types WHERE company_id = p_company_id AND is_active = true
  LOOP
    v_accrued_days := 0;
    v_taken_days := 0;
    v_rollover_days := 0;
    
    -- Find applicable accrual rule (active at period end, matching service years)
    FOR v_rule IN
      SELECT * FROM leave_accrual_rules
      WHERE company_id = p_company_id
        AND leave_type_id = v_leave_type.id
        AND is_active = true
        AND start_date <= v_end_date
        AND (end_date IS NULL OR end_date >= v_end_date)
        AND years_of_service_min <= v_years_of_service
        AND (years_of_service_max IS NULL OR years_of_service_max >= v_years_of_service)
      ORDER BY priority DESC
      LIMIT 1
    LOOP
      -- Calculate accrual based on frequency
      CASE v_rule.accrual_frequency
        WHEN 'monthly' THEN
          v_accrued_days := v_rule.accrual_amount * v_months_worked;
        WHEN 'annually' THEN
          v_accrued_days := v_rule.accrual_amount;
        WHEN 'bi_weekly' THEN
          v_accrued_days := v_rule.accrual_amount * (v_months_worked * 2.17); -- ~26 bi-weekly periods/year
        WHEN 'weekly' THEN
          v_accrued_days := v_rule.accrual_amount * (v_months_worked * 4.33); -- ~52 weeks/year
        ELSE
          v_accrued_days := v_rule.accrual_amount * v_months_worked;
      END CASE;
    END LOOP;
    
    -- Apply max balance cap from leave type
    IF v_leave_type.max_balance IS NOT NULL AND v_accrued_days > v_leave_type.max_balance THEN
      v_accrued_days := v_leave_type.max_balance;
    END IF;
    
    -- Calculate taken days in period
    SELECT COALESCE(SUM(total_days), 0) INTO v_taken_days
    FROM leave_requests
    WHERE employee_id = p_employee_id
      AND leave_type_id = v_leave_type.id
      AND status = 'approved'
      AND start_date >= v_start_date
      AND start_date <= v_end_date;
    
    -- Get rollover from previous year (if calculation starts at year boundary)
    IF v_start_date = date_trunc('year', CURRENT_DATE)::DATE THEN
      SELECT COALESCE(carried_over, 0) INTO v_rollover_days
      FROM leave_balances
      WHERE employee_id = p_employee_id 
        AND leave_type_id = v_leave_type.id
        AND company_id = p_company_id;
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_accrued_days + v_rollover_days - v_taken_days;
    IF v_new_balance < 0 THEN v_new_balance := 0; END IF;
    
    -- Add to results
    v_new_balances := v_new_balances || jsonb_build_object(
      'leave_type_id', v_leave_type.id,
      'leave_type_name', v_leave_type.name,
      'accrued', v_accrued_days,
      'taken', v_taken_days,
      'rollover', v_rollover_days,
      'balance', v_new_balance
    );
    
    -- Update or insert balance
    INSERT INTO leave_balances (employee_id, company_id, leave_type_id, balance, used, carried_over, year)
    VALUES (p_employee_id, p_company_id, v_leave_type.id, v_new_balance, v_taken_days, v_rollover_days, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)
    ON CONFLICT (employee_id, leave_type_id, year) 
    DO UPDATE SET 
      balance = v_new_balance,
      used = v_taken_days,
      carried_over = v_rollover_days,
      updated_at = now();
  END LOOP;
  
  -- Log the recalculation
  INSERT INTO leave_balance_recalculations (
    employee_id, company_id, calculation_type, period_start, period_end,
    old_balance, new_balance, triggered_by, initiated_by
  ) VALUES (
    p_employee_id, p_company_id, p_calculation_type, v_start_date, v_end_date,
    v_old_balances, v_new_balances, p_triggered_by, COALESCE(p_initiated_by, auth.uid())
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'employee_id', p_employee_id,
    'period_start', v_start_date,
    'period_end', v_end_date,
    'old_balances', v_old_balances,
    'new_balances', v_new_balances
  );
END;
$function$;

-- Create trigger function for automatic recalculation on rule changes
CREATE OR REPLACE FUNCTION public.trigger_leave_balance_recalculation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_employee RECORD;
  v_company_id UUID;
BEGIN
  -- Get company_id from the rule
  v_company_id := COALESCE(NEW.company_id, OLD.company_id);
  
  -- Recalculate for all employees in this company
  FOR v_employee IN
    SELECT id FROM profiles WHERE company_id = v_company_id AND is_active = true
  LOOP
    PERFORM recalculate_leave_balance(
      v_employee.id,
      v_company_id,
      'current_year',
      NULL,
      NULL,
      'rule_change',
      auth.uid()
    );
  END LOOP;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Add triggers for automatic recalculation (optional - can be enabled/disabled)
-- Commenting these out by default - they can be enabled if automatic recalculation is desired
-- CREATE TRIGGER recalc_on_accrual_rule_change
--   AFTER INSERT OR UPDATE ON leave_accrual_rules
--   FOR EACH ROW
--   EXECUTE FUNCTION trigger_leave_balance_recalculation();

-- CREATE TRIGGER recalc_on_rollover_rule_change
--   AFTER INSERT OR UPDATE ON leave_rollover_rules
--   FOR EACH ROW
--   EXECUTE FUNCTION trigger_leave_balance_recalculation();