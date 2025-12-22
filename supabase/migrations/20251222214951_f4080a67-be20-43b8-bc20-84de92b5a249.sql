-- Add start_date column for when the background check actually begins
ALTER TABLE employee_background_checks 
ADD COLUMN IF NOT EXISTS start_date date;

COMMENT ON COLUMN employee_background_checks.start_date IS 'Date the background check process actually started';