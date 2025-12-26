-- Add start_date and end_date columns to government_id_types table
ALTER TABLE public.government_id_types 
ADD COLUMN start_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN end_date DATE DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.government_id_types.start_date IS 'Date from which this ID type is valid';
COMMENT ON COLUMN public.government_id_types.end_date IS 'Date until which this ID type is valid (NULL means currently active)';