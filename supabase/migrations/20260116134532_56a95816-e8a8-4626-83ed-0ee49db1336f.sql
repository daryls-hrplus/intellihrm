-- Phase 1: Enterprise KRA-to-Appraisal Integration Schema Enhancement

-- 1.1 Add assessment mode to job_responsibilities
ALTER TABLE job_responsibilities 
ADD COLUMN IF NOT EXISTS assessment_mode TEXT DEFAULT 'auto';

-- Add check constraint for assessment_mode values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'job_responsibilities_assessment_mode_check'
  ) THEN
    ALTER TABLE job_responsibilities 
    ADD CONSTRAINT job_responsibilities_assessment_mode_check 
    CHECK (assessment_mode IN ('responsibility_only', 'kra_based', 'hybrid', 'auto'));
  END IF;
END $$;

COMMENT ON COLUMN job_responsibilities.assessment_mode IS 
'Determines how this responsibility is assessed in appraisals:
- responsibility_only: Rate the responsibility as a whole (1-5)
- kra_based: Rate each KRA individually, rollup to responsibility score
- hybrid: Rate both responsibility overall + individual KRAs
- auto: System decides based on whether KRAs exist';

-- 1.2 Add weight validation tracking
ALTER TABLE job_responsibilities 
ADD COLUMN IF NOT EXISTS kra_weights_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS kra_weights_validated_at TIMESTAMPTZ;

-- 1.3 Create Appraisal KRA Snapshot Table
CREATE TABLE IF NOT EXISTS appraisal_kra_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES appraisal_participants(id) ON DELETE CASCADE,
  responsibility_id UUID NOT NULL REFERENCES responsibilities(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Source reference
  source_kra_id UUID REFERENCES responsibility_kras(id) ON DELETE SET NULL,
  job_kra_id UUID REFERENCES job_responsibility_kras(id) ON DELETE SET NULL,
  
  -- Snapshot of KRA at time of appraisal
  name TEXT NOT NULL,
  description TEXT,
  target_metric TEXT,
  job_specific_target TEXT,
  measurement_method TEXT,
  weight NUMERIC NOT NULL DEFAULT 0,
  sequence_order INT DEFAULT 0,
  
  -- Self ratings
  self_rating NUMERIC CHECK (self_rating >= 1 AND self_rating <= 5),
  self_comments TEXT,
  self_rated_at TIMESTAMPTZ,
  
  -- Manager ratings
  manager_rating NUMERIC CHECK (manager_rating >= 1 AND manager_rating <= 5),
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  manager_comments TEXT,
  manager_rated_at TIMESTAMPTZ,
  
  -- Calculated scores
  calculated_score NUMERIC,
  final_score NUMERIC,
  weight_adjusted_score NUMERIC,
  
  -- Evidence
  evidence_urls TEXT[] DEFAULT '{}',
  achievement_notes TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'self_rated', 'manager_rated', 'completed', 'disputed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appraisal_kra_snapshots_participant ON appraisal_kra_snapshots(participant_id);
CREATE INDEX IF NOT EXISTS idx_appraisal_kra_snapshots_responsibility ON appraisal_kra_snapshots(responsibility_id);
CREATE INDEX IF NOT EXISTS idx_appraisal_kra_snapshots_source_kra ON appraisal_kra_snapshots(source_kra_id);
CREATE INDEX IF NOT EXISTS idx_appraisal_kra_snapshots_company ON appraisal_kra_snapshots(company_id);

-- Enable RLS
ALTER TABLE appraisal_kra_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies using correct app_role enum values
CREATE POLICY "Users can view KRA snapshots for their appraisals"
ON appraisal_kra_snapshots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM appraisal_participants ap 
    WHERE ap.id = participant_id 
    AND ap.employee_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM appraisal_participants ap 
    WHERE ap.id = participant_id 
    AND ap.evaluator_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin', 'hr_manager')
  )
);

CREATE POLICY "Users can update KRA snapshots for their appraisals"
ON appraisal_kra_snapshots FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM appraisal_participants ap 
    WHERE ap.id = participant_id 
    AND (ap.employee_id = auth.uid() OR ap.evaluator_id = auth.uid())
  )
  OR
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin', 'hr_manager')
  )
);

CREATE POLICY "HR and admins can insert KRA snapshots"
ON appraisal_kra_snapshots FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin', 'hr_manager')
  )
  OR
  EXISTS (
    SELECT 1 FROM appraisal_participants ap 
    WHERE ap.id = participant_id 
    AND (ap.employee_id = auth.uid() OR ap.evaluator_id = auth.uid())
  )
);

CREATE POLICY "HR and admins can delete KRA snapshots"
ON appraisal_kra_snapshots FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin')
  )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_appraisal_kra_snapshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_appraisal_kra_snapshots_updated_at ON appraisal_kra_snapshots;
CREATE TRIGGER trigger_appraisal_kra_snapshots_updated_at
  BEFORE UPDATE ON appraisal_kra_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_appraisal_kra_snapshots_updated_at();