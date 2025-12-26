-- Create goal_quality_assessments table
CREATE TABLE public.goal_quality_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  has_metrics BOOLEAN DEFAULT false,
  has_smart_criteria BOOLEAN DEFAULT false,
  has_alignment BOOLEAN DEFAULT false,
  alignment_score INTEGER DEFAULT 0 CHECK (alignment_score >= 0 AND alignment_score <= 100),
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  quality_flags JSONB DEFAULT '[]'::jsonb,
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assessed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_workload_snapshots table
CREATE TABLE public.employee_workload_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  active_goal_count INTEGER DEFAULT 0,
  total_weighting DECIMAL(5,2) DEFAULT 0,
  overdue_count INTEGER DEFAULT 0,
  at_risk_count INTEGER DEFAULT 0,
  workload_score INTEGER DEFAULT 0,
  is_overloaded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, snapshot_date)
);

-- Create alignment_cascade_metrics table
CREATE TABLE public.alignment_cascade_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_goals INTEGER DEFAULT 0,
  aligned_goals INTEGER DEFAULT 0,
  orphan_goals INTEGER DEFAULT 0,
  alignment_percentage DECIMAL(5,2) DEFAULT 0,
  avg_cascade_depth DECIMAL(3,1) DEFAULT 0,
  broken_chains_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, department_id, snapshot_date)
);

-- Create indexes for performance
CREATE INDEX idx_goal_quality_assessments_goal_id ON public.goal_quality_assessments(goal_id);
CREATE INDEX idx_goal_quality_assessments_company_id ON public.goal_quality_assessments(company_id);
CREATE INDEX idx_goal_quality_assessments_quality_score ON public.goal_quality_assessments(quality_score);
CREATE INDEX idx_employee_workload_snapshots_employee_id ON public.employee_workload_snapshots(employee_id);
CREATE INDEX idx_employee_workload_snapshots_company_date ON public.employee_workload_snapshots(company_id, snapshot_date);
CREATE INDEX idx_employee_workload_snapshots_overloaded ON public.employee_workload_snapshots(is_overloaded) WHERE is_overloaded = true;
CREATE INDEX idx_alignment_cascade_metrics_company_id ON public.alignment_cascade_metrics(company_id);
CREATE INDEX idx_alignment_cascade_metrics_department_id ON public.alignment_cascade_metrics(department_id);

-- Enable RLS on all tables
ALTER TABLE public.goal_quality_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_workload_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alignment_cascade_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_quality_assessments
CREATE POLICY "Users can view goal quality assessments for their company"
  ON public.goal_quality_assessments
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "HR users can manage goal quality assessments"
  ON public.goal_quality_assessments
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'hr_director', 'hr_manager')
    )
  );

-- RLS Policies for employee_workload_snapshots
CREATE POLICY "Users can view workload snapshots for their company"
  ON public.employee_workload_snapshots
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "HR users can manage workload snapshots"
  ON public.employee_workload_snapshots
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'hr_director', 'hr_manager')
    )
  );

-- RLS Policies for alignment_cascade_metrics
CREATE POLICY "Users can view alignment metrics for their company"
  ON public.alignment_cascade_metrics
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "HR users can manage alignment metrics"
  ON public.alignment_cascade_metrics
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'hr_director', 'hr_manager')
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_goal_quality_assessments_updated_at
  BEFORE UPDATE ON public.goal_quality_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_workload_snapshots_updated_at
  BEFORE UPDATE ON public.employee_workload_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alignment_cascade_metrics_updated_at
  BEFORE UPDATE ON public.alignment_cascade_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();