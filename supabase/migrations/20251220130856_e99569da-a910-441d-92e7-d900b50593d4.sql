
-- =====================================================
-- CURAÇAO PAYROLL CONFIGURATION
-- =====================================================

-- 1. Add Curaçao Statutory Deduction Types
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, description, start_date, is_active)
VALUES
  -- AOV Old Age Pension
  ('CW', 'AOV', 'AOV Ouderdomspensioen', 'social_security', 'Algemene Ouderdomsverzekering - Old age pension insurance', '2024-01-01', true),
  -- AWW Widows/Orphans
  ('CW', 'AWW', 'AWW Weduwen/Wezen', 'social_security', 'Algemene Weduwen- en Wezenverzekering - Widows and orphans insurance', '2024-01-01', true),
  -- AVBZ Care Insurance (Employee only)
  ('CW', 'AVBZ', 'AVBZ Zorgverzekering', 'social_security', 'Algemene Verzekering Bijzondere Ziektekosten - Long-term care insurance', '2024-01-01', true),
  -- BVZ Basic Health Insurance
  ('CW', 'BVZ', 'BVZ Basisverzekering', 'social_security', 'Basisverzekering Ziektekosten - Basic health insurance', '2024-01-01', true),
  -- Cessantia Severance Fund
  ('CW', 'CESSANTIA', 'Cessantia', 'social_security', 'Cessantia - Severance and unemployment fund', '2024-01-01', true),
  -- ZV Sickness Insurance (Employer only)
  ('CW', 'ZV', 'ZV Ziekteverzekering', 'employer_tax', 'Ziekteverzekering - Employer sick pay coverage', '2024-01-01', true),
  -- OV Accident Insurance (Employer only)
  ('CW', 'OV', 'Ongevallenverzekering', 'employer_tax', 'Accident insurance (rate varies by industry)', '2024-01-01', true),
  -- Income Tax
  ('CW', 'IB', 'Inkomstenbelasting', 'income_tax', 'Curaçao progressive income tax', '2024-01-01', true)
ON CONFLICT (country, statutory_code) DO UPDATE SET
  statutory_name = EXCLUDED.statutory_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. Add Curaçao Statutory Rate Bands
-- AOV: Employee 6.5%, Employer 6.5% (capped at ANG 100,000/year)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, annual_max_employee, annual_max_employer, start_date, is_active)
SELECT id, 'Standard Rate', 0, 100000, 6.5, 6.5, 6500, 6500, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CW' AND statutory_code = 'AOV';

-- AWW: Employee 0.5%, Employer 0.5%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 100000, 0.5, 0.5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CW' AND statutory_code = 'AWW';

-- AVBZ: Employee 2% only (no employer contribution)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 2.0, 0, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CW' AND statutory_code = 'AVBZ';

-- BVZ: Employee 3.6%, Employer 10.2%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 3.6, 10.2, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CW' AND statutory_code = 'BVZ';

-- Cessantia: Employee 0.39%, Employer 0.78%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0.39, 0.78, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CW' AND statutory_code = 'CESSANTIA';

-- ZV Sickness: Employer 2.35% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 2.35, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CW' AND statutory_code = 'ZV';

-- OV Accident: Employer ~1% (varies by industry)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active, notes)
SELECT id, 'Average Rate', 0, 999999999, 0, 1.0, '2024-01-01', true, 'Rate varies by industry risk class. Configure per company.'
FROM public.statutory_deduction_types WHERE country = 'CW' AND statutory_code = 'OV';

-- IB Income Tax Brackets (Annual amounts in ANG)
-- Band 1: ANG 0 - 34,889 = 9.75%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '9.75% Band', 0, 34889, 9.75, 0, 1, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CW' AND statutory_code = 'IB';

-- Band 2: ANG 34,890 - 46,519 = 18.00%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '18.00% Band', 34889.01, 46519, 18.00, 0, 3401.68, 2, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CW' AND statutory_code = 'IB';

-- Band 3: ANG 46,520 - 69,778 = 25.50%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '25.50% Band', 46519.01, 69778, 25.50, 0, 5495.08, 3, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CW' AND statutory_code = 'IB';

-- Band 4: ANG 69,779 - 116,296 = 31.50%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '31.50% Band', 69778.01, 116296, 31.50, 0, 11426.12, 4, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CW' AND statutory_code = 'IB';

-- Band 5: ANG 116,297+ = 46.50%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '46.50% Band', 116296.01, 999999999, 46.50, 0, 26079.29, 5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CW' AND statutory_code = 'IB';

-- 3. Add Curaçao Statutory Contribution Tax Relief Rules
INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, description, legal_reference, effective_from, is_active)
VALUES
  ('CW', 'AOV', 'AOV Pension Contribution', 100, true, false, 'Employee AOV contributions are fully deductible from taxable income', 'Landsverordening Inkomstenbelasting', '2024-01-01', true),
  ('CW', 'AWW', 'AWW Contribution', 100, true, false, 'Employee AWW contributions are fully deductible', 'Landsverordening Inkomstenbelasting', '2024-01-01', true),
  ('CW', 'AVBZ', 'AVBZ Care Contribution', 100, true, false, 'Employee AVBZ contributions are fully deductible', 'Landsverordening Inkomstenbelasting', '2024-01-01', true),
  ('CW', 'BVZ', 'BVZ Health Contribution', 100, true, false, 'Employee BVZ contributions are fully deductible', 'Landsverordening Inkomstenbelasting', '2024-01-01', true);

-- 4. Add Curaçao Tax Relief Schemes
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, description, legal_reference, effective_from, is_active)
VALUES
  -- Personal Allowance (Belastingvrije som)
  ('CW', 'PERSONAL_ALLOWANCE', 'Belastingvrije Som', 'personal_relief', 'deduction', 'fixed_amount', 24500, 24500, false, 'Annual tax-free personal allowance', 'LIB Art. 16', '2024-01-01', true),
  -- Spouse Allowance
  ('CW', 'SPOUSE_ALLOWANCE', 'Partner Aftrek', 'personal_relief', 'deduction', 'fixed_amount', 5500, 5500, true, 'Annual allowance for non-working spouse', 'LIB', '2024-01-01', true),
  -- Child Allowance
  ('CW', 'CHILD_ALLOWANCE', 'Kinderaftrek', 'personal_relief', 'deduction', 'fixed_amount', 2500, 2500, true, 'Annual allowance per dependent child (under 27)', 'LIB', '2024-01-01', true),
  -- Mortgage Interest
  ('CW', 'MORTGAGE_INTEREST', 'Hypotheekrente Aftrek', 'housing_education', 'deduction', 'fixed_amount', 25000, 25000, true, 'Mortgage interest deduction on primary residence', 'LIB', '2024-01-01', true),
  -- Life Insurance Premiums
  ('CW', 'LIFE_INSURANCE', 'Levensverzekering Premie', 'savings_investment', 'deduction', 'fixed_amount', 5000, 5000, true, 'Life insurance premium deduction', 'LIB', '2024-01-01', true);

-- 5. Add Curaçao Country Tax Settings
INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, refund_display_type, refund_calculation_frequency, description, effective_from, is_active)
VALUES ('CW', 'cumulative', true, 'automatic', 'reduced_tax', 'monthly', 'Curaçao uses cumulative tax calculation. Currency: ANG (pegged to USD at 1.79). Tax year is calendar year. Vacation allowance 8.33%. Constituent country of Kingdom of the Netherlands. Total employer burden ~22%.', '2024-01-01', true)
ON CONFLICT (country) DO UPDATE SET
  tax_calculation_method = EXCLUDED.tax_calculation_method,
  allow_mid_year_refunds = EXCLUDED.allow_mid_year_refunds,
  refund_method = EXCLUDED.refund_method,
  refund_display_type = EXCLUDED.refund_display_type,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
