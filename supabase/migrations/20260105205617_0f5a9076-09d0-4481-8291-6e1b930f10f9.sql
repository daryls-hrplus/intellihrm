-- Create workflow approval roles table
CREATE TABLE IF NOT EXISTS public.workflow_approval_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  description text,
  company_id uuid REFERENCES public.companies(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  UNIQUE(code, company_id)
);

-- Create junction table for workflow approval roles and positions
CREATE TABLE IF NOT EXISTS public.workflow_approval_role_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_role_id uuid NOT NULL REFERENCES public.workflow_approval_roles(id) ON DELETE CASCADE,
  position_id uuid NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  priority_order integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(workflow_role_id, position_id)
);

-- Add workflow_approval_role_id to workflow_steps
ALTER TABLE public.workflow_steps
ADD COLUMN IF NOT EXISTS workflow_approval_role_id uuid REFERENCES public.workflow_approval_roles(id);

-- Add escalation tracking fields to workflow_instances
ALTER TABLE public.workflow_instances
ADD COLUMN IF NOT EXISTS alternate_notified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS alternate_approver_id uuid REFERENCES public.profiles(id);

-- Enable RLS
ALTER TABLE public.workflow_approval_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_approval_role_positions ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflow_approval_roles
CREATE POLICY "Users can view workflow approval roles"
ON public.workflow_approval_roles FOR SELECT
USING (
  is_active = true OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.code IN ('super_admin', 'admin', 'hr_admin', 'hr_manager')
  )
);

CREATE POLICY "Admins can manage workflow approval roles"
ON public.workflow_approval_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.code IN ('super_admin', 'admin', 'hr_admin')
  )
);

-- RLS policies for workflow_approval_role_positions
CREATE POLICY "Users can view role positions"
ON public.workflow_approval_role_positions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workflow_approval_roles war
    WHERE war.id = workflow_role_id
    AND (war.is_active = true OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('super_admin', 'admin', 'hr_admin', 'hr_manager')
    ))
  )
);

CREATE POLICY "Admins can manage role positions"
ON public.workflow_approval_role_positions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.code IN ('super_admin', 'admin', 'hr_admin')
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workflow_approval_roles_company ON public.workflow_approval_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approval_roles_active ON public.workflow_approval_roles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_workflow_role_positions_role ON public.workflow_approval_role_positions(workflow_role_id);
CREATE INDEX IF NOT EXISTS idx_workflow_role_positions_position ON public.workflow_approval_role_positions(position_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_approval_role ON public.workflow_steps(workflow_approval_role_id);

-- Add comments
COMMENT ON TABLE public.workflow_approval_roles IS 'Custom workflow-specific approval roles defined by positions';
COMMENT ON TABLE public.workflow_approval_role_positions IS 'Links workflow approval roles to positions - anyone holding linked positions can approve';
COMMENT ON COLUMN public.workflow_approval_role_positions.is_primary IS 'If true, this position is the primary approver; others are alternates';
COMMENT ON COLUMN public.workflow_approval_role_positions.priority_order IS 'Order in which position holders are checked for approval';