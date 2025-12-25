-- Create enum types for dependency and risk
CREATE TYPE goal_dependency_type AS ENUM ('sequential', 'resource', 'skill', 'external', 'cross_team', 'regulatory');
CREATE TYPE goal_risk_indicator AS ENUM ('blocked', 'at_risk', 'on_track', 'accelerated');
CREATE TYPE goal_impact_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Goal Dependencies table
CREATE TABLE public.goal_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  depends_on_goal_id UUID REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  dependency_type goal_dependency_type NOT NULL,
  description TEXT,
  external_dependency_name TEXT,
  external_dependency_contact TEXT,
  expected_resolution_date DATE,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  impact_if_blocked goal_impact_level NOT NULL DEFAULT 'medium',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_dependency CHECK (
    (depends_on_goal_id IS NOT NULL AND external_dependency_name IS NULL) OR
    (depends_on_goal_id IS NULL AND external_dependency_name IS NOT NULL)
  )
);

-- Goal Risk Assessments table
CREATE TABLE public.goal_risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  risk_indicator goal_risk_indicator NOT NULL DEFAULT 'on_track',
  risk_score NUMERIC(5,2) CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors JSONB DEFAULT '[]'::jsonb,
  blocking_dependencies UUID[] DEFAULT '{}',
  mitigation_actions TEXT,
  assessed_by UUID REFERENCES public.profiles(id),
  assessment_type TEXT NOT NULL DEFAULT 'system_derived' CHECK (assessment_type IN ('manual', 'ai_calculated', 'system_derived')),
  confidence_score NUMERIC(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Goal Risk Alerts table
CREATE TABLE public.goal_risk_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('dependency_blocked', 'progress_behind', 'deadline_risk', 'cascade_impact')),
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  ai_explanation TEXT,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  dismissed_by UUID REFERENCES public.profiles(id),
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_risk_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_dependencies
CREATE POLICY "Users can view dependencies for goals they can see"
  ON public.goal_dependencies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.performance_goals pg
      WHERE pg.id = goal_dependencies.goal_id
      AND (pg.employee_id = auth.uid() OR pg.assigned_by = auth.uid())
    )
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

CREATE POLICY "Users can manage dependencies for their assigned goals"
  ON public.goal_dependencies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.performance_goals pg
      WHERE pg.id = goal_dependencies.goal_id
      AND (pg.assigned_by = auth.uid() OR pg.employee_id = auth.uid())
    )
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

-- RLS Policies for goal_risk_assessments
CREATE POLICY "Users can view risk assessments for goals they can see"
  ON public.goal_risk_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.performance_goals pg
      WHERE pg.id = goal_risk_assessments.goal_id
      AND (pg.employee_id = auth.uid() OR pg.assigned_by = auth.uid())
    )
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

CREATE POLICY "Users can manage risk assessments"
  ON public.goal_risk_assessments FOR ALL
  USING (
    assessed_by = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

-- RLS Policies for goal_risk_alerts
CREATE POLICY "Users can view alerts for their goals"
  ON public.goal_risk_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.performance_goals pg
      WHERE pg.id = goal_risk_alerts.goal_id
      AND (pg.employee_id = auth.uid() OR pg.assigned_by = auth.uid())
    )
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

CREATE POLICY "Users can dismiss alerts for their goals"
  ON public.goal_risk_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.performance_goals pg
      WHERE pg.id = goal_risk_alerts.goal_id
      AND (pg.employee_id = auth.uid() OR pg.assigned_by = auth.uid())
    )
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

-- Indexes for performance
CREATE INDEX idx_goal_dependencies_goal_id ON public.goal_dependencies(goal_id);
CREATE INDEX idx_goal_dependencies_depends_on ON public.goal_dependencies(depends_on_goal_id);
CREATE INDEX idx_goal_dependencies_type ON public.goal_dependencies(dependency_type);
CREATE INDEX idx_goal_dependencies_resolved ON public.goal_dependencies(is_resolved);
CREATE INDEX idx_goal_risk_assessments_goal_id ON public.goal_risk_assessments(goal_id);
CREATE INDEX idx_goal_risk_assessments_indicator ON public.goal_risk_assessments(risk_indicator);
CREATE INDEX idx_goal_risk_alerts_goal_id ON public.goal_risk_alerts(goal_id);
CREATE INDEX idx_goal_risk_alerts_dismissed ON public.goal_risk_alerts(is_dismissed);

-- Updated_at triggers
CREATE TRIGGER update_goal_dependencies_updated_at
  BEFORE UPDATE ON public.goal_dependencies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_risk_assessments_updated_at
  BEFORE UPDATE ON public.goal_risk_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate goal risk score
CREATE OR REPLACE FUNCTION public.calculate_goal_risk_score(p_goal_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_goal RECORD;
  v_risk_score NUMERIC := 0;
  v_risk_indicator goal_risk_indicator := 'on_track';
  v_risk_factors JSONB := '[]'::jsonb;
  v_blocking_deps UUID[] := '{}';
  v_unresolved_count INTEGER := 0;
  v_critical_count INTEGER := 0;
  v_days_remaining INTEGER;
  v_expected_progress NUMERIC;
  v_progress_gap NUMERIC;
BEGIN
  -- Get goal details
  SELECT * INTO v_goal FROM performance_goals WHERE id = p_goal_id;
  
  IF v_goal IS NULL THEN
    RETURN jsonb_build_object('error', 'Goal not found');
  END IF;
  
  -- Check for blocked dependencies
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE impact_if_blocked = 'critical'),
    ARRAY_AGG(id) FILTER (WHERE NOT is_resolved)
  INTO v_unresolved_count, v_critical_count, v_blocking_deps
  FROM goal_dependencies
  WHERE goal_id = p_goal_id AND NOT is_resolved;
  
  -- Calculate risk from dependencies
  IF v_unresolved_count > 0 THEN
    v_risk_score := v_risk_score + (v_unresolved_count * 15);
    v_risk_factors := v_risk_factors || jsonb_build_object(
      'type', 'unresolved_dependencies',
      'count', v_unresolved_count,
      'impact', v_unresolved_count * 15
    );
  END IF;
  
  IF v_critical_count > 0 THEN
    v_risk_score := v_risk_score + (v_critical_count * 25);
    v_risk_factors := v_risk_factors || jsonb_build_object(
      'type', 'critical_dependencies',
      'count', v_critical_count,
      'impact', v_critical_count * 25
    );
  END IF;
  
  -- Calculate time-based risk
  IF v_goal.due_date IS NOT NULL THEN
    v_days_remaining := v_goal.due_date - CURRENT_DATE;
    
    IF v_days_remaining < 0 THEN
      -- Overdue
      v_risk_score := v_risk_score + 40;
      v_risk_factors := v_risk_factors || jsonb_build_object(
        'type', 'overdue',
        'days_overdue', ABS(v_days_remaining),
        'impact', 40
      );
    ELSIF v_days_remaining <= 7 AND COALESCE(v_goal.progress_percentage, 0) < 80 THEN
      -- Due soon with low progress
      v_risk_score := v_risk_score + 25;
      v_risk_factors := v_risk_factors || jsonb_build_object(
        'type', 'deadline_risk',
        'days_remaining', v_days_remaining,
        'progress', v_goal.progress_percentage,
        'impact', 25
      );
    END IF;
  END IF;
  
  -- Calculate progress gap risk
  IF v_goal.start_date IS NOT NULL AND v_goal.due_date IS NOT NULL THEN
    v_expected_progress := LEAST(100, 
      (CURRENT_DATE - v_goal.start_date)::NUMERIC / 
      NULLIF((v_goal.due_date - v_goal.start_date)::NUMERIC, 0) * 100
    );
    v_progress_gap := v_expected_progress - COALESCE(v_goal.progress_percentage, 0);
    
    IF v_progress_gap > 20 THEN
      v_risk_score := v_risk_score + LEAST(30, v_progress_gap * 0.5);
      v_risk_factors := v_risk_factors || jsonb_build_object(
        'type', 'progress_behind',
        'expected', ROUND(v_expected_progress, 1),
        'actual', COALESCE(v_goal.progress_percentage, 0),
        'gap', ROUND(v_progress_gap, 1),
        'impact', LEAST(30, v_progress_gap * 0.5)
      );
    ELSIF v_progress_gap < -20 THEN
      -- Ahead of schedule - reduce risk
      v_risk_score := GREATEST(0, v_risk_score - 10);
      v_risk_factors := v_risk_factors || jsonb_build_object(
        'type', 'ahead_of_schedule',
        'expected', ROUND(v_expected_progress, 1),
        'actual', COALESCE(v_goal.progress_percentage, 0),
        'impact', -10
      );
    END IF;
  END IF;
  
  -- Determine risk indicator
  v_risk_score := LEAST(100, GREATEST(0, v_risk_score));
  
  IF v_risk_score >= 75 OR v_critical_count > 0 THEN
    v_risk_indicator := 'blocked';
  ELSIF v_risk_score >= 40 THEN
    v_risk_indicator := 'at_risk';
  ELSIF v_risk_score <= 10 AND COALESCE(v_goal.progress_percentage, 0) > v_expected_progress + 20 THEN
    v_risk_indicator := 'accelerated';
  ELSE
    v_risk_indicator := 'on_track';
  END IF;
  
  -- Upsert risk assessment
  INSERT INTO goal_risk_assessments (
    goal_id, risk_indicator, risk_score, risk_factors, 
    blocking_dependencies, assessment_type, confidence_score, valid_until
  ) VALUES (
    p_goal_id, v_risk_indicator, v_risk_score, v_risk_factors,
    COALESCE(v_blocking_deps, '{}'), 'system_derived', 85,
    CURRENT_TIMESTAMP + INTERVAL '1 day'
  )
  ON CONFLICT (goal_id) WHERE assessment_type = 'system_derived'
  DO UPDATE SET
    risk_indicator = EXCLUDED.risk_indicator,
    risk_score = EXCLUDED.risk_score,
    risk_factors = EXCLUDED.risk_factors,
    blocking_dependencies = EXCLUDED.blocking_dependencies,
    confidence_score = EXCLUDED.confidence_score,
    valid_until = EXCLUDED.valid_until,
    updated_at = now();
  
  RETURN jsonb_build_object(
    'goal_id', p_goal_id,
    'risk_indicator', v_risk_indicator,
    'risk_score', v_risk_score,
    'risk_factors', v_risk_factors,
    'blocking_dependencies', v_blocking_deps
  );
END;
$$;

-- Function to check dependency cascade
CREATE OR REPLACE FUNCTION public.check_dependency_cascade(p_dependency_id UUID)
RETURNS TABLE (
  affected_goal_id UUID,
  affected_goal_title TEXT,
  cascade_level INTEGER,
  impact_path UUID[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE cascade_chain AS (
    -- Base: the goal that directly depends on the blocked dependency
    SELECT 
      gd.goal_id,
      pg.title,
      1 as level,
      ARRAY[gd.goal_id] as path
    FROM goal_dependencies gd
    JOIN performance_goals pg ON pg.id = gd.goal_id
    WHERE gd.id = p_dependency_id
    
    UNION ALL
    
    -- Recursive: goals that depend on goals in the chain
    SELECT 
      gd2.goal_id,
      pg2.title,
      cc.level + 1,
      cc.path || gd2.goal_id
    FROM cascade_chain cc
    JOIN goal_dependencies gd2 ON gd2.depends_on_goal_id = cc.goal_id
    JOIN performance_goals pg2 ON pg2.id = gd2.goal_id
    WHERE NOT gd2.is_resolved
      AND gd2.goal_id != ALL(cc.path) -- Prevent cycles
      AND cc.level < 10 -- Limit depth
  )
  SELECT 
    goal_id as affected_goal_id,
    title as affected_goal_title,
    level as cascade_level,
    path as impact_path
  FROM cascade_chain
  ORDER BY level, goal_id;
END;
$$;

-- Trigger to recalculate risk when dependencies change
CREATE OR REPLACE FUNCTION public.trigger_risk_recalculation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalculate risk for the affected goal
  PERFORM calculate_goal_risk_score(COALESCE(NEW.goal_id, OLD.goal_id));
  
  -- If a dependency was resolved/unresolved, check cascade
  IF TG_OP = 'UPDATE' AND OLD.is_resolved IS DISTINCT FROM NEW.is_resolved THEN
    -- Create alert if dependency was blocked
    IF NOT NEW.is_resolved THEN
      INSERT INTO goal_risk_alerts (goal_id, alert_type, severity, message, ai_explanation)
      VALUES (
        NEW.goal_id,
        'dependency_blocked',
        CASE NEW.impact_if_blocked 
          WHEN 'critical' THEN 'critical'
          WHEN 'high' THEN 'critical'
          ELSE 'warning'
        END,
        'A dependency has become blocked',
        'Dependency "' || COALESCE(NEW.external_dependency_name, 
          (SELECT title FROM performance_goals WHERE id = NEW.depends_on_goal_id)) 
        || '" is now blocking this goal''s progress.'
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER goal_dependency_risk_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.goal_dependencies
  FOR EACH ROW EXECUTE FUNCTION public.trigger_risk_recalculation();

-- Add unique constraint for system-derived assessments per goal
CREATE UNIQUE INDEX idx_goal_risk_assessments_system_unique 
  ON public.goal_risk_assessments(goal_id) 
  WHERE assessment_type = 'system_derived';