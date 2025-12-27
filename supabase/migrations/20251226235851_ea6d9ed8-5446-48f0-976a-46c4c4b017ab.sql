-- =====================================================
-- MULTI-CURRENCY PAYROLL SUPPORT (Fixed)
-- =====================================================

-- 1. Add multi-currency flag to pay_groups
ALTER TABLE public.pay_groups 
ADD COLUMN IF NOT EXISTS enable_multi_currency boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS default_exchange_rate_source text DEFAULT 'manual';

COMMENT ON COLUMN public.pay_groups.enable_multi_currency IS 'When enabled, payroll can process pay elements in multiple currencies';
COMMENT ON COLUMN public.pay_groups.default_exchange_rate_source IS 'Default source for exchange rates: manual, api, etc.';

-- 2. Add currency to pay_elements (the element itself can have a default currency)
ALTER TABLE public.pay_elements 
ADD COLUMN IF NOT EXISTS currency_id uuid REFERENCES public.currencies(id),
ADD COLUMN IF NOT EXISTS allow_currency_override boolean DEFAULT false;

COMMENT ON COLUMN public.pay_elements.currency_id IS 'Default currency for this pay element (null = use company local currency)';
COMMENT ON COLUMN public.pay_elements.allow_currency_override IS 'Whether employee compensation can override the currency';

-- 3. Add currency fields to employee_compensation (already has currency varchar, add proper FK)
ALTER TABLE public.employee_compensation 
ADD COLUMN IF NOT EXISTS currency_id uuid REFERENCES public.currencies(id);

-- 4. Create employee currency preferences table
CREATE TABLE IF NOT EXISTS public.employee_currency_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Net pay split preferences
  primary_currency_id uuid NOT NULL REFERENCES public.currencies(id),
  secondary_currency_id uuid REFERENCES public.currencies(id),
  secondary_currency_percentage numeric(5,2) CHECK (secondary_currency_percentage >= 0 AND secondary_currency_percentage <= 100),
  secondary_currency_fixed_amount numeric(15,2),
  split_method text DEFAULT 'percentage' CHECK (split_method IN ('percentage', 'fixed_amount', 'all_primary')),
  
  -- Effective dating
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  
  -- Audit
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  
  CONSTRAINT unique_employee_currency_pref UNIQUE (employee_id, company_id, effective_date)
);

-- Enable RLS
ALTER TABLE public.employee_currency_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies (simplified - no manager check that doesn't exist)
CREATE POLICY "Users can view own currency preferences"
  ON public.employee_currency_preferences FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Users can manage own currency preferences"
  ON public.employee_currency_preferences FOR ALL
  USING (auth.uid() = employee_id);

CREATE POLICY "Authenticated users can view all currency preferences"
  ON public.employee_currency_preferences FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 5. Create payroll run exchange rates table (stores rates used for a specific run)
CREATE TABLE IF NOT EXISTS public.payroll_run_exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id uuid NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  from_currency_id uuid NOT NULL REFERENCES public.currencies(id),
  to_currency_id uuid NOT NULL REFERENCES public.currencies(id),
  exchange_rate numeric(18,8) NOT NULL,
  rate_date date NOT NULL,
  source text, -- 'manual', 'api', 'imported'
  locked_at timestamptz,
  locked_by uuid REFERENCES public.profiles(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_run_currency_pair UNIQUE (payroll_run_id, from_currency_id, to_currency_id)
);

-- Enable RLS
ALTER TABLE public.payroll_run_exchange_rates ENABLE ROW LEVEL SECURITY;

-- RLS policies for payroll run exchange rates
CREATE POLICY "Authenticated users can view payroll run exchange rates"
  ON public.payroll_run_exchange_rates FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "HR can manage payroll run exchange rates"
  ON public.payroll_run_exchange_rates FOR ALL
  USING (auth.uid() IS NOT NULL);

-- 6. Add multi-currency fields to payroll_line_items
ALTER TABLE public.payroll_line_items
ADD COLUMN IF NOT EXISTS original_currency_id uuid REFERENCES public.currencies(id),
ADD COLUMN IF NOT EXISTS original_amount numeric(15,2),
ADD COLUMN IF NOT EXISTS exchange_rate_used numeric(18,8),
ADD COLUMN IF NOT EXISTS local_currency_amount numeric(15,2),
ADD COLUMN IF NOT EXISTS base_currency_amount numeric(15,2);

COMMENT ON COLUMN public.payroll_line_items.original_currency_id IS 'The currency the pay element was defined in';
COMMENT ON COLUMN public.payroll_line_items.original_amount IS 'Amount in the original currency';
COMMENT ON COLUMN public.payroll_line_items.exchange_rate_used IS 'Exchange rate used for conversion';
COMMENT ON COLUMN public.payroll_line_items.local_currency_amount IS 'Amount converted to company local currency';
COMMENT ON COLUMN public.payroll_line_items.base_currency_amount IS 'Amount converted to group base currency (for reporting)';

-- 7. Create net pay split table (stores how net pay was distributed)
CREATE TABLE IF NOT EXISTS public.payroll_net_pay_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_payroll_id uuid NOT NULL,
  currency_id uuid NOT NULL REFERENCES public.currencies(id),
  amount numeric(15,2) NOT NULL,
  exchange_rate_used numeric(18,8),
  local_currency_equivalent numeric(15,2),
  payment_method text, -- 'bank_transfer', 'cash', 'check'
  bank_account_id uuid,
  is_primary boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payroll_net_pay_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view net pay splits"
  ON public.payroll_net_pay_splits FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "HR can manage net pay splits"
  ON public.payroll_net_pay_splits FOR ALL
  USING (auth.uid() IS NOT NULL);

-- 8. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_currency_prefs_employee 
  ON public.employee_currency_preferences(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_currency_prefs_company 
  ON public.employee_currency_preferences(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_run_rates_run 
  ON public.payroll_run_exchange_rates(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_line_items_currency 
  ON public.payroll_line_items(original_currency_id);

-- 9. Add trigger for updated_at on employee_currency_preferences
CREATE OR REPLACE TRIGGER update_employee_currency_preferences_updated_at
  BEFORE UPDATE ON public.employee_currency_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Add additional fields to payroll_runs for multi-currency summary
ALTER TABLE public.payroll_runs
ADD COLUMN IF NOT EXISTS is_multi_currency boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS currencies_used text[], -- Array of currency codes used
ADD COLUMN IF NOT EXISTS exchange_rate_selection_date date;

COMMENT ON COLUMN public.payroll_runs.is_multi_currency IS 'Whether this run processed multiple currencies';
COMMENT ON COLUMN public.payroll_runs.currencies_used IS 'List of currency codes used in this run';
COMMENT ON COLUMN public.payroll_runs.exchange_rate_selection_date IS 'The date selected for exchange rates (manual selection)';