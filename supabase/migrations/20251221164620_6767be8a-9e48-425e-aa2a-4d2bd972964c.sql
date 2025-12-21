-- Phase 1: Enterprise Role Management Schema Enhancement

-- 1.1 Add new columns to roles table for seeded roles and inheritance
ALTER TABLE public.roles 
  ADD COLUMN IF NOT EXISTS role_type TEXT DEFAULT 'business' 
    CHECK (role_type IN ('system', 'hr', 'business', 'commercial', 'internal')),
  ADD COLUMN IF NOT EXISTS is_seeded BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS base_role_id UUID REFERENCES public.roles(id),
  ADD COLUMN IF NOT EXISTS seeded_role_code TEXT,
  ADD COLUMN IF NOT EXISTS tenant_visibility TEXT DEFAULT 'all'
    CHECK (tenant_visibility IN ('all', 'hrplus_internal', 'client'));

-- 1.2 Create PII Access Profile table (replaces simple can_view_pii boolean)
CREATE TABLE IF NOT EXISTS public.role_pii_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pii_level TEXT DEFAULT 'none' CHECK (pii_level IN ('none', 'limited', 'full')),
  -- Domain scopes
  access_personal_details BOOLEAN DEFAULT FALSE,
  access_compensation BOOLEAN DEFAULT FALSE,
  access_banking BOOLEAN DEFAULT FALSE,
  access_medical BOOLEAN DEFAULT FALSE,
  access_disciplinary BOOLEAN DEFAULT FALSE,
  -- Controls
  masking_enabled BOOLEAN DEFAULT TRUE,
  export_permission TEXT DEFAULT 'none' CHECK (export_permission IN ('none', 'allowed', 'approval_required')),
  jit_access_required BOOLEAN DEFAULT FALSE,
  approval_required_for_full BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Create Admin Container Permission enum and table
DO $$ BEGIN
  CREATE TYPE admin_container_permission AS ENUM ('none', 'view', 'configure', 'approve');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.role_container_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  container_code TEXT NOT NULL,
  permission_level admin_container_permission DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, container_code)
);

-- Container codes: org_structure, users_roles_access, security_governance, 
-- system_platform_config, strategic_analytics, compliance_risk, 
-- documentation_enablement, billing_subscriptions

-- 1.4 Create Role Migration Tracking table
CREATE TABLE IF NOT EXISTS public.role_migration_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_batch_id UUID NOT NULL,
  previous_role_id UUID,
  previous_role_name TEXT,
  new_role_id UUID REFERENCES public.roles(id),
  new_role_name TEXT,
  migration_type TEXT CHECK (migration_type IN ('mapped_1_to_1', 'derived', 'manual_review')),
  similarity_score DECIMAL(5,2),
  pii_changes_detected BOOLEAN DEFAULT FALSE,
  rollback_available BOOLEAN DEFAULT TRUE,
  migrated_at TIMESTAMPTZ DEFAULT NOW(),
  rollback_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- 1.5 Create PII access audit log table for field-level tracking
CREATE TABLE IF NOT EXISTS public.pii_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_id UUID REFERENCES public.roles(id),
  pii_domain TEXT NOT NULL,
  field_name TEXT,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  access_result TEXT NOT NULL CHECK (access_result IN ('granted', 'denied', 'masked')),
  source_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.role_pii_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_container_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_migration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pii_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for role_pii_access
CREATE POLICY "Admins can manage role pii access" ON public.role_pii_access
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view role pii access" ON public.role_pii_access
  FOR SELECT TO authenticated
  USING (TRUE);

-- RLS Policies for role_container_access
CREATE POLICY "Admins can manage role container access" ON public.role_container_access
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view role container access" ON public.role_container_access
  FOR SELECT TO authenticated
  USING (TRUE);

-- RLS Policies for role_migration_records
CREATE POLICY "Admins can manage migration records" ON public.role_migration_records
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for pii_access_logs (security logs - admin only)
CREATE POLICY "Admins can view pii access logs" ON public.pii_access_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert pii access logs" ON public.pii_access_logs
  FOR INSERT TO authenticated
  WITH CHECK (TRUE);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_pii_access_role_id ON public.role_pii_access(role_id);
CREATE INDEX IF NOT EXISTS idx_role_container_access_role_id ON public.role_container_access(role_id);
CREATE INDEX IF NOT EXISTS idx_role_container_access_container ON public.role_container_access(container_code);
CREATE INDEX IF NOT EXISTS idx_pii_access_logs_user ON public.pii_access_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pii_access_logs_entity ON public.pii_access_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_roles_seeded ON public.roles(is_seeded) WHERE is_seeded = TRUE;
CREATE INDEX IF NOT EXISTS idx_roles_base_role ON public.roles(base_role_id);

-- Update trigger for role_pii_access
CREATE OR REPLACE FUNCTION public.update_role_pii_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_role_pii_access_updated_at
  BEFORE UPDATE ON public.role_pii_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_role_pii_access_updated_at();

-- Update trigger for role_container_access
CREATE TRIGGER trigger_role_container_access_updated_at
  BEFORE UPDATE ON public.role_container_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_role_pii_access_updated_at();