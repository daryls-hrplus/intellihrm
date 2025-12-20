-- =============================================
-- COLOMBIA PAYROLL CONFIGURATION
-- Currency: COP (Colombian Peso)
-- Tax Year: Calendar Year (January - December)
-- =============================================

-- 1. STATUTORY DEDUCTION TYPES
-- =============================================

-- Pensión (Pension)
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, start_date, description)
SELECT 'CO', 'PENSION', 'Pensión', 'social_security', '2024-01-01', 'Mandatory pension contribution - 16% total (4% employee, 12% employer)'
WHERE NOT EXISTS (SELECT 1 FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'PENSION');

-- Salud (Health)
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, start_date, description)
SELECT 'CO', 'SALUD', 'Salud', 'health', '2024-01-01', 'Mandatory health insurance - 12.5% total (4% employee, 8.5% employer)'
WHERE NOT EXISTS (SELECT 1 FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'SALUD');

-- ARL (Workplace Risk Insurance) - Employer only
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, start_date, description)
SELECT 'CO', 'ARL', 'Administradora de Riesgos Laborales', 'accident', '2024-01-01', 'Employer workplace risk insurance - rate varies by risk class (0.522% to 6.96%)'
WHERE NOT EXISTS (SELECT 1 FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'ARL');

-- Parafiscales (SENA + ICBF + CCF) - Employer only
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, start_date, description)
SELECT 'CO', 'PARAFISCALES', 'Aportes Parafiscales', 'social_security', '2024-01-01', 'Employer social contributions: SENA 2% + ICBF 3% + Caja Compensación 4% = 9%'
WHERE NOT EXISTS (SELECT 1 FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'PARAFISCALES');

-- FSP (Fondo de Solidaridad Pensional) - Employee only for high earners
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, start_date, description)
SELECT 'CO', 'FSP', 'Fondo de Solidaridad Pensional', 'social_security', '2024-01-01', 'Solidarity fund for income > 4 SMLMV (1-2% employee contribution)'
WHERE NOT EXISTS (SELECT 1 FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'FSP');

-- Cesantías (Severance) - Employer provision
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, start_date, description)
SELECT 'CO', 'CESANTIAS', 'Cesantías', 'severance', '2024-01-01', 'Employer severance provision - 8.33% of salary, deposited annually to fund'
WHERE NOT EXISTS (SELECT 1 FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'CESANTIAS');

-- Intereses Cesantías - Employer provision
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, start_date, description)
SELECT 'CO', 'INT_CESANTIAS', 'Intereses sobre Cesantías', 'severance', '2024-01-01', 'Interest on severance - 12% annually on cesantías balance, paid to employee'
WHERE NOT EXISTS (SELECT 1 FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'INT_CESANTIAS');

-- Prima de Servicios - Employer provision
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, start_date, description)
SELECT 'CO', 'PRIMA', 'Prima de Servicios', 'bonus', '2024-01-01', 'Service bonus - 8.33% of salary, paid in June and December'
WHERE NOT EXISTS (SELECT 1 FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'PRIMA');

-- Vacaciones - Employer provision
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, start_date, description)
SELECT 'CO', 'VACACIONES', 'Vacaciones', 'leave', '2024-01-01', 'Vacation provision - 4.17% of salary (15 working days per year)'
WHERE NOT EXISTS (SELECT 1 FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'VACACIONES');

-- Retención en la Fuente (Income Tax Withholding)
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, start_date, description)
SELECT 'CO', 'RETENCION', 'Retención en la Fuente', 'tax', '2024-01-01', 'Progressive income tax withholding based on UVT thresholds'
WHERE NOT EXISTS (SELECT 1 FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'RETENCION');

-- 2. STATUTORY RATE BANDS
-- =============================================

DO $$
DECLARE
  v_pension_id UUID;
  v_salud_id UUID;
  v_arl_id UUID;
  v_parafiscales_id UUID;
  v_fsp_id UUID;
  v_cesantias_id UUID;
  v_int_cesantias_id UUID;
  v_prima_id UUID;
  v_vacaciones_id UUID;
  v_retencion_id UUID;
  v_smlmv NUMERIC := 1300000; -- 2024 minimum wage
  v_uvt NUMERIC := 47065; -- 2024 UVT value
BEGIN
  SELECT id INTO v_pension_id FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'PENSION';
  SELECT id INTO v_salud_id FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'SALUD';
  SELECT id INTO v_arl_id FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'ARL';
  SELECT id INTO v_parafiscales_id FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'PARAFISCALES';
  SELECT id INTO v_fsp_id FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'FSP';
  SELECT id INTO v_cesantias_id FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'CESANTIAS';
  SELECT id INTO v_int_cesantias_id FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'INT_CESANTIAS';
  SELECT id INTO v_prima_id FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'PRIMA';
  SELECT id INTO v_vacaciones_id FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'VACACIONES';
  SELECT id INTO v_retencion_id FROM statutory_deduction_types WHERE country = 'CO' AND statutory_code = 'RETENCION';

  -- Pensión: 4% employee, 12% employer (cap 25 SMLMV)
  IF v_pension_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM statutory_rate_bands WHERE statutory_type_id = v_pension_id) THEN
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, notes)
    VALUES (v_pension_id, 1, 0, 32500000, 0.04, 0.12, true, '2024-01-01', 'Cap: 25 SMLMV (approx COP 32,500,000/month in 2024)');
  END IF;

  -- Salud: 4% employee, 8.5% employer
  IF v_salud_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM statutory_rate_bands WHERE statutory_type_id = v_salud_id) THEN
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date)
    VALUES (v_salud_id, 1, 0, NULL, 0.04, 0.085, true, '2024-01-01');
  END IF;

  -- ARL: Employer only, Class I (low risk) default 0.522%
  IF v_arl_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM statutory_rate_bands WHERE statutory_type_id = v_arl_id) THEN
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, band_name, notes)
    VALUES (v_arl_id, 1, 0, NULL, 0, 0.00522, true, '2024-01-01', 'Risk Class I', 'Low risk activities. Other classes: II=1.044%, III=2.436%, IV=4.350%, V=6.960%');
  END IF;

  -- Parafiscales: 9% employer only (SENA 2% + ICBF 3% + CCF 4%)
  IF v_parafiscales_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM statutory_rate_bands WHERE statutory_type_id = v_parafiscales_id) THEN
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, notes)
    VALUES (v_parafiscales_id, 1, 0, NULL, 0, 0.09, true, '2024-01-01', 'SENA 2% + ICBF 3% + Caja de Compensación 4%. Exemption applies for salaries < 10 SMLMV');
  END IF;

  -- FSP: 1% for income > 4 SMLMV, 2% for > 16 SMLMV
  IF v_fsp_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM statutory_rate_bands WHERE statutory_type_id = v_fsp_id) THEN
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, band_name)
    VALUES (v_fsp_id, 1, 0, 5200000, 0, 0, true, '2024-01-01', 'Below 4 SMLMV - No contribution');
    
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, band_name)
    VALUES (v_fsp_id, 2, 5200000.01, 20800000, 0.01, 0, true, '2024-01-01', '4-16 SMLMV - 1% contribution');
    
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, band_name)
    VALUES (v_fsp_id, 3, 20800000.01, NULL, 0.02, 0, true, '2024-01-01', 'Above 16 SMLMV - 2% contribution');
  END IF;

  -- Cesantías: 8.33% employer provision
  IF v_cesantias_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM statutory_rate_bands WHERE statutory_type_id = v_cesantias_id) THEN
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date)
    VALUES (v_cesantias_id, 1, 0, NULL, 0, 0.0833, true, '2024-01-01');
  END IF;

  -- Intereses Cesantías: 1% monthly (12% annual) on cesantías balance - employer pays to employee
  IF v_int_cesantias_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM statutory_rate_bands WHERE statutory_type_id = v_int_cesantias_id) THEN
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, notes)
    VALUES (v_int_cesantias_id, 1, 0, NULL, 0, 0.01, true, '2024-01-01', '12% annual on cesantías balance, calculated monthly');
  END IF;

  -- Prima: 8.33% employer provision
  IF v_prima_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM statutory_rate_bands WHERE statutory_type_id = v_prima_id) THEN
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, notes)
    VALUES (v_prima_id, 1, 0, NULL, 0, 0.0833, true, '2024-01-01', 'Paid in two installments: June and December');
  END IF;

  -- Vacaciones: 4.17% employer provision
  IF v_vacaciones_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM statutory_rate_bands WHERE statutory_type_id = v_vacaciones_id) THEN
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date)
    VALUES (v_vacaciones_id, 1, 0, NULL, 0, 0.0417, true, '2024-01-01');
  END IF;

  -- Retención en la Fuente: Progressive tax based on UVT (2024 UVT = 47,065)
  IF v_retencion_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM statutory_rate_bands WHERE statutory_type_id = v_retencion_id) THEN
    -- 0-95 UVT = 0%
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, band_name)
    VALUES (v_retencion_id, 1, 0, 4471175, 0, 0, true, '2024-01-01', '0-95 UVT (tax-free)');

    -- 95-150 UVT = 19%
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, band_name)
    VALUES (v_retencion_id, 2, 4471175.01, 7059750, 0.19, 0, true, '2024-01-01', '95-150 UVT');

    -- 150-360 UVT = 28%
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, band_name)
    VALUES (v_retencion_id, 3, 7059750.01, 16943400, 0.28, 0, true, '2024-01-01', '150-360 UVT');

    -- 360-640 UVT = 33%
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, band_name)
    VALUES (v_retencion_id, 4, 16943400.01, 30121600, 0.33, 0, true, '2024-01-01', '360-640 UVT');

    -- 640-945 UVT = 35%
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, band_name)
    VALUES (v_retencion_id, 5, 30121600.01, 44476425, 0.35, 0, true, '2024-01-01', '640-945 UVT');

    -- 945-2300 UVT = 37%
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, band_name)
    VALUES (v_retencion_id, 6, 44476425.01, 108249500, 0.37, 0, true, '2024-01-01', '945-2300 UVT');

    -- >2300 UVT = 39%
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, band_name)
    VALUES (v_retencion_id, 7, 108249500.01, NULL, 0.39, 0, true, '2024-01-01', 'Above 2300 UVT');
  END IF;

END $$;

-- 3. COUNTRY TAX SETTINGS
-- =============================================

INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, is_active, effective_from, description)
SELECT 'CO', 'cumulative', true, 'automatic', true, '2024-01-01', 
       'Colombia uses calendar tax year (Jan-Dec). Currency: COP. UVT-based progressive tax. Pension/health contributions partially deductible. 25% exempt income applies.'
WHERE NOT EXISTS (SELECT 1 FROM country_tax_settings WHERE country = 'CO');

-- 4. STATUTORY TAX RELIEF RULES
-- =============================================

INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, effective_from, is_active, description)
SELECT 'CO', 'PENSION', 'Pensión', 100, true, false, '2024-01-01', true, 'Mandatory pension contributions are fully deductible from taxable income'
WHERE NOT EXISTS (SELECT 1 FROM statutory_tax_relief_rules WHERE country = 'CO' AND statutory_type_code = 'PENSION');

INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, effective_from, is_active, description)
SELECT 'CO', 'SALUD', 'Salud', 100, true, false, '2024-01-01', true, 'Mandatory health contributions are deductible from taxable income'
WHERE NOT EXISTS (SELECT 1 FROM statutory_tax_relief_rules WHERE country = 'CO' AND statutory_type_code = 'SALUD');

INSERT INTO public.statutory_tax_relief_rules (country, statutory_type_code, statutory_type_name, relief_percentage, applies_to_employee_contribution, applies_to_employer_contribution, effective_from, is_active, description)
SELECT 'CO', 'FSP', 'Fondo de Solidaridad Pensional', 100, true, false, '2024-01-01', true, 'Solidarity fund contributions are deductible from taxable income'
WHERE NOT EXISTS (SELECT 1 FROM statutory_tax_relief_rules WHERE country = 'CO' AND statutory_type_code = 'FSP');

-- 5. TAX RELIEF SCHEMES
-- =============================================

-- Renta Exenta 25% (Exempt Income)
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_percentage, annual_cap, requires_proof, effective_from, is_active, description)
SELECT 'CO', 'RENTA_EXENTA_25', 'Renta Exenta 25%', 'personal_relief', 'exemption', 'percentage_of_income', 25, 112836000, false, '2024-01-01', true, '25% of salary is exempt from tax, capped at 2,400 UVT annually (approx COP 112,836,000 in 2024)'
WHERE NOT EXISTS (SELECT 1 FROM tax_relief_schemes WHERE country = 'CO' AND scheme_code = 'RENTA_EXENTA_25');

-- Deducción por Dependientes (Dependent Deduction)
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_percentage, annual_cap, requires_proof, effective_from, is_active, description)
SELECT 'CO', 'DEPENDIENTES', 'Deducción por Dependientes', 'personal_relief', 'deduction', 'percentage_of_income', 10, 16943400, true, '2024-01-01', true, '10% of gross income for dependents, capped at 32 UVT monthly (384 UVT annual)'
WHERE NOT EXISTS (SELECT 1 FROM tax_relief_schemes WHERE country = 'CO' AND scheme_code = 'DEPENDIENTES');

-- Intereses de Vivienda (Mortgage Interest)
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, effective_from, is_active, description)
SELECT 'CO', 'INTERES_VIVIENDA', 'Intereses de Vivienda', 'housing_education', 'deduction', 'fixed_amount', 0, 56418000, true, '2024-01-01', true, 'Mortgage interest deduction, capped at 1,200 UVT annually (approx COP 56,418,000 in 2024)'
WHERE NOT EXISTS (SELECT 1 FROM tax_relief_schemes WHERE country = 'CO' AND scheme_code = 'INTERES_VIVIENDA');

-- Medicina Prepagada (Prepaid Health)
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, effective_from, is_active, description)
SELECT 'CO', 'MEDICINA_PREPAGADA', 'Medicina Prepagada', 'personal_relief', 'deduction', 'fixed_amount', 0, 7530240, true, '2024-01-01', true, 'Prepaid health insurance deduction, capped at 16 UVT monthly (192 UVT annual)'
WHERE NOT EXISTS (SELECT 1 FROM tax_relief_schemes WHERE country = 'CO' AND scheme_code = 'MEDICINA_PREPAGADA');

-- Aportes Voluntarios Pensión (Voluntary Pension)
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_percentage, annual_cap, requires_proof, effective_from, is_active, description)
SELECT 'CO', 'PENSION_VOLUNTARIA', 'Aportes Voluntarios Pensión', 'savings_investment', 'exemption', 'percentage_of_income', 30, NULL, true, '2024-01-01', true, 'Voluntary pension contributions exempt up to 30% of income (combined with AFC limit of 3,800 UVT)'
WHERE NOT EXISTS (SELECT 1 FROM tax_relief_schemes WHERE country = 'CO' AND scheme_code = 'PENSION_VOLUNTARIA');