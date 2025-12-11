-- Create scenario versions table
CREATE TABLE public.scenario_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID NOT NULL REFERENCES public.saved_scenarios(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL DEFAULT '[]'::jsonb,
  results JSONB,
  current_headcount INTEGER NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  change_notes TEXT,
  UNIQUE(scenario_id, version_number)
);

-- Enable RLS
ALTER TABLE public.scenario_versions ENABLE ROW LEVEL SECURITY;

-- Users can view versions for scenarios they own or shared scenarios
CREATE POLICY "Users can view own scenario versions"
ON public.scenario_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.saved_scenarios s
    WHERE s.id = scenario_id
    AND (s.created_by = auth.uid() OR (s.is_shared = true AND s.share_token IS NOT NULL))
  )
);

-- Users can insert versions for their own scenarios
CREATE POLICY "Users can create versions for own scenarios"
ON public.scenario_versions
FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.saved_scenarios s
    WHERE s.id = scenario_id AND s.created_by = auth.uid()
  )
);

-- Users can delete versions for their own scenarios
CREATE POLICY "Users can delete own scenario versions"
ON public.scenario_versions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.saved_scenarios s
    WHERE s.id = scenario_id AND s.created_by = auth.uid()
  )
);

-- Index for faster lookups
CREATE INDEX idx_scenario_versions_scenario_id ON public.scenario_versions(scenario_id);
CREATE INDEX idx_scenario_versions_created_at ON public.scenario_versions(created_at DESC);