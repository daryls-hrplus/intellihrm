
-- =============================================
-- PHASE 1A: CAPABILITY PLATFORM FOUNDATION
-- =============================================

-- 1. Create capability_type enum
CREATE TYPE capability_type AS ENUM ('SKILL', 'COMPETENCY');

-- 2. Create capability_category enum
CREATE TYPE capability_category AS ENUM ('technical', 'functional', 'behavioral', 'leadership', 'core');

-- 3. Create capability_status enum
CREATE TYPE capability_status AS ENUM ('draft', 'pending_approval', 'active', 'deprecated');

-- 4. Create evidence_source enum
CREATE TYPE evidence_source AS ENUM (
  'self_declared', 'manager_assessment', '360_feedback', 
  'formal_assessment', 'training_completion', 'certification',
  'project_history', 'ai_inference'
);

-- 5. Create validation_status enum
CREATE TYPE validation_status AS ENUM ('pending', 'validated', 'rejected', 'expired');

-- 6. Create proficiency_scales table (must come first - referenced by capabilities)
CREATE TABLE proficiency_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  levels JSONB NOT NULL DEFAULT '[]', -- [{level: 1, name: "Beginner", description: "..."}, ...]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, code)
);

-- 7. Create capabilities table (unified registry for skills and competencies)
CREATE TABLE capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type capability_type NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  category capability_category NOT NULL,
  proficiency_scale_id UUID REFERENCES proficiency_scales(id),
  status capability_status NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  owner_role TEXT, -- HR, COE, Admin
  parent_capability_id UUID REFERENCES capabilities(id),
  external_id TEXT, -- ESCO/O*NET mapping
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, code, version)
);

-- 8. Create skill_attributes table (skill-specific extensions)
CREATE TABLE skill_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  synonyms TEXT[] DEFAULT '{}',
  adjacent_skills UUID[] DEFAULT '{}',
  typical_acquisition_modes TEXT[] DEFAULT '{}',
  expiry_months INTEGER,
  can_be_inferred BOOLEAN DEFAULT true,
  inference_keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(capability_id)
);

-- 9. Create competency_attributes table (competency-specific extensions)
CREATE TABLE competency_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  behavioral_indicators JSONB DEFAULT '[]', -- per level indicators
  assessment_rules JSONB DEFAULT '{}',
  role_applicability TEXT[] DEFAULT '{}',
  can_be_inferred BOOLEAN DEFAULT false, -- competencies require human validation
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(capability_id)
);

-- 10. Create competency_skill_mappings table
CREATE TABLE competency_skill_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  weight NUMERIC DEFAULT 1 CHECK (weight >= 0 AND weight <= 100),
  is_required BOOLEAN DEFAULT false,
  min_proficiency_level INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(competency_id, skill_id)
);

-- 11. Create capability_evidence table (Evidence Engine)
CREATE TABLE capability_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  evidence_source evidence_source NOT NULL,
  proficiency_level INTEGER,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  validation_status validation_status DEFAULT 'pending',
  validated_by UUID,
  validated_at TIMESTAMPTZ,
  evidence_reference JSONB, -- source document, course ID, etc.
  notes TEXT,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Create capability_change_history table (Governance)
CREATE TABLE capability_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'status_changed', 'deprecated')),
  previous_values JSONB,
  new_values JSONB,
  change_reason TEXT,
  changed_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_capabilities_company_type ON capabilities(company_id, type);
CREATE INDEX idx_capabilities_company_status ON capabilities(company_id, status);
CREATE INDEX idx_capabilities_category ON capabilities(category);
CREATE INDEX idx_capabilities_parent ON capabilities(parent_capability_id);
CREATE INDEX idx_capabilities_code ON capabilities(code);

CREATE INDEX idx_skill_attributes_capability ON skill_attributes(capability_id);
CREATE INDEX idx_competency_attributes_capability ON competency_attributes(capability_id);

CREATE INDEX idx_competency_skill_mappings_competency ON competency_skill_mappings(competency_id);
CREATE INDEX idx_competency_skill_mappings_skill ON competency_skill_mappings(skill_id);

CREATE INDEX idx_capability_evidence_employee ON capability_evidence(employee_id);
CREATE INDEX idx_capability_evidence_capability ON capability_evidence(capability_id);
CREATE INDEX idx_capability_evidence_employee_capability ON capability_evidence(employee_id, capability_id);
CREATE INDEX idx_capability_evidence_source ON capability_evidence(evidence_source);
CREATE INDEX idx_capability_evidence_validation ON capability_evidence(validation_status);

CREATE INDEX idx_capability_change_history_capability ON capability_change_history(capability_id);

-- =============================================
-- ENABLE RLS
-- =============================================

ALTER TABLE proficiency_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_skill_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_change_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Proficiency Scales
-- =============================================

CREATE POLICY "Users can view proficiency scales in their company"
ON proficiency_scales FOR SELECT
USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  OR company_id IS NULL
);

CREATE POLICY "HR/Admin can manage proficiency scales"
ON proficiency_scales FOR ALL
USING (
  has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
  AND (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL)
);

-- =============================================
-- RLS POLICIES - Capabilities
-- =============================================

CREATE POLICY "Users can view active capabilities in their company"
ON capabilities FOR SELECT
USING (
  (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL)
  AND (status = 'active' OR has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin']))
);

CREATE POLICY "HR/Admin can manage capabilities"
ON capabilities FOR INSERT
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
  AND (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL)
);

CREATE POLICY "HR/Admin can update capabilities"
ON capabilities FOR UPDATE
USING (
  has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
  AND (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL)
);

CREATE POLICY "HR/Admin can delete capabilities"
ON capabilities FOR DELETE
USING (
  has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
  AND (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL)
);

-- =============================================
-- RLS POLICIES - Skill/Competency Attributes
-- =============================================

CREATE POLICY "Users can view skill attributes"
ON skill_attributes FOR SELECT
USING (
  capability_id IN (
    SELECT id FROM capabilities 
    WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL
  )
);

CREATE POLICY "HR/Admin can manage skill attributes"
ON skill_attributes FOR ALL
USING (
  has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
);

CREATE POLICY "Users can view competency attributes"
ON competency_attributes FOR SELECT
USING (
  capability_id IN (
    SELECT id FROM capabilities 
    WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL
  )
);

CREATE POLICY "HR/Admin can manage competency attributes"
ON competency_attributes FOR ALL
USING (
  has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
);

-- =============================================
-- RLS POLICIES - Competency Skill Mappings
-- =============================================

CREATE POLICY "Users can view competency skill mappings"
ON competency_skill_mappings FOR SELECT
USING (
  competency_id IN (
    SELECT id FROM capabilities 
    WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL
  )
);

CREATE POLICY "HR/Admin can manage competency skill mappings"
ON competency_skill_mappings FOR ALL
USING (
  has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
);

-- =============================================
-- RLS POLICIES - Capability Evidence
-- =============================================

CREATE POLICY "Employees can view their own evidence"
ON capability_evidence FOR SELECT
USING (
  employee_id = auth.uid()
  OR has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
  OR employee_id IN (SELECT employee_id FROM get_manager_direct_reports(auth.uid()))
);

CREATE POLICY "Employees can self-declare evidence"
ON capability_evidence FOR INSERT
WITH CHECK (
  (employee_id = auth.uid() AND evidence_source = 'self_declared')
  OR has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin', 'manager'])
);

CREATE POLICY "Managers/HR can update evidence"
ON capability_evidence FOR UPDATE
USING (
  has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
  OR employee_id IN (SELECT employee_id FROM get_manager_direct_reports(auth.uid()))
);

CREATE POLICY "HR/Admin can delete evidence"
ON capability_evidence FOR DELETE
USING (
  has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin'])
);

-- =============================================
-- RLS POLICIES - Change History
-- =============================================

CREATE POLICY "Users can view change history for accessible capabilities"
ON capability_change_history FOR SELECT
USING (
  capability_id IN (
    SELECT id FROM capabilities 
    WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL
  )
);

CREATE POLICY "System can insert change history"
ON capability_change_history FOR INSERT
WITH CHECK (true);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_proficiency_scales_updated_at
  BEFORE UPDATE ON proficiency_scales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capabilities_updated_at
  BEFORE UPDATE ON capabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_attributes_updated_at
  BEFORE UPDATE ON skill_attributes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competency_attributes_updated_at
  BEFORE UPDATE ON competency_attributes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competency_skill_mappings_updated_at
  BEFORE UPDATE ON competency_skill_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capability_evidence_updated_at
  BEFORE UPDATE ON capability_evidence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TRIGGER FOR CAPABILITY CHANGE HISTORY
-- =============================================

CREATE OR REPLACE FUNCTION log_capability_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO capability_change_history (capability_id, change_type, new_values, changed_by)
    VALUES (NEW.id, 'created', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO capability_change_history (capability_id, change_type, previous_values, new_values, changed_by)
      VALUES (NEW.id, 'status_changed', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    ELSE
      INSERT INTO capability_change_history (capability_id, change_type, previous_values, new_values, changed_by)
      VALUES (NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER capability_change_audit
  AFTER INSERT OR UPDATE ON capabilities
  FOR EACH ROW EXECUTE FUNCTION log_capability_changes();

-- =============================================
-- INSERT DEFAULT PROFICIENCY SCALE
-- =============================================

INSERT INTO proficiency_scales (company_id, name, code, description, is_default, levels) VALUES
(NULL, 'Standard 5-Level Scale', 'STANDARD_5', 'Default proficiency scale with 5 levels', true, 
'[
  {"level": 1, "name": "Novice", "description": "Basic awareness, requires significant guidance"},
  {"level": 2, "name": "Beginner", "description": "Can perform with some guidance, developing skills"},
  {"level": 3, "name": "Intermediate", "description": "Competent, works independently on routine tasks"},
  {"level": 4, "name": "Advanced", "description": "Expert level, can guide others, handles complex situations"},
  {"level": 5, "name": "Master", "description": "Thought leader, innovates, sets standards"}
]'::jsonb);
