-- Fix RLS recursion for messaging_channel_members by using SECURITY DEFINER helper functions

-- Helper: membership check (bypasses RLS inside function)
CREATE OR REPLACE FUNCTION public.is_messaging_channel_member(
  p_channel_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  select exists (
    select 1
    from public.messaging_channel_members m
    where m.channel_id = p_channel_id
      and m.user_id = p_user_id
  );
$$;

-- Helper: admin check (bypasses RLS inside function)
CREATE OR REPLACE FUNCTION public.is_messaging_channel_admin(
  p_channel_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  select exists (
    select 1
    from public.messaging_channel_members m
    where m.channel_id = p_channel_id
      and m.user_id = p_user_id
      and m.role = 'admin'
  );
$$;

-- messaging_channel_members policies
ALTER TABLE public.messaging_channel_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view members of their channels" ON public.messaging_channel_members;
DROP POLICY IF EXISTS "Channel admins can add members" ON public.messaging_channel_members;
DROP POLICY IF EXISTS "Channel admins can remove members" ON public.messaging_channel_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.messaging_channel_members;

CREATE POLICY "Users can view members of their channels"
ON public.messaging_channel_members
FOR SELECT
TO authenticated
USING (public.is_messaging_channel_member(channel_id, auth.uid()));

CREATE POLICY "Channel admins can add members"
ON public.messaging_channel_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR public.is_messaging_channel_admin(channel_id, auth.uid())
);

CREATE POLICY "Channel admins can remove members"
ON public.messaging_channel_members
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_messaging_channel_admin(channel_id, auth.uid())
);

CREATE POLICY "Users can update their own membership"
ON public.messaging_channel_members
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- messaging_channels policies (fix previously incorrect self-references)
ALTER TABLE public.messaging_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view channels they are members of" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can create channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Channel admins can update channels" ON public.messaging_channels;

CREATE POLICY "Users can view channels they are members of"
ON public.messaging_channels
FOR SELECT
TO authenticated
USING (
  ((channel_type = 'channel'::channel_type) AND (is_private = false))
  OR public.is_messaging_channel_member(id, auth.uid())
);

CREATE POLICY "Users can create channels"
ON public.messaging_channels
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Channel admins can update channels"
ON public.messaging_channels
FOR UPDATE
TO authenticated
USING (public.is_messaging_channel_admin(id, auth.uid()))
WITH CHECK (public.is_messaging_channel_admin(id, auth.uid()));

-- messages policies: use helper to avoid depending on messaging_channel_members RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their channels" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their channels" ON public.messages;

CREATE POLICY "Users can view messages in their channels"
ON public.messages
FOR SELECT
TO authenticated
USING (public.is_messaging_channel_member(channel_id, auth.uid()));

CREATE POLICY "Users can send messages to their channels"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND public.is_messaging_channel_member(channel_id, auth.uid())
);
