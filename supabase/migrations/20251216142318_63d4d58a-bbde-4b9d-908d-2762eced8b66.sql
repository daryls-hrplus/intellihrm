-- Add reminder_intervals column to support multiple reminder intervals (e.g., 10, 5, 2 days before)
ALTER TABLE public.reminder_rules 
ADD COLUMN IF NOT EXISTS reminder_intervals integer[] DEFAULT NULL;

-- Add a comment explaining the field
COMMENT ON COLUMN public.reminder_rules.reminder_intervals IS 'Array of days before event to send reminders (e.g., {10, 5, 2} for 10, 5, and 2 days before). If NULL, uses single days_before value.';

-- Migrate existing days_before values to the new array format for existing rules
UPDATE public.reminder_rules 
SET reminder_intervals = ARRAY[days_before] 
WHERE reminder_intervals IS NULL AND days_before IS NOT NULL;