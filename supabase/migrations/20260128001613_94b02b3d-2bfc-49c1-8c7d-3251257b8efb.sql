-- Add review tracking columns to application_features table
-- These columns enable the "Keep/Retain" action for orphan management

ALTER TABLE public.application_features
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS review_status text CHECK (review_status IN ('kept', 'needs_review')),
ADD COLUMN IF NOT EXISTS review_notes text;

-- Add comment for documentation
COMMENT ON COLUMN public.application_features.reviewed_at IS 'Timestamp when the feature was reviewed for orphan management';
COMMENT ON COLUMN public.application_features.reviewed_by IS 'User ID who reviewed and marked this feature';
COMMENT ON COLUMN public.application_features.review_status IS 'Review status: kept (intentionally retained), needs_review (flagged for review)';
COMMENT ON COLUMN public.application_features.review_notes IS 'Optional notes explaining why the feature was kept';

-- Create index for efficient filtering of kept entries
CREATE INDEX IF NOT EXISTS idx_application_features_review_status 
ON public.application_features(review_status) 
WHERE review_status IS NOT NULL;