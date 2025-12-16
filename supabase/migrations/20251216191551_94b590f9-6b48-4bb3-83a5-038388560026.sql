-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;

-- Update unique constraint to allow null user_id for shared preferences
ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_preference_key_key;
ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_user_id_preference_key_key 
  UNIQUE NULLS NOT DISTINCT (user_id, preference_key);

-- Create new RLS policies

-- All authenticated users can view shared preferences (user_id IS NULL) and their own
CREATE POLICY "Users can view shared and own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid())
);

-- Only admins can insert shared preferences, users can insert their own
CREATE POLICY "Users can insert own, admins can insert shared" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    (user_id = auth.uid()) OR 
    (user_id IS NULL AND public.has_role(auth.uid(), 'admin'))
  )
);

-- Only admins can update shared preferences, users can update their own
CREATE POLICY "Users can update own, admins can update shared" 
ON public.user_preferences 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    (user_id = auth.uid()) OR 
    (user_id IS NULL AND public.has_role(auth.uid(), 'admin'))
  )
);

-- Only admins can delete shared preferences, users can delete their own
CREATE POLICY "Users can delete own, admins can delete shared" 
ON public.user_preferences 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND (
    (user_id = auth.uid()) OR 
    (user_id IS NULL AND public.has_role(auth.uid(), 'admin'))
  )
);