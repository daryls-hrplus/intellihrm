
-- Payroll rules table (company rules, union bargaining unit rules)
CREATE TABLE public.payroll_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('company', 'union_bargaining_unit')),
  description TEXT,
  overtime_multiplier DECIMAL(4,2) DEFAULT 1.5,
  weekend_multiplier DECIMAL(4,2) DEFAULT 2.0,
  holiday_multiplier DECIMAL(4,2) DEFAULT 2.5,
  night_shift_multiplier DECIMAL(4,2) DEFAULT 1.25,
  break_deduction_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Employee work records (daily summary)
CREATE TABLE public.employee_work_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position_id UUID REFERENCES public.positions(id),
  pay_period_id UUID REFERENCES public.pay_periods(id),
  work_date DATE NOT NULL,
  day_type TEXT NOT NULL CHECK (day_type IN ('work_day', 'leave_day', 'holiday', 'weekend')),
  is_scheduled_day BOOLEAN DEFAULT true,
  payroll_rule_id UUID REFERENCES public.payroll_rules(id),
  total_hours_worked DECIMAL(5,2) DEFAULT 0,
  regular_hours DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, work_date)
);

-- Employee work periods (individual clock in/out entries including breaks)
CREATE TABLE public.employee_work_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_record_id UUID NOT NULL REFERENCES public.employee_work_records(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('regular', 'break', 'lunch', 'overtime')),
  clock_in TIME NOT NULL,
  clock_out TIME,
  payroll_rule_id UUID REFERENCES public.payroll_rules(id),
  hours_worked DECIMAL(5,2),
  is_paid BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee period allowances (for specific pay periods)
CREATE TABLE public.employee_period_allowances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pay_period_id UUID REFERENCES public.pay_periods(id),
  allowance_name TEXT NOT NULL,
  allowance_code TEXT,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_benefit_in_kind BOOLEAN DEFAULT false,
  is_taxable BOOLEAN DEFAULT true,
  tax_rate DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee period deductions (for specific pay periods)
CREATE TABLE public.employee_period_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pay_period_id UUID REFERENCES public.pay_periods(id),
  deduction_name TEXT NOT NULL,
  deduction_code TEXT,
  deduction_type TEXT CHECK (deduction_type IN ('statutory', 'voluntary', 'loan', 'garnishment', 'other')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_pretax BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payroll_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_work_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_work_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_period_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_period_deductions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view payroll rules" ON public.payroll_rules FOR SELECT USING (true);
CREATE POLICY "Users can manage payroll rules" ON public.payroll_rules FOR ALL USING (true);

CREATE POLICY "Users can view work records" ON public.employee_work_records FOR SELECT USING (true);
CREATE POLICY "Users can manage work records" ON public.employee_work_records FOR ALL USING (true);

CREATE POLICY "Users can view work periods" ON public.employee_work_periods FOR SELECT USING (true);
CREATE POLICY "Users can manage work periods" ON public.employee_work_periods FOR ALL USING (true);

CREATE POLICY "Users can view period allowances" ON public.employee_period_allowances FOR SELECT USING (true);
CREATE POLICY "Users can manage period allowances" ON public.employee_period_allowances FOR ALL USING (true);

CREATE POLICY "Users can view period deductions" ON public.employee_period_deductions FOR SELECT USING (true);
CREATE POLICY "Users can manage period deductions" ON public.employee_period_deductions FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_payroll_rules_company ON public.payroll_rules(company_id);
CREATE INDEX idx_work_records_employee ON public.employee_work_records(employee_id);
CREATE INDEX idx_work_records_pay_period ON public.employee_work_records(pay_period_id);
CREATE INDEX idx_work_periods_record ON public.employee_work_periods(work_record_id);
CREATE INDEX idx_period_allowances_employee ON public.employee_period_allowances(employee_id);
CREATE INDEX idx_period_deductions_employee ON public.employee_period_deductions(employee_id);
