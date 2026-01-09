-- Manual Definitions - Master registry of manuals
CREATE TABLE public.manual_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  manual_code TEXT NOT NULL UNIQUE,
  manual_name TEXT NOT NULL,
  description TEXT,
  current_version TEXT NOT NULL DEFAULT '1.0.0',
  module_codes TEXT[] NOT NULL DEFAULT '{}',
  last_generated_at TIMESTAMPTZ,
  generation_status TEXT NOT NULL DEFAULT 'idle' CHECK (generation_status IN ('idle', 'generating', 'review_pending', 'failed')),
  icon_name TEXT,
  color_class TEXT,
  href TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Manual Sections - Section definitions with content
CREATE TABLE public.manual_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manual_id UUID NOT NULL REFERENCES public.manual_definitions(id) ON DELETE CASCADE,
  section_number TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  source_feature_codes TEXT[] NOT NULL DEFAULT '{}',
  source_module_codes TEXT[] NOT NULL DEFAULT '{}',
  last_generated_at TIMESTAMPTZ,
  needs_regeneration BOOLEAN NOT NULL DEFAULT true,
  generation_hash TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  parent_section_id UUID REFERENCES public.manual_sections(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(manual_id, section_number)
);

-- Manual Section Versions - Version history per section
CREATE TABLE public.manual_section_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.manual_sections(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  content JSONB NOT NULL,
  changelog_entry TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by UUID REFERENCES public.profiles(id),
  ai_model_used TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Manual Generation Runs - Audit trail of AI generations
CREATE TABLE public.manual_generation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manual_id UUID NOT NULL REFERENCES public.manual_definitions(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  triggered_by UUID REFERENCES public.profiles(id),
  run_type TEXT NOT NULL CHECK (run_type IN ('full', 'incremental', 'section')),
  version_bump TEXT CHECK (version_bump IN ('major', 'minor', 'patch')),
  from_version TEXT,
  to_version TEXT,
  sections_total INTEGER NOT NULL DEFAULT 0,
  sections_regenerated INTEGER NOT NULL DEFAULT 0,
  sections_failed INTEGER NOT NULL DEFAULT 0,
  changelog TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Manual Change Detection Log - Track detected changes
CREATE TABLE public.manual_change_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manual_id UUID NOT NULL REFERENCES public.manual_definitions(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  change_type TEXT NOT NULL CHECK (change_type IN ('feature_added', 'feature_modified', 'feature_removed', 'module_updated')),
  source_table TEXT NOT NULL,
  source_id UUID NOT NULL,
  source_code TEXT,
  change_summary TEXT,
  affected_section_ids UUID[] NOT NULL DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'minor' CHECK (severity IN ('minor', 'major', 'critical')),
  is_processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES public.profiles(id),
  generation_run_id UUID REFERENCES public.manual_generation_runs(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manual_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_section_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_generation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_change_detections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for manual_definitions
CREATE POLICY "Users can view manual definitions" ON public.manual_definitions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage manual definitions" ON public.manual_definitions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for manual_sections
CREATE POLICY "Users can view manual sections" ON public.manual_sections
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage manual sections" ON public.manual_sections
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for manual_section_versions
CREATE POLICY "Users can view manual section versions" ON public.manual_section_versions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage manual section versions" ON public.manual_section_versions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for manual_generation_runs
CREATE POLICY "Users can view manual generation runs" ON public.manual_generation_runs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage manual generation runs" ON public.manual_generation_runs
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for manual_change_detections
CREATE POLICY "Users can view manual change detections" ON public.manual_change_detections
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage manual change detections" ON public.manual_change_detections
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_manual_sections_manual_id ON public.manual_sections(manual_id);
CREATE INDEX idx_manual_sections_needs_regeneration ON public.manual_sections(needs_regeneration) WHERE needs_regeneration = true;
CREATE INDEX idx_manual_section_versions_section_id ON public.manual_section_versions(section_id);
CREATE INDEX idx_manual_generation_runs_manual_id ON public.manual_generation_runs(manual_id);
CREATE INDEX idx_manual_generation_runs_status ON public.manual_generation_runs(status);
CREATE INDEX idx_manual_change_detections_manual_id ON public.manual_change_detections(manual_id);
CREATE INDEX idx_manual_change_detections_is_processed ON public.manual_change_detections(is_processed) WHERE is_processed = false;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_manual_definitions_updated_at
  BEFORE UPDATE ON public.manual_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manual_sections_updated_at
  BEFORE UPDATE ON public.manual_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial manual definitions based on MANUAL_CONFIGS
INSERT INTO public.manual_definitions (manual_code, manual_name, current_version, module_codes, icon_name, color_class, href) VALUES
  ('admin-security', 'Admin & Security - Administrator Guide', '1.3.0', ARRAY['admin', 'security', 'access-control'], 'Shield', 'bg-red-500/10 text-red-600', '/enablement/manuals/admin-security'),
  ('workforce', 'Workforce - Administrator Guide', '1.3.0', ARRAY['workforce', 'employee-management', 'org-structure'], 'Users', 'bg-blue-500/10 text-blue-600', '/enablement/manuals/workforce'),
  ('hr-hub', 'HR Hub - Administrator Guide', '1.3.0', ARRAY['hr-hub', 'employee-relations', 'grievances'], 'HelpCircle', 'bg-purple-500/10 text-purple-600', '/enablement/manuals/hr-hub'),
  ('appraisals', 'Performance Appraisal - Administrator Guide', '1.3.0', ARRAY['appraisals', 'performance', 'reviews'], 'BookOpen', 'bg-primary/10 text-primary', '/enablement/manuals/appraisals'),
  ('goals', 'Goals Manual', '1.3.0', ARRAY['goals', 'okrs', 'objectives'], 'Target', 'bg-green-500/10 text-green-600', '/enablement/manuals/goals')
ON CONFLICT (manual_code) DO UPDATE SET
  manual_name = EXCLUDED.manual_name,
  module_codes = EXCLUDED.module_codes,
  icon_name = EXCLUDED.icon_name,
  color_class = EXCLUDED.color_class,
  href = EXCLUDED.href;