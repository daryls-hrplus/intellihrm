-- Add daily accrual frequency option
ALTER TABLE leave_accrual_rules 
DROP CONSTRAINT IF EXISTS leave_accrual_rules_accrual_frequency_check;

ALTER TABLE leave_accrual_rules 
ADD CONSTRAINT leave_accrual_rules_accrual_frequency_check 
CHECK (accrual_frequency IN ('daily', 'weekly', 'bi_weekly', 'monthly', 'annually'));

-- Create function to accrue leave balance incrementally
CREATE OR REPLACE FUNCTION public.accrue_leave_balance(
  p_employee_id UUID,
  p_company_id UUID,
  p_leave_type_id UUID,
  p_accrual_amount NUMERIC,
  p_year INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_max_balance NUMERIC;
  v_current_balance NUMERIC;
BEGIN
  -- Get max balance from leave type
  SELECT max_balance INTO v_max_balance
  FROM leave_types WHERE id = p_leave_type_id;
  
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM leave_balances
  WHERE employee_id = p_employee_id
    AND leave_type_id = p_leave_type_id
    AND year = p_year;
  
  -- Insert or update balance
  INSERT INTO leave_balances (
    employee_id, company_id, leave_type_id, balance, used, pending, carried_over, year
  ) VALUES (
    p_employee_id, p_company_id, p_leave_type_id, p_accrual_amount, 0, 0, 0, p_year
  )
  ON CONFLICT (employee_id, leave_type_id, year)
  DO UPDATE SET
    balance = CASE 
      WHEN v_max_balance IS NOT NULL AND leave_balances.balance + p_accrual_amount > v_max_balance 
      THEN v_max_balance
      ELSE leave_balances.balance + p_accrual_amount
    END,
    updated_at = now();
END;
$$;

-- Create leave accrual log table for audit
CREATE TABLE IF NOT EXISTS public.leave_accrual_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id) NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  leave_type_id UUID REFERENCES leave_types(id) NOT NULL,
  accrual_amount NUMERIC NOT NULL,
  accrual_date DATE NOT NULL DEFAULT CURRENT_DATE,
  accrual_frequency TEXT NOT NULL,
  rule_id UUID REFERENCES leave_accrual_rules(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_accrual_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for accrual logs
CREATE POLICY "Admins can view all accrual logs"
  ON public.leave_accrual_logs
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Employees can view own accrual logs"
  ON public.leave_accrual_logs
  FOR SELECT
  USING (employee_id = auth.uid());

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_leave_accrual_logs_employee ON leave_accrual_logs(employee_id, accrual_date);
CREATE INDEX IF NOT EXISTS idx_leave_accrual_logs_company ON leave_accrual_logs(company_id, accrual_date);