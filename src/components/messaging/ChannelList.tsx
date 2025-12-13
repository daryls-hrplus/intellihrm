import { useState } from "react";
import { Channel, ChannelMember } from "@/hooks/useMessaging";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Users,
  Hash,
  Search,
  Plus,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ChannelListProps {
  channels: Channel[];
  selectedChannelId: string | null;
  onSelectChannel: (channel: Channel) => void;
  onCreateChannel: (type: "direct" | "group" | "channel") => void;
}

export const ChannelList = ({
  channels,
  selectedChannelId,
  onSelectChannel,
  onCreateChannel,
}: ChannelListProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const getChannelName = (channel: Channel) => {
    if (channel.channel_type === "direct") {
      const otherMember = channel.members?.find(
        (m: ChannelMember) => m.user_id !== user?.id
      );
      return otherMember?.profile?.full_name || otherMember?.profile?.email || "Unknown";
    }
    return channel.name || "Unnamed";
  };

  const getChannelAvatar = (channel: Channel) => {
    if (channel.channel_type === "direct") {
      const otherMember = channel.members?.find(
        (m: ChannelMember) => m.user_id !== user?.id
      );
      return otherMember?.profile?.avatar_url;
    }
    return channel.avatar_url;
  };

  const getChannelIcon = (channel: Channel) => {
    switch (channel.channel_type) {
      case "direct":
        return <MessageSquare className="h-4 w-4" />;
      case "group":
        return <Users className="h-4 w-4" />;
      case "channel":
        return <Hash className="h-4 w-4" />;
    }
  };

  const filteredChannels = channels.filter((channel) => {
    const name = getChannelName(channel).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const directChannels = filteredChannels.filter((c) => c.channel_type === "direct");
  const groupChannels = filteredChannels.filter((c) => c.channel_type === "group");
  const publicChannels = filteredChannels.filter((c) => c.channel_type === "channel");

  const renderChannelItem = (channel: Channel) => (
    <button
      key={channel.id}
      onClick={() => onSelectChannel(channel)}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
        selectedChannelId === channel.id
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted"
      )}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={getChannelAvatar(channel) || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getChannelIcon(channel)}
          </AvatarFallback>
        </Avatar>
        {channel.unread_count && channel.unread_count > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-xs"
          >
            {channel.unread_count > 99 ? "99+" : channel.unread_count}
          </Badge>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">{getChannelName(channel)}</span>
          {channel.last_message && (
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(channel.last_message.created_at), {
                addSuffix: false,
              })}
            </span>
          )}
        </div>
        {channel.last_message && (
          <p className="text-sm text-muted-foreground truncate">
            {channel.last_message.content}
          </p>
        )}
      </div>
    </button>
  );

  const renderSection = (title: string, items: Channel[], type: "direct" | "group" | "channel") => (
    <div className="mb-4">
      <div className="flex items-center justify-between px-3 mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onCreateChannel(type)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {items.length > 0 ? (
        <div className="space-y-1">
          {items.map(renderChannelItem)}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground px-3 py-2">
          No {title.toLowerCase()} yet
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold flex-1">Messages</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onCreateChannel("direct")}>
                <MessageSquare className="h-4 w-4 mr-2" />
                New Message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateChannel("group")}>
                <Users className="h-4 w-4 mr-2" />
                New Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateChannel("channel")}>
                <Hash className="h-4 w-4 mr-2" />
                New Channel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {renderSection("Direct Messages", directChannels, "direct")}
          {renderSection("Groups", groupChannels, "group")}
          {renderSection("Channels", publicChannels, "channel")}
        </div>
      </ScrollArea>
    </div>
  );
};
