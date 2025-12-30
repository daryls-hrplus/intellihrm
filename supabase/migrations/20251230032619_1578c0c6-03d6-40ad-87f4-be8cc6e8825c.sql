-- Add metadata column to appraisal_scores for storing competency behavioral assessment data
ALTER TABLE public.appraisal_scores
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

-- Add comment explaining the column's purpose
COMMENT ON COLUMN public.appraisal_scores.metadata IS 'Stores additional assessment metadata like demonstrated behaviors, evidence, and selected proficiency level for competency evaluations';