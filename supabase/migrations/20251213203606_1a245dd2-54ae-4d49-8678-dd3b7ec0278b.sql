
-- Work Schedules/Shifts table
CREATE TABLE public.work_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  schedule_type TEXT NOT NULL DEFAULT 'fixed', -- fixed, rotating, flexible
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 60,
  work_days JSONB DEFAULT '["monday","tuesday","wednesday","thursday","friday"]',
  is_overnight BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Employee Schedule Assignments
CREATE TABLE public.employee_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.work_schedules(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  is_primary BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Time Clock Entries
CREATE TABLE public.time_clock_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  clock_in_location TEXT,
  clock_out_location TEXT,
  clock_in_method TEXT DEFAULT 'web', -- web, mobile, biometric, manual
  clock_out_method TEXT,
  schedule_id UUID REFERENCES public.work_schedules(id),
  break_start TIMESTAMP WITH TIME ZONE,
  break_end TIMESTAMP WITH TIME ZONE,
  break_duration_minutes INTEGER DEFAULT 0,
  total_hours NUMERIC(5,2),
  regular_hours NUMERIC(5,2),
  overtime_hours NUMERIC(5,2),
  status TEXT DEFAULT 'active', -- active, completed, adjusted, voided
  notes TEXT,
  adjusted_by UUID REFERENCES public.profiles(id),
  adjusted_at TIMESTAMP WITH TIME ZONE,
  adjustment_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Overtime Requests
CREATE TABLE public.overtime_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_date DATE NOT NULL,
  planned_start TIMESTAMP WITH TIME ZONE NOT NULL,
  planned_end TIMESTAMP WITH TIME ZONE NOT NULL,
  planned_hours NUMERIC(5,2) NOT NULL,
  actual_hours NUMERIC(5,2),
  overtime_type TEXT DEFAULT 'regular', -- regular, weekend, holiday, emergency
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed, cancelled
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Attendance Summary (daily aggregated view)
CREATE TABLE public.attendance_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  schedule_id UUID REFERENCES public.work_schedules(id),
  scheduled_start TIME,
  scheduled_end TIME,
  actual_clock_in TIMESTAMP WITH TIME ZONE,
  actual_clock_out TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'present', -- present, absent, late, early_departure, half_day, leave, holiday
  late_minutes INTEGER DEFAULT 0,
  early_departure_minutes INTEGER DEFAULT 0,
  total_work_hours NUMERIC(5,2) DEFAULT 0,
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  break_duration_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, work_date)
);

-- Enable RLS
ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_clock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_schedules
CREATE POLICY "Users can view work schedules" ON public.work_schedules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage work schedules" ON public.work_schedules
  FOR ALL USING (true);

-- RLS Policies for employee_schedules
CREATE POLICY "Users can view employee schedules" ON public.employee_schedules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage employee schedules" ON public.employee_schedules
  FOR ALL USING (true);

-- RLS Policies for time_clock_entries
CREATE POLICY "Users can view time entries" ON public.time_clock_entries
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own time entries" ON public.time_clock_entries
  FOR ALL USING (true);

-- RLS Policies for overtime_requests
CREATE POLICY "Users can view overtime requests" ON public.overtime_requests
  FOR SELECT USING (true);

CREATE POLICY "Users can manage overtime requests" ON public.overtime_requests
  FOR ALL USING (true);

-- RLS Policies for attendance_summary
CREATE POLICY "Users can view attendance summary" ON public.attendance_summary
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage attendance summary" ON public.attendance_summary
  FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_time_clock_employee ON public.time_clock_entries(employee_id);
CREATE INDEX idx_time_clock_company ON public.time_clock_entries(company_id);
CREATE INDEX idx_time_clock_date ON public.time_clock_entries(clock_in);
CREATE INDEX idx_overtime_employee ON public.overtime_requests(employee_id);
CREATE INDEX idx_overtime_status ON public.overtime_requests(status);
CREATE INDEX idx_attendance_employee_date ON public.attendance_summary(employee_id, work_date);
CREATE INDEX idx_employee_schedules_employee ON public.employee_schedules(employee_id);
