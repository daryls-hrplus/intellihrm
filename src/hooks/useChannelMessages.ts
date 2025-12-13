import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Message, MessageReaction } from "./useMessaging";

export const useChannelMessages = (channelId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const fetchMessages = useCallback(async () => {
    if (!channelId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, email, avatar_url),
          reactions:message_reactions(*),
          attachments:message_attachments(*)
        `)
        .eq("channel_id", channelId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data as Message[]);

      // Mark messages as read
      await markAsRead();
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  const sendMessage = async (content: string, replyToId?: string) => {
    if (!user || !channelId || !content.trim()) return null;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim(),
          reply_to_id: replyToId || null,
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Update channel's updated_at
      await supabase
        .from("messaging_channels")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", channelId);

      // Clear typing indicator
      await clearTyping();

      return data as Message;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return null;
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    if (!user || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from("messages")
        .update({
          content: content.trim(),
          is_edited: true,
        })
        .eq("id", messageId)
        .eq("sender_id", user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error editing message:", error);
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("messages")
        .update({ is_deleted: true })
        .eq("id", messageId)
        .eq("sender_id", user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
      return false;
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("message_reactions")
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });

      if (error && error.code !== "23505") throw error; // Ignore unique violation
      return true;
    } catch (error) {
      console.error("Error adding reaction:", error);
      return false;
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("emoji", emoji);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error removing reaction:", error);
      return false;
    }
  };

  const markAsRead = async () => {
    if (!user || !channelId) return;

    try {
      await supabase
        .from("messaging_channel_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("channel_id", channelId)
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const setTyping = async () => {
    if (!user || !channelId) return;

    try {
      await supabase
        .from("typing_indicators")
        .upsert({
          channel_id: channelId,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error("Error setting typing:", error);
    }
  };

  const clearTyping = async () => {
    if (!user || !channelId) return;

    try {
      await supabase
        .from("typing_indicators")
        .delete()
        .eq("channel_id", channelId)
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error clearing typing:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!channelId || !user) return;

    const messagesSubscription = supabase
      .channel(`messages-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch the new message with full details
            supabase
              .from("messages")
              .select(`
                *,
                sender:profiles!messages_sender_id_fkey(id, full_name, email, avatar_url),
                reactions:message_reactions(*),
                attachments:message_attachments(*)
              `)
              .eq("id", payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setMessages((prev) => [...prev, data as Message]);
                  markAsRead();
                }
              });
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id
                  ? { ...msg, ...payload.new }
                  : msg
              )
            );
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        () => {
          // Refresh messages to get updated reactions
          fetchMessages();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_indicators",
          filter: `channel_id=eq.${channelId}`,
        },
        async () => {
          // Fetch current typing users
          const { data } = await supabase
            .from("typing_indicators")
            .select("user_id")
            .eq("channel_id", channelId)
            .neq("user_id", user.id)
            .gt("updated_at", new Date(Date.now() - 5000).toISOString());
          
          setTypingUsers(data?.map((t) => t.user_id) || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [channelId, user]);

  return {
    messages,
    loading,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    setTyping,
    clearTyping,
    markAsRead,
    fetchMessages,
  };
};
