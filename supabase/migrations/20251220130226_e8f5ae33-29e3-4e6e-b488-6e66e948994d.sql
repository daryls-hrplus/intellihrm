
-- =====================================================
-- ARUBA PAYROLL CONFIGURATION
-- =====================================================

-- 1. Add Aruba Statutory Deduction Types
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, description, start_date, is_active)
VALUES
  -- AOV/AWW Pension
  ('AW', 'AOV_AWW', 'AOV/AWW Pensioen', 'social_security', 'Algemene Ouderdomsverzekering/Algemene Weduwen- en Wezenverzekering - Old age, widow and orphan pension', '2024-01-01', true),
  -- AZV Health Insurance
  ('AW', 'AZV', 'AZV Ziekteverzekering', 'social_security', 'Algemene Zorgverzekering - Basic health insurance', '2024-01-01', true),
  -- SVB Cessantia (Severance/Unemployment)
  ('AW', 'CESSANTIA', 'SVB Cessantia', 'social_security', 'Sociale Verzekeringsbank Cessantia - Severance and unemployment fund', '2024-01-01', true),
  -- BAZV (Employer only)
  ('AW', 'BAZV', 'BAZV', 'employer_tax', 'Bijzondere Algemene Zorgverzekering - Catastrophic health coverage', '2024-01-01', true),
  -- OZV (Employer only)
  ('AW', 'OZV', 'OZV', 'employer_tax', 'Ongevallenverzekering Zorgverzekering - Additional health coverage', '2024-01-01', true),
  -- Accident Insurance (Employer only)
  ('AW', 'OV', 'Ongevallenverzekering', 'employer_tax', 'Accident insurance (rate varies by industry)', '2024-01-01', true),
  -- Income Tax (Inkomstenbelasting)
  ('AW', 'IB', 'Inkomstenbelasting', 'income_tax', 'Aruba progressive income tax', '2024-01-01', true)
ON CONFLICT (country, statutory_code) DO UPDATE SET
  statutory_name = EXCLUDED.statutory_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. Add Aruba Statutory Rate Bands
-- AOV/AWW: Employee 4%, Employer 9.5% (capped at AWG 85,000/year)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, annual_max_employee, annual_max_employer, start_date, is_active)
SELECT id, 'Standard Rate', 0, 85000, 4.0, 9.5, 3400, 8075, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'AW' AND statutory_code = 'AOV_AWW';

-- AZV: Employee 2.6%, Employer 8.9% (capped at AWG 85,000/year)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, annual_max_employee, annual_max_employer, start_date, is_active)
SELECT id, 'Standard Rate', 0, 85000, 2.6, 8.9, 2210, 7565, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'AW' AND statutory_code = 'AZV';

-- Cessantia: Employee 1%, Employer 1%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 1.0, 1.0, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'AW' AND statutory_code = 'CESSANTIA';

-- BAZV: Employer 2% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 2.0, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'AW' AND statutory_code = 'BAZV';

-- OZV: Employer 1.9% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 1.9, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'AW' AND statutory_code = 'OZV';

-- Accident Insurance: Employer ~1.5% (average, varies by industry)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active, notes)
SELECT id, 'Average Rate', 0, 999999999, 0, 1.5, '2024-01-01', true, 'Rate varies by industry risk class. Configure per company.'
FROM public.statutory_deduction_types WHERE country = 'AW' AND statutory_code = 'OV';

-- IB Income Tax Brackets (Annual amounts in AWG)
-- Band 1: AWG 0 - 34,930 = 7%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '7% Band', 0, 34930, 7.0, 0, 1, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'AW' AND statutory_code = 'IB';

-- Band 2: AWG 34,931 - 65,904 = 20%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '20% Band', 34930.01, 65904, 20.0, 0, 2445.10, 2, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'AW' AND statutory_code = 'IB';

-- Band 3: AWG 65,905 - 147,454 = 35%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '35% Band', 65904.01, 147454, 35.0, 0, 8639.90, 3, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'AW' AND statutory_code = 'IB';

-- Band 4: AWG 147,455+ = 59%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '59% Band', 147454.01, 999999999, 59.0, 0, 37182.40, 4, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'AW' AND statutory_code = 'IB';

-- 3. Add Aruba Statutory Contribution Tax Relief Rules
INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, description, legal_reference, effective_from, is_active)
VALUES
  ('AW', 'AOV_AWW', 'AOV/AWW Pension Contribution', 100, true, false, 'Employee pension contributions are fully deductible from taxable income', 'Landsverordening Inkomstenbelasting', '2024-01-01', true),
  ('AW', 'AZV', 'AZV Health Contribution', 100, true, false, 'Employee health insurance contributions are fully deductible', 'Landsverordening Inkomstenbelasting', '2024-01-01', true),
  ('AW', 'CESSANTIA', 'Cessantia Contribution', 100, true, false, 'Employee cessantia contributions are fully deductible', 'Landsverordening Inkomstenbelasting', '2024-01-01', true);

-- 4. Add Aruba Tax Relief Schemes
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, description, legal_reference, effective_from, is_active)
VALUES
  -- Personal Allowance (Belastingvrije som)
  ('AW', 'PERSONAL_ALLOWANCE', 'Belastingvrije Som', 'personal_relief', 'deduction', 'fixed_amount', 28861, 28861, false, 'Annual tax-free personal allowance', 'Landsverordening IB Art. 16', '2024-01-01', true),
  -- Spouse/Partner Allowance
  ('AW', 'PARTNER_ALLOWANCE', 'Partner Aftrek', 'personal_relief', 'deduction', 'fixed_amount', 5000, 5000, true, 'Annual allowance for non-working spouse/partner', 'Landsverordening IB', '2024-01-01', true),
  -- Child Allowance
  ('AW', 'CHILD_ALLOWANCE', 'Kinderaftrek', 'personal_relief', 'deduction', 'fixed_amount', 2500, 2500, true, 'Annual allowance per dependent child', 'Landsverordening IB', '2024-01-01', true),
  -- Mortgage Interest
  ('AW', 'MORTGAGE_INTEREST', 'Hypotheekrente Aftrek', 'housing_education', 'deduction', 'fixed_amount', 25000, 25000, true, 'Mortgage interest deduction on primary residence', 'Landsverordening IB', '2024-01-01', true),
  -- Additional Health Insurance Premium
  ('AW', 'HEALTH_PREMIUM', 'Ziektekostenpremie', 'personal_relief', 'deduction', 'fixed_amount', 5000, 5000, true, 'Additional private health insurance premiums', 'Landsverordening IB', '2024-01-01', true);

-- 5. Add Aruba Country Tax Settings
INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, refund_display_type, refund_calculation_frequency, description, effective_from, is_active)
VALUES ('AW', 'cumulative', true, 'automatic', 'reduced_tax', 'monthly', 'Aruba uses cumulative tax calculation. Currency: AWG (pegged to USD at 1.79). Tax year is calendar year. Vacation allowance typically 8.33% of annual salary. Total employer burden ~25%. Part of Kingdom of the Netherlands.', '2024-01-01', true)
ON CONFLICT (country) DO UPDATE SET
  tax_calculation_method = EXCLUDED.tax_calculation_method,
  allow_mid_year_refunds = EXCLUDED.allow_mid_year_refunds,
  refund_method = EXCLUDED.refund_method,
  refund_display_type = EXCLUDED.refund_display_type,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
