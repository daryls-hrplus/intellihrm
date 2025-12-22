-- Add is_key_position flag to jobs table
ALTER TABLE public.jobs ADD COLUMN is_key_position boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.jobs.is_key_position IS 'When true, all positions associated with this job are considered key positions for succession planning';