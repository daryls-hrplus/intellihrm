-- ============================================
-- Chapter 5 AI Compliance Gap Closure Migration
-- ISO 42001 & Industry Standard Alignment
-- ============================================

-- 1. Create Coaching Prompts Table (Section 5.8)
CREATE TABLE IF NOT EXISTS public.feedback_coaching_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.profiles(id),
  cycle_id UUID REFERENCES public.feedback_360_cycles(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  prompt_category TEXT NOT NULL CHECK (prompt_category IN ('strength', 'development', 'blind_spot', 'exploration')),
  prompt_text TEXT NOT NULL,
  source_theme_id UUID REFERENCES public.development_themes(id),
  source_signal_ids UUID[],
  confidence_score NUMERIC(5,4),
  is_starred BOOLEAN DEFAULT false,
  is_used BOOLEAN DEFAULT false,
  manager_notes TEXT,
  ai_model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_coaching_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coaching prompts (using company-based access)
CREATE POLICY "Users can view their own coaching prompts"
ON public.feedback_coaching_prompts FOR SELECT
USING (employee_id = auth.uid());

CREATE POLICY "Company admins can view all coaching prompts"
ON public.feedback_coaching_prompts FOR SELECT
USING (
  company_id IN (
    SELECT p.company_id FROM public.profiles p 
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Company users can manage coaching prompts"
ON public.feedback_coaching_prompts FOR ALL
USING (
  company_id IN (
    SELECT p.company_id FROM public.profiles p 
    WHERE p.id = auth.uid()
  )
);

-- 2. Add Model Drift Tracking Fields to ai_governance_metrics
ALTER TABLE public.ai_governance_metrics
ADD COLUMN IF NOT EXISTS performance_drift_score NUMERIC(5,4),
ADD COLUMN IF NOT EXISTS drift_threshold_breached BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS model_version TEXT,
ADD COLUMN IF NOT EXISTS drift_alert_sent_at TIMESTAMPTZ;

-- 3. Add Model Card and Fairness Metrics to ai_model_registry
ALTER TABLE public.ai_model_registry
ADD COLUMN IF NOT EXISTS model_card JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS fairness_metrics JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_fairness_audit TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS fairness_score NUMERIC(5,4);

-- 4. Create Human Review SLA Configuration Table (ISO 42001 Compliance)
CREATE TABLE IF NOT EXISTS public.ai_human_review_sla_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  action_type TEXT NOT NULL,
  sla_hours INTEGER NOT NULL DEFAULT 24,
  escalation_hours INTEGER NOT NULL DEFAULT 48,
  notify_on_breach BOOLEAN DEFAULT true,
  escalation_role TEXT DEFAULT 'hr_admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, action_type)
);

-- Enable RLS
ALTER TABLE public.ai_human_review_sla_config ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Company users can view/manage SLA config
CREATE POLICY "Company users can manage SLA config"
ON public.ai_human_review_sla_config FOR ALL
USING (
  company_id IN (
    SELECT p.company_id FROM public.profiles p 
    WHERE p.id = auth.uid()
  )
);

-- 5. Create AI Incident Response Log Table (Industry Standard)
CREATE TABLE IF NOT EXISTS public.ai_incident_response_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  incident_type TEXT NOT NULL CHECK (incident_type IN ('bias_detected', 'model_failure', 'unexpected_output', 'data_quality', 'privacy_breach', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source_table TEXT,
  source_record_id UUID,
  description TEXT NOT NULL,
  immediate_action_taken TEXT,
  root_cause_analysis TEXT,
  corrective_actions JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  reported_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  post_incident_review_date TIMESTAMPTZ,
  lessons_learned TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_incident_response_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy for incident log
CREATE POLICY "Company users can manage AI incidents"
ON public.ai_incident_response_log FOR ALL
USING (
  company_id IN (
    SELECT p.company_id FROM public.profiles p 
    WHERE p.id = auth.uid()
  )
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_coaching_prompts_employee ON public.feedback_coaching_prompts(employee_id);
CREATE INDEX IF NOT EXISTS idx_feedback_coaching_prompts_cycle ON public.feedback_coaching_prompts(cycle_id);
CREATE INDEX IF NOT EXISTS idx_feedback_coaching_prompts_company ON public.feedback_coaching_prompts(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_incident_response_company_status ON public.ai_incident_response_log(company_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_human_review_sla_company ON public.ai_human_review_sla_config(company_id);

-- 7. Add updated_at triggers for new tables
CREATE TRIGGER update_feedback_coaching_prompts_updated_at
BEFORE UPDATE ON public.feedback_coaching_prompts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_human_review_sla_config_updated_at
BEFORE UPDATE ON public.ai_human_review_sla_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_incident_response_log_updated_at
BEFORE UPDATE ON public.ai_incident_response_log
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();