-- Multi-Currency Management System

-- Add base_currency_id to company_groups for group consolidation/reporting
ALTER TABLE public.company_groups 
ADD COLUMN IF NOT EXISTS base_currency_id UUID REFERENCES public.currencies(id);

-- Add local_currency_id to companies (all pay groups must run in this currency)
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS local_currency_id UUID REFERENCES public.currencies(id);

-- Create exchange_rates table for historical rate tracking
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency_id UUID NOT NULL REFERENCES public.currencies(id),
  to_currency_id UUID NOT NULL REFERENCES public.currencies(id),
  rate NUMERIC(18, 8) NOT NULL,
  rate_date DATE NOT NULL,
  source TEXT, -- e.g., 'manual', 'api', 'central_bank'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(from_currency_id, to_currency_id, rate_date)
);

-- Add exchange rate fields to payroll_runs
ALTER TABLE public.payroll_runs
ADD COLUMN IF NOT EXISTS local_currency_id UUID REFERENCES public.currencies(id),
ADD COLUMN IF NOT EXISTS base_currency_id UUID REFERENCES public.currencies(id),
ADD COLUMN IF NOT EXISTS exchange_rate_to_base NUMERIC(18, 8),
ADD COLUMN IF NOT EXISTS exchange_rate_date DATE,
ADD COLUMN IF NOT EXISTS total_gross_pay_base NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS total_net_pay_base NUMERIC(15, 2);

-- Add payout currency option to employee period allowances
ALTER TABLE public.employee_period_allowances
ADD COLUMN IF NOT EXISTS payout_currency_id UUID REFERENCES public.currencies(id),
ADD COLUMN IF NOT EXISTS payout_amount NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS exchange_rate_applied NUMERIC(18, 8);

-- Add payout currency option to employee period deductions
ALTER TABLE public.employee_period_deductions
ADD COLUMN IF NOT EXISTS payout_currency_id UUID REFERENCES public.currencies(id),
ADD COLUMN IF NOT EXISTS payout_amount NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS exchange_rate_applied NUMERIC(18, 8);

-- Add decimal_places and is_base_currency to currencies
ALTER TABLE public.currencies
ADD COLUMN IF NOT EXISTS decimal_places INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS is_group_base BOOLEAN DEFAULT false;

-- Enable RLS on exchange_rates
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- RLS policies for exchange_rates
CREATE POLICY "Exchange rates viewable by authenticated users"
ON public.exchange_rates FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Exchange rates manageable by authenticated users"
ON public.exchange_rates FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Exchange rates updatable by authenticated users"
ON public.exchange_rates FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Exchange rates deletable by authenticated users"
ON public.exchange_rates FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exchange_rates_from_currency ON public.exchange_rates(from_currency_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_to_currency ON public.exchange_rates(to_currency_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates(rate_date);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies_date ON public.exchange_rates(from_currency_id, to_currency_id, rate_date DESC);

-- Function to get exchange rate for a specific date (gets closest rate on or before date)
CREATE OR REPLACE FUNCTION public.get_exchange_rate(
  p_from_currency_id UUID,
  p_to_currency_id UUID,
  p_rate_date DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC(18, 8)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rate NUMERIC(18, 8);
BEGIN
  -- If same currency, return 1
  IF p_from_currency_id = p_to_currency_id THEN
    RETURN 1.0;
  END IF;

  -- Get the most recent rate on or before the specified date
  SELECT rate INTO v_rate
  FROM exchange_rates
  WHERE from_currency_id = p_from_currency_id
    AND to_currency_id = p_to_currency_id
    AND rate_date <= p_rate_date
  ORDER BY rate_date DESC
  LIMIT 1;

  RETURN v_rate;
END;
$$;