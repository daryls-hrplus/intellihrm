-- =============================================
-- Phase 2: Goal Approval Configuration
-- =============================================

-- 1. Create goal_approval_rules table
CREATE TABLE public.goal_approval_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal_level TEXT NOT NULL CHECK (goal_level IN ('individual', 'team', 'department', 'company')),
  approval_type TEXT NOT NULL DEFAULT 'single_level' CHECK (approval_type IN ('single_level', 'multi_level', 'skip_level', 'no_approval')),
  requires_hr_approval BOOLEAN DEFAULT false,
  auto_approve_if_manager BOOLEAN DEFAULT false,
  max_approval_days INTEGER DEFAULT 7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create goal_approval_chain table (defines approval steps per rule)
CREATE TABLE public.goal_approval_chain (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.goal_approval_rules(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  approver_type TEXT NOT NULL CHECK (approver_type IN ('direct_manager', 'skip_manager', 'hr', 'department_head', 'specific_user')),
  approver_user_id UUID REFERENCES public.profiles(id),
  is_optional BOOLEAN DEFAULT false,
  sla_hours INTEGER DEFAULT 48,
  can_delegate BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rule_id, step_order)
);

-- 3. Create goal_approvals table (instance tracking for each goal's approval process)
CREATE TABLE public.goal_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.goal_approval_rules(id),
  step_order INTEGER NOT NULL,
  approver_id UUID NOT NULL REFERENCES public.profiles(id),
  delegated_from UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'skipped', 'expired')),
  comments TEXT,
  decided_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create goal_approval_history for audit trail
CREATE TABLE public.goal_approval_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  approval_id UUID REFERENCES public.goal_approvals(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'returned', 'resubmitted', 'escalated', 'delegated', 'expired')),
  actor_id UUID REFERENCES public.profiles(id),
  comments TEXT,
  previous_status TEXT,
  new_status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create indexes for performance
CREATE INDEX idx_goal_approval_rules_company_id ON public.goal_approval_rules(company_id);
CREATE INDEX idx_goal_approval_rules_goal_level ON public.goal_approval_rules(goal_level);
CREATE INDEX idx_goal_approval_chain_rule_id ON public.goal_approval_chain(rule_id);
CREATE INDEX idx_goal_approvals_goal_id ON public.goal_approvals(goal_id);
CREATE INDEX idx_goal_approvals_approver_id ON public.goal_approvals(approver_id);
CREATE INDEX idx_goal_approvals_status ON public.goal_approvals(status);
CREATE INDEX idx_goal_approval_history_goal_id ON public.goal_approval_history(goal_id);

-- 6. Enable RLS
ALTER TABLE public.goal_approval_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_approval_chain ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_approval_history ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for goal_approval_rules
CREATE POLICY "Users can view approval rules for their company"
  ON public.goal_approval_rules FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "HR and admins can manage approval rules"
  ON public.goal_approval_rules FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'hr_manager')
    )
  );

-- 8. RLS Policies for goal_approval_chain
CREATE POLICY "Users can view approval chains for their company rules"
  ON public.goal_approval_chain FOR SELECT
  USING (
    rule_id IN (
      SELECT id FROM public.goal_approval_rules 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "HR and admins can manage approval chains"
  ON public.goal_approval_chain FOR ALL
  USING (
    rule_id IN (
      SELECT id FROM public.goal_approval_rules 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        AND (
          public.has_role(auth.uid(), 'admin') OR
          public.has_role(auth.uid(), 'hr_manager')
        )
    )
  );

-- 9. RLS Policies for goal_approvals
CREATE POLICY "Users can view their own goal approvals"
  ON public.goal_approvals FOR SELECT
  USING (
    approver_id = auth.uid() OR
    goal_id IN (SELECT id FROM public.performance_goals WHERE employee_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Approvers can update their pending approvals"
  ON public.goal_approvals FOR UPDATE
  USING (
    approver_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "System can insert approvals"
  ON public.goal_approvals FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'hr_manager') OR
    goal_id IN (SELECT id FROM public.performance_goals WHERE employee_id = auth.uid())
  );

-- 10. RLS Policies for goal_approval_history
CREATE POLICY "Users can view approval history for their goals"
  ON public.goal_approval_history FOR SELECT
  USING (
    goal_id IN (SELECT id FROM public.performance_goals WHERE employee_id = auth.uid()) OR
    actor_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "System can insert approval history"
  ON public.goal_approval_history FOR INSERT
  WITH CHECK (true);

-- 11. Triggers for updated_at
CREATE TRIGGER update_goal_approval_rules_updated_at
  BEFORE UPDATE ON public.goal_approval_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_approval_chain_updated_at
  BEFORE UPDATE ON public.goal_approval_chain
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_approvals_updated_at
  BEFORE UPDATE ON public.goal_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Function to submit goal for approval
CREATE OR REPLACE FUNCTION public.submit_goal_for_approval(p_goal_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_goal RECORD;
  v_rule RECORD;
  v_chain RECORD;
  v_approver_id UUID;
  v_step_count INTEGER := 0;
BEGIN
  -- Get goal details
  SELECT g.*, p.company_id 
  INTO v_goal 
  FROM performance_goals g
  JOIN profiles p ON g.employee_id = p.id
  WHERE g.id = p_goal_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Goal not found');
  END IF;
  
  -- Check if goal is editable
  IF NOT is_goal_editable(p_goal_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Goal is locked or not editable');
  END IF;
  
  -- Find applicable approval rule
  SELECT * INTO v_rule
  FROM goal_approval_rules
  WHERE company_id = v_goal.company_id
    AND goal_level = v_goal.goal_level
    AND is_active = true
  LIMIT 1;
  
  -- If no approval required or no rule found, auto-approve
  IF NOT FOUND OR v_rule.approval_type = 'no_approval' THEN
    UPDATE performance_goals
    SET status = 'active', approved_at = now(), submitted_at = now()
    WHERE id = p_goal_id;
    
    INSERT INTO goal_approval_history (goal_id, action, actor_id, previous_status, new_status)
    VALUES (p_goal_id, 'approved', auth.uid(), v_goal.status, 'active');
    
    RETURN jsonb_build_object('success', true, 'message', 'Goal auto-approved (no approval required)');
  END IF;
  
  -- Create approval instances for each step in the chain
  FOR v_chain IN
    SELECT * FROM goal_approval_chain
    WHERE rule_id = v_rule.id
    ORDER BY step_order
  LOOP
    -- Determine approver based on type
    CASE v_chain.approver_type
      WHEN 'direct_manager' THEN
        SELECT supervisor_id INTO v_approver_id
        FROM get_employee_supervisor(v_goal.employee_id);
      WHEN 'specific_user' THEN
        v_approver_id := v_chain.approver_user_id;
      WHEN 'hr' THEN
        -- Get first HR user in company
        SELECT ur.user_id INTO v_approver_id
        FROM user_roles ur
        JOIN profiles p ON ur.user_id = p.id
        WHERE p.company_id = v_goal.company_id
          AND ur.role = 'hr_manager'
        LIMIT 1;
      ELSE
        v_approver_id := NULL;
    END CASE;
    
    IF v_approver_id IS NOT NULL THEN
      INSERT INTO goal_approvals (goal_id, rule_id, step_order, approver_id, due_date)
      VALUES (
        p_goal_id, 
        v_rule.id, 
        v_chain.step_order, 
        v_approver_id,
        now() + (v_chain.sla_hours || ' hours')::INTERVAL
      );
      v_step_count := v_step_count + 1;
    END IF;
  END LOOP;
  
  -- Update goal status
  UPDATE performance_goals
  SET status = 'submitted', submitted_at = now()
  WHERE id = p_goal_id;
  
  -- Log the submission
  INSERT INTO goal_approval_history (goal_id, action, actor_id, previous_status, new_status)
  VALUES (p_goal_id, 'submitted', auth.uid(), v_goal.status, 'submitted');
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Goal submitted for approval',
    'approval_steps', v_step_count
  );
END;
$$;

-- 13. Function to process approval decision
CREATE OR REPLACE FUNCTION public.process_goal_approval(
  p_approval_id UUID,
  p_decision TEXT,
  p_comments TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_approval RECORD;
  v_goal RECORD;
  v_next_pending INTEGER;
  v_all_approved BOOLEAN;
BEGIN
  -- Get approval details
  SELECT * INTO v_approval FROM goal_approvals WHERE id = p_approval_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Approval not found');
  END IF;
  
  -- Verify approver
  IF v_approval.approver_id != auth.uid() AND NOT has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized to approve');
  END IF;
  
  -- Check status
  IF v_approval.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Approval already processed');
  END IF;
  
  -- Update approval
  UPDATE goal_approvals
  SET status = p_decision, comments = p_comments, decided_at = now()
  WHERE id = p_approval_id;
  
  -- Get goal
  SELECT * INTO v_goal FROM performance_goals WHERE id = v_approval.goal_id;
  
  -- Log the decision
  INSERT INTO goal_approval_history (goal_id, approval_id, action, actor_id, comments, previous_status, new_status)
  VALUES (v_approval.goal_id, p_approval_id, p_decision, auth.uid(), p_comments, 'pending', p_decision);
  
  -- Handle decision
  IF p_decision = 'rejected' THEN
    UPDATE performance_goals
    SET status = 'draft'
    WHERE id = v_approval.goal_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'Goal rejected');
    
  ELSIF p_decision = 'returned' THEN
    UPDATE performance_goals
    SET status = 'draft'
    WHERE id = v_approval.goal_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'Goal returned for revision');
    
  ELSIF p_decision = 'approved' THEN
    -- Check if all approvals are complete
    SELECT COUNT(*) = 0 INTO v_all_approved
    FROM goal_approvals
    WHERE goal_id = v_approval.goal_id
      AND status = 'pending'
      AND step_order > v_approval.step_order;
    
    IF v_all_approved THEN
      UPDATE performance_goals
      SET status = 'active', approved_at = now(), approved_by = auth.uid()
      WHERE id = v_approval.goal_id;
      
      RETURN jsonb_build_object('success', true, 'message', 'Goal fully approved and activated');
    ELSE
      RETURN jsonb_build_object('success', true, 'message', 'Approval recorded, awaiting next approver');
    END IF;
  END IF;
  
  RETURN jsonb_build_object('success', false, 'error', 'Invalid decision');
END;
$$;