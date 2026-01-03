
-- Agent Registry - Central registry of all AI agents
CREATE TABLE public.ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_code VARCHAR(50) NOT NULL UNIQUE,
  agent_name VARCHAR(100) NOT NULL,
  description TEXT,
  agent_type VARCHAR(50) NOT NULL DEFAULT 'edge_function',
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  version VARCHAR(20) DEFAULT '1.0.0',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  is_enabled BOOLEAN DEFAULT true,
  function_name VARCHAR(100),
  endpoint_url TEXT,
  capabilities JSONB DEFAULT '[]'::jsonb,
  input_schema JSONB,
  output_schema JSONB,
  dependencies VARCHAR(100)[] DEFAULT '{}',
  rate_limit_per_minute INTEGER DEFAULT 60,
  timeout_seconds INTEGER DEFAULT 30,
  retry_config JSONB DEFAULT '{"max_retries": 3, "backoff_ms": 1000}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  company_id UUID REFERENCES public.companies(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent Capabilities - Detailed capabilities for each agent
CREATE TABLE public.ai_agent_capabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  capability_name VARCHAR(100) NOT NULL,
  capability_type VARCHAR(50) NOT NULL,
  description TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  risk_level VARCHAR(20) DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent Execution History - Track all agent executions
CREATE TABLE public.ai_agent_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  execution_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  trigger_type VARCHAR(50) DEFAULT 'manual',
  trigger_source VARCHAR(100),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  error_code VARCHAR(50),
  tokens_used INTEGER DEFAULT 0,
  estimated_cost_usd DECIMAL(10,6) DEFAULT 0,
  latency_ms INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  company_id UUID REFERENCES public.companies(id),
  user_id UUID,
  session_id VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Agent Performance Metrics - Aggregated metrics
CREATE TABLE public.ai_agent_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  metric_hour INTEGER,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  avg_latency_ms DECIMAL(10,2),
  p95_latency_ms DECIMAL(10,2),
  p99_latency_ms DECIMAL(10,2),
  total_tokens_used BIGINT DEFAULT 0,
  total_cost_usd DECIMAL(10,4) DEFAULT 0,
  error_rate DECIMAL(5,4) DEFAULT 0,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, metric_date, metric_hour)
);

-- Agent Alerts - For monitoring and alerting
CREATE TABLE public.ai_agent_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  title VARCHAR(200) NOT NULL,
  message TEXT,
  threshold_value DECIMAL(10,4),
  actual_value DECIMAL(10,4),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_agents
CREATE POLICY "Users can view agents" ON public.ai_agents
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage agents" ON public.ai_agents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'system_admin')
    )
  );

-- RLS Policies for ai_agent_capabilities
CREATE POLICY "Users can view capabilities" ON public.ai_agent_capabilities
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage capabilities" ON public.ai_agent_capabilities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'system_admin')
    )
  );

-- RLS Policies for ai_agent_executions
CREATE POLICY "Users can view own executions" ON public.ai_agent_executions
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'system_admin')
  ));

CREATE POLICY "System can insert executions" ON public.ai_agent_executions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for ai_agent_metrics
CREATE POLICY "Users can view metrics" ON public.ai_agent_metrics
  FOR SELECT USING (true);

CREATE POLICY "System can manage metrics" ON public.ai_agent_metrics
  FOR ALL USING (true);

-- RLS Policies for ai_agent_alerts
CREATE POLICY "Users can view alerts" ON public.ai_agent_alerts
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage alerts" ON public.ai_agent_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'system_admin')
    )
  );

-- Indexes for performance
CREATE INDEX idx_ai_agents_status ON public.ai_agents(status);
CREATE INDEX idx_ai_agents_category ON public.ai_agents(category);
CREATE INDEX idx_ai_agent_executions_agent_id ON public.ai_agent_executions(agent_id);
CREATE INDEX idx_ai_agent_executions_started_at ON public.ai_agent_executions(started_at DESC);
CREATE INDEX idx_ai_agent_executions_status ON public.ai_agent_executions(status);
CREATE INDEX idx_ai_agent_metrics_agent_date ON public.ai_agent_metrics(agent_id, metric_date);
CREATE INDEX idx_ai_agent_alerts_agent_id ON public.ai_agent_alerts(agent_id);
CREATE INDEX idx_ai_agent_alerts_resolved ON public.ai_agent_alerts(is_resolved);

-- Updated at trigger
CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial agent registry from existing edge functions
INSERT INTO public.ai_agents (agent_code, agent_name, description, agent_type, category, function_name, capabilities, status) VALUES
('help-chat', 'HR Help Assistant', 'Conversational AI assistant for HR queries and policy guidance', 'edge_function', 'assistant', 'help-chat', '["chat", "policy_lookup", "hr_guidance"]', 'active'),
('calibration-ai-analyzer', 'Calibration Analyzer', 'AI-powered performance calibration analysis and recommendations', 'edge_function', 'performance', 'calibration-ai-analyzer', '["score_analysis", "bias_detection", "calibration_suggestions"]', 'active'),
('review-quality-assistant', 'Review Quality Assistant', 'Analyzes review quality and provides improvement suggestions', 'edge_function', 'performance', 'review-quality-assistant', '["quality_scoring", "feedback_analysis", "coaching_tips"]', 'active'),
('goal-ai-analyzer', 'Goal Analyzer', 'SMART goal analysis, duplicate detection, and skill inference', 'edge_function', 'performance', 'goal-ai-analyzer', '["smart_analysis", "duplicate_detection", "skill_inference"]', 'active'),
('responsibility-ai-helper', 'Responsibility AI Helper', 'Generates job descriptions and suggests KRAs', 'edge_function', 'organization', 'responsibility-ai-helper', '["description_generation", "kra_suggestions", "enrichment"]', 'active'),
('ai-translate', 'Translation Agent', 'Multi-language translation for HR content', 'edge_function', 'utility', 'ai-translate', '["text_translation", "batch_translation"]', 'active'),
('scenario-recommendations', 'Workforce Scenario Planner', 'AI-driven workforce planning scenario recommendations', 'edge_function', 'workforce', 'scenario-recommendations', '["scenario_modeling", "headcount_planning"]', 'active'),
('optimize-learning-path', 'Learning Path Optimizer', 'Personalized learning path recommendations', 'edge_function', 'learning', 'optimize-learning-path', '["path_optimization", "skill_gap_analysis"]', 'active'),
('score-content-effectiveness', 'Content Effectiveness Scorer', 'Analyzes and scores content quality and effectiveness', 'edge_function', 'content', 'score-content-effectiveness', '["quality_scoring", "improvement_suggestions"]', 'active'),
('appraisal-integration-orchestrator', 'Appraisal Orchestrator', 'Orchestrates cross-module integration for appraisals', 'edge_function', 'orchestration', 'appraisal-integration-orchestrator', '["event_processing", "rule_execution", "module_integration"]', 'active'),
('ai-bias-detector', 'Bias Detection Agent', 'Detects potential bias in AI responses and HR decisions', 'edge_function', 'governance', 'ai-bias-detector', '["bias_detection", "fairness_analysis"]', 'active'),
('sync-guide-updates', 'Guide Sync Agent', 'Synchronizes enablement content and guide updates', 'edge_function', 'enablement', 'sync-guide-updates', '["content_sync", "changelog_generation"]', 'active');
