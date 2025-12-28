-- Split Shift Support: Add shift sequence to time_clock_entries
ALTER TABLE public.time_clock_entries 
ADD COLUMN IF NOT EXISTS shift_sequence integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_split_shift boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_entry_id uuid REFERENCES public.time_clock_entries(id);

-- Shift Differentials Configuration
CREATE TABLE IF NOT EXISTS public.shift_differentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  differential_type text NOT NULL CHECK (differential_type IN ('night', 'weekend', 'holiday', 'evening', 'early_morning', 'custom')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  applies_to_days text[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  multiplier numeric(4,2) DEFAULT 1.0,
  flat_amount numeric(10,2) DEFAULT 0,
  calculation_method text DEFAULT 'multiplier' CHECK (calculation_method IN ('multiplier', 'flat', 'both')),
  min_hours_for_differential numeric(4,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 1,
  effective_start_date date,
  effective_end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Geofence Locations
CREATE TABLE IF NOT EXISTS public.geofence_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  address text,
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  radius_meters integer DEFAULT 100,
  location_type text DEFAULT 'office' CHECK (location_type IN ('office', 'warehouse', 'remote_site', 'client_site', 'home', 'other')),
  is_active boolean DEFAULT true,
  requires_wifi_validation boolean DEFAULT false,
  allowed_wifi_ssids text[],
  departments uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Employee Location Assignments
CREATE TABLE IF NOT EXISTS public.employee_geofence_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.profiles(id) NOT NULL,
  geofence_location_id uuid REFERENCES public.geofence_locations(id) NOT NULL,
  is_primary boolean DEFAULT false,
  effective_start_date date DEFAULT CURRENT_DATE,
  effective_end_date date,
  allow_remote_clockin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, geofence_location_id)
);

-- Geofence Validation Logs
CREATE TABLE IF NOT EXISTS public.geofence_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_clock_entry_id uuid REFERENCES public.time_clock_entries(id),
  employee_id uuid REFERENCES public.profiles(id) NOT NULL,
  punch_type text NOT NULL,
  captured_latitude numeric(10,7),
  captured_longitude numeric(10,7),
  captured_accuracy_meters numeric(8,2),
  matched_location_id uuid REFERENCES public.geofence_locations(id),
  distance_from_location_meters numeric(10,2),
  validation_status text DEFAULT 'pending' CHECK (validation_status IN ('valid', 'invalid', 'pending', 'manual_override', 'remote_allowed')),
  validation_message text,
  override_by uuid REFERENCES public.profiles(id),
  override_reason text,
  created_at timestamptz DEFAULT now()
);

-- Face Verification Templates (stored face encodings)
CREATE TABLE IF NOT EXISTS public.face_verification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.profiles(id) NOT NULL,
  template_data text NOT NULL, -- Base64 encoded face template
  photo_url text,
  is_primary boolean DEFAULT true,
  is_active boolean DEFAULT true,
  enrolled_at timestamptz DEFAULT now(),
  enrolled_by uuid REFERENCES public.profiles(id),
  last_verified_at timestamptz,
  verification_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Face Verification Logs
CREATE TABLE IF NOT EXISTS public.face_verification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_clock_entry_id uuid REFERENCES public.time_clock_entries(id),
  employee_id uuid REFERENCES public.profiles(id) NOT NULL,
  punch_type text NOT NULL,
  captured_photo_url text,
  matched_template_id uuid REFERENCES public.face_verification_templates(id),
  confidence_score numeric(5,4),
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('verified', 'failed', 'pending', 'manual_override', 'skipped')),
  failure_reason text,
  device_info jsonb,
  override_by uuid REFERENCES public.profiles(id),
  override_reason text,
  created_at timestamptz DEFAULT now()
);

-- Update time_clock_entries with geolocation and face verification fields
ALTER TABLE public.time_clock_entries 
ADD COLUMN IF NOT EXISTS clock_in_latitude numeric(10,7),
ADD COLUMN IF NOT EXISTS clock_in_longitude numeric(10,7),
ADD COLUMN IF NOT EXISTS clock_in_accuracy_meters numeric(8,2),
ADD COLUMN IF NOT EXISTS clock_out_latitude numeric(10,7),
ADD COLUMN IF NOT EXISTS clock_out_longitude numeric(10,7),
ADD COLUMN IF NOT EXISTS clock_out_accuracy_meters numeric(8,2),
ADD COLUMN IF NOT EXISTS clock_in_geofence_status text,
ADD COLUMN IF NOT EXISTS clock_out_geofence_status text,
ADD COLUMN IF NOT EXISTS clock_in_face_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS clock_out_face_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS clock_in_photo_url text,
ADD COLUMN IF NOT EXISTS clock_out_photo_url text,
ADD COLUMN IF NOT EXISTS shift_differential_id uuid REFERENCES public.shift_differentials(id),
ADD COLUMN IF NOT EXISTS shift_differential_amount numeric(10,2) DEFAULT 0;

-- Enable RLS
ALTER TABLE public.shift_differentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_geofence_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_verification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shift_differentials
CREATE POLICY "Users can view shift differentials for their company"
ON public.shift_differentials FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage shift differentials"
ON public.shift_differentials FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for geofence_locations
CREATE POLICY "Users can view geofence locations for their company"
ON public.geofence_locations FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage geofence locations"
ON public.geofence_locations FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for employee_geofence_assignments
CREATE POLICY "Users can view their own geofence assignments"
ON public.employee_geofence_assignments FOR SELECT
USING (employee_id = auth.uid() OR employee_id IN (
  SELECT id FROM public.profiles WHERE company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Admins can manage geofence assignments"
ON public.employee_geofence_assignments FOR ALL
USING (employee_id IN (
  SELECT id FROM public.profiles WHERE company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
));

-- RLS Policies for geofence_validations
CREATE POLICY "Users can view geofence validations for their company"
ON public.geofence_validations FOR SELECT
USING (employee_id IN (
  SELECT id FROM public.profiles WHERE company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "System can insert geofence validations"
ON public.geofence_validations FOR INSERT
WITH CHECK (true);

-- RLS Policies for face_verification_templates
CREATE POLICY "Users can view their own face templates"
ON public.face_verification_templates FOR SELECT
USING (employee_id = auth.uid() OR employee_id IN (
  SELECT id FROM public.profiles WHERE company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Admins can manage face templates"
ON public.face_verification_templates FOR ALL
USING (employee_id IN (
  SELECT id FROM public.profiles WHERE company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
));

-- RLS Policies for face_verification_logs
CREATE POLICY "Users can view face verification logs for their company"
ON public.face_verification_logs FOR SELECT
USING (employee_id IN (
  SELECT id FROM public.profiles WHERE company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "System can insert face verification logs"
ON public.face_verification_logs FOR INSERT
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shift_differentials_company ON public.shift_differentials(company_id);
CREATE INDEX IF NOT EXISTS idx_geofence_locations_company ON public.geofence_locations(company_id);
CREATE INDEX IF NOT EXISTS idx_geofence_locations_coords ON public.geofence_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_employee_geofence_employee ON public.employee_geofence_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_geofence_validations_entry ON public.geofence_validations(time_clock_entry_id);
CREATE INDEX IF NOT EXISTS idx_face_templates_employee ON public.face_verification_templates(employee_id);
CREATE INDEX IF NOT EXISTS idx_face_logs_entry ON public.face_verification_logs(time_clock_entry_id);