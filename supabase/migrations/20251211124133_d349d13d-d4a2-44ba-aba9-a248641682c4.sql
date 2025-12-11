-- Create positions table (positions belong to departments and report to other positions)
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  reports_to_position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_positions table (employees fill positions with compensation)
CREATE TABLE public.employee_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  compensation_amount DECIMAL(15,2),
  compensation_currency TEXT DEFAULT 'USD',
  compensation_frequency TEXT DEFAULT 'monthly',
  benefits_profile JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_active_employee_position UNIQUE (employee_id, position_id, is_active)
);

-- Enable RLS
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_positions ENABLE ROW LEVEL SECURITY;

-- Positions RLS policies
CREATE POLICY "Authenticated users can view positions"
ON public.positions FOR SELECT
USING (true);

CREATE POLICY "Admins can insert positions"
ON public.positions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update positions"
ON public.positions FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete positions"
ON public.positions FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Employee positions RLS policies
CREATE POLICY "Authenticated users can view employee positions"
ON public.employee_positions FOR SELECT
USING (true);

CREATE POLICY "Admins can insert employee positions"
ON public.employee_positions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update employee positions"
ON public.employee_positions FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete employee positions"
ON public.employee_positions FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_positions_updated_at
BEFORE UPDATE ON public.positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_positions_updated_at
BEFORE UPDATE ON public.employee_positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get employee's supervisor based on position reporting
CREATE OR REPLACE FUNCTION public.get_employee_supervisor(p_employee_id UUID, p_position_id UUID DEFAULT NULL)
RETURNS TABLE(
  supervisor_id UUID,
  supervisor_name TEXT,
  supervisor_position_id UUID,
  supervisor_position_title TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sup_ep.employee_id as supervisor_id,
    sup_p.full_name as supervisor_name,
    sup_pos.id as supervisor_position_id,
    sup_pos.title as supervisor_position_title
  FROM employee_positions ep
  JOIN positions pos ON ep.position_id = pos.id
  JOIN positions sup_pos ON pos.reports_to_position_id = sup_pos.id
  JOIN employee_positions sup_ep ON sup_ep.position_id = sup_pos.id AND sup_ep.is_active = true
  JOIN profiles sup_p ON sup_ep.employee_id = sup_p.id
  WHERE ep.employee_id = p_employee_id
    AND ep.is_active = true
    AND (p_position_id IS NULL OR ep.position_id = p_position_id)
  LIMIT 1;
END;
$$;