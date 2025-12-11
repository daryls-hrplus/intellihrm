-- Create employee_branch_locations table to track employee branch assignments
CREATE TABLE public.employee_branch_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  branch_location_id UUID NOT NULL REFERENCES public.company_branch_locations(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_branch_locations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own branch locations"
  ON public.employee_branch_locations
  FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Admins can view all branch locations"
  ON public.employee_branch_locations
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Admins can manage all branch locations"
  ON public.employee_branch_locations
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Users can manage own branch locations"
  ON public.employee_branch_locations
  FOR ALL
  USING (auth.uid() = employee_id);