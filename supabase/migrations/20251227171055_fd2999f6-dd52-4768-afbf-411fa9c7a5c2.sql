-- Create company_currencies junction table
CREATE TABLE public.company_currencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  currency_id UUID NOT NULL REFERENCES public.currencies(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, currency_id)
);

-- Add comments
COMMENT ON TABLE public.company_currencies IS 'Links companies to the currencies they support for payments';
COMMENT ON COLUMN public.company_currencies.is_default IS 'The default currency for this company (only one should be true per company)';
COMMENT ON COLUMN public.company_currencies.sort_order IS 'Display order for currency selection dropdowns';

-- Enable RLS
ALTER TABLE public.company_currencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their company currencies"
  ON public.company_currencies FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "HR can manage company currencies"
  ON public.company_currencies FOR ALL
  USING (
    company_id IN (
      SELECT p.company_id FROM public.profiles p 
      WHERE p.id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'hr_manager', 'payroll_admin')
    )
  );

-- Create index for performance
CREATE INDEX idx_company_currencies_company ON public.company_currencies(company_id);
CREATE INDEX idx_company_currencies_active ON public.company_currencies(company_id, is_active) WHERE is_active = true;

-- Add trigger for updated_at
CREATE TRIGGER update_company_currencies_updated_at
  BEFORE UPDATE ON public.company_currencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();