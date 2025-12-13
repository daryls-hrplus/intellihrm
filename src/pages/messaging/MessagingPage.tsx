import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useMessaging, Channel, Message } from "@/hooks/useMessaging";
import { useChannelMessages } from "@/hooks/useChannelMessages";
import { useVideoCall } from "@/hooks/useVideoCall";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChannelList } from "@/components/messaging/ChannelList";
import { ChatHeader } from "@/components/messaging/ChatHeader";
import { MessageList } from "@/components/messaging/MessageList";
import { MessageInput } from "@/components/messaging/MessageInput";
import { VideoCallModal } from "@/components/messaging/VideoCallModal";
import { CreateChannelDialog } from "@/components/messaging/CreateChannelDialog";
import { MessageSquare, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";

const MessagingPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"direct" | "group" | "channel">("direct");

  const {
    channels,
    loading: channelsLoading,
    createDirectChannel,
    createGroupChannel,
    createPublicChannel,
    fetchChannels,
  } = useMessaging(companyId || undefined);

  const {
    messages,
    loading: messagesLoading,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    setTyping,
  } = useChannelMessages(selectedChannel?.id || null);

  const {
    loading: videoLoading,
    activeCall,
    createRoom,
    endCall,
    leaveCall,
  } = useVideoCall();

  // Get user's company ID
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      
      if (data?.company_id) {
        setCompanyId(data.company_id);
      }
    };
    fetchCompanyId();
  }, [user]);

  // Handle direct message from URL params
  useEffect(() => {
    const userId = searchParams.get("user");
    if (userId && companyId) {
      handleCreateDirect(userId);
    }
  }, [searchParams, companyId]);

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    setReplyTo(null);
    setEditingMessage(null);
  };

  const handleCreateChannel = (type: "direct" | "group" | "channel") => {
    setCreateType(type);
    setCreateDialogOpen(true);
  };

  const handleCreateDirect = async (userId: string) => {
    const channel = await createDirectChannel(userId);
    if (channel) {
      setSelectedChannel(channel as Channel);
      setCreateDialogOpen(false);
    }
  };

  const handleCreateGroup = async (name: string, memberIds: string[], description?: string) => {
    const channel = await createGroupChannel(name, memberIds, description);
    if (channel) {
      setSelectedChannel(channel as Channel);
      setCreateDialogOpen(false);
    }
  };

  const handleCreatePublicChannel = async (name: string, description?: string) => {
    const channel = await createPublicChannel(name, description);
    if (channel) {
      setSelectedChannel(channel as Channel);
      setCreateDialogOpen(false);
    }
  };

  const handleSendMessage = async (content: string, replyToId?: string) => {
    await sendMessage(content, replyToId);
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    await editMessage(messageId, content);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    const message = messages.find((m) => m.id === messageId);
    const existingReaction = message?.reactions?.find(
      (r) => r.user_id === user?.id && r.emoji === emoji
    );

    if (existingReaction) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
  };

  const handleStartVideoCall = async () => {
    if (!selectedChannel) return;
    const channelName = selectedChannel.name || "Video Call";
    await createRoom(selectedChannel.id, channelName);
  };

  return (
    <>
      <Helmet>
        <title>Messages | HRIS</title>
        <meta name="description" content="Team messaging and communication" />
      </Helmet>

      <AppLayout>
        <div className="h-[calc(100vh-64px)] flex">
          {/* Channel List */}
          <div className="w-80 flex-shrink-0">
            {channelsLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChannelList
                channels={channels}
                selectedChannelId={selectedChannel?.id || null}
                onSelectChannel={handleSelectChannel}
                onCreateChannel={handleCreateChannel}
              />
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-background">
            {selectedChannel ? (
              <>
                <ChatHeader
                  channel={selectedChannel}
                  onStartVideoCall={handleStartVideoCall}
                />
                
                {messagesLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <MessageList
                    messages={messages}
                    typingUsers={typingUsers}
                    onReply={setReplyTo}
                    onEdit={setEditingMessage}
                    onDelete={deleteMessage}
                    onReaction={handleReaction}
                  />
                )}

                <MessageInput
                  onSendMessage={handleSendMessage}
                  onTyping={setTyping}
                  replyTo={replyTo}
                  editingMessage={editingMessage}
                  onCancelReply={() => setReplyTo(null)}
                  onCancelEdit={() => setEditingMessage(null)}
                  onEditMessage={handleEditMessage}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-1">No conversation selected</h3>
                <p className="text-sm">Choose a conversation or start a new one</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Channel Dialog */}
        <CreateChannelDialog
          isOpen={createDialogOpen}
          type={createType}
          companyId={companyId}
          onClose={() => setCreateDialogOpen(false)}
          onCreateDirect={handleCreateDirect}
          onCreateGroup={handleCreateGroup}
          onCreateChannel={handleCreatePublicChannel}
        />

        {/* Video Call Modal */}
        {activeCall && (
          <VideoCallModal
            isOpen={!!activeCall}
            roomUrl={activeCall.roomUrl}
            token={activeCall.token}
            onClose={leaveCall}
            onEndCall={endCall}
          />
        )}
      </AppLayout>
    </>
  );
};

export default MessagingPage;
