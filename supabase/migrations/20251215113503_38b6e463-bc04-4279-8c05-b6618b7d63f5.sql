
-- Pay Spines table (the overall spine definition)
CREATE TABLE public.pay_spines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Spinal Points table (individual points on the spine)
CREATE TABLE public.spinal_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pay_spine_id UUID NOT NULL REFERENCES public.pay_spines(id) ON DELETE CASCADE,
  point_number INTEGER NOT NULL,
  annual_salary NUMERIC(15,2) NOT NULL,
  hourly_rate NUMERIC(10,4),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pay_spine_id, point_number, effective_date)
);

-- Link salary grades to spinal point ranges (optional)
CREATE TABLE public.salary_grade_spinal_ranges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salary_grade_id UUID NOT NULL REFERENCES public.salary_grades(id) ON DELETE CASCADE,
  pay_spine_id UUID NOT NULL REFERENCES public.pay_spines(id) ON DELETE CASCADE,
  min_point INTEGER NOT NULL,
  max_point INTEGER NOT NULL,
  entry_point INTEGER,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_point_range CHECK (min_point <= max_point),
  CONSTRAINT valid_entry_point CHECK (entry_point IS NULL OR (entry_point >= min_point AND entry_point <= max_point))
);

-- Employee spinal point assignments
CREATE TABLE public.employee_spinal_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  spinal_point_id UUID NOT NULL REFERENCES public.spinal_points(id) ON DELETE RESTRICT,
  effective_date DATE NOT NULL,
  end_date DATE,
  reason TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Spinal point increment history
CREATE TABLE public.spinal_point_increments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_point_id UUID REFERENCES public.spinal_points(id),
  to_point_id UUID NOT NULL REFERENCES public.spinal_points(id),
  increment_date DATE NOT NULL,
  increment_type TEXT NOT NULL DEFAULT 'annual',
  reason TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pay_spines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spinal_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_grade_spinal_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_spinal_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spinal_point_increments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pay_spines
CREATE POLICY "Users can view pay spines for their company" ON public.pay_spines
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

CREATE POLICY "Admins can manage pay spines" ON public.pay_spines
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

-- RLS Policies for spinal_points
CREATE POLICY "Users can view spinal points" ON public.spinal_points
  FOR SELECT USING (
    pay_spine_id IN (
      SELECT ps.id FROM public.pay_spines ps
      WHERE ps.company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
    )
  );

CREATE POLICY "Admins can manage spinal points" ON public.spinal_points
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

-- RLS Policies for salary_grade_spinal_ranges
CREATE POLICY "Users can view grade spinal ranges" ON public.salary_grade_spinal_ranges
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
    OR salary_grade_id IN (SELECT id FROM public.salary_grades WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can manage grade spinal ranges" ON public.salary_grade_spinal_ranges
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

-- RLS Policies for employee_spinal_points
CREATE POLICY "Users can view own spinal points" ON public.employee_spinal_points
  FOR SELECT USING (
    employee_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

CREATE POLICY "Admins can manage employee spinal points" ON public.employee_spinal_points
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

-- RLS Policies for spinal_point_increments
CREATE POLICY "Users can view own increments" ON public.spinal_point_increments
  FOR SELECT USING (
    employee_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

CREATE POLICY "Admins can manage increments" ON public.spinal_point_increments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

-- Indexes for performance
CREATE INDEX idx_spinal_points_spine ON public.spinal_points(pay_spine_id);
CREATE INDEX idx_spinal_points_number ON public.spinal_points(point_number);
CREATE INDEX idx_employee_spinal_points_employee ON public.employee_spinal_points(employee_id);
CREATE INDEX idx_spinal_point_increments_employee ON public.spinal_point_increments(employee_id);

-- Triggers for updated_at
CREATE TRIGGER update_pay_spines_updated_at BEFORE UPDATE ON public.pay_spines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spinal_points_updated_at BEFORE UPDATE ON public.spinal_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salary_grade_spinal_ranges_updated_at BEFORE UPDATE ON public.salary_grade_spinal_ranges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_spinal_points_updated_at BEFORE UPDATE ON public.employee_spinal_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
