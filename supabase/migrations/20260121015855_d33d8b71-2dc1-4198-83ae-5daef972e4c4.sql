-- Drop the old check constraint and add the new one with level_based
ALTER TABLE public.directory_visibility_config 
  DROP CONSTRAINT directory_visibility_config_visibility_mode_check;

ALTER TABLE public.directory_visibility_config 
  ADD CONSTRAINT directory_visibility_config_visibility_mode_check 
  CHECK (visibility_mode = ANY (ARRAY['all'::text, 'role_based'::text, 'grade_based'::text, 'level_based'::text, 'none'::text]));