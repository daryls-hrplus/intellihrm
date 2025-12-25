-- Update the recalculate_leave_balance function to use the new employment date fields
CREATE OR REPLACE FUNCTION public.recalculate_leave_balance(
  p_employee_id UUID,
  p_leave_type_id UUID
)
RETURNS TABLE (
  leave_type_id UUID,
  leave_type_name TEXT,
  accrued_balance NUMERIC,
  used_balance NUMERIC,
  pending_balance NUMERIC,
  available_balance NUMERIC,
  carried_over NUMERIC,
  service_years NUMERIC,
  service_start_date DATE,
  date_source TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_service_start DATE;
  v_date_source TEXT;
  v_continuous_service_date DATE;
  v_seniority_date DATE;
  v_start_date DATE;
  v_adjusted_service_date DATE;
  v_first_hire_date DATE;
BEGIN
  -- Get the employee's company and employment dates
  SELECT 
    p.company_id,
    p.continuous_service_date,
    p.seniority_date,
    p.start_date,
    p.adjusted_service_date,
    p.first_hire_date
  INTO 
    v_company_id,
    v_continuous_service_date,
    v_seniority_date,
    v_start_date,
    v_adjusted_service_date,
    v_first_hire_date
  FROM profiles p
  WHERE p.id = p_employee_id;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Employee not found or has no company';
  END IF;

  -- Determine service start date based on priority:
  -- 1. Adjusted Service Date (for work done for previous tenure)
  -- 2. Continuous Service Date (for prior service credit on rehires)
  -- 3. Seniority Date (leave calculated from end of probation)
  -- 4. Start Date (first day on the job, no waiting time)
  -- 5. First Hire Date (original hire date)
  -- 6. Fallback to profile created_at
  IF v_adjusted_service_date IS NOT NULL THEN
    v_service_start := v_adjusted_service_date;
    v_date_source := 'Adjusted Service Date';
  ELSIF v_continuous_service_date IS NOT NULL THEN
    v_service_start := v_continuous_service_date;
    v_date_source := 'Continuous Service Date';
  ELSIF v_seniority_date IS NOT NULL THEN
    v_service_start := v_seniority_date;
    v_date_source := 'Seniority Date';
  ELSIF v_start_date IS NOT NULL THEN
    v_service_start := v_start_date;
    v_date_source := 'Start Date';
  ELSIF v_first_hire_date IS NOT NULL THEN
    v_service_start := v_first_hire_date;
    v_date_source := 'First Hire Date';
  ELSE
    -- Ultimate fallback to profile creation date
    SELECT p.created_at::DATE INTO v_service_start
    FROM profiles p WHERE p.id = p_employee_id;
    v_date_source := 'Profile Created Date (Fallback)';
  END IF;

  RETURN QUERY
  WITH leave_types AS (
    SELECT 
      lt.id,
      lt.name,
      lt.default_days,
      lt.max_carry_over,
      lt.accrual_rate,
      lt.accrual_frequency
    FROM leave_types lt
    WHERE lt.company_id = v_company_id
      AND lt.is_active = true
      AND (p_leave_type_id IS NULL OR lt.id = p_leave_type_id)
  ),
  current_balances AS (
    SELECT
      lb.leave_type_id,
      COALESCE(lb.accrued_days, 0) as current_accrued,
      COALESCE(lb.used_days, 0) as current_used,
      COALESCE(lb.pending_days, 0) as current_pending,
      COALESCE(lb.carried_over_days, 0) as current_carried
    FROM leave_balances lb
    WHERE lb.employee_id = p_employee_id
      AND (p_leave_type_id IS NULL OR lb.leave_type_id = p_leave_type_id)
  ),
  service_calc AS (
    SELECT 
      EXTRACT(YEAR FROM age(CURRENT_DATE, v_service_start)) +
      (EXTRACT(MONTH FROM age(CURRENT_DATE, v_service_start)) / 12.0) as years_of_service
  ),
  accrual_calc AS (
    SELECT
      lt.id as leave_type_id,
      lt.name as leave_type_name,
      -- Calculate accrued based on service years and accrual rate
      CASE 
        WHEN lt.accrual_frequency = 'annual' THEN
          LEAST(lt.default_days * sc.years_of_service, lt.default_days * 2)
        WHEN lt.accrual_frequency = 'monthly' THEN
          LEAST(lt.accrual_rate * 12 * sc.years_of_service, lt.default_days * 2)
        ELSE
          lt.default_days
      END as calculated_accrued,
      COALESCE(cb.current_used, 0) as used,
      COALESCE(cb.current_pending, 0) as pending,
      COALESCE(cb.current_carried, 0) as carried,
      sc.years_of_service
    FROM leave_types lt
    CROSS JOIN service_calc sc
    LEFT JOIN current_balances cb ON cb.leave_type_id = lt.id
  )
  SELECT
    ac.leave_type_id,
    ac.leave_type_name,
    ROUND(ac.calculated_accrued, 2) as accrued_balance,
    ROUND(ac.used, 2) as used_balance,
    ROUND(ac.pending, 2) as pending_balance,
    ROUND(ac.calculated_accrued + ac.carried - ac.used - ac.pending, 2) as available_balance,
    ROUND(ac.carried, 2) as carried_over,
    ROUND(ac.years_of_service, 2) as service_years,
    v_service_start as service_start_date,
    v_date_source as date_source
  FROM accrual_calc ac;
END;
$$;