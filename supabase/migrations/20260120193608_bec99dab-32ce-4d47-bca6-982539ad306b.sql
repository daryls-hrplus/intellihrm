-- Phase 1: Industry-Standard Self-Assessment Schema Enhancement

-- Add self-rating columns to appraisal_scores for side-by-side comparison
ALTER TABLE appraisal_scores 
ADD COLUMN IF NOT EXISTS self_rating numeric,
ADD COLUMN IF NOT EXISTS self_comments text,
ADD COLUMN IF NOT EXISTS self_rated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS self_metadata jsonb DEFAULT '{}'::jsonb;

-- Add appraisal linkage columns to performance_evidence
ALTER TABLE performance_evidence 
ADD COLUMN IF NOT EXISTS participant_id uuid REFERENCES appraisal_participants(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS score_item_id uuid REFERENCES appraisal_scores(id) ON DELETE SET NULL;

-- Create index for efficient evidence lookups by participant
CREATE INDEX IF NOT EXISTS idx_performance_evidence_participant 
ON performance_evidence(participant_id) WHERE participant_id IS NOT NULL;

-- Create index for efficient evidence lookups by score item
CREATE INDEX IF NOT EXISTS idx_performance_evidence_score_item 
ON performance_evidence(score_item_id) WHERE score_item_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN appraisal_scores.self_rating IS 'Employee self-assessment rating for this item';
COMMENT ON COLUMN appraisal_scores.self_comments IS 'Employee self-assessment comments/justification';
COMMENT ON COLUMN appraisal_scores.self_rated_at IS 'Timestamp when employee submitted self-rating';
COMMENT ON COLUMN appraisal_scores.self_metadata IS 'Additional self-assessment data (behavioral indicators selected, etc.)';
COMMENT ON COLUMN performance_evidence.participant_id IS 'Links evidence to specific appraisal participation';
COMMENT ON COLUMN performance_evidence.score_item_id IS 'Links evidence to specific appraisal score item';