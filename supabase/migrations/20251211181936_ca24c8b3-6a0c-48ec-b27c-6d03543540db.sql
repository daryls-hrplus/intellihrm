-- Add validity period fields to workflow_templates
ALTER TABLE public.workflow_templates
ADD COLUMN start_date date DEFAULT CURRENT_DATE,
ADD COLUMN end_date date DEFAULT NULL;

-- Create index for efficient date-based queries
CREATE INDEX idx_workflow_templates_validity ON public.workflow_templates(start_date, end_date) WHERE is_active = true;

-- Function to get active template by code (respects validity dates)
CREATE OR REPLACE FUNCTION public.get_active_workflow_template(p_template_code text, p_as_of_date date DEFAULT CURRENT_DATE)
RETURNS uuid AS $$
  SELECT id FROM public.workflow_templates
  WHERE code = p_template_code
    AND is_active = true
    AND start_date <= p_as_of_date
    AND (end_date IS NULL OR end_date >= p_as_of_date)
  ORDER BY start_date DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Add comment explaining the behavior
COMMENT ON COLUMN public.workflow_templates.start_date IS 'Date from which this template becomes active for new workflow instances';
COMMENT ON COLUMN public.workflow_templates.end_date IS 'Date after which this template cannot be used for new instances. Existing instances continue until completion.';