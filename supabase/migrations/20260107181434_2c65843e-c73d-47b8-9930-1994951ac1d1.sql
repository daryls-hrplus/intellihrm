-- Create ESS approval policies table for configuring field-level approval modes
CREATE TABLE public.ess_approval_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  field_name TEXT,
  approval_mode TEXT NOT NULL DEFAULT 'hr_review' CHECK (approval_mode IN ('auto_approve', 'hr_review', 'workflow')),
  workflow_template_id UUID REFERENCES public.workflow_templates(id) ON DELETE SET NULL,
  requires_documentation BOOLEAN DEFAULT false,
  notification_only BOOLEAN DEFAULT false,
  effective_date DATE DEFAULT CURRENT_DATE,
  country_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(company_id, request_type, field_name, country_code)
);

-- Enable RLS
ALTER TABLE public.ess_approval_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their company's ESS approval policies"
  ON public.ess_approval_policies
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "HR users can manage ESS approval policies"
  ON public.ess_approval_policies
  FOR ALL
  USING (
    company_id IN (
      SELECT p.company_id FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.id
      JOIN public.roles r ON r.id = ur.role_id
      WHERE p.id = auth.uid() 
      AND r.code IN ('hr', 'admin', 'super_admin')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_ess_approval_policies_updated_at
  BEFORE UPDATE ON public.ess_approval_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for efficient lookups
CREATE INDEX idx_ess_approval_policies_lookup 
  ON public.ess_approval_policies(company_id, request_type, is_active);

-- Add comment for documentation
COMMENT ON TABLE public.ess_approval_policies IS 'Configures approval modes for ESS data change requests by field type';