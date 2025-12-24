-- Add new columns to application_features for registry sync functionality
ALTER TABLE public.application_features 
ADD COLUMN IF NOT EXISTS feature_category text,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS last_synced_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS icon_name text,
ADD COLUMN IF NOT EXISTS module_code text,
ADD COLUMN IF NOT EXISTS group_code text,
ADD COLUMN IF NOT EXISTS group_name text;

-- Create index for feature sync queries
CREATE INDEX IF NOT EXISTS idx_application_features_feature_code ON public.application_features(feature_code);
CREATE INDEX IF NOT EXISTS idx_application_features_module_code ON public.application_features(module_code);
CREATE INDEX IF NOT EXISTS idx_application_features_source ON public.application_features(source);

-- Add comments for documentation
COMMENT ON COLUMN public.application_features.feature_category IS 'Category grouping from feature registry';
COMMENT ON COLUMN public.application_features.source IS 'Origin of feature: registry or manual';
COMMENT ON COLUMN public.application_features.last_synced_at IS 'Last time this feature was synced from registry';
COMMENT ON COLUMN public.application_features.module_code IS 'Module code from feature registry';
COMMENT ON COLUMN public.application_features.group_code IS 'Group code from feature registry';
COMMENT ON COLUMN public.application_features.group_name IS 'Group name from feature registry';