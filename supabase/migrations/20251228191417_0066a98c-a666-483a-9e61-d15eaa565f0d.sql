-- Create job_responsibility_kras table for job-specific KRA contextualization
CREATE TABLE public.job_responsibility_kras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_responsibility_id UUID NOT NULL REFERENCES public.job_responsibilities(id) ON DELETE CASCADE,
  responsibility_kra_id UUID REFERENCES public.responsibility_kras(id) ON DELETE SET NULL,
  
  -- KRA details (can be inherited or customized)
  name TEXT NOT NULL,
  job_specific_target TEXT,
  measurement_method TEXT,
  weight NUMERIC(5,2) DEFAULT 0,
  
  -- Inheritance tracking
  is_inherited BOOLEAN DEFAULT true,
  inherited_at TIMESTAMPTZ DEFAULT now(),
  customized_at TIMESTAMPTZ,
  customized_by UUID REFERENCES auth.users(id),
  
  -- AI generation tracking
  ai_generated BOOLEAN DEFAULT false,
  ai_source TEXT,
  
  sequence_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_job_resp_kra UNIQUE (job_responsibility_id, responsibility_kra_id)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_job_responsibility_kras_job_resp_id ON public.job_responsibility_kras(job_responsibility_id);
CREATE INDEX idx_job_responsibility_kras_resp_kra_id ON public.job_responsibility_kras(responsibility_kra_id);

-- Enable RLS
ALTER TABLE public.job_responsibility_kras ENABLE ROW LEVEL SECURITY;

-- RLS policy for authenticated users to manage job responsibility KRAs for their company
CREATE POLICY "Users can view job responsibility KRAs for their company" 
ON public.job_responsibility_kras 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.job_responsibilities jr
    JOIN public.jobs j ON jr.job_id = j.id
    WHERE jr.id = job_responsibility_kras.job_responsibility_id
    AND j.company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert job responsibility KRAs for their company" 
ON public.job_responsibility_kras 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.job_responsibilities jr
    JOIN public.jobs j ON jr.job_id = j.id
    WHERE jr.id = job_responsibility_kras.job_responsibility_id
    AND j.company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update job responsibility KRAs for their company" 
ON public.job_responsibility_kras 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.job_responsibilities jr
    JOIN public.jobs j ON jr.job_id = j.id
    WHERE jr.id = job_responsibility_kras.job_responsibility_id
    AND j.company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete job responsibility KRAs for their company" 
ON public.job_responsibility_kras 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.job_responsibilities jr
    JOIN public.jobs j ON jr.job_id = j.id
    WHERE jr.id = job_responsibility_kras.job_responsibility_id
    AND j.company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_job_responsibility_kras_updated_at
  BEFORE UPDATE ON public.job_responsibility_kras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();