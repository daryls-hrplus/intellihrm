
-- Leave payment rules table (configures how leave types are paid)
CREATE TABLE public.leave_payment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Leave payment tiers (percentage-based payment tiers within each rule)
CREATE TABLE public.leave_payment_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_payment_rule_id UUID NOT NULL REFERENCES public.leave_payment_rules(id) ON DELETE CASCADE,
  from_day INTEGER NOT NULL,
  to_day INTEGER, -- null means "onwards" / unlimited
  payment_percentage NUMERIC(5,2) NOT NULL CHECK (payment_percentage >= 0 AND payment_percentage <= 100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Leave to payroll code mapping
CREATE TABLE public.leave_payroll_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  pay_element_id UUID REFERENCES public.pay_elements(id) ON DELETE SET NULL,
  payroll_code TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_payment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_payment_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_payroll_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_payment_rules
CREATE POLICY "Users can view leave payment rules" ON public.leave_payment_rules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage leave payment rules" ON public.leave_payment_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

-- RLS Policies for leave_payment_tiers
CREATE POLICY "Users can view leave payment tiers" ON public.leave_payment_tiers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage leave payment tiers" ON public.leave_payment_tiers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

-- RLS Policies for leave_payroll_mappings
CREATE POLICY "Users can view leave payroll mappings" ON public.leave_payroll_mappings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage leave payroll mappings" ON public.leave_payroll_mappings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

-- Indexes
CREATE INDEX idx_leave_payment_rules_company ON public.leave_payment_rules(company_id);
CREATE INDEX idx_leave_payment_rules_leave_type ON public.leave_payment_rules(leave_type_id);
CREATE INDEX idx_leave_payment_tiers_rule ON public.leave_payment_tiers(leave_payment_rule_id);
CREATE INDEX idx_leave_payroll_mappings_company ON public.leave_payroll_mappings(company_id);
CREATE INDEX idx_leave_payroll_mappings_leave_type ON public.leave_payroll_mappings(leave_type_id);

-- Triggers for updated_at
CREATE TRIGGER update_leave_payment_rules_updated_at
  BEFORE UPDATE ON public.leave_payment_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_payment_tiers_updated_at
  BEFORE UPDATE ON public.leave_payment_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_payroll_mappings_updated_at
  BEFORE UPDATE ON public.leave_payroll_mappings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
