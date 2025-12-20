-- Create table for tax relief scheme types (master configuration)
CREATE TABLE public.tax_relief_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country VARCHAR(10) NOT NULL,
  scheme_code VARCHAR(50) NOT NULL,
  scheme_name VARCHAR(150) NOT NULL,
  scheme_category VARCHAR(50) NOT NULL CHECK (scheme_category IN ('personal_relief', 'savings_investment', 'housing_education', 'youth_intern')),
  relief_type VARCHAR(30) NOT NULL CHECK (relief_type IN ('deduction', 'credit', 'exemption', 'reduced_rate')),
  calculation_method VARCHAR(30) NOT NULL CHECK (calculation_method IN ('fixed_amount', 'percentage_of_income', 'percentage_of_contribution', 'tiered')),
  relief_value DECIMAL(15,2) DEFAULT NULL,
  relief_percentage DECIMAL(5,2) DEFAULT NULL,
  annual_cap DECIMAL(15,2) DEFAULT NULL,
  monthly_cap DECIMAL(15,2) DEFAULT NULL,
  min_age INTEGER DEFAULT NULL,
  max_age INTEGER DEFAULT NULL,
  requires_proof BOOLEAN NOT NULL DEFAULT false,
  proof_documents TEXT[],
  eligibility_criteria JSONB DEFAULT '{}',
  description TEXT,
  legal_reference VARCHAR(255),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_country_scheme UNIQUE (country, scheme_code, effective_from)
);

-- Create table for employee tax relief enrollments
CREATE TABLE public.employee_tax_relief_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES public.tax_relief_schemes(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_from DATE NOT NULL,
  effective_to DATE DEFAULT NULL,
  contribution_amount DECIMAL(15,2) DEFAULT NULL,
  contribution_percentage DECIMAL(5,2) DEFAULT NULL,
  annual_claimed_amount DECIMAL(15,2) DEFAULT 0,
  proof_submitted BOOLEAN NOT NULL DEFAULT false,
  proof_verified BOOLEAN NOT NULL DEFAULT false,
  proof_verified_by UUID REFERENCES public.profiles(id),
  proof_verified_at TIMESTAMP WITH TIME ZONE,
  proof_documents JSONB DEFAULT '[]',
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_employee_scheme UNIQUE (employee_id, scheme_id, effective_from)
);

-- Create table for tax relief claims per pay period
CREATE TABLE public.tax_relief_period_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.employee_tax_relief_enrollments(id) ON DELETE CASCADE,
  payroll_run_id UUID REFERENCES public.payroll_runs(id),
  pay_period_id UUID REFERENCES public.pay_periods(id),
  claim_period_start DATE NOT NULL,
  claim_period_end DATE NOT NULL,
  contribution_amount DECIMAL(15,2) DEFAULT 0,
  relief_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_saved DECIMAL(15,2) DEFAULT 0,
  ytd_contribution DECIMAL(15,2) DEFAULT 0,
  ytd_relief DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'calculated' CHECK (status IN ('calculated', 'applied', 'reversed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_relief_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_tax_relief_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_relief_period_claims ENABLE ROW LEVEL SECURITY;

-- Policies for tax_relief_schemes
CREATE POLICY "Authenticated users can view tax relief schemes"
  ON public.tax_relief_schemes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage tax relief schemes"
  ON public.tax_relief_schemes FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'hr_manager', 'payroll_admin')
  ));

-- Policies for employee_tax_relief_enrollments
CREATE POLICY "Employees can view their own enrollments"
  ON public.employee_tax_relief_enrollments FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'hr_manager', 'payroll_admin')
  ));

CREATE POLICY "Admins can manage enrollments"
  ON public.employee_tax_relief_enrollments FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'hr_manager', 'payroll_admin')
  ));

-- Policies for tax_relief_period_claims
CREATE POLICY "Users can view their own claims"
  ON public.tax_relief_period_claims FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.employee_tax_relief_enrollments e
    WHERE e.id = enrollment_id AND (e.employee_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'hr_manager', 'payroll_admin')
    ))
  ));

CREATE POLICY "Admins can manage claims"
  ON public.tax_relief_period_claims FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'hr_manager', 'payroll_admin')
  ));

-- Triggers for updated_at
CREATE TRIGGER update_tax_relief_schemes_updated_at
  BEFORE UPDATE ON public.tax_relief_schemes FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_tax_relief_enrollments_updated_at
  BEFORE UPDATE ON public.employee_tax_relief_enrollments FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_relief_period_claims_updated_at
  BEFORE UPDATE ON public.tax_relief_period_claims FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default schemes by country
INSERT INTO public.tax_relief_schemes (country, scheme_code, scheme_name, scheme_category, relief_type, calculation_method, relief_value, relief_percentage, annual_cap, min_age, max_age, description, legal_reference) VALUES

-- JAMAICA - Personal Reliefs
('JM', 'AGE_RELIEF_55', 'Age Relief (55-64)', 'personal_relief', 'deduction', 'fixed_amount', 80000, NULL, 80000, 55, 64, 'Annual tax-free allowance for persons aged 55-64', 'Income Tax Act - Jamaica'),
('JM', 'AGE_RELIEF_65', 'Age Relief (65+)', 'personal_relief', 'deduction', 'fixed_amount', 80000, NULL, 80000, 65, NULL, 'Annual tax-free allowance for persons 65 and over', 'Income Tax Act - Jamaica'),
('JM', 'DISABILITY', 'Disability Relief', 'personal_relief', 'deduction', 'fixed_amount', 80000, NULL, 80000, NULL, NULL, 'Tax relief for registered disabled persons', 'Income Tax Act - Jamaica'),

-- JAMAICA - Savings & Investment
('JM', 'PENSION_CONTRIB', 'Approved Pension Contributions', 'savings_investment', 'deduction', 'percentage_of_contribution', NULL, 100, NULL, NULL, NULL, 'Contributions to approved superannuation/pension schemes', 'Income Tax Act - Jamaica'),

-- TRINIDAD & TOBAGO - Personal Reliefs
('TT', 'PERSONAL_ALLOWANCE', 'Personal Allowance', 'personal_relief', 'deduction', 'fixed_amount', 84000, NULL, 84000, NULL, NULL, 'Basic personal tax-free allowance', 'Income Tax Act Ch. 75:01'),

-- TRINIDAD & TOBAGO - Savings & Investment
('TT', 'PENSION_CONTRIB', 'Approved Pension Contributions', 'savings_investment', 'deduction', 'percentage_of_income', NULL, 15, NULL, NULL, NULL, 'Up to 15% of gross income for approved pension', 'Income Tax Act Ch. 75:01'),
('TT', 'DEFERRED_ANNUITY', 'Deferred Annuity Premium', 'savings_investment', 'deduction', 'fixed_amount', NULL, NULL, 60000, NULL, NULL, 'Life insurance/annuity premium deduction', 'Income Tax Act Ch. 75:01'),

-- TRINIDAD & TOBAGO - Housing & Education
('TT', 'FIRST_HOME', 'First-Time Homeowner Allowance', 'housing_education', 'deduction', 'fixed_amount', NULL, NULL, 25000, NULL, NULL, 'Mortgage interest for first-time homeowners', 'Income Tax Act Ch. 75:01'),
('TT', 'TERTIARY_ED', 'Tertiary Education Expenses', 'housing_education', 'deduction', 'fixed_amount', NULL, NULL, 72000, NULL, NULL, 'Approved tertiary education expenses', 'Income Tax Act Ch. 75:01'),

-- BARBADOS - Personal Reliefs
('BB', 'PERSONAL_ALLOWANCE', 'Personal Allowance', 'personal_relief', 'deduction', 'fixed_amount', 25000, NULL, 25000, NULL, NULL, 'Basic personal allowance', 'Income Tax Act - Barbados'),

-- BARBADOS - Savings & Investment
('BB', 'PENSION_CONTRIB', 'Pension Contributions', 'savings_investment', 'deduction', 'percentage_of_income', NULL, 15, NULL, NULL, NULL, 'Approved pension scheme contributions', 'Income Tax Act - Barbados'),
('BB', 'LIFE_INSURANCE', 'Life Insurance Premiums', 'savings_investment', 'deduction', 'fixed_amount', NULL, NULL, 5000, NULL, NULL, 'Approved life insurance premium deduction', 'Income Tax Act - Barbados'),

-- BARBADOS - Housing & Education
('BB', 'MORTGAGE_INTEREST', 'Mortgage Interest Relief', 'housing_education', 'deduction', 'fixed_amount', NULL, NULL, 17500, NULL, NULL, 'Interest on mortgage for principal residence', 'Income Tax Act - Barbados'),

-- GHANA - Personal Reliefs
('GH', 'DISABILITY_RELIEF', 'Disability Relief', 'personal_relief', 'deduction', 'percentage_of_income', NULL, 25, NULL, NULL, NULL, '25% of assessable income for disabled persons', 'Income Tax Act 2015 (Act 896)'),
('GH', 'AGED_DEPENDENT', 'Aged Dependent Relief', 'personal_relief', 'deduction', 'fixed_amount', 1000, NULL, NULL, NULL, NULL, 'Relief for supporting aged dependents (60+)', 'Income Tax Act 2015 (Act 896)'),

-- GHANA - Savings & Investment
('GH', 'TIER3_VOLUNTARY', 'Tier 3 Voluntary Pension', 'savings_investment', 'deduction', 'percentage_of_income', NULL, 16.5, NULL, NULL, NULL, 'Voluntary pension contributions up to 16.5%', 'National Pensions Act 2008'),

-- NIGERIA - Personal Reliefs
('NG', 'CRA', 'Consolidated Relief Allowance', 'personal_relief', 'deduction', 'tiered', 200000, 20, NULL, NULL, NULL, 'N200,000 or 1% of gross + 20% of gross income', 'Personal Income Tax Act'),
('NG', 'DISABILITY', 'Disability Allowance', 'personal_relief', 'exemption', 'fixed_amount', NULL, NULL, NULL, NULL, NULL, 'Special tax exemptions for disabled persons', 'Personal Income Tax Act'),

-- NIGERIA - Savings & Investment
('NG', 'LIFE_ASSURANCE', 'Life Assurance Relief', 'savings_investment', 'deduction', 'percentage_of_contribution', NULL, 100, NULL, NULL, NULL, 'Life insurance premium deduction', 'Personal Income Tax Act'),
('NG', 'GRATUITY_EXEMPT', 'Gratuity Exemption', 'savings_investment', 'exemption', 'fixed_amount', NULL, NULL, NULL, NULL, NULL, 'Gratuity payments are tax exempt', 'Personal Income Tax Act'),

-- DOMINICAN REPUBLIC - Housing & Education
('DO', 'EDUCATION_EXPENSE', 'Education Expenses', 'housing_education', 'deduction', 'fixed_amount', NULL, NULL, NULL, NULL, NULL, 'Qualified education expenses deduction', 'Tax Code - Dominican Republic'),
('DO', 'DEPENDENT_ALLOW', 'Dependent Allowance', 'personal_relief', 'deduction', 'fixed_amount', NULL, NULL, NULL, NULL, NULL, 'Allowance per qualified dependent', 'Tax Code - Dominican Republic'),

-- UK - Personal Reliefs
('GB', 'MARRIAGE_ALLOW', 'Marriage Allowance', 'personal_relief', 'credit', 'fixed_amount', 1260, NULL, 1260, NULL, NULL, 'Transfer 10% of personal allowance to spouse', 'Income Tax Act 2007'),
('GB', 'BLIND_PERSON', 'Blind Person Allowance', 'personal_relief', 'deduction', 'fixed_amount', 2870, NULL, 2870, NULL, NULL, 'Additional tax-free allowance for registered blind', 'Income Tax Act 2007'),

-- UK - Savings & Investment
('GB', 'PENSION_CONTRIB', 'Pension Contributions', 'savings_investment', 'deduction', 'percentage_of_contribution', NULL, 100, 60000, NULL, NULL, 'Tax relief on pension contributions', 'Finance Act'),
('GB', 'PROF_SUBSCRIPTIONS', 'Professional Subscriptions', 'savings_investment', 'deduction', 'fixed_amount', NULL, NULL, NULL, NULL, NULL, 'Approved professional body subscriptions', 'ITEPA 2003'),

-- UK - Housing & Education  
('GB', 'WORK_FROM_HOME', 'Working from Home Allowance', 'housing_education', 'deduction', 'fixed_amount', 312, NULL, 312, NULL, NULL, '6 per week for home workers', 'ITEPA 2003'),

-- YOUTH/INTERN SCHEMES (Multiple Countries)
('JM', 'YOUTH_EMPLOY', 'Youth Employment Tax Incentive', 'youth_intern', 'reduced_rate', 'percentage_of_income', NULL, 50, NULL, 18, 25, '50% tax reduction for first-time young employees', 'Special Economic Zone Act'),
('GH', 'GRADUATE_INTERN', 'Graduate Internship Scheme', 'youth_intern', 'exemption', 'fixed_amount', NULL, NULL, NULL, NULL, 30, 'Tax exemption for registered graduate interns', 'Ghana Investment Promotion Centre Act'),
('NG', 'NYSC_EXEMPT', 'NYSC Corps Member Exemption', 'youth_intern', 'exemption', 'fixed_amount', NULL, NULL, NULL, NULL, NULL, 'NYSC allowances are tax exempt', 'NYSC Act'),
('GB', 'APPRENTICE_LEVY', 'Apprenticeship Incentive', 'youth_intern', 'credit', 'fixed_amount', 1000, NULL, 1000, 16, 24, 'Employer incentive for hiring apprentices', 'Finance Act');

-- Add comments
COMMENT ON TABLE public.tax_relief_schemes IS 'Master configuration of tax relief schemes by country covering personal reliefs, savings/investment, housing/education, and youth/intern programs';
COMMENT ON TABLE public.employee_tax_relief_enrollments IS 'Employee enrollments in tax relief schemes with proof verification tracking';
COMMENT ON TABLE public.tax_relief_period_claims IS 'Per-period tax relief claims linked to payroll runs';