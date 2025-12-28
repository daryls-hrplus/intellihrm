-- =============================================
-- SAVINGS PROGRAM MANAGEMENT MODULE
-- Phase 1: Database Schema
-- =============================================

-- 1. savings_program_types - Master configuration for savings programs
CREATE TABLE public.savings_program_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  
  -- Category: credit_union, company_sponsored, goal_based, project_tied, christmas_club
  category TEXT NOT NULL CHECK (category IN ('credit_union', 'company_sponsored', 'goal_based', 'project_tied', 'christmas_club')),
  
  -- Calculation settings
  calculation_method TEXT DEFAULT 'fixed' CHECK (calculation_method IN ('fixed', 'percentage', 'formula')),
  default_amount NUMERIC(15,2),
  default_percentage NUMERIC(5,2),
  min_contribution NUMERIC(15,2),
  max_contribution NUMERIC(15,2),
  
  -- Employer matching
  has_employer_match BOOLEAN DEFAULT false,
  employer_match_percentage NUMERIC(5,2),
  employer_match_cap NUMERIC(15,2),
  employer_match_vesting_months INTEGER, -- months until match is vested
  
  -- Release/Payout settings
  release_type TEXT DEFAULT 'on_demand' CHECK (release_type IN ('on_demand', 'scheduled', 'goal_reached', 'project_end', 'termination_only')),
  scheduled_release_month INTEGER CHECK (scheduled_release_month IS NULL OR (scheduled_release_month >= 1 AND scheduled_release_month <= 12)),
  scheduled_release_day INTEGER CHECK (scheduled_release_day IS NULL OR (scheduled_release_day >= 1 AND scheduled_release_day <= 31)),
  allow_early_withdrawal BOOLEAN DEFAULT true,
  early_withdrawal_penalty_percentage NUMERIC(5,2),
  
  -- Interest settings
  earns_interest BOOLEAN DEFAULT false,
  interest_rate_annual NUMERIC(5,4), -- e.g., 0.0250 for 2.5%
  interest_calculation_method TEXT CHECK (interest_calculation_method IN ('simple', 'compound_monthly', 'compound_quarterly', 'compound_annually')),
  
  -- Eligibility
  min_tenure_months INTEGER DEFAULT 0,
  eligible_employment_types TEXT[], -- e.g., ['permanent', 'contract']
  eligible_department_ids UUID[],
  
  -- Payroll settings
  is_pretax BOOLEAN DEFAULT false,
  pay_element_id UUID REFERENCES public.pay_elements(id),
  deduction_priority INTEGER DEFAULT 50, -- order in payroll processing
  
  -- External institution (for credit unions)
  institution_name TEXT,
  institution_code TEXT,
  institution_account TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  
  UNIQUE(company_id, code)
);

-- 2. savings_enrollments - Employee participation in savings programs
CREATE TABLE public.savings_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_type_id UUID NOT NULL REFERENCES public.savings_program_types(id) ON DELETE RESTRICT,
  
  -- Optional project link (for project-tied savings)
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  
  -- Contribution settings (override program defaults)
  contribution_amount NUMERIC(15,2),
  contribution_percentage NUMERIC(5,2),
  currency TEXT DEFAULT 'USD',
  frequency TEXT DEFAULT 'per_pay_period' CHECK (frequency IN ('per_pay_period', 'monthly', 'bi_weekly', 'weekly')),
  
  -- Goal settings (for goal-based)
  goal_amount NUMERIC(15,2),
  target_date DATE,
  goal_description TEXT,
  
  -- Tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'withdrawn', 'cancelled')),
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_start_date DATE,
  end_date DATE,
  paused_at TIMESTAMPTZ,
  pause_reason TEXT,
  completed_at TIMESTAMPTZ,
  completion_reason TEXT,
  
  -- External account (for credit unions)
  external_institution_name TEXT,
  external_account_number TEXT,
  external_routing_number TEXT,
  
  -- Approval workflow
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  workflow_instance_id UUID REFERENCES public.workflow_instances(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  
  -- Prevent duplicate active enrollments in same program
  UNIQUE(employee_id, program_type_id, project_id) 
);

-- 3. savings_transactions - All movements (contributions, releases, adjustments)
CREATE TABLE public.savings_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.savings_enrollments(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'contribution', 'employer_match', 'interest', 
    'release', 'withdrawal', 'transfer_in', 'transfer_out',
    'adjustment', 'penalty', 'fee', 'refund'
  )),
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Running balance after this transaction
  balance_after NUMERIC(15,2),
  
  -- Payroll integration
  pay_period_id UUID REFERENCES public.pay_periods(id),
  payroll_run_id UUID REFERENCES public.payroll_runs(id),
  employee_payroll_id UUID REFERENCES public.employee_payroll(id),
  
  -- For releases/payouts
  release_method TEXT CHECK (release_method IN ('payroll', 'bank_transfer', 'cheque', 'cash', 'external_transfer')),
  release_reason TEXT, -- 'scheduled', 'goal_reached', 'project_end', 'emergency', 'employee_request', 'termination'
  
  -- Approval workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'rejected', 'cancelled', 'reversed')),
  requested_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  
  -- Reference and notes
  reference_number TEXT,
  external_reference TEXT,
  notes TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. savings_balances - Running balance per enrollment (denormalized for performance)
CREATE TABLE public.savings_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID UNIQUE NOT NULL REFERENCES public.savings_enrollments(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_type_id UUID NOT NULL REFERENCES public.savings_program_types(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Balance components
  total_contributions NUMERIC(15,2) DEFAULT 0,
  total_employer_match NUMERIC(15,2) DEFAULT 0,
  total_interest NUMERIC(15,2) DEFAULT 0,
  total_withdrawals NUMERIC(15,2) DEFAULT 0,
  total_penalties NUMERIC(15,2) DEFAULT 0,
  total_fees NUMERIC(15,2) DEFAULT 0,
  
  -- Current balance
  current_balance NUMERIC(15,2) GENERATED ALWAYS AS (
    total_contributions + total_employer_match + total_interest - total_withdrawals - total_penalties - total_fees
  ) STORED,
  
  -- Vested amounts (for employer match with vesting)
  vested_employer_match NUMERIC(15,2) DEFAULT 0,
  unvested_employer_match NUMERIC(15,2) DEFAULT 0,
  
  -- Goal tracking
  goal_progress_percentage NUMERIC(5,2),
  
  -- Tracking
  contribution_count INTEGER DEFAULT 0,
  last_contribution_date DATE,
  last_contribution_amount NUMERIC(15,2),
  first_contribution_date DATE,
  
  -- YTD tracking
  ytd_contributions NUMERIC(15,2) DEFAULT 0,
  ytd_employer_match NUMERIC(15,2) DEFAULT 0,
  ytd_interest NUMERIC(15,2) DEFAULT 0,
  ytd_withdrawals NUMERIC(15,2) DEFAULT 0,
  
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. savings_scheduled_releases - Track scheduled payouts (Christmas clubs, etc.)
CREATE TABLE public.savings_scheduled_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  program_type_id UUID NOT NULL REFERENCES public.savings_program_types(id) ON DELETE CASCADE,
  
  -- Schedule
  release_year INTEGER NOT NULL,
  release_month INTEGER NOT NULL CHECK (release_month >= 1 AND release_month <= 12),
  release_day INTEGER CHECK (release_day IS NULL OR (release_day >= 1 AND release_day <= 31)),
  scheduled_date DATE NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processing', 'completed', 'cancelled')),
  
  -- Totals
  total_enrollments INTEGER,
  total_amount NUMERIC(15,2),
  processed_count INTEGER DEFAULT 0,
  
  -- Processing
  processing_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES public.profiles(id),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(program_type_id, release_year, release_month)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_savings_program_types_company ON public.savings_program_types(company_id);
CREATE INDEX idx_savings_program_types_category ON public.savings_program_types(category);
CREATE INDEX idx_savings_program_types_active ON public.savings_program_types(is_active) WHERE is_active = true;

CREATE INDEX idx_savings_enrollments_company ON public.savings_enrollments(company_id);
CREATE INDEX idx_savings_enrollments_employee ON public.savings_enrollments(employee_id);
CREATE INDEX idx_savings_enrollments_program ON public.savings_enrollments(program_type_id);
CREATE INDEX idx_savings_enrollments_project ON public.savings_enrollments(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_savings_enrollments_status ON public.savings_enrollments(status);
CREATE INDEX idx_savings_enrollments_active ON public.savings_enrollments(status) WHERE status = 'active';

CREATE INDEX idx_savings_transactions_enrollment ON public.savings_transactions(enrollment_id);
CREATE INDEX idx_savings_transactions_employee ON public.savings_transactions(employee_id);
CREATE INDEX idx_savings_transactions_payroll ON public.savings_transactions(payroll_run_id) WHERE payroll_run_id IS NOT NULL;
CREATE INDEX idx_savings_transactions_status ON public.savings_transactions(status);
CREATE INDEX idx_savings_transactions_type ON public.savings_transactions(transaction_type);
CREATE INDEX idx_savings_transactions_created ON public.savings_transactions(created_at DESC);

CREATE INDEX idx_savings_balances_employee ON public.savings_balances(employee_id);
CREATE INDEX idx_savings_balances_program ON public.savings_balances(program_type_id);

CREATE INDEX idx_savings_scheduled_releases_date ON public.savings_scheduled_releases(scheduled_date);
CREATE INDEX idx_savings_scheduled_releases_status ON public.savings_scheduled_releases(status);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.savings_program_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_scheduled_releases ENABLE ROW LEVEL SECURITY;

-- Savings Program Types: Company admins and HR can manage
CREATE POLICY "Users can view savings program types for their company"
  ON public.savings_program_types FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

CREATE POLICY "HR and admins can manage savings program types"
  ON public.savings_program_types FOR ALL
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

-- Savings Enrollments: Employees can view own, HR can manage all
CREATE POLICY "Employees can view their own enrollments"
  ON public.savings_enrollments FOR SELECT
  USING (
    employee_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

CREATE POLICY "Employees can create their own enrollments"
  ON public.savings_enrollments FOR INSERT
  WITH CHECK (
    employee_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

CREATE POLICY "Employees can update their own enrollments"
  ON public.savings_enrollments FOR UPDATE
  USING (
    employee_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

CREATE POLICY "HR can delete enrollments"
  ON public.savings_enrollments FOR DELETE
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

-- Savings Transactions: Employees can view own, HR can manage all
CREATE POLICY "Employees can view their own transactions"
  ON public.savings_transactions FOR SELECT
  USING (
    employee_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

CREATE POLICY "HR and payroll can manage transactions"
  ON public.savings_transactions FOR ALL
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

-- Savings Balances: Employees can view own
CREATE POLICY "Employees can view their own balances"
  ON public.savings_balances FOR SELECT
  USING (
    employee_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

CREATE POLICY "System can manage balances"
  ON public.savings_balances FOR ALL
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

-- Scheduled Releases: HR can manage
CREATE POLICY "HR can view scheduled releases"
  ON public.savings_scheduled_releases FOR SELECT
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

CREATE POLICY "HR can manage scheduled releases"
  ON public.savings_scheduled_releases FOR ALL
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update timestamps
CREATE TRIGGER update_savings_program_types_updated_at
  BEFORE UPDATE ON public.savings_program_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_enrollments_updated_at
  BEFORE UPDATE ON public.savings_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_transactions_updated_at
  BEFORE UPDATE ON public.savings_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_scheduled_releases_updated_at
  BEFORE UPDATE ON public.savings_scheduled_releases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update savings balance after transaction
CREATE OR REPLACE FUNCTION public.update_savings_balance_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enrollment RECORD;
  v_program RECORD;
BEGIN
  -- Only process when transaction is processed
  IF NEW.status != 'processed' THEN
    RETURN NEW;
  END IF;
  
  -- Get enrollment and program details
  SELECT se.*, spt.goal_amount as program_goal
  INTO v_enrollment
  FROM savings_enrollments se
  JOIN savings_program_types spt ON spt.id = se.program_type_id
  WHERE se.id = NEW.enrollment_id;
  
  -- Upsert balance record
  INSERT INTO savings_balances (
    enrollment_id, employee_id, program_type_id, company_id,
    total_contributions, total_employer_match, total_interest,
    total_withdrawals, total_penalties, total_fees,
    contribution_count, last_contribution_date, last_contribution_amount,
    first_contribution_date,
    ytd_contributions, ytd_employer_match, ytd_interest, ytd_withdrawals
  ) VALUES (
    NEW.enrollment_id, NEW.employee_id, v_enrollment.program_type_id, NEW.company_id,
    CASE WHEN NEW.transaction_type = 'contribution' THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.transaction_type = 'employer_match' THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.transaction_type = 'interest' THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.transaction_type IN ('withdrawal', 'release') THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.transaction_type = 'penalty' THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.transaction_type = 'fee' THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.transaction_type = 'contribution' THEN 1 ELSE 0 END,
    CASE WHEN NEW.transaction_type = 'contribution' THEN CURRENT_DATE ELSE NULL END,
    CASE WHEN NEW.transaction_type = 'contribution' THEN NEW.amount ELSE NULL END,
    CASE WHEN NEW.transaction_type = 'contribution' THEN CURRENT_DATE ELSE NULL END,
    CASE WHEN NEW.transaction_type = 'contribution' AND EXTRACT(YEAR FROM NEW.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.transaction_type = 'employer_match' AND EXTRACT(YEAR FROM NEW.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.transaction_type = 'interest' AND EXTRACT(YEAR FROM NEW.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.transaction_type IN ('withdrawal', 'release') AND EXTRACT(YEAR FROM NEW.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) THEN NEW.amount ELSE 0 END
  )
  ON CONFLICT (enrollment_id) DO UPDATE SET
    total_contributions = savings_balances.total_contributions + 
      CASE WHEN NEW.transaction_type = 'contribution' THEN NEW.amount ELSE 0 END,
    total_employer_match = savings_balances.total_employer_match + 
      CASE WHEN NEW.transaction_type = 'employer_match' THEN NEW.amount ELSE 0 END,
    total_interest = savings_balances.total_interest + 
      CASE WHEN NEW.transaction_type = 'interest' THEN NEW.amount ELSE 0 END,
    total_withdrawals = savings_balances.total_withdrawals + 
      CASE WHEN NEW.transaction_type IN ('withdrawal', 'release') THEN NEW.amount ELSE 0 END,
    total_penalties = savings_balances.total_penalties + 
      CASE WHEN NEW.transaction_type = 'penalty' THEN NEW.amount ELSE 0 END,
    total_fees = savings_balances.total_fees + 
      CASE WHEN NEW.transaction_type = 'fee' THEN NEW.amount ELSE 0 END,
    contribution_count = savings_balances.contribution_count + 
      CASE WHEN NEW.transaction_type = 'contribution' THEN 1 ELSE 0 END,
    last_contribution_date = CASE WHEN NEW.transaction_type = 'contribution' THEN CURRENT_DATE ELSE savings_balances.last_contribution_date END,
    last_contribution_amount = CASE WHEN NEW.transaction_type = 'contribution' THEN NEW.amount ELSE savings_balances.last_contribution_amount END,
    first_contribution_date = COALESCE(savings_balances.first_contribution_date, 
      CASE WHEN NEW.transaction_type = 'contribution' THEN CURRENT_DATE ELSE NULL END),
    ytd_contributions = CASE 
      WHEN EXTRACT(YEAR FROM NEW.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) AND NEW.transaction_type = 'contribution'
      THEN savings_balances.ytd_contributions + NEW.amount 
      ELSE savings_balances.ytd_contributions END,
    ytd_employer_match = CASE 
      WHEN EXTRACT(YEAR FROM NEW.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) AND NEW.transaction_type = 'employer_match'
      THEN savings_balances.ytd_employer_match + NEW.amount 
      ELSE savings_balances.ytd_employer_match END,
    ytd_interest = CASE 
      WHEN EXTRACT(YEAR FROM NEW.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) AND NEW.transaction_type = 'interest'
      THEN savings_balances.ytd_interest + NEW.amount 
      ELSE savings_balances.ytd_interest END,
    ytd_withdrawals = CASE 
      WHEN EXTRACT(YEAR FROM NEW.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) AND NEW.transaction_type IN ('withdrawal', 'release')
      THEN savings_balances.ytd_withdrawals + NEW.amount 
      ELSE savings_balances.ytd_withdrawals END,
    last_updated_at = now();
  
  -- Update goal progress if applicable
  IF v_enrollment.goal_amount IS NOT NULL AND v_enrollment.goal_amount > 0 THEN
    UPDATE savings_balances
    SET goal_progress_percentage = LEAST(100, (current_balance / v_enrollment.goal_amount) * 100)
    WHERE enrollment_id = NEW.enrollment_id;
    
    -- Auto-complete enrollment if goal reached
    IF EXISTS (
      SELECT 1 FROM savings_balances 
      WHERE enrollment_id = NEW.enrollment_id 
      AND goal_progress_percentage >= 100
    ) THEN
      UPDATE savings_enrollments
      SET status = 'completed', completed_at = now(), completion_reason = 'goal_reached'
      WHERE id = NEW.enrollment_id AND status = 'active';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_savings_balance_after_transaction
  AFTER INSERT OR UPDATE ON public.savings_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_savings_balance_on_transaction();

-- Function to generate enrollment reference number
CREATE OR REPLACE FUNCTION public.generate_savings_enrollment_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM savings_transactions WHERE enrollment_id = NEW.id
  ) THEN
    -- Generate a reference like SAV-20241228-XXXX
    NEW.id := COALESCE(NEW.id, gen_random_uuid());
  END IF;
  RETURN NEW;
END;
$$;