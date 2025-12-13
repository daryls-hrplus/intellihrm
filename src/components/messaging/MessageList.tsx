import { useEffect, useRef } from "react";
import { Message } from "@/hooks/useMessaging";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreVertical,
  Reply,
  Smile,
  Pencil,
  Trash2,
  Check,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";

interface MessageListProps {
  messages: Message[];
  typingUsers: string[];
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

export const MessageList = ({
  messages,
  typingUsers,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}: MessageListProps) => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return `Yesterday ${format(date, "h:mm a")}`;
    return format(date, "MMM d, h:mm a");
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";

    msgs.forEach((msg) => {
      const msgDate = format(new Date(msg.created_at), "yyyy-MM-dd");
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const renderDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    let label: string;

    if (isToday(date)) {
      label = "Today";
    } else if (isYesterday(date)) {
      label = "Yesterday";
    } else {
      label = format(date, "MMMM d, yyyy");
    }

    return (
      <div className="flex items-center gap-4 my-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  };

  const renderMessage = (message: Message, isGrouped: boolean) => {
    const isOwn = message.sender_id === user?.id;
    const sender = message.sender;
    const reactions = message.reactions || [];

    // Group reactions by emoji
    const reactionGroups = reactions.reduce((acc, r) => {
      if (!acc[r.emoji]) acc[r.emoji] = [];
      acc[r.emoji].push(r.user_id);
      return acc;
    }, {} as Record<string, string[]>);

    return (
      <div
        key={message.id}
        className={cn(
          "group flex gap-3 px-4 py-1 hover:bg-muted/50 transition-colors",
          isGrouped && "pt-0"
        )}
      >
        {!isGrouped ? (
          <Avatar className="h-9 w-9 mt-1">
            <AvatarImage src={sender?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {sender?.full_name?.charAt(0) || sender?.email?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-9" />
        )}

        <div className="flex-1 min-w-0">
          {!isGrouped && (
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm">
                {sender?.full_name || sender?.email || "Unknown"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatMessageDate(new Date(message.created_at))}
              </span>
              {message.is_edited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>
          )}

          {message.reply_to && (
            <div className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2 mb-1 truncate">
              Replying to: {message.reply_to.content?.substring(0, 50)}...
            </div>
          )}

          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2 py-1 rounded"
                >
                  📎 {attachment.file_name}
                </a>
              ))}
            </div>
          )}

          {Object.keys(reactionGroups).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(reactionGroups).map(([emoji, userIds]) => (
                <TooltipProvider key={emoji}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onReaction(message.id, emoji)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                          userIds.includes(user?.id || "")
                            ? "bg-primary/10 border-primary/30"
                            : "bg-muted border-transparent hover:border-border"
                        )}
                      >
                        <span>{emoji}</span>
                        <span>{userIds.length}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {userIds.length} {userIds.length === 1 ? "person" : "people"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Smile className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="flex gap-1 p-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(message.id, emoji)}
                  className="text-lg hover:scale-125 transition-transform p-1"
                >
                  {emoji}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onReply(message)}
          >
            <Reply className="h-4 w-4" />
          </Button>

          {isOwn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(message)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(message.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messageGroups.map((group) => (
            <div key={group.date}>
              {renderDateSeparator(group.date)}
              {group.messages.map((message, idx) => {
                const prevMessage = idx > 0 ? group.messages[idx - 1] : null;
                const isGrouped =
                  prevMessage &&
                  prevMessage.sender_id === message.sender_id &&
                  new Date(message.created_at).getTime() -
                    new Date(prevMessage.created_at).getTime() <
                    60000;
                return renderMessage(message, !!isGrouped);
              })}
            </div>
          ))
        )}

        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            <span className="animate-pulse">
              {typingUsers.length === 1
                ? "Someone is typing..."
                : `${typingUsers.length} people are typing...`}
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};
