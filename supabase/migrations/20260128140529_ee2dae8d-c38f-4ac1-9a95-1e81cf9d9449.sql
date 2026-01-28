-- Component 1: Feature Coverage Bridge Table
-- Links static manual sections to feature codes so gap analysis recognizes existing documentation

CREATE TABLE IF NOT EXISTS manual_feature_coverage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manual_code TEXT NOT NULL,
  section_id TEXT NOT NULL,           -- e.g., 'sec-2-5' from static structure
  section_title TEXT,                 -- For display/audit
  feature_codes TEXT[] NOT NULL DEFAULT '{}',
  coverage_type TEXT DEFAULT 'documented' CHECK (coverage_type IN ('documented', 'mentioned', 'related')),
  synced_from_static BOOLEAN DEFAULT true,
  verified_by_human BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manual_code, section_id)
);

-- Create index for fast feature lookups
CREATE INDEX idx_mfc_feature_codes ON manual_feature_coverage USING GIN (feature_codes);
CREATE INDEX idx_mfc_manual_code ON manual_feature_coverage(manual_code);

-- Enable RLS
ALTER TABLE manual_feature_coverage ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read manual_feature_coverage"
  ON manual_feature_coverage FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to manage
CREATE POLICY "Allow admins to manage manual_feature_coverage"
  ON manual_feature_coverage FOR ALL
  TO authenticated
  USING (public.is_admin_or_hr());

-- Component 2: Content Review Lifecycle Columns on manual_sections
ALTER TABLE manual_sections
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'draft'
  CHECK (review_status IN ('draft', 'pending_review', 'in_review', 'approved', 'rejected', 'published')),
ADD COLUMN IF NOT EXISTS draft_content JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS submitted_for_review_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS static_section_id TEXT;

-- Create content review history for audit trail
CREATE TABLE IF NOT EXISTS manual_section_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  previous_content JSONB,
  proposed_content JSONB NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'edited', 'published')),
  action_by UUID REFERENCES auth.users(id),
  action_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  version_number INTEGER DEFAULT 1
);

CREATE INDEX idx_msr_section_id ON manual_section_reviews(section_id);
CREATE INDEX idx_msr_action ON manual_section_reviews(action);
CREATE INDEX idx_msr_action_at ON manual_section_reviews(action_at DESC);

-- Enable RLS on review history
ALTER TABLE manual_section_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review history
CREATE POLICY "Allow authenticated users to read manual_section_reviews"
  ON manual_section_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert manual_section_reviews"
  ON manual_section_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed initial feature coverage mappings for Appraisals manual
INSERT INTO manual_feature_coverage (manual_code, section_id, section_title, feature_codes) VALUES
  -- Part 2: Setup sections with feature mappings
  ('appraisals', 'sec-2-2', 'Rating Scales Configuration', ARRAY['perf_rating_scales']),
  ('appraisals', 'sec-2-3', 'Overall Rating Definitions', ARRAY['perf_overall_ratings']),
  ('appraisals', 'sec-2-4', 'Competency Framework Configuration', ARRAY['perf_competency_framework', 'competency_frameworks', 'admin_competencies']),
  ('appraisals', 'sec-2-4b', 'KRA Management', ARRAY['perf_kra_management', 'admin_responsibilities']),
  ('appraisals', 'sec-2-5', 'Appraisal Form Templates', ARRAY['appraisal_forms', 'perf_appraisal_forms', 'perf_review_templates']),
  ('appraisals', 'sec-2-6', 'Appraisal Cycles', ARRAY['appraisal_cycles', 'perf_appraisal_cycles', 'cycles']),
  ('appraisals', 'sec-2-7', 'Rating Levels', ARRAY['perf_rating_levels']),
  ('appraisals', 'sec-2-8', 'Outcome Rules', ARRAY['perf_outcome_rules']),
  -- Part 3: Workflow sections
  ('appraisals', 'sec-3-1', 'Cycle Lifecycle', ARRAY['perf_cycle_lifecycle', 'evaluations']),
  ('appraisals', 'sec-3-calibration', 'Calibration Sessions', ARRAY['calibration', 'perf_calibration', 'perf_bell_curve']),
  ('appraisals', 'sec-3-7', 'Performance Interviews', ARRAY['perf_interviews']),
  -- Part 4-7: Additional coverage
  ('appraisals', 'sec-4-disputes', 'Dispute Resolution', ARRAY['perf_disputes']),
  ('appraisals', 'sec-5-ai', 'AI Narratives', ARRAY['perf_ai_narratives', 'ai_recommendations']),
  ('appraisals', 'sec-6-analytics', 'Performance Analytics', ARRAY['perf_analytics', 'analytics']),
  -- Goals manual seed
  ('goals', 'sec-1-1', 'Goal Setting Overview', ARRAY['goal_setting', 'goals']),
  ('goals', 'sec-2-1', 'Goal Categories', ARRAY['goal_categories']),
  ('goals', 'sec-2-2', 'Goal Templates', ARRAY['goal_templates']),
  ('goals', 'sec-3-1', 'Goal Alignment', ARRAY['goal_alignment', 'goal_cascading']),
  -- Workforce manual seed
  ('workforce', 'sec-1-1', 'Employee Management', ARRAY['employee_management', 'employees']),
  ('workforce', 'sec-2-1', 'Jobs Configuration', ARRAY['jobs', 'job_management']),
  ('workforce', 'sec-2-2', 'Positions', ARRAY['positions', 'position_management']),
  ('workforce', 'sec-2-3', 'Departments', ARRAY['departments', 'org_structure']),
  ('workforce', 'sec-3-1', 'Org Charts', ARRAY['org_charts', 'org_visualization'])
ON CONFLICT (manual_code, section_id) DO UPDATE SET
  section_title = EXCLUDED.section_title,
  feature_codes = EXCLUDED.feature_codes,
  updated_at = now();

-- Create index on manual_sections for review status filtering
CREATE INDEX IF NOT EXISTS idx_manual_sections_review_status ON manual_sections(review_status);
CREATE INDEX IF NOT EXISTS idx_manual_sections_submitted_for_review ON manual_sections(submitted_for_review_at DESC) WHERE review_status = 'pending_review';