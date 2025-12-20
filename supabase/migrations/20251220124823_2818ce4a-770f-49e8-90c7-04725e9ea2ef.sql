
-- =====================================================
-- COSTA RICA PAYROLL CONFIGURATION
-- =====================================================

-- 1. Add Costa Rica Statutory Deduction Types
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, description, start_date, is_active)
VALUES
  -- CCSS Health (Seguro de Enfermedad y Maternidad)
  ('CR', 'CCSS_SEM', 'CCSS Salud', 'social_security', 'Caja Costarricense de Seguro Social - Health and Maternity Insurance', '2024-01-01', true),
  -- CCSS Pension (Invalidez, Vejez y Muerte)
  ('CR', 'CCSS_IVM', 'CCSS Pensión IVM', 'social_security', 'Caja Costarricense de Seguro Social - Disability, Old Age and Death Pension', '2024-01-01', true),
  -- Banco Popular
  ('CR', 'BPDC', 'Banco Popular', 'social_security', 'Banco Popular y de Desarrollo Comunal - Worker savings contribution', '2024-01-01', true),
  -- IMAS - Employer only
  ('CR', 'IMAS', 'IMAS', 'employer_tax', 'Instituto Mixto de Ayuda Social - Social assistance fund', '2024-01-01', true),
  -- INA - Employer only
  ('CR', 'INA', 'INA', 'employer_tax', 'Instituto Nacional de Aprendizaje - Training institute', '2024-01-01', true),
  -- FODESAF - Employer only
  ('CR', 'FODESAF', 'FODESAF', 'employer_tax', 'Fondo de Desarrollo Social y Asignaciones Familiares', '2024-01-01', true),
  -- Cesantía (Severance Fund) - Employer only
  ('CR', 'CESANTIA', 'Fondo de Cesantía', 'employer_tax', 'Mandatory severance reserve fund (3% employer contribution)', '2024-01-01', true),
  -- Income Tax
  ('CR', 'ISR', 'Impuesto Sobre la Renta', 'income_tax', 'Costa Rica progressive income tax', '2024-01-01', true)
ON CONFLICT (country, statutory_code) DO UPDATE SET
  statutory_name = EXCLUDED.statutory_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. Add Costa Rica Statutory Rate Bands
-- CCSS Health (SEM): Employee 5.5%, Employer 9.25%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 5.5, 9.25, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CR' AND statutory_code = 'CCSS_SEM';

-- CCSS Pension (IVM): Employee 4.17%, Employer 5.42%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 4.17, 5.42, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CR' AND statutory_code = 'CCSS_IVM';

-- Banco Popular: Employee 1%, Employer 0.25%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 1.0, 0.25, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CR' AND statutory_code = 'BPDC';

-- IMAS: Employer 0.5% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 0.5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CR' AND statutory_code = 'IMAS';

-- INA: Employer 1.5% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 1.5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CR' AND statutory_code = 'INA';

-- FODESAF: Employer 5% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 5.0, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CR' AND statutory_code = 'FODESAF';

-- Cesantía: Employer 3% only
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, start_date, is_active)
SELECT id, 'Standard Rate', 0, 999999999, 0, 3.0, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CR' AND statutory_code = 'CESANTIA';

-- ISR Income Tax Brackets (Monthly amounts in Colones - 2024)
-- Band 1: ₡0 - ₡941,000 = 0%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, 'Tax Free Band', 0, 941000, 0, 0, 1, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CR' AND statutory_code = 'ISR';

-- Band 2: ₡941,001 - ₡1,381,000 = 10%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '10% Band', 941000.01, 1381000, 10.0, 0, 2, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CR' AND statutory_code = 'ISR';

-- Band 3: ₡1,381,001 - ₡2,423,000 = 15%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '15% Band', 1381000.01, 2423000, 15.0, 0, 3, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CR' AND statutory_code = 'ISR';

-- Band 4: ₡2,423,001 - ₡4,845,000 = 20%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '20% Band', 2423000.01, 4845000, 20.0, 0, 4, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CR' AND statutory_code = 'ISR';

-- Band 5: ₡4,845,001+ = 25%
INSERT INTO public.statutory_rate_bands (statutory_type_id, band_name, min_amount, max_amount, employee_rate, employer_rate, display_order, start_date, is_active)
SELECT id, '25% Band', 4845000.01, 999999999, 25.0, 0, 5, '2024-01-01', true
FROM public.statutory_deduction_types WHERE country = 'CR' AND statutory_code = 'ISR';

-- 3. Add Costa Rica Statutory Contribution Tax Relief Rules
INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, description, legal_reference, effective_from, is_active)
VALUES
  ('CR', 'CCSS_SEM', 'CCSS Health Contribution', 100, true, false, 'Employee CCSS health contributions are fully deductible from taxable income', 'Ley del Impuesto sobre la Renta', '2024-01-01', true),
  ('CR', 'CCSS_IVM', 'CCSS Pension Contribution', 100, true, false, 'Employee CCSS pension contributions are fully deductible from taxable income', 'Ley del Impuesto sobre la Renta', '2024-01-01', true),
  ('CR', 'BPDC', 'Banco Popular Contribution', 100, true, false, 'Employee Banco Popular contributions are fully deductible from taxable income', 'Ley Orgánica del Banco Popular', '2024-01-01', true);

-- 4. Add Costa Rica Tax Relief Schemes
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, description, legal_reference, effective_from, is_active)
VALUES
  -- Personal Tax Credit
  ('CR', 'PERSONAL_CREDIT', 'Personal Tax Credit', 'personal_relief', 'credit', 'fixed_amount', 18960, 18960, false, 'Monthly personal tax credit applied against tax liability', 'Ley del ISR Art. 15', '2024-01-01', true),
  -- Spouse Credit
  ('CR', 'SPOUSE_CREDIT', 'Spouse Tax Credit', 'personal_relief', 'credit', 'fixed_amount', 2380, 2380, true, 'Monthly credit for non-working spouse', 'Ley del ISR Art. 15', '2024-01-01', true),
  -- Dependent Child Credit
  ('CR', 'CHILD_CREDIT', 'Dependent Child Credit', 'personal_relief', 'credit', 'fixed_amount', 1580, 1580, true, 'Monthly credit per dependent child', 'Ley del ISR Art. 15', '2024-01-01', true),
  -- Voluntary Pension Contribution (up to 10% of salary)
  ('CR', 'VOLUNTARY_PENSION', 'Voluntary Pension Contribution', 'savings_investment', 'deduction', 'percentage_of_income', 10, NULL, true, 'Voluntary pension contributions up to 10% of gross salary are tax-deductible', 'Ley de Protección al Trabajador', '2024-01-01', true);

-- 5. Add Costa Rica Country Tax Settings (unique Oct-Sep tax year)
INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, refund_display_type, refund_calculation_frequency, description, effective_from, is_active)
VALUES ('CR', 'cumulative', true, 'automatic', 'reduced_tax', 'monthly', 'Costa Rica uses cumulative tax calculation. UNIQUE: Tax year runs October 1 to September 30. Aguinaldo (13th month) paid in December is taxable. Total employer burden ~26.42%.', '2024-01-01', true)
ON CONFLICT (country) DO UPDATE SET
  tax_calculation_method = EXCLUDED.tax_calculation_method,
  allow_mid_year_refunds = EXCLUDED.allow_mid_year_refunds,
  refund_method = EXCLUDED.refund_method,
  refund_display_type = EXCLUDED.refund_display_type,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
