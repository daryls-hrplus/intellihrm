-- Create job_capability_requirements table to link jobs with skills_competencies
CREATE TABLE public.job_capability_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES public.skills_competencies(id) ON DELETE CASCADE,
  required_proficiency_level INTEGER NOT NULL DEFAULT 3 CHECK (required_proficiency_level >= 1 AND required_proficiency_level <= 5),
  weighting NUMERIC(5,2) DEFAULT 10 CHECK (weighting >= 0 AND weighting <= 100),
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_preferred BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT job_capability_no_overlap EXCLUDE USING gist (
    job_id WITH =,
    capability_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  )
);

-- Add comments
COMMENT ON TABLE public.job_capability_requirements IS 'Links jobs to required skills/competencies from the capability platform';
COMMENT ON COLUMN public.job_capability_requirements.required_proficiency_level IS 'Required proficiency level 1-5 (Novice to Expert)';
COMMENT ON COLUMN public.job_capability_requirements.weighting IS 'Importance weight as percentage (0-100)';

-- Create indexes
CREATE INDEX idx_job_capability_requirements_job ON public.job_capability_requirements(job_id);
CREATE INDEX idx_job_capability_requirements_capability ON public.job_capability_requirements(capability_id);
CREATE INDEX idx_job_capability_requirements_active ON public.job_capability_requirements(job_id) 
  WHERE end_date IS NULL;

-- Enable RLS
ALTER TABLE public.job_capability_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to view job capability requirements"
  ON public.job_capability_requirements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert job capability requirements"
  ON public.job_capability_requirements FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update job capability requirements"
  ON public.job_capability_requirements FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete job capability requirements"
  ON public.job_capability_requirements FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_job_capability_requirements_updated_at
  BEFORE UPDATE ON public.job_capability_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_capability_requirements;