-- Add source column to leave_requests to track if record came from ESS or HR Admin
ALTER TABLE public.leave_requests 
ADD COLUMN source text DEFAULT 'ess' CHECK (source IN ('ess', 'hr_admin'));

-- Add comment for documentation
COMMENT ON COLUMN public.leave_requests.source IS 'Tracks the origin of the leave request: ess (Employee Self-Service) or hr_admin (HR Administration)';