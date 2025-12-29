-- Add location_id to shifts table if not exists
ALTER TABLE public.shifts 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.company_branch_locations(id);

-- Add location_id to employee_shift_assignments table if not exists
ALTER TABLE public.employee_shift_assignments 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.company_branch_locations(id);

-- Create location staffing requirements table
CREATE TABLE IF NOT EXISTS public.location_staffing_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.company_branch_locations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  minimum_staff INTEGER NOT NULL DEFAULT 1,
  optimal_staff INTEGER,
  required_skills TEXT[],
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shifts_location ON public.shifts(location_id);
CREATE INDEX IF NOT EXISTS idx_employee_shift_assignments_location ON public.employee_shift_assignments(location_id);
CREATE INDEX IF NOT EXISTS idx_location_staffing_requirements_company ON public.location_staffing_requirements(company_id);
CREATE INDEX IF NOT EXISTS idx_location_staffing_requirements_location ON public.location_staffing_requirements(location_id);

-- Enable RLS
ALTER TABLE public.location_staffing_requirements ENABLE ROW LEVEL SECURITY;

-- RLS policies for location_staffing_requirements using valid app_role values
CREATE POLICY "Users can view location staffing requirements for their company"
ON public.location_staffing_requirements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.company_id = location_staffing_requirements.company_id
  )
);

CREATE POLICY "Managers can manage location staffing requirements"
ON public.location_staffing_requirements
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE p.id = auth.uid() 
    AND p.company_id = location_staffing_requirements.company_id
    AND ur.role IN ('admin', 'hr_manager', 'system_admin')
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_location_staffing_requirements_updated_at
BEFORE UPDATE ON public.location_staffing_requirements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();