-- Create enum for risk types
CREATE TYPE performance_risk_type AS ENUM (
  'chronic_underperformance',
  'skills_decay',
  'toxic_high_performer',
  'declining_trend',
  'competency_gap',
  'goal_achievement_gap',
  'engagement_risk'
);

-- Create enum for risk levels
CREATE TYPE performance_risk_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Create enum for trend direction
CREATE TYPE performance_trend_direction AS ENUM (
  'improving',
  'stable',
  'declining'
);

-- Create enum for succession impact
CREATE TYPE succession_impact_type AS ENUM (
  'none',
  'flagged',
  'excluded'
);

-- Create employee_performance_risks table
CREATE TABLE public.employee_performance_risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  risk_type performance_risk_type NOT NULL,
  risk_level performance_risk_level NOT NULL DEFAULT 'low',
  risk_score NUMERIC(5,2) DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors JSONB DEFAULT '[]'::jsonb,
  affected_competencies JSONB DEFAULT '[]'::jsonb,
  consecutive_underperformance_count INTEGER DEFAULT 0,
  expiring_certifications JSONB DEFAULT '[]'::jsonb,
  goal_vs_behavior_gap NUMERIC(5,2),
  goal_score NUMERIC(5,2),
  competency_score NUMERIC(5,2),
  triggered_interventions JSONB DEFAULT '[]'::jsonb,
  succession_impact succession_impact_type DEFAULT 'none',
  promotion_block_reason TEXT,
  ai_recommendation TEXT,
  ai_analysis JSONB,
  detection_method TEXT DEFAULT 'system',
  first_detected_at TIMESTAMPTZ DEFAULT now(),
  last_analyzed_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create performance_trend_history table
CREATE TABLE public.performance_trend_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.appraisal_cycles(id) ON DELETE SET NULL,
  cycle_name TEXT,
  cycle_end_date DATE,
  overall_score NUMERIC(5,2),
  goal_score NUMERIC(5,2),
  competency_score NUMERIC(5,2),
  responsibility_score NUMERIC(5,2),
  trend_direction performance_trend_direction DEFAULT 'stable',
  trend_score NUMERIC(5,2),
  previous_overall_score NUMERIC(5,2),
  score_delta NUMERIC(5,2),
  percentile_rank NUMERIC(5,2),
  peer_comparison JSONB,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_type TEXT DEFAULT 'overall',
  metric_value NUMERIC(5,2),
  ai_prediction JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns to succession_candidates for risk integration
ALTER TABLE public.succession_candidates 
ADD COLUMN IF NOT EXISTS performance_risk_id UUID REFERENCES public.employee_performance_risks(id),
ADD COLUMN IF NOT EXISTS is_promotion_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS block_reason TEXT,
ADD COLUMN IF NOT EXISTS last_risk_check_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX idx_employee_performance_risks_employee ON public.employee_performance_risks(employee_id);
CREATE INDEX idx_employee_performance_risks_company ON public.employee_performance_risks(company_id);
CREATE INDEX idx_employee_performance_risks_type ON public.employee_performance_risks(risk_type);
CREATE INDEX idx_employee_performance_risks_level ON public.employee_performance_risks(risk_level);
CREATE INDEX idx_employee_performance_risks_active ON public.employee_performance_risks(is_active) WHERE is_active = true;
CREATE INDEX idx_performance_trend_history_employee ON public.performance_trend_history(employee_id);
CREATE INDEX idx_performance_trend_history_company ON public.performance_trend_history(company_id);
CREATE INDEX idx_performance_trend_history_cycle ON public.performance_trend_history(cycle_id);
CREATE INDEX idx_performance_trend_history_date ON public.performance_trend_history(snapshot_date);

-- Enable RLS
ALTER TABLE public.employee_performance_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_trend_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_performance_risks
CREATE POLICY "Users can view performance risks in their company"
ON public.employee_performance_risks
FOR SELECT
USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
);

CREATE POLICY "HR and admins can manage performance risks"
ON public.employee_performance_risks
FOR ALL
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
);

-- RLS policies for performance_trend_history
CREATE POLICY "Users can view their own trend history"
ON public.performance_trend_history
FOR SELECT
USING (
  employee_id = auth.uid()
  OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
);

CREATE POLICY "System can insert trend history"
ON public.performance_trend_history
FOR INSERT
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
);

-- Create trigger for updated_at
CREATE TRIGGER update_employee_performance_risks_updated_at
BEFORE UPDATE ON public.employee_performance_risks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check and update succession candidate risks
CREATE OR REPLACE FUNCTION public.sync_succession_performance_risk()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If risk is high or critical, flag succession candidates
  IF NEW.risk_level IN ('high', 'critical') AND NEW.is_active = true THEN
    UPDATE public.succession_candidates
    SET 
      performance_risk_id = NEW.id,
      is_promotion_blocked = true,
      block_reason = 'Performance risk detected: ' || NEW.risk_type::text,
      last_risk_check_at = now()
    WHERE candidate_id = NEW.employee_id;
  ELSIF NEW.is_active = false OR NEW.risk_level IN ('low', 'medium') THEN
    -- Clear the block if risk is resolved or lowered
    UPDATE public.succession_candidates
    SET 
      is_promotion_blocked = false,
      block_reason = NULL,
      last_risk_check_at = now()
    WHERE candidate_id = NEW.employee_id 
      AND performance_risk_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync succession risks
CREATE TRIGGER sync_succession_on_performance_risk
AFTER INSERT OR UPDATE ON public.employee_performance_risks
FOR EACH ROW
EXECUTE FUNCTION public.sync_succession_performance_risk();