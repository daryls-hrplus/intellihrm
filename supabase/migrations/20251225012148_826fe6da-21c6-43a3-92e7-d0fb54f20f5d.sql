-- Add rate type and hourly rate support to employee_positions
ALTER TABLE employee_positions 
ADD COLUMN IF NOT EXISTS rate_type TEXT DEFAULT 'salaried' CHECK (rate_type IN ('hourly', 'salaried', 'daily')),
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 4),
ADD COLUMN IF NOT EXISTS standard_hours_per_week NUMERIC(5, 2) DEFAULT 40.00;

-- Add hourly payroll configuration to pay_groups
ALTER TABLE pay_groups 
ADD COLUMN IF NOT EXISTS standard_hours_per_period NUMERIC(6, 2),
ADD COLUMN IF NOT EXISTS overtime_multiplier NUMERIC(4, 2) DEFAULT 1.50,
ADD COLUMN IF NOT EXISTS overtime_threshold_hours NUMERIC(6, 2);

-- Add rate_type to employee_compensation for distinguishing fixed vs hourly elements
ALTER TABLE employee_compensation 
ADD COLUMN IF NOT EXISTS rate_type TEXT DEFAULT 'fixed' CHECK (rate_type IN ('fixed', 'hourly', 'percentage', 'calculated'));

-- Add comment for documentation
COMMENT ON COLUMN employee_positions.rate_type IS 'Whether employee is paid hourly, salaried, or daily';
COMMENT ON COLUMN employee_positions.hourly_rate IS 'Hourly rate for hourly-rated employees';
COMMENT ON COLUMN employee_positions.standard_hours_per_week IS 'Standard hours per week for this position';
COMMENT ON COLUMN pay_groups.standard_hours_per_period IS 'Standard hours expected per pay period';
COMMENT ON COLUMN pay_groups.overtime_multiplier IS 'Multiplier for overtime pay (e.g., 1.5 for time-and-a-half)';
COMMENT ON COLUMN pay_groups.overtime_threshold_hours IS 'Hours after which overtime kicks in per period';