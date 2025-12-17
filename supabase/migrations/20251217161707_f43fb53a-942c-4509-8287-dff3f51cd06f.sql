-- Allow NULL user_id for shared preferences (like menu order)
ALTER TABLE public.user_preferences ALTER COLUMN user_id DROP NOT NULL;

-- Drop the old unique constraint that doesn't handle NULLs properly
ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_preference_key_key;

-- Create a unique index that handles NULL user_id
CREATE UNIQUE INDEX IF NOT EXISTS user_preferences_unique_key 
ON public.user_preferences (preference_key, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'));

-- Ensure proper index for lookups
DROP INDEX IF EXISTS idx_user_preferences_user_key;
CREATE INDEX idx_user_preferences_lookup ON public.user_preferences(preference_key, user_id);