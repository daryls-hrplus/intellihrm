-- Create statutory_rate_bands table for tax brackets, NIS, social security, etc.
CREATE TABLE public.statutory_rate_bands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  statutory_type_id UUID NOT NULL REFERENCES public.statutory_deduction_types(id) ON DELETE CASCADE,
  band_name VARCHAR(100),
  min_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  max_amount NUMERIC(15,2),
  employee_rate NUMERIC(8,6),
  employer_rate NUMERIC(8,6),
  fixed_amount NUMERIC(15,2),
  earnings_class VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.statutory_rate_bands ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view statutory_rate_bands"
ON public.statutory_rate_bands
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage statutory_rate_bands"
ON public.statutory_rate_bands
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    JOIN public.roles r ON r.id = ur.role_id
    WHERE p.id = auth.uid() AND r.code IN ('admin', 'super_admin', 'hr_manager')
  )
);

-- Create indexes
CREATE INDEX idx_statutory_rate_bands_type ON public.statutory_rate_bands(statutory_type_id);
CREATE INDEX idx_statutory_rate_bands_company ON public.statutory_rate_bands(company_id);
CREATE INDEX idx_statutory_rate_bands_dates ON public.statutory_rate_bands(start_date, end_date);

-- Create trigger for updated_at
CREATE TRIGGER update_statutory_rate_bands_updated_at
BEFORE UPDATE ON public.statutory_rate_bands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();