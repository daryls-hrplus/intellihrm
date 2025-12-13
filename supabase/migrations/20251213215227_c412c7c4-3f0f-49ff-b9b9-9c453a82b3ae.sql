
-- Timeclock Devices
CREATE TABLE public.timeclock_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  device_code TEXT NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('biometric', 'card', 'pin', 'facial', 'mobile')),
  location_id UUID REFERENCES public.geofence_locations(id),
  ip_address TEXT,
  serial_number TEXT,
  manufacturer TEXT,
  model TEXT,
  firmware_version TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_heartbeat_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'unknown' CHECK (sync_status IN ('online', 'offline', 'syncing', 'error', 'unknown')),
  pending_punches INTEGER DEFAULT 0,
  api_key TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, device_code)
);

-- Biometric Templates
CREATE TABLE public.employee_biometric_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('fingerprint', 'face', 'iris', 'palm')),
  template_data TEXT NOT NULL,
  template_quality INTEGER,
  finger_position TEXT,
  is_primary BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  enrolled_by UUID REFERENCES public.profiles(id),
  device_id UUID REFERENCES public.timeclock_devices(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Device Punch Queue (for offline punches)
CREATE TABLE public.timeclock_punch_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES public.timeclock_devices(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id),
  employee_badge TEXT,
  punch_time TIMESTAMPTZ NOT NULL,
  punch_type TEXT NOT NULL CHECK (punch_type IN ('clock_in', 'clock_out', 'break_start', 'break_end')),
  verification_method TEXT,
  raw_data JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  time_clock_entry_id UUID REFERENCES public.time_clock_entries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendance Policies
CREATE TABLE public.attendance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  grace_period_minutes INTEGER DEFAULT 0,
  late_threshold_minutes INTEGER DEFAULT 15,
  early_departure_threshold_minutes INTEGER DEFAULT 15,
  auto_deduct_late BOOLEAN DEFAULT false,
  late_deduction_minutes INTEGER DEFAULT 0,
  round_clock_in TEXT DEFAULT 'none' CHECK (round_clock_in IN ('none', 'nearest_5', 'nearest_15', 'nearest_30', 'up', 'down')),
  round_clock_out TEXT DEFAULT 'none' CHECK (round_clock_out IN ('none', 'nearest_5', 'nearest_15', 'nearest_30', 'up', 'down')),
  require_photo_clock_in BOOLEAN DEFAULT false,
  require_photo_clock_out BOOLEAN DEFAULT false,
  require_geolocation BOOLEAN DEFAULT false,
  max_daily_hours NUMERIC(4,2) DEFAULT 24,
  min_break_duration_minutes INTEGER DEFAULT 0,
  auto_clock_out_hours NUMERIC(4,2),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Employee Policy Assignments
CREATE TABLE public.employee_attendance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.attendance_policies(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendance Exceptions (missing punches, corrections)
CREATE TABLE public.attendance_exceptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  exception_type TEXT NOT NULL CHECK (exception_type IN ('missing_clock_in', 'missing_clock_out', 'late_arrival', 'early_departure', 'long_break', 'short_hours', 'overtime_unapproved', 'manual_correction')),
  original_time TIMESTAMPTZ,
  corrected_time TIMESTAMPTZ,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'auto_resolved')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  time_clock_entry_id UUID REFERENCES public.time_clock_entries(id),
  workflow_instance_id UUID REFERENCES public.workflow_instances(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Punch Import Batches
CREATE TABLE public.punch_import_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  source_system TEXT,
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  success_records INTEGER DEFAULT 0,
  error_records INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_log JSONB DEFAULT '[]',
  imported_by UUID REFERENCES public.profiles(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.timeclock_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_biometric_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeclock_punch_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_attendance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_import_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage timeclock devices" ON public.timeclock_devices
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins can manage biometric templates" ON public.employee_biometric_templates
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Users can view own templates" ON public.employee_biometric_templates
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins can manage punch queue" ON public.timeclock_punch_queue
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins can manage attendance policies" ON public.attendance_policies
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Users can view policies" ON public.attendance_policies
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage employee policy assignments" ON public.employee_attendance_policies
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Users can view own policy assignments" ON public.employee_attendance_policies
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins can manage exceptions" ON public.attendance_exceptions
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Users can view own exceptions" ON public.attendance_exceptions
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Users can create own exceptions" ON public.attendance_exceptions
  FOR INSERT WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Admins can manage import batches" ON public.punch_import_batches
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Indexes
CREATE INDEX idx_timeclock_devices_company ON public.timeclock_devices(company_id);
CREATE INDEX idx_biometric_templates_employee ON public.employee_biometric_templates(employee_id);
CREATE INDEX idx_punch_queue_device ON public.timeclock_punch_queue(device_id);
CREATE INDEX idx_punch_queue_processed ON public.timeclock_punch_queue(processed);
CREATE INDEX idx_attendance_policies_company ON public.attendance_policies(company_id);
CREATE INDEX idx_attendance_exceptions_employee ON public.attendance_exceptions(employee_id);
CREATE INDEX idx_attendance_exceptions_date ON public.attendance_exceptions(exception_date);
CREATE INDEX idx_attendance_exceptions_status ON public.attendance_exceptions(status);

-- Triggers
CREATE TRIGGER update_timeclock_devices_updated_at BEFORE UPDATE ON public.timeclock_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_biometric_templates_updated_at BEFORE UPDATE ON public.employee_biometric_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attendance_policies_updated_at BEFORE UPDATE ON public.attendance_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_attendance_policies_updated_at BEFORE UPDATE ON public.employee_attendance_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attendance_exceptions_updated_at BEFORE UPDATE ON public.attendance_exceptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_clock_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeclock_punch_queue;
