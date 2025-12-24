-- =============================================
-- Goal Framework & Governance Foundation
-- =============================================

-- 1. Create goal_cycles table for cycle management
CREATE TABLE public.goal_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('financial_year', 'rolling', 'project_based', 'quarterly', 'annual')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goal_setting_start DATE,
  goal_setting_end DATE,
  review_start DATE,
  review_end DATE,
  freeze_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT goal_cycles_date_check CHECK (end_date > start_date)
);

-- 2. Add new columns to performance_goals for locking and cycle support
ALTER TABLE public.performance_goals 
  ADD COLUMN IF NOT EXISTS goal_cycle_id UUID REFERENCES public.goal_cycles(id),
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS lock_reason TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS adjustment_count INTEGER DEFAULT 0;

-- 3. Create goal_owners junction table for shared/team goals
CREATE TABLE public.goal_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ownership_type TEXT NOT NULL DEFAULT 'primary' CHECK (ownership_type IN ('primary', 'contributor', 'observer')),
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(goal_id, employee_id)
);

-- 4. Create indexes for performance
CREATE INDEX idx_goal_cycles_company_id ON public.goal_cycles(company_id);
CREATE INDEX idx_goal_cycles_status ON public.goal_cycles(status);
CREATE INDEX idx_goal_cycles_dates ON public.goal_cycles(start_date, end_date);
CREATE INDEX idx_performance_goals_cycle_id ON public.performance_goals(goal_cycle_id);
CREATE INDEX idx_performance_goals_locked ON public.performance_goals(is_locked) WHERE is_locked = true;
CREATE INDEX idx_goal_owners_goal_id ON public.goal_owners(goal_id);
CREATE INDEX idx_goal_owners_employee_id ON public.goal_owners(employee_id);

-- 5. Enable RLS
ALTER TABLE public.goal_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_owners ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for goal_cycles (using valid app_role values)
CREATE POLICY "Users can view goal cycles for their company"
  ON public.goal_cycles FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "HR and admins can manage goal cycles"
  ON public.goal_cycles FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'hr_manager')
    )
  );

-- 7. RLS Policies for goal_owners
CREATE POLICY "Users can view goal ownership for their goals"
  ON public.goal_owners FOR SELECT
  USING (
    employee_id = auth.uid() OR
    goal_id IN (SELECT id FROM public.performance_goals WHERE employee_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "HR and admins can manage goal ownership"
  ON public.goal_owners FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'hr_manager')
  );

-- 8. Triggers for updated_at
CREATE TRIGGER update_goal_cycles_updated_at
  BEFORE UPDATE ON public.goal_cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_owners_updated_at
  BEFORE UPDATE ON public.goal_owners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Function to check if goal is editable (not locked and within edit window)
CREATE OR REPLACE FUNCTION public.is_goal_editable(p_goal_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_goal RECORD;
  v_cycle RECORD;
BEGIN
  SELECT * INTO v_goal FROM performance_goals WHERE id = p_goal_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if goal is locked
  IF v_goal.is_locked = true THEN
    RETURN false;
  END IF;
  
  -- Check if goal status allows editing
  IF v_goal.status IN ('completed', 'cancelled', 'archived') THEN
    RETURN false;
  END IF;
  
  -- Check cycle freeze date if goal is linked to a cycle
  IF v_goal.goal_cycle_id IS NOT NULL THEN
    SELECT * INTO v_cycle FROM goal_cycles WHERE id = v_goal.goal_cycle_id;
    IF FOUND AND v_cycle.freeze_date IS NOT NULL AND CURRENT_DATE > v_cycle.freeze_date THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- 10. Function to auto-lock goals when cycle freeze date passes
CREATE OR REPLACE FUNCTION public.lock_goals_on_freeze()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a cycle status changes to closed, lock all associated goals
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    UPDATE performance_goals
    SET 
      is_locked = true,
      locked_at = now(),
      lock_reason = 'Cycle closed: ' || NEW.name
    WHERE goal_cycle_id = NEW.id
      AND is_locked = false;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_lock_goals_on_cycle_close
  AFTER UPDATE ON public.goal_cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.lock_goals_on_freeze();