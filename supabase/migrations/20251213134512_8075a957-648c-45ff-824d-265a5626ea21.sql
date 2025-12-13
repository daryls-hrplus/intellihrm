-- Create message channel types enum
CREATE TYPE public.channel_type AS ENUM ('direct', 'group', 'channel');

-- Create message status enum
CREATE TYPE public.message_status AS ENUM ('sent', 'delivered', 'read');

-- Create channels/conversations table
CREATE TABLE public.messaging_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  description TEXT,
  channel_type public.channel_type NOT NULL DEFAULT 'direct',
  is_private BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create channel members table
CREATE TABLE public.messaging_channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.messaging_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- admin, moderator, member
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(channel_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.messaging_channels(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  content TEXT,
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create message attachments table
CREATE TABLE public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create message reactions table
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create message read receipts table
CREATE TABLE public.message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Create video calls table
CREATE TABLE public.video_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.messaging_channels(id) ON DELETE CASCADE NOT NULL,
  initiated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  room_name TEXT NOT NULL,
  room_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, ended
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER
);

-- Create video call participants table
CREATE TABLE public.video_call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.video_calls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  UNIQUE(call_id, user_id)
);

-- Create typing indicators table (for real-time typing status)
CREATE TABLE public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.messaging_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_messaging_channels_company ON public.messaging_channels(company_id);
CREATE INDEX idx_messaging_channel_members_user ON public.messaging_channel_members(user_id);
CREATE INDEX idx_messages_channel ON public.messages(channel_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX idx_message_reactions_message ON public.message_reactions(message_id);
CREATE INDEX idx_message_read_receipts_message ON public.message_read_receipts(message_id);
CREATE INDEX idx_video_calls_channel ON public.video_calls(channel_id);

-- Enable RLS on all tables
ALTER TABLE public.messaging_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messaging_channels
CREATE POLICY "Users can view channels they are members of"
ON public.messaging_channels FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_channel_members
    WHERE channel_id = id AND user_id = auth.uid()
  )
  OR (channel_type = 'channel' AND is_private = false)
);

CREATE POLICY "Users can create channels"
ON public.messaging_channels FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Channel admins can update channels"
ON public.messaging_channels FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_channel_members
    WHERE channel_id = id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for messaging_channel_members
CREATE POLICY "Users can view members of their channels"
ON public.messaging_channel_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_channel_members cm
    WHERE cm.channel_id = messaging_channel_members.channel_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Channel admins can add members"
ON public.messaging_channel_members FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.messaging_channel_members
    WHERE channel_id = messaging_channel_members.channel_id AND user_id = auth.uid() AND role = 'admin'
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Users can update their own membership"
ON public.messaging_channel_members FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Channel admins can remove members"
ON public.messaging_channel_members FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.messaging_channel_members
    WHERE channel_id = messaging_channel_members.channel_id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their channels"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_channel_members
    WHERE channel_id = messages.channel_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their channels"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.messaging_channel_members
    WHERE channel_id = messages.channel_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can edit their own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
ON public.messages FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- RLS Policies for message_attachments
CREATE POLICY "Users can view attachments in their channels"
ON public.message_attachments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.messaging_channel_members cm ON m.channel_id = cm.channel_id
    WHERE m.id = message_attachments.message_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add attachments to their messages"
ON public.message_attachments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.messages
    WHERE id = message_attachments.message_id AND sender_id = auth.uid()
  )
);

-- RLS Policies for message_reactions
CREATE POLICY "Users can view reactions in their channels"
ON public.message_reactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.messaging_channel_members cm ON m.channel_id = cm.channel_id
    WHERE m.id = message_reactions.message_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add reactions"
ON public.message_reactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their reactions"
ON public.message_reactions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for message_read_receipts
CREATE POLICY "Users can view read receipts in their channels"
ON public.message_read_receipts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.messaging_channel_members cm ON m.channel_id = cm.channel_id
    WHERE m.id = message_read_receipts.message_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can mark messages as read"
ON public.message_read_receipts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policies for video_calls
CREATE POLICY "Users can view calls in their channels"
ON public.video_calls FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_channel_members
    WHERE channel_id = video_calls.channel_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create calls in their channels"
ON public.video_calls FOR INSERT
TO authenticated
WITH CHECK (
  initiated_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.messaging_channel_members
    WHERE channel_id = video_calls.channel_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Call initiator can update call"
ON public.video_calls FOR UPDATE
TO authenticated
USING (initiated_by = auth.uid());

-- RLS Policies for video_call_participants
CREATE POLICY "Users can view participants in their calls"
ON public.video_call_participants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.video_calls vc
    JOIN public.messaging_channel_members cm ON vc.channel_id = cm.channel_id
    WHERE vc.id = video_call_participants.call_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join calls"
ON public.video_call_participants FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their participation"
ON public.video_call_participants FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for typing_indicators
CREATE POLICY "Users can view typing in their channels"
ON public.typing_indicators FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_channel_members
    WHERE channel_id = typing_indicators.channel_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their typing status"
ON public.typing_indicators FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own typing"
ON public.typing_indicators FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own typing"
ON public.typing_indicators FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Enable realtime for messaging tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messaging_channel_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_calls;

-- Add triggers for updated_at
CREATE TRIGGER update_messaging_channels_updated_at
  BEFORE UPDATE ON public.messaging_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Daily API key setting placeholder
INSERT INTO public.system_settings (key, value, description, is_sensitive)
VALUES ('daily_api_key', '', 'Daily.co API key for video chat functionality', true)
ON CONFLICT (key) DO NOTHING;