-- Part 1: Add tenant_type and version fields (no enum reference issues)

-- Add tenant_type to company_groups to distinguish HRplus internal vs client tenants
ALTER TABLE public.company_groups 
ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT 'client' 
CHECK (tenant_type IN ('hrplus_internal', 'client'));

-- Create index for efficient tenant type filtering
CREATE INDEX IF NOT EXISTS idx_company_groups_tenant_type ON public.company_groups(tenant_type);

-- Add application version tracking to companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS app_version TEXT DEFAULT '1.0.0',
ADD COLUMN IF NOT EXISTS version_updated_at TIMESTAMPTZ;

-- Add version compatibility fields to enablement_artifacts
ALTER TABLE public.enablement_artifacts 
ADD COLUMN IF NOT EXISTS app_version_min TEXT,
ADD COLUMN IF NOT EXISTS app_version_max TEXT,
ADD COLUMN IF NOT EXISTS is_centrally_managed BOOLEAN DEFAULT TRUE;

-- Create index for version-based content resolution
CREATE INDEX IF NOT EXISTS idx_artifacts_version_range 
ON public.enablement_artifacts(app_version_min, app_version_max);

-- Create security definer function to check if user is in HRplus internal tenant
CREATE OR REPLACE FUNCTION public.is_hrplus_internal_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN companies c ON p.company_id = c.id
    LEFT JOIN company_groups cg ON c.group_id = cg.id
    WHERE p.id = auth.uid()
    AND cg.tenant_type = 'hrplus_internal'
  );
$$;

-- Create function to get user's tenant type
CREATE OR REPLACE FUNCTION public.get_user_tenant_type()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(cg.tenant_type, 'client')
  FROM profiles p
  JOIN companies c ON p.company_id = c.id
  LEFT JOIN company_groups cg ON c.group_id = cg.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

-- Create function to get user's company app version
CREATE OR REPLACE FUNCTION public.get_user_app_version()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(c.app_version, '1.0.0')
  FROM profiles p
  JOIN companies c ON p.company_id = c.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;