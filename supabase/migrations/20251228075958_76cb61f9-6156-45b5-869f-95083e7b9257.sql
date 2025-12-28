-- =============================================
-- PROJECT LABOR COST CALCULATION ENGINE
-- =============================================

-- Function to get the cost rate for an employee on a project
CREATE OR REPLACE FUNCTION public.get_project_cost_rate(
  p_project_id UUID,
  p_employee_id UUID,
  p_entry_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(cost_rate NUMERIC, bill_rate NUMERIC) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_employee_job_id UUID;
  v_project_hourly_rate NUMERIC;
  v_employee_hourly_rate NUMERIC;
BEGIN
  -- Priority 1: Employee-specific rate for this project
  SELECT pcr.cost_rate, pcr.bill_rate INTO cost_rate, bill_rate
  FROM project_cost_rates pcr
  WHERE pcr.project_id = p_project_id
    AND pcr.employee_id = p_employee_id
    AND pcr.is_active = true
    AND pcr.effective_start_date <= p_entry_date
    AND (pcr.effective_end_date IS NULL OR pcr.effective_end_date >= p_entry_date)
  ORDER BY pcr.effective_start_date DESC
  LIMIT 1;
  
  IF FOUND THEN
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Get employee's job
  SELECT job_id INTO v_employee_job_id 
  FROM profiles WHERE id = p_employee_id;
  
  -- Priority 2: Job-specific rate for this project
  IF v_employee_job_id IS NOT NULL THEN
    SELECT pcr.cost_rate, pcr.bill_rate INTO cost_rate, bill_rate
    FROM project_cost_rates pcr
    WHERE pcr.project_id = p_project_id
      AND pcr.job_id = v_employee_job_id
      AND pcr.employee_id IS NULL
      AND pcr.is_active = true
      AND pcr.effective_start_date <= p_entry_date
      AND (pcr.effective_end_date IS NULL OR pcr.effective_end_date >= p_entry_date)
    ORDER BY pcr.effective_start_date DESC
    LIMIT 1;
    
    IF FOUND THEN
      RETURN NEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Priority 3: Project default rate
  SELECT p.hourly_rate INTO v_project_hourly_rate
  FROM projects p WHERE p.id = p_project_id;
  
  -- Priority 4: Employee compensation rate
  SELECT 
    CASE 
      WHEN ec.rate_type = 'hourly' THEN ec.base_amount
      WHEN ec.rate_type = 'daily' THEN ec.base_amount / 8
      WHEN ec.rate_type = 'weekly' THEN ec.base_amount / 40
      WHEN ec.rate_type = 'monthly' THEN ec.base_amount / 173.33
      WHEN ec.rate_type = 'annual' THEN ec.base_amount / 2080
      ELSE ec.base_amount
    END INTO v_employee_hourly_rate
  FROM employee_compensation ec
  WHERE ec.employee_id = p_employee_id
    AND ec.is_active = true
    AND ec.effective_date <= p_entry_date
  ORDER BY ec.effective_date DESC
  LIMIT 1;
  
  -- Return best available rate
  cost_rate := COALESCE(v_employee_hourly_rate, v_project_hourly_rate, 0);
  bill_rate := COALESCE(v_project_hourly_rate, v_employee_hourly_rate, 0);
  RETURN NEXT;
END;
$$;

-- Function to calculate cost for a time entry
CREATE OR REPLACE FUNCTION public.calculate_time_entry_cost(
  p_time_entry_id UUID DEFAULT NULL,
  p_time_clock_entry_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_project_id UUID;
  v_employee_id UUID;
  v_company_id UUID;
  v_entry_date DATE;
  v_hours NUMERIC;
  v_cost_rate NUMERIC;
  v_bill_rate NUMERIC;
  v_overtime_hours NUMERIC := 0;
  v_regular_hours NUMERIC;
  v_overtime_multiplier NUMERIC := 1.5;
  v_shift_differential NUMERIC := 0;
  v_regular_cost NUMERIC;
  v_overtime_cost NUMERIC;
  v_shift_diff_cost NUMERIC := 0;
  v_total_cost NUMERIC;
  v_billable_amount NUMERIC;
  v_is_billable BOOLEAN := true;
  v_result_id UUID;
BEGIN
  -- Get entry details from project_time_entries
  IF p_time_entry_id IS NOT NULL THEN
    SELECT 
      pte.project_id, pte.employee_id, p.company_id,
      COALESCE(pte.entry_date, pte.created_at::DATE),
      COALESCE(pte.hours, 0),
      proj.billable
    INTO v_project_id, v_employee_id, v_company_id, v_entry_date, v_hours, v_is_billable
    FROM project_time_entries pte
    JOIN profiles p ON pte.employee_id = p.id
    JOIN projects proj ON pte.project_id = proj.id
    WHERE pte.id = p_time_entry_id;
  -- Or from time_clock_entries
  ELSIF p_time_clock_entry_id IS NOT NULL THEN
    SELECT 
      tce.project_id, tce.employee_id, p.company_id,
      tce.clock_in_time::DATE,
      COALESCE(tce.total_hours, 0),
      COALESCE(proj.billable, true)
    INTO v_project_id, v_employee_id, v_company_id, v_entry_date, v_hours, v_is_billable
    FROM time_clock_entries tce
    JOIN profiles p ON tce.employee_id = p.id
    LEFT JOIN projects proj ON tce.project_id = proj.id
    WHERE tce.id = p_time_clock_entry_id;
  ELSE
    RETURN jsonb_build_object('error', 'No entry ID provided');
  END IF;
  
  IF v_project_id IS NULL THEN
    RETURN jsonb_build_object('error', 'No project associated with this entry');
  END IF;
  
  -- Get cost and bill rates
  SELECT cr.cost_rate, cr.bill_rate INTO v_cost_rate, v_bill_rate
  FROM get_project_cost_rate(v_project_id, v_employee_id, v_entry_date) cr;
  
  -- Simple overtime calculation (hours over 8 in a day)
  IF v_hours > 8 THEN
    v_overtime_hours := v_hours - 8;
    v_regular_hours := 8;
  ELSE
    v_regular_hours := v_hours;
  END IF;
  
  -- Check for shift differentials
  SELECT COALESCE(sd.differential_amount, 0) INTO v_shift_differential
  FROM shift_differentials sd
  WHERE sd.company_id = v_company_id
    AND sd.is_active = true
    AND (sd.applicable_days IS NULL OR EXTRACT(DOW FROM v_entry_date)::TEXT = ANY(sd.applicable_days))
  LIMIT 1;
  
  -- Calculate costs
  v_regular_cost := v_regular_hours * v_cost_rate;
  v_overtime_cost := v_overtime_hours * v_cost_rate * v_overtime_multiplier;
  v_shift_diff_cost := v_hours * v_shift_differential;
  v_total_cost := v_regular_cost + v_overtime_cost + v_shift_diff_cost;
  
  -- Calculate billable amount
  IF v_is_billable THEN
    v_billable_amount := (v_regular_hours * v_bill_rate) + (v_overtime_hours * v_bill_rate * v_overtime_multiplier);
  ELSE
    v_billable_amount := 0;
  END IF;
  
  -- Insert or update cost entry
  INSERT INTO project_cost_entries (
    company_id, project_id, employee_id,
    time_entry_id, time_clock_entry_id, entry_date,
    base_hours, overtime_hours, regular_cost, overtime_cost,
    shift_differential_cost, total_cost, billable_amount,
    cost_rate_used, bill_rate_used, overtime_multiplier,
    is_billable, calculation_status
  ) VALUES (
    v_company_id, v_project_id, v_employee_id,
    p_time_entry_id, p_time_clock_entry_id, v_entry_date,
    v_regular_hours, v_overtime_hours, v_regular_cost, v_overtime_cost,
    v_shift_diff_cost, v_total_cost, v_billable_amount,
    v_cost_rate, v_bill_rate, v_overtime_multiplier,
    v_is_billable, 'calculated'
  )
  ON CONFLICT (time_entry_id) WHERE time_entry_id IS NOT NULL
  DO UPDATE SET
    base_hours = EXCLUDED.base_hours,
    overtime_hours = EXCLUDED.overtime_hours,
    regular_cost = EXCLUDED.regular_cost,
    overtime_cost = EXCLUDED.overtime_cost,
    shift_differential_cost = EXCLUDED.shift_differential_cost,
    total_cost = EXCLUDED.total_cost,
    billable_amount = EXCLUDED.billable_amount,
    cost_rate_used = EXCLUDED.cost_rate_used,
    bill_rate_used = EXCLUDED.bill_rate_used,
    calculation_status = 'calculated',
    updated_at = now()
  RETURNING id INTO v_result_id;
  
  -- Update the source entry
  IF p_time_entry_id IS NOT NULL THEN
    UPDATE project_time_entries
    SET calculated_cost = v_total_cost,
        calculated_billable = v_billable_amount,
        cost_calculation_status = 'calculated',
        cost_calculated_at = now()
    WHERE id = p_time_entry_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'cost_entry_id', v_result_id,
    'regular_hours', v_regular_hours,
    'overtime_hours', v_overtime_hours,
    'total_cost', v_total_cost,
    'billable_amount', v_billable_amount,
    'cost_rate', v_cost_rate,
    'bill_rate', v_bill_rate
  );
END;
$$;

-- Function to update project cost summaries
CREATE OR REPLACE FUNCTION public.update_project_cost_summary(
  p_project_id UUID,
  p_period_type VARCHAR DEFAULT 'daily',
  p_period_start DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id UUID;
  v_period_end DATE;
  v_budget_amount NUMERIC;
BEGIN
  -- Get company and calculate period end
  SELECT company_id INTO v_company_id FROM projects WHERE id = p_project_id;
  
  CASE p_period_type
    WHEN 'daily' THEN v_period_end := p_period_start;
    WHEN 'weekly' THEN v_period_end := p_period_start + INTERVAL '6 days';
    WHEN 'monthly' THEN v_period_end := (date_trunc('month', p_period_start) + INTERVAL '1 month - 1 day')::DATE;
    ELSE v_period_end := p_period_start;
  END CASE;
  
  -- Get budget for this period
  SELECT pb.budget_amount INTO v_budget_amount
  FROM project_budgets pb
  WHERE pb.project_id = p_project_id
    AND pb.budget_type = 'labor'
    AND pb.is_active = true
    AND (pb.period_start IS NULL OR pb.period_start <= p_period_start)
    AND (pb.period_end IS NULL OR pb.period_end >= v_period_end)
  LIMIT 1;
  
  -- Upsert summary
  INSERT INTO project_labor_cost_summaries (
    company_id, project_id, period_type, period_start, period_end,
    total_hours, regular_hours, overtime_hours,
    total_cost, regular_cost, overtime_cost, shift_differential_cost,
    total_billable, budget_amount, budget_utilization_percent,
    employee_count, entry_count
  )
  SELECT
    v_company_id,
    p_project_id,
    p_period_type,
    p_period_start,
    v_period_end,
    COALESCE(SUM(pce.base_hours + pce.overtime_hours), 0),
    COALESCE(SUM(pce.base_hours), 0),
    COALESCE(SUM(pce.overtime_hours), 0),
    COALESCE(SUM(pce.total_cost), 0),
    COALESCE(SUM(pce.regular_cost), 0),
    COALESCE(SUM(pce.overtime_cost), 0),
    COALESCE(SUM(pce.shift_differential_cost), 0),
    COALESCE(SUM(pce.billable_amount), 0),
    v_budget_amount,
    CASE WHEN v_budget_amount > 0 
      THEN ROUND((COALESCE(SUM(pce.total_cost), 0) / v_budget_amount) * 100, 2)
      ELSE NULL
    END,
    COUNT(DISTINCT pce.employee_id),
    COUNT(pce.id)
  FROM project_cost_entries pce
  WHERE pce.project_id = p_project_id
    AND pce.entry_date >= p_period_start
    AND pce.entry_date <= v_period_end
  ON CONFLICT (project_id, period_type, period_start)
  DO UPDATE SET
    total_hours = EXCLUDED.total_hours,
    regular_hours = EXCLUDED.regular_hours,
    overtime_hours = EXCLUDED.overtime_hours,
    total_cost = EXCLUDED.total_cost,
    regular_cost = EXCLUDED.regular_cost,
    overtime_cost = EXCLUDED.overtime_cost,
    shift_differential_cost = EXCLUDED.shift_differential_cost,
    total_billable = EXCLUDED.total_billable,
    budget_amount = EXCLUDED.budget_amount,
    budget_utilization_percent = EXCLUDED.budget_utilization_percent,
    employee_count = EXCLUDED.employee_count,
    entry_count = EXCLUDED.entry_count,
    updated_at = now();
  
  -- Update project cost_to_date
  UPDATE projects
  SET cost_to_date = (
    SELECT COALESCE(SUM(total_cost), 0) 
    FROM project_cost_entries 
    WHERE project_id = p_project_id
  ),
  revenue_to_date = (
    SELECT COALESCE(SUM(billable_amount), 0) 
    FROM project_cost_entries 
    WHERE project_id = p_project_id
  ),
  last_cost_calculation_at = now()
  WHERE id = p_project_id;
END;
$$;

-- Function to check budget thresholds and create alerts
CREATE OR REPLACE FUNCTION public.check_project_budget_thresholds(p_project_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id UUID;
  v_current_cost NUMERIC;
  v_budget RECORD;
  v_utilization NUMERIC;
BEGIN
  -- Get current project cost
  SELECT company_id, COALESCE(cost_to_date, 0) 
  INTO v_company_id, v_current_cost
  FROM projects WHERE id = p_project_id;
  
  -- Check each active budget
  FOR v_budget IN
    SELECT * FROM project_budgets
    WHERE project_id = p_project_id
      AND is_active = true
      AND budget_amount > 0
  LOOP
    v_utilization := (v_current_cost / v_budget.budget_amount) * 100;
    
    -- Check critical threshold
    IF v_utilization >= v_budget.critical_threshold_percent THEN
      INSERT INTO project_cost_alerts (
        company_id, project_id, budget_id,
        alert_type, severity,
        threshold_percent, current_percent,
        budget_amount, current_cost,
        message
      ) VALUES (
        v_company_id, p_project_id, v_budget.id,
        CASE WHEN v_utilization >= 100 THEN 'overrun' ELSE 'threshold_critical' END,
        'critical',
        v_budget.critical_threshold_percent, v_utilization,
        v_budget.budget_amount, v_current_cost,
        CASE WHEN v_utilization >= 100 
          THEN 'Budget exceeded! Current spend: ' || ROUND(v_utilization, 1) || '%'
          ELSE 'Critical threshold reached: ' || ROUND(v_utilization, 1) || '% of budget used'
        END
      );
    -- Check warning threshold
    ELSIF v_utilization >= v_budget.alert_threshold_percent THEN
      INSERT INTO project_cost_alerts (
        company_id, project_id, budget_id,
        alert_type, severity,
        threshold_percent, current_percent,
        budget_amount, current_cost,
        message
      ) VALUES (
        v_company_id, p_project_id, v_budget.id,
        'threshold_warning', 'warning',
        v_budget.alert_threshold_percent, v_utilization,
        v_budget.budget_amount, v_current_cost,
        'Warning: ' || ROUND(v_utilization, 1) || '% of budget used'
      );
    END IF;
  END LOOP;
END;
$$;

-- Create unique partial index for time_entry_id conflict handling
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_cost_entries_time_entry_unique 
ON public.project_cost_entries(time_entry_id) WHERE time_entry_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_cost_entries_clock_entry_unique 
ON public.project_cost_entries(time_clock_entry_id) WHERE time_clock_entry_id IS NOT NULL;