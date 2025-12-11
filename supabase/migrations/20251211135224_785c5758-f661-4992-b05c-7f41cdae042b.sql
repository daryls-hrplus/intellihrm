-- Create scenario templates table for organization-wide templates
CREATE TABLE public.scenario_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL DEFAULT '[]'::jsonb,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  is_global BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scenario_templates ENABLE ROW LEVEL SECURITY;

-- Admins can manage all templates
CREATE POLICY "Admins can manage templates"
ON public.scenario_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can view active templates
CREATE POLICY "Users can view active templates"
ON public.scenario_templates
FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);

-- Add updated_at trigger
CREATE TRIGGER update_scenario_templates_updated_at
BEFORE UPDATE ON public.scenario_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();