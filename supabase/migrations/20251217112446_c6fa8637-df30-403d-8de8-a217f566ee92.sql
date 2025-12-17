-- Drop the old constraint and add updated one with new schedule type
ALTER TABLE leave_schedule_config 
DROP CONSTRAINT leave_schedule_config_schedule_type_check;

ALTER TABLE leave_schedule_config 
ADD CONSTRAINT leave_schedule_config_schedule_type_check 
CHECK (schedule_type = ANY (ARRAY['daily_accrual'::text, 'monthly_accrual'::text, 'year_end_rollover'::text, 'new_employee_entitlement'::text]));

-- Also update the leave_schedule_runs table if it has the same constraint
ALTER TABLE leave_schedule_runs 
DROP CONSTRAINT IF EXISTS leave_schedule_runs_schedule_type_check;

ALTER TABLE leave_schedule_runs 
ADD CONSTRAINT leave_schedule_runs_schedule_type_check 
CHECK (schedule_type = ANY (ARRAY['daily_accrual'::text, 'monthly_accrual'::text, 'year_end_rollover'::text, 'new_employee_entitlement'::text]));