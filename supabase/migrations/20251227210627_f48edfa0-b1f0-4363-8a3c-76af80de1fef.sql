-- Scheduling Constraints - rules for AI to consider
CREATE TABLE IF NOT EXISTS public.ai_scheduling_constraints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  constraint_type TEXT NOT NULL,
  constraint_name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  parameters JSONB NOT NULL DEFAULT '{}',
  applies_to_department_id UUID REFERENCES public.departments(id),
  applies_to_shift_id UUID REFERENCES public.shifts(id),
  is_hard_constraint BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Schedule Runs - track scheduling optimization runs
CREATE TABLE IF NOT EXISTS public.ai_schedule_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  schedule_start_date DATE NOT NULL,
  schedule_end_date DATE NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  status TEXT NOT NULL DEFAULT 'pending',
  optimization_goal TEXT NOT NULL DEFAULT 'balanced',
  input_parameters JSONB DEFAULT '{}',
  ai_model_used TEXT,
  ai_response_raw JSONB,
  total_recommendations INTEGER DEFAULT 0,
  coverage_score NUMERIC(5,2),
  cost_estimate NUMERIC(12,2),
  preference_score NUMERIC(5,2),
  constraint_violations INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  applied_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Schedule Recommendations
CREATE TABLE IF NOT EXISTS public.ai_schedule_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_run_id UUID NOT NULL REFERENCES public.ai_schedule_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  shift_id UUID NOT NULL REFERENCES public.shifts(id),
  recommended_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT,
  alternative_employees JSONB DEFAULT '[]',
  is_accepted BOOLEAN,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employee Scheduling Preferences
CREATE TABLE IF NOT EXISTS public.employee_scheduling_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  preferred_shift_ids UUID[] DEFAULT '{}',
  preferred_days INTEGER[] DEFAULT '{}',
  avoided_days INTEGER[] DEFAULT '{}',
  max_hours_per_week NUMERIC(4,1) DEFAULT 40,
  min_hours_per_week NUMERIC(4,1) DEFAULT 0,
  max_consecutive_days INTEGER DEFAULT 5,
  prefers_consistent_schedule BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, company_id)
);

-- Enable RLS
ALTER TABLE public.ai_scheduling_constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_schedule_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_schedule_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_scheduling_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_scheduling_constraints
CREATE POLICY "select_ai_scheduling_constraints" ON public.ai_scheduling_constraints
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "all_ai_scheduling_constraints" ON public.ai_scheduling_constraints
  FOR ALL USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for ai_schedule_runs
CREATE POLICY "select_ai_schedule_runs" ON public.ai_schedule_runs
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "all_ai_schedule_runs" ON public.ai_schedule_runs
  FOR ALL USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for ai_schedule_recommendations
CREATE POLICY "select_ai_schedule_recommendations" ON public.ai_schedule_recommendations
  FOR SELECT USING (schedule_run_id IN (
    SELECT id FROM public.ai_schedule_runs WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "all_ai_schedule_recommendations" ON public.ai_schedule_recommendations
  FOR ALL USING (schedule_run_id IN (
    SELECT id FROM public.ai_schedule_runs WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

-- RLS Policies for employee_scheduling_preferences
CREATE POLICY "select_employee_scheduling_preferences" ON public.employee_scheduling_preferences
  FOR SELECT USING (employee_id = auth.uid() OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "all_employee_scheduling_preferences" ON public.employee_scheduling_preferences
  FOR ALL USING (employee_id = auth.uid() OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_schedule_runs_company ON public.ai_schedule_runs(company_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_schedule_recs_run ON public.ai_schedule_recommendations(schedule_run_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_prefs_emp ON public.employee_scheduling_preferences(employee_id);