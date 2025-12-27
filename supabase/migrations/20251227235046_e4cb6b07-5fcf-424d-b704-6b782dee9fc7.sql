-- Create a table to track pending repayments for payroll review (without foreign key to non-existent table)
CREATE TABLE IF NOT EXISTS salary_advance_payroll_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  pay_period_id UUID REFERENCES pay_periods(id),
  repayment_id UUID NOT NULL REFERENCES salary_advance_repayments(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id),
  advance_id UUID NOT NULL REFERENCES salary_advances(id),
  scheduled_amount DECIMAL(15,2) NOT NULL,
  approved_amount DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'excluded', 'processed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  exclusion_reason TEXT,
  payroll_run_id UUID REFERENCES payroll_runs(id),
  payroll_line_item_id UUID REFERENCES payroll_line_items(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE salary_advance_payroll_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for salary_advance_payroll_queue
CREATE POLICY "Users can view salary advance payroll queue for their company"
ON salary_advance_payroll_queue FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "HR managers can manage salary advance payroll queue"
ON salary_advance_payroll_queue FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE p.id = auth.uid()
    AND p.company_id = salary_advance_payroll_queue.company_id
    AND r.name IN ('admin', 'hr_manager', 'payroll_admin')
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_salary_advance_payroll_queue_company 
ON salary_advance_payroll_queue(company_id, status);

CREATE INDEX IF NOT EXISTS idx_salary_advance_payroll_queue_pay_period 
ON salary_advance_payroll_queue(pay_period_id, status);

-- Add trigger for updated_at
CREATE TRIGGER update_salary_advance_payroll_queue_updated_at
BEFORE UPDATE ON salary_advance_payroll_queue
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comment for documentation
COMMENT ON TABLE salary_advance_payroll_queue IS 'Tracks salary advance repayments queued for payroll deduction with approval workflow';