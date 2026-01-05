-- Add company, department, section scoping to workflow_steps
ALTER TABLE public.workflow_steps
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id),
ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES public.sections(id),
ADD COLUMN IF NOT EXISTS target_company_id uuid REFERENCES public.companies(id);

-- Add department and section scoping to workflow_templates
ALTER TABLE public.workflow_templates
ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id),
ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES public.sections(id);

-- Add cross-company tracking to workflow_instances
ALTER TABLE public.workflow_instances
ADD COLUMN IF NOT EXISTS is_cross_company boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS origin_company_id uuid REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS cross_company_path jsonb DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.workflow_steps.company_id IS 'Company scope for this step - if null, uses template company';
COMMENT ON COLUMN public.workflow_steps.department_id IS 'Department scope for this step';
COMMENT ON COLUMN public.workflow_steps.section_id IS 'Section scope for this step';
COMMENT ON COLUMN public.workflow_steps.target_company_id IS 'If set, routes approval to this company (cross-company routing)';

COMMENT ON COLUMN public.workflow_templates.department_id IS 'Department scope for this template';
COMMENT ON COLUMN public.workflow_templates.section_id IS 'Section scope for this template';

COMMENT ON COLUMN public.workflow_instances.is_cross_company IS 'Flag indicating this workflow involves multiple companies';
COMMENT ON COLUMN public.workflow_instances.origin_company_id IS 'The company where the workflow originated';
COMMENT ON COLUMN public.workflow_instances.cross_company_path IS 'Array tracking company transitions: [{company_id, company_name, step_order, entered_at}]';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_steps_company ON public.workflow_steps(company_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_department ON public.workflow_steps(department_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_section ON public.workflow_steps(section_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_target_company ON public.workflow_steps(target_company_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_department ON public.workflow_templates(department_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_section ON public.workflow_templates(section_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_cross_company ON public.workflow_instances(is_cross_company) WHERE is_cross_company = true;
CREATE INDEX IF NOT EXISTS idx_workflow_instances_origin_company ON public.workflow_instances(origin_company_id);

-- Create a function to detect cross-company workflows
CREATE OR REPLACE FUNCTION public.check_cross_company_workflow()
RETURNS TRIGGER AS $$
DECLARE
  step_companies uuid[];
  unique_companies uuid[];
  origin_company uuid;
  company_path jsonb;
BEGIN
  -- Get all target companies from steps
  SELECT ARRAY_AGG(DISTINCT COALESCE(ws.target_company_id, ws.company_id, wt.company_id))
  INTO step_companies
  FROM workflow_steps ws
  JOIN workflow_templates wt ON ws.template_id = wt.id
  WHERE ws.template_id = NEW.template_id
  AND ws.is_active = true
  AND (ws.target_company_id IS NOT NULL OR ws.company_id IS NOT NULL OR wt.company_id IS NOT NULL);

  -- Get origin company
  origin_company := NEW.company_id;

  -- Filter out nulls and get unique companies
  SELECT ARRAY_AGG(DISTINCT c)
  INTO unique_companies
  FROM unnest(step_companies) AS c
  WHERE c IS NOT NULL;

  -- Check if workflow involves multiple companies
  IF array_length(unique_companies, 1) > 1 OR 
     (array_length(unique_companies, 1) = 1 AND unique_companies[1] != origin_company AND origin_company IS NOT NULL) THEN
    NEW.is_cross_company := true;
    NEW.origin_company_id := origin_company;
  ELSE
    NEW.is_cross_company := false;
    NEW.origin_company_id := origin_company;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for cross-company detection
DROP TRIGGER IF EXISTS trigger_check_cross_company ON public.workflow_instances;
CREATE TRIGGER trigger_check_cross_company
BEFORE INSERT OR UPDATE ON public.workflow_instances
FOR EACH ROW
EXECUTE FUNCTION public.check_cross_company_workflow();