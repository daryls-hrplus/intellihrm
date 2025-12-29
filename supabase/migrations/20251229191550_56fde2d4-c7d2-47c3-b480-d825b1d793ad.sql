-- =============================================
-- MEXICAN PAYROLL SUPPORT - PHASE 1: DATABASE SCHEMA
-- =============================================

-- 1. Mexican Company Registrations Table
CREATE TABLE public.mx_company_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rfc VARCHAR(13) NOT NULL,
  razon_social TEXT NOT NULL,
  registro_patronal_imss VARCHAR(20),
  isn_state_code VARCHAR(3),
  isn_rate DECIMAL(5,4),
  imss_risk_class INTEGER CHECK (imss_risk_class BETWEEN 1 AND 5),
  imss_risk_rate DECIMAL(5,4),
  fonacot_registration VARCHAR(50),
  csd_certificate_number VARCHAR(50),
  pac_provider VARCHAR(50),
  pac_credentials JSONB,
  domicilio_fiscal JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

-- 2. Mexican Employee Data Table
CREATE TABLE public.mx_employee_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  curp VARCHAR(18) NOT NULL,
  rfc_personal VARCHAR(13) NOT NULL,
  nss VARCHAR(11),
  ine_number VARCHAR(20),
  imss_registration_date DATE,
  contract_type VARCHAR(50),
  sdi DECIMAL(12,2),
  sdi_calculation_date DATE,
  sbc DECIMAL(12,2),
  work_shift VARCHAR(20) DEFAULT 'diurna',
  work_permit_number VARCHAR(50),
  sindicalizado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- 3. CFDI Records Table for Digital Invoicing
CREATE TABLE public.mx_cfdi_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_record_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  employee_id UUID REFERENCES public.profiles(id),
  cfdi_uuid UUID,
  folio VARCHAR(50),
  serie VARCHAR(10),
  xml_content TEXT,
  pdf_url TEXT,
  timbrado_date TIMESTAMPTZ,
  pac_provider VARCHAR(50),
  sat_seal TEXT,
  cfdi_status VARCHAR(20) DEFAULT 'pending',
  cancellation_status VARCHAR(20),
  cancellation_date TIMESTAMPTZ,
  cancellation_reason VARCHAR(10),
  related_cfdi_uuid UUID,
  version VARCHAR(10) DEFAULT '4.0',
  nomina_version VARCHAR(10) DEFAULT '1.2',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ISN State Rates Table (Impuesto Sobre Nómina)
CREATE TABLE public.mx_isn_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code VARCHAR(3) NOT NULL,
  state_name VARCHAR(100) NOT NULL,
  rate DECIMAL(5,4) NOT NULL,
  effective_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Subsidio al Empleo Table (Employment Subsidy)
CREATE TABLE public.mx_subsidio_empleo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_income DECIMAL(12,2) NOT NULL,
  max_income DECIMAL(12,2) NOT NULL,
  monthly_subsidy DECIMAL(12,2) NOT NULL,
  effective_year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ISR Tax Brackets Table (Income Tax)
CREATE TABLE public.mx_isr_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lower_limit DECIMAL(12,2) NOT NULL,
  upper_limit DECIMAL(12,2),
  fixed_fee DECIMAL(12,2) NOT NULL,
  rate_over_excess DECIMAL(6,4) NOT NULL,
  period_type VARCHAR(20) NOT NULL DEFAULT 'monthly',
  effective_year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. IMSS Contribution Rates Table
CREATE TABLE public.mx_imss_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_code VARCHAR(20) NOT NULL,
  concept_name VARCHAR(100) NOT NULL,
  employer_rate DECIMAL(6,4) NOT NULL,
  employee_rate DECIMAL(6,4) NOT NULL,
  applies_to_sbc BOOLEAN DEFAULT true,
  min_sbc_multiplier DECIMAL(6,4),
  max_sbc_multiplier DECIMAL(6,4),
  effective_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. UMA (Unidad de Medida y Actualización) Values
CREATE TABLE public.mx_uma_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_value DECIMAL(10,2) NOT NULL,
  monthly_value DECIMAL(12,2) NOT NULL,
  annual_value DECIMAL(14,2) NOT NULL,
  effective_year INTEGER NOT NULL,
  effective_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SAT Perception/Deduction Codes Catalog
CREATE TABLE public.mx_sat_catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_type VARCHAR(50) NOT NULL,
  code VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  description_en TEXT,
  is_taxable BOOLEAN,
  is_integrable_sdi BOOLEAN,
  exempt_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(catalog_type, code)
);

-- Enable RLS
ALTER TABLE public.mx_company_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mx_employee_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mx_cfdi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mx_isn_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mx_subsidio_empleo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mx_isr_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mx_imss_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mx_uma_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mx_sat_catalogs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mx_company_registrations
CREATE POLICY "Users can view their company mx registration"
ON public.mx_company_registrations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.company_id = mx_company_registrations.company_id
  )
);

CREATE POLICY "Admins can manage mx company registrations"
ON public.mx_company_registrations FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin']));

-- RLS Policies for mx_employee_data
CREATE POLICY "Employees can view their own mx data"
ON public.mx_employee_data FOR SELECT
USING (employee_id = auth.uid());

CREATE POLICY "Admins can manage mx employee data"
ON public.mx_employee_data FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin']));

-- RLS Policies for mx_cfdi_records
CREATE POLICY "Employees can view their own CFDI records"
ON public.mx_cfdi_records FOR SELECT
USING (employee_id = auth.uid());

CREATE POLICY "Admins can manage CFDI records"
ON public.mx_cfdi_records FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin']));

-- RLS Policies for reference tables (read-only for authenticated users)
CREATE POLICY "Authenticated users can view ISN rates"
ON public.mx_isn_rates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage ISN rates"
ON public.mx_isn_rates FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'payroll_admin']));

CREATE POLICY "Authenticated users can view subsidio empleo"
ON public.mx_subsidio_empleo FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage subsidio empleo"
ON public.mx_subsidio_empleo FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'payroll_admin']));

CREATE POLICY "Authenticated users can view ISR brackets"
ON public.mx_isr_brackets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage ISR brackets"
ON public.mx_isr_brackets FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'payroll_admin']));

CREATE POLICY "Authenticated users can view IMSS rates"
ON public.mx_imss_rates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage IMSS rates"
ON public.mx_imss_rates FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'payroll_admin']));

CREATE POLICY "Authenticated users can view UMA values"
ON public.mx_uma_values FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage UMA values"
ON public.mx_uma_values FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'payroll_admin']));

CREATE POLICY "Authenticated users can view SAT catalogs"
ON public.mx_sat_catalogs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage SAT catalogs"
ON public.mx_sat_catalogs FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'payroll_admin']));

-- Create indexes for performance
CREATE INDEX idx_mx_company_reg_company ON public.mx_company_registrations(company_id);
CREATE INDEX idx_mx_employee_data_employee ON public.mx_employee_data(employee_id);
CREATE INDEX idx_mx_cfdi_records_payroll ON public.mx_cfdi_records(payroll_record_id);
CREATE INDEX idx_mx_cfdi_records_employee ON public.mx_cfdi_records(employee_id);
CREATE INDEX idx_mx_cfdi_records_status ON public.mx_cfdi_records(cfdi_status);
CREATE INDEX idx_mx_isn_rates_state ON public.mx_isn_rates(state_code);
CREATE INDEX idx_mx_isr_brackets_year ON public.mx_isr_brackets(effective_year, period_type);
CREATE INDEX idx_mx_imss_rates_concept ON public.mx_imss_rates(concept_code);

-- Triggers for updated_at
CREATE TRIGGER update_mx_company_registrations_updated_at
  BEFORE UPDATE ON public.mx_company_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mx_employee_data_updated_at
  BEFORE UPDATE ON public.mx_employee_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mx_cfdi_records_updated_at
  BEFORE UPDATE ON public.mx_cfdi_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();