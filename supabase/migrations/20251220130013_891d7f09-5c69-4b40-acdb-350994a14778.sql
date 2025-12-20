
-- =====================================================
-- NICARAGUA PAYROLL CONFIGURATION
-- =====================================================

-- 1. Add Nicaragua Statutory Deduction Types
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, description, start_date, is_active)
VALUES
  -- INSS Social Security
  ('NI', 'INSS', 'INSS Seguro Social', 'social_security', 'Instituto Nicaragüense de Seguridad Social - Health, pension, and disability coverage', '2024-01-01', true),
  -- INATEC Training (Employer only)
  ('NI', 'INATEC', 'INATEC', 'employer_tax', 'Instituto Nacional Tecnológico - Technical training fund', '2024-01-01', true),
  -- Income Tax (IR)
  ('NI', 'IR', 'Impuesto sobre la Renta', 'income_tax', 'Nicaragua progressive income tax', '2024-01-01', true)
ON CONFLICT (country, statutory_code) DO UPDATE SET
  statutory_name = EXCLUDED.statutory_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. Add Nicaragua Statutory Rate Bands
-- INSS: Employee 7%, Employer 22.5% (capped at C$132,005.69/month)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, annual_max_employee, annual_max_employer, start_date, is_active)
SELECT id, 'Standard Rate', 0, 132005.69, 7.0, 22.5, 110884.78, 356415.36, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'NI' AND statutory_code = 'INSS';

-- INATEC: Employer 2% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 2.0, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'NI' AND statutory_code = 'INATEC';

-- IR Income Tax Brackets (Annual amounts in Córdobas)
-- Band 1: C$0 - C$100,000 = 0%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, 'Tax Free Band', 0, 100000, 0, 0, 0, 1, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'NI' AND statutory_code = 'IR';

-- Band 2: C$100,001 - C$200,000 = 15%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '15% Band', 100000.01, 200000, 15.0, 0, 0, 2, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'NI' AND statutory_code = 'IR';

-- Band 3: C$200,001 - C$350,000 = 20% + C$15,000 fixed
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '20% Band', 200000.01, 350000, 20.0, 0, 15000, 3, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'NI' AND statutory_code = 'IR';

-- Band 4: C$350,001 - C$500,000 = 25% + C$45,000 fixed
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '25% Band', 350000.01, 500000, 25.0, 0, 45000, 4, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'NI' AND statutory_code = 'IR';

-- Band 5: C$500,001+ = 30% + C$82,500 fixed
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '30% Band', 500000.01, 999999999, 30.0, 0, 82500, 5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'NI' AND statutory_code = 'IR';

-- 3. Add Nicaragua Statutory Contribution Tax Relief Rules
INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, description, legal_reference, effective_from, is_active)
VALUES
  ('NI', 'INSS', 'INSS Social Security', 100, true, false, 'Employee INSS contributions are fully deductible from taxable income', 'Ley de Concertación Tributaria Art. 21', '2024-01-01', true);

-- 4. Add Nicaragua Tax Relief Schemes
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, description, legal_reference, effective_from, is_active)
VALUES
  -- Medical Expenses
  ('NI', 'MEDICAL', 'Gastos Médicos', 'personal_relief', 'deduction', 'fixed_amount', 50000, 50000, true, 'Documented medical expenses for taxpayer and dependents', 'Ley de Concertación Tributaria', '2024-01-01', true),
  -- Educational Expenses
  ('NI', 'EDUCATION', 'Gastos Educativos', 'housing_education', 'deduction', 'fixed_amount', 50000, 50000, true, 'Educational expenses for self or dependents', 'Ley de Concertación Tributaria', '2024-01-01', true),
  -- Donations
  ('NI', 'DONATIONS', 'Donaciones', 'personal_relief', 'deduction', 'percentage_of_income', 10, NULL, true, 'Donations to registered nonprofits up to 10% of net income', 'Ley de Concertación Tributaria', '2024-01-01', true);

-- 5. Add Nicaragua Country Tax Settings
INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, refund_display_type, refund_calculation_frequency, description, effective_from, is_active)
VALUES ('NI', 'cumulative', true, 'automatic', 'reduced_tax', 'monthly', 'Nicaragua uses cumulative tax calculation. Tax year is calendar year (Jan-Dec). Aguinaldo (13th month = 1 month salary) paid in December. Vacation: 15 days after 6 months. Indemnización: 1 month per year worked (max 5 months). Total employer burden ~24.5%.', '2024-01-01', true)
ON CONFLICT (country) DO UPDATE SET
  tax_calculation_method = EXCLUDED.tax_calculation_method,
  allow_mid_year_refunds = EXCLUDED.allow_mid_year_refunds,
  refund_method = EXCLUDED.refund_method,
  refund_display_type = EXCLUDED.refund_display_type,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
