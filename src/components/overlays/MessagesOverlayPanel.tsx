import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessaging, Channel, Message } from "@/hooks/useMessaging";
import { useChannelMessages } from "@/hooks/useChannelMessages";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChannelList } from "@/components/messaging/ChannelList";
import { ChatHeader } from "@/components/messaging/ChatHeader";
import { MessageList } from "@/components/messaging/MessageList";
import { MessageInput } from "@/components/messaging/MessageInput";
import { CreateChannelDialog } from "@/components/messaging/CreateChannelDialog";
import { MessageSquare, Loader2, Maximize2 } from "lucide-react";

interface MessagesOverlayPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MessagesOverlayPanel({ isOpen, onClose }: MessagesOverlayPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"direct" | "group" | "channel">("direct");
  const [view, setView] = useState<"list" | "chat">("list");

  const {
    channels,
    loading: channelsLoading,
    createDirectChannel,
    createGroupChannel,
    createPublicChannel,
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

  // Reset view when panel closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedChannel(null);
      setView("list");
    }
  }, [isOpen]);

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    setReplyTo(null);
    setEditingMessage(null);
    setView("chat");
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
      setView("chat");
    }
  };

  const handleCreateGroup = async (name: string, memberIds: string[], description?: string) => {
    const channel = await createGroupChannel(name, memberIds, description);
    if (channel) {
      setSelectedChannel(channel as Channel);
      setCreateDialogOpen(false);
      setView("chat");
    }
  };

  const handleCreatePublicChannel = async (name: string, description?: string) => {
    const channel = await createPublicChannel(name, description);
    if (channel) {
      setSelectedChannel(channel as Channel);
      setCreateDialogOpen(false);
      setView("chat");
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

  const handleBackToList = () => {
    setSelectedChannel(null);
    setView("list");
  };

  const handleOpenFullPage = () => {
    onClose();
    navigate("/messages");
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="p-4 border-b space-y-1">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </SheetTitle>
              <Button variant="ghost" size="sm" onClick={handleOpenFullPage}>
                <Maximize2 className="h-4 w-4 mr-1" />
                Full Page
              </Button>
            </div>
            <SheetDescription>
              Quick access to your messages
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            {view === "list" ? (
              channelsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex-1 overflow-hidden">
                  <ChannelList
                    channels={channels}
                    selectedChannelId={selectedChannel?.id || null}
                    onSelectChannel={handleSelectChannel}
                    onCreateChannel={handleCreateChannel}
                  />
                </div>
              )
            ) : selectedChannel ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="border-b">
                  <ChatHeader
                    channel={selectedChannel}
                    onStartVideoCall={() => {}}
                    onBack={handleBackToList}
                    showBackButton
                  />
                </div>
                
                {messagesLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex-1 overflow-hidden">
                    <MessageList
                      messages={messages}
                      typingUsers={typingUsers}
                      onReply={setReplyTo}
                      onEdit={setEditingMessage}
                      onDelete={deleteMessage}
                      onReaction={handleReaction}
                    />
                  </div>
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
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-1">No conversation selected</h3>
                <p className="text-sm">Choose a conversation or start a new one</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

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
    </>
  );
}
