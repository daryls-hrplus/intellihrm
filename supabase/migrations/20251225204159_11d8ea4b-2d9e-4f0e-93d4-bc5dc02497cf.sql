-- Add edit-locking fields to appraisal_cycles
ALTER TABLE public.appraisal_cycles
ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS locked_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS locked_by uuid REFERENCES public.profiles(id);

-- Add manager override justification fields to appraisal_scores
ALTER TABLE public.appraisal_scores
ADD COLUMN IF NOT EXISTS is_overridden boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS original_rating numeric,
ADD COLUMN IF NOT EXISTS override_justification text,
ADD COLUMN IF NOT EXISTS overridden_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS overridden_at timestamp with time zone;

-- Add index for querying locked cycles
CREATE INDEX IF NOT EXISTS idx_appraisal_cycles_locked ON public.appraisal_cycles(is_locked) WHERE is_locked = true;

-- Add index for querying overridden scores
CREATE INDEX IF NOT EXISTS idx_appraisal_scores_overridden ON public.appraisal_scores(is_overridden) WHERE is_overridden = true;

-- Comment on new columns for documentation
COMMENT ON COLUMN public.appraisal_cycles.is_locked IS 'When true, prevents edits to goals/scores in this cycle';
COMMENT ON COLUMN public.appraisal_cycles.locked_at IS 'Timestamp when the cycle was locked';
COMMENT ON COLUMN public.appraisal_cycles.locked_by IS 'User who locked the cycle';
COMMENT ON COLUMN public.appraisal_scores.is_overridden IS 'Indicates if this score was overridden by a manager';
COMMENT ON COLUMN public.appraisal_scores.original_rating IS 'The original rating before manager override';
COMMENT ON COLUMN public.appraisal_scores.override_justification IS 'Required justification for the score override';
COMMENT ON COLUMN public.appraisal_scores.overridden_by IS 'Manager who performed the override';
COMMENT ON COLUMN public.appraisal_scores.overridden_at IS 'Timestamp of the override';