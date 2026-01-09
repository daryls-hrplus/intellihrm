-- Fix the version_bump constraint to allow 'initial'
ALTER TABLE manual_generation_runs 
DROP CONSTRAINT IF EXISTS manual_generation_runs_version_bump_check;

ALTER TABLE manual_generation_runs 
ADD CONSTRAINT manual_generation_runs_version_bump_check 
CHECK (version_bump = ANY (ARRAY['initial'::text, 'major'::text, 'minor'::text, 'patch'::text]));

-- Reset any stuck manual statuses
UPDATE manual_definitions 
SET generation_status = 'idle', updated_at = now()
WHERE generation_status = 'generating';