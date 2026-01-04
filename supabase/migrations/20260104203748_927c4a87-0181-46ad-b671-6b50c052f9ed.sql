-- Phase C: Talent Decisions Database Schema

-- C1: Role-Specific Questionnaires
CREATE TABLE review_360_question_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES feedback_360_questions(id) ON DELETE CASCADE,
  rater_category_id UUID REFERENCES feedback_360_rater_categories(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES feedback_360_cycles(id) ON DELETE CASCADE,
  is_visible BOOLEAN DEFAULT true,
  display_order_override INTEGER,
  is_required_override BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(question_id, rater_category_id, cycle_id)
);

ALTER TABLE review_360_question_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view question assignments"
  ON review_360_question_assignments FOR SELECT
  USING (cycle_id IN (
    SELECT id FROM feedback_360_cycles 
    WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  ));

CREATE POLICY "HR can manage question assignments"
  ON review_360_question_assignments FOR ALL
  USING (cycle_id IN (
    SELECT id FROM feedback_360_cycles 
    WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  ));

-- C2: Behavioral Anchors (BARS)
ALTER TABLE feedback_360_questions 
  ADD COLUMN IF NOT EXISTS behavioral_anchors JSONB,
  ADD COLUMN IF NOT EXISTS anchor_display_mode TEXT DEFAULT 'tooltip';

CREATE TABLE competency_behavioral_anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id UUID REFERENCES competencies(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  scale_value INTEGER NOT NULL,
  scale_label TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  examples TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(competency_id, scale_value)
);

ALTER TABLE competency_behavioral_anchors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view behavioral anchors"
  ON competency_behavioral_anchors FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage behavioral anchors"
  ON competency_behavioral_anchors FOR ALL
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- C3: Talent Profile Evidence
CREATE TABLE talent_profile_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  evidence_type TEXT NOT NULL,
  source_snapshot_id UUID REFERENCES talent_signal_snapshots(id),
  source_table TEXT,
  source_id UUID,
  evidence_summary TEXT,
  confidence_score NUMERIC,
  valid_from DATE,
  valid_until DATE,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE talent_profile_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile evidence"
  ON talent_profile_evidence FOR SELECT
  USING (employee_id = auth.uid() OR 
         company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage profile evidence"
  ON talent_profile_evidence FOR ALL
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Talent pool review packets
CREATE TABLE talent_pool_review_packets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_pool_id UUID REFERENCES talent_pools(id),
  member_id UUID REFERENCES talent_pool_members(id),
  employee_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  evidence_snapshot JSONB,
  signal_summary JSONB,
  leadership_indicators JSONB,
  review_status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE talent_pool_review_packets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view review packets"
  ON talent_pool_review_packets FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage review packets"
  ON talent_pool_review_packets FOR ALL
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));