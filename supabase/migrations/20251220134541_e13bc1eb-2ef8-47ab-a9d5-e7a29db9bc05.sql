-- Retroactive Pay Configuration Table
-- Stores the parameters for retroactive pay increases by pay group
CREATE TABLE public.retroactive_pay_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  pay_group_id UUID NOT NULL REFERENCES public.pay_groups(id) ON DELETE CASCADE,
  config_name TEXT NOT NULL,
  description TEXT,
  effective_start_date DATE NOT NULL,
  effective_end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'processed', 'cancelled')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Retroactive Pay Config Items Table
-- Individual pay element increases within a configuration
CREATE TABLE public.retroactive_pay_config_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES public.retroactive_pay_configs(id) ON DELETE CASCADE,
  pay_element_id UUID NOT NULL REFERENCES public.pay_elements(id) ON DELETE CASCADE,
  increase_type TEXT NOT NULL CHECK (increase_type IN ('percentage', 'fixed_amount', 'one_off')),
  increase_value NUMERIC(15, 4) NOT NULL,
  min_amount NUMERIC(15, 2),
  max_amount NUMERIC(15, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Retroactive Pay Calculations Table
-- Generated calculations for each employee
CREATE TABLE public.retroactive_pay_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES public.retroactive_pay_configs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pay_period_id UUID REFERENCES public.pay_periods(id),
  pay_year INTEGER NOT NULL,
  pay_cycle_number INTEGER NOT NULL,
  pay_element_id UUID NOT NULL REFERENCES public.pay_elements(id) ON DELETE CASCADE,
  original_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  increase_type TEXT NOT NULL,
  increase_value NUMERIC(15, 4) NOT NULL,
  adjustment_amount NUMERIC(15, 2) NOT NULL,
  employee_status TEXT NOT NULL DEFAULT 'active',
  calculation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_in_run_id UUID REFERENCES public.payroll_runs(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.retroactive_pay_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retroactive_pay_config_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retroactive_pay_calculations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for retroactive_pay_configs
CREATE POLICY "Users can view retroactive pay configs for their company"
ON public.retroactive_pay_configs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.company_id = retroactive_pay_configs.company_id
  )
);

CREATE POLICY "Users can create retroactive pay configs for their company"
ON public.retroactive_pay_configs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.company_id = retroactive_pay_configs.company_id
  )
);

CREATE POLICY "Users can update retroactive pay configs for their company"
ON public.retroactive_pay_configs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.company_id = retroactive_pay_configs.company_id
  )
);

CREATE POLICY "Users can delete retroactive pay configs for their company"
ON public.retroactive_pay_configs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.company_id = retroactive_pay_configs.company_id
  )
);

-- RLS Policies for retroactive_pay_config_items
CREATE POLICY "Users can view config items for accessible configs"
ON public.retroactive_pay_config_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.retroactive_pay_configs c
    JOIN public.profiles p ON p.company_id = c.company_id
    WHERE c.id = retroactive_pay_config_items.config_id AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can create config items for accessible configs"
ON public.retroactive_pay_config_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.retroactive_pay_configs c
    JOIN public.profiles p ON p.company_id = c.company_id
    WHERE c.id = retroactive_pay_config_items.config_id AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can update config items for accessible configs"
ON public.retroactive_pay_config_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.retroactive_pay_configs c
    JOIN public.profiles p ON p.company_id = c.company_id
    WHERE c.id = retroactive_pay_config_items.config_id AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can delete config items for accessible configs"
ON public.retroactive_pay_config_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.retroactive_pay_configs c
    JOIN public.profiles p ON p.company_id = c.company_id
    WHERE c.id = retroactive_pay_config_items.config_id AND p.id = auth.uid()
  )
);

-- RLS Policies for retroactive_pay_calculations
CREATE POLICY "Users can view calculations for accessible configs"
ON public.retroactive_pay_calculations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.retroactive_pay_configs c
    JOIN public.profiles p ON p.company_id = c.company_id
    WHERE c.id = retroactive_pay_calculations.config_id AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can create calculations for accessible configs"
ON public.retroactive_pay_calculations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.retroactive_pay_configs c
    JOIN public.profiles p ON p.company_id = c.company_id
    WHERE c.id = retroactive_pay_calculations.config_id AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can update calculations for accessible configs"
ON public.retroactive_pay_calculations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.retroactive_pay_configs c
    JOIN public.profiles p ON p.company_id = c.company_id
    WHERE c.id = retroactive_pay_calculations.config_id AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can delete calculations for accessible configs"
ON public.retroactive_pay_calculations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.retroactive_pay_configs c
    JOIN public.profiles p ON p.company_id = c.company_id
    WHERE c.id = retroactive_pay_calculations.config_id AND p.id = auth.uid()
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_retro_configs_company ON public.retroactive_pay_configs(company_id);
CREATE INDEX idx_retro_configs_pay_group ON public.retroactive_pay_configs(pay_group_id);
CREATE INDEX idx_retro_configs_status ON public.retroactive_pay_configs(status);
CREATE INDEX idx_retro_config_items_config ON public.retroactive_pay_config_items(config_id);
CREATE INDEX idx_retro_calculations_config ON public.retroactive_pay_calculations(config_id);
CREATE INDEX idx_retro_calculations_employee ON public.retroactive_pay_calculations(employee_id);
CREATE INDEX idx_retro_calculations_pay_year ON public.retroactive_pay_calculations(pay_year, pay_cycle_number);

-- Trigger for updated_at
CREATE TRIGGER update_retroactive_pay_configs_updated_at
BEFORE UPDATE ON public.retroactive_pay_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retroactive_pay_config_items_updated_at
BEFORE UPDATE ON public.retroactive_pay_config_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();