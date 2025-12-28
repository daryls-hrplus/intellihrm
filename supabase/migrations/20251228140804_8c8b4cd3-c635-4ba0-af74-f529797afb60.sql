-- Create job_skill_overrides table for optional job-specific skill level overrides
CREATE TABLE public.job_skill_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  competency_requirement_id UUID NOT NULL REFERENCES public.job_capability_requirements(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills_competencies(id) ON DELETE CASCADE,
  override_proficiency_level INTEGER NOT NULL CHECK (override_proficiency_level >= 1 AND override_proficiency_level <= 5),
  override_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_job_skill_override UNIQUE (job_id, competency_requirement_id, skill_id)
);

-- Add comment explaining the table purpose
COMMENT ON TABLE public.job_skill_overrides IS 'Stores job-specific skill proficiency level overrides when a job requires a different skill level than the baseline defined in competency_skill_mappings';

-- Enable RLS
ALTER TABLE public.job_skill_overrides ENABLE ROW LEVEL SECURITY;

-- Create policies for job_skill_overrides
CREATE POLICY "Users can view job skill overrides"
  ON public.job_skill_overrides
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert job skill overrides"
  ON public.job_skill_overrides
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update job skill overrides"
  ON public.job_skill_overrides
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete job skill overrides"
  ON public.job_skill_overrides
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_job_skill_overrides_updated_at
  BEFORE UPDATE ON public.job_skill_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_job_skill_overrides_job_id ON public.job_skill_overrides(job_id);
CREATE INDEX idx_job_skill_overrides_competency_req ON public.job_skill_overrides(competency_requirement_id);