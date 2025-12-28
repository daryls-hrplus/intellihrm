-- Table to track leave allocation per year for cross-year leave requests
CREATE TABLE public.leave_request_year_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leave_request_id UUID NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  leave_year_id UUID REFERENCES public.leave_years(id),
  allocated_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  balance_id UUID REFERENCES public.leave_balances(id),
  is_deducted BOOLEAN NOT NULL DEFAULT false,
  deducted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(leave_request_id, year)
);

-- Enable RLS
ALTER TABLE public.leave_request_year_allocations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own leave allocations"
ON public.leave_request_year_allocations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leave_requests lr
    WHERE lr.id = leave_request_id AND lr.employee_id = auth.uid()
  )
);

CREATE POLICY "HR can view all leave allocations"
ON public.leave_request_year_allocations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'hr_admin', 'hr_manager')
  )
);

CREATE POLICY "System can manage leave allocations"
ON public.leave_request_year_allocations
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to calculate and create year allocations for a leave request
CREATE OR REPLACE FUNCTION public.calculate_leave_year_allocations(p_leave_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
  v_employee_id UUID;
  v_leave_type_id UUID;
  v_current_year INTEGER;
  v_year_start DATE;
  v_year_end DATE;
  v_period_start DATE;
  v_period_end DATE;
  v_days_in_year NUMERIC(5,2);
  v_total_allocated NUMERIC(5,2) := 0;
  v_duration NUMERIC(5,2);
  v_start_half TEXT;
  v_end_half TEXT;
  v_leave_year_id UUID;
  v_balance_id UUID;
BEGIN
  -- Get leave request details
  SELECT 
    lr.start_date::DATE,
    lr.end_date::DATE,
    lr.employee_id,
    lr.leave_type_id,
    lr.duration,
    lr.start_half,
    lr.end_half
  INTO 
    v_start_date,
    v_end_date,
    v_employee_id,
    v_leave_type_id,
    v_duration,
    v_start_half,
    v_end_half
  FROM leave_requests lr
  WHERE lr.id = p_leave_request_id;

  IF v_start_date IS NULL THEN
    RAISE EXCEPTION 'Leave request not found: %', p_leave_request_id;
  END IF;

  -- Delete existing allocations for this request (in case of recalculation)
  DELETE FROM leave_request_year_allocations WHERE leave_request_id = p_leave_request_id;

  -- Loop through each year the leave spans
  v_current_year := EXTRACT(YEAR FROM v_start_date);
  
  WHILE v_current_year <= EXTRACT(YEAR FROM v_end_date) LOOP
    -- Calculate year boundaries
    v_year_start := make_date(v_current_year, 1, 1);
    v_year_end := make_date(v_current_year, 12, 31);
    
    -- Calculate the overlap period
    v_period_start := GREATEST(v_start_date, v_year_start);
    v_period_end := LEAST(v_end_date, v_year_end);
    
    -- Calculate days in this year
    v_days_in_year := (v_period_end - v_period_start + 1)::NUMERIC;
    
    -- Adjust for half days at start
    IF v_period_start = v_start_date AND v_start_half IN ('first_half', 'second_half') THEN
      v_days_in_year := v_days_in_year - 0.5;
    END IF;
    
    -- Adjust for half days at end (only if different from start date)
    IF v_period_end = v_end_date AND v_start_date != v_end_date AND v_end_half IN ('first_half', 'second_half') THEN
      v_days_in_year := v_days_in_year - 0.5;
    END IF;
    
    -- Handle single day with half day
    IF v_start_date = v_end_date AND v_period_start = v_start_date AND v_start_half IN ('first_half', 'second_half') THEN
      v_days_in_year := 0.5;
    END IF;
    
    -- Ensure non-negative
    v_days_in_year := GREATEST(v_days_in_year, 0);
    
    -- Find the leave year for this calendar year
    SELECT id INTO v_leave_year_id
    FROM leave_years ly
    WHERE ly.is_current = true
      AND v_period_start BETWEEN ly.start_date AND ly.end_date
    LIMIT 1;
    
    -- Find the balance record
    SELECT id INTO v_balance_id
    FROM leave_balances lb
    WHERE lb.employee_id = v_employee_id
      AND lb.leave_type_id = v_leave_type_id
      AND lb.year = v_current_year
    LIMIT 1;
    
    -- Insert allocation record
    IF v_days_in_year > 0 THEN
      INSERT INTO leave_request_year_allocations (
        leave_request_id,
        year,
        leave_year_id,
        allocated_days,
        balance_id
      ) VALUES (
        p_leave_request_id,
        v_current_year,
        v_leave_year_id,
        v_days_in_year,
        v_balance_id
      );
      
      v_total_allocated := v_total_allocated + v_days_in_year;
    END IF;
    
    v_current_year := v_current_year + 1;
  END LOOP;
  
  -- Log if allocation doesn't match duration
  IF ABS(v_total_allocated - v_duration) > 0.01 THEN
    RAISE NOTICE 'Leave allocation mismatch for request %: allocated=%, duration=%', 
      p_leave_request_id, v_total_allocated, v_duration;
  END IF;
END;
$$;

-- Function to deduct leave from balances based on allocations
CREATE OR REPLACE FUNCTION public.deduct_leave_from_balances(p_leave_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allocation RECORD;
  v_employee_id UUID;
  v_leave_type_id UUID;
BEGIN
  -- Get employee and leave type
  SELECT employee_id, leave_type_id 
  INTO v_employee_id, v_leave_type_id
  FROM leave_requests 
  WHERE id = p_leave_request_id;

  -- Process each year allocation
  FOR v_allocation IN 
    SELECT * FROM leave_request_year_allocations 
    WHERE leave_request_id = p_leave_request_id 
      AND is_deducted = false
    ORDER BY year
  LOOP
    -- Create balance record if it doesn't exist
    INSERT INTO leave_balances (
      employee_id,
      leave_type_id,
      year,
      leave_year_id,
      opening_balance,
      accrued_amount,
      used_amount,
      adjustment_amount,
      carried_forward,
      current_balance
    )
    SELECT 
      v_employee_id,
      v_leave_type_id,
      v_allocation.year,
      v_allocation.leave_year_id,
      0, 0, 0, 0, 0, 0
    WHERE NOT EXISTS (
      SELECT 1 FROM leave_balances 
      WHERE employee_id = v_employee_id 
        AND leave_type_id = v_leave_type_id 
        AND year = v_allocation.year
    );
    
    -- Update the balance - increment used_amount and decrement current_balance
    UPDATE leave_balances
    SET 
      used_amount = used_amount + v_allocation.allocated_days,
      current_balance = current_balance - v_allocation.allocated_days,
      updated_at = now()
    WHERE employee_id = v_employee_id
      AND leave_type_id = v_leave_type_id
      AND year = v_allocation.year;
    
    -- Update allocation record to mark as deducted
    UPDATE leave_request_year_allocations
    SET 
      is_deducted = true,
      deducted_at = now(),
      balance_id = (
        SELECT id FROM leave_balances 
        WHERE employee_id = v_employee_id 
          AND leave_type_id = v_leave_type_id 
          AND year = v_allocation.year
      ),
      updated_at = now()
    WHERE id = v_allocation.id;
  END LOOP;
END;
$$;

-- Function to reverse leave deductions (for cancellation/rejection)
CREATE OR REPLACE FUNCTION public.reverse_leave_deductions(p_leave_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allocation RECORD;
BEGIN
  -- Process each deducted allocation
  FOR v_allocation IN 
    SELECT lrya.*, lb.employee_id, lb.leave_type_id
    FROM leave_request_year_allocations lrya
    JOIN leave_balances lb ON lb.id = lrya.balance_id
    WHERE lrya.leave_request_id = p_leave_request_id 
      AND lrya.is_deducted = true
  LOOP
    -- Reverse the balance deduction
    UPDATE leave_balances
    SET 
      used_amount = used_amount - v_allocation.allocated_days,
      current_balance = current_balance + v_allocation.allocated_days,
      updated_at = now()
    WHERE id = v_allocation.balance_id;
    
    -- Update allocation record
    UPDATE leave_request_year_allocations
    SET 
      is_deducted = false,
      deducted_at = NULL,
      updated_at = now()
    WHERE id = v_allocation.id;
  END LOOP;
END;
$$;

-- Trigger function to handle leave request status changes
CREATE OR REPLACE FUNCTION public.handle_leave_request_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When leave is first created or updated, calculate allocations
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.start_date != NEW.start_date OR OLD.end_date != NEW.end_date OR OLD.duration != NEW.duration)) THEN
    PERFORM calculate_leave_year_allocations(NEW.id);
  END IF;
  
  -- When status changes to approved, deduct from balances
  IF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    -- Ensure allocations are calculated
    PERFORM calculate_leave_year_allocations(NEW.id);
    -- Deduct from balances
    PERFORM deduct_leave_from_balances(NEW.id);
  END IF;
  
  -- When approved leave is cancelled or rejected, reverse deductions
  IF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status IN ('cancelled', 'rejected', 'withdrawn') THEN
    PERFORM reverse_leave_deductions(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS leave_request_status_trigger ON leave_requests;
CREATE TRIGGER leave_request_status_trigger
  AFTER INSERT OR UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_leave_request_status_change();

-- Add index for performance
CREATE INDEX idx_leave_request_year_allocations_request ON leave_request_year_allocations(leave_request_id);
CREATE INDEX idx_leave_request_year_allocations_year ON leave_request_year_allocations(year);
CREATE INDEX idx_leave_request_year_allocations_balance ON leave_request_year_allocations(balance_id);