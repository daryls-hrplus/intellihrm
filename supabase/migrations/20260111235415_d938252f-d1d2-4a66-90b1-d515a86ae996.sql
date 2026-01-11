-- Add new transaction type codes to lookup_values (excluding leave management)
INSERT INTO lookup_values (category, code, name, description, display_order, is_active, is_default)
VALUES
  ('transaction_type', 'DEMOTION', 'Demotion', 'Movement to lower-grade position', 12, true, false),
  ('transaction_type', 'RETIREMENT', 'Retirement', 'Retirement from employment', 13, true, false),
  ('transaction_type', 'STATUS_CHANGE', 'Status Change', 'Full-time/Part-time/Casual status transitions', 14, true, false),
  ('transaction_type', 'CONTRACT_EXTENSION', 'Contract Extension', 'Extend fixed-term contract', 15, true, false),
  ('transaction_type', 'CONTRACT_CONVERSION', 'Contract Conversion', 'Fixed-term to permanent conversion', 16, true, false);

-- Add new columns to employee_transactions table for the new transaction types
ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  demotion_reason_id UUID REFERENCES lookup_values(id);

ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  is_voluntary_demotion BOOLEAN DEFAULT false;

-- Retirement fields
ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  retirement_type_id UUID REFERENCES lookup_values(id);

ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  pension_eligible BOOLEAN DEFAULT false;

ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  final_settlement_date DATE;

-- Status Change fields
ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  from_employment_status_id UUID REFERENCES lookup_values(id);

ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  to_employment_status_id UUID REFERENCES lookup_values(id);

ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  new_weekly_hours DECIMAL(5,2);

ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  benefits_change_required BOOLEAN DEFAULT false;

-- Contract Extension/Conversion fields
ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  current_contract_end_date DATE;

ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  new_contract_end_date DATE;

ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  new_contract_type_id UUID REFERENCES lookup_values(id);

ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  probation_applies BOOLEAN DEFAULT false;

ALTER TABLE employee_transactions ADD COLUMN IF NOT EXISTS
  contract_extension_reason_id UUID REFERENCES lookup_values(id);

-- Add lookup values for new reasons
INSERT INTO lookup_values (category, code, name, description, display_order, is_active, is_default)
VALUES
  ('demotion_reason', 'PERFORMANCE', 'Performance Related', 'Due to performance issues', 1, true, false),
  ('demotion_reason', 'RESTRUCTURING', 'Organizational Restructuring', 'Due to company restructuring', 2, true, false),
  ('demotion_reason', 'VOLUNTARY', 'Voluntary Request', 'Employee requested demotion', 3, true, false),
  ('demotion_reason', 'ROLE_ELIMINATION', 'Role Elimination', 'Position no longer exists', 4, true, false),
  ('demotion_reason', 'MEDICAL', 'Medical Accommodation', 'For health or medical reasons', 5, true, false);

INSERT INTO lookup_values (category, code, name, description, display_order, is_active, is_default)
VALUES
  ('retirement_type', 'NORMAL', 'Normal Retirement', 'Standard retirement at retirement age', 1, true, true),
  ('retirement_type', 'EARLY', 'Early Retirement', 'Retirement before standard age', 2, true, false),
  ('retirement_type', 'DISABILITY', 'Disability Retirement', 'Retirement due to disability', 3, true, false),
  ('retirement_type', 'VOLUNTARY_EARLY', 'Voluntary Early Retirement', 'Employee-initiated early retirement', 4, true, false);

INSERT INTO lookup_values (category, code, name, description, display_order, is_active, is_default)
VALUES
  ('employment_status', 'FULL_TIME', 'Full-Time', 'Full-time employment status', 1, true, true),
  ('employment_status', 'PART_TIME', 'Part-Time', 'Part-time employment status', 2, true, false),
  ('employment_status', 'CASUAL', 'Casual', 'Casual/on-call employment', 3, true, false),
  ('employment_status', 'SEASONAL', 'Seasonal', 'Seasonal employment', 4, true, false),
  ('employment_status', 'INTERN', 'Intern', 'Internship position', 5, true, false);

INSERT INTO lookup_values (category, code, name, description, display_order, is_active, is_default)
VALUES
  ('contract_extension_reason', 'PROJECT_CONTINUATION', 'Project Continuation', 'Ongoing project requires extension', 1, true, false),
  ('contract_extension_reason', 'PENDING_POSITION', 'Pending Permanent Position', 'Waiting for permanent opening', 2, true, false),
  ('contract_extension_reason', 'PERFORMANCE_REVIEW', 'Performance Review', 'Extended for performance evaluation', 3, true, false),
  ('contract_extension_reason', 'BUSINESS_NEEDS', 'Business Needs', 'Business requirements warrant extension', 4, true, false);