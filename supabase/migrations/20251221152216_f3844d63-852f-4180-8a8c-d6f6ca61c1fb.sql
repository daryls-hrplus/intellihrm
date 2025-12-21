-- =====================================================
-- Phase 1: EnablementArtifact Master Object Foundation
-- =====================================================

-- Master content object (single source of truth for all enablement content)
CREATE TABLE public.enablement_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id TEXT UNIQUE NOT NULL, -- e.g., "ART-WRK-EMP-001"
  
  -- Metadata (Deliverable 1 requirements)
  product_version TEXT NOT NULL DEFAULT 'v1.0',
  module_id UUID REFERENCES public.application_modules(id),
  feature_id UUID REFERENCES public.application_features(id),
  role_scope TEXT[] NOT NULL DEFAULT ARRAY['Employee'],
  content_level TEXT NOT NULL DEFAULT 'How-To' CHECK (content_level IN ('Overview', 'How-To', 'Advanced', 'Scenario', 'FAQ', 'Video')),
  
  -- Core content (structured, not free-text)
  title TEXT NOT NULL,
  description TEXT,
  learning_objective JSONB DEFAULT '[]',
  preconditions JSONB DEFAULT '[]',
  steps JSONB DEFAULT '[]',
  expected_outcomes JSONB DEFAULT '[]',
  
  -- UI binding
  ui_routes TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Tags and categorization
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Governance (Deliverable 1 lifecycle)
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'deprecated')),
  version_number INTEGER NOT NULL DEFAULT 1,
  supersedes_artifact_id UUID REFERENCES public.enablement_artifacts(id),
  
  -- Approval workflow
  submitted_by UUID,
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  published_by UUID,
  published_at TIMESTAMPTZ,
  deprecated_by UUID,
  deprecated_at TIMESTAMPTZ,
  deprecation_reason TEXT,
  
  -- Tracking
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create approval history table for full audit trail
CREATE TABLE public.enablement_artifact_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID REFERENCES public.enablement_artifacts(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'submitted', 'review_requested', 'approved', 'rejected', 'published', 'deprecated', 'restored')),
  from_status TEXT,
  to_status TEXT,
  performed_by UUID,
  comments TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add artifact linking columns to enablement_screenshots
ALTER TABLE public.enablement_screenshots 
ADD COLUMN IF NOT EXISTS artifact_id UUID REFERENCES public.enablement_artifacts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ui_route_path TEXT,
ADD COLUMN IF NOT EXISTS step_number INTEGER,
ADD COLUMN IF NOT EXISTS capture_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_auto_captured BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX idx_enablement_artifacts_status ON public.enablement_artifacts(status);
CREATE INDEX idx_enablement_artifacts_module ON public.enablement_artifacts(module_id);
CREATE INDEX idx_enablement_artifacts_feature ON public.enablement_artifacts(feature_id);
CREATE INDEX idx_enablement_artifacts_product_version ON public.enablement_artifacts(product_version);
CREATE INDEX idx_enablement_artifacts_role_scope ON public.enablement_artifacts USING GIN(role_scope);
CREATE INDEX idx_enablement_artifacts_created_at ON public.enablement_artifacts(created_at DESC);
CREATE INDEX idx_artifact_approvals_artifact ON public.enablement_artifact_approvals(artifact_id);
CREATE INDEX idx_screenshots_artifact ON public.enablement_screenshots(artifact_id);

-- Full-text search index
CREATE INDEX idx_enablement_artifacts_search ON public.enablement_artifacts 
USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- Enable RLS
ALTER TABLE public.enablement_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_artifact_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enablement_artifacts
CREATE POLICY "Anyone can view published artifacts" ON public.enablement_artifacts
FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create artifacts" ON public.enablement_artifacts
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update artifacts" ON public.enablement_artifacts
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete draft artifacts" ON public.enablement_artifacts
FOR DELETE USING (auth.uid() IS NOT NULL AND status = 'draft');

-- RLS Policies for enablement_artifact_approvals
CREATE POLICY "Authenticated users can view approvals" ON public.enablement_artifact_approvals
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create approvals" ON public.enablement_artifact_approvals
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Function to auto-generate artifact_id
CREATE OR REPLACE FUNCTION public.generate_artifact_id()
RETURNS TRIGGER AS $$
DECLARE
  module_code TEXT;
  feature_code TEXT;
  sequence_num INTEGER;
BEGIN
  -- Get module code
  SELECT am.module_code INTO module_code
  FROM public.application_modules am
  WHERE am.id = NEW.module_id;
  
  -- Get feature code
  SELECT af.feature_code INTO feature_code
  FROM public.application_features af
  WHERE af.id = NEW.feature_id;
  
  -- Get next sequence number for this module
  SELECT COALESCE(MAX(CAST(SUBSTRING(artifact_id FROM '[0-9]+$') AS INTEGER)), 0) + 1 INTO sequence_num
  FROM public.enablement_artifacts
  WHERE module_id = NEW.module_id;
  
  -- Generate artifact_id
  NEW.artifact_id := 'ART-' || COALESCE(UPPER(LEFT(module_code, 3)), 'GEN') || '-' || 
                     COALESCE(UPPER(LEFT(feature_code, 3)), 'FTR') || '-' || 
                     LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER generate_artifact_id_trigger
BEFORE INSERT ON public.enablement_artifacts
FOR EACH ROW
WHEN (NEW.artifact_id IS NULL OR NEW.artifact_id = '')
EXECUTE FUNCTION public.generate_artifact_id();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_artifact_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_artifact_timestamp
BEFORE UPDATE ON public.enablement_artifacts
FOR EACH ROW
EXECUTE FUNCTION public.update_artifact_updated_at();

-- Function to log artifact status changes
CREATE OR REPLACE FUNCTION public.log_artifact_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.enablement_artifact_approvals (
      artifact_id, action, from_status, to_status, performed_by, comments
    ) VALUES (
      NEW.id,
      CASE NEW.status
        WHEN 'in_review' THEN 'submitted'
        WHEN 'approved' THEN 'approved'
        WHEN 'published' THEN 'published'
        WHEN 'deprecated' THEN 'deprecated'
        ELSE 'updated'
      END,
      OLD.status,
      NEW.status,
      NEW.updated_by,
      CASE NEW.status
        WHEN 'deprecated' THEN NEW.deprecation_reason
        ELSE NEW.review_notes
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER log_artifact_status_change_trigger
AFTER UPDATE ON public.enablement_artifacts
FOR EACH ROW
EXECUTE FUNCTION public.log_artifact_status_change();