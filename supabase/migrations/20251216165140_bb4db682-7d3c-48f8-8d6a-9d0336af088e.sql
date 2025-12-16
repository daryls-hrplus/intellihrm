-- Add user management fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS invited_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS invitation_status text DEFAULT 'active' CHECK (invitation_status IN ('pending', 'active', 'expired'));

-- Add index for filtering active users
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- Update existing profiles to have is_active = true
UPDATE public.profiles SET is_active = true WHERE is_active IS NULL;

-- Comment on new columns
COMMENT ON COLUMN public.profiles.is_active IS 'Whether the user account is enabled/disabled';
COMMENT ON COLUMN public.profiles.invited_at IS 'When the user was last invited';
COMMENT ON COLUMN public.profiles.invitation_status IS 'Status of user invitation: pending, active, expired';