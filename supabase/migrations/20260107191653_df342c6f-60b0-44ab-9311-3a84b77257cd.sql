-- Add request_notes column for employee notes on change requests
ALTER TABLE public.employee_data_change_requests 
ADD COLUMN IF NOT EXISTS request_notes text;