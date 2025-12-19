-- Create table for AI security violation attempts
CREATE TABLE public.ai_security_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  violation_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  user_query TEXT NOT NULL,
  attempted_resource TEXT,
  user_role TEXT,
  allowed_modules JSONB,
  blocked_reason TEXT,
  ai_response TEXT,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  is_false_positive BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.ai_security_violations ENABLE ROW LEVEL SECURITY;

-- Only admins can view violations
CREATE POLICY "Admins can view AI security violations"
  ON public.ai_security_violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert violations
CREATE POLICY "Authenticated users can insert violations"
  ON public.ai_security_violations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can update (for review)
CREATE POLICY "Admins can update violations"
  ON public.ai_security_violations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_ai_security_violations_user ON public.ai_security_violations(user_id);
CREATE INDEX idx_ai_security_violations_company ON public.ai_security_violations(company_id);
CREATE INDEX idx_ai_security_violations_type ON public.ai_security_violations(violation_type);
CREATE INDEX idx_ai_security_violations_severity ON public.ai_security_violations(severity);
CREATE INDEX idx_ai_security_violations_created ON public.ai_security_violations(created_at DESC);

-- Function to log AI security violations
CREATE OR REPLACE FUNCTION public.log_ai_security_violation(
  p_user_id UUID,
  p_company_id UUID,
  p_violation_type TEXT,
  p_severity TEXT,
  p_user_query TEXT,
  p_attempted_resource TEXT DEFAULT NULL,
  p_blocked_reason TEXT DEFAULT NULL,
  p_ai_response TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_violation_id UUID;
  v_user_role TEXT;
  v_allowed_modules JSONB;
BEGIN
  SELECT role::TEXT INTO v_user_role
  FROM user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  INSERT INTO ai_security_violations (
    user_id, company_id, violation_type, severity, user_query,
    attempted_resource, user_role, blocked_reason, ai_response, session_id
  ) VALUES (
    p_user_id, p_company_id, p_violation_type, p_severity, p_user_query,
    p_attempted_resource, v_user_role, p_blocked_reason, p_ai_response, p_session_id
  )
  RETURNING id INTO v_violation_id;
  
  RETURN v_violation_id;
END;
$$;