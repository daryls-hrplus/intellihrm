
-- =====================================================
-- MEXICO PAYROLL CONFIGURATION
-- =====================================================

-- 1. Add Mexico Statutory Deduction Types
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, description, start_date, is_active)
VALUES
  -- IMSS Employee Contributions (combined)
  ('MX', 'IMSS_EE', 'IMSS Trabajador', 'social_security', 'Instituto Mexicano del Seguro Social - Employee contribution (Enfermedades, Invalidez, Cesantía)', '2024-01-01', true),
  -- IMSS Employer Contributions
  ('MX', 'IMSS_ER', 'IMSS Patrón', 'employer_tax', 'Instituto Mexicano del Seguro Social - Employer contributions (all components)', '2024-01-01', true),
  -- Retirement (SAR/RCV)
  ('MX', 'SAR_RCV', 'SAR/RCV Retiro', 'social_security', 'Sistema de Ahorro para el Retiro - Retirement savings', '2024-01-01', true),
  -- INFONAVIT Housing (Employer only)
  ('MX', 'INFONAVIT', 'INFONAVIT', 'employer_tax', 'Instituto del Fondo Nacional de la Vivienda para los Trabajadores - Housing fund', '2024-01-01', true),
  -- State Payroll Tax (Employer only - varies by state)
  ('MX', 'ISN', 'Impuesto Sobre Nómina', 'employer_tax', 'State payroll tax (rate varies by state 1-3%)', '2024-01-01', true),
  -- Income Tax
  ('MX', 'ISR', 'Impuesto Sobre la Renta', 'income_tax', 'Mexico progressive income tax with employment subsidy', '2024-01-01', true)
ON CONFLICT (country, statutory_code) DO UPDATE SET
  statutory_name = EXCLUDED.statutory_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. Add Mexico Statutory Rate Bands
-- IMSS Employee: ~2.775% total (0.625% Enf/Mat + 0.625% Inv/Vida + 1.125% Cesantía + 0.4% Retiro = 2.775%)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active, notes)
SELECT id, 'Standard Rate', 0, 999999999, 2.775, 0, '2024-01-01', true, 'Combined: Enf/Mat 0.625% + Inv/Vida 0.625% + Cesantía 1.125% + Retiro 0.4%'
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'IMSS_EE';

-- IMSS Employer: Base ~13.9% (varies by risk class I-V: 0.5% to 7.5% additional)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active, notes)
SELECT id, 'Risk Class I (Low)', 0, 999999999, 0, 13.9, '2024-01-01', true, 'Includes: Enf/Mat, Inv/Vida, Prest/Dinero, Guarderías. Add risk premium 0.5-7.5% based on industry.'
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'IMSS_ER';

-- SAR/RCV: Employee 1.125%, Employer 5.150%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 1.125, 5.150, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'SAR_RCV';

-- INFONAVIT: Employer 5% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 5.0, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'INFONAVIT';

-- State Payroll Tax: Employer only (using 3% as common rate, configurable per state)
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active, notes)
SELECT id, 'Default Rate', 0, 999999999, 0, 3.0, '2024-01-01', true, 'Rate varies by state: CDMX 3%, Jalisco 2%, NL 3%, etc. Configure per company location.'
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'ISN';

-- ISR Income Tax Brackets (Monthly amounts in MXN - 2024)
-- Band 1: $0 - $746.04 = 1.92%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '1.92% Band', 0, 746.04, 1.92, 0, 0, 1, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'ISR';

-- Band 2: $746.05 - $6,332.05 = 6.40% + $14.32
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '6.40% Band', 746.05, 6332.05, 6.40, 0, 14.32, 2, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'ISR';

-- Band 3: $6,332.06 - $11,128.01 = 10.88% + $371.83
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '10.88% Band', 6332.06, 11128.01, 10.88, 0, 371.83, 3, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'ISR';

-- Band 4: $11,128.02 - $12,935.82 = 16.00% + $893.63
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '16.00% Band', 11128.02, 12935.82, 16.00, 0, 893.63, 4, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'ISR';

-- Band 5: $12,935.83 - $15,487.71 = 17.92% + $1,182.88
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '17.92% Band', 12935.83, 15487.71, 17.92, 0, 1182.88, 5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'ISR';

-- Band 6: $15,487.72 - $31,236.49 = 21.36% + $1,640.18
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '21.36% Band', 15487.72, 31236.49, 21.36, 0, 1640.18, 6, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'ISR';

-- Band 7: $31,236.50 - $62,500.42 = 23.52% + $5,004.12
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '23.52% Band', 31236.50, 62500.42, 23.52, 0, 5004.12, 7, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'ISR';

-- Band 8: $62,500.43 - $83,333.33 = 30.00% + $12,352.14
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '30.00% Band', 62500.43, 83333.33, 30.00, 0, 12352.14, 8, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'ISR';

-- Band 9: $83,333.34 - $250,000.00 = 32.00% + $18,602.01
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '32.00% Band', 83333.34, 250000.00, 32.00, 0, 18602.01, 9, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'ISR';

-- Band 10: $250,000.01+ = 35.00% + $71,935.35
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, fixed_amount, display_order, start_date, is_active)
SELECT id, '35.00% Band', 250000.01, 999999999, 35.00, 0, 71935.35, 10, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'MX' AND statutory_code = 'ISR';

-- 3. Add Mexico Statutory Contribution Tax Relief Rules
INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, description, legal_reference, effective_from, is_active)
VALUES
  ('MX', 'IMSS_EE', 'IMSS Employee Contribution', 100, true, false, 'Employee IMSS contributions are deductible from taxable income', 'Ley del ISR Art. 151', '2024-01-01', true),
  ('MX', 'SAR_RCV', 'Retirement Contribution', 100, true, false, 'Employee retirement contributions are deductible from taxable income', 'Ley del ISR Art. 151', '2024-01-01', true);

-- 4. Add Mexico Tax Relief Schemes
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, description, legal_reference, effective_from, is_active)
VALUES
  -- Employment Subsidy (Subsidio al Empleo) - for low earners
  ('MX', 'SUBSIDIO_EMPLEO', 'Subsidio al Empleo', 'personal_relief', 'credit', 'tiered', NULL, NULL, false, 'Employment subsidy for low-income workers - reduces or eliminates tax liability', 'Ley del ISR Art. 96', '2024-01-01', true),
  -- Medical Expenses
  ('MX', 'MEDICAL', 'Gastos Médicos', 'personal_relief', 'deduction', 'fixed_amount', NULL, NULL, true, 'Medical, dental, and hospital expenses for taxpayer and dependents', 'Ley del ISR Art. 151-I', '2024-01-01', true),
  -- Mortgage Interest
  ('MX', 'MORTGAGE', 'Intereses Hipotecarios', 'housing_education', 'deduction', 'fixed_amount', NULL, NULL, true, 'Mortgage interest on primary residence (limited to value of 750,000 UDIs)', 'Ley del ISR Art. 151-IV', '2024-01-01', true),
  -- Voluntary Retirement Contributions (Afore)
  ('MX', 'AFORE_VOLUNTARIO', 'Aportaciones Voluntarias Afore', 'savings_investment', 'deduction', 'percentage_of_income', 10, NULL, true, 'Voluntary retirement contributions up to 10% of taxable income or 5 UMA annual', 'Ley del ISR Art. 151-V', '2024-01-01', true),
  -- Educational Expenses (Colegiaturas)
  ('MX', 'COLEGIATURAS', 'Colegiaturas', 'housing_education', 'deduction', 'tiered', NULL, NULL, true, 'School tuition (preschool to high school) with annual limits per education level', 'Decreto Presidencial 2011', '2024-01-01', true),
  -- Donations
  ('MX', 'DONATIVOS', 'Donativos', 'personal_relief', 'deduction', 'percentage_of_income', 7, NULL, true, 'Donations to authorized nonprofits up to 7% of prior year taxable income', 'Ley del ISR Art. 151-III', '2024-01-01', true);

-- 5. Add Mexico Country Tax Settings
INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, refund_display_type, refund_calculation_frequency, description, effective_from, is_active)
VALUES ('MX', 'cumulative', true, 'automatic', 'reduced_tax', 'monthly', 'Mexico uses cumulative tax calculation. Tax year is calendar year. Includes Subsidio al Empleo for low earners. Aguinaldo (min 15 days) by Dec 20, Vacation Premium 25%, PTU 10% profit sharing. Total employer burden ~27-35% depending on risk class and state.', '2024-01-01', true)
ON CONFLICT (country) DO UPDATE SET
  tax_calculation_method = EXCLUDED.tax_calculation_method,
  allow_mid_year_refunds = EXCLUDED.allow_mid_year_refunds,
  refund_method = EXCLUDED.refund_method,
  refund_display_type = EXCLUDED.refund_display_type,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
