-- Shift Swap Requests
CREATE TABLE public.shift_swap_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requester_shift_assignment_id UUID NOT NULL REFERENCES public.employee_shift_assignments(id) ON DELETE CASCADE,
  target_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_shift_assignment_id UUID REFERENCES public.employee_shift_assignments(id) ON DELETE SET NULL,
  swap_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'approved', 'completed')),
  target_response TEXT,
  target_responded_at TIMESTAMPTZ,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  manager_notes TEXT,
  manager_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Open Shifts (unfilled shifts for employees to claim)
CREATE TABLE public.open_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  positions_available INTEGER NOT NULL DEFAULT 1,
  positions_filled INTEGER NOT NULL DEFAULT 0,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  location_name TEXT,
  required_skills TEXT[],
  hourly_rate_override NUMERIC(10,2),
  premium_rate NUMERIC(5,2),
  notes TEXT,
  posted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Open Shift Claims
CREATE TABLE public.open_shift_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  open_shift_id UUID NOT NULL REFERENCES public.open_shifts(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(open_shift_id, employee_id)
);

-- Shift Bidding Periods
CREATE TABLE public.shift_bidding_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  schedule_start_date DATE NOT NULL,
  schedule_end_date DATE NOT NULL,
  bidding_opens_at TIMESTAMPTZ NOT NULL,
  bidding_closes_at TIMESTAMPTZ NOT NULL,
  allocation_method TEXT NOT NULL DEFAULT 'seniority' CHECK (allocation_method IN ('seniority', 'rotation', 'lottery', 'first_come', 'manager_discretion')),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'allocating', 'finalized', 'cancelled')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shift Bids
CREATE TABLE public.shift_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bidding_period_id UUID NOT NULL REFERENCES public.shift_bidding_periods(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  preference_rank INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'allocated', 'not_allocated', 'withdrawn')),
  allocated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bidding_period_id, employee_id, shift_id)
);

-- Shift Templates
CREATE TABLE public.shift_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL DEFAULT 'weekly' CHECK (template_type IN ('daily', 'weekly', 'biweekly', 'monthly')),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shift Template Entries
CREATE TABLE public.shift_template_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.shift_templates(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  day_offset INTEGER NOT NULL DEFAULT 0,
  employee_count INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rotation Patterns
CREATE TABLE public.shift_rotation_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  pattern_type TEXT NOT NULL DEFAULT 'fixed' CHECK (pattern_type IN ('fixed', 'rotating', 'flexible')),
  cycle_length_days INTEGER NOT NULL DEFAULT 7,
  pattern_definition JSONB NOT NULL DEFAULT '[]',
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Employee Rotation Assignments
CREATE TABLE public.employee_rotation_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rotation_pattern_id UUID NOT NULL REFERENCES public.shift_rotation_patterns(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_start_offset INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fatigue Management Rules
CREATE TABLE public.fatigue_management_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('max_consecutive_shifts', 'min_rest_between_shifts', 'max_hours_per_day', 'max_hours_per_week', 'max_hours_per_period', 'mandatory_break')),
  threshold_value NUMERIC(10,2) NOT NULL,
  threshold_unit TEXT NOT NULL DEFAULT 'hours' CHECK (threshold_unit IN ('hours', 'days', 'shifts', 'minutes')),
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'department', 'role', 'shift_type')),
  applies_to_id UUID,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'block')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Fatigue Violations Log
CREATE TABLE public.fatigue_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.fatigue_management_rules(id) ON DELETE CASCADE,
  violation_date DATE NOT NULL,
  actual_value NUMERIC(10,2) NOT NULL,
  threshold_value NUMERIC(10,2) NOT NULL,
  severity TEXT NOT NULL,
  details JSONB,
  acknowledged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  override_approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  override_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shift Coverage Analysis Snapshots
CREATE TABLE public.shift_coverage_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  required_headcount INTEGER NOT NULL DEFAULT 0,
  scheduled_headcount INTEGER NOT NULL DEFAULT 0,
  actual_headcount INTEGER,
  coverage_percentage NUMERIC(5,2),
  understaffed_hours NUMERIC(10,2) DEFAULT 0,
  overstaffed_hours NUMERIC(10,2) DEFAULT 0,
  labor_cost_scheduled NUMERIC(12,2),
  labor_cost_actual NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shift Cost Projections
CREATE TABLE public.shift_cost_projections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  projection_date DATE NOT NULL,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  regular_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  overtime_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  premium_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  regular_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  overtime_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  premium_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  headcount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shift Notifications
CREATE TABLE public.shift_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('shift_assigned', 'shift_changed', 'shift_cancelled', 'swap_request', 'swap_approved', 'open_shift', 'reminder', 'fatigue_warning')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  sent_via TEXT[] DEFAULT ARRAY['in_app'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shift Demand Forecasts
CREATE TABLE public.shift_demand_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  predicted_demand INTEGER NOT NULL,
  confidence_level NUMERIC(5,2),
  prediction_factors JSONB,
  actual_demand INTEGER,
  variance NUMERIC(10,2),
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.shift_swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_shift_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_bidding_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_template_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_rotation_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_rotation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatigue_management_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatigue_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_coverage_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_cost_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_demand_forecasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Users can view shift swap requests" ON public.shift_swap_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create shift swap requests" ON public.shift_swap_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update their own swap requests" ON public.shift_swap_requests FOR UPDATE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = target_employee_id OR auth.uid() = manager_id);

CREATE POLICY "Users can view open shifts" ON public.open_shifts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage open shifts" ON public.open_shifts FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view open shift claims" ON public.open_shift_claims FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create claims" ON public.open_shift_claims FOR INSERT TO authenticated WITH CHECK (auth.uid() = employee_id);
CREATE POLICY "Users can update their claims" ON public.open_shift_claims FOR UPDATE TO authenticated USING (auth.uid() = employee_id OR auth.uid() = reviewed_by);

CREATE POLICY "Users can view bidding periods" ON public.shift_bidding_periods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage bidding periods" ON public.shift_bidding_periods FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view bids" ON public.shift_bids FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their bids" ON public.shift_bids FOR ALL TO authenticated USING (auth.uid() = employee_id);

CREATE POLICY "Users can view shift templates" ON public.shift_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage templates" ON public.shift_templates FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view template entries" ON public.shift_template_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage template entries" ON public.shift_template_entries FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view rotation patterns" ON public.shift_rotation_patterns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage rotation patterns" ON public.shift_rotation_patterns FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view rotation assignments" ON public.employee_rotation_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage rotation assignments" ON public.employee_rotation_assignments FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view fatigue rules" ON public.fatigue_management_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage fatigue rules" ON public.fatigue_management_rules FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view fatigue violations" ON public.fatigue_violations FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can create violations" ON public.fatigue_violations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Managers can update violations" ON public.fatigue_violations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can view coverage snapshots" ON public.shift_coverage_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage coverage snapshots" ON public.shift_coverage_snapshots FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view cost projections" ON public.shift_cost_projections FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage cost projections" ON public.shift_cost_projections FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view their notifications" ON public.shift_notifications FOR SELECT TO authenticated USING (auth.uid() = employee_id);
CREATE POLICY "System can create notifications" ON public.shift_notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their notifications" ON public.shift_notifications FOR UPDATE TO authenticated USING (auth.uid() = employee_id);

CREATE POLICY "Users can view demand forecasts" ON public.shift_demand_forecasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage forecasts" ON public.shift_demand_forecasts FOR ALL TO authenticated USING (true);

-- Create indexes for performance
CREATE INDEX idx_shift_swap_requests_company ON public.shift_swap_requests(company_id);
CREATE INDEX idx_shift_swap_requests_requester ON public.shift_swap_requests(requester_id);
CREATE INDEX idx_shift_swap_requests_status ON public.shift_swap_requests(status);
CREATE INDEX idx_open_shifts_company_status ON public.open_shifts(company_id, status);
CREATE INDEX idx_open_shifts_date ON public.open_shifts(shift_date);
CREATE INDEX idx_open_shift_claims_shift ON public.open_shift_claims(open_shift_id);
CREATE INDEX idx_shift_bids_period ON public.shift_bids(bidding_period_id);
CREATE INDEX idx_shift_bids_employee ON public.shift_bids(employee_id);
CREATE INDEX idx_shift_templates_company ON public.shift_templates(company_id);
CREATE INDEX idx_rotation_patterns_company ON public.shift_rotation_patterns(company_id);
CREATE INDEX idx_rotation_assignments_employee ON public.employee_rotation_assignments(employee_id);
CREATE INDEX idx_fatigue_rules_company ON public.fatigue_management_rules(company_id);
CREATE INDEX idx_fatigue_violations_employee ON public.fatigue_violations(employee_id);
CREATE INDEX idx_coverage_snapshots_date ON public.shift_coverage_snapshots(snapshot_date);
CREATE INDEX idx_cost_projections_date ON public.shift_cost_projections(projection_date);
CREATE INDEX idx_shift_notifications_employee ON public.shift_notifications(employee_id, is_read);
CREATE INDEX idx_demand_forecasts_date ON public.shift_demand_forecasts(forecast_date);