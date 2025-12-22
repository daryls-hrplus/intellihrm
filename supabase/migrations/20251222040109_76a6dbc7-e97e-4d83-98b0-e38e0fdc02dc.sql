-- Remove job_family_id column from positions table
-- Positions should only link to jobs via job_id

ALTER TABLE public.positions DROP COLUMN IF EXISTS job_family_id;