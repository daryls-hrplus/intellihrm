
-- =====================================================
-- BONAIRE (CARIBBEAN NETHERLANDS) PAYROLL CONFIGURATION
-- =====================================================

-- 1. Add Bonaire Statutory Deduction Types (BQ = Caribbean Netherlands)
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, description, start_date, is_active)
VALUES
  -- AOV Old Age Pension
  ('BQ', 'AOV', 'AOV Ouderdomspensioen', 'social_security', 'Algemene Ouderdomsverzekering - Old age pension insurance', '2024-01-01', true),
  -- AWW Widows/Orphans (Employee only)
  ('BQ', 'AWW', 'AWW Weduwen/Wezen', 'social_security', 'Algemene Weduwen- en Wezenverzekering - Widows and orphans insurance', '2024-01-01', true),
  -- ZV Health Insurance
  ('BQ', 'ZV', 'ZV Ziekteverzekering', 'social_security', 'Ziekteverzekering - Basic health insurance', '2024-01-01', true),
  -- Cessantia Severance Fund
  ('BQ', 'CESSANTIA', 'Cessantia', 'social_security', 'Cessantia - Severance and unemployment fund', '2024-01-01', true),
  -- AVBZ Care Insurance (Employer only)
  ('BQ', 'AVBZ', 'AVBZ Zorgverzekering', 'employer_tax', 'Algemene Verzekering Bijzondere Ziektekosten - Long-term care insurance', '2024-01-01', true),
  -- Accident Insurance (Employer only)
  ('BQ', 'OV', 'Ongevallenverzekering', 'employer_tax', 'Accident insurance (rate varies by industry)', '2024-01-01', true),
  -- Income Tax
  ('BQ', 'IB', 'Inkomstenbelasting', 'income_tax', 'Bonaire progressive income tax', '2024-01-01', true)
ON CONFLICT (country, statutory_code) DO UPDATE SET
  statutory_name = EXCLUDED.statutory_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. Add Bonaire Statutory Rate Bands
-- AOV: Employee 5%, Employer 6% (capped at $36,579/year)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, annual_max_employee, annual_max_employer, start_date, is_active)
SELECT id, 'Standard Rate', 0, 36579, 5.0, 6.0, 1828.95, 2194.74, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'BQ' AND statutory_code = 'AOV';

-- AWW: Employee 1% only (no employer contribution)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 36579, 1.0, 0, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'BQ' AND statutory_code = 'AWW';

-- ZV: Employee 2.5%, Employer 9.3%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 2.5, 9.3, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'BQ' AND statutory_code = 'ZV';

-- Cessantia: Employee 0.5%, Employer 0.5%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0.5, 0.5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'BQ' AND statutory_code = 'CESSANTIA';

-- AVBZ: Employer 1.5% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 1.5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'BQ' AND statutory_code = 'AVBZ';

-- Accident Insurance: Employer ~1% (varies by industry)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active, notes)
SELECT id, 'Average Rate', 0, 999999999, 0, 1.0, '2024-01-01', true, 'Rate varies by industry risk class. Configure per company.'
FROM public.statutory_deduction_types WHERE country = 'BQ' AND statutory_code = 'OV';

-- IB Income Tax Brackets (Annual amounts in USD)
-- Band 1: $0 - $12,198 = 5%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '5% Band', 0, 12198, 5.0, 0, 1, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'BQ' AND statutory_code = 'IB';

-- Band 2: $12,199 - $22,360 = 15.75%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '15.75% Band', 12198.01, 22360, 15.75, 0, 609.90, 2, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'BQ' AND statutory_code = 'IB';

-- Band 3: $22,361 - $44,721 = 25.20%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '25.20% Band', 22360.01, 44721, 25.20, 0, 2210.42, 3, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'BQ' AND statutory_code = 'IB';

-- Band 4: $44,722+ = 35.40%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '35.40% Band', 44721.01, 999999999, 35.40, 0, 7845.39, 4, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'BQ' AND statutory_code = 'IB';

-- 3. Add Bonaire Statutory Contribution Tax Relief Rules
INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, description, legal_reference, effective_from, is_active)
VALUES
  ('BQ', 'AOV', 'AOV Pension Contribution', 100, true, false, 'Employee AOV contributions are fully deductible from taxable income', 'Wet Inkomstenbelasting BES', '2024-01-01', true),
  ('BQ', 'AWW', 'AWW Contribution', 100, true, false, 'Employee AWW contributions are fully deductible', 'Wet Inkomstenbelasting BES', '2024-01-01', true),
  ('BQ', 'ZV', 'ZV Health Contribution', 100, true, false, 'Employee health insurance contributions are fully deductible', 'Wet Inkomstenbelasting BES', '2024-01-01', true);

-- 4. Add Bonaire Tax Relief Schemes (Tax Credits)
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, description, legal_reference, effective_from, is_active)
VALUES
  -- General Tax Credit (Algemene heffingskorting)
  ('BQ', 'GENERAL_CREDIT', 'Algemene Heffingskorting', 'personal_relief', 'credit', 'fixed_amount', 2477, 2477, false, 'General tax credit for all taxpayers', 'Wet Inkomstenbelasting BES', '2024-01-01', true),
  -- Employment Tax Credit (Arbeidskorting)
  ('BQ', 'EMPLOYMENT_CREDIT', 'Arbeidskorting', 'personal_relief', 'credit', 'tiered', NULL, 4525, false, 'Tax credit for employed individuals (income-dependent)', 'Wet Inkomstenbelasting BES', '2024-01-01', true),
  -- Single Parent Credit
  ('BQ', 'SINGLE_PARENT_CREDIT', 'Alleenstaande Ouderkorting', 'personal_relief', 'credit', 'fixed_amount', 1250, 1250, true, 'Additional credit for single parents with dependent children', 'Wet Inkomstenbelasting BES', '2024-01-01', true),
  -- Elderly Credit (65+)
  ('BQ', 'ELDERLY_CREDIT', 'Ouderenkorting', 'personal_relief', 'credit', 'fixed_amount', 1500, 1500, false, 'Additional credit for taxpayers aged 65 and older', 'Wet Inkomstenbelasting BES', '2024-01-01', true);

-- 5. Add Bonaire Country Tax Settings
INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, refund_display_type, refund_calculation_frequency, description, effective_from, is_active)
VALUES ('BQ', 'cumulative', true, 'automatic', 'reduced_tax', 'monthly', 'Bonaire (Caribbean Netherlands/BES) uses cumulative tax calculation. Currency: USD since 2011. Tax year is calendar year. Vacation allowance 8%. Special municipality of the Netherlands. Total employer burden ~18.3%.', '2024-01-01', true)
ON CONFLICT (country) DO UPDATE SET
  tax_calculation_method = EXCLUDED.tax_calculation_method,
  allow_mid_year_refunds = EXCLUDED.allow_mid_year_refunds,
  refund_method = EXCLUDED.refund_method,
  refund_display_type = EXCLUDED.refund_display_type,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
