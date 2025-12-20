
-- =====================================================
-- SINT MAARTEN PAYROLL CONFIGURATION
-- =====================================================

-- 1. Add Sint Maarten Statutory Deduction Types
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, description, start_date, is_active)
VALUES
  -- AOV Old Age Pension
  ('SX', 'AOV', 'AOV Ouderdomspensioen', 'social_security', 'Algemene Ouderdomsverzekering - Old age pension insurance', '2024-01-01', true),
  -- AWW Widows/Orphans
  ('SX', 'AWW', 'AWW Weduwen/Wezen', 'social_security', 'Algemene Weduwen- en Wezenverzekering - Widows and orphans insurance', '2024-01-01', true),
  -- ZV Health Insurance
  ('SX', 'ZV', 'ZV Ziekteverzekering', 'social_security', 'Ziekteverzekering - Basic health insurance', '2024-01-01', true),
  -- AVBZ Care Insurance (Employee only)
  ('SX', 'AVBZ', 'AVBZ Zorgverzekering', 'social_security', 'Algemene Verzekering Bijzondere Ziektekosten - Long-term care insurance', '2024-01-01', true),
  -- Cessantia Severance Fund (Employer only)
  ('SX', 'CESSANTIA', 'Cessantia', 'employer_tax', 'Cessantia - Severance fund', '2024-01-01', true),
  -- OV Accident Insurance (Employer only)
  ('SX', 'OV', 'Ongevallenverzekering', 'employer_tax', 'Accident insurance (rate varies by industry)', '2024-01-01', true),
  -- Income Tax
  ('SX', 'IB', 'Inkomstenbelasting', 'income_tax', 'Sint Maarten progressive income tax', '2024-01-01', true)
ON CONFLICT (country, statutory_code) DO UPDATE SET
  statutory_name = EXCLUDED.statutory_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. Add Sint Maarten Statutory Rate Bands
-- AOV: Employee 6%, Employer 6% (capped at ANG 100,000/year)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, annual_max_employee, annual_max_employer, start_date, is_active)
SELECT id, 'Standard Rate', 0, 100000, 6.0, 6.0, 6000, 6000, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SX' AND statutory_code = 'AOV';

-- AWW: Employee 0.5%, Employer 0.5%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 100000, 0.5, 0.5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SX' AND statutory_code = 'AWW';

-- ZV: Employee 4.4%, Employer 8.3%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 4.4, 8.3, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SX' AND statutory_code = 'ZV';

-- AVBZ: Employee 1.5% only (no employer contribution)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 1.5, 0, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SX' AND statutory_code = 'AVBZ';

-- Cessantia: Employer 0.5% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 0.5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SX' AND statutory_code = 'CESSANTIA';

-- OV Accident: Employer ~1% (varies by industry)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active, notes)
SELECT id, 'Average Rate', 0, 999999999, 0, 1.0, '2024-01-01', true, 'Rate varies by industry risk class. Configure per company.'
FROM public.statutory_deduction_types WHERE country = 'SX' AND statutory_code = 'OV';

-- IB Income Tax Brackets (Annual amounts in ANG)
-- Band 1: ANG 0 - 27,561 = 12.50%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '12.50% Band', 0, 27561, 12.50, 0, 1, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SX' AND statutory_code = 'IB';

-- Band 2: ANG 27,562 - 43,579 = 21.50%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '21.50% Band', 27561.01, 43579, 21.50, 0, 3445.13, 2, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SX' AND statutory_code = 'IB';

-- Band 3: ANG 43,580 - 62,971 = 30.00%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '30.00% Band', 43579.01, 62971, 30.00, 0, 6889.00, 3, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SX' AND statutory_code = 'IB';

-- Band 4: ANG 62,972 - 98,181 = 37.50%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '37.50% Band', 62971.01, 98181, 37.50, 0, 12706.60, 4, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SX' AND statutory_code = 'IB';

-- Band 5: ANG 98,182+ = 47.50%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '47.50% Band', 98181.01, 999999999, 47.50, 0, 25910.35, 5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'SX' AND statutory_code = 'IB';

-- 3. Add Sint Maarten Statutory Contribution Tax Relief Rules
INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, description, legal_reference, effective_from, is_active)
VALUES
  ('SX', 'AOV', 'AOV Pension Contribution', 100, true, false, 'Employee AOV contributions are fully deductible from taxable income', 'Landsverordening Inkomstenbelasting', '2024-01-01', true),
  ('SX', 'AWW', 'AWW Contribution', 100, true, false, 'Employee AWW contributions are fully deductible', 'Landsverordening Inkomstenbelasting', '2024-01-01', true),
  ('SX', 'ZV', 'ZV Health Contribution', 100, true, false, 'Employee health insurance contributions are fully deductible', 'Landsverordening Inkomstenbelasting', '2024-01-01', true),
  ('SX', 'AVBZ', 'AVBZ Care Contribution', 100, true, false, 'Employee AVBZ contributions are fully deductible', 'Landsverordening Inkomstenbelasting', '2024-01-01', true);

-- 4. Add Sint Maarten Tax Relief Schemes
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, description, legal_reference, effective_from, is_active)
VALUES
  -- Personal Allowance (Belastingvrije som)
  ('SX', 'PERSONAL_ALLOWANCE', 'Belastingvrije Som', 'personal_relief', 'deduction', 'fixed_amount', 22350, 22350, false, 'Annual tax-free personal allowance', 'LIB Art. 16', '2024-01-01', true),
  -- Spouse Allowance
  ('SX', 'SPOUSE_ALLOWANCE', 'Partner Aftrek', 'personal_relief', 'deduction', 'fixed_amount', 5000, 5000, true, 'Annual allowance for non-working spouse', 'LIB', '2024-01-01', true),
  -- Child Allowance
  ('SX', 'CHILD_ALLOWANCE', 'Kinderaftrek', 'personal_relief', 'deduction', 'fixed_amount', 2500, 2500, true, 'Annual allowance per dependent child', 'LIB', '2024-01-01', true),
  -- Mortgage Interest
  ('SX', 'MORTGAGE_INTEREST', 'Hypotheekrente Aftrek', 'housing_education', 'deduction', 'fixed_amount', 20000, 20000, true, 'Mortgage interest deduction on primary residence', 'LIB', '2024-01-01', true);

-- 5. Add Sint Maarten Country Tax Settings
INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, refund_display_type, refund_calculation_frequency, description, effective_from, is_active)
VALUES ('SX', 'cumulative', true, 'automatic', 'reduced_tax', 'monthly', 'Sint Maarten uses cumulative tax calculation. Currency: ANG (pegged to USD at 1.79). Tax year is calendar year. Vacation allowance 8.33%. Constituent country of Kingdom of the Netherlands. Tourism-driven economy. Total employer burden ~16.3%.', '2024-01-01', true)
ON CONFLICT (country) DO UPDATE SET
  tax_calculation_method = EXCLUDED.tax_calculation_method,
  allow_mid_year_refunds = EXCLUDED.allow_mid_year_refunds,
  refund_method = EXCLUDED.refund_method,
  refund_display_type = EXCLUDED.refund_display_type,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
