-- Add flag to leave types to control whether employees accrue leave while on this leave type
ALTER TABLE public.leave_types 
ADD COLUMN accrues_leave_while_on BOOLEAN NOT NULL DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN public.leave_types.accrues_leave_while_on IS 
'When false, employees do not earn/accrue any leave balances while on this leave type (e.g., unpaid leave, LWOP)';

-- Update the recalculate_leave_balance function to account for non-accruing leave periods
CREATE OR REPLACE FUNCTION public.recalculate_leave_balance(
  p_employee_id UUID,
  p_company_id UUID,
  p_calculation_type TEXT DEFAULT 'current_year',
  p_period_start DATE DEFAULT NULL,
  p_period_end DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  v_non_accruing_days NUMERIC := 0;
  v_effective_months NUMERIC;
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
  
  -- Calculate total days in period
  v_months_worked := EXTRACT(MONTH FROM age(v_end_date, v_start_date)) + 1;
  
  -- Calculate total days spent on leave types that don't accrue leave
  SELECT COALESCE(SUM(lr.duration), 0) INTO v_non_accruing_days
  FROM leave_requests lr
  JOIN leave_types lt ON lr.leave_type_id = lt.id
  WHERE lr.employee_id = p_employee_id
    AND lr.status = 'approved'
    AND lt.accrues_leave_while_on = false
    AND lr.start_date <= v_end_date
    AND lr.end_date >= v_start_date;
  
  -- Calculate effective months (reduce by non-accruing leave days, assuming 22 working days per month)
  v_effective_months := GREATEST(0, v_months_worked - (v_non_accruing_days / 22.0));
  
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
      -- Calculate accrual based on frequency using effective months (reduced by non-accruing leave)
      CASE v_rule.accrual_frequency
        WHEN 'monthly' THEN
          v_accrued_days := v_rule.accrual_amount * v_effective_months;
        WHEN 'annually' THEN
          -- Pro-rate annual accrual based on effective months worked
          v_accrued_days := v_rule.accrual_amount * (v_effective_months / 12.0);
        WHEN 'bi_weekly' THEN
          v_accrued_days := v_rule.accrual_amount * (v_effective_months * 2.17);
        WHEN 'weekly' THEN
          v_accrued_days := v_rule.accrual_amount * (v_effective_months * 4.33);
        ELSE
          v_accrued_days := v_rule.accrual_amount * v_effective_months;
      END CASE;
    END LOOP;
    
    -- Apply max balance cap from leave type
    IF v_leave_type.max_balance IS NOT NULL AND v_accrued_days > v_leave_type.max_balance THEN
      v_accrued_days := v_leave_type.max_balance;
    END IF;
    
    -- Calculate taken days in period
    SELECT COALESCE(SUM(duration), 0) INTO v_taken_days
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
      'accrued', ROUND(v_accrued_days, 2),
      'taken', v_taken_days,
      'rollover', v_rollover_days,
      'balance', ROUND(v_new_balance, 2),
      'non_accruing_days_deducted', ROUND(v_non_accruing_days, 2),
      'effective_months', ROUND(v_effective_months, 2)
    );
    
    -- Update or insert leave balance
    INSERT INTO leave_balances (
      employee_id, company_id, leave_type_id, year, balance, used, pending, carried_over, updated_at
    ) VALUES (
      p_employee_id, p_company_id, v_leave_type.id, EXTRACT(YEAR FROM v_end_date)::INTEGER,
      v_new_balance, v_taken_days, 0, v_rollover_days, NOW()
    )
    ON CONFLICT (employee_id, leave_type_id, year) 
    DO UPDATE SET 
      balance = EXCLUDED.balance,
      used = EXCLUDED.used,
      carried_over = EXCLUDED.carried_over,
      updated_at = NOW();
  END LOOP;
  
  -- Log the recalculation
  INSERT INTO leave_balance_recalculations (
    employee_id, company_id, calculation_type, period_start, period_end,
    old_balance, new_balance, triggered_by, initiated_by
  ) VALUES (
    p_employee_id, p_company_id, p_calculation_type, v_start_date, v_end_date,
    v_old_balances, v_new_balances, 'manual', auth.uid()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'employee_id', p_employee_id,
    'period_start', v_start_date,
    'period_end', v_end_date,
    'non_accruing_days', v_non_accruing_days,
    'effective_months', v_effective_months,
    'balances', v_new_balances
  );
END;
$$;