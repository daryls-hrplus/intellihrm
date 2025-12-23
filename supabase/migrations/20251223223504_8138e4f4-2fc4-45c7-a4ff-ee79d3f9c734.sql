-- Add scale_purpose column to performance_rating_scales table
ALTER TABLE public.performance_rating_scales 
ADD COLUMN IF NOT EXISTS scale_purpose text[] DEFAULT ARRAY['appraisal']::text[];