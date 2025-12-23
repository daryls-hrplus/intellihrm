-- Add missing enterprise fields to employee_work_permits table
ALTER TABLE public.employee_work_permits
ADD COLUMN IF NOT EXISTS port_of_entry text,
ADD COLUMN IF NOT EXISTS permit_conditions text[],
ADD COLUMN IF NOT EXISTS application_reference text,
ADD COLUMN IF NOT EXISTS issuing_authority text;

-- Add comments for documentation
COMMENT ON COLUMN public.employee_work_permits.port_of_entry IS 'Port/location of entry for the work permit';
COMMENT ON COLUMN public.employee_work_permits.permit_conditions IS 'Array of conditions or restrictions on the permit';
COMMENT ON COLUMN public.employee_work_permits.application_reference IS 'Government or embassy application tracking number';
COMMENT ON COLUMN public.employee_work_permits.issuing_authority IS 'Name of the embassy or authority that issued the permit';