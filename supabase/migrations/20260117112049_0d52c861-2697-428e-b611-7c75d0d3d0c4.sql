-- Phase 1A: Unified Capability Framework - Schema Changes
-- Add VALUE to capability_type enum and add new columns

-- 1.1 Extend capability_type enum to include VALUE
ALTER TYPE capability_type ADD VALUE 'VALUE';

-- 1.2 Add value-specific fields to skills_competencies table
ALTER TABLE skills_competencies 
ADD COLUMN IF NOT EXISTS is_promotion_factor boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS assessment_mode text DEFAULT 'rated' CHECK (assessment_mode IN ('rated', 'qualitative')),
ADD COLUMN IF NOT EXISTS weight numeric(5,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- 1.3 Create unified appraisal_capability_scores table
CREATE TABLE IF NOT EXISTS appraisal_capability_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES appraisal_participants(id) ON DELETE CASCADE,
  capability_id uuid NOT NULL REFERENCES skills_competencies(id) ON DELETE CASCADE,
  capability_type capability_type NOT NULL,
  rating numeric(3,1),
  demonstrated_behaviors text[],
  evidence text,
  comments text,
  assessed_by uuid REFERENCES profiles(id),
  assessment_source text DEFAULT 'self' CHECK (assessment_source IN ('self', 'manager', 'peer', '360', 'calibration')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(participant_id, capability_id, assessment_source)
);

-- Enable RLS on the new table
ALTER TABLE appraisal_capability_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appraisal_capability_scores
CREATE POLICY "Users can view capability scores for their appraisals"
ON appraisal_capability_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM appraisal_participants ap
    WHERE ap.id = appraisal_capability_scores.participant_id
    AND (ap.employee_id = auth.uid() OR ap.evaluator_id = auth.uid())
  )
);

CREATE POLICY "Evaluators can insert capability scores"
ON appraisal_capability_scores FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM appraisal_participants ap
    WHERE ap.id = appraisal_capability_scores.participant_id
    AND ap.evaluator_id = auth.uid()
  )
);

CREATE POLICY "Evaluators can update capability scores"
ON appraisal_capability_scores FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM appraisal_participants ap
    WHERE ap.id = appraisal_capability_scores.participant_id
    AND ap.evaluator_id = auth.uid()
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_capability_scores_participant ON appraisal_capability_scores(participant_id);
CREATE INDEX IF NOT EXISTS idx_capability_scores_capability ON appraisal_capability_scores(capability_id);
CREATE INDEX IF NOT EXISTS idx_skills_competencies_type ON skills_competencies(type);
CREATE INDEX IF NOT EXISTS idx_skills_competencies_promotion ON skills_competencies(is_promotion_factor) WHERE is_promotion_factor = true;

-- 1.4 Create mapping table for value ID migration (for existing appraisal_value_scores)
CREATE TABLE IF NOT EXISTS value_capability_mapping (
  old_value_id uuid PRIMARY KEY,
  new_capability_id uuid REFERENCES skills_competencies(id),
  migrated_at timestamptz DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_appraisal_capability_scores_updated_at
  BEFORE UPDATE ON appraisal_capability_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();