-- Enhanced Position Seats Model for Government/Universities
-- Supports multi-occupancy, FTE tracking, secondment linking, and budget allocation

-- 1. Add budget allocation and enhanced tracking to position_seats
ALTER TABLE public.position_seats
ADD COLUMN IF NOT EXISTS budget_allocation_amount numeric(15,2),
ADD COLUMN IF NOT EXISTS budget_allocation_currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS budget_funding_source text,
ADD COLUMN IF NOT EXISTS budget_cost_center_code text,
ADD COLUMN IF NOT EXISTS is_shared_seat boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS max_occupants integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS secondment_origin_seat_id uuid REFERENCES public.position_seats(id),
ADD COLUMN IF NOT EXISTS secondment_return_date date;

-- 2. Create seat_occupants table for multi-occupancy tracking
CREATE TABLE IF NOT EXISTS public.seat_occupants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id uuid NOT NULL REFERENCES public.position_seats(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.profiles(id),
  employee_position_id uuid REFERENCES public.employee_positions(id),
  fte_percentage numeric(5,2) NOT NULL DEFAULT 100 CHECK (fte_percentage > 0 AND fte_percentage <= 100),
  assignment_type text NOT NULL DEFAULT 'primary' CHECK (assignment_type IN ('primary', 'acting', 'temporary', 'concurrent', 'secondment', 'joint')),
  is_primary_occupant boolean DEFAULT false,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  budget_percentage numeric(5,2) DEFAULT 100 CHECK (budget_percentage >= 0 AND budget_percentage <= 100),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(seat_id, employee_id, start_date)
);

-- 3. Create employee_fte_summary view for FTE validation
CREATE OR REPLACE VIEW public.employee_fte_summary AS
SELECT 
  e.id as employee_id,
  e.full_name,
  e.email,
  e.employee_id as employee_number,
  COALESCE(SUM(so.fte_percentage), 0) as total_fte_percentage,
  COUNT(DISTINCT so.seat_id) as active_seat_count,
  CASE 
    WHEN COALESCE(SUM(so.fte_percentage), 0) > 100 THEN 'OVER_ALLOCATED'
    WHEN COALESCE(SUM(so.fte_percentage), 0) = 100 THEN 'FULLY_ALLOCATED'
    WHEN COALESCE(SUM(so.fte_percentage), 0) > 0 THEN 'PARTIALLY_ALLOCATED'
    ELSE 'UNALLOCATED'
  END as fte_status,
  ARRAY_AGG(DISTINCT so.seat_id) FILTER (WHERE so.seat_id IS NOT NULL) as seat_ids,
  ARRAY_AGG(DISTINCT so.assignment_type) FILTER (WHERE so.assignment_type IS NOT NULL) as assignment_types
FROM public.profiles e
LEFT JOIN public.seat_occupants so ON e.id = so.employee_id 
  AND (so.end_date IS NULL OR so.end_date >= CURRENT_DATE)
  AND so.start_date <= CURRENT_DATE
GROUP BY e.id, e.full_name, e.email, e.employee_id;

-- 4. Create seat_occupancy_summary view for multi-occupancy tracking
CREATE OR REPLACE VIEW public.seat_occupancy_summary AS
SELECT 
  ps.id as seat_id,
  ps.seat_code,
  ps.status,
  ps.position_id,
  p.title as position_title,
  p.code as position_code,
  d.id as department_id,
  d.name as department_name,
  ps.is_shared_seat,
  ps.max_occupants,
  ps.budget_allocation_amount,
  ps.budget_allocation_currency,
  ps.budget_funding_source,
  COUNT(so.id) as current_occupant_count,
  COALESCE(SUM(so.fte_percentage), 0) as total_fte_allocated,
  CASE 
    WHEN COALESCE(SUM(so.fte_percentage), 0) > 100 THEN 'OVER_ALLOCATED'
    WHEN COALESCE(SUM(so.fte_percentage), 0) = 100 THEN 'FULLY_ALLOCATED'
    WHEN COALESCE(SUM(so.fte_percentage), 0) > 0 THEN 'PARTIALLY_ALLOCATED'
    ELSE 'UNALLOCATED'
  END as allocation_status,
  COALESCE(SUM(so.budget_percentage), 0) as total_budget_allocated,
  ARRAY_AGG(
    jsonb_build_object(
      'employee_id', so.employee_id,
      'fte_percentage', so.fte_percentage,
      'assignment_type', so.assignment_type,
      'is_primary', so.is_primary_occupant,
      'budget_percentage', so.budget_percentage
    )
  ) FILTER (WHERE so.id IS NOT NULL) as occupants
FROM public.position_seats ps
LEFT JOIN public.positions p ON ps.position_id = p.id
LEFT JOIN public.departments d ON p.department_id = d.id
LEFT JOIN public.seat_occupants so ON ps.id = so.seat_id 
  AND (so.end_date IS NULL OR so.end_date >= CURRENT_DATE)
  AND so.start_date <= CURRENT_DATE
WHERE ps.status != 'ELIMINATED'
GROUP BY ps.id, ps.seat_code, ps.status, ps.position_id, p.title, p.code, 
         d.id, d.name, ps.is_shared_seat, ps.max_occupants,
         ps.budget_allocation_amount, ps.budget_allocation_currency, ps.budget_funding_source;

-- 5. Create secondment_tracking view
CREATE OR REPLACE VIEW public.secondment_tracking AS
SELECT 
  ps.id as current_seat_id,
  ps.seat_code as current_seat_code,
  ps.position_id as current_position_id,
  cp.title as current_position_title,
  cd.name as current_department_name,
  ps.secondment_origin_seat_id as origin_seat_id,
  os.seat_code as origin_seat_code,
  os.position_id as origin_position_id,
  op.title as origin_position_title,
  od.name as origin_department_name,
  ps.secondment_return_date,
  so.employee_id,
  pr.full_name as employee_name,
  so.fte_percentage,
  so.start_date as secondment_start_date,
  CASE 
    WHEN ps.secondment_return_date < CURRENT_DATE THEN 'OVERDUE'
    WHEN ps.secondment_return_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'ENDING_SOON'
    ELSE 'ACTIVE'
  END as secondment_status
FROM public.position_seats ps
INNER JOIN public.position_seats os ON ps.secondment_origin_seat_id = os.id
LEFT JOIN public.positions cp ON ps.position_id = cp.id
LEFT JOIN public.departments cd ON cp.department_id = cd.id
LEFT JOIN public.positions op ON os.position_id = op.id
LEFT JOIN public.departments od ON op.department_id = od.id
LEFT JOIN public.seat_occupants so ON ps.id = so.seat_id 
  AND so.assignment_type = 'secondment'
  AND (so.end_date IS NULL OR so.end_date >= CURRENT_DATE)
LEFT JOIN public.profiles pr ON so.employee_id = pr.id
WHERE ps.secondment_origin_seat_id IS NOT NULL;

-- 6. Enable RLS on seat_occupants
ALTER TABLE public.seat_occupants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view seat occupants"
  ON public.seat_occupants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage seat occupants"
  ON public.seat_occupants FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 7. Create trigger for updated_at
CREATE TRIGGER set_seat_occupants_updated_at
  BEFORE UPDATE ON public.seat_occupants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Create function to validate FTE allocation (logs warning, does not block)
CREATE OR REPLACE FUNCTION public.validate_employee_fte()
RETURNS TRIGGER AS $$
DECLARE
  current_total numeric;
  new_total numeric;
BEGIN
  SELECT COALESCE(SUM(fte_percentage), 0)
  INTO current_total
  FROM public.seat_occupants so
  WHERE so.employee_id = NEW.employee_id
    AND so.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (so.end_date IS NULL OR so.end_date >= CURRENT_DATE)
    AND so.start_date <= COALESCE(NEW.end_date, '9999-12-31'::date);
  
  new_total := current_total + NEW.fte_percentage;
  
  IF new_total > 100 THEN
    RAISE WARNING 'FTE over-allocation detected: total would be %', new_total;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_employee_fte_allocation
  BEFORE INSERT OR UPDATE ON public.seat_occupants
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_employee_fte();

-- 9. Create function to sync seat status with occupants
CREATE OR REPLACE FUNCTION public.sync_seat_status_from_occupants()
RETURNS TRIGGER AS $$
DECLARE
  occupant_count integer;
  seat_status text;
  target_seat_id uuid;
BEGIN
  target_seat_id := COALESCE(NEW.seat_id, OLD.seat_id);
  
  SELECT COUNT(*) INTO occupant_count
  FROM public.seat_occupants
  WHERE seat_id = target_seat_id
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    AND start_date <= CURRENT_DATE;
  
  SELECT status INTO seat_status
  FROM public.position_seats
  WHERE id = target_seat_id;
  
  IF seat_status NOT IN ('FROZEN', 'ELIMINATED') THEN
    UPDATE public.position_seats
    SET status = CASE WHEN occupant_count > 0 THEN 'FILLED' ELSE 'VACANT' END,
        filled_date = CASE WHEN occupant_count > 0 THEN CURRENT_DATE ELSE NULL END
    WHERE id = target_seat_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_seat_on_occupant_change
  AFTER INSERT OR UPDATE OR DELETE ON public.seat_occupants
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_seat_status_from_occupants();

-- 10. Add indexes for performance (without CURRENT_DATE which is not immutable)
CREATE INDEX IF NOT EXISTS idx_seat_occupants_seat_id ON public.seat_occupants(seat_id);
CREATE INDEX IF NOT EXISTS idx_seat_occupants_employee_id ON public.seat_occupants(employee_id);
CREATE INDEX IF NOT EXISTS idx_seat_occupants_dates ON public.seat_occupants(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_position_seats_secondment ON public.position_seats(secondment_origin_seat_id) 
  WHERE secondment_origin_seat_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_position_seats_shared ON public.position_seats(position_id) 
  WHERE is_shared_seat = true;