-- 1. Compensation History
CREATE TABLE public.compensation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  change_type TEXT NOT NULL, -- hire, promotion, merit, adjustment, demotion, market
  previous_salary NUMERIC(15,2),
  new_salary NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  change_amount NUMERIC(15,2),
  change_percentage NUMERIC(5,2),
  reason TEXT,
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Merit Increase Management
CREATE TABLE public.merit_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fiscal_year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  effective_date DATE NOT NULL,
  total_budget NUMERIC(15,2),
  allocated_budget NUMERIC(15,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, planning, in_progress, completed, cancelled
  guidelines JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.merit_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES public.merit_cycles(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  budget_amount NUMERIC(15,2) NOT NULL,
  allocated_amount NUMERIC(15,2) DEFAULT 0,
  headcount INTEGER,
  avg_increase_percentage NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.merit_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES public.merit_cycles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_salary NUMERIC(15,2) NOT NULL,
  recommended_increase_pct NUMERIC(5,2),
  recommended_increase_amt NUMERIC(15,2),
  new_salary NUMERIC(15,2),
  performance_rating NUMERIC(3,1),
  compa_ratio NUMERIC(5,2),
  justification TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, revised
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cycle_id, employee_id)
);

-- 3. Bonus Management
CREATE TABLE public.bonus_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  bonus_type TEXT NOT NULL, -- performance, spot, retention, signing, referral, holiday, profit_sharing
  calculation_method TEXT NOT NULL DEFAULT 'fixed', -- fixed, percentage, formula
  target_percentage NUMERIC(5,2),
  max_percentage NUMERIC(5,2),
  fixed_amount NUMERIC(15,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  frequency TEXT NOT NULL DEFAULT 'annual', -- monthly, quarterly, semi_annual, annual, one_time
  eligibility_criteria JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.bonus_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.bonus_plans(id) ON DELETE SET NULL,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  award_date DATE NOT NULL,
  payment_date DATE,
  base_amount NUMERIC(15,2) NOT NULL,
  multiplier NUMERIC(5,2) DEFAULT 1.0,
  final_amount NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  bonus_type TEXT NOT NULL,
  reason TEXT,
  performance_period_start DATE,
  performance_period_end DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, paid, cancelled
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Compensation Reviews/Planning
CREATE TABLE public.compensation_review_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  review_year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  effective_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  total_budget NUMERIC(15,2),
  includes_merit BOOLEAN DEFAULT true,
  includes_bonus BOOLEAN DEFAULT true,
  includes_equity BOOLEAN DEFAULT false,
  guidelines TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.compensation_review_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES public.compensation_review_cycles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id),
  current_base_salary NUMERIC(15,2),
  proposed_base_salary NUMERIC(15,2),
  current_bonus_target NUMERIC(5,2),
  proposed_bonus_target NUMERIC(5,2),
  equity_recommendation JSONB,
  total_increase_amount NUMERIC(15,2),
  total_increase_pct NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'pending',
  manager_comments TEXT,
  hr_comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cycle_id, employee_id)
);

-- 5. Market Data/Benchmarking
CREATE TABLE public.market_data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT,
  survey_year INTEGER NOT NULL,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.market_data_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.market_data_sources(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_family_id UUID REFERENCES public.job_families(id) ON DELETE SET NULL,
  job_title TEXT,
  location TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  percentile_10 NUMERIC(15,2),
  percentile_25 NUMERIC(15,2),
  percentile_50 NUMERIC(15,2),
  percentile_75 NUMERIC(15,2),
  percentile_90 NUMERIC(15,2),
  average_salary NUMERIC(15,2),
  sample_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Compa-Ratio Analysis (stored calculations)
CREATE TABLE public.compa_ratio_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_salary NUMERIC(15,2) NOT NULL,
  grade_midpoint NUMERIC(15,2),
  grade_min NUMERIC(15,2),
  grade_max NUMERIC(15,2),
  compa_ratio NUMERIC(5,2),
  range_penetration NUMERIC(5,2),
  market_ratio NUMERIC(5,2),
  salary_grade_id UUID REFERENCES public.salary_grades(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Pay Equity Analysis
CREATE TABLE public.pay_equity_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  analysis_date DATE NOT NULL,
  analysis_type TEXT NOT NULL, -- gender, ethnicity, age, disability, comprehensive
  methodology TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, in_progress, completed, archived
  findings JSONB,
  recommendations JSONB,
  created_by UUID REFERENCES public.profiles(id),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.pay_equity_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.pay_equity_analyses(id) ON DELETE CASCADE,
  group_category TEXT NOT NULL,
  group_value TEXT NOT NULL,
  comparison_group TEXT,
  employee_count INTEGER,
  avg_salary NUMERIC(15,2),
  median_salary NUMERIC(15,2),
  pay_gap_percentage NUMERIC(5,2),
  adjusted_pay_gap NUMERIC(5,2),
  statistical_significance BOOLEAN,
  risk_level TEXT, -- low, medium, high
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Total Rewards Statements
CREATE TABLE public.total_rewards_statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  statement_year INTEGER NOT NULL,
  statement_date DATE NOT NULL,
  base_salary NUMERIC(15,2),
  bonus_earned NUMERIC(15,2),
  equity_value NUMERIC(15,2),
  benefits_value NUMERIC(15,2),
  retirement_contribution NUMERIC(15,2),
  other_compensation NUMERIC(15,2),
  total_compensation NUMERIC(15,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  breakdown JSONB DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, statement_year)
);

-- 9. Compensation Budgets
CREATE TABLE public.compensation_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  fiscal_year INTEGER NOT NULL,
  budget_type TEXT NOT NULL, -- salary, merit, bonus, equity, total
  planned_amount NUMERIC(15,2) NOT NULL,
  allocated_amount NUMERIC(15,2) DEFAULT 0,
  spent_amount NUMERIC(15,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, approved, active, closed
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Stock/Equity Management
CREATE TABLE public.equity_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL, -- stock_option, rsu, espp, phantom_stock, sar
  description TEXT,
  total_shares_authorized INTEGER,
  shares_available INTEGER,
  grant_price NUMERIC(15,4),
  current_price NUMERIC(15,4),
  currency TEXT NOT NULL DEFAULT 'USD',
  vesting_schedule JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.equity_grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.equity_plans(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  grant_date DATE NOT NULL,
  grant_type TEXT NOT NULL,
  shares_granted INTEGER NOT NULL,
  grant_price NUMERIC(15,4),
  current_value NUMERIC(15,2),
  vesting_start_date DATE NOT NULL,
  vesting_end_date DATE,
  vesting_schedule JSONB,
  shares_vested INTEGER DEFAULT 0,
  shares_exercised INTEGER DEFAULT 0,
  shares_forfeited INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active, fully_vested, exercised, forfeited, expired
  expiration_date DATE,
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.equity_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grant_id UUID NOT NULL REFERENCES public.equity_grants(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  transaction_type TEXT NOT NULL, -- vest, exercise, sell, forfeit, transfer
  shares INTEGER NOT NULL,
  price_per_share NUMERIC(15,4),
  total_value NUMERIC(15,2),
  tax_withheld NUMERIC(15,2),
  net_proceeds NUMERIC(15,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.compensation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merit_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merit_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merit_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_review_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compa_ratio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_equity_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_equity_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.total_rewards_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equity_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equity_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equity_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Compensation History
CREATE POLICY "Employees view own compensation history" ON public.compensation_history
  FOR SELECT USING (employee_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage compensation history" ON public.compensation_history
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Merit cycles and allocations
CREATE POLICY "Admins view merit cycles" ON public.merit_cycles
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage merit cycles" ON public.merit_cycles
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage merit allocations" ON public.merit_allocations
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Managers view team merit recommendations" ON public.merit_recommendations
  FOR SELECT USING (
    employee_id = auth.uid() OR manager_id = auth.uid() 
    OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Managers manage merit recommendations" ON public.merit_recommendations
  FOR ALL USING (manager_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Bonus plans and awards
CREATE POLICY "All view active bonus plans" ON public.bonus_plans
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage bonus plans" ON public.bonus_plans
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees view own bonus awards" ON public.bonus_awards
  FOR SELECT USING (employee_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage bonus awards" ON public.bonus_awards
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Compensation review cycles
CREATE POLICY "Admins view review cycles" ON public.compensation_review_cycles
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage review cycles" ON public.compensation_review_cycles
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Participants view own review" ON public.compensation_review_participants
  FOR SELECT USING (
    employee_id = auth.uid() OR reviewer_id = auth.uid()
    OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Reviewers manage reviews" ON public.compensation_review_participants
  FOR ALL USING (reviewer_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Market data
CREATE POLICY "Admins view market data sources" ON public.market_data_sources
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage market data sources" ON public.market_data_sources
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins view market rates" ON public.market_data_rates
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage market rates" ON public.market_data_rates
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Compa-ratio snapshots
CREATE POLICY "Employees view own compa ratio" ON public.compa_ratio_snapshots
  FOR SELECT USING (employee_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage compa ratio snapshots" ON public.compa_ratio_snapshots
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Pay equity
CREATE POLICY "Admins view pay equity analyses" ON public.pay_equity_analyses
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage pay equity analyses" ON public.pay_equity_analyses
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins view pay equity results" ON public.pay_equity_results
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage pay equity results" ON public.pay_equity_results
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Total rewards statements
CREATE POLICY "Employees view own total rewards" ON public.total_rewards_statements
  FOR SELECT USING (employee_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage total rewards" ON public.total_rewards_statements
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Compensation budgets
CREATE POLICY "Admins view compensation budgets" ON public.compensation_budgets
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage compensation budgets" ON public.compensation_budgets
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Equity
CREATE POLICY "Admins view equity plans" ON public.equity_plans
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage equity plans" ON public.equity_plans
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees view own equity grants" ON public.equity_grants
  FOR SELECT USING (employee_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins manage equity grants" ON public.equity_grants
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees view own equity transactions" ON public.equity_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM equity_grants WHERE id = grant_id AND employee_id = auth.uid())
    OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Admins manage equity transactions" ON public.equity_transactions
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Indexes for performance
CREATE INDEX idx_compensation_history_employee ON public.compensation_history(employee_id);
CREATE INDEX idx_compensation_history_date ON public.compensation_history(effective_date);
CREATE INDEX idx_merit_recommendations_cycle ON public.merit_recommendations(cycle_id);
CREATE INDEX idx_merit_recommendations_employee ON public.merit_recommendations(employee_id);
CREATE INDEX idx_bonus_awards_employee ON public.bonus_awards(employee_id);
CREATE INDEX idx_bonus_awards_date ON public.bonus_awards(award_date);
CREATE INDEX idx_equity_grants_employee ON public.equity_grants(employee_id);
CREATE INDEX idx_equity_transactions_grant ON public.equity_transactions(grant_id);
CREATE INDEX idx_total_rewards_employee ON public.total_rewards_statements(employee_id);
CREATE INDEX idx_compa_ratio_employee ON public.compa_ratio_snapshots(employee_id);