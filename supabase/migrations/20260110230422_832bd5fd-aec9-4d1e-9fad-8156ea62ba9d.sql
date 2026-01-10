-- Add seat_id to position_budget_items for seat-level budgeting
ALTER TABLE public.position_budget_items
ADD COLUMN IF NOT EXISTS seat_id UUID REFERENCES public.position_seats(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_position_budget_items_seat_id 
ON public.position_budget_items(seat_id) WHERE seat_id IS NOT NULL;

-- Create view for budget vs seat allocation reconciliation
CREATE OR REPLACE VIEW public.position_budget_seat_reconciliation AS
SELECT 
  pbi.id AS budget_item_id,
  pbi.scenario_id,
  pbi.position_id,
  pbi.seat_id,
  pbi.position_title,
  pbi.base_salary,
  pbi.total_compensation,
  pbi.fully_loaded_cost,
  pbi.annual_cost,
  pbi.fte AS budgeted_fte,
  pbi.headcount AS budgeted_headcount,
  pbs.name AS scenario_name,
  pbs.scenario_type,
  pbp.name AS plan_name,
  pbp.fiscal_year,
  pbp.company_id,
  -- Position info
  p.title AS position_title_canonical,
  p.code AS position_code,
  -- Seat info (if linked)
  ps.seat_code,
  ps.status AS seat_status,
  ps.budget_allocation_amount AS seat_budget,
  ps.budget_allocation_currency AS seat_currency,
  ps.budget_funding_source,
  ps.budget_cost_center_code,
  ps.is_shared_seat,
  ps.max_occupants,
  -- Aggregate seat occupancy
  COALESCE(so.total_occupants, 0) AS current_occupant_count,
  COALESCE(so.total_fte_allocated, 0) AS actual_fte_allocated,
  COALESCE(so.total_budget_allocated, 0) AS actual_budget_percentage_allocated,
  -- Variance calculations
  CASE 
    WHEN ps.id IS NOT NULL THEN 
      COALESCE(pbi.fte, 1) - COALESCE(so.total_fte_allocated / 100, 0)
    ELSE NULL 
  END AS fte_variance,
  CASE 
    WHEN ps.budget_allocation_amount IS NOT NULL AND pbi.annual_cost IS NOT NULL THEN
      pbi.annual_cost - ps.budget_allocation_amount
    ELSE NULL
  END AS budget_variance
FROM public.position_budget_items pbi
JOIN public.position_budget_scenarios pbs ON pbi.scenario_id = pbs.id
JOIN public.position_budget_plans pbp ON pbs.plan_id = pbp.id
LEFT JOIN public.positions p ON pbi.position_id = p.id
LEFT JOIN public.position_seats ps ON pbi.seat_id = ps.id
LEFT JOIN LATERAL (
  SELECT 
    seat_id,
    COUNT(*) AS total_occupants,
    SUM(fte_percentage) AS total_fte_allocated,
    SUM(budget_percentage) AS total_budget_allocated
  FROM public.seat_occupants
  WHERE (end_date IS NULL OR end_date > CURRENT_DATE)
    AND start_date <= CURRENT_DATE
  GROUP BY seat_id
) so ON ps.id = so.seat_id;

-- Create function to populate budget items from seats
CREATE OR REPLACE FUNCTION public.populate_budget_from_seats(
  p_scenario_id UUID,
  p_position_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
  v_plan_company_id UUID;
BEGIN
  -- Get company_id from the scenario's plan
  SELECT pbp.company_id INTO v_plan_company_id
  FROM position_budget_scenarios pbs
  JOIN position_budget_plans pbp ON pbs.plan_id = pbp.id
  WHERE pbs.id = p_scenario_id;

  -- Insert budget items from seats
  INSERT INTO position_budget_items (
    scenario_id,
    position_id,
    seat_id,
    position_title,
    fte,
    headcount,
    base_salary,
    is_vacant
  )
  SELECT 
    p_scenario_id,
    ps.position_id,
    ps.id,
    COALESCE(p.title, 'Unknown Position'),
    CASE 
      WHEN ps.is_shared_seat THEN 
        COALESCE((SELECT SUM(fte_percentage) / 100.0 FROM seat_occupants WHERE seat_id = ps.id AND (end_date IS NULL OR end_date > CURRENT_DATE)), 1)
      ELSE 1
    END,
    1,
    COALESCE(ps.budget_allocation_amount, 0),
    ps.status = 'VACANT'
  FROM position_seats ps
  JOIN positions p ON ps.position_id = p.id
  WHERE p.company_id = v_plan_company_id
    AND ps.status NOT IN ('ELIMINATED', 'PLANNED')
    AND (p_position_ids IS NULL OR ps.position_id = ANY(p_position_ids))
    AND NOT EXISTS (
      SELECT 1 FROM position_budget_items pbi 
      WHERE pbi.scenario_id = p_scenario_id 
        AND pbi.seat_id = ps.id
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Create summary view for seat-aware budget analysis
CREATE OR REPLACE VIEW public.position_budget_seat_summary AS
SELECT 
  pbp.id AS plan_id,
  pbp.name AS plan_name,
  pbp.fiscal_year,
  pbp.company_id,
  pbs.id AS scenario_id,
  pbs.name AS scenario_name,
  pbs.scenario_type,
  -- Position level aggregates
  pbi.position_id,
  p.title AS position_title,
  p.code AS position_code,
  d.name AS department_name,
  -- Budget totals
  COUNT(pbi.id) AS budget_line_items,
  COUNT(DISTINCT pbi.seat_id) FILTER (WHERE pbi.seat_id IS NOT NULL) AS seat_linked_items,
  SUM(pbi.headcount) AS total_budgeted_headcount,
  SUM(pbi.fte) AS total_budgeted_fte,
  SUM(pbi.annual_cost) AS total_annual_cost,
  SUM(pbi.fully_loaded_cost) AS total_fully_loaded_cost,
  -- Seat reality check
  COALESCE(seat_stats.total_seats, 0) AS actual_total_seats,
  COALESCE(seat_stats.filled_seats, 0) AS actual_filled_seats,
  COALESCE(seat_stats.vacant_seats, 0) AS actual_vacant_seats,
  COALESCE(seat_stats.total_seat_budget, 0) AS actual_seat_budget_allocation,
  -- Variance
  SUM(pbi.headcount) - COALESCE(seat_stats.total_seats, 0) AS headcount_variance,
  SUM(pbi.annual_cost) - COALESCE(seat_stats.total_seat_budget, 0) AS budget_variance
FROM position_budget_items pbi
JOIN position_budget_scenarios pbs ON pbi.scenario_id = pbs.id
JOIN position_budget_plans pbp ON pbs.plan_id = pbp.id
LEFT JOIN positions p ON pbi.position_id = p.id
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN LATERAL (
  SELECT 
    ps.position_id,
    COUNT(*) AS total_seats,
    COUNT(*) FILTER (WHERE ps.status = 'FILLED') AS filled_seats,
    COUNT(*) FILTER (WHERE ps.status = 'VACANT') AS vacant_seats,
    COALESCE(SUM(ps.budget_allocation_amount), 0) AS total_seat_budget
  FROM position_seats ps
  WHERE ps.position_id = pbi.position_id
    AND ps.status NOT IN ('ELIMINATED', 'PLANNED')
  GROUP BY ps.position_id
) seat_stats ON true
WHERE pbi.position_id IS NOT NULL
GROUP BY 
  pbp.id, pbp.name, pbp.fiscal_year, pbp.company_id,
  pbs.id, pbs.name, pbs.scenario_type,
  pbi.position_id, p.title, p.code, d.name,
  seat_stats.total_seats, seat_stats.filled_seats, 
  seat_stats.vacant_seats, seat_stats.total_seat_budget;