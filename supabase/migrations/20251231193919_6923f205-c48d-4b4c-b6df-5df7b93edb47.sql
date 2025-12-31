-- Create minimum_wage_rates table for storing country/region specific minimum wage rates
CREATE TABLE public.minimum_wage_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL,
  region TEXT, -- For state/province-specific rates
  wage_type TEXT NOT NULL DEFAULT 'monthly' CHECK (wage_type IN ('hourly', 'daily', 'weekly', 'monthly')),
  rate NUMERIC(15, 4) NOT NULL,
  currency_id UUID REFERENCES public.currencies(id),
  effective_from DATE NOT NULL,
  effective_to DATE, -- Null means currently active
  applicable_to JSONB DEFAULT '{}', -- Filters like age, job category, sector
  source_reference TEXT, -- Legal reference URL
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create minimum_wage_violations table for tracking employees below legal thresholds
CREATE TABLE public.minimum_wage_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position_id UUID REFERENCES public.positions(id),
  minimum_wage_rate_id UUID REFERENCES public.minimum_wage_rates(id),
  current_hourly_rate NUMERIC(15, 4), -- Employee's actual hourly rate (normalized)
  current_monthly_rate NUMERIC(15, 4), -- Employee's actual monthly rate
  required_hourly_rate NUMERIC(15, 4), -- Legal minimum hourly
  required_monthly_rate NUMERIC(15, 4), -- Legal minimum monthly
  shortfall_amount NUMERIC(15, 4), -- Monthly shortfall
  shortfall_percentage NUMERIC(5, 2), -- Percentage below minimum
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'under_review', 'resolved', 'exempted', 'false_positive')),
  exemption_reason TEXT, -- If status is exempted
  resolution_notes TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  pay_period_start DATE,
  pay_period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_minimum_wage_rates_country ON public.minimum_wage_rates(country);
CREATE INDEX idx_minimum_wage_rates_effective ON public.minimum_wage_rates(effective_from, effective_to);
CREATE INDEX idx_minimum_wage_rates_active ON public.minimum_wage_rates(is_active) WHERE is_active = true;

CREATE INDEX idx_minimum_wage_violations_company ON public.minimum_wage_violations(company_id);
CREATE INDEX idx_minimum_wage_violations_employee ON public.minimum_wage_violations(employee_id);
CREATE INDEX idx_minimum_wage_violations_status ON public.minimum_wage_violations(status);
CREATE INDEX idx_minimum_wage_violations_detected ON public.minimum_wage_violations(detected_at DESC);

-- Enable RLS
ALTER TABLE public.minimum_wage_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minimum_wage_violations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for minimum_wage_rates (global reference data, read by all authenticated, write by admin/HR)
CREATE POLICY "Authenticated users can view minimum wage rates"
ON public.minimum_wage_rates
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and HR can manage minimum wage rates"
ON public.minimum_wage_rates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr_manager')
  )
);

-- RLS Policies for minimum_wage_violations (company-scoped)
CREATE POLICY "Users can view violations for their company"
ON public.minimum_wage_violations
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

CREATE POLICY "HR and admins can manage violations"
ON public.minimum_wage_violations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr_manager')
  )
);

-- Add updated_at triggers
CREATE TRIGGER update_minimum_wage_rates_updated_at
BEFORE UPDATE ON public.minimum_wage_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_minimum_wage_violations_updated_at
BEFORE UPDATE ON public.minimum_wage_violations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();