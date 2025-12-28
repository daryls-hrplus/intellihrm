-- =============================================
-- PROJECT LABOR COST TRACKING SCHEMA
-- =============================================

-- 1. Project Cost Rates - Employee/Role-specific billing and cost rates per project
CREATE TABLE public.project_cost_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  cost_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  bill_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  effective_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  CONSTRAINT valid_date_range CHECK (effective_end_date IS NULL OR effective_end_date >= effective_start_date)
);

-- 2. Project Budgets - Enhanced budget tracking with thresholds
CREATE TABLE public.project_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  budget_type VARCHAR(50) NOT NULL DEFAULT 'labor',
  budget_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  fiscal_year INTEGER,
  fiscal_period VARCHAR(20),
  period_start DATE,
  period_end DATE,
  alert_threshold_percent NUMERIC(5, 2) NOT NULL DEFAULT 80,
  critical_threshold_percent NUMERIC(5, 2) NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  CONSTRAINT valid_budget_type CHECK (budget_type IN ('labor', 'materials', 'overhead', 'total')),
  CONSTRAINT valid_thresholds CHECK (alert_threshold_percent <= critical_threshold_percent)
);

-- 3. Project Cost Entries - Calculated costs for each time entry
CREATE TABLE public.project_cost_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_entry_id UUID REFERENCES public.project_time_entries(id) ON DELETE CASCADE,
  time_clock_entry_id UUID REFERENCES public.time_clock_entries(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  base_hours NUMERIC(8, 2) NOT NULL DEFAULT 0,
  overtime_hours NUMERIC(8, 2) NOT NULL DEFAULT 0,
  double_time_hours NUMERIC(8, 2) NOT NULL DEFAULT 0,
  regular_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  overtime_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  double_time_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  shift_differential_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  billable_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cost_rate_used NUMERIC(12, 2) NOT NULL DEFAULT 0,
  bill_rate_used NUMERIC(12, 2) NOT NULL DEFAULT 0,
  overtime_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.5,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_billable BOOLEAN NOT NULL DEFAULT true,
  calculation_status VARCHAR(20) NOT NULL DEFAULT 'calculated',
  calculation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_calculation_status CHECK (calculation_status IN ('pending', 'calculated', 'error', 'manual')),
  CONSTRAINT has_time_entry CHECK (time_entry_id IS NOT NULL OR time_clock_entry_id IS NOT NULL)
);

-- 4. Project Cost Allocations - Split time across multiple projects
CREATE TABLE public.project_cost_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  source_time_entry_id UUID REFERENCES public.project_time_entries(id) ON DELETE CASCADE,
  source_time_clock_id UUID REFERENCES public.time_clock_entries(id) ON DELETE CASCADE,
  target_project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  cost_center_code VARCHAR(50),
  allocation_percent NUMERIC(5, 2) NOT NULL DEFAULT 100,
  allocated_hours NUMERIC(8, 2) NOT NULL DEFAULT 0,
  allocated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  allocated_billable NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  CONSTRAINT valid_allocation_percent CHECK (allocation_percent > 0 AND allocation_percent <= 100),
  CONSTRAINT has_source CHECK (source_time_entry_id IS NOT NULL OR source_time_clock_id IS NOT NULL)
);

-- 5. Project Labor Cost Summaries - Pre-aggregated for fast dashboard loading
CREATE TABLE public.project_labor_cost_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  period_type VARCHAR(20) NOT NULL DEFAULT 'daily',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours NUMERIC(10, 2) NOT NULL DEFAULT 0,
  regular_hours NUMERIC(10, 2) NOT NULL DEFAULT 0,
  overtime_hours NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
  regular_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
  overtime_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
  shift_differential_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_billable NUMERIC(15, 2) NOT NULL DEFAULT 0,
  budget_amount NUMERIC(15, 2),
  budget_utilization_percent NUMERIC(5, 2),
  employee_count INTEGER NOT NULL DEFAULT 0,
  entry_count INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_period_type CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  UNIQUE (project_id, period_type, period_start)
);

-- 6. Project Cost Alerts - Track budget alerts and notifications
CREATE TABLE public.project_cost_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES public.project_budgets(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL DEFAULT 'threshold_warning',
  severity VARCHAR(20) NOT NULL DEFAULT 'warning',
  threshold_percent NUMERIC(5, 2),
  current_percent NUMERIC(5, 2),
  budget_amount NUMERIC(15, 2),
  current_cost NUMERIC(15, 2),
  message TEXT,
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_alert_type CHECK (alert_type IN ('threshold_warning', 'threshold_critical', 'overrun', 'pace_warning', 'anomaly')),
  CONSTRAINT valid_severity CHECK (severity IN ('info', 'warning', 'critical'))
);

-- Add columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS budget_amount NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS budget_currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS cost_to_date NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_to_date NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS profitability_score NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS last_cost_calculation_at TIMESTAMP WITH TIME ZONE;

-- Add columns to project_time_entries table
ALTER TABLE public.project_time_entries
ADD COLUMN IF NOT EXISTS calculated_cost NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS calculated_billable NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS cost_calculation_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS cost_calculated_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_cost_rates_lookup ON public.project_cost_rates(project_id, employee_id, effective_start_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_project_cost_rates_job ON public.project_cost_rates(project_id, job_id, effective_start_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_project_cost_entries_project ON public.project_cost_entries(project_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_project_cost_entries_employee ON public.project_cost_entries(employee_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_project_cost_entries_time ON public.project_cost_entries(time_entry_id) WHERE time_entry_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_budgets_project ON public.project_budgets(project_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_project_labor_summaries_lookup ON public.project_labor_cost_summaries(project_id, period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_project_cost_alerts_project ON public.project_cost_alerts(project_id, is_acknowledged, created_at);

-- Enable RLS on all new tables
ALTER TABLE public.project_cost_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_cost_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_labor_cost_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_cost_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_cost_rates
CREATE POLICY "Users can view cost rates for their company" ON public.project_cost_rates
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

CREATE POLICY "HR/Finance can manage cost rates" ON public.project_cost_rates
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

-- RLS Policies for project_budgets
CREATE POLICY "Users can view budgets for their company" ON public.project_budgets
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Managers can manage budgets" ON public.project_budgets
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager', 'manager'])
  );

-- RLS Policies for project_cost_entries
CREATE POLICY "Users can view cost entries for their company" ON public.project_cost_entries
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "System can manage cost entries" ON public.project_cost_entries
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

-- RLS Policies for project_cost_allocations
CREATE POLICY "Users can view allocations for their company" ON public.project_cost_allocations
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Managers can manage allocations" ON public.project_cost_allocations
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager', 'manager'])
  );

-- RLS Policies for project_labor_cost_summaries
CREATE POLICY "Users can view summaries for their company" ON public.project_labor_cost_summaries
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "System can manage summaries" ON public.project_labor_cost_summaries
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager'])
  );

-- RLS Policies for project_cost_alerts
CREATE POLICY "Users can view alerts for their company" ON public.project_cost_alerts
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Managers can manage alerts" ON public.project_cost_alerts
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'finance_manager', 'manager'])
  );

-- Add updated_at triggers
CREATE TRIGGER update_project_cost_rates_updated_at
  BEFORE UPDATE ON public.project_cost_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_budgets_updated_at
  BEFORE UPDATE ON public.project_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_cost_entries_updated_at
  BEFORE UPDATE ON public.project_cost_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_cost_allocations_updated_at
  BEFORE UPDATE ON public.project_cost_allocations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_labor_cost_summaries_updated_at
  BEFORE UPDATE ON public.project_labor_cost_summaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();