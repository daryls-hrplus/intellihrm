-- Create application_modules table for storing module metadata
CREATE TABLE public.application_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_code TEXT NOT NULL UNIQUE,
  module_name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  route_path TEXT NOT NULL,
  parent_module_code TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  features JSONB DEFAULT '[]'::jsonb,
  role_requirements TEXT[] DEFAULT '{}',
  i18n_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create application_features table for feature-level metadata
CREATE TABLE public.application_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.application_modules(id) ON DELETE CASCADE,
  feature_code TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  description TEXT,
  route_path TEXT,
  ui_elements JSONB DEFAULT '[]'::jsonb,
  workflow_steps JSONB DEFAULT '[]'::jsonb,
  role_requirements TEXT[] DEFAULT '{}',
  i18n_key TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(module_id, feature_code)
);

-- Create enablement_screenshots table for captured screenshots
CREATE TABLE public.enablement_screenshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id UUID REFERENCES public.application_features(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  route_path TEXT,
  screenshot_url TEXT,
  annotated_url TEXT,
  annotations JSONB DEFAULT '[]'::jsonb,
  capture_metadata JSONB DEFAULT '{}'::jsonb,
  captured_by UUID REFERENCES auth.users(id),
  is_client_specific BOOLEAN DEFAULT false,
  client_company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enablement_tutorials table for generated tutorials
CREATE TABLE public.enablement_tutorials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.application_modules(id) ON DELETE SET NULL,
  feature_id UUID REFERENCES public.application_features(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'tutorial', -- tutorial, overview, quick_reference, video_storyboard
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  screenshots TEXT[] DEFAULT '{}',
  narration_script TEXT,
  estimated_duration_minutes INTEGER,
  target_roles TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft', -- draft, review, published
  published_to TEXT[] DEFAULT '{}', -- training, kb, sop
  training_course_id UUID,
  kb_article_id UUID,
  sop_document_id UUID,
  is_client_specific BOOLEAN DEFAULT false,
  client_company_id UUID REFERENCES public.companies(id),
  created_by UUID REFERENCES auth.users(id),
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enablement_exports table for client export packages
CREATE TABLE public.enablement_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_company_id UUID REFERENCES public.companies(id),
  export_name TEXT NOT NULL,
  export_type TEXT NOT NULL, -- pdf, scorm, html, pptx, docx
  included_tutorials TEXT[] DEFAULT '{}',
  branding_config JSONB DEFAULT '{}'::jsonb,
  export_url TEXT,
  file_size_bytes BIGINT,
  generated_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- pending, generating, completed, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.application_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_exports ENABLE ROW LEVEL SECURITY;

-- RLS policies for application_modules (read by authenticated, write by admin/enablement)
CREATE POLICY "Authenticated users can view application modules"
  ON public.application_modules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage application modules"
  ON public.application_modules FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for application_features
CREATE POLICY "Authenticated users can view application features"
  ON public.application_features FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage application features"
  ON public.application_features FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for enablement_screenshots
CREATE POLICY "Admins can manage enablement screenshots"
  ON public.enablement_screenshots FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for enablement_tutorials
CREATE POLICY "Admins can manage enablement tutorials"
  ON public.enablement_tutorials FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for enablement_exports
CREATE POLICY "Admins can manage enablement exports"
  ON public.enablement_exports FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_application_modules_code ON public.application_modules(module_code);
CREATE INDEX idx_application_features_module ON public.application_features(module_id);
CREATE INDEX idx_enablement_screenshots_feature ON public.enablement_screenshots(feature_id);
CREATE INDEX idx_enablement_tutorials_module ON public.enablement_tutorials(module_id);
CREATE INDEX idx_enablement_tutorials_status ON public.enablement_tutorials(status);
CREATE INDEX idx_enablement_exports_company ON public.enablement_exports(client_company_id);

-- Add triggers for updated_at
CREATE TRIGGER update_application_modules_updated_at
  BEFORE UPDATE ON public.application_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_application_features_updated_at
  BEFORE UPDATE ON public.application_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enablement_screenshots_updated_at
  BEFORE UPDATE ON public.enablement_screenshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enablement_tutorials_updated_at
  BEFORE UPDATE ON public.enablement_tutorials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();