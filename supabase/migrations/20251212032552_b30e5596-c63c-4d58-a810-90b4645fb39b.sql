-- Create employee_competencies table
CREATE TABLE public.employee_competencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES public.competencies(id) ON DELETE CASCADE,
  competency_level_id UUID REFERENCES public.competency_levels(id) ON DELETE SET NULL,
  weighting NUMERIC NOT NULL DEFAULT 10 CHECK (weighting >= 0 AND weighting <= 100),
  proficiency_date DATE,
  notes TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_competencies ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage all employee competencies"
ON public.employee_competencies
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Admins can view all employee competencies"
ON public.employee_competencies
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Users can view own competencies"
ON public.employee_competencies
FOR SELECT
USING (auth.uid() = employee_id);

CREATE POLICY "Users can manage own competencies"
ON public.employee_competencies
FOR ALL
USING (auth.uid() = employee_id);

-- Trigger for updated_at
CREATE TRIGGER update_employee_competencies_updated_at
BEFORE UPDATE ON public.employee_competencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Validation function to prevent overlapping date ranges for same competency on same employee
CREATE OR REPLACE FUNCTION public.validate_employee_competency_no_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.employee_competencies
    WHERE employee_id = NEW.employee_id
      AND competency_id = NEW.competency_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
        (NEW.start_date <= COALESCE(end_date, '9999-12-31'::date))
        AND (COALESCE(NEW.end_date, '9999-12-31'::date) >= start_date)
      )
  ) THEN
    RAISE EXCEPTION 'Overlapping date ranges for the same competency on this employee are not allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for overlap validation
CREATE TRIGGER validate_employee_competency_overlap
BEFORE INSERT OR UPDATE ON public.employee_competencies
FOR EACH ROW
EXECUTE FUNCTION public.validate_employee_competency_no_overlap();