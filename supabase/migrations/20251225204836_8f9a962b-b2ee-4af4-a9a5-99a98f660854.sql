-- =====================================================
-- Progress Tracking & Check-ins Database Schema
-- Industry-aligned with SAP SuccessFactors CPM patterns
-- =====================================================

-- 1. Goal Check-ins (formal structured check-ins)
CREATE TABLE public.goal_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  manager_id UUID REFERENCES public.profiles(id),
  check_in_type TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'ad_hoc', 'milestone'
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  progress_at_check_in NUMERIC, -- snapshot of progress at this point
  
  -- Employee inputs
  employee_status TEXT, -- 'on_track', 'at_risk', 'blocked', 'ahead'
  employee_commentary TEXT,
  achievements TEXT, -- what was accomplished
  blockers TEXT, -- obstacles faced
  next_steps TEXT,
  
  -- Manager inputs
  manager_commentary TEXT,
  manager_assessment TEXT, -- 'on_track', 'needs_attention', 'off_track'
  coaching_notes TEXT,
  action_items TEXT,
  
  -- Evidence
  evidence_urls TEXT[] DEFAULT '{}', -- array of attachment URLs
  
  -- Workflow status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'employee_submitted', 'manager_reviewed', 'completed'
  employee_submitted_at TIMESTAMPTZ,
  manager_reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Goal Milestones (structured milestone tracking)
CREATE TABLE public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_date DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'missed'
  weight NUMERIC DEFAULT 0, -- contributes to overall goal progress (0-100)
  sequence_order INTEGER DEFAULT 0, -- display order
  
  -- Evidence
  evidence_url TEXT,
  evidence_notes TEXT,
  
  created_by UUID REFERENCES public.profiles(id),
  completed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Goal Progress History (audit trail of progress changes)
CREATE TABLE public.goal_progress_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES public.profiles(id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  progress_percentage NUMERIC NOT NULL,
  previous_percentage NUMERIC, -- what it was before
  current_value NUMERIC,
  previous_value NUMERIC,
  source TEXT NOT NULL, -- 'manual', 'milestone', 'check_in', 'kpi_sync', 'rollup'
  source_id UUID, -- link to check_in or milestone
  notes TEXT
);

-- 4. Goal Check-in Schedules (cadence configuration)
CREATE TABLE public.goal_check_in_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  goal_cycle_id UUID REFERENCES public.goal_cycles(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id), -- optional, if per-employee
  goal_id UUID REFERENCES public.performance_goals(id) ON DELETE CASCADE, -- optional, if per-goal
  
  cadence TEXT NOT NULL DEFAULT 'monthly', -- 'weekly', 'bi_weekly', 'monthly', 'quarterly'
  day_of_week INTEGER, -- 0-6 for weekly/bi-weekly
  day_of_month INTEGER, -- 1-31 for monthly
  next_check_in_date DATE,
  last_check_in_date DATE,
  reminder_days_before INTEGER DEFAULT 3,
  auto_create_check_in BOOLEAN DEFAULT true,
  require_manager_review BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure we don't have duplicate schedules
  CONSTRAINT unique_goal_schedule UNIQUE (goal_id) -- one schedule per goal
);

-- 5. Add progress tracking fields to performance_goals
ALTER TABLE public.performance_goals
ADD COLUMN IF NOT EXISTS check_in_cadence TEXT, -- 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'none'
ADD COLUMN IF NOT EXISTS last_check_in_date DATE,
ADD COLUMN IF NOT EXISTS next_check_in_due DATE,
ADD COLUMN IF NOT EXISTS milestone_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS milestones_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_method TEXT DEFAULT 'manual'; -- 'manual', 'milestones', 'kpi', 'composite'

-- =====================================================
-- Indexes for performance
-- =====================================================

CREATE INDEX idx_goal_check_ins_goal ON public.goal_check_ins(goal_id);
CREATE INDEX idx_goal_check_ins_employee ON public.goal_check_ins(employee_id);
CREATE INDEX idx_goal_check_ins_status ON public.goal_check_ins(status);
CREATE INDEX idx_goal_check_ins_date ON public.goal_check_ins(check_in_date);

CREATE INDEX idx_goal_milestones_goal ON public.goal_milestones(goal_id);
CREATE INDEX idx_goal_milestones_status ON public.goal_milestones(status);
CREATE INDEX idx_goal_milestones_due_date ON public.goal_milestones(due_date);

CREATE INDEX idx_goal_progress_history_goal ON public.goal_progress_history(goal_id);
CREATE INDEX idx_goal_progress_history_recorded ON public.goal_progress_history(recorded_at);

CREATE INDEX idx_goal_check_in_schedules_company ON public.goal_check_in_schedules(company_id);
CREATE INDEX idx_goal_check_in_schedules_next ON public.goal_check_in_schedules(next_check_in_date) WHERE is_active = true;

-- =====================================================
-- Enable RLS
-- =====================================================

ALTER TABLE public.goal_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_check_in_schedules ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies - Goal Check-ins
-- =====================================================

CREATE POLICY "Users can view check-ins for their goals"
ON public.goal_check_ins FOR SELECT
USING (
  employee_id = auth.uid() 
  OR manager_id = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
);

CREATE POLICY "Employees can create check-ins for their goals"
ON public.goal_check_ins FOR INSERT
WITH CHECK (
  employee_id = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
);

CREATE POLICY "Users can update their own check-ins"
ON public.goal_check_ins FOR UPDATE
USING (
  employee_id = auth.uid() 
  OR manager_id = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
);

-- =====================================================
-- RLS Policies - Goal Milestones
-- =====================================================

CREATE POLICY "Users can view milestones for their goals"
ON public.goal_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.performance_goals pg
    WHERE pg.id = goal_milestones.goal_id
    AND (pg.employee_id = auth.uid() OR pg.assigned_by = auth.uid())
  )
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
);

CREATE POLICY "Users can manage milestones for their goals"
ON public.goal_milestones FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.performance_goals pg
    WHERE pg.id = goal_milestones.goal_id
    AND (pg.employee_id = auth.uid() OR pg.assigned_by = auth.uid())
  )
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
);

CREATE POLICY "Users can update milestones for their goals"
ON public.goal_milestones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.performance_goals pg
    WHERE pg.id = goal_milestones.goal_id
    AND (pg.employee_id = auth.uid() OR pg.assigned_by = auth.uid())
  )
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
);

CREATE POLICY "Users can delete milestones for their goals"
ON public.goal_milestones FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.performance_goals pg
    WHERE pg.id = goal_milestones.goal_id
    AND (pg.employee_id = auth.uid() OR pg.assigned_by = auth.uid())
  )
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
);

-- =====================================================
-- RLS Policies - Goal Progress History (read-only for users)
-- =====================================================

CREATE POLICY "Users can view progress history for their goals"
ON public.goal_progress_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.performance_goals pg
    WHERE pg.id = goal_progress_history.goal_id
    AND (pg.employee_id = auth.uid() OR pg.assigned_by = auth.uid())
  )
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
);

CREATE POLICY "System can insert progress history"
ON public.goal_progress_history FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- RLS Policies - Check-in Schedules
-- =====================================================

CREATE POLICY "Users can view check-in schedules"
ON public.goal_check_in_schedules FOR SELECT
USING (
  employee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.performance_goals pg
    WHERE pg.id = goal_check_in_schedules.goal_id
    AND (pg.employee_id = auth.uid() OR pg.assigned_by = auth.uid())
  )
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
);

CREATE POLICY "Admins can manage check-in schedules"
ON public.goal_check_in_schedules FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager']));

-- =====================================================
-- Triggers for updated_at
-- =====================================================

CREATE TRIGGER update_goal_check_ins_updated_at
BEFORE UPDATE ON public.goal_check_ins
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_milestones_updated_at
BEFORE UPDATE ON public.goal_milestones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_check_in_schedules_updated_at
BEFORE UPDATE ON public.goal_check_in_schedules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Function to update milestone counts on goal
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_goal_milestone_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.performance_goals
  SET 
    milestone_count = (
      SELECT COUNT(*) FROM public.goal_milestones 
      WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id)
    ),
    milestones_completed = (
      SELECT COUNT(*) FROM public.goal_milestones 
      WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id) 
      AND status = 'completed'
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_milestone_counts
AFTER INSERT OR UPDATE OR DELETE ON public.goal_milestones
FOR EACH ROW EXECUTE FUNCTION public.update_goal_milestone_counts();

-- =====================================================
-- Function to log progress history automatically
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_goal_progress_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if progress_percentage actually changed
  IF OLD.progress_percentage IS DISTINCT FROM NEW.progress_percentage THEN
    INSERT INTO public.goal_progress_history (
      goal_id,
      recorded_by,
      progress_percentage,
      previous_percentage,
      current_value,
      previous_value,
      source,
      notes
    ) VALUES (
      NEW.id,
      auth.uid(),
      NEW.progress_percentage,
      OLD.progress_percentage,
      NEW.current_value,
      OLD.current_value,
      'manual',
      'Progress updated from ' || COALESCE(OLD.progress_percentage, 0) || '% to ' || NEW.progress_percentage || '%'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_log_progress_change
AFTER UPDATE ON public.performance_goals
FOR EACH ROW EXECUTE FUNCTION public.log_goal_progress_change();

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE public.goal_check_ins IS 'Structured check-ins for goal progress tracking with employee and manager inputs';
COMMENT ON TABLE public.goal_milestones IS 'Milestones for goals with due dates, weights, and completion tracking';
COMMENT ON TABLE public.goal_progress_history IS 'Audit trail of all progress changes for compliance and reporting';
COMMENT ON TABLE public.goal_check_in_schedules IS 'Configurable check-in cadence schedules for goals or employees';

COMMENT ON COLUMN public.performance_goals.progress_method IS 'How progress is calculated: manual, milestones, kpi, or composite';
COMMENT ON COLUMN public.performance_goals.check_in_cadence IS 'Frequency of required check-ins: weekly, bi_weekly, monthly, quarterly, or none';