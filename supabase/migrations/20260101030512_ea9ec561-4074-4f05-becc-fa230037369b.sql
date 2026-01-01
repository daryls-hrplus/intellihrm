-- First add tenant_type column to companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT 'client' CHECK (tenant_type IN ('hrplus_internal', 'client', 'demo'));

-- Demo/prospect registration table for tracking trial users and conversions
CREATE TABLE public.demo_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  country TEXT NOT NULL,
  employee_count INTEGER,
  industry TEXT,
  preferred_subdomain TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'demo_active', 'converting', 'converted', 'declined', 'expired')),
  demo_started_at TIMESTAMPTZ,
  demo_expires_at TIMESTAMPTZ,
  conversion_requested_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  assigned_subdomain TEXT,
  lovable_project_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_registrations ENABLE ROW LEVEL SECURITY;

-- Only HRplus internal users can manage demo registrations
CREATE POLICY "HRplus admins can manage demo registrations"
ON public.demo_registrations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM companies c
    JOIN profiles p ON p.company_id = c.id
    WHERE p.id = auth.uid()
    AND c.tenant_type = 'hrplus_internal'
  )
);

-- Client provisioning tasks tracking
CREATE TABLE public.client_provisioning_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES demo_registrations(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN (
    'create_project',
    'enable_cloud',
    'run_seed_script',
    'create_subdomain',
    'connect_domain',
    'verify_dns',
    'create_admin_user',
    'send_credentials'
  )),
  task_order INTEGER NOT NULL,
  task_name TEXT NOT NULL,
  is_manual BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_provisioning_tasks ENABLE ROW LEVEL SECURITY;

-- Only HRplus internal users can manage provisioning tasks
CREATE POLICY "HRplus admins can manage provisioning tasks"
ON public.client_provisioning_tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM companies c
    JOIN profiles p ON p.company_id = c.id
    WHERE p.id = auth.uid()
    AND c.tenant_type = 'hrplus_internal'
  )
);

-- Create indexes for faster lookups
CREATE INDEX idx_demo_registrations_status ON public.demo_registrations(status);
CREATE INDEX idx_demo_registrations_email ON public.demo_registrations(contact_email);
CREATE INDEX idx_provisioning_tasks_registration ON public.client_provisioning_tasks(registration_id);
CREATE INDEX idx_provisioning_tasks_status ON public.client_provisioning_tasks(status);
CREATE INDEX idx_companies_tenant_type ON public.companies(tenant_type);

-- Add updated_at triggers
CREATE TRIGGER update_demo_registrations_updated_at
  BEFORE UPDATE ON public.demo_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provisioning_tasks_updated_at
  BEFORE UPDATE ON public.client_provisioning_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();