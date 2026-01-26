-- ============================================================================
-- Chapter 4 Industry Standards Enhancement Migration
-- Adds missing governance fields and new regulatory compliance tables
-- ============================================================================

-- Part A.2: Enhance existing governance tables with missing fields

-- 1. Enhance feedback_investigation_requests with scope and closure tracking
ALTER TABLE public.feedback_investigation_requests 
  ADD COLUMN IF NOT EXISTS scope_limitations JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.feedback_investigation_requests.scope_limitations 
  IS 'JSON object defining access boundaries during investigation';
COMMENT ON COLUMN public.feedback_investigation_requests.closed_at 
  IS 'When investigation was formally closed';

-- 2. Enhance feedback_investigation_access_log with identity disclosure tracking
ALTER TABLE public.feedback_investigation_access_log 
  ADD COLUMN IF NOT EXISTS rater_identity_revealed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS access_justification TEXT DEFAULT NULL;

COMMENT ON COLUMN public.feedback_investigation_access_log.rater_identity_revealed 
  IS 'Whether rater identity was disclosed during this access';
COMMENT ON COLUMN public.feedback_investigation_access_log.access_justification 
  IS 'Reason for this specific data access';

-- 3. Enhance feedback_exceptions with lifecycle tracking
ALTER TABLE public.feedback_exceptions 
  ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS revocation_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS revoked_by UUID REFERENCES profiles(id) DEFAULT NULL;

COMMENT ON COLUMN public.feedback_exceptions.valid_from 
  IS 'When the exception becomes effective (if different from approval)';
COMMENT ON COLUMN public.feedback_exceptions.revocation_reason 
  IS 'Reason for revoking an approved exception early';
COMMENT ON COLUMN public.feedback_exceptions.revoked_at 
  IS 'When the exception was revoked';
COMMENT ON COLUMN public.feedback_exceptions.revoked_by 
  IS 'User who revoked the exception';

-- 4. Enhance feedback_ai_action_logs with explainability workflow
ALTER TABLE public.feedback_ai_action_logs 
  ADD COLUMN IF NOT EXISTS decision_factors JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS human_review_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS human_reviewed_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS human_reviewed_by UUID REFERENCES profiles(id) DEFAULT NULL;

COMMENT ON COLUMN public.feedback_ai_action_logs.decision_factors 
  IS 'Explainability data: factors and weights influencing AI decision';
COMMENT ON COLUMN public.feedback_ai_action_logs.human_review_required 
  IS 'Whether human review is needed before action takes effect';
COMMENT ON COLUMN public.feedback_ai_action_logs.human_reviewed_at 
  IS 'When the human review was completed';
COMMENT ON COLUMN public.feedback_ai_action_logs.human_reviewed_by 
  IS 'User who performed the human review';

-- 5. Enhance feedback_data_policies with naming and versioning
ALTER TABLE public.feedback_data_policies 
  ADD COLUMN IF NOT EXISTS policy_name TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS policy_version TEXT DEFAULT '1.0.0';

COMMENT ON COLUMN public.feedback_data_policies.policy_name 
  IS 'Human-readable policy name for display';
COMMENT ON COLUMN public.feedback_data_policies.policy_version 
  IS 'Semantic version for policy change tracking';

-- ============================================================================
-- Part B: New Industry-Standard Regulatory Compliance Tables
-- ============================================================================

-- B.1 Data Subject Rights (DSAR) Requests Table
CREATE TABLE IF NOT EXISTS public.feedback_dsar_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection')),
  request_details JSONB DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'verified', 'processing', 'completed', 'denied')),
  response_due_date DATE NOT NULL,
  verification_method TEXT DEFAULT NULL,
  verified_at TIMESTAMPTZ DEFAULT NULL,
  verified_by UUID REFERENCES profiles(id) DEFAULT NULL,
  processing_notes TEXT DEFAULT NULL,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  completed_by UUID REFERENCES profiles(id) DEFAULT NULL,
  response_summary TEXT DEFAULT NULL,
  denial_reason TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_dsar_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for DSAR requests
CREATE POLICY "HR/Admin can view all DSAR requests" 
  ON public.feedback_dsar_requests 
  FOR SELECT 
  USING (public.is_admin_or_hr());

CREATE POLICY "Employees can view own DSAR requests" 
  ON public.feedback_dsar_requests 
  FOR SELECT 
  USING (auth.uid() = employee_id);

CREATE POLICY "Employees can create own DSAR requests" 
  ON public.feedback_dsar_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "HR/Admin can update DSAR requests" 
  ON public.feedback_dsar_requests 
  FOR UPDATE 
  USING (public.is_admin_or_hr());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_feedback_dsar_requests_company 
  ON public.feedback_dsar_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_feedback_dsar_requests_employee 
  ON public.feedback_dsar_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_feedback_dsar_requests_status 
  ON public.feedback_dsar_requests(status);

COMMENT ON TABLE public.feedback_dsar_requests 
  IS 'Data Subject Access Request tracking for GDPR Articles 15-22 compliance';

-- B.2 Data Breach Incidents Table
CREATE TABLE IF NOT EXISTS public.feedback_breach_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES feedback_360_cycles(id) DEFAULT NULL,
  breach_type TEXT NOT NULL CHECK (breach_type IN ('confidentiality', 'integrity', 'availability')),
  breach_description TEXT NOT NULL,
  affected_records_count INTEGER DEFAULT NULL,
  affected_data_categories JSONB DEFAULT NULL,
  detection_timestamp TIMESTAMPTZ NOT NULL,
  detection_method TEXT DEFAULT NULL,
  reported_by UUID REFERENCES profiles(id) DEFAULT NULL,
  notification_deadline TIMESTAMPTZ DEFAULT NULL, -- detection + 72 hours
  authority_notified_at TIMESTAMPTZ DEFAULT NULL,
  authority_notification_ref TEXT DEFAULT NULL,
  individuals_notified_at TIMESTAMPTZ DEFAULT NULL,
  notification_method TEXT DEFAULT NULL,
  root_cause_analysis TEXT DEFAULT NULL,
  remediation_actions JSONB DEFAULT NULL,
  remediation_completed_at TIMESTAMPTZ DEFAULT NULL,
  lessons_learned TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'assessed', 'notified', 'remediated', 'closed')),
  closed_at TIMESTAMPTZ DEFAULT NULL,
  closed_by UUID REFERENCES profiles(id) DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_breach_incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for breach incidents (highly restricted)
CREATE POLICY "HR/Admin can manage breach incidents" 
  ON public.feedback_breach_incidents 
  FOR ALL 
  USING (public.is_admin_or_hr());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_feedback_breach_incidents_company 
  ON public.feedback_breach_incidents(company_id);
CREATE INDEX IF NOT EXISTS idx_feedback_breach_incidents_status 
  ON public.feedback_breach_incidents(status);

COMMENT ON TABLE public.feedback_breach_incidents 
  IS 'Data breach incident tracking for GDPR Article 33 (72-hour notification) compliance';

-- B.3 Cross-Border Data Transfer Records Table
CREATE TABLE IF NOT EXISTS public.feedback_data_transfer_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  source_jurisdiction TEXT NOT NULL,
  destination_jurisdiction TEXT NOT NULL,
  transfer_mechanism TEXT NOT NULL CHECK (transfer_mechanism IN ('adequacy', 'sccs', 'bcrs', 'consent', 'derogation')),
  data_categories JSONB DEFAULT NULL,
  purpose TEXT NOT NULL,
  recipient_name TEXT DEFAULT NULL,
  recipient_details JSONB DEFAULT NULL,
  safeguards_description TEXT DEFAULT NULL,
  transfer_impact_assessment_ref TEXT DEFAULT NULL,
  transfer_start_date DATE DEFAULT NULL,
  transfer_end_date DATE DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES profiles(id) DEFAULT NULL,
  approved_at TIMESTAMPTZ DEFAULT NULL,
  review_due_date DATE DEFAULT NULL,
  last_reviewed_at TIMESTAMPTZ DEFAULT NULL,
  last_reviewed_by UUID REFERENCES profiles(id) DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_data_transfer_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transfer records
CREATE POLICY "HR/Admin can manage data transfer records" 
  ON public.feedback_data_transfer_records 
  FOR ALL 
  USING (public.is_admin_or_hr());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_feedback_data_transfer_company 
  ON public.feedback_data_transfer_records(company_id);
CREATE INDEX IF NOT EXISTS idx_feedback_data_transfer_active 
  ON public.feedback_data_transfer_records(is_active);

COMMENT ON TABLE public.feedback_data_transfer_records 
  IS 'Cross-border data transfer records for GDPR Chapter V compliance';

-- B.4 Data Protection Impact Assessment (DPIA) Records Table
CREATE TABLE IF NOT EXISTS public.feedback_dpia_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  assessment_name TEXT NOT NULL,
  assessment_reference TEXT DEFAULT NULL,
  processing_description TEXT NOT NULL,
  data_categories JSONB DEFAULT NULL,
  processing_purposes JSONB DEFAULT NULL,
  data_subjects_categories JSONB DEFAULT NULL,
  necessity_assessment TEXT DEFAULT NULL,
  proportionality_assessment TEXT DEFAULT NULL,
  risk_assessment JSONB DEFAULT NULL, -- array of {risk, likelihood, severity, mitigation}
  residual_risk_level TEXT DEFAULT 'medium' CHECK (residual_risk_level IN ('low', 'medium', 'high', 'critical')),
  mitigating_measures JSONB DEFAULT NULL,
  dpo_consultation_date DATE DEFAULT NULL,
  dpo_recommendation TEXT DEFAULT NULL,
  supervisory_consultation_required BOOLEAN DEFAULT false,
  supervisory_consultation_date DATE DEFAULT NULL,
  supervisory_consultation_outcome TEXT DEFAULT NULL,
  approval_status TEXT NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending_review', 'pending_dpo', 'approved', 'rejected', 'requires_update')),
  approved_by UUID REFERENCES profiles(id) DEFAULT NULL,
  approved_at TIMESTAMPTZ DEFAULT NULL,
  rejection_reason TEXT DEFAULT NULL,
  next_review_date DATE DEFAULT NULL,
  last_reviewed_at TIMESTAMPTZ DEFAULT NULL,
  last_reviewed_by UUID REFERENCES profiles(id) DEFAULT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  supersedes_id UUID REFERENCES public.feedback_dpia_records(id) DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_dpia_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for DPIA records
CREATE POLICY "HR/Admin can manage DPIA records" 
  ON public.feedback_dpia_records 
  FOR ALL 
  USING (public.is_admin_or_hr());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_feedback_dpia_company 
  ON public.feedback_dpia_records(company_id);
CREATE INDEX IF NOT EXISTS idx_feedback_dpia_status 
  ON public.feedback_dpia_records(approval_status);

COMMENT ON TABLE public.feedback_dpia_records 
  IS 'Data Protection Impact Assessment records for GDPR Article 35 compliance';

-- ============================================================================
-- Triggers for updated_at timestamps
-- ============================================================================

CREATE TRIGGER update_feedback_dsar_requests_updated_at
  BEFORE UPDATE ON public.feedback_dsar_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_breach_incidents_updated_at
  BEFORE UPDATE ON public.feedback_breach_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_data_transfer_records_updated_at
  BEFORE UPDATE ON public.feedback_data_transfer_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_dpia_records_updated_at
  BEFORE UPDATE ON public.feedback_dpia_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();