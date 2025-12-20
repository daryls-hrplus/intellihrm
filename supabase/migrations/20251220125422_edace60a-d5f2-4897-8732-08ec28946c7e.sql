
-- =====================================================
-- EL SALVADOR PAYROLL CONFIGURATION
-- =====================================================

-- 1. Add El Salvador Statutory Deduction Types
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, description, start_date, is_active)
VALUES
  -- ISSS Health Insurance
  ('SV', 'ISSS', 'ISSS Seguro Social', 'social_security', 'Instituto Salvadoreño del Seguro Social - Health insurance (capped at $1,000/month salary)', '2024-01-01', true),
  -- AFP Pension
  ('SV', 'AFP', 'AFP Pensión', 'social_security', 'Administradora de Fondos de Pensiones - Pension contribution (capped at $7,028.57/month)', '2024-01-01', true),
  -- INSAFORP Training (Employer only)
  ('SV', 'INSAFORP', 'INSAFORP', 'employer_tax', 'Instituto Salvadoreño de Formación Profesional - Training fund', '2024-01-01', true),
  -- Income Tax
  ('SV', 'ISR', 'Impuesto Sobre la Renta', 'income_tax', 'El Salvador progressive income tax', '2024-01-01', true)
ON CONFLICT (country, statutory_code) DO UPDATE SET
  statutory_name = EXCLUDED.statutory_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. Add El Salvador Statutory Rate Bands
-- ISSS: Employee 3%, Employer 7.5% (capped at $1,000/month = max $30 employee, $75 employer)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, annual_max_employee, annual_max_employer, start_date, is_active)
SELECT id, 'Standard Rate', 0, 1000, 3.0, 7.5, 360, 900, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SV' AND statutory_code = 'ISSS';

-- AFP: Employee 7.25%, Employer 8.75% (capped at $7,028.57/month)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, annual_max_employee, annual_max_employer, start_date, is_active)
SELECT id, 'Standard Rate', 0, 7028.57, 7.25, 8.75, 6114.86, 7380.00, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SV' AND statutory_code = 'AFP';

-- INSAFORP: Employer 1% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 1.0, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SV' AND statutory_code = 'INSAFORP';

-- ISR Income Tax Brackets (Monthly amounts in USD)
-- Band 1: $0 - $472.00 = 0%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, 'Tax Free Band', 0, 472.00, 0, 0, 0, 1, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SV' AND statutory_code = 'ISR';

-- Band 2: $472.01 - $895.24 = 10% on excess + $17.67 fixed
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '10% Band', 472.01, 895.24, 10.0, 0, 17.67, 2, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SV' AND statutory_code = 'ISR';

-- Band 3: $895.25 - $2,038.10 = 20% on excess + $60.00 fixed
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '20% Band', 895.25, 2038.10, 20.0, 0, 60.00, 3, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SV' AND statutory_code = 'ISR';

-- Band 4: $2,038.11+ = 30% on excess + $288.57 fixed
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '30% Band', 2038.11, 999999999, 30.0, 0, 288.57, 4, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SV' AND statutory_code = 'ISR';

-- 3. Add El Salvador Statutory Contribution Tax Relief Rules
INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, description, legal_reference, effective_from, is_active)
VALUES
  ('SV', 'ISSS', 'ISSS Health Contribution', 100, true, false, 'Employee ISSS contributions are fully deductible from taxable income', 'Ley del ISR Art. 33', '2024-01-01', true),
  ('SV', 'AFP', 'AFP Pension Contribution', 100, true, false, 'Employee AFP pension contributions are fully deductible from taxable income', 'Ley del ISR Art. 33', '2024-01-01', true);

-- 4. Add El Salvador Tax Relief Schemes
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, description, legal_reference, effective_from, is_active)
VALUES
  -- Medical Expenses
  ('SV', 'MEDICAL', 'Medical Expenses Deduction', 'personal_relief', 'deduction', 'fixed_amount', 800, 800, true, 'Annual deduction for documented medical expenses up to $800', 'Ley del ISR Art. 33', '2024-01-01', true),
  -- Educational Expenses
  ('SV', 'EDUCATION', 'Educational Expenses', 'housing_education', 'deduction', 'fixed_amount', 800, 800, true, 'Annual deduction for educational expenses up to $800', 'Ley del ISR Art. 33', '2024-01-01', true),
  -- Donations to Nonprofits
  ('SV', 'DONATIONS', 'Charitable Donations', 'personal_relief', 'deduction', 'percentage_of_income', 20, NULL, true, 'Donations to registered nonprofits up to 20% of taxable income', 'Ley del ISR Art. 32', '2024-01-01', true);

-- 5. Add El Salvador Country Tax Settings
INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, refund_display_type, refund_calculation_frequency, description, effective_from, is_active)
VALUES ('SV', 'cumulative', true, 'automatic', 'reduced_tax', 'monthly', 'El Salvador uses cumulative tax calculation. Currency: USD (dollarized since 2001). Tax year is calendar year (Jan-Dec). Aguinaldo based on tenure: 10 days (<1yr), 15 days (1-3yrs), 18 days (3-10yrs), 21 days (>10yrs).', '2024-01-01', true)
ON CONFLICT (country) DO UPDATE SET
  tax_calculation_method = EXCLUDED.tax_calculation_method,
  allow_mid_year_refunds = EXCLUDED.allow_mid_year_refunds,
  refund_method = EXCLUDED.refund_method,
  refund_display_type = EXCLUDED.refund_display_type,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
