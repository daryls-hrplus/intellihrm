
-- Drop and recreate the recalculate_leave_balance function to get hire date from employee_transactions
CREATE OR REPLACE FUNCTION public.recalculate_leave_balance(
  p_employee_id uuid, 
  p_company_id uuid, 
  p_calculation_type text DEFAULT 'current_year'::text, 
  p_period_start date DEFAULT NULL::date, 
  p_period_end date DEFAULT NULL::date,
  p_triggered_by text DEFAULT 'manual'::text,
  p_initiated_by uuid DEFAULT NULL::uuid
)
 RETURNS jsonb
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
  v_non_accruing_days NUMERIC := 0;
  v_effective_months NUMERIC;
  v_recalculation_id UUID;
BEGIN
  -- Get employee hire date from employee_transactions (look for HIRE or NEW_HIRE transaction types)
  SELECT MIN(et.effective_date) INTO v_hire_date
  FROM employee_transactions et
  JOIN lookup_values lv ON et.transaction_type_id = lv.id
  WHERE et.employee_id = p_employee_id
    AND et.status = 'approved'
    AND lv.code IN ('HIRE', 'NEW_HIRE', 'REHIRE', 'NEW');
  
  -- If no approved hire transaction found, try draft ones or use created_at from profiles
  IF v_hire_date IS NULL THEN
    SELECT MIN(et.effective_date) INTO v_hire_date
    FROM employee_transactions et
    JOIN lookup_values lv ON et.transaction_type_id = lv.id
    WHERE et.employee_id = p_employee_id
      AND lv.code IN ('HIRE', 'NEW_HIRE', 'REHIRE', 'NEW');
  END IF;
  
  -- Ultimate fallback: use profile created_at date
  IF v_hire_date IS NULL THEN
    SELECT created_at::DATE INTO v_hire_date
    FROM profiles WHERE id = p_employee_id;
  END IF;
  
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
    
    -- Calculate taken days (approved leave requests in period)
    SELECT COALESCE(SUM(duration), 0) INTO v_taken_days
    FROM leave_requests
    WHERE employee_id = p_employee_id
      AND leave_type_id = v_leave_type.id
      AND status = 'approved'
      AND start_date >= v_start_date
      AND start_date <= v_end_date;
    
    -- Get rollover from previous period if applicable
    SELECT COALESCE(lb.carried_over, 0) INTO v_rollover_days
    FROM leave_balances lb
    WHERE lb.employee_id = p_employee_id
      AND lb.leave_type_id = v_leave_type.id
      AND lb.year = EXTRACT(YEAR FROM v_start_date);
    
    -- Calculate new balance
    v_new_balance := COALESCE(v_rollover_days, 0) + v_accrued_days - v_taken_days;
    
    -- Add to new balances array
    v_new_balances := v_new_balances || jsonb_build_object(
      'leave_type_id', v_leave_type.id,
      'leave_type_name', v_leave_type.name,
      'entitlement', v_leave_type.default_annual_entitlement,
      'earned', v_accrued_days,
      'taken', v_taken_days,
      'carried_over', v_rollover_days,
      'balance', v_new_balance
    );
    
    -- Upsert the leave balance
    INSERT INTO leave_balances (
      employee_id, company_id, leave_type_id, year, 
      entitlement, earned, used, balance, carried_over
    ) VALUES (
      p_employee_id, p_company_id, v_leave_type.id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
      v_leave_type.default_annual_entitlement, v_accrued_days, v_taken_days, v_new_balance, COALESCE(v_rollover_days, 0)
    )
    ON CONFLICT (employee_id, leave_type_id, year) 
    DO UPDATE SET
      earned = EXCLUDED.earned,
      used = EXCLUDED.used,
      balance = EXCLUDED.balance,
      carried_over = EXCLUDED.carried_over,
      updated_at = NOW();
  END LOOP;
  
  -- Log the recalculation
  INSERT INTO leave_balance_recalculations (
    id, employee_id, company_id, calculation_type, period_start, period_end,
    old_balances, new_balances, triggered_by, initiated_by, status, completed_at
  ) VALUES (
    gen_random_uuid(), p_employee_id, p_company_id, p_calculation_type, v_start_date, v_end_date,
    v_old_balances, v_new_balances, p_triggered_by, p_initiated_by, 'completed', NOW()
  )
  RETURNING id INTO v_recalculation_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'recalculation_id', v_recalculation_id,
    'employee_id', p_employee_id,
    'hire_date', v_hire_date,
    'period_start', v_start_date,
    'period_end', v_end_date,
    'years_of_service', v_years_of_service,
    'old_balances', v_old_balances,
    'new_balances', v_new_balances
  );
EXCEPTION WHEN OTHERS THEN
  -- Log failed recalculation
  INSERT INTO leave_balance_recalculations (
    employee_id, company_id, calculation_type, period_start, period_end,
    triggered_by, initiated_by, status, error_message
  ) VALUES (
    p_employee_id, p_company_id, p_calculation_type, v_start_date, v_end_date,
    p_triggered_by, p_initiated_by, 'failed', SQLERRM
  );
  
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;
