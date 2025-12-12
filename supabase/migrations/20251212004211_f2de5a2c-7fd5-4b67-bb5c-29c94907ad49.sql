-- Create job_competencies junction table
CREATE TABLE public.job_competencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES public.competencies(id) ON DELETE CASCADE,
  competency_level_id UUID REFERENCES public.competency_levels(id) ON DELETE SET NULL,
  weighting NUMERIC NOT NULL DEFAULT 1 CHECK (weighting >= 0 AND weighting <= 100),
  is_required BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, competency_id)
);

-- Enable RLS
ALTER TABLE public.job_competencies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view job competencies"
  ON public.job_competencies FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert job competencies"
  ON public.job_competencies FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update job competencies"
  ON public.job_competencies FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete job competencies"
  ON public.job_competencies FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_job_competencies_updated_at
  BEFORE UPDATE ON public.job_competencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();