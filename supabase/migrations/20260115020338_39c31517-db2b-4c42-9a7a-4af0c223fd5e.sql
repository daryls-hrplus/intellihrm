-- Add missing columns to profiles table for workforce reminders
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS retirement_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_contract_end_date date;

-- Add exit_interview_date to offboarding_instances if missing
ALTER TABLE offboarding_instances ADD COLUMN IF NOT EXISTS exit_interview_date date;
ALTER TABLE offboarding_instances ADD COLUMN IF NOT EXISTS exit_interview_time time;
ALTER TABLE offboarding_instances ADD COLUMN IF NOT EXISTS exit_interview_location text;
ALTER TABLE offboarding_instances ADD COLUMN IF NOT EXISTS exit_interviewer_id uuid REFERENCES profiles(id);

-- Comment for documentation
COMMENT ON COLUMN profiles.retirement_date IS 'Expected or planned retirement date for the employee';
COMMENT ON COLUMN profiles.current_contract_end_date IS 'End date of the current employment contract';
COMMENT ON COLUMN offboarding_instances.exit_interview_date IS 'Scheduled date for exit interview';
COMMENT ON COLUMN offboarding_instances.exit_interview_time IS 'Scheduled time for exit interview';
COMMENT ON COLUMN offboarding_instances.exit_interview_location IS 'Location/meeting room for exit interview';
COMMENT ON COLUMN offboarding_instances.exit_interviewer_id IS 'HR person conducting the exit interview';