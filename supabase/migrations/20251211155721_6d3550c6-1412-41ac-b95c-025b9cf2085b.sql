-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  ticket_assigned BOOLEAN NOT NULL DEFAULT true,
  ticket_status_changed BOOLEAN NOT NULL DEFAULT true,
  ticket_comment_added BOOLEAN NOT NULL DEFAULT true,
  access_request_updates BOOLEAN NOT NULL DEFAULT true,
  system_announcements BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON public.notification_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON public.notification_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON public.notification_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_notification_preferences_user ON public.notification_preferences(user_id);