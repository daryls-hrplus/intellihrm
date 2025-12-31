-- Phase 4: Automated Downstream Orchestration

-- Table: appraisal_integration_rules
-- Configurable automation rules for downstream module updates
CREATE TABLE public.appraisal_integration_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Trigger configuration
  trigger_event TEXT NOT NULL CHECK (trigger_event IN ('appraisal_finalized', 'score_threshold', 'category_assigned')),
  
  -- Condition configuration
  condition_type TEXT NOT NULL CHECK (condition_type IN ('score_range', 'category_match', 'trend_direction', 'readiness_threshold', 'custom')),
  condition_operator TEXT NOT NULL DEFAULT '=' CHECK (condition_operator IN ('=', '!=', '>', '<', '>=', '<=', 'in', 'not_in', 'between')),
  condition_value NUMERIC,
  condition_value_max NUMERIC, -- For 'between' operator
  condition_category_codes JSONB DEFAULT '[]'::jsonb, -- Array of category codes for 'in'/'not_in'
  condition_section TEXT, -- Which score section: overall, goals, competencies, responsibilities, values
  
  -- Target module
  target_module TEXT NOT NULL CHECK (target_module IN ('nine_box', 'succession', 'idp', 'compensation', 'workforce_analytics', 'notifications', 'pip')),
  
  -- Action configuration
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'flag', 'archive', 'notify', 'sync')),
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Module-specific parameters
  
  -- Execution settings
  auto_execute BOOLEAN NOT NULL DEFAULT true,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approval_role TEXT, -- Role required to approve: hr_manager, admin, etc.
  execution_order INTEGER NOT NULL DEFAULT 100,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Table: appraisal_integration_log
-- Audit trail for all automated integration actions
CREATE TABLE public.appraisal_integration_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES public.appraisal_integration_rules(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES public.appraisal_participants(id) ON DELETE SET NULL,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Trigger info
  trigger_event TEXT NOT NULL,
  trigger_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- Snapshot of scores/category at trigger time
  
  -- Action info
  target_module TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_config JSONB, -- Config used at execution time
  
  -- Result
  action_result TEXT NOT NULL DEFAULT 'pending' CHECK (action_result IN ('success', 'failed', 'pending_approval', 'pending', 'skipped', 'cancelled')),
  target_record_id UUID, -- ID of created/updated record in target module
  target_record_type TEXT, -- e.g., 'nine_box_assessment', 'succession_candidate', etc.
  error_message TEXT,
  
  -- Execution audit
  executed_at TIMESTAMPTZ,
  executed_by UUID REFERENCES public.profiles(id),
  
  -- Approval workflow
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: compensation_review_flags
-- For flagging employees for compensation review based on performance
CREATE TABLE public.compensation_review_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Source
  source_type TEXT NOT NULL DEFAULT 'appraisal' CHECK (source_type IN ('appraisal', 'manual', 'promotion', 'market_adjustment')),
  source_participant_id UUID REFERENCES public.appraisal_participants(id) ON DELETE SET NULL,
  source_cycle_id UUID REFERENCES public.appraisal_cycles(id) ON DELETE SET NULL,
  
  -- Performance context
  performance_category_code TEXT,
  performance_score NUMERIC,
  
  -- Recommendation
  recommended_action TEXT NOT NULL CHECK (recommended_action IN ('increase', 'decrease', 'hold', 'bonus', 'promotion', 'review')),
  recommended_percentage NUMERIC, -- e.g., 5.0 for 5% increase
  justification TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed', 'expired')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Review
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  review_notes TEXT,
  
  -- Outcome
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES public.profiles(id),
  outcome_notes TEXT,
  
  -- Expiry
  expires_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_integration_rules_company ON public.appraisal_integration_rules(company_id);
CREATE INDEX idx_integration_rules_active ON public.appraisal_integration_rules(company_id, is_active);
CREATE INDEX idx_integration_rules_trigger ON public.appraisal_integration_rules(trigger_event, is_active);
CREATE INDEX idx_integration_log_employee ON public.appraisal_integration_log(employee_id);
CREATE INDEX idx_integration_log_participant ON public.appraisal_integration_log(participant_id);
CREATE INDEX idx_integration_log_company ON public.appraisal_integration_log(company_id);
CREATE INDEX idx_integration_log_pending ON public.appraisal_integration_log(action_result) WHERE action_result IN ('pending', 'pending_approval');
CREATE INDEX idx_compensation_flags_employee ON public.compensation_review_flags(employee_id);
CREATE INDEX idx_compensation_flags_company_status ON public.compensation_review_flags(company_id, status);

-- Enable RLS
ALTER TABLE public.appraisal_integration_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_integration_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_review_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appraisal_integration_rules
CREATE POLICY "Users can view integration rules for their company"
  ON public.appraisal_integration_rules
  FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

CREATE POLICY "Admins and HR can manage integration rules"
  ON public.appraisal_integration_rules
  FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager']))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager']));

-- RLS Policies for appraisal_integration_log
CREATE POLICY "Users can view integration logs for their company"
  ON public.appraisal_integration_log
  FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

CREATE POLICY "System and admins can insert integration logs"
  ON public.appraisal_integration_log
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update integration logs"
  ON public.appraisal_integration_log
  FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager']));

-- RLS Policies for compensation_review_flags
CREATE POLICY "HR and admins can view all compensation flags"
  ON public.compensation_review_flags
  FOR SELECT
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'compensation_admin'])
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "System and HR can manage compensation flags"
  ON public.compensation_review_flags
  FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'compensation_admin']))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'compensation_admin']));

-- Trigger for updated_at
CREATE TRIGGER update_appraisal_integration_rules_updated_at
  BEFORE UPDATE ON public.appraisal_integration_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compensation_review_flags_updated_at
  BEFORE UPDATE ON public.compensation_review_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed example rules for demonstration
INSERT INTO public.appraisal_integration_rules (company_id, name, description, trigger_event, condition_type, condition_operator, condition_category_codes, target_module, action_type, action_config, auto_execute, execution_order)
SELECT 
  id as company_id,
  'Exceptional to 9-Box High Potential' as name,
  'Automatically update 9-Box potential rating to 3 for exceptional performers' as description,
  'category_assigned' as trigger_event,
  'category_match' as condition_type,
  'in' as condition_operator,
  '["exceptional"]'::jsonb as condition_category_codes,
  'nine_box' as target_module,
  'update' as action_type,
  '{"potential_rating": 3, "performance_rating_from_score": true}'::jsonb as action_config,
  true as auto_execute,
  10 as execution_order
FROM public.companies
WHERE id IN (SELECT DISTINCT company_id FROM public.profiles WHERE company_id IS NOT NULL)
LIMIT 5
ON CONFLICT DO NOTHING;