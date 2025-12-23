-- ISO 42001 AI Governance Tables

-- 1. AI Risk Assessments - Track risk scores for AI interactions
CREATE TABLE public.ai_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_log_id UUID REFERENCES public.ai_interaction_logs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  user_id UUID REFERENCES auth.users(id),
  risk_category TEXT NOT NULL CHECK (risk_category IN ('data_privacy', 'bias', 'accuracy', 'legal', 'ethical', 'security', 'compliance')),
  risk_score DECIMAL(3,2) CHECK (risk_score >= 0 AND risk_score <= 1),
  risk_factors JSONB DEFAULT '[]',
  mitigation_applied TEXT[],
  human_review_required BOOLEAN DEFAULT false,
  human_review_completed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_outcome TEXT CHECK (review_outcome IN ('approved', 'modified', 'rejected', 'escalated')),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. AI Model Registry - Third-party model management for ISO 42001
CREATE TABLE public.ai_model_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_identifier TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  display_name TEXT NOT NULL,
  version TEXT,
  purpose TEXT NOT NULL,
  risk_classification TEXT DEFAULT 'medium' CHECK (risk_classification IN ('low', 'medium', 'high', 'critical')),
  approved_use_cases TEXT[],
  prohibited_use_cases TEXT[],
  data_retention_policy TEXT,
  last_audit_date DATE,
  next_audit_due DATE,
  audit_findings JSONB,
  compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('compliant', 'pending', 'non_compliant', 'under_review')),
  is_active BOOLEAN DEFAULT true,
  company_id UUID REFERENCES public.companies(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. AI Human Overrides - Track when humans modify AI outputs
CREATE TABLE public.ai_human_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_log_id UUID REFERENCES public.ai_interaction_logs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  original_ai_response TEXT NOT NULL,
  override_action TEXT NOT NULL CHECK (override_action IN ('modified', 'rejected', 'escalated', 'approved_with_changes')),
  modified_response TEXT,
  override_reason TEXT NOT NULL,
  justification_category TEXT CHECK (justification_category IN ('inaccurate', 'inappropriate', 'incomplete', 'policy_violation', 'bias_detected', 'security_concern', 'other')),
  overridden_by UUID REFERENCES public.profiles(id) NOT NULL,
  approved_by UUID REFERENCES public.profiles(id),
  approval_required BOOLEAN DEFAULT false,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. AI Bias Incidents - Log detected bias for investigation
CREATE TABLE public.ai_bias_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_log_id UUID REFERENCES public.ai_interaction_logs(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id),
  detection_method TEXT NOT NULL CHECK (detection_method IN ('automated', 'user_report', 'audit', 'review')),
  bias_type TEXT NOT NULL CHECK (bias_type IN ('gender', 'age', 'race', 'religion', 'disability', 'nationality', 'socioeconomic', 'other')),
  affected_characteristic TEXT,
  prompt_content TEXT,
  response_content TEXT,
  evidence_description TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  remediation_status TEXT DEFAULT 'open' CHECK (remediation_status IN ('open', 'investigating', 'remediated', 'false_positive', 'accepted_risk')),
  remediation_notes TEXT,
  remediation_actions JSONB DEFAULT '[]',
  reported_by UUID REFERENCES public.profiles(id),
  investigated_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. AI Explainability Logs - Audit trail for AI decisions
CREATE TABLE public.ai_explainability_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_log_id UUID REFERENCES public.ai_interaction_logs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  context_sources_used JSONB DEFAULT '[]',
  decision_factors JSONB DEFAULT '[]',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  uncertainty_areas TEXT[],
  citations JSONB DEFAULT '[]',
  explanation_generated TEXT,
  model_used TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. AI Governance Metrics - Aggregated metrics for dashboard
CREATE TABLE public.ai_governance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  metric_date DATE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('daily', 'weekly', 'monthly')),
  total_interactions INTEGER DEFAULT 0,
  high_risk_interactions INTEGER DEFAULT 0,
  human_reviews_required INTEGER DEFAULT 0,
  human_reviews_completed INTEGER DEFAULT 0,
  bias_incidents_detected INTEGER DEFAULT 0,
  overrides_count INTEGER DEFAULT 0,
  avg_risk_score DECIMAL(3,2),
  avg_confidence_score DECIMAL(3,2),
  compliance_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, metric_date, metric_type)
);

-- Enable RLS on all tables
ALTER TABLE public.ai_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_human_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_bias_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_explainability_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_governance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_risk_assessments
CREATE POLICY "Users can view their own risk assessments"
ON public.ai_risk_assessments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all risk assessments"
ON public.ai_risk_assessments FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "System can insert risk assessments"
ON public.ai_risk_assessments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Reviewers can update risk assessments"
ON public.ai_risk_assessments FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for ai_model_registry
CREATE POLICY "Anyone can view active models"
ON public.ai_model_registry FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage model registry"
ON public.ai_model_registry FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for ai_human_overrides
CREATE POLICY "Users can view their own overrides"
ON public.ai_human_overrides FOR SELECT
USING (overridden_by = auth.uid());

CREATE POLICY "Admins can view all overrides"
ON public.ai_human_overrides FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Authenticated users can create overrides"
ON public.ai_human_overrides FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update overrides"
ON public.ai_human_overrides FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for ai_bias_incidents
CREATE POLICY "Admins can view all bias incidents"
ON public.ai_bias_incidents FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Authenticated users can report bias"
ON public.ai_bias_incidents FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update bias incidents"
ON public.ai_bias_incidents FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for ai_explainability_logs
CREATE POLICY "Users can view explainability for their interactions"
ON public.ai_explainability_logs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.ai_interaction_logs 
  WHERE id = ai_explainability_logs.interaction_log_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Admins can view all explainability logs"
ON public.ai_explainability_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "System can insert explainability logs"
ON public.ai_explainability_logs FOR INSERT
WITH CHECK (true);

-- RLS Policies for ai_governance_metrics
CREATE POLICY "Admins can view governance metrics"
ON public.ai_governance_metrics FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "System can manage governance metrics"
ON public.ai_governance_metrics FOR ALL
USING (true);

-- Indexes for performance
CREATE INDEX idx_ai_risk_assessments_user ON public.ai_risk_assessments(user_id);
CREATE INDEX idx_ai_risk_assessments_score ON public.ai_risk_assessments(risk_score);
CREATE INDEX idx_ai_risk_assessments_review ON public.ai_risk_assessments(human_review_required, human_review_completed);
CREATE INDEX idx_ai_human_overrides_interaction ON public.ai_human_overrides(interaction_log_id);
CREATE INDEX idx_ai_bias_incidents_status ON public.ai_bias_incidents(remediation_status);
CREATE INDEX idx_ai_bias_incidents_severity ON public.ai_bias_incidents(severity);
CREATE INDEX idx_ai_explainability_logs_interaction ON public.ai_explainability_logs(interaction_log_id);
CREATE INDEX idx_ai_governance_metrics_date ON public.ai_governance_metrics(metric_date);
CREATE INDEX idx_ai_model_registry_status ON public.ai_model_registry(compliance_status);

-- Insert default model registry entries for Lovable AI models
INSERT INTO public.ai_model_registry (model_identifier, provider, display_name, version, purpose, risk_classification, approved_use_cases, prohibited_use_cases, compliance_status) VALUES
('google/gemini-2.5-flash', 'lovable_ai', 'Gemini 2.5 Flash', '2.5', 'general_chat', 'medium', 
  ARRAY['help_desk', 'document_analysis', 'report_generation', 'data_summarization'],
  ARRAY['compensation_decisions', 'termination_recommendations', 'legal_advice'],
  'compliant'),
('google/gemini-2.5-pro', 'lovable_ai', 'Gemini 2.5 Pro', '2.5', 'complex_reasoning', 'medium',
  ARRAY['policy_analysis', 'compliance_review', 'complex_queries'],
  ARRAY['autonomous_hr_decisions', 'legal_determinations'],
  'compliant'),
('openai/gpt-5-mini', 'lovable_ai', 'GPT-5 Mini', '5.0', 'balanced_performance', 'medium',
  ARRAY['help_desk', 'document_analysis', 'report_generation'],
  ARRAY['compensation_decisions', 'termination_recommendations'],
  'compliant');

-- Insert default guardrail configurations for ISO 42001
INSERT INTO public.ai_guardrails_config (guardrail_type, config_key, config_value, is_active) VALUES
('risk_assessment', 'high_risk_contexts', '["compensation_decisions", "termination_recommendations", "hiring_decisions", "performance_ratings", "disciplinary_actions"]', true),
('risk_assessment', 'auto_block_threshold', '0.8', true),
('risk_assessment', 'human_review_threshold', '0.6', true),
('bias_detection', 'protected_characteristics', '["age", "gender", "race", "religion", "disability", "nationality", "marital_status", "pregnancy", "sexual_orientation"]', true),
('bias_detection', 'flagged_patterns', '["too old", "young enough", "culture fit", "attitude problem", "not a good fit", "overqualified"]', true),
('human_oversight', 'mandatory_review_actions', '["compensation_change", "termination", "promotion", "demotion", "disciplinary", "hiring_decision"]', true),
('human_oversight', 'approval_required_contexts', '["hr_decisions", "legal_matters", "financial_impact", "employee_relations"]', true),
('transparency', 'citation_required', 'true', true),
('transparency', 'confidence_display', 'true', true),
('transparency', 'uncertainty_disclosure', 'true', true),
('transparency', 'explanation_required', 'true', true)
ON CONFLICT DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_ai_model_registry_updated_at
  BEFORE UPDATE ON public.ai_model_registry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_bias_incidents_updated_at
  BEFORE UPDATE ON public.ai_bias_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();