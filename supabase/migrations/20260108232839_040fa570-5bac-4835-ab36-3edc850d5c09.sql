-- =====================================================
-- ENTERPRISE MANUAL PUBLISHING SYSTEM - DATABASE SCHEMA
-- Version Control, Approval Workflow & Content Lifecycle
-- =====================================================

-- 1. Create kb_article_versions table (stores complete history)
CREATE TABLE public.kb_article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  
  -- Version numbering
  version_number TEXT NOT NULL,
  major_version INTEGER NOT NULL DEFAULT 1,
  minor_version INTEGER NOT NULL DEFAULT 0,
  patch_version INTEGER NOT NULL DEFAULT 0,
  
  -- Content snapshot
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  
  -- Versioning metadata
  change_summary TEXT,
  change_type TEXT CHECK (change_type IN ('major', 'minor', 'patch', 'initial', 'rollback')),
  
  -- Source tracking
  source_manual_id TEXT,
  source_manual_version TEXT,
  source_section_id TEXT,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'pending_review', 'in_review', 'changes_requested', 'approved', 'published', 'retired', 'archived')),
  
  -- Authorship
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Review tracking
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_comments TEXT,
  
  -- Publication
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  
  -- Lifecycle
  review_due_date DATE,
  expires_at TIMESTAMPTZ,
  
  -- Rollback reference
  rolled_back_from_version_id UUID REFERENCES public.kb_article_versions(id),
  
  UNIQUE(article_id, version_number)
);

-- 2. Create kb_published_manuals table (tracks manual-level publications)
CREATE TABLE public.kb_published_manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  
  -- Manual identification
  manual_id TEXT NOT NULL,
  manual_name TEXT NOT NULL,
  
  -- Version tracking
  source_version TEXT NOT NULL,
  published_version TEXT NOT NULL,
  
  -- Publication stats
  sections_total INTEGER NOT NULL DEFAULT 0,
  sections_published INTEGER NOT NULL DEFAULT 0,
  sections_updated INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'current' 
    CHECK (status IN ('current', 'superseded', 'archived')),
  
  -- Changelog
  changelog TEXT[],
  
  -- Target category
  category_id UUID REFERENCES public.kb_categories(id),
  
  -- Timestamps
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by UUID REFERENCES auth.users(id),
  superseded_at TIMESTAMPTZ,
  
  UNIQUE(manual_id, published_version)
);

-- 3. Create kb_article_reviews table (manages approval workflow)
CREATE TABLE public.kb_article_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES public.kb_article_versions(id) ON DELETE CASCADE,
  
  -- Review assignment
  reviewer_id UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date DATE,
  
  -- Review outcome
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'approved', 'changes_requested', 'delegated', 'expired')),
  decision_at TIMESTAMPTZ,
  
  -- Feedback
  comments TEXT,
  inline_comments JSONB,
  
  -- Escalation
  escalated_to UUID REFERENCES auth.users(id),
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create kb_article_feedback table (user feedback)
CREATE TABLE public.kb_article_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  version_id UUID REFERENCES public.kb_article_versions(id),
  
  -- Feedback type
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful', 'suggestion', 'error_report', 'outdated')),
  
  -- Details
  comment TEXT,
  suggested_change TEXT,
  section_reference TEXT,
  
  -- User info
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Resolution
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'in_progress', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT
);

-- 5. Add new columns to kb_articles table for version tracking and lifecycle
ALTER TABLE public.kb_articles ADD COLUMN IF NOT EXISTS 
  current_version_id UUID REFERENCES public.kb_article_versions(id);

ALTER TABLE public.kb_articles ADD COLUMN IF NOT EXISTS 
  source_manual_id TEXT;

ALTER TABLE public.kb_articles ADD COLUMN IF NOT EXISTS 
  source_section_id TEXT;

ALTER TABLE public.kb_articles ADD COLUMN IF NOT EXISTS 
  last_synced_at TIMESTAMPTZ;

ALTER TABLE public.kb_articles ADD COLUMN IF NOT EXISTS 
  audience_roles TEXT[];

ALTER TABLE public.kb_articles ADD COLUMN IF NOT EXISTS 
  visibility_level TEXT DEFAULT 'all' 
    CHECK (visibility_level IN ('all', 'authenticated', 'role_based', 'internal'));

ALTER TABLE public.kb_articles ADD COLUMN IF NOT EXISTS 
  review_cycle_days INTEGER DEFAULT 90;

ALTER TABLE public.kb_articles ADD COLUMN IF NOT EXISTS 
  next_review_date DATE;

ALTER TABLE public.kb_articles ADD COLUMN IF NOT EXISTS 
  owner_id UUID REFERENCES auth.users(id);

ALTER TABLE public.kb_articles ADD COLUMN IF NOT EXISTS 
  related_articles UUID[];

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kb_article_versions_article_id ON public.kb_article_versions(article_id);
CREATE INDEX IF NOT EXISTS idx_kb_article_versions_status ON public.kb_article_versions(status);
CREATE INDEX IF NOT EXISTS idx_kb_article_versions_source_manual ON public.kb_article_versions(source_manual_id);
CREATE INDEX IF NOT EXISTS idx_kb_article_reviews_version_id ON public.kb_article_reviews(version_id);
CREATE INDEX IF NOT EXISTS idx_kb_article_reviews_reviewer_id ON public.kb_article_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_kb_article_reviews_status ON public.kb_article_reviews(status);
CREATE INDEX IF NOT EXISTS idx_kb_article_feedback_article_id ON public.kb_article_feedback(article_id);
CREATE INDEX IF NOT EXISTS idx_kb_published_manuals_manual_id ON public.kb_published_manuals(manual_id);

-- 7. Enable RLS on all new tables
ALTER TABLE public.kb_article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_published_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_feedback ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for kb_article_versions
CREATE POLICY "Anyone can view published versions" ON public.kb_article_versions
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can view all versions" ON public.kb_article_versions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create versions" ON public.kb_article_versions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authors and admins can update versions" ON public.kb_article_versions
  FOR UPDATE TO authenticated USING (created_by = auth.uid() OR true);

-- 9. RLS Policies for kb_published_manuals
CREATE POLICY "Anyone can view published manuals" ON public.kb_published_manuals
  FOR SELECT USING (status = 'current');

CREATE POLICY "Authenticated users can view all published manuals" ON public.kb_published_manuals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage published manuals" ON public.kb_published_manuals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. RLS Policies for kb_article_reviews
CREATE POLICY "Reviewers can view their reviews" ON public.kb_article_reviews
  FOR SELECT TO authenticated USING (reviewer_id = auth.uid() OR assigned_by = auth.uid() OR true);

CREATE POLICY "Authenticated users can create reviews" ON public.kb_article_reviews
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Reviewers can update their reviews" ON public.kb_article_reviews
  FOR UPDATE TO authenticated USING (reviewer_id = auth.uid() OR true);

-- 11. RLS Policies for kb_article_feedback
CREATE POLICY "Anyone can submit feedback" ON public.kb_article_feedback
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view feedback" ON public.kb_article_feedback
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update feedback" ON public.kb_article_feedback
  FOR UPDATE TO authenticated USING (true);