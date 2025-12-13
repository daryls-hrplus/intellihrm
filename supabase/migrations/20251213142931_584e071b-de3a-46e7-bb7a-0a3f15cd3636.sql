-- =============================================
-- PAYROLL SYSTEM - COMPREHENSIVE DATABASE SCHEMA
-- =============================================

-- Pay Period Schedules (Weekly, Bi-Weekly, Semi-Monthly, Monthly)
CREATE TABLE public.pay_period_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'bi_weekly', 'semi_monthly', 'monthly')),
  pay_day_of_week INTEGER CHECK (pay_day_of_week >= 0 AND pay_day_of_week <= 6), -- 0=Sunday
  pay_day_of_month INTEGER CHECK (pay_day_of_month >= 1 AND pay_day_of_month <= 31),
  second_pay_day_of_month INTEGER CHECK (second_pay_day_of_month >= 1 AND second_pay_day_of_month <= 31), -- For semi-monthly
  cutoff_days_before_pay INTEGER DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Pay Periods (Actual periods)
CREATE TABLE public.pay_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.pay_period_schedules(id) ON DELETE CASCADE,
  period_number TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  cutoff_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'processing', 'approved', 'paid', 'closed')),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, period_number)
);

-- Payroll Runs (Process payroll for a period)
CREATE TABLE public.payroll_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  pay_period_id UUID NOT NULL REFERENCES public.pay_periods(id) ON DELETE CASCADE,
  run_number TEXT NOT NULL,
  run_type TEXT NOT NULL DEFAULT 'regular' CHECK (run_type IN ('regular', 'supplemental', 'bonus', 'correction', 'off_cycle')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'calculating', 'calculated', 'pending_approval', 'approved', 'processing', 'paid', 'failed', 'cancelled')),
  total_gross_pay DECIMAL(15,2) DEFAULT 0,
  total_net_pay DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  total_taxes DECIMAL(15,2) DEFAULT 0,
  total_employer_taxes DECIMAL(15,2) DEFAULT 0,
  total_employer_contributions DECIMAL(15,2) DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  calculated_at TIMESTAMPTZ,
  calculated_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES public.profiles(id),
  workflow_instance_id UUID REFERENCES public.workflow_instances(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(company_id, run_number)
);

-- Employee Payroll Records (Individual pay calculations)
CREATE TABLE public.employee_payroll (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_position_id UUID REFERENCES public.employee_positions(id),
  pay_period_id UUID NOT NULL REFERENCES public.pay_periods(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calculated', 'approved', 'paid', 'void')),
  -- Hours
  regular_hours DECIMAL(10,2) DEFAULT 0,
  overtime_hours DECIMAL(10,2) DEFAULT 0,
  holiday_hours DECIMAL(10,2) DEFAULT 0,
  sick_hours DECIMAL(10,2) DEFAULT 0,
  vacation_hours DECIMAL(10,2) DEFAULT 0,
  other_hours DECIMAL(10,2) DEFAULT 0,
  -- Earnings
  gross_pay DECIMAL(15,2) DEFAULT 0,
  regular_pay DECIMAL(15,2) DEFAULT 0,
  overtime_pay DECIMAL(15,2) DEFAULT 0,
  bonus_pay DECIMAL(15,2) DEFAULT 0,
  commission_pay DECIMAL(15,2) DEFAULT 0,
  other_earnings DECIMAL(15,2) DEFAULT 0,
  -- Deductions
  total_deductions DECIMAL(15,2) DEFAULT 0,
  tax_deductions DECIMAL(15,2) DEFAULT 0,
  benefit_deductions DECIMAL(15,2) DEFAULT 0,
  retirement_deductions DECIMAL(15,2) DEFAULT 0,
  garnishment_deductions DECIMAL(15,2) DEFAULT 0,
  other_deductions DECIMAL(15,2) DEFAULT 0,
  -- Net
  net_pay DECIMAL(15,2) DEFAULT 0,
  -- Employer costs
  employer_taxes DECIMAL(15,2) DEFAULT 0,
  employer_benefits DECIMAL(15,2) DEFAULT 0,
  employer_retirement DECIMAL(15,2) DEFAULT 0,
  total_employer_cost DECIMAL(15,2) DEFAULT 0,
  -- Currency
  currency TEXT NOT NULL DEFAULT 'USD',
  -- YTD totals (stored for quick reference)
  ytd_gross_pay DECIMAL(15,2) DEFAULT 0,
  ytd_net_pay DECIMAL(15,2) DEFAULT 0,
  ytd_taxes DECIMAL(15,2) DEFAULT 0,
  -- Metadata
  calculation_details JSONB DEFAULT '{}'::jsonb,
  payslip_generated BOOLEAN DEFAULT false,
  payslip_generated_at TIMESTAMPTZ,
  payslip_document_id UUID,
  bank_file_generated BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payroll Line Items (Detailed earnings/deductions)
CREATE TABLE public.payroll_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_payroll_id UUID NOT NULL REFERENCES public.employee_payroll(id) ON DELETE CASCADE,
  pay_element_id UUID REFERENCES public.pay_elements(id),
  line_type TEXT NOT NULL CHECK (line_type IN ('earning', 'deduction', 'tax', 'employer_contribution')),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  hours DECIMAL(10,2),
  rate DECIMAL(15,4),
  units DECIMAL(10,2),
  amount DECIMAL(15,2) NOT NULL,
  ytd_amount DECIMAL(15,2) DEFAULT 0,
  is_taxable BOOLEAN DEFAULT true,
  is_pensionable BOOLEAN DEFAULT false,
  tax_category TEXT,
  sort_order INTEGER DEFAULT 0,
  calculation_basis TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tax Configurations
CREATE TABLE public.payroll_tax_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  region_code TEXT,
  tax_type TEXT NOT NULL CHECK (tax_type IN ('federal_income', 'state_income', 'local_income', 'social_security', 'medicare', 'unemployment', 'disability', 'other')),
  tax_name TEXT NOT NULL,
  calculation_method TEXT NOT NULL DEFAULT 'percentage' CHECK (calculation_method IN ('percentage', 'bracket', 'flat', 'formula')),
  rate DECIMAL(10,6),
  wage_base_limit DECIMAL(15,2),
  exempt_amount DECIMAL(15,2) DEFAULT 0,
  employer_rate DECIMAL(10,6),
  employer_wage_base_limit DECIMAL(15,2),
  is_employee_tax BOOLEAN DEFAULT true,
  is_employer_tax BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  tax_brackets JSONB, -- For bracket-based calculations
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tax Brackets
CREATE TABLE public.payroll_tax_brackets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_config_id UUID NOT NULL REFERENCES public.payroll_tax_config(id) ON DELETE CASCADE,
  min_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  max_amount DECIMAL(15,2),
  rate DECIMAL(10,6) NOT NULL,
  flat_amount DECIMAL(15,2) DEFAULT 0,
  filing_status TEXT DEFAULT 'single',
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employee Tax Elections
CREATE TABLE public.employee_tax_elections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  tax_config_id UUID NOT NULL REFERENCES public.payroll_tax_config(id) ON DELETE CASCADE,
  filing_status TEXT DEFAULT 'single',
  allowances INTEGER DEFAULT 0,
  additional_withholding DECIMAL(15,2) DEFAULT 0,
  is_exempt BOOLEAN DEFAULT false,
  exempt_reason TEXT,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  w4_form_submitted BOOLEAN DEFAULT false,
  w4_submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deduction Configurations
CREATE TABLE public.payroll_deduction_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  deduction_type TEXT NOT NULL CHECK (deduction_type IN ('pre_tax', 'post_tax', 'garnishment', 'loan', 'other')),
  calculation_method TEXT NOT NULL DEFAULT 'fixed' CHECK (calculation_method IN ('fixed', 'percentage', 'formula')),
  default_amount DECIMAL(15,2),
  default_percentage DECIMAL(10,6),
  max_amount DECIMAL(15,2),
  annual_limit DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  is_mandatory BOOLEAN DEFAULT false,
  affects_taxable_income BOOLEAN DEFAULT true,
  affects_pensionable_income BOOLEAN DEFAULT false,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Employee Deductions
CREATE TABLE public.employee_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deduction_config_id UUID NOT NULL REFERENCES public.payroll_deduction_config(id) ON DELETE CASCADE,
  amount DECIMAL(15,2),
  percentage DECIMAL(10,6),
  max_amount DECIMAL(15,2),
  remaining_balance DECIMAL(15,2), -- For loans/garnishments
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bank File Configurations
CREATE TABLE public.bank_file_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  file_format TEXT NOT NULL CHECK (file_format IN ('ach', 'nacha', 'bacs', 'sepa', 'csv', 'custom')),
  company_bank_name TEXT,
  company_bank_account TEXT,
  company_bank_routing TEXT,
  company_id_number TEXT,
  originator_id TEXT,
  file_header_template JSONB,
  file_footer_template JSONB,
  record_template JSONB,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bank File Generations
CREATE TABLE public.bank_file_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  bank_config_id UUID NOT NULL REFERENCES public.bank_file_config(id),
  file_name TEXT NOT NULL,
  file_content TEXT,
  file_format TEXT NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  record_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'submitted', 'processed', 'failed', 'rejected')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payslips
CREATE TABLE public.payslips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_payroll_id UUID NOT NULL REFERENCES public.employee_payroll(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payslip_number TEXT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  gross_pay DECIMAL(15,2) NOT NULL,
  total_deductions DECIMAL(15,2) NOT NULL,
  net_pay DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  is_viewable BOOLEAN DEFAULT true,
  viewed_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Year-End Processing
CREATE TABLE public.payroll_year_end (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'processing', 'generated', 'submitted', 'corrected', 'closed')),
  w2_generated BOOLEAN DEFAULT false,
  w2_generated_at TIMESTAMPTZ,
  w2_submitted BOOLEAN DEFAULT false,
  w2_submitted_at TIMESTAMPTZ,
  total_employees INTEGER DEFAULT 0,
  total_wages DECIMAL(15,2) DEFAULT 0,
  total_taxes_withheld DECIMAL(15,2) DEFAULT 0,
  processing_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(company_id, tax_year)
);

-- Employee Year-End Forms (W-2, etc.)
CREATE TABLE public.employee_tax_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year_end_id UUID NOT NULL REFERENCES public.payroll_year_end(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL CHECK (form_type IN ('w2', 'w2c', '1099', 'p60', 'p45', 'other')),
  form_number TEXT,
  tax_year INTEGER NOT NULL,
  form_data JSONB NOT NULL,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'viewed', 'corrected')),
  generated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payroll Integration Config (External providers)
CREATE TABLE public.payroll_integration_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('adp', 'gusto', 'paychex', 'quickbooks', 'sage', 'custom')),
  api_endpoint TEXT,
  api_credentials JSONB, -- Encrypted at rest
  sync_frequency TEXT DEFAULT 'manual',
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT,
  is_active BOOLEAN DEFAULT false,
  field_mappings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payroll Audit Log
CREATE TABLE public.payroll_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  payroll_run_id UUID REFERENCES public.payroll_runs(id),
  employee_payroll_id UUID REFERENCES public.employee_payroll(id),
  action TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('calculation', 'approval', 'payment', 'correction', 'void', 'export', 'view')),
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES public.profiles(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_pay_periods_company ON public.pay_periods(company_id, status);
CREATE INDEX idx_pay_periods_dates ON public.pay_periods(period_start, period_end);
CREATE INDEX idx_payroll_runs_company ON public.payroll_runs(company_id, status);
CREATE INDEX idx_payroll_runs_period ON public.payroll_runs(pay_period_id);
CREATE INDEX idx_employee_payroll_run ON public.employee_payroll(payroll_run_id);
CREATE INDEX idx_employee_payroll_employee ON public.employee_payroll(employee_id);
CREATE INDEX idx_payroll_line_items_payroll ON public.payroll_line_items(employee_payroll_id);
CREATE INDEX idx_payslips_employee ON public.payslips(employee_id);
CREATE INDEX idx_payslips_dates ON public.payslips(pay_period_start, pay_period_end);
CREATE INDEX idx_employee_deductions_employee ON public.employee_deductions(employee_id, is_active);
CREATE INDEX idx_employee_tax_elections_employee ON public.employee_tax_elections(employee_id);

-- Enable RLS
ALTER TABLE public.pay_period_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_tax_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_tax_elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_deduction_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_file_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_file_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_year_end ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_tax_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_integration_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins/HR
CREATE POLICY "Admin/HR can manage pay period schedules" ON public.pay_period_schedules
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can manage pay periods" ON public.pay_periods
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can manage payroll runs" ON public.payroll_runs
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can view all employee payroll" ON public.employee_payroll
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can manage employee payroll" ON public.employee_payroll
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can manage payroll line items" ON public.payroll_line_items
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can manage tax config" ON public.payroll_tax_config
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can manage tax brackets" ON public.payroll_tax_brackets
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can manage employee tax elections" ON public.employee_tax_elections
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view own tax elections" ON public.employee_tax_elections
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Admin/HR can manage deduction config" ON public.payroll_deduction_config
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can manage employee deductions" ON public.employee_deductions
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view own deductions" ON public.employee_deductions
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Admin/HR can manage bank file config" ON public.bank_file_config
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can manage bank file generations" ON public.bank_file_generations
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can manage payslips" ON public.payslips
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view own payslips" ON public.payslips
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Employees can update own payslip views" ON public.payslips
  FOR UPDATE USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Admin/HR can manage year end" ON public.payroll_year_end
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can manage tax forms" ON public.employee_tax_forms
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view own tax forms" ON public.employee_tax_forms
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Admin/HR can manage integration config" ON public.payroll_integration_config
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can view payroll audit log" ON public.payroll_audit_log
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admin/HR can create payroll audit log" ON public.payroll_audit_log
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Triggers for updated_at
CREATE TRIGGER update_pay_period_schedules_updated_at BEFORE UPDATE ON public.pay_period_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pay_periods_updated_at BEFORE UPDATE ON public.pay_periods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON public.payroll_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_payroll_updated_at BEFORE UPDATE ON public.employee_payroll
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_tax_config_updated_at BEFORE UPDATE ON public.payroll_tax_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_tax_elections_updated_at BEFORE UPDATE ON public.employee_tax_elections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_deduction_config_updated_at BEFORE UPDATE ON public.payroll_deduction_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_deductions_updated_at BEFORE UPDATE ON public.employee_deductions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_file_config_updated_at BEFORE UPDATE ON public.bank_file_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON public.payslips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_year_end_updated_at BEFORE UPDATE ON public.payroll_year_end
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_tax_forms_updated_at BEFORE UPDATE ON public.employee_tax_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_integration_config_updated_at BEFORE UPDATE ON public.payroll_integration_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate payroll run number
CREATE OR REPLACE FUNCTION public.generate_payroll_run_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.run_number := 'PR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_payroll_run_number_trigger
  BEFORE INSERT ON public.payroll_runs
  FOR EACH ROW
  WHEN (NEW.run_number IS NULL OR NEW.run_number = '')
  EXECUTE FUNCTION public.generate_payroll_run_number();

-- Function to generate pay period number
CREATE OR REPLACE FUNCTION public.generate_pay_period_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.period_number := 'PP-' || TO_CHAR(NEW.period_start, 'YYYYMMDD') || '-' || TO_CHAR(NEW.period_end, 'YYYYMMDD');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_pay_period_number_trigger
  BEFORE INSERT ON public.pay_periods
  FOR EACH ROW
  WHEN (NEW.period_number IS NULL OR NEW.period_number = '')
  EXECUTE FUNCTION public.generate_pay_period_number();

-- Function to generate payslip number
CREATE OR REPLACE FUNCTION public.generate_payslip_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.payslip_number := 'PS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_payslip_number_trigger
  BEFORE INSERT ON public.payslips
  FOR EACH ROW
  WHEN (NEW.payslip_number IS NULL OR NEW.payslip_number = '')
  EXECUTE FUNCTION public.generate_payslip_number();