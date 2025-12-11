-- Create job_families table
CREATE TABLE public.job_families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Enable RLS
ALTER TABLE public.job_families ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view job families"
  ON public.job_families FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert job families"
  ON public.job_families FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update job families"
  ON public.job_families FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete job families"
  ON public.job_families FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add job_family_id to positions table
ALTER TABLE public.positions 
ADD COLUMN job_family_id UUID REFERENCES public.job_families(id);