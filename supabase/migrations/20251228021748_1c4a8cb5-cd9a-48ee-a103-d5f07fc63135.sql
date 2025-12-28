-- Add operator_attributes column for optional refinement flags (seasonal, regulated, etc.)
ALTER TABLE public.master_industries 
ADD COLUMN IF NOT EXISTS operator_attributes JSONB DEFAULT NULL;

-- Add description column for sub-industry context
ALTER TABLE public.master_industries 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add index for parent_industry_id lookups
CREATE INDEX IF NOT EXISTS idx_master_industries_parent 
ON public.master_industries(parent_industry_id);

-- Comment on new columns
COMMENT ON COLUMN public.master_industries.operator_attributes IS 'Optional refinement flags: seasonal, high_risk, regulated, multi_site';
COMMENT ON COLUMN public.master_industries.description IS 'Description of the industry/sub-industry for display purposes';