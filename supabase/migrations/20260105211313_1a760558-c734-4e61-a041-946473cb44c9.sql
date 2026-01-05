-- Create company_transaction_workflow_settings table
CREATE TABLE public.company_transaction_workflow_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  transaction_type_id UUID NOT NULL REFERENCES public.lookup_values(id) ON DELETE CASCADE,
  workflow_enabled BOOLEAN NOT NULL DEFAULT false,
  workflow_template_id UUID REFERENCES public.workflow_templates(id) ON DELETE SET NULL,
  requires_approval_before_effective BOOLEAN NOT NULL DEFAULT false,
  auto_start_workflow BOOLEAN NOT NULL DEFAULT false,
  effective_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, transaction_type_id)
);

-- Enable RLS
ALTER TABLE public.company_transaction_workflow_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view transaction workflow settings for their company"
  ON public.company_transaction_workflow_settings
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage transaction workflow settings"
  ON public.company_transaction_workflow_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('admin', 'super_admin', 'hr_admin')
    )
    AND company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_company_transaction_workflow_settings_company 
  ON public.company_transaction_workflow_settings(company_id);
CREATE INDEX idx_company_transaction_workflow_settings_transaction_type 
  ON public.company_transaction_workflow_settings(transaction_type_id);
CREATE INDEX idx_company_transaction_workflow_settings_template 
  ON public.company_transaction_workflow_settings(workflow_template_id);

-- Trigger for updated_at
CREATE TRIGGER update_company_transaction_workflow_settings_updated_at
  BEFORE UPDATE ON public.company_transaction_workflow_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();