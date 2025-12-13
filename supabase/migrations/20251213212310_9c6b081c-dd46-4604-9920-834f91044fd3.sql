-- Add face capture fields to time_clock_entries
ALTER TABLE public.time_clock_entries 
ADD COLUMN IF NOT EXISTS clock_in_photo_url text,
ADD COLUMN IF NOT EXISTS clock_out_photo_url text,
ADD COLUMN IF NOT EXISTS face_verified boolean DEFAULT false;

-- Create employee face enrollments table for reference photos
CREATE TABLE IF NOT EXISTS public.employee_face_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  enrolled_by uuid REFERENCES auth.users(id),
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(company_id, employee_id)
);

-- Enable RLS
ALTER TABLE public.employee_face_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS policies for face enrollments
CREATE POLICY "Users can view face enrollments in their company"
  ON public.employee_face_enrollments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = employee_face_enrollments.company_id)
  );

CREATE POLICY "Admins can manage face enrollments"
  ON public.employee_face_enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

-- Add geofence settings for face capture requirement
ALTER TABLE public.geofence_locations
ADD COLUMN IF NOT EXISTS requires_face_capture boolean NOT NULL DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_face_enrollments_employee ON public.employee_face_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_face_enrollments_company ON public.employee_face_enrollments(company_id);