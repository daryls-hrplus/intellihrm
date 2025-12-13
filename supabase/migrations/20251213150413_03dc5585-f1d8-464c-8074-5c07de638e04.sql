-- Add pay_group_id to pay_periods and monday_count for NI
ALTER TABLE public.pay_periods 
ADD COLUMN IF NOT EXISTS pay_group_id UUID REFERENCES public.pay_groups(id),
ADD COLUMN IF NOT EXISTS monday_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS year INTEGER;

-- Add uses_national_insurance flag to pay_groups
ALTER TABLE public.pay_groups 
ADD COLUMN IF NOT EXISTS uses_national_insurance BOOLEAN DEFAULT false;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_pay_periods_pay_group_year ON public.pay_periods(pay_group_id, year);
CREATE INDEX IF NOT EXISTS idx_pay_periods_pay_group ON public.pay_periods(pay_group_id);