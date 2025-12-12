-- Create job_responsibilities junction table
CREATE TABLE public.job_responsibilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  responsibility_id UUID NOT NULL REFERENCES public.responsibilities(id) ON DELETE CASCADE,
  weighting NUMERIC NOT NULL DEFAULT 0 CHECK (weighting >= 0 AND weighting <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, responsibility_id)
);

-- Enable RLS
ALTER TABLE public.job_responsibilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view job responsibilities"
  ON public.job_responsibilities FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert job responsibilities"
  ON public.job_responsibilities FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Admins can update job responsibilities"
  ON public.job_responsibilities FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Admins can delete job responsibilities"
  ON public.job_responsibilities FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_job_responsibilities_updated_at
  BEFORE UPDATE ON public.job_responsibilities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();