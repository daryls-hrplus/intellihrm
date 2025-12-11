-- Insert default lookup values for new categories
INSERT INTO lookup_values (category, code, name, description, display_order, is_default) VALUES
-- Transaction Types
('transaction_type', 'HIRE', 'New Hire', 'Hiring a new employee', 1, true),
('transaction_type', 'CONFIRMATION', 'Confirmation', 'Confirming employee after probation', 2, false),
('transaction_type', 'PROBATION_EXT', 'Probation Extension', 'Extending probation period', 3, false),
('transaction_type', 'ACTING', 'Acting Assignment', 'Temporary acting role assignment', 4, false),
('transaction_type', 'PROMOTION', 'Promotion', 'Employee promotion', 5, false),
('transaction_type', 'TRANSFER', 'Transfer', 'Employee transfer', 6, false),
('transaction_type', 'TERMINATION', 'Termination', 'Employee termination', 7, false),

-- Hire Types
('hire_type', 'NEW', 'New Hire', 'Brand new employee', 1, true),
('hire_type', 'REHIRE', 'Rehire', 'Previously employed, returning', 2, false),
('hire_type', 'CONVERSION', 'Conversion', 'Contractor to employee conversion', 3, false),

-- Probation Extension Reasons
('probation_extension_reason', 'PERFORMANCE', 'Performance Concerns', 'Need more time to assess performance', 1, true),
('probation_extension_reason', 'TRAINING', 'Training Incomplete', 'Required training not completed', 2, false),
('probation_extension_reason', 'ATTENDANCE', 'Attendance Issues', 'Attendance needs improvement', 3, false),
('probation_extension_reason', 'OTHER', 'Other', 'Other reasons', 4, false),

-- Promotion Reasons
('promotion_reason', 'PERFORMANCE', 'Excellent Performance', 'Consistently exceeds expectations', 1, true),
('promotion_reason', 'VACANCY', 'Position Vacancy', 'Filling a vacant higher position', 2, false),
('promotion_reason', 'RESTRUCTURE', 'Organizational Restructure', 'Due to organizational changes', 3, false),
('promotion_reason', 'MERIT', 'Merit Based', 'Based on qualifications and experience', 4, false),

-- Transfer Reasons
('transfer_reason', 'BUSINESS_NEED', 'Business Need', 'Required by business operations', 1, true),
('transfer_reason', 'EMPLOYEE_REQUEST', 'Employee Request', 'Requested by employee', 2, false),
('transfer_reason', 'RESTRUCTURE', 'Organizational Restructure', 'Due to organizational changes', 3, false),
('transfer_reason', 'PERFORMANCE', 'Performance Management', 'Part of performance improvement', 4, false),
('transfer_reason', 'DEVELOPMENT', 'Career Development', 'For employee development purposes', 5, false),

-- Acting Reasons
('acting_reason', 'VACANCY', 'Position Vacancy', 'Temporary coverage for vacant position', 1, true),
('acting_reason', 'LEAVE', 'Employee on Leave', 'Covering for employee on leave', 2, false),
('acting_reason', 'PROJECT', 'Special Project', 'For a specific project duration', 3, false),
('acting_reason', 'DEVELOPMENT', 'Development Opportunity', 'For career development', 4, false);

-- Create employee_transactions table
CREATE TABLE public.employee_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT NOT NULL UNIQUE,
  transaction_type_id UUID NOT NULL REFERENCES lookup_values(id),
  employee_id UUID REFERENCES profiles(id),
  
  -- Common fields
  effective_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  
  -- Hire specific fields
  hire_type_id UUID REFERENCES lookup_values(id),
  employment_type_id UUID REFERENCES lookup_values(id),
  contract_type_id UUID REFERENCES lookup_values(id),
  position_id UUID REFERENCES positions(id),
  department_id UUID REFERENCES departments(id),
  company_id UUID REFERENCES companies(id),
  probation_end_date DATE,
  
  -- Confirmation specific
  confirmation_date DATE,
  
  -- Probation extension specific
  original_probation_end_date DATE,
  new_probation_end_date DATE,
  extension_reason_id UUID REFERENCES lookup_values(id),
  extension_days INTEGER,
  
  -- Acting specific
  acting_position_id UUID REFERENCES positions(id),
  acting_start_date DATE,
  acting_end_date DATE,
  acting_reason_id UUID REFERENCES lookup_values(id),
  acting_allowance NUMERIC,
  
  -- Promotion specific
  from_position_id UUID REFERENCES positions(id),
  to_position_id UUID REFERENCES positions(id),
  promotion_reason_id UUID REFERENCES lookup_values(id),
  salary_adjustment NUMERIC,
  salary_adjustment_type TEXT,
  
  -- Transfer specific
  from_department_id UUID REFERENCES departments(id),
  to_department_id UUID REFERENCES departments(id),
  from_company_id UUID REFERENCES companies(id),
  to_company_id UUID REFERENCES companies(id),
  transfer_reason_id UUID REFERENCES lookup_values(id),
  
  -- Termination specific
  termination_reason_id UUID REFERENCES lookup_values(id),
  last_working_date DATE,
  termination_type TEXT,
  exit_interview_completed BOOLEAN DEFAULT false,
  
  -- Workflow integration
  workflow_instance_id UUID REFERENCES workflow_instances(id),
  requires_workflow BOOLEAN DEFAULT false,
  
  -- Audit fields
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for transaction numbers
CREATE SEQUENCE IF NOT EXISTS transaction_number_seq START 1000;

-- Function to generate transaction number
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.transaction_number := 'TXN-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('transaction_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-generate transaction number
CREATE TRIGGER set_transaction_number
  BEFORE INSERT ON employee_transactions
  FOR EACH ROW
  EXECUTE FUNCTION generate_transaction_number();

-- Update timestamp trigger
CREATE TRIGGER update_employee_transactions_updated_at
  BEFORE UPDATE ON employee_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE employee_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view transactions"
  ON employee_transactions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and HR managers can create transactions"
  ON employee_transactions FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role)
  );

CREATE POLICY "Admins and HR managers can update transactions"
  ON employee_transactions FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role)
  );

CREATE POLICY "Admins can delete transactions"
  ON employee_transactions FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for common queries
CREATE INDEX idx_employee_transactions_employee ON employee_transactions(employee_id);
CREATE INDEX idx_employee_transactions_type ON employee_transactions(transaction_type_id);
CREATE INDEX idx_employee_transactions_status ON employee_transactions(status);
CREATE INDEX idx_employee_transactions_effective_date ON employee_transactions(effective_date);
CREATE INDEX idx_employee_transactions_workflow ON employee_transactions(workflow_instance_id);