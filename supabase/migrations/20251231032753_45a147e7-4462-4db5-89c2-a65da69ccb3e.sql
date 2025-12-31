-- Manager Capability Guardrails - Phase 8 Implementation
-- ISO 42001 Compliant Manager Effectiveness Tracking

-- Table 1: Manager Capability Metrics (aggregate per cycle)
CREATE TABLE public.manager_capability_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES public.profiles(id) NOT NULL,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  cycle_id UUID REFERENCES public.appraisal_cycles(id),
  
  -- Completion Timeliness
  total_reviews_assigned INT DEFAULT 0,
  reviews_completed INT DEFAULT 0,
  reviews_on_time INT DEFAULT 0,
  reviews_late INT DEFAULT 0,
  avg_days_before_deadline DECIMAL(5,2),
  timeliness_score DECIMAL(5,2),
  
  -- Comment Quality
  avg_comment_length INT,
  avg_comment_depth_score DECIMAL(5,2),
  comments_with_examples INT DEFAULT 0,
  comments_with_evidence INT DEFAULT 0,
  comment_quality_score DECIMAL(5,2),
  
  -- Score Variance
  avg_score_given DECIMAL(3,2),
  score_std_deviation DECIMAL(3,2),
  score_distribution JSONB DEFAULT '{}',
  differentiation_score DECIMAL(5,2),
  
  -- Calibration Alignment
  pre_calibration_avg DECIMAL(3,2),
  post_calibration_avg DECIMAL(3,2),
  calibration_adjustment_rate DECIMAL(5,2),
  calibration_alignment_score DECIMAL(5,2),
  
  -- Overall Metrics
  overall_capability_score DECIMAL(5,2),
  capability_trend TEXT CHECK (capability_trend IN ('improving', 'stable', 'declining')),
  
  -- ISO 42001 Explainability
  ai_explainability_id UUID REFERENCES public.ai_explainability_records(id),
  calculation_details JSONB DEFAULT '{}',
  
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(manager_id, cycle_id)
);

-- Table 2: Manager HR Flags (HR-only visibility)
CREATE TABLE public.manager_hr_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES public.profiles(id) NOT NULL,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  cycle_id UUID REFERENCES public.appraisal_cycles(id),
  
  flag_type TEXT NOT NULL CHECK (flag_type IN (
    'poor_timeliness', 'chronic_lateness', 'low_comment_quality', 
    'superficial_comments', 'extreme_leniency', 'extreme_severity',
    'calibration_drift', 'consistent_inflation', 'training_needed'
  )),
  flag_severity TEXT DEFAULT 'medium' CHECK (flag_severity IN ('low', 'medium', 'high', 'critical')),
  flag_title TEXT NOT NULL,
  flag_description TEXT NOT NULL,
  
  evidence_data JSONB DEFAULT '{}',
  affected_employees_count INT DEFAULT 0,
  
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMPTZ,
  action_plan TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  
  is_visible_to_manager BOOLEAN DEFAULT FALSE,
  visibility_changed_by UUID REFERENCES public.profiles(id),
  visibility_changed_at TIMESTAMPTZ,
  
  ai_explainability_id UUID REFERENCES public.ai_explainability_records(id),
  human_review_required BOOLEAN DEFAULT TRUE,
  human_reviewed_by UUID REFERENCES public.profiles(id),
  human_reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table 3: Manager Comment Analysis
CREATE TABLE public.manager_comment_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES public.profiles(id) NOT NULL,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  participant_id UUID REFERENCES public.appraisal_participants(id),
  cycle_id UUID REFERENCES public.appraisal_cycles(id),
  
  comment_text TEXT,
  comment_type TEXT,
  comment_length INT,
  word_count INT,
  
  depth_score DECIMAL(5,2),
  specificity_score DECIMAL(5,2),
  actionability_score DECIMAL(5,2),
  overall_quality_score DECIMAL(5,2),
  
  evidence_present BOOLEAN DEFAULT FALSE,
  examples_present BOOLEAN DEFAULT FALSE,
  forward_looking BOOLEAN DEFAULT FALSE,
  balanced_feedback BOOLEAN DEFAULT FALSE,
  
  issues_detected JSONB DEFAULT '[]',
  improvement_suggestions JSONB DEFAULT '[]',
  
  ai_model_used TEXT,
  ai_confidence_score DECIMAL(5,2),
  ai_explainability_id UUID REFERENCES public.ai_explainability_records(id),
  
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table 4: Manager Calibration Alignment
CREATE TABLE public.manager_calibration_alignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES public.profiles(id) NOT NULL,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  session_id UUID REFERENCES public.calibration_sessions(id),
  cycle_id UUID REFERENCES public.appraisal_cycles(id),
  
  employees_reviewed INT DEFAULT 0,
  scores_unchanged INT DEFAULT 0,
  scores_increased INT DEFAULT 0,
  scores_decreased INT DEFAULT 0,
  avg_adjustment DECIMAL(3,2),
  max_adjustment DECIMAL(3,2),
  
  alignment_score DECIMAL(5,2),
  drift_pattern TEXT CHECK (drift_pattern IN ('consistently_high', 'consistently_low', 'variable', 'aligned')),
  
  consecutive_drift_cycles INT DEFAULT 0,
  historical_alignment_avg DECIMAL(5,2),
  
  training_recommended BOOLEAN DEFAULT FALSE,
  recommended_interventions JSONB DEFAULT '[]',
  
  ai_explainability_id UUID REFERENCES public.ai_explainability_records(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(manager_id, session_id)
);

-- Enable RLS
ALTER TABLE public.manager_capability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_hr_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_comment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_calibration_alignment ENABLE ROW LEVEL SECURITY;

-- RLS for manager_capability_metrics
CREATE POLICY "HR admins can view all manager capability metrics"
  ON public.manager_capability_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('hr_admin', 'super_admin', 'admin')
    )
  );

CREATE POLICY "Managers can view own capability metrics"
  ON public.manager_capability_metrics FOR SELECT
  USING (manager_id = auth.uid());

CREATE POLICY "HR admins can manage capability metrics"
  ON public.manager_capability_metrics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('hr_admin', 'super_admin', 'admin')
    )
  );

-- RLS for manager_hr_flags (HR-ONLY)
CREATE POLICY "Only HR admins can view HR flags"
  ON public.manager_hr_flags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('hr_admin', 'super_admin', 'admin')
    )
  );

CREATE POLICY "Only HR admins can manage HR flags"
  ON public.manager_hr_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('hr_admin', 'super_admin', 'admin')
    )
  );

-- RLS for manager_comment_analysis
CREATE POLICY "HR admins can view all comment analysis"
  ON public.manager_comment_analysis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('hr_admin', 'super_admin', 'admin')
    )
  );

CREATE POLICY "Managers can view own comment analysis"
  ON public.manager_comment_analysis FOR SELECT
  USING (manager_id = auth.uid());

CREATE POLICY "HR admins can manage comment analysis"
  ON public.manager_comment_analysis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('hr_admin', 'super_admin', 'admin')
    )
  );

-- RLS for manager_calibration_alignment
CREATE POLICY "HR admins can view all calibration alignment"
  ON public.manager_calibration_alignment FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('hr_admin', 'super_admin', 'admin')
    )
  );

CREATE POLICY "Managers can view own calibration alignment"
  ON public.manager_calibration_alignment FOR SELECT
  USING (manager_id = auth.uid());

CREATE POLICY "HR admins can manage calibration alignment"
  ON public.manager_calibration_alignment FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('hr_admin', 'super_admin', 'admin')
    )
  );

-- Indexes
CREATE INDEX idx_manager_capability_metrics_manager ON public.manager_capability_metrics(manager_id);
CREATE INDEX idx_manager_capability_metrics_company_cycle ON public.manager_capability_metrics(company_id, cycle_id);
CREATE INDEX idx_manager_hr_flags_manager ON public.manager_hr_flags(manager_id);
CREATE INDEX idx_manager_hr_flags_company ON public.manager_hr_flags(company_id);
CREATE INDEX idx_manager_hr_flags_unresolved ON public.manager_hr_flags(company_id) WHERE is_resolved = FALSE;
CREATE INDEX idx_manager_comment_analysis_manager ON public.manager_comment_analysis(manager_id);
CREATE INDEX idx_manager_comment_analysis_participant ON public.manager_comment_analysis(participant_id);
CREATE INDEX idx_manager_calibration_alignment_manager ON public.manager_calibration_alignment(manager_id);
CREATE INDEX idx_manager_calibration_alignment_session ON public.manager_calibration_alignment(session_id);

-- Triggers for updated_at
CREATE TRIGGER update_manager_capability_metrics_updated_at
  BEFORE UPDATE ON public.manager_capability_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manager_hr_flags_updated_at
  BEFORE UPDATE ON public.manager_hr_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manager_calibration_alignment_updated_at
  BEFORE UPDATE ON public.manager_calibration_alignment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();