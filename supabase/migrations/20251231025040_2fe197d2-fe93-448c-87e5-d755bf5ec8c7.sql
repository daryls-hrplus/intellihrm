
-- Phase 7: AI Enhancements with ISO 42001 Compliance

-- 7.1 Review Quality Assessments
CREATE TABLE public.review_quality_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  quality_score DECIMAL(5,2) CHECK (quality_score >= 0 AND quality_score <= 100),
  consistency_score DECIMAL(5,2) CHECK (consistency_score >= 0 AND consistency_score <= 100),
  evidence_coverage_score DECIMAL(5,2) CHECK (evidence_coverage_score >= 0 AND evidence_coverage_score <= 100),
  bias_free_score DECIMAL(5,2) CHECK (bias_free_score >= 0 AND bias_free_score <= 100),
  issues JSONB DEFAULT '[]'::jsonb,
  clarifying_prompts JSONB DEFAULT '[]'::jsonb,
  is_ready_for_submission BOOLEAN DEFAULT FALSE,
  ai_model_used TEXT,
  ai_confidence_score DECIMAL(3,2),
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7.2 Manager Bias Patterns
CREATE TABLE public.manager_bias_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.appraisal_cycles(id) ON DELETE SET NULL,
  bias_type TEXT NOT NULL CHECK (bias_type IN ('recency', 'leniency', 'severity', 'halo', 'horn', 'central_tendency', 'contrast')),
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  evidence_count INT DEFAULT 0,
  affected_employees JSONB DEFAULT '[]'::jsonb,
  detection_method TEXT,
  detection_confidence DECIMAL(3,2),
  nudge_message TEXT,
  nudge_shown_at TIMESTAMPTZ,
  nudge_acknowledged BOOLEAN DEFAULT FALSE,
  nudge_disputed BOOLEAN DEFAULT FALSE,
  dispute_reason TEXT,
  iso_compliance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7.2 Bias Nudge Templates
CREATE TABLE public.bias_nudge_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  bias_type TEXT NOT NULL CHECK (bias_type IN ('recency', 'leniency', 'severity', 'halo', 'horn', 'central_tendency', 'contrast')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  nudge_title TEXT NOT NULL,
  nudge_message TEXT NOT NULL,
  suggested_action TEXT,
  educational_content TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7.3 AI Generated Narratives
CREATE TABLE public.ai_generated_narratives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  narrative_type TEXT NOT NULL CHECK (narrative_type IN ('performance_summary', 'promotion', 'development', 'calibration', 'pip')),
  generated_content TEXT NOT NULL,
  source_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  manager_edited_content TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  ai_model_used TEXT,
  ai_confidence_score DECIMAL(3,2),
  iso_human_review_status TEXT DEFAULT 'pending' CHECK (iso_human_review_status IN ('pending', 'reviewed', 'approved', 'rejected')),
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7.4 Continuous Performance Signals
CREATE TABLE public.continuous_performance_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('goal_progress', 'feedback', 'training', 'recognition', 'check_in', 'project', 'skill_validation')),
  signal_source_id UUID,
  signal_source_table TEXT,
  signal_value DECIMAL(5,2) CHECK (signal_value >= 0 AND signal_value <= 100),
  signal_sentiment TEXT CHECK (signal_sentiment IN ('positive', 'neutral', 'negative')),
  signal_weight DECIMAL(3,2) DEFAULT 1.0,
  signal_metadata JSONB DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ DEFAULT now()
);

-- 7.4 Performance Trajectory Scores
CREATE TABLE public.performance_trajectory_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  trajectory_score DECIMAL(5,2) CHECK (trajectory_score >= 0 AND trajectory_score <= 100),
  momentum TEXT CHECK (momentum IN ('accelerating', 'stable', 'decelerating')),
  trend_direction TEXT CHECK (trend_direction IN ('improving', 'stable', 'declining')),
  contributing_factors JSONB DEFAULT '[]'::jsonb,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  intervention_recommended BOOLEAN DEFAULT FALSE,
  intervention_type TEXT CHECK (intervention_type IN ('coaching', 'recognition', 'support', 'pip', 'check_in')),
  ai_explainability_id UUID,
  data_freshness_days INT,
  minimum_signals_met BOOLEAN DEFAULT TRUE,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7.4 Manager Intervention Prompts
CREATE TABLE public.manager_intervention_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('coaching', 'recognition', 'check_in', 'concern', 'celebration')),
  prompt_title TEXT NOT NULL,
  prompt_message TEXT NOT NULL,
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  trigger_source TEXT,
  is_dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  is_actioned BOOLEAN DEFAULT FALSE,
  actioned_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7.5 Competency Drift Analysis
CREATE TABLE public.competency_drift_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  competency_id UUID REFERENCES public.competencies(id) ON DELETE SET NULL,
  skill_id UUID,
  drift_type TEXT NOT NULL CHECK (drift_type IN ('declining_relevance', 'emerging_importance', 'rating_pattern', 'skill_gap')),
  avg_rating_trend DECIMAL(5,2),
  trend_period_months INT DEFAULT 12,
  affected_job_profiles_count INT DEFAULT 0,
  affected_employees_count INT DEFAULT 0,
  recommendation TEXT CHECK (recommendation IN ('update_profile', 'add_skill', 'retire_competency', 'investigate', 'no_action')),
  recommendation_details JSONB DEFAULT '{}'::jsonb,
  confidence_score DECIMAL(3,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  action_notes TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT now()
);

-- 7.5 Emerging Skills Signals
CREATE TABLE public.emerging_skills_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  detection_source TEXT NOT NULL CHECK (detection_source IN ('goal_keywords', 'training_completions', 'feedback_mentions', 'job_postings', 'industry_trends')),
  mention_count INT DEFAULT 0,
  growth_rate DECIMAL(5,2),
  first_detected_at TIMESTAMPTZ DEFAULT now(),
  suggested_competency_mapping UUID REFERENCES public.competencies(id),
  is_validated BOOLEAN DEFAULT FALSE,
  validated_by UUID REFERENCES public.profiles(id),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7.6 AI Explainability Records (Enhanced)
CREATE TABLE public.ai_explainability_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('trajectory', 'bias', 'drift', 'narrative', 'recommendation', 'quality', 'calibration')),
  insight_id UUID,
  insight_table TEXT,
  source_data_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  weights_applied JSONB DEFAULT '[]'::jsonb,
  confidence_score DECIMAL(3,2) NOT NULL,
  confidence_factors JSONB DEFAULT '[]'::jsonb,
  model_version TEXT NOT NULL,
  model_provider TEXT,
  data_freshness_days INT,
  limitations TEXT[] DEFAULT '{}',
  iso_compliance_verified BOOLEAN DEFAULT FALSE,
  human_review_required BOOLEAN DEFAULT FALSE,
  human_reviewed_at TIMESTAMPTZ,
  human_reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7.7 Calibration Governance Rules
CREATE TABLE public.calibration_governance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('recalibration_permission', 'change_limit', 'justification_required', 'approval_required', 'distribution_exception')),
  condition_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  applies_to_roles TEXT[] DEFAULT '{}',
  max_score_change DECIMAL(3,2),
  requires_justification BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,
  approval_roles TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7.7 Calibration Override Audit
CREATE TABLE public.calibration_override_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.calibration_sessions(id) ON DELETE CASCADE,
  adjustment_id UUID REFERENCES public.calibration_adjustments(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.profiles(id),
  override_type TEXT NOT NULL CHECK (override_type IN ('score_change', 'category_change', 'distribution_exception', 'force_rating', 'bypass_rule')),
  original_value TEXT,
  new_value TEXT,
  change_magnitude DECIMAL(5,2),
  justification TEXT NOT NULL,
  justification_category TEXT CHECK (justification_category IN ('business_context', 'data_correction', 'manager_input', 'calibration_committee', 'other')),
  supporting_evidence JSONB DEFAULT '{}'::jsonb,
  governance_rule_id UUID REFERENCES public.calibration_governance_rules(id),
  override_by UUID NOT NULL REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'auto_approved')),
  approval_notes TEXT,
  approved_at TIMESTAMPTZ,
  iso_compliance_flag BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.review_quality_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_bias_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bias_nudge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.continuous_performance_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_trajectory_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_intervention_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_drift_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emerging_skills_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_explainability_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_governance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_override_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review_quality_assessments
CREATE POLICY "Users can view review quality for their company"
  ON public.review_quality_assessments FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage review quality assessments"
  ON public.review_quality_assessments FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for manager_bias_patterns
CREATE POLICY "Managers can view their own bias patterns"
  ON public.manager_bias_patterns FOR SELECT
  USING (manager_id = auth.uid() OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage bias patterns"
  ON public.manager_bias_patterns FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for bias_nudge_templates
CREATE POLICY "Users can view bias nudge templates"
  ON public.bias_nudge_templates FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR company_id IS NULL);

CREATE POLICY "HR can manage bias nudge templates"
  ON public.bias_nudge_templates FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for ai_generated_narratives
CREATE POLICY "Users can view narratives for their reviews"
  ON public.ai_generated_narratives FOR SELECT
  USING (employee_id = auth.uid() OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage narratives"
  ON public.ai_generated_narratives FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for continuous_performance_signals
CREATE POLICY "Employees can view their own signals"
  ON public.continuous_performance_signals FOR SELECT
  USING (employee_id = auth.uid() OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can insert signals"
  ON public.continuous_performance_signals FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for performance_trajectory_scores
CREATE POLICY "Employees can view their trajectory"
  ON public.performance_trajectory_scores FOR SELECT
  USING (employee_id = auth.uid() OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can manage trajectory scores"
  ON public.performance_trajectory_scores FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for manager_intervention_prompts
CREATE POLICY "Managers can view their prompts"
  ON public.manager_intervention_prompts FOR SELECT
  USING (manager_id = auth.uid() OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Managers can update their prompts"
  ON public.manager_intervention_prompts FOR UPDATE
  USING (manager_id = auth.uid());

CREATE POLICY "System can create prompts"
  ON public.manager_intervention_prompts FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for competency_drift_analysis
CREATE POLICY "HR can view drift analysis"
  ON public.competency_drift_analysis FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage drift analysis"
  ON public.competency_drift_analysis FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for emerging_skills_signals
CREATE POLICY "HR can view emerging skills"
  ON public.emerging_skills_signals FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage emerging skills"
  ON public.emerging_skills_signals FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for ai_explainability_records
CREATE POLICY "Users can view explainability records"
  ON public.ai_explainability_records FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can manage explainability records"
  ON public.ai_explainability_records FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for calibration_governance_rules
CREATE POLICY "Users can view governance rules"
  ON public.calibration_governance_rules FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage governance rules"
  ON public.calibration_governance_rules FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for calibration_override_audit
CREATE POLICY "Users can view override audit"
  ON public.calibration_override_audit FOR SELECT
  USING (session_id IN (SELECT id FROM public.calibration_sessions WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "HR can manage override audit"
  ON public.calibration_override_audit FOR ALL
  USING (session_id IN (SELECT id FROM public.calibration_sessions WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

-- Indexes for performance
CREATE INDEX idx_review_quality_participant ON public.review_quality_assessments(participant_id);
CREATE INDEX idx_review_quality_company ON public.review_quality_assessments(company_id);
CREATE INDEX idx_manager_bias_manager ON public.manager_bias_patterns(manager_id);
CREATE INDEX idx_manager_bias_company ON public.manager_bias_patterns(company_id);
CREATE INDEX idx_narratives_employee ON public.ai_generated_narratives(employee_id);
CREATE INDEX idx_narratives_participant ON public.ai_generated_narratives(participant_id);
CREATE INDEX idx_signals_employee ON public.continuous_performance_signals(employee_id);
CREATE INDEX idx_signals_company_type ON public.continuous_performance_signals(company_id, signal_type);
CREATE INDEX idx_trajectory_employee ON public.performance_trajectory_scores(employee_id);
CREATE INDEX idx_trajectory_risk ON public.performance_trajectory_scores(company_id, risk_level);
CREATE INDEX idx_intervention_manager ON public.manager_intervention_prompts(manager_id);
CREATE INDEX idx_intervention_priority ON public.manager_intervention_prompts(priority, is_actioned);
CREATE INDEX idx_drift_company ON public.competency_drift_analysis(company_id, status);
CREATE INDEX idx_emerging_skills_company ON public.emerging_skills_signals(company_id);
CREATE INDEX idx_explainability_insight ON public.ai_explainability_records(insight_type, insight_id);
CREATE INDEX idx_governance_rules_company ON public.calibration_governance_rules(company_id, is_active);
CREATE INDEX idx_override_audit_session ON public.calibration_override_audit(session_id);

-- Insert default bias nudge templates
INSERT INTO public.bias_nudge_templates (company_id, bias_type, severity, nudge_title, nudge_message, suggested_action, educational_content) VALUES
(NULL, 'recency', 'low', 'Consider the Full Review Period', 'Your recent ratings may reflect events from the past few weeks more than the full review period. Consider the employee''s performance across all months.', 'Review early-period accomplishments and challenges', 'Recency bias occurs when recent events influence ratings more than earlier performance. A balanced review considers the entire evaluation period.'),
(NULL, 'recency', 'medium', 'Recent Events May Be Overweighted', 'Analysis suggests recent performance events are significantly influencing your ratings. Ensure your evaluation reflects the complete review period.', 'Document specific achievements from each quarter', 'Strong ratings should be supported by evidence from throughout the review period, not just recent weeks.'),
(NULL, 'leniency', 'low', 'Rating Distribution Check', 'Your ratings trend higher than the team average. This is just informational - ensure each rating reflects individual performance accurately.', 'Compare ratings to documented evidence', 'Fair evaluation means some employees will rate higher and some lower based on actual performance differences.'),
(NULL, 'leniency', 'medium', 'Consider Full Rating Scale', 'Most of your ratings are in the top categories. Review if this accurately reflects individual performance differences across your team.', 'Identify specific differentiators between top and strong performers', 'Using the full rating scale helps employees understand where they truly excel and where they can grow.'),
(NULL, 'severity', 'low', 'Rating Distribution Check', 'Your ratings trend lower than average. This is informational - ensure ratings reflect actual performance with supporting evidence.', 'Document specific examples supporting each rating', 'Fair ratings require clear evidence of performance levels.'),
(NULL, 'central_tendency', 'low', 'Consider Performance Differences', 'Most ratings cluster around the middle. Consider if there are meaningful performance differences that should be reflected.', 'Identify top performers and those needing development', 'Differentiating performance helps employees understand their standing and growth opportunities.'),
(NULL, 'halo', 'low', 'Review Individual Competencies', 'Strong performance in one area may be influencing ratings in other competencies. Evaluate each dimension independently.', 'Assess each competency with specific examples', 'The halo effect occurs when excellence in one area creates a positive impression across all areas.'),
(NULL, 'horn', 'low', 'Review Individual Competencies', 'A challenge in one area may be influencing ratings in other competencies. Evaluate each dimension independently.', 'Assess each competency with specific examples', 'The horn effect occurs when difficulty in one area creates a negative impression across all areas.'),
(NULL, 'contrast', 'low', 'Independent Evaluation Reminder', 'Each employee should be evaluated against role expectations, not compared to the previous review you completed.', 'Focus on role-specific criteria for each review', 'Contrast bias occurs when sequential reviews influence each other rather than being evaluated independently.');
