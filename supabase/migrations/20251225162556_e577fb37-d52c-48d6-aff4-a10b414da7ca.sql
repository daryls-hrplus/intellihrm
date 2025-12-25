
-- Fix recalculate_leave_balance function to match current leave_balances table schema
-- The current table has: id, employee_id, leave_type_id, year, opening_balance, accrued_amount, 
-- used_amount, adjustment_amount, carried_forward, current_balance, last_accrual_date, created_at, updated_at

CREATE OR REPLACE FUNCTION recalculate_leave_balance(
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
SET search_path = public
AS $$
DECLARE
  v_service_start DATE;
  v_date_source TEXT;
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
  v_opening_balance NUMERIC := 0;
  v_adjustment_amount NUMERIC := 0;
  v_profile_record RECORD;
  v_current_year INTEGER;
BEGIN
  v_current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

  -- Get employee profile with all employment date fields
  SELECT 
    adjusted_service_date,
    continuous_service_date,
    seniority_date,
    start_date,
    first_hire_date,
    created_at
  INTO v_profile_record
  FROM profiles WHERE id = p_employee_id;
  
  IF v_profile_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Employee not found'
    );
  END IF;
  
  -- Determine service start date based on priority:
  -- 1. Adjusted Service Date (for work done for previous tenure)
  -- 2. Continuous Service Date (for prior service credit on rehires)
  -- 3. Seniority Date (leave calculated from end of probation)
  -- 4. Start Date (first day on the job, no waiting time)
  -- 5. First Hire Date (original hire date)
  -- 6. Fallback to profile created_at
  IF v_profile_record.adjusted_service_date IS NOT NULL THEN
    v_service_start := v_profile_record.adjusted_service_date;
    v_date_source := 'Adjusted Service Date';
  ELSIF v_profile_record.continuous_service_date IS NOT NULL THEN
    v_service_start := v_profile_record.continuous_service_date;
    v_date_source := 'Continuous Service Date';
  ELSIF v_profile_record.seniority_date IS NOT NULL THEN
    v_service_start := v_profile_record.seniority_date;
    v_date_source := 'Seniority Date';
  ELSIF v_profile_record.start_date IS NOT NULL THEN
    v_service_start := v_profile_record.start_date;
    v_date_source := 'Start Date';
  ELSIF v_profile_record.first_hire_date IS NOT NULL THEN
    v_service_start := v_profile_record.first_hire_date;
    v_date_source := 'First Hire Date';
  ELSE
    v_service_start := v_profile_record.created_at::DATE;
    v_date_source := 'Profile Created Date (Fallback)';
  END IF;
  
  -- Determine calculation period
  CASE p_calculation_type
    WHEN 'current_year' THEN
      v_start_date := date_trunc('year', CURRENT_DATE)::DATE;
      v_end_date := CURRENT_DATE;
    WHEN 'from_hire_date' THEN
      v_start_date := v_service_start;
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
    'opening_balance', opening_balance,
    'accrued_amount', accrued_amount,
    'used_amount', used_amount,
    'adjustment_amount', adjustment_amount,
    'carried_forward', carried_forward,
    'current_balance', current_balance
  )), '[]'::jsonb)
  INTO v_old_balances
  FROM leave_balances
  WHERE employee_id = p_employee_id AND year = v_current_year;
  
  -- Calculate years of service
  v_years_of_service := EXTRACT(YEAR FROM age(CURRENT_DATE, v_service_start));
  
  -- Calculate months worked in period
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
    v_opening_balance := 0;
    v_adjustment_amount := 0;
    
    -- Get existing balance data if any
    SELECT 
      COALESCE(opening_balance, 0),
      COALESCE(adjustment_amount, 0),
      COALESCE(carried_forward, 0)
    INTO v_opening_balance, v_adjustment_amount, v_rollover_days
    FROM leave_balances
    WHERE employee_id = p_employee_id 
      AND leave_type_id = v_leave_type.id
      AND year = v_current_year;
    
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
      -- Calculate accrual based on frequency using effective months
      CASE v_rule.accrual_frequency
        WHEN 'monthly' THEN
          v_accrued_days := v_rule.accrual_amount * v_effective_months;
        WHEN 'annually' THEN
          v_accrued_days := v_rule.accrual_amount * (v_effective_months / 12.0);
        WHEN 'bi_weekly' THEN
          v_accrued_days := v_rule.accrual_amount * (v_effective_months * 2.17);
        WHEN 'weekly' THEN
          v_accrued_days := v_rule.accrual_amount * (v_effective_months * 4.33);
        ELSE
          v_accrued_days := v_rule.accrual_amount * v_effective_months;
      END CASE;
    END LOOP;
    
    -- If no accrual rule found, use leave type defaults
    IF v_accrued_days = 0 AND v_leave_type.default_days IS NOT NULL THEN
      -- Pro-rate annual entitlement
      v_accrued_days := v_leave_type.default_days * (v_effective_months / 12.0);
    END IF;
    
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
    
    -- Calculate new current balance
    v_new_balance := v_opening_balance + v_accrued_days + v_rollover_days + v_adjustment_amount - v_taken_days;
    IF v_new_balance < 0 THEN v_new_balance := 0; END IF;
    
    -- Add to results
    v_new_balances := v_new_balances || jsonb_build_object(
      'leave_type_id', v_leave_type.id,
      'leave_type_name', v_leave_type.name,
      'opening_balance', ROUND(v_opening_balance, 2),
      'accrued_amount', ROUND(v_accrued_days, 2),
      'used_amount', v_taken_days,
      'adjustment_amount', ROUND(v_adjustment_amount, 2),
      'carried_forward', ROUND(v_rollover_days, 2),
      'current_balance', ROUND(v_new_balance, 2),
      'service_years', v_years_of_service,
      'date_source', v_date_source,
      'effective_months', ROUND(v_effective_months, 2)
    );
    
    -- Update or insert leave balance using correct column names
    INSERT INTO leave_balances (
      employee_id, leave_type_id, year, 
      opening_balance, accrued_amount, used_amount, 
      adjustment_amount, carried_forward, current_balance,
      last_accrual_date, updated_at
    ) VALUES (
      p_employee_id, v_leave_type.id, v_current_year,
      v_opening_balance, v_accrued_days, v_taken_days,
      v_adjustment_amount, v_rollover_days, v_new_balance,
      CURRENT_DATE, NOW()
    )
    ON CONFLICT (employee_id, leave_type_id, year) 
    DO UPDATE SET 
      accrued_amount = EXCLUDED.accrued_amount,
      used_amount = EXCLUDED.used_amount,
      current_balance = EXCLUDED.current_balance,
      last_accrual_date = EXCLUDED.last_accrual_date,
      updated_at = NOW();
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
    'service_start', v_service_start,
    'date_source', v_date_source,
    'years_of_service', v_years_of_service,
    'balances', v_new_balances,
    'old_balances', v_old_balances
  );
END;
$$;
