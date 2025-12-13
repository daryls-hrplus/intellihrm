
-- Leave Types table (user-defined leave categories)
CREATE TABLE public.leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  accrual_unit TEXT NOT NULL DEFAULT 'days' CHECK (accrual_unit IN ('days', 'hours')),
  is_accrual_based BOOLEAN NOT NULL DEFAULT true,
  default_annual_entitlement NUMERIC DEFAULT 0,
  allows_negative_balance BOOLEAN NOT NULL DEFAULT false,
  max_negative_balance NUMERIC DEFAULT 0,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  min_request_amount NUMERIC DEFAULT 0.5,
  max_consecutive_days INTEGER,
  advance_notice_days INTEGER DEFAULT 0,
  can_be_encashed BOOLEAN NOT NULL DEFAULT false,
  encashment_rate NUMERIC DEFAULT 1,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Leave Accrual Rules (tiered accrual based on service, grade, status)
CREATE TABLE public.leave_accrual_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  accrual_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (accrual_frequency IN ('monthly', 'annually', 'bi_weekly', 'weekly')),
  accrual_amount NUMERIC NOT NULL DEFAULT 0,
  years_of_service_min INTEGER DEFAULT 0,
  years_of_service_max INTEGER,
  salary_grade_id UUID REFERENCES public.salary_grades(id),
  employee_status TEXT,
  employee_type TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leave Rollover Rules
CREATE TABLE public.leave_rollover_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  max_rollover_amount NUMERIC,
  max_balance_cap NUMERIC,
  rollover_expiry_months INTEGER,
  forfeit_unused BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, leave_type_id)
);

-- Leave Balances (per employee, per leave type, per year)
CREATE TABLE public.leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  opening_balance NUMERIC NOT NULL DEFAULT 0,
  accrued_amount NUMERIC NOT NULL DEFAULT 0,
  used_amount NUMERIC NOT NULL DEFAULT 0,
  adjustment_amount NUMERIC NOT NULL DEFAULT 0,
  carried_forward NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC GENERATED ALWAYS AS (opening_balance + accrued_amount + carried_forward + adjustment_amount - used_amount) STORED,
  last_accrual_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- Leave Requests
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  request_number TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_half TEXT CHECK (start_half IN ('full', 'first_half', 'second_half')),
  end_half TEXT CHECK (end_half IN ('full', 'first_half', 'second_half')),
  duration NUMERIC NOT NULL,
  reason TEXT,
  contact_during_leave TEXT,
  handover_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'cancelled', 'withdrawn')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  workflow_instance_id UUID REFERENCES public.workflow_instances(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leave Balance Adjustments (for manual adjustments, corrections)
CREATE TABLE public.leave_balance_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  balance_id UUID NOT NULL REFERENCES public.leave_balances(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('credit', 'debit', 'correction', 'encashment', 'forfeit')),
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  adjusted_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leave Holidays (company holidays that don't count as leave)
CREATE TABLE public.leave_holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  holiday_date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  is_half_day BOOLEAN NOT NULL DEFAULT false,
  applies_to_all BOOLEAN NOT NULL DEFAULT true,
  department_ids UUID[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, holiday_date)
);

-- Enable RLS on all tables
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_accrual_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_rollover_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balance_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_holidays ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_types
CREATE POLICY "Authenticated users can view leave types" ON public.leave_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage leave types" ON public.leave_types FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for leave_accrual_rules
CREATE POLICY "Authenticated users can view accrual rules" ON public.leave_accrual_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage accrual rules" ON public.leave_accrual_rules FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for leave_rollover_rules
CREATE POLICY "Authenticated users can view rollover rules" ON public.leave_rollover_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage rollover rules" ON public.leave_rollover_rules FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for leave_balances
CREATE POLICY "Users can view own leave balances" ON public.leave_balances FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all leave balances" ON public.leave_balances FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admins can manage all leave balances" ON public.leave_balances FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for leave_requests
CREATE POLICY "Users can view own leave requests" ON public.leave_requests FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Users can create own leave requests" ON public.leave_requests FOR INSERT WITH CHECK (auth.uid() = employee_id);
CREATE POLICY "Users can update own pending requests" ON public.leave_requests FOR UPDATE USING (auth.uid() = employee_id AND status IN ('draft', 'pending'));
CREATE POLICY "Admins can view all leave requests" ON public.leave_requests FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admins can manage all leave requests" ON public.leave_requests FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for leave_balance_adjustments
CREATE POLICY "Users can view own adjustments" ON public.leave_balance_adjustments FOR SELECT USING (EXISTS (SELECT 1 FROM leave_balances lb WHERE lb.id = balance_id AND lb.employee_id = auth.uid()));
CREATE POLICY "Admins can manage adjustments" ON public.leave_balance_adjustments FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for leave_holidays
CREATE POLICY "Authenticated users can view holidays" ON public.leave_holidays FOR SELECT USING (true);
CREATE POLICY "Admins can manage holidays" ON public.leave_holidays FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Function to generate leave request number
CREATE OR REPLACE FUNCTION generate_leave_request_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.request_number := 'LR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_leave_request_number
  BEFORE INSERT ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION generate_leave_request_number();

-- Indexes for performance
CREATE INDEX idx_leave_balances_employee ON public.leave_balances(employee_id);
CREATE INDEX idx_leave_balances_year ON public.leave_balances(year);
CREATE INDEX idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON public.leave_requests(start_date, end_date);
CREATE INDEX idx_leave_accrual_rules_leave_type ON public.leave_accrual_rules(leave_type_id);

-- Insert default leave types
INSERT INTO public.leave_types (company_id, name, code, description, accrual_unit, default_annual_entitlement, color)
SELECT c.id, 'Annual Leave', 'ANNUAL', 'Paid vacation days', 'days', 20, '#10B981'
FROM public.companies c
WHERE c.is_active = true
ON CONFLICT DO NOTHING;

INSERT INTO public.leave_types (company_id, name, code, description, accrual_unit, is_accrual_based, default_annual_entitlement, color)
SELECT c.id, 'Sick Leave', 'SICK', 'Medical sick days', 'days', false, 10, '#EF4444'
FROM public.companies c
WHERE c.is_active = true
ON CONFLICT DO NOTHING;

INSERT INTO public.leave_types (company_id, name, code, description, accrual_unit, is_accrual_based, default_annual_entitlement, color)
SELECT c.id, 'Personal Leave', 'PERSONAL', 'Personal time off', 'days', false, 3, '#8B5CF6'
FROM public.companies c
WHERE c.is_active = true
ON CONFLICT DO NOTHING;
