-- Create ESS Module Configuration table
CREATE TABLE public.ess_module_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  module_code TEXT NOT NULL,
  feature_code TEXT,
  
  -- Enablement controls
  ess_enabled BOOLEAN NOT NULL DEFAULT false,
  ess_view_only BOOLEAN NOT NULL DEFAULT false,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  
  -- Tracking
  enabled_at TIMESTAMP WITH TIME ZONE,
  enabled_by UUID REFERENCES auth.users(id),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create unique index for company + module + feature combination
CREATE UNIQUE INDEX ess_module_config_unique_idx 
ON public.ess_module_config (company_id, module_code, COALESCE(feature_code, ''));

-- Enable RLS
ALTER TABLE public.ess_module_config ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage ESS config for their company
CREATE POLICY "Admins can manage ESS config"
  ON public.ess_module_config
  FOR ALL
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ))
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

-- Create trigger for updated_at
CREATE TRIGGER update_ess_module_config_updated_at
  BEFORE UPDATE ON public.ess_module_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default ESS module configuration for existing companies
INSERT INTO public.ess_module_config (company_id, module_code, ess_enabled, ess_view_only, requires_approval)
SELECT 
  c.id as company_id,
  m.module_code,
  false as ess_enabled,
  false as ess_view_only,
  true as requires_approval
FROM companies c
CROSS JOIN (
  VALUES 
    ('profile'), ('personal-info'), ('dependents'), ('documents'),
    ('leave'), ('payslips'), ('compensation'), ('benefits'),
    ('time-attendance'), ('training'), ('goals'), ('feedback'),
    ('recognition'), ('onboarding'), ('offboarding'), ('jobs'),
    ('banking'), ('expenses'), ('letters'), ('medical-info'),
    ('immigration'), ('qualifications'), ('competencies')
) AS m(module_code)
ON CONFLICT DO NOTHING;