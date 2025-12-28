-- Add default_responsibilities JSONB column to job_families table
-- Structure: [{ responsibility_id: uuid, suggested_weight: number }]
ALTER TABLE public.job_families
ADD COLUMN IF NOT EXISTS default_responsibilities JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.job_families.default_responsibilities IS 'Array of default responsibilities with suggested weights for jobs in this family. Structure: [{ responsibility_id: uuid, suggested_weight: number }]';