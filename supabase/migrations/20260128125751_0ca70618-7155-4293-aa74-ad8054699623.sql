-- Add created_by column to application_features
ALTER TABLE public.application_features 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_application_features_created_by 
ON public.application_features(created_by);

-- Comment for documentation
COMMENT ON COLUMN public.application_features.created_by IS 'User ID who created this feature entry';