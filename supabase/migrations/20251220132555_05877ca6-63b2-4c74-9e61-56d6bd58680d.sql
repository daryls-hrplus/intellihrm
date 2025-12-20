-- =============================================
-- GUYANA PAYROLL CONFIGURATION
-- Currency: GYD (Guyanese Dollar)
-- Tax Year: Calendar Year (January - December)
-- =============================================

-- 1. STATUTORY DEDUCTION TYPES
-- =============================================

-- NIS - National Insurance Scheme
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, start_date, description)
SELECT 'GY', 'NIS', 'National Insurance Scheme', 'social_security', '2024-01-01', 'Mandatory national insurance covering pension, sickness, maternity, and injury benefits'
WHERE NOT EXISTS (SELECT 1 FROM statutory_deduction_types WHERE country = 'GY' AND statutory_code = 'NIS');

-- PAYE - Pay As You Earn (Income Tax)
INSERT INTO public.statutory_deduction_types (country, statutory_code, statutory_name, statutory_type, start_date, description)
SELECT 'GY', 'PAYE', 'Pay As You Earn', 'tax', '2024-01-01', 'Progressive income tax with personal allowance'
WHERE NOT EXISTS (SELECT 1 FROM statutory_deduction_types WHERE country = 'GY' AND statutory_code = 'PAYE');

-- 2. STATUTORY RATE BANDS
-- =============================================

DO $$
DECLARE
  v_nis_id UUID;
  v_paye_id UUID;
BEGIN
  SELECT id INTO v_nis_id FROM statutory_deduction_types WHERE country = 'GY' AND statutory_code = 'NIS';
  SELECT id INTO v_paye_id FROM statutory_deduction_types WHERE country = 'GY' AND statutory_code = 'PAYE';

  -- NIS: 5.6% employee, 8.4% employer, cap at GYD 280,000/month
  IF v_nis_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM statutory_rate_bands WHERE statutory_type_id = v_nis_id) THEN
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, notes)
    VALUES (v_nis_id, 1, 0, 280000, 0.056, 0.084, true, '2024-01-01', 'Monthly ceiling of GYD 280,000. Annual max employee: GYD 188,160, employer: GYD 282,240');
  END IF;

  -- PAYE Tax Bands
  IF v_paye_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM statutory_rate_bands WHERE statutory_type_id = v_paye_id) THEN
    -- Band 1: GYD 0 - 85,000/month = 0% (personal allowance)
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date, band_name)
    VALUES (v_paye_id, 1, 0, 85000, 0, 0, true, '2024-01-01', 'Personal Allowance (tax-free)');

    -- Band 2: GYD 85,001 - 180,000/month = 28%
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date)
    VALUES (v_paye_id, 2, 85000.01, 180000, 0.28, 0, true, '2024-01-01');

    -- Band 3: GYD 180,001+ = 40%
    INSERT INTO statutory_rate_bands (statutory_type_id, display_order, min_amount, max_amount, employee_rate, employer_rate, is_active, start_date)
    VALUES (v_paye_id, 3, 180000.01, NULL, 0.40, 0, true, '2024-01-01');
  END IF;

END $$;

-- 3. COUNTRY TAX SETTINGS
-- =============================================

INSERT INTO public.country_tax_settings (country, tax_calculation_method, allow_mid_year_refunds, refund_method, is_active, effective_from, description)
SELECT 'GY', 'cumulative', true, 'automatic', true, '2024-01-01', 
       'Guyana uses calendar tax year (Jan-Dec). Currency: GYD. PAYE with personal allowance. NIS contributions are NOT tax-deductible.'
WHERE NOT EXISTS (SELECT 1 FROM country_tax_settings WHERE country = 'GY');

-- 4. TAX RELIEF SCHEMES
-- =============================================

-- Personal Allowance
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, effective_from, is_active, description)
SELECT 'GY', 'PERSONAL_ALLOWANCE', 'Personal Allowance', 'personal_relief', 'deduction', 'fixed_amount', 1020000, 1020000, false, '2024-01-01', true, 'Basic personal tax-free allowance - GYD 85,000/month (GYD 1,020,000/year)'
WHERE NOT EXISTS (SELECT 1 FROM tax_relief_schemes WHERE country = 'GY' AND scheme_code = 'PERSONAL_ALLOWANCE');

-- Spouse Allowance
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, effective_from, is_active, description)
SELECT 'GY', 'SPOUSE_ALLOWANCE', 'Spouse Allowance', 'personal_relief', 'deduction', 'fixed_amount', 36000, 36000, true, '2024-01-01', true, 'Additional allowance for non-working spouse - GYD 36,000/year'
WHERE NOT EXISTS (SELECT 1 FROM tax_relief_schemes WHERE country = 'GY' AND scheme_code = 'SPOUSE_ALLOWANCE');

-- Child Allowance
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, requires_proof, effective_from, is_active, description)
SELECT 'GY', 'CHILD_ALLOWANCE', 'Child Allowance', 'personal_relief', 'deduction', 'fixed_amount', 10000, true, '2024-01-01', true, 'Allowance per dependent child - GYD 10,000 per child per year'
WHERE NOT EXISTS (SELECT 1 FROM tax_relief_schemes WHERE country = 'GY' AND scheme_code = 'CHILD_ALLOWANCE');