
-- =====================================================
-- PANAMA PAYROLL CONFIGURATION
-- =====================================================

-- 1. Add Panama Statutory Deduction Types
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, description, start_date, is_active)
VALUES
  -- CSS Social Security
  ('PA', 'CSS', 'CSS Seguro Social', 'social_security', 'Caja de Seguro Social - Main social security contribution', '2024-01-01', true),
  -- Educational Insurance
  ('PA', 'SEGURO_EDU', 'Seguro Educativo', 'social_security', 'Educational insurance contribution for public education funding', '2024-01-01', true),
  -- Professional Risk (Employer only - average rate)
  ('PA', 'RIESGO_PROF', 'Riesgo Profesional', 'employer_tax', 'Professional/occupational risk insurance (rate varies by industry 0.98%-5.67%)', '2024-01-01', true),
  -- Income Tax
  ('PA', 'ISR', 'Impuesto Sobre la Renta', 'income_tax', 'Panama progressive income tax', '2024-01-01', true)
ON CONFLICT (country, statutory_code) DO UPDATE SET
  statutory_name = EXCLUDED.statutory_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. Add Panama Statutory Rate Bands
-- CSS: Employee 9.75%, Employer 12.25%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 9.75, 12.25, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'PA' AND statutory_code = 'CSS';

-- Educational Insurance: Employee 1.25%, Employer 1.5%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 1.25, 1.5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'PA' AND statutory_code = 'SEGURO_EDU';

-- Professional Risk: Employer only (using average 1.75%, can be configured per company)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active, notes)
SELECT id, 'Average Rate', 0, 999999999, 0, 1.75, '2024-01-01', true, 'Rate varies by industry: 0.98% (low risk) to 5.67% (high risk). Configure per company.'
FROM public.statutory_deduction_types WHERE country = 'PA' AND statutory_code = 'RIESGO_PROF';

-- ISR Income Tax Brackets (Annual amounts in USD/PAB)
-- Band 1: $0 - $11,000 = 0%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, 'Tax Free Band', 0, 11000, 0, 0, 1, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'PA' AND statutory_code = 'ISR';

-- Band 2: $11,001 - $50,000 = 15%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '15% Band', 11000.01, 50000, 15.0, 0, 2, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'PA' AND statutory_code = 'ISR';

-- Band 3: $50,001+ = 25%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '25% Band', 50000.01, 999999999, 25.0, 0, 3, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'PA' AND statutory_code = 'ISR';

-- 3. Add Panama Statutory Contribution Tax Relief Rules
INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, description, legal_reference, effective_from, is_active)
VALUES
  ('PA', 'CSS', 'CSS Social Security', 100, true, false, 'Employee CSS contributions are fully deductible from taxable income', 'Código Fiscal Art. 709', '2024-01-01', true),
  ('PA', 'SEGURO_EDU', 'Educational Insurance', 100, true, false, 'Employee educational insurance contributions are fully deductible', 'Código Fiscal Art. 709', '2024-01-01', true);

-- 4. Add Panama Tax Relief Schemes
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, description, legal_reference, effective_from, is_active)
VALUES
  -- Personal Deduction
  ('PA', 'PERSONAL_DEDUCTION', 'Personal Deduction', 'personal_relief', 'deduction', 'fixed_amount', 800, 800, false, 'Annual personal deduction of $800', 'Código Fiscal Art. 709', '2024-01-01', true),
  -- Spouse Deduction
  ('PA', 'SPOUSE_DEDUCTION', 'Spouse Deduction', 'personal_relief', 'deduction', 'fixed_amount', 250, 250, true, 'Annual deduction of $250 for dependent spouse', 'Código Fiscal Art. 709', '2024-01-01', true),
  -- Dependent Deduction (per child)
  ('PA', 'DEPENDENT_DEDUCTION', 'Dependent Child Deduction', 'personal_relief', 'deduction', 'fixed_amount', 250, 250, true, 'Annual deduction of $250 per dependent child', 'Código Fiscal Art. 709', '2024-01-01', true),
  -- Mortgage Interest
  ('PA', 'MORTGAGE_INTEREST', 'Mortgage Interest Deduction', 'housing_education', 'deduction', 'fixed_amount', 15000, 15000, true, 'Mortgage interest deduction up to $15,000 annually on primary residence', 'Código Fiscal Art. 709', '2024-01-01', true),
  -- Educational Expenses
  ('PA', 'EDUCATION', 'Educational Expenses', 'housing_education', 'deduction', 'fixed_amount', 3600, 3600, true, 'Educational expenses up to $3,600 annually for self or dependents', 'Código Fiscal Art. 709', '2024-01-01', true),
  -- Medical Expenses
  ('PA', 'MEDICAL', 'Medical Expenses', 'personal_relief', 'deduction', 'fixed_amount', 1000, 1000, true, 'Medical expenses deduction up to $1,000 annually', 'Código Fiscal Art. 709', '2024-01-01', true);

-- 5. Add Panama Country Tax Settings
INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, refund_display_type, refund_calculation_frequency, description, effective_from, is_active)
VALUES ('PA', 'cumulative', true, 'automatic', 'reduced_tax', 'monthly', 'Panama uses cumulative tax calculation. Tax year is calendar year (Jan-Dec). Aguinaldo (13th month) paid in 3 installments (April, August, December) is taxable. Currency: Balboa (PAB) pegged 1:1 to USD.', '2024-01-01', true)
ON CONFLICT (country) DO UPDATE SET
  tax_calculation_method = EXCLUDED.tax_calculation_method,
  allow_mid_year_refunds = EXCLUDED.allow_mid_year_refunds,
  refund_method = EXCLUDED.refund_method,
  refund_display_type = EXCLUDED.refund_display_type,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
