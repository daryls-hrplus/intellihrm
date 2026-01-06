-- Create timekeeper assignments table to designate timekeepers for departments/employees
CREATE TABLE public.timekeeper_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  timekeeper_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('department', 'employee', 'branch_location')),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  branch_location_id UUID REFERENCES public.company_branch_locations(id) ON DELETE CASCADE,
  can_approve_timesheets BOOLEAN NOT NULL DEFAULT true,
  can_edit_punches BOOLEAN NOT NULL DEFAULT true,
  can_manage_exceptions BOOLEAN NOT NULL DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  CONSTRAINT valid_assignment CHECK (
    (assignment_type = 'department' AND department_id IS NOT NULL) OR
    (assignment_type = 'employee' AND employee_id IS NOT NULL) OR
    (assignment_type = 'branch_location' AND branch_location_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.timekeeper_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Company members can view timekeeper assignments"
ON public.timekeeper_assignments FOR SELECT
TO authenticated
USING (company_id IN (
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can manage timekeeper assignments"
ON public.timekeeper_assignments FOR ALL
TO authenticated
USING (company_id IN (
  SELECT p.company_id FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE p.id = auth.uid() AND ur.role IN ('admin', 'hr_manager')
));

-- Create indexes for performance
CREATE INDEX idx_timekeeper_assignments_timekeeper ON public.timekeeper_assignments(timekeeper_id);
CREATE INDEX idx_timekeeper_assignments_department ON public.timekeeper_assignments(department_id);
CREATE INDEX idx_timekeeper_assignments_employee ON public.timekeeper_assignments(employee_id);
CREATE INDEX idx_timekeeper_assignments_company ON public.timekeeper_assignments(company_id);

-- Create function to get employees assigned to a timekeeper
CREATE OR REPLACE FUNCTION public.get_timekeeper_employees(p_timekeeper_id UUID)
RETURNS TABLE (
  employee_id UUID,
  employee_name TEXT,
  employee_email TEXT,
  department_name TEXT,
  assignment_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id as employee_id,
    p.full_name as employee_name,
    p.email as employee_email,
    d.name as department_name,
    ta.assignment_type
  FROM timekeeper_assignments ta
  JOIN profiles p ON (
    (ta.assignment_type = 'employee' AND ta.employee_id = p.id) OR
    (ta.assignment_type = 'department' AND p.department_id = ta.department_id) OR
    (ta.assignment_type = 'branch_location' AND EXISTS (
      SELECT 1 FROM employee_branch_locations ebl 
      WHERE ebl.employee_id = p.id AND ebl.branch_location_id = ta.branch_location_id
    ))
  )
  LEFT JOIN departments d ON p.department_id = d.id
  WHERE ta.timekeeper_id = p_timekeeper_id
    AND (ta.end_date IS NULL OR ta.end_date >= CURRENT_DATE)
    AND ta.effective_date <= CURRENT_DATE
    AND p.id != p_timekeeper_id;
END;
$$;

-- Update timestamp trigger
CREATE TRIGGER update_timekeeper_assignments_updated_at
BEFORE UPDATE ON public.timekeeper_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();