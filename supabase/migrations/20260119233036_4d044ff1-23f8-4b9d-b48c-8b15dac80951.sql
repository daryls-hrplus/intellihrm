-- Add ess_approval to workflow_category enum
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'ess_approval';

-- Create ESS Field Permissions table for field-level control
CREATE TABLE public.ess_field_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  module_code TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT true,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  approval_mode TEXT DEFAULT 'hr_review' CHECK (approval_mode IN ('auto_approve', 'manager_review', 'hr_review', 'workflow')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, module_code, field_name)
);

-- Enable RLS
ALTER TABLE public.ess_field_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view field permissions for their company"
  ON public.ess_field_permissions FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR admins can manage field permissions"
  ON public.ess_field_permissions FOR ALL
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Add manager_review to ess_approval_policies
ALTER TABLE public.ess_approval_policies 
  DROP CONSTRAINT IF EXISTS ess_approval_policies_approval_mode_check;

ALTER TABLE public.ess_approval_policies 
  ADD CONSTRAINT ess_approval_policies_approval_mode_check 
  CHECK (approval_mode IN ('auto_approve', 'manager_review', 'hr_review', 'workflow'));

-- Create index for performance
CREATE INDEX idx_ess_field_permissions_company_module 
  ON public.ess_field_permissions(company_id, module_code);

-- Trigger for updated_at
CREATE TRIGGER update_ess_field_permissions_updated_at
  BEFORE UPDATE ON public.ess_field_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();