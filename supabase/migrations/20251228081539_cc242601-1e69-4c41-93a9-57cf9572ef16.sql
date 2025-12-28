-- =====================================================
-- POSITION-BASED BUDGETING SYSTEM
-- Full workforce planning with scenarios, what-if modeling,
-- fully loaded costs, and multi-level approval workflow
-- =====================================================

-- Budget Plans (master budget container)
CREATE TABLE public.position_budget_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fiscal_year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'active', 'closed', 'rejected')),
  plan_type TEXT NOT NULL DEFAULT 'annual' CHECK (plan_type IN ('annual', 'quarterly', 'multi_year')),
  currency_code TEXT NOT NULL DEFAULT 'USD',
  total_budgeted_amount NUMERIC(15,2) DEFAULT 0,
  total_actual_amount NUMERIC(15,2) DEFAULT 0,
  total_forecast_amount NUMERIC(15,2) DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  is_baseline BOOLEAN DEFAULT false,
  parent_plan_id UUID REFERENCES public.position_budget_plans(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Budget Scenarios (baseline, growth, reduction, what-if)
CREATE TABLE public.position_budget_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.position_budget_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL DEFAULT 'baseline' CHECK (scenario_type IN ('baseline', 'growth', 'reduction', 'what_if', 'forecast')),
  is_active BOOLEAN DEFAULT true,
  assumptions JSONB DEFAULT '{}',
  total_cost NUMERIC(15,2) DEFAULT 0,
  total_headcount INTEGER DEFAULT 0,
  variance_from_baseline NUMERIC(15,2) DEFAULT 0,
  variance_percentage NUMERIC(5,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cost Component Types (for fully loaded cost calculation)
CREATE TABLE public.position_cost_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  component_type TEXT NOT NULL CHECK (component_type IN ('base_salary', 'bonus', 'benefits', 'employer_taxes', 'allowances', 'overhead', 'other')),
  calculation_method TEXT NOT NULL DEFAULT 'fixed' CHECK (calculation_method IN ('fixed', 'percentage_of_base', 'percentage_of_total', 'formula')),
  default_value NUMERIC(15,2),
  default_percentage NUMERIC(5,2),
  formula TEXT,
  is_taxable BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Position Budget Line Items (individual position budgets)
CREATE TABLE public.position_budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID NOT NULL REFERENCES public.position_budget_scenarios(id) ON DELETE CASCADE,
  position_id UUID REFERENCES public.positions(id),
  department_id UUID REFERENCES public.departments(id),
  position_title TEXT NOT NULL,
  job_family TEXT,
  job_level TEXT,
  employment_type TEXT DEFAULT 'full_time',
  is_new_position BOOLEAN DEFAULT false,
  is_vacant BOOLEAN DEFAULT false,
  current_incumbent_id UUID REFERENCES public.profiles(id),
  planned_start_date DATE,
  planned_end_date DATE,
  fte NUMERIC(3,2) DEFAULT 1.0,
  headcount INTEGER DEFAULT 1,
  base_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
  bonus_amount NUMERIC(15,2) DEFAULT 0,
  benefits_amount NUMERIC(15,2) DEFAULT 0,
  employer_taxes_amount NUMERIC(15,2) DEFAULT 0,
  allowances_amount NUMERIC(15,2) DEFAULT 0,
  overhead_amount NUMERIC(15,2) DEFAULT 0,
  other_costs NUMERIC(15,2) DEFAULT 0,
  total_compensation NUMERIC(15,2) GENERATED ALWAYS AS (base_salary + bonus_amount + benefits_amount + allowances_amount) STORED,
  fully_loaded_cost NUMERIC(15,2) GENERATED ALWAYS AS (base_salary + bonus_amount + benefits_amount + employer_taxes_amount + allowances_amount + overhead_amount + other_costs) STORED,
  annual_cost NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Position Budget Cost Details (breakdown by cost component)
CREATE TABLE public.position_budget_cost_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_item_id UUID NOT NULL REFERENCES public.position_budget_items(id) ON DELETE CASCADE,
  cost_component_id UUID NOT NULL REFERENCES public.position_cost_components(id),
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2),
  calculation_basis TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Budget Approval Workflow Configuration
CREATE TABLE public.position_budget_approval_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  level_order INTEGER NOT NULL,
  level_name TEXT NOT NULL,
  role_required TEXT,
  approver_id UUID REFERENCES public.profiles(id),
  department_id UUID REFERENCES public.departments(id),
  threshold_amount NUMERIC(15,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, level_order)
);

-- Budget Approval Requests
CREATE TABLE public.position_budget_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.position_budget_plans(id) ON DELETE CASCADE,
  approval_level_id UUID REFERENCES public.position_budget_approval_levels(id),
  level_order INTEGER NOT NULL,
  level_name TEXT NOT NULL,
  approver_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  submitted_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Budget vs Actual Tracking
CREATE TABLE public.position_budget_actuals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_item_id UUID NOT NULL REFERENCES public.position_budget_items(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  actual_base_salary NUMERIC(15,2) DEFAULT 0,
  actual_bonus NUMERIC(15,2) DEFAULT 0,
  actual_benefits NUMERIC(15,2) DEFAULT 0,
  actual_employer_taxes NUMERIC(15,2) DEFAULT 0,
  actual_allowances NUMERIC(15,2) DEFAULT 0,
  actual_overhead NUMERIC(15,2) DEFAULT 0,
  actual_other NUMERIC(15,2) DEFAULT 0,
  actual_total NUMERIC(15,2) GENERATED ALWAYS AS (actual_base_salary + actual_bonus + actual_benefits + actual_employer_taxes + actual_allowances + actual_overhead + actual_other) STORED,
  variance NUMERIC(15,2) DEFAULT 0,
  variance_percentage NUMERIC(5,2) DEFAULT 0,
  source TEXT DEFAULT 'payroll',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- What-If Modeling Sessions
CREATE TABLE public.position_budget_whatif_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.position_budget_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_scenario_id UUID REFERENCES public.position_budget_scenarios(id),
  session_data JSONB DEFAULT '{}',
  changes JSONB DEFAULT '[]',
  impact_summary JSONB DEFAULT '{}',
  is_saved BOOLEAN DEFAULT false,
  converted_to_scenario_id UUID REFERENCES public.position_budget_scenarios(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Budget Forecast Projections
CREATE TABLE public.position_budget_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.position_budget_plans(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES public.position_budget_scenarios(id),
  forecast_period DATE NOT NULL,
  forecast_type TEXT NOT NULL DEFAULT 'monthly' CHECK (forecast_type IN ('monthly', 'quarterly', 'annual')),
  projected_headcount INTEGER DEFAULT 0,
  projected_cost NUMERIC(15,2) DEFAULT 0,
  growth_rate NUMERIC(5,2) DEFAULT 0,
  attrition_rate NUMERIC(5,2) DEFAULT 0,
  inflation_adjustment NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.position_budget_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_budget_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_cost_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_budget_cost_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_budget_approval_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_budget_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_budget_actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_budget_whatif_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_budget_forecasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for position_budget_plans
CREATE POLICY "Users can view budget plans in their company" ON public.position_budget_plans
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

CREATE POLICY "Authorized users can manage budget plans" ON public.position_budget_plans
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

-- RLS Policies for position_budget_scenarios
CREATE POLICY "Users can view scenarios in their plans" ON public.position_budget_scenarios
  FOR SELECT USING (
    plan_id IN (
      SELECT id FROM public.position_budget_plans 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

CREATE POLICY "Authorized users can manage scenarios" ON public.position_budget_scenarios
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

-- RLS Policies for position_cost_components
CREATE POLICY "Users can view cost components" ON public.position_cost_components
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

CREATE POLICY "Authorized users can manage cost components" ON public.position_cost_components
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

-- RLS Policies for position_budget_items
CREATE POLICY "Users can view budget items" ON public.position_budget_items
  FOR SELECT USING (
    scenario_id IN (
      SELECT pbs.id FROM public.position_budget_scenarios pbs
      JOIN public.position_budget_plans pbp ON pbs.plan_id = pbp.id
      WHERE pbp.company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

CREATE POLICY "Authorized users can manage budget items" ON public.position_budget_items
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

-- RLS Policies for position_budget_cost_details
CREATE POLICY "Users can view cost details" ON public.position_budget_cost_details
  FOR SELECT USING (
    budget_item_id IN (
      SELECT pbi.id FROM public.position_budget_items pbi
      JOIN public.position_budget_scenarios pbs ON pbi.scenario_id = pbs.id
      JOIN public.position_budget_plans pbp ON pbs.plan_id = pbp.id
      WHERE pbp.company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

CREATE POLICY "Authorized users can manage cost details" ON public.position_budget_cost_details
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

-- RLS Policies for position_budget_approval_levels
CREATE POLICY "Users can view approval levels" ON public.position_budget_approval_levels
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

CREATE POLICY "Authorized users can manage approval levels" ON public.position_budget_approval_levels
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

-- RLS Policies for position_budget_approvals
CREATE POLICY "Users can view approvals for their plans" ON public.position_budget_approvals
  FOR SELECT USING (
    plan_id IN (
      SELECT id FROM public.position_budget_plans 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
    OR approver_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

CREATE POLICY "Approvers can update their approvals" ON public.position_budget_approvals
  FOR UPDATE USING (
    approver_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

CREATE POLICY "Authorized users can create approvals" ON public.position_budget_approvals
  FOR INSERT WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

-- RLS Policies for position_budget_actuals
CREATE POLICY "Users can view budget actuals" ON public.position_budget_actuals
  FOR SELECT USING (
    budget_item_id IN (
      SELECT pbi.id FROM public.position_budget_items pbi
      JOIN public.position_budget_scenarios pbs ON pbi.scenario_id = pbs.id
      JOIN public.position_budget_plans pbp ON pbs.plan_id = pbp.id
      WHERE pbp.company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

CREATE POLICY "Authorized users can manage budget actuals" ON public.position_budget_actuals
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager', 'payroll_admin'])
  );

-- RLS Policies for position_budget_whatif_sessions
CREATE POLICY "Users can view their what-if sessions" ON public.position_budget_whatif_sessions
  FOR SELECT USING (
    created_by = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

CREATE POLICY "Users can manage their what-if sessions" ON public.position_budget_whatif_sessions
  FOR ALL USING (
    created_by = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

-- RLS Policies for position_budget_forecasts
CREATE POLICY "Users can view forecasts" ON public.position_budget_forecasts
  FOR SELECT USING (
    plan_id IN (
      SELECT id FROM public.position_budget_plans 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

CREATE POLICY "Authorized users can manage forecasts" ON public.position_budget_forecasts
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

-- Create indexes for performance
CREATE INDEX idx_position_budget_plans_company ON public.position_budget_plans(company_id);
CREATE INDEX idx_position_budget_plans_fiscal_year ON public.position_budget_plans(fiscal_year);
CREATE INDEX idx_position_budget_scenarios_plan ON public.position_budget_scenarios(plan_id);
CREATE INDEX idx_position_budget_items_scenario ON public.position_budget_items(scenario_id);
CREATE INDEX idx_position_budget_items_position ON public.position_budget_items(position_id);
CREATE INDEX idx_position_budget_items_department ON public.position_budget_items(department_id);
CREATE INDEX idx_position_budget_approvals_plan ON public.position_budget_approvals(plan_id);
CREATE INDEX idx_position_budget_approvals_approver ON public.position_budget_approvals(approver_id);
CREATE INDEX idx_position_budget_actuals_item ON public.position_budget_actuals(budget_item_id);
CREATE INDEX idx_position_budget_forecasts_plan ON public.position_budget_forecasts(plan_id);

-- Trigger to update timestamps
CREATE TRIGGER update_position_budget_plans_updated_at
  BEFORE UPDATE ON public.position_budget_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_position_budget_scenarios_updated_at
  BEFORE UPDATE ON public.position_budget_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_position_budget_items_updated_at
  BEFORE UPDATE ON public.position_budget_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_position_cost_components_updated_at
  BEFORE UPDATE ON public.position_cost_components
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate scenario totals
CREATE OR REPLACE FUNCTION public.calculate_scenario_totals(p_scenario_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_cost NUMERIC(15,2);
  v_total_headcount INTEGER;
  v_baseline_cost NUMERIC(15,2);
BEGIN
  -- Calculate totals for this scenario
  SELECT 
    COALESCE(SUM(fully_loaded_cost * headcount), 0),
    COALESCE(SUM(headcount), 0)
  INTO v_total_cost, v_total_headcount
  FROM position_budget_items
  WHERE scenario_id = p_scenario_id;
  
  -- Get baseline cost for variance calculation
  SELECT COALESCE(pbs2.total_cost, 0) INTO v_baseline_cost
  FROM position_budget_scenarios pbs
  LEFT JOIN position_budget_scenarios pbs2 ON pbs2.plan_id = pbs.plan_id AND pbs2.scenario_type = 'baseline'
  WHERE pbs.id = p_scenario_id;
  
  -- Update scenario
  UPDATE position_budget_scenarios
  SET 
    total_cost = v_total_cost,
    total_headcount = v_total_headcount,
    variance_from_baseline = v_total_cost - COALESCE(v_baseline_cost, 0),
    variance_percentage = CASE 
      WHEN COALESCE(v_baseline_cost, 0) = 0 THEN 0
      ELSE ROUND(((v_total_cost - v_baseline_cost) / v_baseline_cost * 100)::numeric, 2)
    END,
    updated_at = now()
  WHERE id = p_scenario_id;
END;
$$;

-- Trigger to auto-calculate scenario totals on item changes
CREATE OR REPLACE FUNCTION public.trigger_calculate_scenario_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_scenario_totals(OLD.scenario_id);
    RETURN OLD;
  ELSE
    PERFORM calculate_scenario_totals(NEW.scenario_id);
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER trigger_position_budget_items_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.position_budget_items
  FOR EACH ROW EXECUTE FUNCTION public.trigger_calculate_scenario_totals();