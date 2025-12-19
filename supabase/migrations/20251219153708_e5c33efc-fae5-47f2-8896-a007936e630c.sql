
-- Drop the partially created table and recreate properly
DROP TABLE IF EXISTS public.country_fiscal_years CASCADE;

-- Create country fiscal year configuration table
CREATE TABLE public.country_fiscal_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code VARCHAR(3) NOT NULL UNIQUE,
  country_name VARCHAR(100) NOT NULL,
  fiscal_year_start_month INTEGER NOT NULL CHECK (fiscal_year_start_month BETWEEN 1 AND 12),
  fiscal_year_start_day INTEGER NOT NULL DEFAULT 1 CHECK (fiscal_year_start_day BETWEEN 1 AND 31),
  tax_year_same_as_fiscal BOOLEAN NOT NULL DEFAULT true,
  tax_year_start_month INTEGER CHECK (tax_year_start_month BETWEEN 1 AND 12),
  tax_year_start_day INTEGER CHECK (tax_year_start_day BETWEEN 1 AND 31),
  week_start_day INTEGER NOT NULL DEFAULT 1 CHECK (week_start_day BETWEEN 0 AND 6),
  currency_code VARCHAR(3) NOT NULL,
  date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.country_fiscal_years ENABLE ROW LEVEL SECURITY;

-- Create policy for read access (all authenticated users can read)
CREATE POLICY "Authenticated users can view country fiscal years"
ON public.country_fiscal_years
FOR SELECT
TO authenticated
USING (true);

-- Create policy for admin write access using user_roles table
CREATE POLICY "Admins can manage country fiscal years"
ON public.country_fiscal_years
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.code IN ('admin', 'super_admin', 'hr_admin', 'payroll_admin')
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_country_fiscal_years_updated_at
BEFORE UPDATE ON public.country_fiscal_years
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index
CREATE INDEX idx_country_fiscal_years_country_code ON public.country_fiscal_years(country_code);

COMMENT ON TABLE public.country_fiscal_years IS 'Stores fiscal/tax year configuration by country for payroll processing';
