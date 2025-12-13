import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Channel {
  id: string;
  company_id: string;
  name: string | null;
  description: string | null;
  channel_type: "direct" | "group" | "channel";
  is_private: boolean;
  created_by: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  members?: ChannelMember[];
  last_message?: Message;
  unread_count?: number;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  last_read_at: string | null;
  is_muted: boolean;
  notifications_enabled: boolean;
  profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string | null;
  reply_to_id: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  reply_to?: Message;
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  thumbnail_url: string | null;
}

export const useMessaging = (companyId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messaging_channels")
        .select(`
          *,
          members:messaging_channel_members(
            *,
            profile:profiles(id, full_name, email, avatar_url)
          )
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Get last message and unread count for each channel
      const channelsWithDetails = await Promise.all(
        (data || []).map(async (channel) => {
          // Get last message
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("*, sender:profiles(id, full_name, email, avatar_url)")
            .eq("channel_id", channel.id)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const memberInfo = channel.members?.find((m: ChannelMember) => m.user_id === user.id);
          let unreadCount = 0;
          
          if (memberInfo?.last_read_at) {
            const { count } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("channel_id", channel.id)
              .eq("is_deleted", false)
              .neq("sender_id", user.id)
              .gt("created_at", memberInfo.last_read_at);
            
            unreadCount = count || 0;
          }

          return {
            ...channel,
            last_message: lastMessage || undefined,
            unread_count: unreadCount,
          };
        })
      );

      setChannels(channelsWithDetails as Channel[]);
    } catch (error) {
      console.error("Error fetching channels:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createDirectChannel = async (otherUserId: string) => {
    if (!user || !companyId) return null;

    try {
      // Check if direct channel already exists
      const { data: existingChannels } = await supabase
        .from("messaging_channels")
        .select(`
          *,
          members:messaging_channel_members(user_id)
        `)
        .eq("channel_type", "direct")
        .eq("company_id", companyId);

      const existingChannel = existingChannels?.find((channel) => {
        const memberIds = channel.members?.map((m: { user_id: string }) => m.user_id) || [];
        return memberIds.includes(user.id) && memberIds.includes(otherUserId) && memberIds.length === 2;
      });

      if (existingChannel) {
        return existingChannel;
      }

      // Create new direct channel
      const { data: channel, error: channelError } = await supabase
        .from("messaging_channels")
        .insert({
          company_id: companyId,
          channel_type: "direct",
          is_private: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (channelError) throw channelError;

      // Add both users as members
      const { error: membersError } = await supabase
        .from("messaging_channel_members")
        .insert([
          { channel_id: channel.id, user_id: user.id, role: "admin" },
          { channel_id: channel.id, user_id: otherUserId, role: "admin" },
        ]);

      if (membersError) throw membersError;

      await fetchChannels();
      return channel;
    } catch (error) {
      console.error("Error creating direct channel:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      return null;
    }
  };

  const createGroupChannel = async (name: string, memberIds: string[], description?: string) => {
    if (!user || !companyId) return null;

    try {
      const { data: channel, error: channelError } = await supabase
        .from("messaging_channels")
        .insert({
          company_id: companyId,
          name,
          description,
          channel_type: "group",
          is_private: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (channelError) throw channelError;

      // Add all members including creator
      const allMemberIds = [...new Set([user.id, ...memberIds])];
      const membersToInsert = allMemberIds.map((userId) => ({
        channel_id: channel.id,
        user_id: userId,
        role: userId === user.id ? "admin" : "member",
      }));

      const { error: membersError } = await supabase
        .from("messaging_channel_members")
        .insert(membersToInsert);

      if (membersError) throw membersError;

      await fetchChannels();
      return channel;
    } catch (error) {
      console.error("Error creating group channel:", error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
      return null;
    }
  };

  const createPublicChannel = async (name: string, description?: string) => {
    if (!user || !companyId) return null;

    try {
      const { data: channel, error: channelError } = await supabase
        .from("messaging_channels")
        .insert({
          company_id: companyId,
          name,
          description,
          channel_type: "channel",
          is_private: false,
          created_by: user.id,
        })
        .select()
        .single();

      if (channelError) throw channelError;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from("messaging_channel_members")
        .insert({
          channel_id: channel.id,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) throw memberError;

      await fetchChannels();
      return channel;
    } catch (error) {
      console.error("Error creating public channel:", error);
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Subscribe to channel updates
  useEffect(() => {
    if (!user) return;

    const channelsSubscription = supabase
      .channel("messaging-channels")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messaging_channel_members" },
        () => fetchChannels()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelsSubscription);
    };
  }, [user, fetchChannels]);

  return {
    channels,
    loading,
    fetchChannels,
    createDirectChannel,
    createGroupChannel,
    createPublicChannel,
  };
};
