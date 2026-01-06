-- Maternity Leave Processing Module

-- Main maternity leave requests table
CREATE TABLE public.maternity_leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_request_id UUID REFERENCES public.leave_requests(id) ON DELETE SET NULL,
  
  -- Due date and pregnancy info
  expected_due_date DATE NOT NULL,
  actual_delivery_date DATE,
  pregnancy_confirmation_date DATE,
  number_of_children INTEGER DEFAULT 1,
  
  -- Leave phases
  prenatal_start_date DATE,
  prenatal_end_date DATE,
  postnatal_start_date DATE,
  postnatal_end_date DATE,
  total_leave_days INTEGER,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active_prenatal', 'active_postnatal', 'completed', 'cancelled', 'extended')),
  current_phase VARCHAR(50) CHECK (current_phase IN ('prenatal', 'postnatal', 'phased_return', 'completed')),
  
  -- Payment info
  payment_config_id UUID,
  statutory_payment_weeks INTEGER,
  employer_topup_weeks INTEGER,
  employer_topup_percentage DECIMAL(5,2),
  
  -- Return to work
  planned_return_date DATE,
  actual_return_date DATE,
  phased_return_enabled BOOLEAN DEFAULT false,
  phased_return_plan_id UUID,
  
  -- Regional compliance
  country_code VARCHAR(3),
  compliance_region VARCHAR(50) CHECK (compliance_region IN ('caribbean', 'latin_america', 'africa', 'other')),
  compliance_notes TEXT,
  
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maternity payment configurations by country/company
CREATE TABLE public.maternity_payment_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  country_code VARCHAR(3) NOT NULL,
  config_name VARCHAR(255) NOT NULL,
  
  -- Statutory requirements
  statutory_leave_weeks INTEGER NOT NULL,
  statutory_payment_percentage DECIMAL(5,2) DEFAULT 100,
  statutory_paid_by VARCHAR(50) DEFAULT 'government' CHECK (statutory_paid_by IN ('government', 'employer', 'shared')),
  statutory_cap_amount DECIMAL(15,2),
  statutory_cap_currency VARCHAR(3),
  
  -- Employer top-up
  employer_topup_enabled BOOLEAN DEFAULT false,
  employer_topup_weeks INTEGER,
  employer_topup_percentage DECIMAL(5,2),
  employer_topup_cap DECIMAL(15,2),
  
  -- Phase configuration
  prenatal_weeks INTEGER DEFAULT 6,
  postnatal_weeks INTEGER DEFAULT 8,
  flexible_allocation BOOLEAN DEFAULT false,
  
  -- Eligibility
  minimum_service_months INTEGER DEFAULT 12,
  probation_eligible BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Regional compliance rules
CREATE TABLE public.maternity_compliance_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code VARCHAR(3) NOT NULL,
  region VARCHAR(50) NOT NULL CHECK (region IN ('caribbean', 'latin_america', 'africa', 'other')),
  
  -- Legal requirements
  legal_minimum_weeks INTEGER NOT NULL,
  legal_payment_percentage DECIMAL(5,2),
  mandatory_prenatal_weeks INTEGER,
  mandatory_postnatal_weeks INTEGER,
  
  -- Documentation requirements
  required_documents JSONB DEFAULT '[]',
  medical_certificate_required BOOLEAN DEFAULT true,
  birth_certificate_deadline_days INTEGER,
  
  -- Additional benefits
  nursing_breaks_daily INTEGER,
  nursing_break_duration_minutes INTEGER,
  nursing_breaks_until_months INTEGER,
  
  -- Job protection
  job_protection_weeks INTEGER,
  dismissal_protection_weeks INTEGER,
  
  -- Extension options
  extension_allowed BOOLEAN DEFAULT true,
  max_extension_weeks INTEGER,
  unpaid_extension_allowed BOOLEAN DEFAULT true,
  
  -- Compliance notes
  legislation_reference TEXT,
  last_updated DATE,
  notes TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(country_code)
);

-- Return to work plans
CREATE TABLE public.maternity_return_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  maternity_request_id UUID NOT NULL REFERENCES public.maternity_leave_requests(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Plan details
  plan_type VARCHAR(50) DEFAULT 'standard' CHECK (plan_type IN ('standard', 'phased', 'flexible', 'part_time')),
  planned_return_date DATE NOT NULL,
  
  -- Phased return configuration
  phase_1_start_date DATE,
  phase_1_hours_per_week DECIMAL(4,1),
  phase_1_duration_weeks INTEGER,
  
  phase_2_start_date DATE,
  phase_2_hours_per_week DECIMAL(4,1),
  phase_2_duration_weeks INTEGER,
  
  phase_3_start_date DATE,
  phase_3_hours_per_week DECIMAL(4,1),
  phase_3_duration_weeks INTEGER,
  
  full_time_return_date DATE,
  
  -- Accommodations
  nursing_room_required BOOLEAN DEFAULT false,
  flexible_hours_required BOOLEAN DEFAULT false,
  remote_work_days INTEGER,
  accommodations_notes TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'active', 'completed', 'modified')),
  manager_approved BOOLEAN DEFAULT false,
  manager_approved_by UUID REFERENCES public.profiles(id),
  manager_approved_at TIMESTAMPTZ,
  hr_approved BOOLEAN DEFAULT false,
  hr_approved_by UUID REFERENCES public.profiles(id),
  hr_approved_at TIMESTAMPTZ,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maternity leave documents
CREATE TABLE public.maternity_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  maternity_request_id UUID NOT NULL REFERENCES public.maternity_leave_requests(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  document_type VARCHAR(100) NOT NULL CHECK (document_type IN (
    'pregnancy_confirmation', 'medical_certificate', 'due_date_confirmation',
    'birth_certificate', 'hospital_discharge', 'fitness_to_work',
    'extension_request', 'return_to_work_clearance', 'other'
  )),
  document_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  
  -- Validity
  issue_date DATE,
  expiry_date DATE,
  
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maternity leave payment records
CREATE TABLE public.maternity_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  maternity_request_id UUID NOT NULL REFERENCES public.maternity_leave_requests(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  payment_period_start DATE NOT NULL,
  payment_period_end DATE NOT NULL,
  
  -- Payment breakdown
  statutory_amount DECIMAL(15,2) DEFAULT 0,
  employer_topup_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Payment type
  payment_type VARCHAR(50) DEFAULT 'regular' CHECK (payment_type IN ('regular', 'statutory', 'topup', 'adjustment')),
  payment_source VARCHAR(50) CHECK (payment_source IN ('employer', 'government', 'insurance')),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid', 'cancelled')),
  payroll_run_id UUID,
  processed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.maternity_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maternity_payment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maternity_compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maternity_return_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maternity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maternity_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies using profiles table pattern
CREATE POLICY "Users can view maternity requests in their company"
ON public.maternity_leave_requests FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create maternity requests in their company"
ON public.maternity_leave_requests FOR INSERT
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update maternity requests in their company"
ON public.maternity_leave_requests FOR UPDATE
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete maternity requests in their company"
ON public.maternity_leave_requests FOR DELETE
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for maternity_payment_configs
CREATE POLICY "Users can view payment configs in their company"
ON public.maternity_payment_configs FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage payment configs in their company"
ON public.maternity_payment_configs FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for maternity_compliance_rules (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view compliance rules"
ON public.maternity_compliance_rules FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for maternity_return_plans
CREATE POLICY "Users can view return plans in their company"
ON public.maternity_return_plans FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage return plans in their company"
ON public.maternity_return_plans FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for maternity_documents
CREATE POLICY "Users can view documents in their company"
ON public.maternity_documents FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage documents in their company"
ON public.maternity_documents FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for maternity_payments
CREATE POLICY "Users can view payments in their company"
ON public.maternity_payments FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage payments in their company"
ON public.maternity_payments FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Insert default compliance rules for Caribbean, Latin America, and Africa
INSERT INTO public.maternity_compliance_rules (country_code, region, legal_minimum_weeks, legal_payment_percentage, mandatory_prenatal_weeks, mandatory_postnatal_weeks, required_documents, nursing_breaks_daily, nursing_break_duration_minutes, nursing_breaks_until_months, job_protection_weeks, legislation_reference) VALUES
-- Caribbean
('TT', 'caribbean', 14, 100, 6, 8, '["pregnancy_confirmation", "medical_certificate", "birth_certificate"]', 2, 60, 12, 52, 'Maternity Protection Act'),
('JM', 'caribbean', 12, 100, 4, 8, '["medical_certificate", "birth_certificate"]', 2, 30, 6, 52, 'Maternity Leave Act'),
('BB', 'caribbean', 12, 100, 6, 6, '["medical_certificate", "birth_certificate"]', 2, 30, 6, 52, 'Employment Rights Act'),
('GY', 'caribbean', 13, 70, 6, 7, '["medical_certificate", "birth_certificate"]', 2, 30, 6, 52, 'Labour Act'),
('BS', 'caribbean', 13, 100, 6, 7, '["medical_certificate", "birth_certificate"]', 2, 30, 6, 52, 'Employment Act'),

-- Latin America
('DO', 'latin_america', 14, 100, 6, 8, '["pregnancy_confirmation", "medical_certificate", "birth_certificate"]', 3, 30, 12, 52, 'Código de Trabajo'),
('MX', 'latin_america', 12, 100, 6, 6, '["medical_certificate", "birth_certificate"]', 2, 30, 6, 52, 'Ley Federal del Trabajo'),
('CO', 'latin_america', 18, 100, 2, 16, '["medical_certificate", "birth_certificate"]', 2, 30, 6, 52, 'Código Sustantivo del Trabajo'),
('BR', 'latin_america', 17, 100, 4, 13, '["medical_certificate", "birth_certificate"]', 2, 30, 6, 52, 'CLT - Consolidação das Leis do Trabalho'),
('AR', 'latin_america', 13, 100, 6, 7, '["medical_certificate", "birth_certificate"]', 2, 60, 12, 52, 'Ley de Contrato de Trabajo'),

-- Africa
('NG', 'africa', 12, 50, 6, 6, '["medical_certificate", "birth_certificate"]', 2, 30, 6, 52, 'Labour Act'),
('GH', 'africa', 12, 100, 6, 6, '["medical_certificate", "birth_certificate"]', 2, 60, 12, 52, 'Labour Act 2003'),
('ZA', 'africa', 16, 60, 4, 12, '["medical_certificate", "birth_certificate", "hospital_discharge"]', 2, 30, 6, 52, 'Basic Conditions of Employment Act'),
('KE', 'africa', 13, 100, 6, 7, '["medical_certificate", "birth_certificate"]', 2, 60, 12, 52, 'Employment Act 2007'),
('TZ', 'africa', 12, 100, 6, 6, '["medical_certificate", "birth_certificate"]', 2, 60, 12, 52, 'Employment and Labour Relations Act');

-- Create indexes for performance
CREATE INDEX idx_maternity_requests_company ON public.maternity_leave_requests(company_id);
CREATE INDEX idx_maternity_requests_employee ON public.maternity_leave_requests(employee_id);
CREATE INDEX idx_maternity_requests_status ON public.maternity_leave_requests(status);
CREATE INDEX idx_maternity_payment_configs_country ON public.maternity_payment_configs(country_code);
CREATE INDEX idx_maternity_return_plans_request ON public.maternity_return_plans(maternity_request_id);
CREATE INDEX idx_maternity_documents_request ON public.maternity_documents(maternity_request_id);
CREATE INDEX idx_maternity_payments_request ON public.maternity_payments(maternity_request_id);

-- Trigger for updated_at
CREATE TRIGGER update_maternity_leave_requests_updated_at
  BEFORE UPDATE ON public.maternity_leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maternity_payment_configs_updated_at
  BEFORE UPDATE ON public.maternity_payment_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maternity_compliance_rules_updated_at
  BEFORE UPDATE ON public.maternity_compliance_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maternity_return_plans_updated_at
  BEFORE UPDATE ON public.maternity_return_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maternity_documents_updated_at
  BEFORE UPDATE ON public.maternity_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maternity_payments_updated_at
  BEFORE UPDATE ON public.maternity_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();