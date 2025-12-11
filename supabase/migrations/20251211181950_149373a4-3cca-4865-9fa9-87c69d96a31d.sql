-- Fix search_path for the function
CREATE OR REPLACE FUNCTION public.get_active_workflow_template(p_template_code text, p_as_of_date date DEFAULT CURRENT_DATE)
RETURNS uuid AS $$
  SELECT id FROM public.workflow_templates
  WHERE code = p_template_code
    AND is_active = true
    AND start_date <= p_as_of_date
    AND (end_date IS NULL OR end_date >= p_as_of_date)
  ORDER BY start_date DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;