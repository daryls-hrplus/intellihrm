-- Create auto_approval_rules table
CREATE TABLE public.auto_approval_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  approved_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auto_approval_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies - only admins can manage
CREATE POLICY "Admins can view auto approval rules"
ON public.auto_approval_rules
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert auto approval rules"
ON public.auto_approval_rules
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update auto approval rules"
ON public.auto_approval_rules
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete auto approval rules"
ON public.auto_approval_rules
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can check rules (for auto-approval logic)
CREATE POLICY "Authenticated users can view active rules for matching"
ON public.auto_approval_rules
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Create function to check auto-approval eligibility
CREATE OR REPLACE FUNCTION public.check_auto_approval(
  p_user_id UUID,
  p_requested_modules JSONB
)
RETURNS TABLE (
  is_auto_approved BOOLEAN,
  approved_modules JSONB,
  rule_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role_ids UUID[];
  v_user_company_id UUID;
  v_rule RECORD;
  v_matched_modules JSONB := '[]'::jsonb;
  v_rule_name TEXT := NULL;
BEGIN
  -- Get user's role IDs
  SELECT ARRAY_AGG(role_id) INTO v_user_role_ids
  FROM public.user_roles
  WHERE user_id = p_user_id;

  -- Get user's company ID
  SELECT company_id INTO v_user_company_id
  FROM public.profiles
  WHERE id = p_user_id;

  -- Check each active rule
  FOR v_rule IN
    SELECT r.name, r.role_id, r.company_id, r.approved_modules
    FROM public.auto_approval_rules r
    WHERE r.is_active = true
  LOOP
    -- Check if rule matches user
    IF (v_rule.role_id IS NULL OR v_rule.role_id = ANY(v_user_role_ids))
       AND (v_rule.company_id IS NULL OR v_rule.company_id = v_user_company_id) THEN
      
      -- Find matching modules between requested and rule's approved modules
      SELECT jsonb_agg(module)
      INTO v_matched_modules
      FROM (
        SELECT jsonb_array_elements_text(p_requested_modules) AS module
        INTERSECT
        SELECT jsonb_array_elements_text(v_rule.approved_modules) AS module
      ) matching;
      
      IF v_matched_modules IS NOT NULL AND jsonb_array_length(v_matched_modules) > 0 THEN
        v_rule_name := v_rule.name;
        RETURN QUERY SELECT true, v_matched_modules, v_rule_name;
        RETURN;
      END IF;
    END IF;
  END LOOP;

  -- No matching rule found
  RETURN QUERY SELECT false, '[]'::jsonb, NULL::TEXT;
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_auto_approval_rules_updated_at
BEFORE UPDATE ON public.auto_approval_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();