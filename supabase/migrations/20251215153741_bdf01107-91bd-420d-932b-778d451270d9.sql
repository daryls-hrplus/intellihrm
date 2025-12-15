
-- Create helper function is_admin_or_hr
CREATE OR REPLACE FUNCTION public.is_admin_or_hr(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id
      AND role IN ('admin', 'hr_manager')
  )
$$;

-- Create helper function is_admin
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id
      AND role = 'admin'
  )
$$;

-- GL Account Types enum
CREATE TYPE gl_account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');

-- GL Posting Status
CREATE TYPE gl_posting_status AS ENUM ('draft', 'pending', 'posted', 'reversed', 'failed');

-- Chart of Accounts
CREATE TABLE public.gl_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type gl_account_type NOT NULL,
  parent_account_id UUID REFERENCES public.gl_accounts(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_control_account BOOLEAN DEFAULT false,
  normal_balance TEXT CHECK (normal_balance IN ('debit', 'credit')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, account_code)
);

-- Cost Center Segment Definitions
CREATE TABLE public.gl_cost_center_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  segment_name TEXT NOT NULL,
  segment_code TEXT NOT NULL,
  segment_order INTEGER NOT NULL DEFAULT 1,
  segment_length INTEGER NOT NULL DEFAULT 4,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, segment_code)
);

-- Cost Center Segment Values
CREATE TABLE public.gl_cost_center_segment_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID NOT NULL REFERENCES public.gl_cost_center_segments(id) ON DELETE CASCADE,
  segment_value TEXT NOT NULL,
  segment_description TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(segment_id, segment_value)
);

-- Cost Centers
CREATE TABLE public.gl_cost_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  cost_center_code TEXT NOT NULL,
  cost_center_name TEXT NOT NULL,
  segment_values JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  department_id UUID REFERENCES public.departments(id),
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, cost_center_code)
);

-- GL Account Mappings
CREATE TABLE public.gl_account_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  pay_element_id UUID REFERENCES public.pay_elements(id),
  mapping_type TEXT NOT NULL CHECK (mapping_type IN ('wages_expense', 'tax_liability', 'tax_expense', 'deduction_liability', 'benefit_expense', 'benefit_liability', 'payroll_clearing', 'employer_contribution', 'employee_deduction', 'net_pay', 'custom')),
  debit_account_id UUID REFERENCES public.gl_accounts(id),
  credit_account_id UUID REFERENCES public.gl_accounts(id),
  default_cost_center_id UUID REFERENCES public.gl_cost_centers(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cost Reallocation Rules
CREATE TABLE public.gl_cost_reallocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_code TEXT NOT NULL,
  description TEXT,
  source_cost_center_id UUID NOT NULL REFERENCES public.gl_cost_centers(id),
  allocation_method TEXT NOT NULL CHECK (allocation_method IN ('percentage', 'fixed_amount', 'headcount', 'hours_worked', 'custom')),
  is_active BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(company_id, rule_code)
);

-- Cost Reallocation Targets
CREATE TABLE public.gl_cost_reallocation_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reallocation_id UUID NOT NULL REFERENCES public.gl_cost_reallocations(id) ON DELETE CASCADE,
  target_cost_center_id UUID NOT NULL REFERENCES public.gl_cost_centers(id),
  allocation_percentage NUMERIC(5,2) CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  allocation_amount NUMERIC(15,2),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Journal Entry Batches
CREATE TABLE public.gl_journal_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  batch_date DATE NOT NULL,
  payroll_run_id UUID REFERENCES public.payroll_runs(id),
  pay_period_id UUID REFERENCES public.pay_periods(id),
  description TEXT,
  status gl_posting_status NOT NULL DEFAULT 'draft',
  total_debits NUMERIC(15,2) DEFAULT 0,
  total_credits NUMERIC(15,2) DEFAULT 0,
  currency_id UUID REFERENCES public.currencies(id),
  posted_at TIMESTAMPTZ,
  posted_by UUID REFERENCES public.profiles(id),
  reversed_at TIMESTAMPTZ,
  reversed_by UUID REFERENCES public.profiles(id),
  reversal_batch_id UUID REFERENCES public.gl_journal_batches(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(company_id, batch_number)
);

-- Journal Entries
CREATE TABLE public.gl_journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.gl_journal_batches(id) ON DELETE CASCADE,
  entry_number INTEGER NOT NULL,
  entry_date DATE NOT NULL,
  account_id UUID NOT NULL REFERENCES public.gl_accounts(id),
  cost_center_id UUID REFERENCES public.gl_cost_centers(id),
  employee_id UUID REFERENCES public.profiles(id),
  debit_amount NUMERIC(15,2) DEFAULT 0,
  credit_amount NUMERIC(15,2) DEFAULT 0,
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  source_type TEXT CHECK (source_type IN ('payroll', 'reallocation', 'adjustment', 'reversal')),
  reallocation_id UUID REFERENCES public.gl_cost_reallocations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GL Export History
CREATE TABLE public.gl_export_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.gl_journal_batches(id),
  export_format TEXT NOT NULL CHECK (export_format IN ('csv', 'xml', 'json', 'quickbooks', 'sage', 'sap', 'oracle', 'xero', 'custom')),
  file_name TEXT,
  file_content TEXT,
  record_count INTEGER,
  total_amount NUMERIC(15,2),
  exported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exported_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'completed',
  error_message TEXT
);

-- Indexes
CREATE INDEX idx_gl_accounts_company ON public.gl_accounts(company_id);
CREATE INDEX idx_gl_cost_centers_company ON public.gl_cost_centers(company_id);
CREATE INDEX idx_gl_journal_entries_batch ON public.gl_journal_entries(batch_id);
CREATE INDEX idx_gl_journal_entries_account ON public.gl_journal_entries(account_id);
CREATE INDEX idx_gl_journal_entries_cost_center ON public.gl_journal_entries(cost_center_id);
CREATE INDEX idx_gl_journal_batches_payroll_run ON public.gl_journal_batches(payroll_run_id);
CREATE INDEX idx_gl_cost_reallocations_source ON public.gl_cost_reallocations(source_cost_center_id);

-- Enable RLS
ALTER TABLE public.gl_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_cost_center_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_cost_center_segment_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_account_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_cost_reallocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_cost_reallocation_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_journal_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_export_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage GL accounts" ON public.gl_accounts FOR ALL USING (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "Admins can manage cost center segments" ON public.gl_cost_center_segments FOR ALL USING (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "Admins can manage segment values" ON public.gl_cost_center_segment_values FOR ALL USING (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "Admins can manage cost centers" ON public.gl_cost_centers FOR ALL USING (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "Admins can manage GL mappings" ON public.gl_account_mappings FOR ALL USING (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "Admins can manage reallocations" ON public.gl_cost_reallocations FOR ALL USING (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "Admins can manage reallocation targets" ON public.gl_cost_reallocation_targets FOR ALL USING (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "Admins can manage journal batches" ON public.gl_journal_batches FOR ALL USING (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "Admins can manage journal entries" ON public.gl_journal_entries FOR ALL USING (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "Admins can view export history" ON public.gl_export_history FOR ALL USING (public.is_admin_or_hr(auth.uid()));

-- Triggers
CREATE TRIGGER update_gl_accounts_updated_at BEFORE UPDATE ON public.gl_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gl_cost_center_segments_updated_at BEFORE UPDATE ON public.gl_cost_center_segments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gl_cost_center_segment_values_updated_at BEFORE UPDATE ON public.gl_cost_center_segment_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gl_cost_centers_updated_at BEFORE UPDATE ON public.gl_cost_centers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gl_account_mappings_updated_at BEFORE UPDATE ON public.gl_account_mappings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gl_cost_reallocations_updated_at BEFORE UPDATE ON public.gl_cost_reallocations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gl_cost_reallocation_targets_updated_at BEFORE UPDATE ON public.gl_cost_reallocation_targets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gl_journal_batches_updated_at BEFORE UPDATE ON public.gl_journal_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gl_journal_entries_updated_at BEFORE UPDATE ON public.gl_journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate batch number
CREATE OR REPLACE FUNCTION public.generate_gl_batch_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.batch_number := 'GLB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_gl_batch_number_trigger BEFORE INSERT ON public.gl_journal_batches FOR EACH ROW EXECUTE FUNCTION public.generate_gl_batch_number();

-- Function to validate reallocation percentages
CREATE OR REPLACE FUNCTION public.validate_reallocation_percentages()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_total_percentage NUMERIC;
  v_allocation_method TEXT;
BEGIN
  SELECT allocation_method INTO v_allocation_method
  FROM gl_cost_reallocations WHERE id = NEW.reallocation_id;
  
  IF v_allocation_method = 'percentage' THEN
    SELECT COALESCE(SUM(allocation_percentage), 0) INTO v_total_percentage
    FROM gl_cost_reallocation_targets
    WHERE reallocation_id = NEW.reallocation_id
      AND is_active = true
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000');
    
    v_total_percentage := v_total_percentage + COALESCE(NEW.allocation_percentage, 0);
    
    IF v_total_percentage > 100 THEN
      RAISE EXCEPTION 'Total allocation percentage cannot exceed 100 percent. Current total: %', v_total_percentage;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_reallocation_percentages_trigger BEFORE INSERT OR UPDATE ON public.gl_cost_reallocation_targets FOR EACH ROW EXECUTE FUNCTION public.validate_reallocation_percentages();
