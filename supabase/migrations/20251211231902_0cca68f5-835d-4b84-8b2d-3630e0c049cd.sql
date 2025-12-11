-- Create currencies table
CREATE TABLE public.currencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

-- Policies - everyone can view, only admins can manage
CREATE POLICY "Authenticated users can view currencies"
  ON public.currencies FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage currencies"
  ON public.currencies FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_currencies_updated_at
  BEFORE UPDATE ON public.currencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert common currencies
INSERT INTO public.currencies (code, name, symbol) VALUES
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('GBP', 'British Pound', '£'),
  ('JPY', 'Japanese Yen', '¥'),
  ('CAD', 'Canadian Dollar', 'C$'),
  ('AUD', 'Australian Dollar', 'A$'),
  ('CHF', 'Swiss Franc', 'CHF'),
  ('CNY', 'Chinese Yuan', '¥'),
  ('INR', 'Indian Rupee', '₹'),
  ('AED', 'UAE Dirham', 'د.إ'),
  ('SAR', 'Saudi Riyal', '﷼'),
  ('SGD', 'Singapore Dollar', 'S$'),
  ('HKD', 'Hong Kong Dollar', 'HK$'),
  ('MXN', 'Mexican Peso', '$'),
  ('BRL', 'Brazilian Real', 'R$'),
  ('ZAR', 'South African Rand', 'R'),
  ('KRW', 'South Korean Won', '₩'),
  ('NZD', 'New Zealand Dollar', 'NZ$'),
  ('SEK', 'Swedish Krona', 'kr'),
  ('NOK', 'Norwegian Krone', 'kr'),
  ('DKK', 'Danish Krone', 'kr'),
  ('PLN', 'Polish Zloty', 'zł'),
  ('THB', 'Thai Baht', '฿'),
  ('MYR', 'Malaysian Ringgit', 'RM'),
  ('IDR', 'Indonesian Rupiah', 'Rp'),
  ('PHP', 'Philippine Peso', '₱'),
  ('EGP', 'Egyptian Pound', 'E£'),
  ('NGN', 'Nigerian Naira', '₦'),
  ('KWD', 'Kuwaiti Dinar', 'د.ك'),
  ('QAR', 'Qatari Riyal', 'ر.ق');