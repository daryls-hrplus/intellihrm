-- Add payroll_run_type to the lookup_category enum
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'payroll_run_type';

-- Add columns to payroll_runs for off-cycle support
ALTER TABLE payroll_runs
ADD COLUMN IF NOT EXISTS adjustment_reason TEXT,
ADD COLUMN IF NOT EXISTS reference_run_id UUID REFERENCES payroll_runs(id),
ADD COLUMN IF NOT EXISTS payment_date DATE,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Make pay_period_id optional for off-cycle runs
ALTER TABLE payroll_runs ALTER COLUMN pay_period_id DROP NOT NULL;

-- Create a junction table for off-cycle employee selection
CREATE TABLE IF NOT EXISTS payroll_run_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id),
  included BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(payroll_run_id, employee_id)
);

-- Enable RLS on payroll_run_employees
ALTER TABLE payroll_run_employees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payroll_run_employees
CREATE POLICY "Users can view payroll run employees for their company"
  ON payroll_run_employees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM payroll_runs pr
      JOIN profiles p ON p.company_id = pr.company_id
      WHERE pr.id = payroll_run_employees.payroll_run_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Admins and HR can manage payroll run employees"
  ON payroll_run_employees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr_manager')
    )
  );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_payroll_run_employees_run ON payroll_run_employees(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_run_employees_employee ON payroll_run_employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_reference ON payroll_runs(reference_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_run_type ON payroll_runs(run_type);

-- Add trigger for updated_at
CREATE TRIGGER update_payroll_run_employees_updated_at
  BEFORE UPDATE ON payroll_run_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();