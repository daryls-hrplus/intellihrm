-- Table for version/release lifecycle configuration
CREATE TABLE public.enablement_release_lifecycle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Release Status
  release_status text NOT NULL DEFAULT 'pre-release' 
    CHECK (release_status IN ('pre-release', 'preview', 'ga-released', 'maintenance')),
  current_release_id uuid REFERENCES public.enablement_releases(id) ON DELETE SET NULL,
  
  -- Version Control
  version_freeze_enabled boolean NOT NULL DEFAULT true,
  base_version text NOT NULL DEFAULT '1.0.0',
  
  -- Milestones
  target_ga_date date,
  milestones jsonb DEFAULT '[]'::jsonb,
  
  -- AI Assessments (cached)
  last_readiness_score integer,
  last_readiness_assessment jsonb,
  last_assessment_at timestamptz,
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  
  UNIQUE(company_id)
);

-- Add columns to enablement_releases for enhanced tracking
ALTER TABLE public.enablement_releases ADD COLUMN IF NOT EXISTS
  release_type text DEFAULT 'product' 
    CHECK (release_type IN ('product', 'documentation', 'hotfix'));

ALTER TABLE public.enablement_releases ADD COLUMN IF NOT EXISTS
  is_active boolean DEFAULT false;

ALTER TABLE public.enablement_releases ADD COLUMN IF NOT EXISTS
  readiness_score integer;

ALTER TABLE public.enablement_releases ADD COLUMN IF NOT EXISTS
  ai_changelog text;

-- Enable RLS
ALTER TABLE public.enablement_release_lifecycle ENABLE ROW LEVEL SECURITY;

-- RLS policies for enablement_release_lifecycle
CREATE POLICY "Authenticated users can view release lifecycle" 
  ON public.enablement_release_lifecycle 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert release lifecycle" 
  ON public.enablement_release_lifecycle 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update release lifecycle" 
  ON public.enablement_release_lifecycle 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Insert default record (global, no company_id)
INSERT INTO public.enablement_release_lifecycle (
  company_id, 
  release_status, 
  version_freeze_enabled,
  base_version,
  milestones
)
VALUES (
  NULL, 
  'pre-release', 
  true,
  '1.0.0',
  '[
    {"id": "alpha", "name": "Alpha", "targetDate": null, "completed": false},
    {"id": "beta", "name": "Beta", "targetDate": null, "completed": false},
    {"id": "rc1", "name": "RC1", "targetDate": null, "completed": false},
    {"id": "ga", "name": "GA Release", "targetDate": null, "completed": false}
  ]'::jsonb
);

-- Trigger for updated_at
CREATE TRIGGER update_enablement_release_lifecycle_updated_at
  BEFORE UPDATE ON public.enablement_release_lifecycle
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();