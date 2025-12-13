-- Shifts table: Define work shifts
CREATE TABLE public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  crosses_midnight BOOLEAN DEFAULT false,
  break_duration_minutes INTEGER DEFAULT 60,
  minimum_hours DECIMAL(4,2) DEFAULT 8,
  is_overnight BOOLEAN DEFAULT false,
  color VARCHAR(7) DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Shift rounding rules
CREATE TABLE public.shift_rounding_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('clock_in', 'clock_out', 'both')),
  rounding_interval INTEGER NOT NULL DEFAULT 15,
  rounding_direction VARCHAR(20) NOT NULL CHECK (rounding_direction IN ('nearest', 'up', 'down', 'employer_favor')),
  grace_period_minutes INTEGER DEFAULT 0,
  grace_period_direction VARCHAR(20) CHECK (grace_period_direction IN ('early', 'late', 'both')),
  apply_to_overtime BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shift payment rules (differentials/premiums)
CREATE TABLE public.shift_payment_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT,
  payment_type VARCHAR(30) NOT NULL CHECK (payment_type IN ('percentage', 'fixed_hourly', 'fixed_daily')),
  amount DECIMAL(10,2) NOT NULL,
  applies_to VARCHAR(30) NOT NULL CHECK (applies_to IN ('all_hours', 'overtime_only', 'regular_only', 'weekend', 'holiday')),
  day_of_week INTEGER[],
  start_time TIME,
  end_time TIME,
  minimum_hours_threshold DECIMAL(4,2),
  is_taxable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Employee shift assignments
CREATE TABLE public.employee_shift_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  end_date DATE,
  is_primary BOOLEAN DEFAULT true,
  rotation_pattern VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add shift columns to time_clock_entries
ALTER TABLE public.time_clock_entries 
ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.shifts(id),
ADD COLUMN IF NOT EXISTS rounded_clock_in TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rounded_clock_out TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shift_differential DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rounding_rule_applied UUID REFERENCES public.shift_rounding_rules(id);

-- Enable RLS
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_rounding_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_payment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_shift_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shifts (using user_roles table)
CREATE POLICY "Users can view shifts in their company" ON public.shifts
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can insert shifts" ON public.shifts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can update shifts" ON public.shifts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can delete shifts" ON public.shifts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for rounding rules
CREATE POLICY "Users can view rounding rules" ON public.shift_rounding_rules
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can insert rounding rules" ON public.shift_rounding_rules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can update rounding rules" ON public.shift_rounding_rules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can delete rounding rules" ON public.shift_rounding_rules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for payment rules
CREATE POLICY "Users can view payment rules" ON public.shift_payment_rules
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can insert payment rules" ON public.shift_payment_rules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can update payment rules" ON public.shift_payment_rules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can delete payment rules" ON public.shift_payment_rules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for employee shift assignments
CREATE POLICY "Users can view their shift assignments" ON public.employee_shift_assignments
  FOR SELECT USING (
    employee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can insert shift assignments" ON public.employee_shift_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can update shift assignments" ON public.employee_shift_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can delete shift assignments" ON public.employee_shift_assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

-- Indexes
CREATE INDEX idx_shifts_company ON public.shifts(company_id);
CREATE INDEX idx_shift_rounding_rules_company ON public.shift_rounding_rules(company_id);
CREATE INDEX idx_shift_rounding_rules_shift ON public.shift_rounding_rules(shift_id);
CREATE INDEX idx_shift_payment_rules_company ON public.shift_payment_rules(company_id);
CREATE INDEX idx_shift_payment_rules_shift ON public.shift_payment_rules(shift_id);
CREATE INDEX idx_employee_shift_assignments_employee ON public.employee_shift_assignments(employee_id);
CREATE INDEX idx_employee_shift_assignments_shift ON public.employee_shift_assignments(shift_id);

-- Function to apply rounding rules
CREATE OR REPLACE FUNCTION public.apply_time_rounding(
  p_time TIMESTAMP WITH TIME ZONE,
  p_interval INTEGER,
  p_direction VARCHAR(20),
  p_grace_minutes INTEGER DEFAULT 0
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  v_minutes INTEGER;
  v_remainder INTEGER;
  v_rounded_minutes INTEGER;
BEGIN
  v_minutes := EXTRACT(EPOCH FROM p_time)::INTEGER / 60;
  v_remainder := v_minutes % p_interval;
  
  IF v_remainder <= p_grace_minutes THEN
    v_remainder := 0;
  ELSIF v_remainder >= (p_interval - p_grace_minutes) THEN
    v_remainder := p_interval;
  END IF;
  
  CASE p_direction
    WHEN 'nearest' THEN
      IF v_remainder < (p_interval / 2) THEN
        v_rounded_minutes := v_minutes - v_remainder;
      ELSE
        v_rounded_minutes := v_minutes + (p_interval - v_remainder);
      END IF;
    WHEN 'up' THEN
      IF v_remainder > 0 THEN
        v_rounded_minutes := v_minutes + (p_interval - v_remainder);
      ELSE
        v_rounded_minutes := v_minutes;
      END IF;
    WHEN 'down' THEN
      v_rounded_minutes := v_minutes - v_remainder;
    WHEN 'employer_favor' THEN
      v_rounded_minutes := v_minutes - v_remainder;
    ELSE
      v_rounded_minutes := v_minutes;
  END CASE;
  
  RETURN TIMESTAMP WITH TIME ZONE 'epoch' + (v_rounded_minutes * 60) * INTERVAL '1 second';
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Function to calculate shift differential
CREATE OR REPLACE FUNCTION public.calculate_shift_differential(
  p_shift_id UUID,
  p_clock_in TIMESTAMP WITH TIME ZONE,
  p_regular_hours DECIMAL,
  p_overtime_hours DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_differential DECIMAL := 0;
  v_rule RECORD;
  v_applicable_hours DECIMAL;
  v_day_of_week INTEGER;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_clock_in);
  
  FOR v_rule IN 
    SELECT * FROM public.shift_payment_rules 
    WHERE (shift_id = p_shift_id OR shift_id IS NULL)
    AND is_active = true
    AND start_date <= CURRENT_DATE
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    AND (day_of_week IS NULL OR v_day_of_week = ANY(day_of_week))
    ORDER BY priority DESC
  LOOP
    CASE v_rule.applies_to
      WHEN 'all_hours' THEN
        v_applicable_hours := p_regular_hours + p_overtime_hours;
      WHEN 'overtime_only' THEN
        v_applicable_hours := p_overtime_hours;
      WHEN 'regular_only' THEN
        v_applicable_hours := p_regular_hours;
      ELSE
        v_applicable_hours := p_regular_hours + p_overtime_hours;
    END CASE;
    
    IF v_rule.minimum_hours_threshold IS NOT NULL AND 
       (p_regular_hours + p_overtime_hours) < v_rule.minimum_hours_threshold THEN
      CONTINUE;
    END IF;
    
    CASE v_rule.payment_type
      WHEN 'percentage' THEN
        v_differential := v_differential + (v_applicable_hours * v_rule.amount / 100);
      WHEN 'fixed_hourly' THEN
        v_differential := v_differential + (v_applicable_hours * v_rule.amount);
      WHEN 'fixed_daily' THEN
        v_differential := v_differential + v_rule.amount;
    END CASE;
  END LOOP;
  
  RETURN v_differential;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;