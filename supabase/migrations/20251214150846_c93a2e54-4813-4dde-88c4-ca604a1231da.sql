-- Create AI budget tiers table for user type limits
CREATE TABLE public.ai_budget_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  tier_code TEXT NOT NULL,
  monthly_budget_usd NUMERIC(10,2),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, tier_code)
);

-- Add budget tier reference to ai_user_settings
ALTER TABLE public.ai_user_settings 
ADD COLUMN IF NOT EXISTS budget_tier_id UUID REFERENCES public.ai_budget_tiers(id),
ADD COLUMN IF NOT EXISTS monthly_budget_usd NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS custom_budget_override BOOLEAN DEFAULT false;

-- Add year/month tracking to usage logs
ALTER TABLE public.ai_usage_logs
ADD COLUMN IF NOT EXISTS usage_year INTEGER DEFAULT EXTRACT(YEAR FROM now()),
ADD COLUMN IF NOT EXISTS usage_month INTEGER DEFAULT EXTRACT(MONTH FROM now()),
ADD COLUMN IF NOT EXISTS estimated_cost_usd NUMERIC(10,6);

-- Create index for faster monthly queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_year_month ON public.ai_usage_logs(user_id, usage_year, usage_month);

-- Enable RLS
ALTER TABLE public.ai_budget_tiers ENABLE ROW LEVEL SECURITY;

-- Policies for ai_budget_tiers
CREATE POLICY "Admins can manage budget tiers" ON public.ai_budget_tiers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR managers can view budget tiers" ON public.ai_budget_tiers
  FOR SELECT USING (public.has_role(auth.uid(), 'hr_manager'));

-- Insert default budget tiers
INSERT INTO public.ai_budget_tiers (tier_name, tier_code, monthly_budget_usd, description)
VALUES 
  ('ESS Users', 'ess', 1.00, 'Employee Self-Service users - $1/month limit'),
  ('MSS Users', 'mss', 5.00, 'Manager Self-Service users - $5/month limit'),
  ('Core Module Users', 'core', 10.00, 'Core module access users - $10/month limit'),
  ('Admin Users', 'admin', NULL, 'Administrator users - Unlimited budget');

-- Create trigger to update updated_at
CREATE TRIGGER update_ai_budget_tiers_updated_at
  BEFORE UPDATE ON public.ai_budget_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user is within budget
CREATE OR REPLACE FUNCTION public.check_ai_budget(p_user_id UUID)
RETURNS TABLE(
  is_within_budget BOOLEAN,
  monthly_budget NUMERIC,
  monthly_spent NUMERIC,
  remaining_budget NUMERIC,
  budget_tier TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_budget NUMERIC;
  v_spent NUMERIC;
  v_tier TEXT;
  v_is_enabled BOOLEAN;
BEGIN
  -- Get user's budget settings
  SELECT 
    COALESCE(aus.monthly_budget_usd, abt.monthly_budget_usd),
    abt.tier_name,
    aus.is_enabled
  INTO v_budget, v_tier, v_is_enabled
  FROM ai_user_settings aus
  LEFT JOIN ai_budget_tiers abt ON aus.budget_tier_id = abt.id
  WHERE aus.user_id = p_user_id;
  
  -- If no settings, check if user has admin role (unlimited)
  IF v_budget IS NULL AND v_tier IS NULL THEN
    IF has_role(p_user_id, 'admin') THEN
      v_tier := 'Admin Users';
      v_budget := NULL; -- Unlimited
    ELSE
      v_tier := 'Default';
      v_budget := 1.00; -- Default to ESS limit
    END IF;
  END IF;
  
  -- Calculate monthly spend
  SELECT COALESCE(SUM(estimated_cost_usd), 0)
  INTO v_spent
  FROM ai_usage_logs
  WHERE user_id = p_user_id
    AND usage_year = EXTRACT(YEAR FROM now())
    AND usage_month = EXTRACT(MONTH FROM now());
  
  -- Return results
  RETURN QUERY SELECT 
    CASE WHEN v_budget IS NULL THEN true ELSE v_spent < v_budget END,
    v_budget,
    v_spent,
    CASE WHEN v_budget IS NULL THEN NULL ELSE v_budget - v_spent END,
    v_tier;
END;
$$;