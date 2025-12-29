-- Create job_level_expectations table for simplified level standards
CREATE TABLE public.job_level_expectations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_level VARCHAR(50) NOT NULL,
  job_grade VARCHAR(50) NOT NULL,
  min_competency_score NUMERIC(3,2) DEFAULT 3.0,
  min_goal_achievement_percent NUMERIC(5,2) DEFAULT 80.0,
  progression_criteria TEXT,
  progression_criteria_en TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(company_id, job_level, job_grade, effective_from)
);

-- Enable RLS
ALTER TABLE public.job_level_expectations ENABLE ROW LEVEL SECURITY;

-- RLS policies using user_roles table
CREATE POLICY "Users can view job level expectations for their company"
  ON public.job_level_expectations
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "HR/Admin can manage job level expectations"
  ON public.job_level_expectations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'system_admin', 'enablement_admin')
    )
    AND company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Index for faster lookups
CREATE INDEX idx_job_level_expectations_company ON public.job_level_expectations(company_id);
CREATE INDEX idx_job_level_expectations_level_grade ON public.job_level_expectations(job_level, job_grade);

-- Trigger for updated_at
CREATE TRIGGER update_job_level_expectations_updated_at
  BEFORE UPDATE ON public.job_level_expectations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();