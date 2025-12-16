-- Add last_login and force_password_change fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS force_password_change boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS failed_login_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamp with time zone;

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles(last_login_at);

-- Comment on new columns
COMMENT ON COLUMN public.profiles.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN public.profiles.force_password_change IS 'Require password change on next login';
COMMENT ON COLUMN public.profiles.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN public.profiles.locked_until IS 'Account locked until this timestamp';