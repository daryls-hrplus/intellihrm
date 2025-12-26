-- Goal Rating Configurations (Company-level settings)
CREATE TABLE public.goal_rating_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.appraisal_cycles(id) ON DELETE SET NULL,
  
  -- Rating Scale Reference
  rating_scale_id UUID REFERENCES public.performance_rating_scales(id),
  
  -- Calculation Method
  calculation_method TEXT NOT NULL DEFAULT 'manager_entered' CHECK (calculation_method IN ('auto_calculated', 'manager_entered', 'weighted_average', 'calibrated')),
  
  -- Weight Configuration (percentages, should sum to 100)
  self_rating_weight NUMERIC(5,2) DEFAULT 0 CHECK (self_rating_weight >= 0 AND self_rating_weight <= 100),
  manager_rating_weight NUMERIC(5,2) DEFAULT 100 CHECK (manager_rating_weight >= 0 AND manager_rating_weight <= 100),
  progress_weight NUMERIC(5,2) DEFAULT 0 CHECK (progress_weight >= 0 AND progress_weight <= 100),
  
  -- Visibility Controls
  hide_ratings_until TEXT DEFAULT 'review_released' CHECK (hide_ratings_until IN ('immediately', 'manager_submitted', 'review_released', 'acknowledged')),
  show_manager_rating_to_employee BOOLEAN DEFAULT true,
  show_final_score_to_employee BOOLEAN DEFAULT true,
  
  -- Acknowledgment Settings
  requires_employee_acknowledgment BOOLEAN DEFAULT true,
  acknowledgment_deadline_days INTEGER DEFAULT 7,
  allow_dispute BOOLEAN DEFAULT true,
  dispute_window_days INTEGER DEFAULT 14,
  
  -- Auto-calculation Rules (JSONB for flexible configuration)
  auto_calc_rules JSONB DEFAULT '{}'::jsonb,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Goal Rating Submissions (Individual rating records)
CREATE TABLE public.goal_rating_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  rating_config_id UUID REFERENCES public.goal_rating_configurations(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Self Rating
  self_rating NUMERIC(5,2),
  self_rating_at TIMESTAMPTZ,
  self_comments TEXT,
  
  -- Manager Rating
  manager_rating NUMERIC(5,2),
  manager_id UUID REFERENCES public.profiles(id),
  manager_rating_at TIMESTAMPTZ,
  manager_comments TEXT,
  
  -- Calculated/Final Scores
  calculated_score NUMERIC(5,2),
  final_score NUMERIC(5,2),
  weight_adjusted_score NUMERIC(5,2),
  
  -- Status workflow
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'self_submitted', 'manager_submitted', 'released', 'acknowledged', 'disputed')),
  released_at TIMESTAMPTZ,
  released_by UUID REFERENCES public.profiles(id),
  
  -- Employee Acknowledgment
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledgment_comments TEXT,
  
  -- Dispute workflow
  is_disputed BOOLEAN DEFAULT false,
  disputed_at TIMESTAMPTZ,
  dispute_reason TEXT,
  dispute_category TEXT CHECK (dispute_category IN ('performance_not_reflected', 'progress_not_considered', 'factual_error', 'process_not_followed', 'bias_concern', 'other')),
  dispute_status TEXT CHECK (dispute_status IN ('open', 'under_review', 'resolved', 'rejected')),
  dispute_resolution TEXT,
  dispute_resolved_at TIMESTAMPTZ,
  dispute_resolved_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_goal_rating_configs_company ON public.goal_rating_configurations(company_id);
CREATE INDEX idx_goal_rating_configs_cycle ON public.goal_rating_configurations(cycle_id);
CREATE INDEX idx_goal_rating_configs_active ON public.goal_rating_configurations(company_id, is_active);

CREATE INDEX idx_goal_rating_submissions_goal ON public.goal_rating_submissions(goal_id);
CREATE INDEX idx_goal_rating_submissions_employee ON public.goal_rating_submissions(employee_id);
CREATE INDEX idx_goal_rating_submissions_manager ON public.goal_rating_submissions(manager_id);
CREATE INDEX idx_goal_rating_submissions_status ON public.goal_rating_submissions(status);
CREATE INDEX idx_goal_rating_submissions_company_status ON public.goal_rating_submissions(company_id, status);
CREATE INDEX idx_goal_rating_submissions_disputed ON public.goal_rating_submissions(company_id, is_disputed) WHERE is_disputed = true;

-- Triggers for updated_at
CREATE TRIGGER update_goal_rating_configurations_updated_at
  BEFORE UPDATE ON public.goal_rating_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_rating_submissions_updated_at
  BEFORE UPDATE ON public.goal_rating_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.goal_rating_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_rating_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_rating_configurations
CREATE POLICY "Users can view rating configs for their company"
  ON public.goal_rating_configurations FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

CREATE POLICY "HR and Admin can manage rating configs"
  ON public.goal_rating_configurations FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager']))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager']));

-- RLS Policies for goal_rating_submissions
CREATE POLICY "Employees can view their own rating submissions"
  ON public.goal_rating_submissions FOR SELECT
  USING (
    employee_id = auth.uid()
    OR manager_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

CREATE POLICY "Employees can create and update their self-ratings"
  ON public.goal_rating_submissions FOR INSERT
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update self-rating fields only"
  ON public.goal_rating_submissions FOR UPDATE
  USING (
    employee_id = auth.uid()
    OR manager_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

CREATE POLICY "Only HR/Admin can delete rating submissions"
  ON public.goal_rating_submissions FOR DELETE
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager']));