
-- Subscription tiers/bundles
CREATE TABLE public.subscription_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  modules JSONB NOT NULL DEFAULT '[]',
  base_price_monthly NUMERIC(10,2) NOT NULL,
  price_per_employee NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_employees INTEGER DEFAULT 1,
  max_employees INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Company subscriptions
CREATE TABLE public.company_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES public.subscription_tiers(id),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'grace_period', 'expired', 'cancelled')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'wire_transfer')),
  active_employee_count INTEGER NOT NULL DEFAULT 1,
  monthly_amount NUMERIC(10,2),
  annual_amount NUMERIC(10,2),
  trial_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trial_ends_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  grace_period_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  next_billing_date DATE,
  selected_modules JSONB NOT NULL DEFAULT '[]',
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  billing_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Subscription invoices for manual tracking
CREATE TABLE public.subscription_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.company_subscriptions(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'wire_transfer')),
  payment_reference TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  marked_paid_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Module upgrade/downgrade requests
CREATE TABLE public.subscription_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.company_subscriptions(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'add_modules', 'remove_modules', 'change_tier')),
  old_tier_id UUID REFERENCES public.subscription_tiers(id),
  new_tier_id UUID REFERENCES public.subscription_tiers(id),
  old_modules JSONB,
  new_modules JSONB,
  old_employee_count INTEGER,
  new_employee_count INTEGER,
  old_amount NUMERIC(10,2),
  new_amount NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  effective_date DATE,
  requested_by UUID REFERENCES public.profiles(id),
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_changes ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Tiers are public for viewing
CREATE POLICY "Anyone can view active subscription tiers"
  ON public.subscription_tiers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage subscription tiers"
  ON public.subscription_tiers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Company subscriptions - company admins can view their own
CREATE POLICY "Users can view their company subscription"
  ON public.company_subscriptions FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage all subscriptions"
  ON public.company_subscriptions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Invoices
CREATE POLICY "Users can view their company invoices"
  ON public.subscription_invoices FOR SELECT
  USING (
    subscription_id IN (
      SELECT cs.id FROM public.company_subscriptions cs
      JOIN public.profiles p ON p.company_id = cs.company_id
      WHERE p.id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage invoices"
  ON public.subscription_invoices FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Subscription changes
CREATE POLICY "Users can view their company subscription changes"
  ON public.subscription_changes FOR SELECT
  USING (
    subscription_id IN (
      SELECT cs.id FROM public.company_subscriptions cs
      JOIN public.profiles p ON p.company_id = cs.company_id
      WHERE p.id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage subscription changes"
  ON public.subscription_changes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default tiers
INSERT INTO public.subscription_tiers (name, code, description, modules, base_price_monthly, price_per_employee, display_order) VALUES
('Starter', 'starter', 'Essential HR modules for small teams', '["workforce", "leave", "ess"]', 49.00, 2.00, 1),
('Professional', 'professional', 'Complete HR suite for growing companies', '["workforce", "leave", "ess", "mss", "compensation", "payroll", "time_attendance", "benefits"]', 149.00, 4.00, 2),
('Enterprise', 'enterprise', 'Full platform with all modules', '["workforce", "leave", "ess", "mss", "compensation", "payroll", "time_attendance", "benefits", "performance", "training", "succession", "recruitment", "hse", "employee_relations", "property"]', 299.00, 6.00, 3);

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.subscription_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_invoice_number();

-- Triggers for updated_at
CREATE TRIGGER update_subscription_tiers_updated_at
  BEFORE UPDATE ON public.subscription_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_subscriptions_updated_at
  BEFORE UPDATE ON public.company_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_invoices_updated_at
  BEFORE UPDATE ON public.subscription_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
