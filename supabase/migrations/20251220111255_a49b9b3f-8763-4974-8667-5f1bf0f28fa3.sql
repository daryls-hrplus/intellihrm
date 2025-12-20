-- Create country tax settings table to define cumulative vs non-cumulative tax calculation
CREATE TABLE public.country_tax_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL UNIQUE,
  tax_calculation_method TEXT NOT NULL DEFAULT 'cumulative' CHECK (tax_calculation_method IN ('cumulative', 'non_cumulative')),
  allow_mid_year_refunds BOOLEAN NOT NULL DEFAULT true,
  refund_method TEXT DEFAULT 'automatic' CHECK (refund_method IN ('automatic', 'end_of_year', 'manual_claim')),
  description TEXT,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comments for clarity
COMMENT ON TABLE public.country_tax_settings IS 'Defines tax calculation method per country - cumulative (YTD-based with potential mid-year refunds) vs non-cumulative (period-only calculation)';
COMMENT ON COLUMN public.country_tax_settings.tax_calculation_method IS 'cumulative: Tax calculated on YTD basis, prior earnings/tax carried forward. non_cumulative: Tax calculated only on current period earnings.';
COMMENT ON COLUMN public.country_tax_settings.allow_mid_year_refunds IS 'For cumulative method: whether tax refunds can be applied during the year if over-deducted';
COMMENT ON COLUMN public.country_tax_settings.refund_method IS 'How refunds are handled: automatic (applied in payroll), end_of_year (annual reconciliation), manual_claim (employee must claim)';

-- Enable RLS
ALTER TABLE public.country_tax_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin/hr access
CREATE POLICY "Anyone can read country tax settings"
  ON public.country_tax_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage country tax settings"
  ON public.country_tax_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_country_tax_settings_updated_at
  BEFORE UPDATE ON public.country_tax_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings for common countries (cumulative examples)
INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, description)
VALUES 
  ('TT', 'cumulative', true, 'automatic', 'Trinidad and Tobago - PAYE calculated on cumulative YTD basis'),
  ('JM', 'cumulative', true, 'automatic', 'Jamaica - PAYE calculated on cumulative YTD basis'),
  ('BB', 'cumulative', true, 'automatic', 'Barbados - PAYE calculated on cumulative YTD basis'),
  ('GY', 'cumulative', true, 'automatic', 'Guyana - PAYE calculated on cumulative YTD basis'),
  ('GH', 'cumulative', true, 'automatic', 'Ghana - PAYE calculated on cumulative YTD basis'),
  ('NG', 'non_cumulative', false, 'end_of_year', 'Nigeria - PAYE calculated on period basis, annual reconciliation'),
  ('DO', 'non_cumulative', false, 'end_of_year', 'Dominican Republic - ISR calculated on period basis'),
  ('BS', 'cumulative', true, 'automatic', 'Bahamas - No income tax but NIB is cumulative'),
  ('LC', 'cumulative', true, 'automatic', 'Saint Lucia - PAYE calculated on cumulative basis'),
  ('AG', 'cumulative', true, 'automatic', 'Antigua and Barbuda - PAYE on cumulative basis');

-- Create index for country lookups
CREATE INDEX idx_country_tax_settings_country ON public.country_tax_settings(country);
CREATE INDEX idx_country_tax_settings_active ON public.country_tax_settings(is_active, effective_from, effective_to);