-- =============================================
-- SURINAME - TAX RELIEF SCHEMES (FINAL)
-- =============================================

-- Add tax relief schemes with correct constraint values
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, requires_proof, effective_from, is_active, description)
SELECT 'SR', 'PERSONAL_ALLOWANCE', 'Personal Allowance', 'personal_relief', 'deduction', 'fixed_amount', 5376, false, '2024-01-01', true, 'Basic personal tax-free allowance (built into first tax bracket)'
WHERE NOT EXISTS (SELECT 1 FROM tax_relief_schemes WHERE country = 'SR' AND scheme_code = 'PERSONAL_ALLOWANCE');

INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, annual_cap, requires_proof, effective_from, is_active, description)
SELECT 'SR', 'SPOUSE_ALLOWANCE', 'Spouse Allowance', 'personal_relief', 'deduction', 'fixed_amount', 2688, 2688, true, '2024-01-01', true, 'Additional allowance for non-working spouse'
WHERE NOT EXISTS (SELECT 1 FROM tax_relief_schemes WHERE country = 'SR' AND scheme_code = 'SPOUSE_ALLOWANCE');

INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, requires_proof, effective_from, is_active, description)
SELECT 'SR', 'CHILD_ALLOWANCE', 'Child Allowance', 'personal_relief', 'deduction', 'fixed_amount', 1344, true, '2024-01-01', true, 'Allowance per dependent child - SRD 1,344 per child'
WHERE NOT EXISTS (SELECT 1 FROM tax_relief_schemes WHERE country = 'SR' AND scheme_code = 'CHILD_ALLOWANCE');