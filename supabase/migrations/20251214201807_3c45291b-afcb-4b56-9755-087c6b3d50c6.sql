-- Add voice_enabled column to ai_user_settings for per-user voice access control
ALTER TABLE public.ai_user_settings 
ADD COLUMN IF NOT EXISTS voice_enabled boolean DEFAULT false;