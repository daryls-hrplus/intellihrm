
-- =====================================================
-- PHASE A: TALENT SIGNAL ORCHESTRATION LAYER
-- =====================================================

-- 1. Signal Definitions (e.g., "Leadership Consistency", "Collaboration")
CREATE TABLE talent_signal_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  signal_category TEXT NOT NULL DEFAULT 'general',
  aggregation_method TEXT DEFAULT 'weighted_average',
  confidence_threshold NUMERIC DEFAULT 0.7,
  bias_risk_factors JSONB DEFAULT '[]',
  is_system_defined BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Indexes for signal definitions
CREATE INDEX idx_talent_signal_definitions_company ON talent_signal_definitions(company_id);
CREATE INDEX idx_talent_signal_definitions_category ON talent_signal_definitions(signal_category);
CREATE INDEX idx_talent_signal_definitions_active ON talent_signal_definitions(is_active) WHERE is_active = true;

-- RLS for signal definitions
ALTER TABLE talent_signal_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view signal definitions for their company"
  ON talent_signal_definitions FOR SELECT
  USING (
    company_id IS NULL 
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage signal definitions"
  ON talent_signal_definitions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'system_admin')
    )
  );

-- 2. Signal Calculation Rules
CREATE TABLE talent_signal_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_definition_id UUID REFERENCES talent_signal_definitions(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_config JSONB DEFAULT '{}',
  weight NUMERIC DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 10),
  min_responses INTEGER DEFAULT 3,
  max_age_days INTEGER DEFAULT 365,
  calculation_formula JSONB,
  rater_category_weights JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for signal rules
CREATE INDEX idx_talent_signal_rules_definition ON talent_signal_rules(signal_definition_id);
CREATE INDEX idx_talent_signal_rules_company ON talent_signal_rules(company_id);
CREATE INDEX idx_talent_signal_rules_source ON talent_signal_rules(source_type);

-- RLS for signal rules
ALTER TABLE talent_signal_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view signal rules for their company"
  ON talent_signal_rules FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage signal rules"
  ON talent_signal_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'system_admin')
    )
  );

-- 3. Signal Snapshots (versioned, immutable records)
CREATE TABLE talent_signal_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  signal_definition_id UUID REFERENCES talent_signal_definitions(id) ON DELETE CASCADE,
  source_cycle_id UUID,
  source_type TEXT NOT NULL,
  snapshot_version INTEGER DEFAULT 1,
  signal_value NUMERIC CHECK (signal_value >= 0 AND signal_value <= 100),
  raw_score NUMERIC,
  normalized_score NUMERIC,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  bias_risk_level TEXT DEFAULT 'low' CHECK (bias_risk_level IN ('low', 'medium', 'high')),
  bias_factors JSONB DEFAULT '[]',
  evidence_count INTEGER DEFAULT 0,
  evidence_summary JSONB DEFAULT '{}',
  rater_breakdown JSONB DEFAULT '{}',
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_current BOOLEAN DEFAULT true,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Indexes for signal snapshots
CREATE INDEX idx_talent_signal_snapshots_employee ON talent_signal_snapshots(employee_id);
CREATE INDEX idx_talent_signal_snapshots_company ON talent_signal_snapshots(company_id);
CREATE INDEX idx_talent_signal_snapshots_definition ON talent_signal_snapshots(signal_definition_id);
CREATE INDEX idx_talent_signal_snapshots_current ON talent_signal_snapshots(employee_id, is_current) WHERE is_current = true;
CREATE INDEX idx_talent_signal_snapshots_source ON talent_signal_snapshots(source_cycle_id);

-- RLS for signal snapshots
ALTER TABLE talent_signal_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own signal snapshots"
  ON talent_signal_snapshots FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "Users in same company can view snapshots"
  ON talent_signal_snapshots FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "System can insert signal snapshots"
  ON talent_signal_snapshots FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update signal snapshots"
  ON talent_signal_snapshots FOR UPDATE
  USING (true);

-- 4. Evidence Lineage Links
CREATE TABLE signal_evidence_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID REFERENCES talent_signal_snapshots(id) ON DELETE CASCADE,
  source_table TEXT NOT NULL,
  source_id UUID NOT NULL,
  source_field TEXT,
  contribution_weight NUMERIC DEFAULT 1.0,
  contribution_value NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for evidence links
CREATE INDEX idx_signal_evidence_links_snapshot ON signal_evidence_links(snapshot_id);
CREATE INDEX idx_signal_evidence_links_source ON signal_evidence_links(source_table, source_id);

-- RLS for evidence links
ALTER TABLE signal_evidence_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evidence links for accessible snapshots"
  ON signal_evidence_links FOR SELECT
  USING (snapshot_id IN (
    SELECT id FROM talent_signal_snapshots 
    WHERE employee_id = auth.uid()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  ));

CREATE POLICY "System can insert evidence links"
  ON signal_evidence_links FOR INSERT
  WITH CHECK (true);

-- 5. Extend feedback_360_cycles with signal routing configuration
ALTER TABLE feedback_360_cycles 
  ADD COLUMN IF NOT EXISTS cycle_purpose TEXT DEFAULT 'development',
  ADD COLUMN IF NOT EXISTS feed_to_appraisal BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS feed_to_talent_profile BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS feed_to_nine_box BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS feed_to_succession BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS include_in_analytics BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS anonymity_threshold INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS results_visibility_rules JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS retention_period_months INTEGER DEFAULT 36,
  ADD COLUMN IF NOT EXISTS ai_tone_setting TEXT DEFAULT 'development',
  ADD COLUMN IF NOT EXISTS signal_processing_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS signals_processed_at TIMESTAMP WITH TIME ZONE;

-- Add template support to cycles
ALTER TABLE feedback_360_cycles
  ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS template_name TEXT,
  ADD COLUMN IF NOT EXISTS template_description TEXT,
  ADD COLUMN IF NOT EXISTS cloned_from_id UUID REFERENCES feedback_360_cycles(id);

-- 6. Seed system-defined signals
INSERT INTO talent_signal_definitions (company_id, code, name, signal_category, is_system_defined, description, display_order) VALUES
  (NULL, 'leadership_consistency', 'Leadership Consistency', 'leadership', true, 'Consistency in demonstrating leadership behaviors across rater groups', 1),
  (NULL, 'collaboration', 'Collaboration', 'teamwork', true, 'Effectiveness in working with others and contributing to team success', 2),
  (NULL, 'influence', 'Influence', 'leadership', true, 'Ability to persuade and guide others without formal authority', 3),
  (NULL, 'people_leadership', 'People Leadership', 'leadership', true, 'Effectiveness in leading, developing, and supporting team members', 4),
  (NULL, 'technical_excellence', 'Technical Excellence', 'technical', true, 'Depth and application of technical or functional expertise', 5),
  (NULL, 'strategic_thinking', 'Strategic Thinking', 'leadership', true, 'Ability to see the big picture and plan for the future', 6),
  (NULL, 'customer_focus', 'Customer Focus', 'values', true, 'Commitment to understanding and meeting customer needs', 7),
  (NULL, 'adaptability', 'Adaptability', 'general', true, 'Flexibility and resilience in changing circumstances', 8)
ON CONFLICT DO NOTHING;

-- 7. Update timestamp trigger for signal definitions
CREATE OR REPLACE FUNCTION update_talent_signal_definitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_talent_signal_definitions_updated_at
  BEFORE UPDATE ON talent_signal_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_talent_signal_definitions_updated_at();

-- 8. Update timestamp trigger for signal rules
CREATE TRIGGER trigger_update_talent_signal_rules_updated_at
  BEFORE UPDATE ON talent_signal_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_talent_signal_definitions_updated_at();
