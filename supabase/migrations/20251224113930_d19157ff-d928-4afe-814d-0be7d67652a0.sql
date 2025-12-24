-- Add review workflow columns to enablement_tours
ALTER TABLE public.enablement_tours
ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'draft' CHECK (review_status IN ('draft', 'in_review', 'approved', 'rejected', 'published')),
ADD COLUMN IF NOT EXISTS generated_by text CHECK (generated_by IS NULL OR generated_by IN ('manual', 'ai', 'release_trigger')),
ADD COLUMN IF NOT EXISTS ai_generation_prompt text,
ADD COLUMN IF NOT EXISTS release_id uuid REFERENCES public.enablement_releases(id),
ADD COLUMN IF NOT EXISTS reviewed_by uuid,
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
ADD COLUMN IF NOT EXISTS review_notes text,
ADD COLUMN IF NOT EXISTS rejected_reason text;

-- Create index for review status queries
CREATE INDEX IF NOT EXISTS idx_enablement_tours_review_status ON public.enablement_tours(review_status);
CREATE INDEX IF NOT EXISTS idx_enablement_tours_release_id ON public.enablement_tours(release_id);
CREATE INDEX IF NOT EXISTS idx_enablement_tours_generated_by ON public.enablement_tours(generated_by);

-- Add comment for documentation
COMMENT ON COLUMN public.enablement_tours.review_status IS 'Workflow status: draft -> in_review -> approved/rejected -> published';
COMMENT ON COLUMN public.enablement_tours.generated_by IS 'Source of tour creation: manual, ai, or release_trigger';