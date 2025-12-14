-- AI Usage Logs - Track each AI request
CREATE TABLE public.ai_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  feature TEXT, -- e.g., 'chat', 'policy_search', 'report_writer'
  request_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI User Settings - Per-user settings for token limits and enabled/disabled
CREATE TABLE public.ai_user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  monthly_token_limit INTEGER, -- NULL means unlimited
  daily_token_limit INTEGER, -- NULL means unlimited
  notes TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI System Settings - Global AI settings
CREATE TABLE public.ai_system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  is_ai_enabled BOOLEAN NOT NULL DEFAULT true,
  default_monthly_token_limit INTEGER,
  default_daily_token_limit INTEGER,
  allowed_models TEXT[] DEFAULT ARRAY['google/gemini-2.5-flash'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_usage_logs
CREATE POLICY "Users can view their own AI usage"
ON public.ai_usage_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all AI usage"
ON public.ai_usage_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    JOIN public.roles r ON r.id = ur.role_id
    WHERE p.id = auth.uid() AND r.code IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "System can insert AI usage logs"
ON public.ai_usage_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_user_settings
CREATE POLICY "Users can view their own AI settings"
ON public.ai_user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all AI user settings"
ON public.ai_user_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    JOIN public.roles r ON r.id = ur.role_id
    WHERE p.id = auth.uid() AND r.code IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "Admins can update AI user settings"
ON public.ai_user_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    JOIN public.roles r ON r.id = ur.role_id
    WHERE p.id = auth.uid() AND r.code = 'admin'
  )
);

CREATE POLICY "Admins can insert AI user settings"
ON public.ai_user_settings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    JOIN public.roles r ON r.id = ur.role_id
    WHERE p.id = auth.uid() AND r.code = 'admin'
  )
);

-- RLS Policies for ai_system_settings
CREATE POLICY "Authenticated users can view AI system settings"
ON public.ai_system_settings FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage AI system settings"
ON public.ai_system_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    JOIN public.roles r ON r.id = ur.role_id
    WHERE p.id = auth.uid() AND r.code = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at);
CREATE INDEX idx_ai_usage_logs_company_id ON public.ai_usage_logs(company_id);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_user_settings_updated_at
BEFORE UPDATE ON public.ai_user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_system_settings_updated_at
BEFORE UPDATE ON public.ai_system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();