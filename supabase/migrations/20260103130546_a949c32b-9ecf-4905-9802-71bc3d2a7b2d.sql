-- A2: Signal Routing Policies
CREATE TABLE IF NOT EXISTS signal_routing_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  target_module TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  visibility_delay_days INTEGER DEFAULT 0,
  require_release BOOLEAN DEFAULT true,
  min_completion_rate NUMERIC DEFAULT 0.7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, source_type, target_module)
);

CREATE INDEX idx_signal_routing_policies_company ON signal_routing_policies(company_id);

ALTER TABLE signal_routing_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view routing policies for their company"
  ON signal_routing_policies FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR admins can manage routing policies"
  ON signal_routing_policies FOR ALL
  USING (company_id IN (
    SELECT p.company_id FROM profiles p
    JOIN user_roles ur ON ur.user_id = p.id
    WHERE p.id = auth.uid() 
    AND ur.role IN ('admin', 'hr_manager')
  ));

-- A3: Module Evidence Cards
CREATE TABLE IF NOT EXISTS module_evidence_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL,
  module_entity_id UUID,
  evidence_type TEXT NOT NULL,
  source_snapshot_id UUID REFERENCES talent_signal_snapshots(id) ON DELETE SET NULL,
  display_summary TEXT,
  confidence_level NUMERIC CHECK (confidence_level >= 0 AND confidence_level <= 1),
  is_referenced BOOLEAN DEFAULT false,
  referenced_at TIMESTAMP WITH TIME ZONE,
  referenced_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_module_evidence_cards_employee ON module_evidence_cards(employee_id);
CREATE INDEX idx_module_evidence_cards_module ON module_evidence_cards(module_type, module_entity_id);
CREATE INDEX idx_module_evidence_cards_snapshot ON module_evidence_cards(source_snapshot_id);

ALTER TABLE module_evidence_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evidence cards for accessible employees"
  ON module_evidence_cards FOR SELECT
  USING (
    employee_id = auth.uid()
    OR company_id IN (
      SELECT p.company_id FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      WHERE p.id = auth.uid() 
      AND ur.role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "System can manage evidence cards"
  ON module_evidence_cards FOR ALL
  USING (true);

-- Evidence Usage Audit
CREATE TABLE IF NOT EXISTS evidence_usage_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_card_id UUID REFERENCES module_evidence_cards(id) ON DELETE CASCADE,
  used_in_module TEXT NOT NULL,
  used_in_entity_id UUID,
  action TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_evidence_usage_audit_card ON evidence_usage_audit(evidence_card_id);
CREATE INDEX idx_evidence_usage_audit_user ON evidence_usage_audit(user_id);

ALTER TABLE evidence_usage_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit entries"
  ON evidence_usage_audit FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "HR admins can view all audit entries"
  ON evidence_usage_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      WHERE p.id = auth.uid() 
      AND ur.role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "System can insert audit entries"
  ON evidence_usage_audit FOR INSERT
  WITH CHECK (true);

-- A4: Template Tags
CREATE TABLE IF NOT EXISTS feedback_cycle_template_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES feedback_360_cycles(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(cycle_id, tag)
);

CREATE INDEX idx_feedback_cycle_template_tags_cycle ON feedback_cycle_template_tags(cycle_id);
CREATE INDEX idx_feedback_cycle_template_tags_tag ON feedback_cycle_template_tags(tag);

ALTER TABLE feedback_cycle_template_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view template tags for their company cycles"
  ON feedback_cycle_template_tags FOR SELECT
  USING (cycle_id IN (
    SELECT id FROM feedback_360_cycles 
    WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  ));

CREATE POLICY "HR admins can manage template tags"
  ON feedback_cycle_template_tags FOR ALL
  USING (cycle_id IN (
    SELECT c.id FROM feedback_360_cycles c
    JOIN profiles p ON p.company_id = c.company_id
    JOIN user_roles ur ON ur.user_id = p.id
    WHERE p.id = auth.uid() 
    AND ur.role IN ('admin', 'hr_manager')
  ));

-- Add nomination and response window columns to feedback_360_cycles
ALTER TABLE feedback_360_cycles 
  ADD COLUMN IF NOT EXISTS nomination_window_start DATE,
  ADD COLUMN IF NOT EXISTS nomination_window_end DATE,
  ADD COLUMN IF NOT EXISTS response_window_start DATE,
  ADD COLUMN IF NOT EXISTS response_window_end DATE,
  ADD COLUMN IF NOT EXISTS results_release_date DATE;

-- Trigger for updated_at on signal_routing_policies
CREATE TRIGGER update_signal_routing_policies_updated_at
  BEFORE UPDATE ON signal_routing_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();