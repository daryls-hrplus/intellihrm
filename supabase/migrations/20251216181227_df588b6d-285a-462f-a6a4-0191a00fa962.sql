-- Create password_policies table for enterprise password management
CREATE TABLE public.password_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Length Requirements
  min_password_length INTEGER NOT NULL DEFAULT 8,
  max_password_length INTEGER NOT NULL DEFAULT 128,
  
  -- Complexity Rules
  require_uppercase BOOLEAN NOT NULL DEFAULT true,
  require_lowercase BOOLEAN NOT NULL DEFAULT true,
  require_numbers BOOLEAN NOT NULL DEFAULT true,
  require_special_chars BOOLEAN NOT NULL DEFAULT true,
  special_chars_allowed TEXT DEFAULT '!@#$%^&*()_+-=[]{}|;:,.<>?',
  
  -- Password History
  password_history_count INTEGER NOT NULL DEFAULT 5,
  
  -- Password Expiration
  password_expiry_days INTEGER DEFAULT 90,
  expiry_warning_days INTEGER DEFAULT 14,
  
  -- Session Timeout
  session_timeout_minutes INTEGER DEFAULT 30,
  
  -- First Login Change
  require_change_on_first_login BOOLEAN NOT NULL DEFAULT true,
  
  -- MFA Enforcement (links to existing MFA settings)
  mfa_enforcement_level TEXT DEFAULT 'optional' CHECK (mfa_enforcement_level IN ('optional', 'required_admins', 'required_all')),
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Only one active policy per company (or global if company_id is null)
  UNIQUE(company_id)
);

-- Create user_password_history to track password reuse
CREATE TABLE public.user_password_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_password_metadata for tracking password changes and expiry
CREATE TABLE public.user_password_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  last_password_change TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  password_expires_at TIMESTAMP WITH TIME ZONE,
  is_first_login BOOLEAN NOT NULL DEFAULT true,
  expiry_notification_shown_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_password_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for password_policies (admin only)
CREATE POLICY "Admins can view password policies"
ON public.password_policies FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.code IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "Admins can manage password policies"
ON public.password_policies FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.code = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.code = 'admin'
  )
);

-- RLS for user_password_history (system only, users can't see)
CREATE POLICY "System can manage password history"
ON public.user_password_history FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS for user_password_metadata
CREATE POLICY "Users can view own password metadata"
ON public.user_password_metadata FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all password metadata"
ON public.user_password_metadata FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.code = 'admin'
  )
);

CREATE POLICY "Users can update own password metadata"
ON public.user_password_metadata FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert password metadata"
ON public.user_password_metadata FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_password_policies_updated_at
BEFORE UPDATE ON public.password_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_password_metadata_updated_at
BEFORE UPDATE ON public.user_password_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default global password policy
INSERT INTO public.password_policies (
  company_id,
  min_password_length,
  max_password_length,
  require_uppercase,
  require_lowercase,
  require_numbers,
  require_special_chars,
  password_history_count,
  password_expiry_days,
  expiry_warning_days,
  session_timeout_minutes,
  require_change_on_first_login,
  mfa_enforcement_level
) VALUES (
  NULL,
  12,
  128,
  true,
  true,
  true,
  true,
  12,
  90,
  14,
  30,
  true,
  'optional'
);