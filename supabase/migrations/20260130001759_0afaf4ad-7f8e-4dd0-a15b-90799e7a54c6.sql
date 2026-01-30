-- Create api_keys table for external API authentication
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create api_request_logs table for audit and analytics
CREATE TABLE public.api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  request_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  error_message TEXT
);

-- Create indexes for performance
CREATE INDEX idx_api_keys_company ON public.api_keys(company_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = true;
CREATE INDEX idx_api_request_logs_key ON public.api_request_logs(api_key_id);
CREATE INDEX idx_api_request_logs_time ON public.api_request_logs(request_at DESC);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys - admins can manage keys for companies they have access to
CREATE POLICY "admins_manage_api_keys" ON public.api_keys
  FOR ALL USING (
    public.is_admin() AND 
    public.user_has_company_access(auth.uid(), company_id)
  );

-- RLS Policies for api_request_logs (read-only for admins)
CREATE POLICY "admins_read_api_logs" ON public.api_request_logs
  FOR SELECT USING (
    public.is_admin() AND 
    api_key_id IN (
      SELECT id FROM public.api_keys WHERE public.user_has_company_access(auth.uid(), company_id)
    )
  );

-- Trigger for updated_at on api_keys
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();