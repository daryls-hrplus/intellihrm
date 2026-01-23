-- =====================================================
-- PHASE 2: Training Request Workflow Enhancement
-- =====================================================

-- 2.1 Add source tracking and approval chain columns to training_requests
ALTER TABLE training_requests 
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS source_reference_id uuid,
ADD COLUMN IF NOT EXISTS source_module text,
ADD COLUMN IF NOT EXISTS current_approval_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_approval_levels integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS approval_chain jsonb DEFAULT '[]'::jsonb;

-- Add comment for source_type values
COMMENT ON COLUMN training_requests.source_type IS 'Source of request: manual, onboarding, appraisal, recertification, competency_gap';

-- 2.2 Create training request approval history table
CREATE TABLE IF NOT EXISTS training_request_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES training_requests(id) ON DELETE CASCADE,
  approval_level integer NOT NULL DEFAULT 1,
  approver_id uuid REFERENCES profiles(id),
  approver_role text,
  action text NOT NULL CHECK (action IN ('approved', 'rejected', 'returned', 'escalated')),
  comments text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on training_request_approvals
ALTER TABLE training_request_approvals ENABLE ROW LEVEL SECURITY;

-- RLS policies for training_request_approvals
CREATE POLICY "Users can view approvals for their company requests"
ON training_request_approvals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM training_requests tr
    JOIN profiles p ON p.company_id = tr.company_id
    WHERE tr.id = training_request_approvals.request_id
    AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can insert approvals if they are approvers"
ON training_request_approvals FOR INSERT
WITH CHECK (auth.uid() = approver_id);

-- =====================================================
-- PHASE 3.1: Onboarding → Training Trigger
-- =====================================================

-- Create function to auto-enroll employees when onboarding task has training_course_id
CREATE OR REPLACE FUNCTION trigger_onboarding_training_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  v_employee_id uuid;
  v_company_id uuid;
  v_course_title text;
BEGIN
  -- Only process if training_course_id is set and task is being assigned
  IF NEW.training_course_id IS NOT NULL THEN
    -- Get the employee and company from the onboarding instance
    SELECT oi.employee_id, oi.company_id INTO v_employee_id, v_company_id
    FROM onboarding_instances oi 
    WHERE oi.id = NEW.instance_id;
    
    IF v_employee_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Get course title
    SELECT title INTO v_course_title
    FROM lms_courses 
    WHERE id = NEW.training_course_id;
    
    -- Create LMS enrollment if not exists
    INSERT INTO lms_enrollments (course_id, user_id, status, enrolled_by)
    VALUES (NEW.training_course_id, v_employee_id, 'enrolled', NEW.assigned_to_id)
    ON CONFLICT (course_id, user_id) DO NOTHING;
    
    -- Create training request with source tracking (auto-approved since from onboarding)
    INSERT INTO training_requests (
      company_id, 
      employee_id, 
      training_name, 
      request_type,
      source_type, 
      source_reference_id, 
      source_module, 
      status
    )
    VALUES (
      v_company_id, 
      v_employee_id, 
      COALESCE(v_course_title, 'Onboarding Training'),
      'internal',
      'onboarding', 
      NEW.id, 
      'Onboarding', 
      'approved'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on onboarding_tasks
DROP TRIGGER IF EXISTS onboarding_task_training_trigger ON onboarding_tasks;
CREATE TRIGGER onboarding_task_training_trigger
AFTER INSERT OR UPDATE OF training_course_id ON onboarding_tasks
FOR EACH ROW 
WHEN (NEW.training_course_id IS NOT NULL)
EXECUTE FUNCTION trigger_onboarding_training_enrollment();

-- =====================================================
-- PHASE 3.4: Competency → Course Mapping
-- =====================================================

-- Create table to map competencies to recommended courses
CREATE TABLE IF NOT EXISTS competency_course_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  competency_id uuid REFERENCES competencies(id) ON DELETE CASCADE,
  course_id uuid REFERENCES lms_courses(id) ON DELETE CASCADE,
  min_gap_level integer DEFAULT 1 CHECK (min_gap_level >= 1 AND min_gap_level <= 5),
  is_mandatory boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  UNIQUE(company_id, competency_id, course_id)
);

-- Enable RLS
ALTER TABLE competency_course_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view mappings for their company"
ON competency_course_mappings FOR SELECT
USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "HR can manage mappings"
ON competency_course_mappings FOR ALL
USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
)
WITH CHECK (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);

-- =====================================================
-- PHASE 3.3: Recertification Tracking Enhancements
-- =====================================================

-- Add reminder tracking to employee_recertifications if not exists
ALTER TABLE employee_recertifications
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS auto_request_created boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_request_id uuid REFERENCES training_requests(id);

-- Create index for efficient recertification queries
CREATE INDEX IF NOT EXISTS idx_employee_recertifications_expiry 
ON employee_recertifications(expiry_date) 
WHERE status = 'active';

-- =====================================================
-- Add scheduled job for recertification reminders
-- =====================================================
INSERT INTO scheduled_jobs (
  job_name, 
  job_description, 
  edge_function_name, 
  is_enabled, 
  interval_minutes, 
  run_days,
  timezone
) VALUES (
  'recertification-reminders',
  'Process expiring certifications and auto-create renewal training requests',
  'process-recertification-reminders',
  true, 
  1440,
  ARRAY[1,2,3,4,5],
  'UTC'
) ON CONFLICT (job_name) DO NOTHING;