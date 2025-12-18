
-- Enablement Releases (version tracking)
CREATE TABLE public.enablement_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number TEXT NOT NULL,
  release_name TEXT,
  release_date DATE,
  preview_start_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'preview', 'released', 'archived')),
  release_notes TEXT,
  feature_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enablement Content Status (per feature per release)
CREATE TABLE public.enablement_content_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_code TEXT NOT NULL,
  module_code TEXT NOT NULL,
  release_id UUID REFERENCES public.enablement_releases(id) ON DELETE CASCADE,
  workflow_status TEXT DEFAULT 'backlog' CHECK (workflow_status IN ('backlog', 'in_progress', 'review', 'published', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  documentation_status TEXT DEFAULT 'not_started',
  scorm_lite_status TEXT DEFAULT 'not_started',
  rise_course_status TEXT DEFAULT 'not_started',
  video_status TEXT DEFAULT 'not_started',
  dap_guide_status TEXT DEFAULT 'not_started',
  complexity_score INTEGER CHECK (complexity_score BETWEEN 1 AND 10),
  recommended_tool TEXT CHECK (recommended_tool IN ('scorm_lite', 'rise', 'both')),
  ai_change_impact TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(feature_code, release_id)
);

-- Enablement Feature Changes (change detection log)
CREATE TABLE public.enablement_feature_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_code TEXT NOT NULL,
  module_code TEXT NOT NULL,
  release_id UUID REFERENCES public.enablement_releases(id) ON DELETE CASCADE,
  change_type TEXT CHECK (change_type IN ('new_feature', 'ui_change', 'workflow_change', 'deprecated', 'removed')),
  change_description TEXT,
  change_severity TEXT CHECK (change_severity IN ('major', 'minor', 'cosmetic')),
  requires_content_update BOOLEAN DEFAULT true,
  detected_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ
);

-- Enablement Rise Templates
CREATE TABLE public.enablement_rise_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  lesson_structure JSONB,
  source_document_id UUID REFERENCES public.enablement_template_reference_docs(id),
  section_patterns JSONB,
  timing_guidelines JSONB,
  exercise_types TEXT[],
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enablement Video Library
CREATE TABLE public.enablement_video_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_code TEXT NOT NULL,
  module_code TEXT NOT NULL,
  video_provider TEXT NOT NULL CHECK (video_provider IN ('trupeer', 'guidde', 'youtube', 'vimeo', 'other')),
  video_url TEXT NOT NULL,
  embed_code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enablement DAP Guides (UserGuiding integration)
CREATE TABLE public.enablement_dap_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_code TEXT NOT NULL,
  module_code TEXT NOT NULL,
  userguiding_guide_id TEXT NOT NULL,
  guide_type TEXT CHECK (guide_type IN ('tooltip', 'walkthrough', 'checklist', 'hotspot', 'announcement')),
  guide_name TEXT,
  trigger_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enablement SCORM Packages
CREATE TABLE public.enablement_scorm_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_code TEXT NOT NULL,
  module_code TEXT NOT NULL,
  release_id UUID REFERENCES public.enablement_releases(id),
  package_type TEXT CHECK (package_type IN ('scorm_lite', 'rise_import')),
  scorm_version TEXT DEFAULT '1.2' CHECK (scorm_version IN ('1.2', '2004')),
  package_url TEXT,
  manifest_xml TEXT,
  quiz_questions JSONB,
  duration_minutes INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enablement_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_content_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_feature_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_rise_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_video_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_dap_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_scorm_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (authenticated users can read, admins can write)
CREATE POLICY "Authenticated users can view releases" ON public.enablement_releases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage releases" ON public.enablement_releases FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view content status" ON public.enablement_content_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage content status" ON public.enablement_content_status FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view feature changes" ON public.enablement_feature_changes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage feature changes" ON public.enablement_feature_changes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view rise templates" ON public.enablement_rise_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage rise templates" ON public.enablement_rise_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view video library" ON public.enablement_video_library FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage video library" ON public.enablement_video_library FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view dap guides" ON public.enablement_dap_guides FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage dap guides" ON public.enablement_dap_guides FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view scorm packages" ON public.enablement_scorm_packages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage scorm packages" ON public.enablement_scorm_packages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_content_status_feature ON public.enablement_content_status(feature_code);
CREATE INDEX idx_content_status_release ON public.enablement_content_status(release_id);
CREATE INDEX idx_content_status_workflow ON public.enablement_content_status(workflow_status);
CREATE INDEX idx_feature_changes_release ON public.enablement_feature_changes(release_id);
CREATE INDEX idx_video_library_feature ON public.enablement_video_library(feature_code);
CREATE INDEX idx_dap_guides_feature ON public.enablement_dap_guides(feature_code);
