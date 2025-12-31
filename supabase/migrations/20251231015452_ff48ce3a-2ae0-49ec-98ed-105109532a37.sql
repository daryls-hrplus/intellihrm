-- =====================================================
-- Phase 2: Cross-Cycle Performance Memory
-- =====================================================

-- 2.1 Employee Performance Index Table
CREATE TABLE public.employee_performance_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  rolling_12m_score NUMERIC(5,2),
  rolling_24m_score NUMERIC(5,2),
  rolling_36m_score NUMERIC(5,2),
  
  cycles_12m_count INTEGER DEFAULT 0,
  cycles_24m_count INTEGER DEFAULT 0,
  cycles_36m_count INTEGER DEFAULT 0,
  
  avg_goal_score NUMERIC(5,2),
  avg_competency_score NUMERIC(5,2),
  avg_responsibility_score NUMERIC(5,2),
  avg_values_score NUMERIC(5,2),
  
  trend_direction TEXT CHECK (trend_direction IN ('improving', 'stable', 'declining')),
  trend_velocity NUMERIC(5,3),
  trend_confidence NUMERIC(3,2),
  
  best_score NUMERIC(5,2),
  best_cycle_id UUID,
  lowest_score NUMERIC(5,2),
  lowest_cycle_id UUID,
  
  score_variance NUMERIC(8,4),
  score_std_deviation NUMERIC(5,2),
  consistency_rating TEXT CHECK (consistency_rating IN ('highly_consistent', 'consistent', 'variable', 'highly_variable')),
  
  promotion_readiness_score NUMERIC(5,2) CHECK (promotion_readiness_score >= 0 AND promotion_readiness_score <= 100),
  succession_readiness_score NUMERIC(5,2) CHECK (succession_readiness_score >= 0 AND succession_readiness_score <= 100),
  
  skill_gap_closure_rate NUMERIC(5,2),
  idp_completion_rate NUMERIC(5,2),
  
  last_calculated_at TIMESTAMPTZ,
  calculation_config JSONB DEFAULT '{"recency_weights": [0.40, 0.35, 0.25], "min_cycles_for_trend": 2}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT employee_performance_index_unique UNIQUE (employee_id, company_id)
);

-- 2.2 Performance Cycle Snapshots Table
CREATE TABLE public.performance_cycle_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES public.appraisal_cycles(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.appraisal_participants(id) ON DELETE SET NULL,
  
  cycle_name TEXT NOT NULL,
  cycle_type TEXT,
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,
  
  overall_score NUMERIC(5,2),
  goal_score NUMERIC(5,2),
  competency_score NUMERIC(5,2),
  responsibility_score NUMERIC(5,2),
  values_score NUMERIC(5,2),
  feedback_360_score NUMERIC(5,2),
  
  performance_category_id UUID,
  performance_category_code TEXT,
  performance_category_name TEXT,
  
  rank_in_company INTEGER,
  rank_in_department INTEGER,
  rank_in_job_family INTEGER,
  percentile_company NUMERIC(5,2),
  percentile_department NUMERIC(5,2),
  
  was_calibrated BOOLEAN DEFAULT false,
  calibration_delta NUMERIC(5,2),
  
  strengths_count INTEGER DEFAULT 0,
  gaps_count INTEGER DEFAULT 0,
  risk_count INTEGER DEFAULT 0,
  
  evaluator_id UUID,
  evaluator_name TEXT,
  
  evidence_count INTEGER DEFAULT 0,
  validated_evidence_count INTEGER DEFAULT 0,
  
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  snapshot_version INTEGER DEFAULT 1,
  
  CONSTRAINT performance_cycle_snapshots_unique UNIQUE (employee_id, cycle_id)
);

-- Indexes
CREATE INDEX idx_epi_employee ON public.employee_performance_index(employee_id);
CREATE INDEX idx_epi_company ON public.employee_performance_index(company_id);
CREATE INDEX idx_pcs_employee ON public.performance_cycle_snapshots(employee_id);
CREATE INDEX idx_pcs_company ON public.performance_cycle_snapshots(company_id);
CREATE INDEX idx_pcs_cycle ON public.performance_cycle_snapshots(cycle_id);
CREATE INDEX idx_pcs_date ON public.performance_cycle_snapshots(cycle_end_date DESC);

-- Enable RLS
ALTER TABLE public.employee_performance_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_cycle_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies using profiles.company_id
CREATE POLICY "Users view own performance index"
  ON public.employee_performance_index FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Same company users view performance index"
  ON public.employee_performance_index FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.company_id = employee_performance_index.company_id
    )
  );

CREATE POLICY "Manage performance index"
  ON public.employee_performance_index FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Users view own cycle snapshots"
  ON public.performance_cycle_snapshots FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Same company users view cycle snapshots"
  ON public.performance_cycle_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.company_id = performance_cycle_snapshots.company_id
    )
  );

CREATE POLICY "Manage cycle snapshots"
  ON public.performance_cycle_snapshots FOR ALL
  USING (true) WITH CHECK (true);

-- Trigger
CREATE TRIGGER update_employee_performance_index_updated_at
  BEFORE UPDATE ON public.employee_performance_index
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();