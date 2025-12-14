-- MFA Settings per company
CREATE TABLE public.mfa_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  is_mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  is_mfa_required BOOLEAN NOT NULL DEFAULT false,
  allowed_factors TEXT[] DEFAULT ARRAY['totp'],
  grace_period_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- User MFA status tracking
CREATE TABLE public.user_mfa_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  is_enrolled BOOLEAN NOT NULL DEFAULT false,
  enrolled_at TIMESTAMP WITH TIME ZONE,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  factor_type TEXT DEFAULT 'totp',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- SSO Provider configurations
CREATE TABLE public.sso_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL DEFAULT 'saml',
  provider_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  metadata_url TEXT,
  metadata_xml TEXT,
  entity_id TEXT,
  sso_url TEXT,
  certificate TEXT,
  attribute_mapping JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(company_id, domain)
);

-- SSO Domain mappings for auto-discovery
CREATE TABLE public.sso_domain_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  sso_provider_id UUID REFERENCES public.sso_providers(id) ON DELETE CASCADE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mfa_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sso_domain_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mfa_settings
CREATE POLICY "Admins can manage MFA settings" ON public.mfa_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their company MFA settings" ON public.mfa_settings
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- RLS Policies for user_mfa_status
CREATE POLICY "Users can view their own MFA status" ON public.user_mfa_status
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own MFA status" ON public.user_mfa_status
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own MFA status" ON public.user_mfa_status
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all MFA status" ON public.user_mfa_status
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for sso_providers
CREATE POLICY "Admins can manage SSO providers" ON public.sso_providers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active SSO providers" ON public.sso_providers
  FOR SELECT USING (is_active = true);

-- RLS Policies for sso_domain_mappings
CREATE POLICY "Admins can manage domain mappings" ON public.sso_domain_mappings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view verified domains" ON public.sso_domain_mappings
  FOR SELECT USING (is_verified = true);

-- Triggers for updated_at
CREATE TRIGGER update_mfa_settings_updated_at
  BEFORE UPDATE ON public.mfa_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_mfa_status_updated_at
  BEFORE UPDATE ON public.user_mfa_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sso_providers_updated_at
  BEFORE UPDATE ON public.sso_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();