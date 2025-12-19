-- Add annual maximum columns to statutory_rate_bands for cap enforcement
ALTER TABLE public.statutory_rate_bands 
ADD COLUMN IF NOT EXISTS annual_max_employee numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS annual_max_employer numeric DEFAULT NULL;

-- Add comments for clarity
COMMENT ON COLUMN public.statutory_rate_bands.annual_max_employee IS 'Maximum annual employee contribution for this statutory (e.g., NIS cap)';
COMMENT ON COLUMN public.statutory_rate_bands.annual_max_employer IS 'Maximum annual employer contribution for this statutory';

-- Create a view or function to get YTD statutory deductions for an employee
CREATE OR REPLACE FUNCTION public.get_employee_ytd_statutory(
  p_employee_id uuid,
  p_tax_year integer,
  p_exclude_run_id uuid DEFAULT NULL
)
RETURNS TABLE (
  statutory_code text,
  statutory_type text,
  ytd_employee_amount numeric,
  ytd_employer_amount numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pli.code as statutory_code,
    pli.line_type as statutory_type,
    COALESCE(SUM(CASE WHEN pli.line_type LIKE '%_employee' OR pli.line_type = 'statutory_deduction' THEN pli.amount ELSE 0 END), 0) as ytd_employee_amount,
    COALESCE(SUM(CASE WHEN pli.line_type LIKE '%_employer' THEN pli.amount ELSE 0 END), 0) as ytd_employer_amount
  FROM payroll_line_items pli
  JOIN employee_payroll ep ON ep.id = pli.employee_payroll_id
  JOIN payroll_runs pr ON pr.id = ep.payroll_run_id
  JOIN pay_periods pp ON pp.id = ep.pay_period_id
  WHERE ep.employee_id = p_employee_id
    AND EXTRACT(YEAR FROM pp.period_start) = p_tax_year
    AND pr.status IN ('calculated', 'approved', 'paid')
    AND pli.line_type IN ('statutory_deduction', 'employer_statutory')
    AND (p_exclude_run_id IS NULL OR pr.id != p_exclude_run_id)
  GROUP BY pli.code, pli.line_type;
END;
$$;

-- Create a function to get current period statutory totals for an employee
CREATE OR REPLACE FUNCTION public.get_employee_period_statutory(
  p_employee_id uuid,
  p_pay_period_id uuid,
  p_exclude_run_id uuid DEFAULT NULL
)
RETURNS TABLE (
  statutory_code text,
  statutory_type text,
  period_employee_amount numeric,
  period_employer_amount numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pli.code as statutory_code,
    pli.line_type as statutory_type,
    COALESCE(SUM(CASE WHEN pli.line_type LIKE '%_employee' OR pli.line_type = 'statutory_deduction' THEN pli.amount ELSE 0 END), 0) as period_employee_amount,
    COALESCE(SUM(CASE WHEN pli.line_type LIKE '%_employer' THEN pli.amount ELSE 0 END), 0) as period_employer_amount
  FROM payroll_line_items pli
  JOIN employee_payroll ep ON ep.id = pli.employee_payroll_id
  JOIN payroll_runs pr ON pr.id = ep.payroll_run_id
  WHERE ep.employee_id = p_employee_id
    AND ep.pay_period_id = p_pay_period_id
    AND pr.status IN ('calculated', 'approved', 'paid')
    AND pli.line_type IN ('statutory_deduction', 'employer_statutory')
    AND (p_exclude_run_id IS NULL OR pr.id != p_exclude_run_id)
  GROUP BY pli.code, pli.line_type;
END;
$$;