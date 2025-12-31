-- Phase 1: Score Explainability System
-- 1. Performance Categories Table
CREATE TABLE public.performance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  min_score NUMERIC(4,2) NOT NULL,
  max_score NUMERIC(4,2) NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  icon TEXT,
  promotion_eligible BOOLEAN DEFAULT false,
  succession_eligible BOOLEAN DEFAULT false,
  bonus_eligible BOOLEAN DEFAULT true,
  requires_pip BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (company_id, code)
);

-- 2. Appraisal Score Breakdown Table
CREATE TABLE public.appraisal_score_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES public.appraisal_cycles(id) ON DELETE CASCADE,
  
  goals_raw_score NUMERIC(4,2),
  goals_weight NUMERIC(5,2),
  goals_contribution NUMERIC(5,3),
  goals_item_count INTEGER DEFAULT 0,
  
  competencies_raw_score NUMERIC(4,2),
  competencies_weight NUMERIC(5,2),
  competencies_contribution NUMERIC(5,3),
  competencies_item_count INTEGER DEFAULT 0,
  
  responsibilities_raw_score NUMERIC(4,2),
  responsibilities_weight NUMERIC(5,2),
  responsibilities_contribution NUMERIC(5,3),
  responsibilities_item_count INTEGER DEFAULT 0,
  
  values_raw_score NUMERIC(4,2),
  values_weight NUMERIC(5,2),
  values_contribution NUMERIC(5,3),
  values_item_count INTEGER DEFAULT 0,
  
  feedback_360_raw_score NUMERIC(4,2),
  feedback_360_weight NUMERIC(5,2),
  feedback_360_contribution NUMERIC(5,3),
  feedback_360_response_count INTEGER DEFAULT 0,
  feedback_360_completion_rate NUMERIC(5,2),
  
  pre_calibration_score NUMERIC(4,2),
  calibration_adjustment NUMERIC(4,2) DEFAULT 0,
  post_calibration_score NUMERIC(4,2),
  calibration_session_id UUID REFERENCES public.calibration_sessions(id),
  calibration_reason TEXT,
  was_calibrated BOOLEAN DEFAULT false,
  
  evidence_count INTEGER DEFAULT 0,
  validated_evidence_count INTEGER DEFAULT 0,
  evidence_summary JSONB DEFAULT '{}',
  
  ai_quality_score NUMERIC(3,2),
  ai_flags JSONB DEFAULT '[]',
  
  performance_category_id UUID,
  category_thresholds JSONB,
  
  calculated_at TIMESTAMPTZ DEFAULT now(),
  calculation_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE (participant_id)
);

-- 3. Appraisal Strengths and Gaps Table
CREATE TABLE public.appraisal_strengths_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES public.appraisal_cycles(id) ON DELETE CASCADE,
  
  insight_type TEXT NOT NULL CHECK (insight_type IN ('strength', 'gap', 'risk_indicator')),
  category TEXT NOT NULL CHECK (category IN ('goal', 'competency', 'responsibility', 'value', 'behavioral', '360_feedback')),
  
  title TEXT NOT NULL,
  description TEXT,
  
  related_item_type TEXT,
  related_item_id UUID,
  
  score_impact NUMERIC(4,2),
  evidence_ids JSONB DEFAULT '[]',
  
  ai_identified BOOLEAN DEFAULT false,
  ai_confidence NUMERIC(3,2),
  ai_reasoning TEXT,
  
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  suggested_action TEXT,
  
  linked_idp_goal_id UUID REFERENCES public.idp_goals(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK after table creation
ALTER TABLE public.appraisal_score_breakdown 
  ADD CONSTRAINT fk_breakdown_perf_category 
  FOREIGN KEY (performance_category_id) REFERENCES public.performance_categories(id);

-- Create indexes
CREATE INDEX idx_perf_cat_company ON public.performance_categories(company_id);
CREATE INDEX idx_perf_cat_active ON public.performance_categories(company_id, is_active);
CREATE INDEX idx_brk_participant ON public.appraisal_score_breakdown(participant_id);
CREATE INDEX idx_brk_cycle ON public.appraisal_score_breakdown(cycle_id);
CREATE INDEX idx_brk_category ON public.appraisal_score_breakdown(performance_category_id);
CREATE INDEX idx_stg_participant ON public.appraisal_strengths_gaps(participant_id);
CREATE INDEX idx_stg_type ON public.appraisal_strengths_gaps(participant_id, insight_type);
CREATE INDEX idx_stg_cycle ON public.appraisal_strengths_gaps(cycle_id);

-- Enable RLS
ALTER TABLE public.performance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_score_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_strengths_gaps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for performance_categories
CREATE POLICY "perf_cat_view" ON public.performance_categories FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "perf_cat_admin" ON public.performance_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = ANY (ARRAY['admin'::app_role, 'hr_manager'::app_role])
  ));

-- RLS Policies for appraisal_score_breakdown
CREATE POLICY "brk_own" ON public.appraisal_score_breakdown FOR SELECT
  USING (
    participant_id IN (SELECT id FROM public.appraisal_participants WHERE employee_id = auth.uid())
  );

CREATE POLICY "brk_evaluator" ON public.appraisal_score_breakdown FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.appraisal_participants ap WHERE ap.id = appraisal_score_breakdown.participant_id AND ap.evaluator_id = auth.uid())
  );

CREATE POLICY "brk_admin" ON public.appraisal_score_breakdown FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = ANY (ARRAY['admin'::app_role, 'hr_manager'::app_role])
  ));

-- RLS Policies for appraisal_strengths_gaps
CREATE POLICY "stg_own" ON public.appraisal_strengths_gaps FOR SELECT
  USING (
    participant_id IN (SELECT id FROM public.appraisal_participants WHERE employee_id = auth.uid())
  );

CREATE POLICY "stg_evaluator" ON public.appraisal_strengths_gaps FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.appraisal_participants ap WHERE ap.id = appraisal_strengths_gaps.participant_id AND ap.evaluator_id = auth.uid())
  );

CREATE POLICY "stg_admin" ON public.appraisal_strengths_gaps FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = ANY (ARRAY['admin'::app_role, 'hr_manager'::app_role])
  ));

-- Seed default performance categories function
CREATE OR REPLACE FUNCTION public.seed_default_performance_categories(p_company_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.performance_categories (company_id, code, name, name_en, description, min_score, max_score, color, promotion_eligible, succession_eligible, bonus_eligible, requires_pip, display_order)
  VALUES
    (p_company_id, 'exceptional', 'Exceptional', 'Exceptional', 'Consistently exceeds all expectations with outstanding results', 4.50, 5.00, '#10B981', true, true, true, false, 1),
    (p_company_id, 'exceeds', 'Exceeds Expectations', 'Exceeds Expectations', 'Frequently exceeds expectations and delivers high-quality work', 3.75, 4.49, '#3B82F6', true, true, true, false, 2),
    (p_company_id, 'meets', 'Meets Expectations', 'Meets Expectations', 'Consistently meets job requirements and expectations', 2.75, 3.74, '#6366F1', false, false, true, false, 3),
    (p_company_id, 'needs_improvement', 'Needs Improvement', 'Needs Improvement', 'Performance is below expectations in some areas', 1.75, 2.74, '#F59E0B', false, false, false, true, 4),
    (p_company_id, 'unsatisfactory', 'Unsatisfactory', 'Unsatisfactory', 'Performance is significantly below expectations', 1.00, 1.74, '#EF4444', false, false, false, true, 5)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER trg_pc_updated
  BEFORE UPDATE ON public.performance_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_brk_updated
  BEFORE UPDATE ON public.appraisal_score_breakdown
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_stg_updated
  BEFORE UPDATE ON public.appraisal_strengths_gaps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();