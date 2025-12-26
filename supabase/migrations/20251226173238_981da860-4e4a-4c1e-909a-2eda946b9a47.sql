-- Create goal_adjustments table for tracking all goal changes
CREATE TABLE public.goal_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  
  -- Actor
  adjusted_by UUID NOT NULL REFERENCES public.profiles(id),
  adjusted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Change metadata
  change_type TEXT NOT NULL CHECK (change_type IN (
    'target_revision', 'timeline_extension', 'scope_change', 'weight_rebalance',
    'status_change', 'priority_change', 'ownership_transfer', 'metric_recalibration'
  )),
  adjustment_reason TEXT NOT NULL,
  reason_details TEXT,
  
  -- Before/After snapshots (JSONB for flexibility)
  previous_value JSONB,
  new_value JSONB,
  
  -- Business context
  business_justification TEXT,
  supporting_evidence TEXT,
  impact_assessment TEXT,
  
  -- Approval workflow
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Flags
  is_material_change BOOLEAN NOT NULL DEFAULT false,
  requires_recalibration BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_goal_adjustments_goal_id ON public.goal_adjustments(goal_id);
CREATE INDEX idx_goal_adjustments_company_id ON public.goal_adjustments(company_id);
CREATE INDEX idx_goal_adjustments_approval_status ON public.goal_adjustments(approval_status);
CREATE INDEX idx_goal_adjustments_adjusted_by ON public.goal_adjustments(adjusted_by);
CREATE INDEX idx_goal_adjustments_adjusted_at ON public.goal_adjustments(adjusted_at DESC);

-- Add locking columns to performance_goals if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'performance_goals' AND column_name = 'is_locked') THEN
    ALTER TABLE public.performance_goals ADD COLUMN is_locked BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'performance_goals' AND column_name = 'locked_at') THEN
    ALTER TABLE public.performance_goals ADD COLUMN locked_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'performance_goals' AND column_name = 'locked_by') THEN
    ALTER TABLE public.performance_goals ADD COLUMN locked_by UUID REFERENCES public.profiles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'performance_goals' AND column_name = 'lock_reason') THEN
    ALTER TABLE public.performance_goals ADD COLUMN lock_reason TEXT;
  END IF;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_goal_adjustments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_goal_adjustments_updated_at
  BEFORE UPDATE ON public.goal_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_goal_adjustments_updated_at();

-- Enable RLS
ALTER TABLE public.goal_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view adjustments for goals in their company
CREATE POLICY "Users can view goal adjustments in their company"
  ON public.goal_adjustments
  FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin'::public.app_role, 'hr_manager'::public.app_role, 'system_admin'::public.app_role)
    )
  );

-- RLS Policy: Users can create adjustments for their own goals or if they have hr_manager/admin role
CREATE POLICY "Users can create goal adjustments"
  ON public.goal_adjustments
  FOR INSERT
  WITH CHECK (
    adjusted_by = auth.uid()
    AND (
      -- Own goals
      goal_id IN (SELECT id FROM public.performance_goals WHERE employee_id = auth.uid())
      OR
      -- Has hr_manager/admin role
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin'::public.app_role, 'hr_manager'::public.app_role, 'system_admin'::public.app_role)
      )
    )
  );

-- RLS Policy: Users can update their own pending adjustments or hr_managers can update approval status
CREATE POLICY "Users can update goal adjustments"
  ON public.goal_adjustments
  FOR UPDATE
  USING (
    -- Own pending adjustment (can withdraw)
    (adjusted_by = auth.uid() AND approval_status = 'pending')
    OR
    -- Has hr_manager/admin role (can approve/reject)
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin'::public.app_role, 'hr_manager'::public.app_role, 'system_admin'::public.app_role)
    )
  );

-- RLS Policy: Only admins can delete adjustments (audit trail protection)
CREATE POLICY "Only admins can delete goal adjustments"
  ON public.goal_adjustments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin'::public.app_role, 'system_admin'::public.app_role)
    )
  );