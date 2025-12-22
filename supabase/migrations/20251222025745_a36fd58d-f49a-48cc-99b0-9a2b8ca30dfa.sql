-- Add job_id column to positions table to link positions to specific jobs
ALTER TABLE public.positions 
ADD COLUMN job_id UUID REFERENCES public.jobs(id);

-- Create index for better query performance
CREATE INDEX idx_positions_job_id ON public.positions(job_id);

-- Add comment for documentation
COMMENT ON COLUMN public.positions.job_id IS 'Direct link to the specific job this position is for. Different from job_family_id which links to a family/group of jobs.';