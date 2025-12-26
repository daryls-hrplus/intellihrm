-- Update the source check constraint to include T&A
ALTER TABLE public.leave_requests 
DROP CONSTRAINT IF EXISTS leave_requests_source_check;

ALTER TABLE public.leave_requests 
ADD CONSTRAINT leave_requests_source_check 
CHECK (source IN ('ess', 'hr_admin', 't_and_a'));

-- Update comment
COMMENT ON COLUMN public.leave_requests.source IS 'Tracks the origin of the leave request: ess (Employee Self-Service), hr_admin (HR Administration), or t_and_a (Time and Attendance)';