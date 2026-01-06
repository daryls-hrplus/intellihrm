-- Phase D Database Schema: External Raters, Frameworks, Rater Management, Analytics

-- D2: External Rater Support
ALTER TABLE feedback_360_rater_categories ADD COLUMN IF NOT EXISTS
  is_external BOOLEAN DEFAULT false;
ALTER TABLE feedback_360_rater_categories ADD COLUMN IF NOT EXISTS
  external_consent_required BOOLEAN DEFAULT true;
ALTER TABLE feedback_360_rater_categories ADD COLUMN IF NOT EXISTS
  external_invitation_template TEXT;
ALTER TABLE feedback_360_rater_categories ADD COLUMN IF NOT EXISTS
  external_reminder_template TEXT;

ALTER TABLE feedback_360_requests ADD COLUMN IF NOT EXISTS
  external_email TEXT;
ALTER TABLE feedback_360_requests ADD COLUMN IF NOT EXISTS
  external_name TEXT;
ALTER TABLE feedback_360_requests ADD COLUMN IF NOT EXISTS
  external_organization TEXT;
ALTER TABLE feedback_360_requests ADD COLUMN IF NOT EXISTS
  external_relationship TEXT;
ALTER TABLE feedback_360_requests ADD COLUMN IF NOT EXISTS
  consent_given BOOLEAN DEFAULT false;
ALTER TABLE feedback_360_requests ADD COLUMN IF NOT EXISTS
  consent_given_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE feedback_360_requests ADD COLUMN IF NOT EXISTS
  access_token TEXT;
ALTER TABLE feedback_360_requests ADD COLUMN IF NOT EXISTS
  access_token_expires_at TIMESTAMP WITH TIME ZONE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_feedback_requests_access_token 
  ON feedback_360_requests(access_token) WHERE access_token IS NOT NULL;

-- D5: Workforce Analytics
CREATE TABLE IF NOT EXISTS org_signal_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  aggregation_dimension TEXT NOT NULL,
  dimension_value TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  avg_score NUMERIC,
  sample_size INTEGER,
  trend_direction TEXT,
  trend_percentage NUMERIC,
  anonymity_threshold_met BOOLEAN DEFAULT true,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback_reporting_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  dimension_name TEXT NOT NULL,
  dimension_source TEXT NOT NULL,
  min_group_size INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE org_signal_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_reporting_dimensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org signal aggregates for their company"
  ON org_signal_aggregates FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage org signal aggregates"
  ON org_signal_aggregates FOR ALL
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view reporting dimensions for their company"
  ON feedback_reporting_dimensions FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage reporting dimensions"
  ON feedback_reporting_dimensions FOR ALL
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- D7: Framework Library
CREATE TABLE IF NOT EXISTS feedback_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  framework_type TEXT NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'draft',
  effective_from DATE,
  effective_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE feedback_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view frameworks for their company"
  ON feedback_frameworks FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage frameworks"
  ON feedback_frameworks FOR ALL
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

ALTER TABLE feedback_360_questions ADD COLUMN IF NOT EXISTS
  signal_types TEXT[];
ALTER TABLE feedback_360_questions ADD COLUMN IF NOT EXISTS
  bias_risk_category TEXT DEFAULT 'low';
ALTER TABLE feedback_360_questions ADD COLUMN IF NOT EXISTS
  framework_id UUID REFERENCES feedback_frameworks(id);
ALTER TABLE feedback_360_questions ADD COLUMN IF NOT EXISTS
  question_version INTEGER DEFAULT 1;
ALTER TABLE feedback_360_questions ADD COLUMN IF NOT EXISTS
  deprecated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE feedback_360_questions ADD COLUMN IF NOT EXISTS
  replacement_question_id UUID;

-- D8: Rater Management Enhanced
CREATE TABLE IF NOT EXISTS rater_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES feedback_360_requests(id) ON DELETE CASCADE,
  relationship_duration_months INTEGER,
  relationship_type TEXT,
  interaction_frequency TEXT,
  confidence_weight NUMERIC DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rater_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES feedback_360_requests(id) ON DELETE CASCADE,
  exception_type TEXT NOT NULL,
  reason TEXT,
  replacement_rater_id UUID REFERENCES profiles(id),
  handled_by UUID REFERENCES profiles(id),
  handled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE rater_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE rater_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their rater relationships"
  ON rater_relationships FOR SELECT
  USING (request_id IN (
    SELECT id FROM feedback_360_requests 
    WHERE rater_id = auth.uid() OR subject_employee_id = auth.uid()
  ));

CREATE POLICY "Users can manage their rater relationships"
  ON rater_relationships FOR ALL
  USING (request_id IN (
    SELECT id FROM feedback_360_requests WHERE rater_id = auth.uid()
  ));

CREATE POLICY "HR can view all rater exceptions"
  ON rater_exceptions FOR SELECT
  USING (request_id IN (
    SELECT r.id FROM feedback_360_requests r
    JOIN feedback_360_cycles c ON r.cycle_id = c.id
    WHERE c.company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  ));

CREATE POLICY "HR can manage rater exceptions"
  ON rater_exceptions FOR ALL
  USING (request_id IN (
    SELECT r.id FROM feedback_360_requests r
    JOIN feedback_360_cycles c ON r.cycle_id = c.id
    WHERE c.company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  ));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_feedback_frameworks_updated_at ON feedback_frameworks;
CREATE TRIGGER update_feedback_frameworks_updated_at
  BEFORE UPDATE ON feedback_frameworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();