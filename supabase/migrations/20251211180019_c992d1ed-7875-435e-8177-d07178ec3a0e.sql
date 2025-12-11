-- Create workflow status enum
CREATE TYPE public.workflow_status AS ENUM (
  'draft',
  'pending',
  'in_progress', 
  'approved',
  'rejected',
  'cancelled',
  'escalated',
  'returned',
  'auto_terminated'
);

-- Create workflow step action enum
CREATE TYPE public.workflow_action AS ENUM (
  'approve',
  'reject',
  'return',
  'escalate',
  'delegate',
  'comment'
);

-- Create workflow category enum
CREATE TYPE public.workflow_category AS ENUM (
  'leave_request',
  'probation_confirmation',
  'headcount_request',
  'training_request',
  'promotion',
  'transfer',
  'resignation',
  'termination',
  'expense_claim',
  'letter_request',
  'general'
);

-- Workflow Templates - defines the approval flow structure
CREATE TABLE public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  category workflow_category NOT NULL,
  description TEXT,
  company_id UUID REFERENCES public.companies(id),
  is_global BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Configuration
  requires_signature BOOLEAN NOT NULL DEFAULT false,
  requires_letter BOOLEAN NOT NULL DEFAULT false,
  letter_template_id UUID REFERENCES public.letter_templates(id),
  auto_terminate_hours INTEGER, -- NULL means no auto-termination
  allow_return_to_previous BOOLEAN NOT NULL DEFAULT true,
  
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflow Steps - defines each stage in the workflow
CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Approver configuration
  approver_type TEXT NOT NULL CHECK (approver_type IN ('employee', 'manager', 'hr', 'position', 'role', 'governance_body', 'specific_user')),
  approver_position_id UUID REFERENCES public.positions(id),
  approver_role_id UUID REFERENCES public.roles(id),
  approver_governance_body_id UUID REFERENCES public.governance_bodies(id),
  approver_user_id UUID REFERENCES public.profiles(id),
  use_reporting_line BOOLEAN NOT NULL DEFAULT false, -- Use initiator's reporting position
  
  -- Step requirements
  requires_signature BOOLEAN NOT NULL DEFAULT false,
  requires_comment BOOLEAN NOT NULL DEFAULT false,
  can_delegate BOOLEAN NOT NULL DEFAULT true,
  
  -- Escalation configuration
  escalation_hours INTEGER, -- Hours before escalation
  escalation_action TEXT CHECK (escalation_action IN ('escalate_up', 'notify_alternate', 'auto_approve', 'auto_reject', 'terminate')),
  alternate_approver_id UUID REFERENCES public.profiles(id),
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(template_id, step_order)
);

-- Workflow Instances - actual workflow executions
CREATE TABLE public.workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.workflow_templates(id),
  category workflow_category NOT NULL,
  reference_type TEXT NOT NULL, -- e.g., 'leave_request', 'headcount_request', etc.
  reference_id UUID NOT NULL, -- ID of the related entity
  
  -- Tracking
  status workflow_status NOT NULL DEFAULT 'draft',
  current_step_id UUID REFERENCES public.workflow_steps(id),
  current_step_order INTEGER NOT NULL DEFAULT 1,
  
  -- Initiator info
  initiated_by UUID NOT NULL REFERENCES public.profiles(id),
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Completion info
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  final_action workflow_action,
  
  -- Deadline tracking
  deadline_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  auto_terminate_at TIMESTAMPTZ,
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,
  
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflow Step Actions - tracks each action taken in a workflow
CREATE TABLE public.workflow_step_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.workflow_steps(id),
  step_order INTEGER NOT NULL,
  
  -- Action details
  action workflow_action NOT NULL,
  actor_id UUID NOT NULL REFERENCES public.profiles(id),
  acted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Comments and notes
  comment TEXT,
  internal_notes TEXT,
  
  -- Delegation info
  delegated_to UUID REFERENCES public.profiles(id),
  delegation_reason TEXT,
  
  -- Return info
  return_to_step INTEGER,
  return_reason TEXT,
  
  -- Tracking
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Digital Signatures for workflow approvals
CREATE TABLE public.workflow_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  step_action_id UUID NOT NULL REFERENCES public.workflow_step_actions(id) ON DELETE CASCADE,
  
  -- Signature data
  signer_id UUID NOT NULL REFERENCES public.profiles(id),
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signer_position TEXT,
  
  -- Typed confirmation
  signature_text TEXT NOT NULL, -- The typed name/confirmation
  signature_hash TEXT NOT NULL, -- Hash of signature + timestamp + user data
  
  -- Verification data
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  
  -- Generated letter reference
  generated_letter_id UUID REFERENCES public.generated_letters(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflow Delegates - allows users to designate alternates
CREATE TABLE public.workflow_delegates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delegator_id UUID NOT NULL REFERENCES public.profiles(id),
  delegate_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Scope
  category workflow_category, -- NULL means all categories
  template_id UUID REFERENCES public.workflow_templates(id), -- NULL means all templates
  
  -- Validity period
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  reason TEXT,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(delegator_id, delegate_id, category, template_id)
);

-- Create indexes for performance
CREATE INDEX idx_workflow_instances_status ON public.workflow_instances(status);
CREATE INDEX idx_workflow_instances_reference ON public.workflow_instances(reference_type, reference_id);
CREATE INDEX idx_workflow_instances_initiated_by ON public.workflow_instances(initiated_by);
CREATE INDEX idx_workflow_step_actions_instance ON public.workflow_step_actions(instance_id);
CREATE INDEX idx_workflow_signatures_instance ON public.workflow_signatures(instance_id);
CREATE INDEX idx_workflow_delegates_delegator ON public.workflow_delegates(delegator_id);
CREATE INDEX idx_workflow_delegates_delegate ON public.workflow_delegates(delegate_id);

-- Enable RLS
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_delegates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_templates
CREATE POLICY "Admins can manage workflow templates"
ON public.workflow_templates FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active templates"
ON public.workflow_templates FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS Policies for workflow_steps
CREATE POLICY "Admins can manage workflow steps"
ON public.workflow_steps FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active steps"
ON public.workflow_steps FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS Policies for workflow_instances
CREATE POLICY "Users can view own initiated workflows"
ON public.workflow_instances FOR SELECT
USING (auth.uid() = initiated_by);

CREATE POLICY "Approvers can view assigned workflows"
ON public.workflow_instances FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create workflow instances"
ON public.workflow_instances FOR INSERT
WITH CHECK (auth.uid() = initiated_by);

CREATE POLICY "Authorized users can update workflow instances"
ON public.workflow_instances FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete workflow instances"
ON public.workflow_instances FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for workflow_step_actions
CREATE POLICY "Users can view workflow actions"
ON public.workflow_step_actions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create actions"
ON public.workflow_step_actions FOR INSERT
WITH CHECK (auth.uid() = actor_id);

-- RLS Policies for workflow_signatures
CREATE POLICY "Users can view signatures"
ON public.workflow_signatures FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own signatures"
ON public.workflow_signatures FOR INSERT
WITH CHECK (auth.uid() = signer_id);

-- RLS Policies for workflow_delegates
CREATE POLICY "Users can view own delegations"
ON public.workflow_delegates FOR SELECT
USING (auth.uid() = delegator_id OR auth.uid() = delegate_id);

CREATE POLICY "Users can manage own delegations"
ON public.workflow_delegates FOR INSERT
WITH CHECK (auth.uid() = delegator_id);

CREATE POLICY "Users can update own delegations"
ON public.workflow_delegates FOR UPDATE
USING (auth.uid() = delegator_id);

CREATE POLICY "Users can delete own delegations"
ON public.workflow_delegates FOR DELETE
USING (auth.uid() = delegator_id);

CREATE POLICY "Admins can manage all delegations"
ON public.workflow_delegates FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Function to get current approver for a workflow step
CREATE OR REPLACE FUNCTION public.get_workflow_approver(
  p_instance_id UUID,
  p_step_id UUID
)
RETURNS TABLE(approver_id UUID, approver_name TEXT, approver_email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_step workflow_steps%ROWTYPE;
  v_instance workflow_instances%ROWTYPE;
  v_initiator_position_id UUID;
  v_manager_id UUID;
BEGIN
  SELECT * INTO v_step FROM workflow_steps WHERE id = p_step_id;
  SELECT * INTO v_instance FROM workflow_instances WHERE id = p_instance_id;
  
  -- Get initiator's position for reporting line
  SELECT ep.position_id INTO v_initiator_position_id
  FROM employee_positions ep
  WHERE ep.employee_id = v_instance.initiated_by AND ep.is_active = true AND ep.is_primary = true
  LIMIT 1;
  
  CASE v_step.approver_type
    WHEN 'specific_user' THEN
      RETURN QUERY
      SELECT p.id, p.full_name, p.email
      FROM profiles p WHERE p.id = v_step.approver_user_id;
      
    WHEN 'manager' THEN
      -- Get manager via reporting line
      SELECT sup.supervisor_id INTO v_manager_id
      FROM get_employee_supervisor(v_instance.initiated_by, v_initiator_position_id) sup;
      
      RETURN QUERY
      SELECT p.id, p.full_name, p.email
      FROM profiles p WHERE p.id = v_manager_id;
      
    WHEN 'position' THEN
      RETURN QUERY
      SELECT p.id, p.full_name, p.email
      FROM profiles p
      JOIN employee_positions ep ON ep.employee_id = p.id
      WHERE ep.position_id = v_step.approver_position_id AND ep.is_active = true;
      
    WHEN 'role' THEN
      RETURN QUERY
      SELECT DISTINCT p.id, p.full_name, p.email
      FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      JOIN roles r ON r.id = v_step.approver_role_id
      WHERE ur.role::text = r.code;
      
    WHEN 'hr' THEN
      RETURN QUERY
      SELECT DISTINCT p.id, p.full_name, p.email
      FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      WHERE ur.role = 'hr_manager';
      
    WHEN 'governance_body' THEN
      RETURN QUERY
      SELECT p.id, p.full_name, p.email
      FROM profiles p
      JOIN governance_members gm ON gm.employee_id = p.id
      WHERE gm.governance_body_id = v_step.approver_governance_body_id
        AND gm.is_active = true;
        
    ELSE
      -- Default to admins
      RETURN QUERY
      SELECT DISTINCT p.id, p.full_name, p.email
      FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      WHERE ur.role = 'admin';
  END CASE;
END;
$$;

-- Function to check if user can act on workflow
CREATE OR REPLACE FUNCTION public.can_act_on_workflow(
  p_user_id UUID,
  p_instance_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_instance workflow_instances%ROWTYPE;
  v_is_approver BOOLEAN := false;
  v_is_delegate BOOLEAN := false;
BEGIN
  SELECT * INTO v_instance FROM workflow_instances WHERE id = p_instance_id;
  
  IF v_instance.status NOT IN ('pending', 'in_progress', 'escalated') THEN
    RETURN false;
  END IF;
  
  -- Check if user is a designated approver
  SELECT EXISTS (
    SELECT 1 FROM get_workflow_approver(p_instance_id, v_instance.current_step_id)
    WHERE approver_id = p_user_id
  ) INTO v_is_approver;
  
  IF v_is_approver THEN
    RETURN true;
  END IF;
  
  -- Check if user is a delegate for any approver
  SELECT EXISTS (
    SELECT 1 
    FROM workflow_delegates wd
    JOIN get_workflow_approver(p_instance_id, v_instance.current_step_id) wa ON wa.approver_id = wd.delegator_id
    WHERE wd.delegate_id = p_user_id
      AND wd.is_active = true
      AND CURRENT_DATE BETWEEN wd.start_date AND COALESCE(wd.end_date, CURRENT_DATE)
      AND (wd.category IS NULL OR wd.category = v_instance.category)
  ) INTO v_is_delegate;
  
  RETURN v_is_delegate;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_workflow_templates_updated_at
BEFORE UPDATE ON public.workflow_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at
BEFORE UPDATE ON public.workflow_steps
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at
BEFORE UPDATE ON public.workflow_instances
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_delegates_updated_at
BEFORE UPDATE ON public.workflow_delegates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();