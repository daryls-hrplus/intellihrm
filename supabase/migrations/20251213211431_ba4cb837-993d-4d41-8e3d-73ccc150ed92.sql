-- Geofence locations table
CREATE TABLE public.geofence_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 100,
  is_headquarters BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  requires_geofence BOOLEAN DEFAULT true,
  allow_clock_outside BOOLEAN DEFAULT false,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Employee location assignments (which locations an employee can clock from)
CREATE TABLE public.employee_geofence_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  geofence_id UUID NOT NULL REFERENCES public.geofence_locations(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add geolocation columns to time_clock_entries
ALTER TABLE public.time_clock_entries
ADD COLUMN IF NOT EXISTS clock_in_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS clock_in_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS clock_out_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS clock_out_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS clock_in_geofence_id UUID REFERENCES public.geofence_locations(id),
ADD COLUMN IF NOT EXISTS clock_out_geofence_id UUID REFERENCES public.geofence_locations(id),
ADD COLUMN IF NOT EXISTS clock_in_within_geofence BOOLEAN,
ADD COLUMN IF NOT EXISTS clock_out_within_geofence BOOLEAN,
ADD COLUMN IF NOT EXISTS geofence_violation_notes TEXT;

-- Geofence violation logs
CREATE TABLE public.geofence_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_entry_id UUID REFERENCES public.time_clock_entries(id) ON DELETE SET NULL,
  violation_type TEXT NOT NULL, -- 'clock_in_outside', 'clock_out_outside', 'no_location'
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  nearest_geofence_id UUID REFERENCES public.geofence_locations(id),
  distance_meters INTEGER,
  action_taken TEXT, -- 'allowed', 'blocked', 'flagged'
  notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.geofence_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_geofence_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_violations ENABLE ROW LEVEL SECURITY;

-- RLS policies for geofence_locations
CREATE POLICY "Admin and HR can manage geofence locations" ON public.geofence_locations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "Employees can view geofence locations" ON public.geofence_locations
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND company_id = geofence_locations.company_id)
);

-- RLS policies for employee_geofence_assignments
CREATE POLICY "Admin and HR can manage geofence assignments" ON public.employee_geofence_assignments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "Employees can view own geofence assignments" ON public.employee_geofence_assignments
FOR SELECT USING (employee_id = auth.uid());

-- RLS policies for geofence_violations
CREATE POLICY "Admin and HR can manage violations" ON public.geofence_violations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "Employees can view own violations" ON public.geofence_violations
FOR SELECT USING (employee_id = auth.uid());

-- Indexes
CREATE INDEX idx_geofence_locations_company ON public.geofence_locations(company_id);
CREATE INDEX idx_geofence_locations_active ON public.geofence_locations(is_active);
CREATE INDEX idx_employee_geofence_assignments_employee ON public.employee_geofence_assignments(employee_id);
CREATE INDEX idx_employee_geofence_assignments_geofence ON public.employee_geofence_assignments(geofence_id);
CREATE INDEX idx_geofence_violations_employee ON public.geofence_violations(employee_id);
CREATE INDEX idx_geofence_violations_time_entry ON public.geofence_violations(time_entry_id);

-- Trigger for updated_at
CREATE TRIGGER update_geofence_locations_updated_at
  BEFORE UPDATE ON public.geofence_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_geofence_assignments_updated_at
  BEFORE UPDATE ON public.employee_geofence_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance_meters(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS INTEGER
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  R CONSTANT INTEGER := 6371000; -- Earth radius in meters
  phi1 DECIMAL;
  phi2 DECIMAL;
  delta_phi DECIMAL;
  delta_lambda DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  phi1 := RADIANS(lat1);
  phi2 := RADIANS(lat2);
  delta_phi := RADIANS(lat2 - lat1);
  delta_lambda := RADIANS(lon2 - lon1);
  
  a := SIN(delta_phi/2) * SIN(delta_phi/2) +
       COS(phi1) * COS(phi2) *
       SIN(delta_lambda/2) * SIN(delta_lambda/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN (R * c)::INTEGER;
END;
$$;

-- Function to check if point is within any assigned geofence
CREATE OR REPLACE FUNCTION public.check_geofence(
  p_employee_id UUID,
  p_latitude DECIMAL,
  p_longitude DECIMAL
) RETURNS TABLE(
  within_geofence BOOLEAN,
  geofence_id UUID,
  geofence_name TEXT,
  distance_meters INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_geofence RECORD;
  v_distance INTEGER;
  v_nearest_id UUID;
  v_nearest_name TEXT;
  v_min_distance INTEGER := 999999999;
  v_is_within BOOLEAN := false;
BEGIN
  -- Check all assigned geofences for this employee
  FOR v_geofence IN
    SELECT gl.id, gl.name, gl.latitude, gl.longitude, gl.radius_meters
    FROM geofence_locations gl
    JOIN employee_geofence_assignments ega ON ega.geofence_id = gl.id
    WHERE ega.employee_id = p_employee_id
      AND gl.is_active = true
      AND ega.effective_date <= CURRENT_DATE
      AND (ega.end_date IS NULL OR ega.end_date >= CURRENT_DATE)
      AND gl.start_date <= CURRENT_DATE
      AND (gl.end_date IS NULL OR gl.end_date >= CURRENT_DATE)
  LOOP
    v_distance := calculate_distance_meters(p_latitude, p_longitude, v_geofence.latitude, v_geofence.longitude);
    
    IF v_distance < v_min_distance THEN
      v_min_distance := v_distance;
      v_nearest_id := v_geofence.id;
      v_nearest_name := v_geofence.name;
    END IF;
    
    IF v_distance <= v_geofence.radius_meters THEN
      v_is_within := true;
      RETURN QUERY SELECT true, v_geofence.id, v_geofence.name, v_distance;
      RETURN;
    END IF;
  END LOOP;
  
  -- Not within any geofence, return nearest
  RETURN QUERY SELECT false, v_nearest_id, v_nearest_name, v_min_distance;
END;
$$;