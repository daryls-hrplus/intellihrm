
-- D6: Governance & Trust Layer
-- Phase D, Week 17 - Compliance Foundation

-- 360 Feedback-specific consent tracking
CREATE TABLE feedback_consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES feedback_360_cycles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'participation', 'data_processing', 'ai_analysis', 
    'external_sharing', 'signal_generation', 'report_distribution'
  )),
  consent_given BOOLEAN NOT NULL,
  consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  consent_version TEXT NOT NULL DEFAULT '1.0',
  consent_text_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  withdrawal_reason TEXT,
  UNIQUE(employee_id, cycle_id, consent_type)
);

-- Data retention and usage policies
CREATE TABLE feedback_data_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  policy_type TEXT NOT NULL CHECK (policy_type IN (
    'retention', 'anonymization', 'ai_usage', 'external_access',
    'signal_aggregation', 'cross_module_sharing'
  )),
  policy_config JSONB NOT NULL,
  effective_from DATE NOT NULL,
  effective_until DATE,
  approved_by UUID REFERENCES profiles(id),
  approval_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI action logs specific to 360 feedback
CREATE TABLE feedback_ai_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id),
  cycle_id UUID REFERENCES feedback_360_cycles(id),
  company_id UUID REFERENCES companies(id),
  action_type TEXT NOT NULL CHECK (action_type IN (
    'bias_detection', 'writing_suggestion', 'signal_extraction',
    'theme_clustering', 'sentiment_analysis', 'readiness_scoring'
  )),
  input_summary JSONB NOT NULL,
  output_summary JSONB NOT NULL,
  model_used TEXT,
  model_version TEXT,
  confidence_score NUMERIC CHECK (confidence_score BETWEEN 0 AND 1),
  explanation TEXT NOT NULL,
  human_override BOOLEAN DEFAULT false,
  override_by UUID REFERENCES profiles(id),
  override_reason TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Exception/override management
CREATE TABLE feedback_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES feedback_360_cycles(id),
  employee_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  exception_type TEXT NOT NULL CHECK (exception_type IN (
    'anonymity_bypass', 'deadline_extension', 'rater_exclusion',
    'report_access_override', 'ai_opt_out', 'signal_suppression'
  )),
  reason TEXT NOT NULL,
  supporting_evidence TEXT,
  requested_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approval_timestamp TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE feedback_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_data_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_ai_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_exceptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback_consent_records
CREATE POLICY "Employees view own consent" ON feedback_consent_records
  FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "HR manages consent" ON feedback_consent_records
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr_manager')
  ));

-- RLS Policies for feedback_data_policies
CREATE POLICY "Authenticated users view policies" ON feedback_data_policies
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "HR manages policies" ON feedback_data_policies
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr_manager')
  ));

-- RLS Policies for feedback_ai_action_logs
CREATE POLICY "Employees view own AI actions" ON feedback_ai_action_logs
  FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "HR views all AI actions" ON feedback_ai_action_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr_manager')
  ));
CREATE POLICY "System inserts AI actions" ON feedback_ai_action_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for feedback_exceptions
CREATE POLICY "Employees view own exceptions" ON feedback_exceptions
  FOR SELECT USING (employee_id = auth.uid() OR requested_by = auth.uid());
CREATE POLICY "HR manages exceptions" ON feedback_exceptions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr_manager')
  ));

-- Indexes for performance
CREATE INDEX idx_feedback_consent_employee_cycle ON feedback_consent_records(employee_id, cycle_id);
CREATE INDEX idx_feedback_consent_company ON feedback_consent_records(company_id);
CREATE INDEX idx_feedback_policies_company_active ON feedback_data_policies(company_id, is_active);
CREATE INDEX idx_feedback_ai_logs_employee ON feedback_ai_action_logs(employee_id);
CREATE INDEX idx_feedback_ai_logs_cycle ON feedback_ai_action_logs(cycle_id);
CREATE INDEX idx_feedback_exceptions_cycle ON feedback_exceptions(cycle_id);
CREATE INDEX idx_feedback_exceptions_status ON feedback_exceptions(approval_status);
