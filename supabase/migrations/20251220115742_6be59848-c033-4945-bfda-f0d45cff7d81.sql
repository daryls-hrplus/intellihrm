-- Create table for configuring statutory deductions that provide tax relief
CREATE TABLE public.statutory_tax_relief_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country VARCHAR(10) NOT NULL,
  statutory_type_code VARCHAR(50) NOT NULL,
  statutory_type_name VARCHAR(100) NOT NULL,
  relief_percentage DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  annual_cap DECIMAL(15,2) DEFAULT NULL,
  monthly_cap DECIMAL(15,2) DEFAULT NULL,
  applies_to_employee_contribution BOOLEAN NOT NULL DEFAULT true,
  applies_to_employer_contribution BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  legal_reference VARCHAR(255),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_country_statutory_relief UNIQUE (country, statutory_type_code, effective_from)
);

-- Enable RLS
ALTER TABLE public.statutory_tax_relief_rules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view statutory tax relief rules"
  ON public.statutory_tax_relief_rules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage statutory tax relief rules"
  ON public.statutory_tax_relief_rules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'hr_manager', 'payroll_admin')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_statutory_tax_relief_rules_updated_at
  BEFORE UPDATE ON public.statutory_tax_relief_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default rules for known countries
INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, description, legal_reference) VALUES
-- Jamaica
('JM', 'NIS', 'National Insurance Scheme', 100.00, 'Employee NIS contributions are fully deductible from taxable income', 'Income Tax Act - Jamaica'),
('JM', 'NHT', 'National Housing Trust', 100.00, 'Employee NHT contributions are fully deductible from taxable income', 'Income Tax Act - Jamaica'),
('JM', 'HEART', 'HEART/NSTA Trust', 100.00, 'HEART contributions are tax deductible', 'Income Tax Act - Jamaica'),

-- Trinidad and Tobago
('TT', 'NIS', 'National Insurance System', 100.00, 'Employee NIS contributions are fully deductible from taxable income', 'Income Tax Act Ch. 75:01 - Trinidad'),

-- Barbados
('BB', 'NIS', 'National Insurance Scheme', 100.00, 'Employee NIS contributions are fully deductible from taxable income', 'Income Tax Act - Barbados'),

-- Ghana
('GH', 'SSNIT', 'Social Security (SSNIT)', 100.00, 'Employee SSNIT contributions (5.5%) are fully deductible from taxable income', 'Income Tax Act 2015 (Act 896) - Ghana'),
('GH', 'TIER2', 'Tier 2 Pension', 100.00, 'Tier 2 pension contributions are tax deductible', 'National Pensions Act 2008 (Act 766) - Ghana'),
('GH', 'TIER3', 'Tier 3 Pension (Voluntary)', 100.00, 'Voluntary Tier 3 contributions are tax deductible up to limits', 'National Pensions Act 2008 (Act 766) - Ghana'),

-- Nigeria
('NG', 'PENSION', 'Pension Fund Contribution', 100.00, 'Employee pension contributions are tax deductible', 'Personal Income Tax Act - Nigeria'),
('NG', 'NHF', 'National Housing Fund', 100.00, 'NHF contributions are tax deductible', 'Personal Income Tax Act - Nigeria'),

-- Dominican Republic
('DO', 'AFP', 'Pension Fund (AFP)', 100.00, 'Employee pension contributions are tax deductible', 'Tax Code - Dominican Republic'),
('DO', 'SFS', 'Health Insurance (SFS)', 100.00, 'Employee health insurance contributions are tax deductible', 'Tax Code - Dominican Republic'),

-- UK (partial - some contributions affect bands)
('GB', 'NIC', 'National Insurance Contributions', 0.00, 'NICs do not directly reduce taxable income but affect tax band thresholds', 'Income Tax Act - UK');

-- Add comment
COMMENT ON TABLE public.statutory_tax_relief_rules IS 'Configures which statutory deductions (social security, pensions) provide tax relief by reducing taxable income';