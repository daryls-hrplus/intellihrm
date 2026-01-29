
-- =============================================================================
-- Phase 1: Compliance Training Schema Alignment
-- Creates 3 new tables and adds 20+ fields to existing tables
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. COMPLIANCE ESCALATION RULES TABLE
-- Tiered escalation configuration for overdue compliance training
-- -----------------------------------------------------------------------------
CREATE TABLE public.compliance_escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  tier_level INT NOT NULL CHECK (tier_level BETWEEN 1 AND 4),
  tier_name TEXT NOT NULL,
  days_overdue_min INT NOT NULL,
  days_overdue_max INT,
  notification_roles TEXT[] NOT NULL DEFAULT '{}',
  notification_template_id UUID,
  sla_hours INT DEFAULT 24,
  actions JSONB DEFAULT '{}',
  escalate_to_role TEXT,
  include_hr_partner BOOLEAN DEFAULT false,
  include_department_head BOOLEAN DEFAULT false,
  auto_restrict_access BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(company_id, tier_level)
);

-- Enable RLS
ALTER TABLE public.compliance_escalation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view escalation rules for their company"
  ON public.compliance_escalation_rules FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage escalation rules"
  ON public.compliance_escalation_rules FOR ALL
  USING (public.is_admin_or_hr());

-- Index for performance
CREATE INDEX idx_escalation_rules_company ON public.compliance_escalation_rules(company_id);
CREATE INDEX idx_escalation_rules_tier ON public.compliance_escalation_rules(company_id, tier_level);

-- -----------------------------------------------------------------------------
-- 2. COMPLIANCE EXEMPTION APPROVAL CONFIG TABLE
-- Configuration for exemption approval chains
-- -----------------------------------------------------------------------------
CREATE TABLE public.compliance_exemption_approval_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  exemption_type TEXT NOT NULL,
  exemption_type_name TEXT NOT NULL,
  description TEXT,
  approval_levels TEXT[] NOT NULL DEFAULT '{"manager"}',
  requires_documentation BOOLEAN DEFAULT false,
  required_document_types TEXT[],
  max_exemption_days INT,
  renewable BOOLEAN DEFAULT true,
  max_renewals INT DEFAULT 1,
  sla_days INT DEFAULT 5,
  auto_expire BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(company_id, exemption_type)
);

-- Enable RLS
ALTER TABLE public.compliance_exemption_approval_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view exemption config for their company"
  ON public.compliance_exemption_approval_config FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage exemption config"
  ON public.compliance_exemption_approval_config FOR ALL
  USING (public.is_admin_or_hr());

-- Index
CREATE INDEX idx_exemption_config_company ON public.compliance_exemption_approval_config(company_id);

-- -----------------------------------------------------------------------------
-- 3. COMPLIANCE AUDIT LOG TABLE (Append-Only, Tamper-Evident)
-- SOX-compliant audit trail with checksum chain
-- -----------------------------------------------------------------------------
CREATE TABLE public.compliance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL DEFAULT 'compliance',
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  actor_id UUID,
  actor_type TEXT DEFAULT 'user',
  actor_name TEXT,
  actor_role TEXT,
  old_values JSONB,
  new_values JSONB,
  change_summary TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  checksum TEXT NOT NULL,
  previous_checksum TEXT,
  sequence_number BIGINT GENERATED ALWAYS AS IDENTITY
);

-- Enable RLS
ALTER TABLE public.compliance_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins/compliance officers can view audit logs
CREATE POLICY "Compliance officers can view audit logs"
  ON public.compliance_audit_log FOR SELECT
  USING (public.is_admin_or_hr() AND company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Insert policy for system/authenticated users
CREATE POLICY "System can insert audit logs"
  ON public.compliance_audit_log FOR INSERT
  WITH CHECK (true);

-- Indexes for audit log queries
CREATE INDEX idx_audit_log_company ON public.compliance_audit_log(company_id);
CREATE INDEX idx_audit_log_timestamp ON public.compliance_audit_log(event_timestamp DESC);
CREATE INDEX idx_audit_log_entity ON public.compliance_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor ON public.compliance_audit_log(actor_id);
CREATE INDEX idx_audit_log_event ON public.compliance_audit_log(event_type);

-- Function to prevent modification of audit records
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Audit log records cannot be modified or deleted';
  RETURN NULL;
END;
$$;

-- Immutability trigger - prevent UPDATE and DELETE
CREATE TRIGGER prevent_audit_modification
  BEFORE UPDATE OR DELETE ON public.compliance_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_modification();

-- Function to generate checksum for new audit entries
CREATE OR REPLACE FUNCTION public.generate_audit_checksum()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev_checksum TEXT;
  data_to_hash TEXT;
BEGIN
  -- Get the previous checksum
  SELECT checksum INTO prev_checksum
  FROM public.compliance_audit_log
  WHERE company_id = NEW.company_id
  ORDER BY sequence_number DESC
  LIMIT 1;
  
  NEW.previous_checksum := prev_checksum;
  
  -- Create data string for hashing
  data_to_hash := COALESCE(prev_checksum, 'GENESIS') || '|' ||
                  NEW.event_timestamp::TEXT || '|' ||
                  NEW.event_type || '|' ||
                  NEW.entity_type || '|' ||
                  NEW.entity_id::TEXT || '|' ||
                  COALESCE(NEW.actor_id::TEXT, 'SYSTEM') || '|' ||
                  COALESCE(NEW.old_values::TEXT, '') || '|' ||
                  COALESCE(NEW.new_values::TEXT, '');
  
  -- Generate SHA-256 checksum
  NEW.checksum := encode(sha256(data_to_hash::bytea), 'hex');
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate checksum on insert
CREATE TRIGGER generate_audit_checksum
  BEFORE INSERT ON public.compliance_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_audit_checksum();

-- -----------------------------------------------------------------------------
-- 4. ADD MISSING FIELDS TO compliance_training TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.compliance_training
  ADD COLUMN IF NOT EXISTS frequency_type TEXT DEFAULT 'annual',
  ADD COLUMN IF NOT EXISTS regulatory_body TEXT,
  ADD COLUMN IF NOT EXISTS region_code TEXT,
  ADD COLUMN IF NOT EXISTS target_locations UUID[],
  ADD COLUMN IF NOT EXISTS effective_date DATE,
  ADD COLUMN IF NOT EXISTS expiry_date DATE,
  ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS passing_score INT DEFAULT 80,
  ADD COLUMN IF NOT EXISTS allow_exemptions BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS grace_period_days INT DEFAULT 14,
  ADD COLUMN IF NOT EXISTS auto_assign BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS assignment_criteria JSONB DEFAULT '{}';

-- Add check constraint for frequency_type
ALTER TABLE public.compliance_training
  ADD CONSTRAINT check_frequency_type 
  CHECK (frequency_type IN ('one_time', 'annual', 'biannual', 'quarterly', 'monthly', 'custom'));

-- Add check constraint for risk_level
ALTER TABLE public.compliance_training
  ADD CONSTRAINT check_risk_level 
  CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));

-- Index for regulatory queries
CREATE INDEX IF NOT EXISTS idx_compliance_training_regulatory 
  ON public.compliance_training(regulatory_body);
CREATE INDEX IF NOT EXISTS idx_compliance_training_region 
  ON public.compliance_training(region_code);

-- -----------------------------------------------------------------------------
-- 5. ADD MISSING FIELDS TO compliance_training_assignments TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.compliance_training_assignments
  -- Escalation fields
  ADD COLUMN IF NOT EXISTS escalation_level INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS escalation_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_escalation_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS escalation_notes TEXT,
  ADD COLUMN IF NOT EXISTS escalation_resolved_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS escalation_resolved_at TIMESTAMPTZ,
  -- Exemption fields
  ADD COLUMN IF NOT EXISTS exemption_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS exemption_type TEXT,
  ADD COLUMN IF NOT EXISTS exemption_reason TEXT,
  ADD COLUMN IF NOT EXISTS exemption_start_date DATE,
  ADD COLUMN IF NOT EXISTS exemption_end_date DATE,
  ADD COLUMN IF NOT EXISTS exemption_requested_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS exemption_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS exemption_approved_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS exemption_approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS exemption_documents JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS exemption_notes TEXT,
  -- Priority and assignment tracking
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_reference_id UUID,
  -- Grace period tracking
  ADD COLUMN IF NOT EXISTS grace_period_extended BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS grace_period_end_date DATE,
  ADD COLUMN IF NOT EXISTS grace_period_approved_by UUID REFERENCES public.profiles(id),
  -- Risk scoring
  ADD COLUMN IF NOT EXISTS risk_score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_factors JSONB DEFAULT '{}',
  -- Completion tracking
  ADD COLUMN IF NOT EXISTS attempts INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS time_spent_minutes INT DEFAULT 0;

-- Add check constraints
ALTER TABLE public.compliance_training_assignments
  ADD CONSTRAINT check_exemption_status 
  CHECK (exemption_status IN ('none', 'pending', 'approved', 'rejected', 'expired'));

ALTER TABLE public.compliance_training_assignments
  ADD CONSTRAINT check_priority 
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

ALTER TABLE public.compliance_training_assignments
  ADD CONSTRAINT check_escalation_level 
  CHECK (escalation_level BETWEEN 0 AND 4);

-- Indexes for new fields
CREATE INDEX IF NOT EXISTS idx_assignments_escalation 
  ON public.compliance_training_assignments(escalation_level) 
  WHERE escalation_level > 0;
CREATE INDEX IF NOT EXISTS idx_assignments_exemption 
  ON public.compliance_training_assignments(exemption_status) 
  WHERE exemption_status != 'none';
CREATE INDEX IF NOT EXISTS idx_assignments_priority 
  ON public.compliance_training_assignments(priority);
CREATE INDEX IF NOT EXISTS idx_assignments_risk 
  ON public.compliance_training_assignments(risk_score DESC);

-- -----------------------------------------------------------------------------
-- 6. HELPER FUNCTION: Log Compliance Events
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_compliance_event(
  p_company_id UUID,
  p_event_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_change_summary TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID;
  v_actor_name TEXT;
  v_actor_role TEXT;
  v_log_id UUID;
BEGIN
  -- Get current user info
  v_actor_id := auth.uid();
  
  IF v_actor_id IS NOT NULL THEN
    SELECT 
      COALESCE(first_name || ' ' || last_name, email),
      role
    INTO v_actor_name, v_actor_role
    FROM public.profiles
    WHERE id = v_actor_id;
  END IF;
  
  -- Insert audit log entry
  INSERT INTO public.compliance_audit_log (
    company_id,
    event_type,
    entity_type,
    entity_id,
    actor_id,
    actor_name,
    actor_role,
    old_values,
    new_values,
    change_summary,
    metadata
  ) VALUES (
    p_company_id,
    p_event_type,
    p_entity_type,
    p_entity_id,
    v_actor_id,
    v_actor_name,
    v_actor_role,
    p_old_values,
    p_new_values,
    p_change_summary,
    p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 7. TRIGGER: Auto-log compliance training changes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trigger_compliance_training_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_compliance_event(
      NEW.company_id,
      'TRAINING_CREATED',
      'compliance_training',
      NEW.id,
      NULL,
      to_jsonb(NEW),
      'New compliance training requirement created: ' || NEW.name
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_compliance_event(
      NEW.company_id,
      'TRAINING_UPDATED',
      'compliance_training',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      'Compliance training updated: ' || NEW.name
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_compliance_event(
      OLD.company_id,
      'TRAINING_DELETED',
      'compliance_training',
      OLD.id,
      to_jsonb(OLD),
      NULL,
      'Compliance training deleted: ' || OLD.name
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_compliance_training
  AFTER INSERT OR UPDATE OR DELETE ON public.compliance_training
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_compliance_training_audit();

-- -----------------------------------------------------------------------------
-- 8. TRIGGER: Auto-log assignment status changes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trigger_assignment_status_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_training_name TEXT;
  v_event_type TEXT;
  v_summary TEXT;
BEGIN
  -- Get company_id and training name from compliance_training
  SELECT ct.company_id, ct.name 
  INTO v_company_id, v_training_name
  FROM public.compliance_training ct
  WHERE ct.id = COALESCE(NEW.compliance_training_id, OLD.compliance_training_id);
  
  -- Determine event type based on changes
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'ASSIGNMENT_CREATED';
    v_summary := 'Training assigned: ' || v_training_name;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check specific field changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      v_event_type := 'STATUS_CHANGED';
      v_summary := 'Status changed from ' || OLD.status || ' to ' || NEW.status;
    ELSIF OLD.exemption_status IS DISTINCT FROM NEW.exemption_status THEN
      v_event_type := 'EXEMPTION_' || UPPER(NEW.exemption_status);
      v_summary := 'Exemption ' || NEW.exemption_status;
    ELSIF OLD.escalation_level IS DISTINCT FROM NEW.escalation_level THEN
      v_event_type := 'ESCALATION_TIER_' || NEW.escalation_level;
      v_summary := 'Escalated to tier ' || NEW.escalation_level;
    ELSE
      v_event_type := 'ASSIGNMENT_UPDATED';
      v_summary := 'Assignment updated';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'ASSIGNMENT_DELETED';
    v_summary := 'Assignment deleted';
  END IF;
  
  -- Log the event
  IF v_company_id IS NOT NULL THEN
    PERFORM public.log_compliance_event(
      v_company_id,
      v_event_type,
      'compliance_training_assignments',
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
      CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END,
      v_summary
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_assignment_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.compliance_training_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_assignment_status_audit();

-- -----------------------------------------------------------------------------
-- 9. SEED DEFAULT ESCALATION RULES (will be inserted per company on first use)
-- -----------------------------------------------------------------------------
COMMENT ON TABLE public.compliance_escalation_rules IS 
  'Tiered escalation configuration for overdue compliance training. Supports 4 escalation tiers with configurable SLAs and actions.';

COMMENT ON TABLE public.compliance_exemption_approval_config IS 
  'Configuration for compliance training exemption types and their approval workflows.';

COMMENT ON TABLE public.compliance_audit_log IS 
  'SOX-compliant, tamper-evident audit trail for all compliance training operations. Uses SHA-256 checksum chain for integrity verification.';
