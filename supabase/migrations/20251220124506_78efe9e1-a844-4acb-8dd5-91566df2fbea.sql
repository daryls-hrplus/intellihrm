
-- =====================================================
-- HONDURAS PAYROLL CONFIGURATION
-- =====================================================

-- 1. Add Honduras Statutory Deduction Types
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, description, start_date, is_active)
VALUES
  ('HN', 'IHSS_EM', 'IHSS Enfermedad-Maternidad', 'social_security', 'Instituto Hondureño de Seguridad Social - Health and Maternity coverage', '2024-01-01', true),
  ('HN', 'IHSS_IVM', 'IHSS Invalidez-Vejez-Muerte', 'social_security', 'Instituto Hondureño de Seguridad Social - Disability, Old Age and Death coverage', '2024-01-01', true),
  ('HN', 'RAP', 'RAP Housing Fund', 'social_security', 'Régimen de Aportaciones Privadas - Mandatory housing savings fund', '2024-01-01', true),
  ('HN', 'INFOP', 'INFOP Training Fund', 'employer_tax', 'Instituto Nacional de Formación Profesional - Employer training contribution', '2024-01-01', true),
  ('HN', 'ISR', 'Impuesto Sobre la Renta', 'income_tax', 'Honduras progressive income tax', '2024-01-01', true)
ON CONFLICT (country, statutory_code) DO UPDATE SET
  statutory_name = EXCLUDED.statutory_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. Add Honduras Statutory Rate Bands
-- IHSS Enfermedad-Maternidad: Employee 2.5%, Employer 5% (capped at 3x minimum wage)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, annual_max_employee, annual_max_employer, start_date, is_active)
SELECT id, 'Standard Rate', 0, 34641, 2.5, 5.0, 10392.30, 20784.60, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'HN' AND statutory_code = 'IHSS_EM';

-- IHSS Invalidez-Vejez-Muerte: Employee 1%, Employer 2%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, annual_max_employee, annual_max_employer, start_date, is_active)
SELECT id, 'Standard Rate', 0, 34641, 1.0, 2.0, 4156.92, 8313.84, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'HN' AND statutory_code = 'IHSS_IVM';

-- RAP: Employee 1.5%, Employer 1.5%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 1.5, 1.5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'HN' AND statutory_code = 'RAP';

-- INFOP: Employer 1% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 1.0, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'HN' AND statutory_code = 'INFOP';

-- ISR Income Tax Brackets (Annual amounts in Lempiras)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, 'Tax Free Band', 0, 182746, 0, 0, 1, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'HN' AND statutory_code = 'ISR';

INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '15% Band', 182746.01, 278649, 15.0, 0, 2, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'HN' AND statutory_code = 'ISR';

INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '20% Band', 278649.01, 648267, 20.0, 0, 3, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'HN' AND statutory_code = 'ISR';

INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '25% Band', 648267.01, 999999999, 25.0, 0, 4, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'HN' AND statutory_code = 'ISR';

-- 3. Add Honduras Statutory Contribution Tax Relief Rules
INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, description, legal_reference, effective_from, is_active)
VALUES
  ('HN', 'IHSS_EM', 'IHSS Health Contribution', 100, true, false, 'Employee IHSS health contributions are fully deductible from taxable income', 'Ley del ISR Art. 15', '2024-01-01', true),
  ('HN', 'IHSS_IVM', 'IHSS Pension Contribution', 100, true, false, 'Employee IHSS pension contributions are fully deductible from taxable income', 'Ley del ISR Art. 15', '2024-01-01', true),
  ('HN', 'RAP', 'RAP Housing Contribution', 100, true, false, 'Employee RAP contributions are fully deductible from taxable income', 'Ley del RAP', '2024-01-01', true);

-- 4. Add Honduras Tax Relief Schemes (using correct enum values)
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, description, legal_reference, effective_from, is_active)
VALUES
  -- Personal Allowance
  ('HN', 'PERSONAL_ALLOWANCE', 'Personal Allowance', 'personal_relief', 'deduction', 'fixed_amount', 40000, 40000, false, 'Annual personal allowance deducted from taxable income', 'Ley del ISR Art. 22', '2024-01-01', true),
  -- Medical Expenses
  ('HN', 'MEDICAL_EXPENSES', 'Medical Expenses Deduction', 'personal_relief', 'deduction', 'fixed_amount', 50000, 50000, true, 'Deduction for documented medical expenses (up to L50,000 annually)', 'Ley del ISR Art. 24', '2024-01-01', true),
  -- Educational Expenses
  ('HN', 'EDUCATION', 'Educational Expenses Deduction', 'housing_education', 'deduction', 'fixed_amount', 50000, 50000, true, 'Deduction for educational expenses for self or dependents', 'Ley del ISR Art. 24', '2024-01-01', true),
  -- Mortgage Interest
  ('HN', 'MORTGAGE_INTEREST', 'Mortgage Interest Deduction', 'housing_education', 'deduction', 'fixed_amount', 100000, 100000, true, 'Deduction for mortgage interest on primary residence', 'Ley del ISR Art. 24', '2024-01-01', true),
  -- Charitable Donations (up to 10% of gross income)
  ('HN', 'DONATIONS', 'Charitable Donations', 'personal_relief', 'deduction', 'percentage_of_income', 10, NULL, true, 'Donations to registered charities up to 10% of gross income', 'Ley del ISR Art. 24', '2024-01-01', true);

-- 5. Add Honduras Country Tax Settings
INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, refund_display_type, refund_calculation_frequency, description, effective_from, is_active)
VALUES ('HN', 'cumulative', true, 'automatic', 'reduced_tax', 'monthly', 'Honduras uses cumulative tax calculation. Tax year is calendar year (Jan-Dec). 13th month (Aguinaldo) paid in December and 14th month paid in June/July are taxable.', '2024-01-01', true)
ON CONFLICT (country) DO UPDATE SET
  tax_calculation_method = EXCLUDED.tax_calculation_method,
  allow_mid_year_refunds = EXCLUDED.allow_mid_year_refunds,
  refund_method = EXCLUDED.refund_method,
  refund_display_type = EXCLUDED.refund_display_type,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
