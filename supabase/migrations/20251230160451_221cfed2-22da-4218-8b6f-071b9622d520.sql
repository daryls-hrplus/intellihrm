-- =====================================================
-- Employee Voice Beyond Self-Review - Phase 1: Database Schema
-- =====================================================

-- 1. Employee Review Responses Table
CREATE TABLE public.employee_review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  appraisal_participant_id UUID REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  goal_rating_submission_id UUID REFERENCES public.goal_rating_submissions(id) ON DELETE CASCADE,
  
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  response_type TEXT NOT NULL CHECK (response_type IN ('agree', 'agree_with_comments', 'disagree', 'partial_disagree')),
  employee_comments TEXT,
  specific_disagreements JSONB DEFAULT '[]'::jsonb,
  
  is_escalated_to_hr BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT,
  escalation_category TEXT CHECK (escalation_category IN ('clarification_needed', 'process_concern', 'rating_discussion', 'manager_feedback', 'other')),
  escalated_at TIMESTAMPTZ,
  
  hr_reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hr_response TEXT,
  hr_reviewed_at TIMESTAMPTZ,
  hr_action_taken TEXT CHECK (hr_action_taken IN ('no_action', 'manager_discussion', 'rating_adjusted', 'escalated_to_dispute', 'closed')),
  
  manager_rebuttal TEXT,
  manager_rebuttal_at TIMESTAMPTZ,
  
  visible_to_manager BOOLEAN DEFAULT TRUE,
  visible_to_hr BOOLEAN DEFAULT TRUE,
  visible_in_record BOOLEAN DEFAULT TRUE,
  
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'hr_review', 'manager_responded', 'closed')),
  
  submitted_at TIMESTAMPTZ,
  response_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT response_link_check CHECK (
    appraisal_participant_id IS NOT NULL OR goal_rating_submission_id IS NOT NULL
  )
);

-- 2. Employee Response Configuration Table
CREATE TABLE public.employee_response_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.appraisal_cycles(id) ON DELETE CASCADE,
  
  is_enabled BOOLEAN DEFAULT TRUE,
  response_window_days INTEGER DEFAULT 7,
  allow_late_responses BOOLEAN DEFAULT FALSE,
  allow_disagree BOOLEAN DEFAULT TRUE,
  allow_partial_disagree BOOLEAN DEFAULT TRUE,
  allow_hr_escalation BOOLEAN DEFAULT TRUE,
  require_comments_for_disagree BOOLEAN DEFAULT TRUE,
  show_response_to_manager BOOLEAN DEFAULT TRUE,
  allow_manager_rebuttal BOOLEAN DEFAULT TRUE,
  include_in_permanent_record BOOLEAN DEFAULT TRUE,
  notify_hr_on_disagreement BOOLEAN DEFAULT TRUE,
  notify_hr_on_escalation BOOLEAN DEFAULT TRUE,
  auto_escalate_on_disagree BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_company_cycle_config UNIQUE (company_id, cycle_id)
);

-- 3. Extend appraisal_participants table
ALTER TABLE public.appraisal_participants 
ADD COLUMN IF NOT EXISTS employee_response_status TEXT CHECK (employee_response_status IN ('pending', 'responded', 'escalated', 'closed')),
ADD COLUMN IF NOT EXISTS employee_response_due_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS has_employee_response BOOLEAN DEFAULT FALSE;

-- 4. Create indexes
CREATE INDEX idx_employee_review_responses_company ON public.employee_review_responses(company_id);
CREATE INDEX idx_employee_review_responses_employee ON public.employee_review_responses(employee_id);
CREATE INDEX idx_employee_review_responses_participant ON public.employee_review_responses(appraisal_participant_id);
CREATE INDEX idx_employee_review_responses_status ON public.employee_review_responses(status);
CREATE INDEX idx_employee_review_responses_escalated ON public.employee_review_responses(is_escalated_to_hr) WHERE is_escalated_to_hr = TRUE;
CREATE INDEX idx_employee_response_config_company ON public.employee_response_configuration(company_id);

-- 5. Enable RLS
ALTER TABLE public.employee_review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_response_configuration ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for employee_review_responses

-- Employees can view and manage their own responses
CREATE POLICY "Employees manage own responses"
ON public.employee_review_responses
FOR ALL
USING (employee_id = auth.uid())
WITH CHECK (employee_id = auth.uid());

-- Managers can view responses from their direct reports (if visible)
CREATE POLICY "Managers view team responses"
ON public.employee_review_responses
FOR SELECT
USING (
  visible_to_manager = TRUE AND
  manager_id = auth.uid()
);

-- Managers can add rebuttals to their team's responses
CREATE POLICY "Managers add rebuttals"
ON public.employee_review_responses
FOR UPDATE
USING (
  visible_to_manager = TRUE AND
  manager_id = auth.uid()
)
WITH CHECK (
  visible_to_manager = TRUE AND
  manager_id = auth.uid()
);

-- HR can view all responses for their company (join through profiles to get company)
CREATE POLICY "HR view company responses"
ON public.employee_review_responses
FOR SELECT
USING (
  visible_to_hr = TRUE AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('hr_manager', 'admin', 'system_admin')
    AND p.company_id = employee_review_responses.company_id
  )
);

-- HR can update responses (for HR response fields)
CREATE POLICY "HR update responses"
ON public.employee_review_responses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('hr_manager', 'admin', 'system_admin')
    AND p.company_id = employee_review_responses.company_id
  )
);

-- 7. RLS Policies for employee_response_configuration

-- HR/Admin can manage configuration
CREATE POLICY "HR manage response configuration"
ON public.employee_response_configuration
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('hr_manager', 'admin', 'system_admin')
    AND p.company_id = employee_response_configuration.company_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('hr_manager', 'admin', 'system_admin')
    AND p.company_id = employee_response_configuration.company_id
  )
);

-- All authenticated users can read configuration (for their company)
CREATE POLICY "Users read response configuration"
ON public.employee_response_configuration
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.company_id = employee_response_configuration.company_id
  )
);

-- 8. Updated_at triggers
CREATE TRIGGER update_employee_review_responses_updated_at
  BEFORE UPDATE ON public.employee_review_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_response_configuration_updated_at
  BEFORE UPDATE ON public.employee_response_configuration
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();