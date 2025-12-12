-- Create table to track competency gaps that need to be addressed
CREATE TABLE public.competency_gaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES public.competencies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  required_level_id UUID REFERENCES public.competency_levels(id) ON DELETE SET NULL,
  current_level_id UUID REFERENCES public.competency_levels(id) ON DELETE SET NULL,
  required_weighting NUMERIC DEFAULT 0,
  gap_score NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  action_plan TEXT,
  target_date DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, competency_id, job_id)
);

-- Enable RLS
ALTER TABLE public.competency_gaps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins and HR can manage all competency gaps"
ON public.competency_gaps
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Admins and HR can view all competency gaps"
ON public.competency_gaps
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can view own competency gaps"
ON public.competency_gaps
FOR SELECT
USING (auth.uid() = employee_id);

-- Trigger for updated_at
CREATE TRIGGER update_competency_gaps_updated_at
BEFORE UPDATE ON public.competency_gaps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for common queries
CREATE INDEX idx_competency_gaps_employee ON public.competency_gaps(employee_id);
CREATE INDEX idx_competency_gaps_status ON public.competency_gaps(status);
CREATE INDEX idx_competency_gaps_priority ON public.competency_gaps(priority);