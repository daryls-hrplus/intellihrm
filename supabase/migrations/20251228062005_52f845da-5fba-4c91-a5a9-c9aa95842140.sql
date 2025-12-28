-- =============================================================
-- GL Override & Segment Routing System - Enhanced GL Module
-- =============================================================

-- 1. Create gl_override_rules table
CREATE TABLE public.gl_override_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rule_code TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  override_type TEXT NOT NULL DEFAULT 'segment' CHECK (override_type IN ('account', 'segment', 'full_string')),
  applies_to_debit BOOLEAN NOT NULL DEFAULT true,
  applies_to_credit BOOLEAN NOT NULL DEFAULT true,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(company_id, rule_code)
);

-- 2. Create gl_override_conditions table
CREATE TABLE public.gl_override_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  override_rule_id UUID NOT NULL REFERENCES public.gl_override_rules(id) ON DELETE CASCADE,
  dimension_type TEXT NOT NULL CHECK (dimension_type IN ('pay_element', 'department', 'division', 'location', 'job', 'employee', 'pay_group', 'cost_center', 'section', 'mapping_type')),
  dimension_value_id UUID,
  dimension_value_code TEXT,
  operator TEXT NOT NULL DEFAULT 'equals' CHECK (operator IN ('equals', 'not_equals', 'in', 'not_in', 'any')),
  value_list TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create gl_override_targets table
CREATE TABLE public.gl_override_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  override_rule_id UUID NOT NULL REFERENCES public.gl_override_rules(id) ON DELETE CASCADE,
  target_debit_account_id UUID REFERENCES public.gl_accounts(id),
  target_credit_account_id UUID REFERENCES public.gl_accounts(id),
  segment_overrides JSONB DEFAULT '{}'::jsonb,
  custom_gl_string TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Add entry_type and composed_gl_string to gl_journal_entries
ALTER TABLE public.gl_journal_entries 
  ADD COLUMN IF NOT EXISTS entry_type TEXT CHECK (entry_type IN ('debit', 'credit')),
  ADD COLUMN IF NOT EXISTS composed_gl_string TEXT,
  ADD COLUMN IF NOT EXISTS override_rule_id UUID REFERENCES public.gl_override_rules(id),
  ADD COLUMN IF NOT EXISTS segment_values JSONB DEFAULT '{}'::jsonb;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gl_override_rules_company ON public.gl_override_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_gl_override_rules_active ON public.gl_override_rules(company_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_gl_override_conditions_rule ON public.gl_override_conditions(override_rule_id);
CREATE INDEX IF NOT EXISTS idx_gl_override_targets_rule ON public.gl_override_targets(override_rule_id);
CREATE INDEX IF NOT EXISTS idx_gl_journal_entries_override ON public.gl_journal_entries(override_rule_id) WHERE override_rule_id IS NOT NULL;

-- 6. Enable RLS
ALTER TABLE public.gl_override_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_override_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_override_targets ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for gl_override_rules
CREATE POLICY "Users can view override rules for their company" 
ON public.gl_override_rules FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.company_id = gl_override_rules.company_id OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Admins and HR can manage override rules" 
ON public.gl_override_rules FOR ALL 
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
);

-- 8. RLS Policies for gl_override_conditions
CREATE POLICY "Users can view override conditions" 
ON public.gl_override_conditions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.gl_override_rules r
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE r.id = gl_override_conditions.override_rule_id
    AND (p.company_id = r.company_id OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Admins and HR can manage override conditions" 
ON public.gl_override_conditions FOR ALL 
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
);

-- 9. RLS Policies for gl_override_targets
CREATE POLICY "Users can view override targets" 
ON public.gl_override_targets FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.gl_override_rules r
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE r.id = gl_override_targets.override_rule_id
    AND (p.company_id = r.company_id OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Admins and HR can manage override targets" 
ON public.gl_override_targets FOR ALL 
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
);

-- 10. Create trigger for updated_at
CREATE TRIGGER update_gl_override_rules_updated_at
  BEFORE UPDATE ON public.gl_override_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gl_override_targets_updated_at
  BEFORE UPDATE ON public.gl_override_targets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();