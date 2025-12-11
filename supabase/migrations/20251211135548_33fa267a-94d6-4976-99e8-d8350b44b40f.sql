-- Add category column to scenario_templates
ALTER TABLE public.scenario_templates 
ADD COLUMN category TEXT DEFAULT 'general';

-- Add comment for documentation
COMMENT ON COLUMN public.scenario_templates.category IS 'Template category: growth, freeze, restructuring, seasonal, general';