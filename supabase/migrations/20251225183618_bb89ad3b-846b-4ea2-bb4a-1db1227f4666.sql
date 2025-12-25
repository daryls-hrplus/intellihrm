
-- Goal Visibility Rules Table
CREATE TABLE IF NOT EXISTS public.goal_visibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  visibility_scope TEXT NOT NULL DEFAULT 'owner_only' CHECK (visibility_scope IN ('owner_only', 'team', 'department', 'company', 'custom')),
  can_view_roles TEXT[] DEFAULT '{}',
  can_edit_roles TEXT[] DEFAULT '{}',
  custom_viewer_ids UUID[] DEFAULT '{}',
  custom_editor_ids UUID[] DEFAULT '{}',
  inherit_from_parent BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(goal_id)
);

-- Goal Progress Rollup Configuration Table
CREATE TABLE IF NOT EXISTS public.goal_progress_rollup_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  rollup_method TEXT NOT NULL DEFAULT 'weighted_average' CHECK (rollup_method IN ('weighted_average', 'simple_average', 'minimum', 'maximum', 'manual')),
  auto_calculate BOOLEAN DEFAULT true,
  include_aligned_goals BOOLEAN DEFAULT true,
  include_child_goals BOOLEAN DEFAULT true,
  threshold_percentage NUMERIC DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_goal_id)
);

-- Goal Progress Overrides Table (manual overrides with justification)
CREATE TABLE IF NOT EXISTS public.goal_progress_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  previous_value NUMERIC NOT NULL,
  override_value NUMERIC NOT NULL,
  calculated_value NUMERIC,
  justification TEXT NOT NULL,
  overridden_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enhance goal_alignments table with contribution weight and type
ALTER TABLE public.goal_alignments 
ADD COLUMN IF NOT EXISTS alignment_type TEXT DEFAULT 'contributes_to',
ADD COLUMN IF NOT EXISTS contribution_weight NUMERIC DEFAULT 10 CHECK (contribution_weight >= 0 AND contribution_weight <= 100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Enable RLS on new tables
ALTER TABLE public.goal_visibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress_rollup_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_visibility_rules (using employee_id and assigned_by)
CREATE POLICY "Users can view visibility rules for goals they can access"
ON public.goal_visibility_rules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.performance_goals pg
    WHERE pg.id = goal_visibility_rules.goal_id
    AND (
      pg.employee_id = auth.uid()
      OR pg.assigned_by = auth.uid()
      OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  )
);

CREATE POLICY "Goal owners and admins can manage visibility rules"
ON public.goal_visibility_rules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.performance_goals pg
    WHERE pg.id = goal_visibility_rules.goal_id
    AND (
      pg.employee_id = auth.uid()
      OR pg.assigned_by = auth.uid()
      OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  )
);

-- RLS Policies for goal_progress_rollup_config
CREATE POLICY "Users can view rollup config for accessible goals"
ON public.goal_progress_rollup_config FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.performance_goals pg
    WHERE pg.id = goal_progress_rollup_config.parent_goal_id
    AND (
      pg.employee_id = auth.uid()
      OR pg.assigned_by = auth.uid()
      OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  )
);

CREATE POLICY "Goal owners and admins can manage rollup config"
ON public.goal_progress_rollup_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.performance_goals pg
    WHERE pg.id = goal_progress_rollup_config.parent_goal_id
    AND (
      pg.employee_id = auth.uid()
      OR pg.assigned_by = auth.uid()
      OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  )
);

-- RLS Policies for goal_progress_overrides
CREATE POLICY "Users can view overrides for accessible goals"
ON public.goal_progress_overrides FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.performance_goals pg
    WHERE pg.id = goal_progress_overrides.goal_id
    AND (
      pg.employee_id = auth.uid()
      OR pg.assigned_by = auth.uid()
      OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  )
);

CREATE POLICY "Managers and admins can create overrides"
ON public.goal_progress_overrides FOR INSERT
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'manager'])
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goal_visibility_rules_goal_id ON public.goal_visibility_rules(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_rollup_config_parent_id ON public.goal_progress_rollup_config(parent_goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_overrides_goal_id ON public.goal_progress_overrides(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_alignments_is_active ON public.goal_alignments(is_active) WHERE is_active = true;

-- Updated at trigger for new tables
CREATE TRIGGER update_goal_visibility_rules_updated_at
  BEFORE UPDATE ON public.goal_visibility_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_progress_rollup_config_updated_at
  BEFORE UPDATE ON public.goal_progress_rollup_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check goal visibility
CREATE OR REPLACE FUNCTION public.check_goal_visibility(p_goal_id UUID, p_user_id UUID)
RETURNS TABLE(can_view BOOLEAN, can_edit BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_goal RECORD;
  v_visibility RECORD;
  v_user_roles TEXT[];
  v_can_view BOOLEAN := false;
  v_can_edit BOOLEAN := false;
BEGIN
  -- Get the goal
  SELECT * INTO v_goal FROM performance_goals WHERE id = p_goal_id;
  
  IF v_goal IS NULL THEN
    RETURN QUERY SELECT false, false;
    RETURN;
  END IF;
  
  -- Owner and assigner always have full access
  IF v_goal.employee_id = p_user_id OR v_goal.assigned_by = p_user_id THEN
    RETURN QUERY SELECT true, true;
    RETURN;
  END IF;
  
  -- Admins and HR always have full access
  IF public.has_any_role(p_user_id, ARRAY['admin', 'hr_manager']) THEN
    RETURN QUERY SELECT true, true;
    RETURN;
  END IF;
  
  -- Get visibility rules
  SELECT * INTO v_visibility FROM goal_visibility_rules WHERE goal_id = p_goal_id;
  
  -- If no visibility rules, default to owner_only
  IF v_visibility IS NULL THEN
    RETURN QUERY SELECT false, false;
    RETURN;
  END IF;
  
  -- Get user roles
  SELECT ARRAY_AGG(ur.role::TEXT) INTO v_user_roles
  FROM user_roles ur WHERE ur.user_id = p_user_id;
  
  -- Check visibility scope
  CASE v_visibility.visibility_scope
    WHEN 'company' THEN
      v_can_view := true;
    WHEN 'department' THEN
      -- Check if user is in same department
      SELECT EXISTS (
        SELECT 1 FROM profiles p1
        JOIN profiles p2 ON p1.department_id = p2.department_id
        WHERE p1.id = p_user_id AND p2.id = v_goal.employee_id
      ) INTO v_can_view;
    WHEN 'team' THEN
      -- Check if user is manager or team member
      SELECT EXISTS (
        SELECT 1 FROM get_employee_supervisor(v_goal.employee_id, NULL)
        WHERE supervisor_id = p_user_id
      ) INTO v_can_view;
    WHEN 'custom' THEN
      v_can_view := p_user_id = ANY(v_visibility.custom_viewer_ids);
    ELSE
      v_can_view := false;
  END CASE;
  
  -- Check role-based view access
  IF NOT v_can_view AND v_user_roles IS NOT NULL THEN
    v_can_view := v_visibility.can_view_roles && v_user_roles;
  END IF;
  
  -- Check edit permissions
  IF v_can_view THEN
    IF p_user_id = ANY(v_visibility.custom_editor_ids) THEN
      v_can_edit := true;
    ELSIF v_user_roles IS NOT NULL AND v_visibility.can_edit_roles && v_user_roles THEN
      v_can_edit := true;
    END IF;
  END IF;
  
  RETURN QUERY SELECT v_can_view, v_can_edit;
END;
$$;

-- Function to calculate goal progress rollup
CREATE OR REPLACE FUNCTION public.calculate_goal_progress_rollup(p_goal_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_config RECORD;
  v_total_weight NUMERIC := 0;
  v_weighted_sum NUMERIC := 0;
  v_count INTEGER := 0;
  v_min_progress NUMERIC := 100;
  v_max_progress NUMERIC := 0;
  v_result NUMERIC := 0;
  v_child RECORD;
BEGIN
  -- Get rollup config
  SELECT * INTO v_config FROM goal_progress_rollup_config WHERE parent_goal_id = p_goal_id;
  
  -- If no config or manual mode, return current progress
  IF v_config IS NULL OR v_config.rollup_method = 'manual' OR NOT v_config.auto_calculate THEN
    SELECT progress_percentage INTO v_result FROM performance_goals WHERE id = p_goal_id;
    RETURN COALESCE(v_result, 0);
  END IF;
  
  -- Gather child goals (via parent_goal_id)
  IF v_config.include_child_goals THEN
    FOR v_child IN
      SELECT pg.progress_percentage, pg.weighting
      FROM performance_goals pg
      WHERE pg.parent_goal_id = p_goal_id AND pg.status != 'cancelled'
    LOOP
      v_count := v_count + 1;
      v_weighted_sum := v_weighted_sum + (COALESCE(v_child.progress_percentage, 0) * COALESCE(v_child.weighting, 10));
      v_total_weight := v_total_weight + COALESCE(v_child.weighting, 10);
      v_min_progress := LEAST(v_min_progress, COALESCE(v_child.progress_percentage, 0));
      v_max_progress := GREATEST(v_max_progress, COALESCE(v_child.progress_percentage, 0));
    END LOOP;
  END IF;
  
  -- Gather aligned goals (via goal_alignments)
  IF v_config.include_aligned_goals THEN
    FOR v_child IN
      SELECT pg.progress_percentage, ga.contribution_weight
      FROM goal_alignments ga
      JOIN performance_goals pg ON pg.id = ga.source_goal_id
      WHERE ga.target_goal_id = p_goal_id 
        AND ga.is_active = true
        AND pg.status != 'cancelled'
    LOOP
      v_count := v_count + 1;
      v_weighted_sum := v_weighted_sum + (COALESCE(v_child.progress_percentage, 0) * COALESCE(v_child.contribution_weight, 10));
      v_total_weight := v_total_weight + COALESCE(v_child.contribution_weight, 10);
      v_min_progress := LEAST(v_min_progress, COALESCE(v_child.progress_percentage, 0));
      v_max_progress := GREATEST(v_max_progress, COALESCE(v_child.progress_percentage, 0));
    END LOOP;
  END IF;
  
  -- If no children/alignments, return current progress
  IF v_count = 0 THEN
    SELECT progress_percentage INTO v_result FROM performance_goals WHERE id = p_goal_id;
    RETURN COALESCE(v_result, 0);
  END IF;
  
  -- Calculate based on method
  CASE v_config.rollup_method
    WHEN 'weighted_average' THEN
      IF v_total_weight > 0 THEN
        v_result := v_weighted_sum / v_total_weight;
      END IF;
    WHEN 'simple_average' THEN
      v_result := v_weighted_sum / v_total_weight;
    WHEN 'minimum' THEN
      v_result := v_min_progress;
    WHEN 'maximum' THEN
      v_result := v_max_progress;
    ELSE
      v_result := v_weighted_sum / NULLIF(v_total_weight, 0);
  END CASE;
  
  -- Apply threshold cap
  IF v_config.threshold_percentage < 100 THEN
    v_result := LEAST(v_result, v_config.threshold_percentage);
  END IF;
  
  RETURN ROUND(COALESCE(v_result, 0), 2);
END;
$$;

-- Function to propagate rollup to parent goals
CREATE OR REPLACE FUNCTION public.propagate_goal_progress_rollup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_target_id UUID;
  v_new_progress NUMERIC;
BEGIN
  -- Update parent goal if exists
  IF NEW.parent_goal_id IS NOT NULL THEN
    v_new_progress := calculate_goal_progress_rollup(NEW.parent_goal_id);
    UPDATE performance_goals 
    SET progress_percentage = v_new_progress, updated_at = now()
    WHERE id = NEW.parent_goal_id;
  END IF;
  
  -- Update aligned target goals
  FOR v_target_id IN
    SELECT target_goal_id FROM goal_alignments 
    WHERE source_goal_id = NEW.id AND is_active = true
  LOOP
    v_new_progress := calculate_goal_progress_rollup(v_target_id);
    UPDATE performance_goals 
    SET progress_percentage = v_new_progress, updated_at = now()
    WHERE id = v_target_id;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto rollup propagation
DROP TRIGGER IF EXISTS trigger_goal_progress_rollup ON public.performance_goals;
CREATE TRIGGER trigger_goal_progress_rollup
  AFTER UPDATE OF progress_percentage ON public.performance_goals
  FOR EACH ROW
  WHEN (OLD.progress_percentage IS DISTINCT FROM NEW.progress_percentage)
  EXECUTE FUNCTION public.propagate_goal_progress_rollup();
