import { Channel, ChannelMember } from "@/hooks/useMessaging";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Video,
  Phone,
  MoreVertical,
  Users,
  Settings,
  BellOff,
  LogOut,
  Info,
  MessageSquare,
  Hash,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatHeaderProps {
  channel: Channel;
  onStartVideoCall: () => void;
  onLeaveChannel?: () => void;
}

export const ChatHeader = ({
  channel,
  onStartVideoCall,
  onLeaveChannel,
}: ChatHeaderProps) => {
  const { user } = useAuth();

  const getChannelName = () => {
    if (channel.channel_type === "direct") {
      const otherMember = channel.members?.find(
        (m: ChannelMember) => m.user_id !== user?.id
      );
      return otherMember?.profile?.full_name || otherMember?.profile?.email || "Unknown";
    }
    return channel.name || "Unnamed";
  };

  const getChannelAvatar = () => {
    if (channel.channel_type === "direct") {
      const otherMember = channel.members?.find(
        (m: ChannelMember) => m.user_id !== user?.id
      );
      return otherMember?.profile?.avatar_url;
    }
    return channel.avatar_url;
  };

  const getChannelIcon = () => {
    switch (channel.channel_type) {
      case "direct":
        return <MessageSquare className="h-4 w-4" />;
      case "group":
        return <Users className="h-4 w-4" />;
      case "channel":
        return <Hash className="h-4 w-4" />;
    }
  };

  const getMemberCount = () => {
    return channel.members?.length || 0;
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={getChannelAvatar() || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getChannelIcon()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{getChannelName()}</h2>
          <p className="text-xs text-muted-foreground">
            {channel.channel_type === "direct"
              ? "Direct message"
              : `${getMemberCount()} members`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onStartVideoCall}
          title="Start video call"
        >
          <Video className="h-5 w-5" />
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="View members">
              <Users className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {channel.channel_type === "direct" ? "Participants" : "Members"}
              </DialogTitle>
              <DialogDescription>
                {getMemberCount()} {getMemberCount() === 1 ? "member" : "members"} in this{" "}
                {channel.channel_type === "channel" ? "channel" : "conversation"}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {channel.members?.map((member: ChannelMember) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {member.profile?.full_name?.charAt(0) ||
                          member.profile?.email?.charAt(0) ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {member.profile?.full_name || member.profile?.email}
                        {member.user_id === user?.id && " (you)"}
                      </p>
                      {member.role === "admin" && (
                        <span className="text-xs text-muted-foreground">Admin</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Info className="h-4 w-4 mr-2" />
              {channel.channel_type === "channel" ? "Channel" : "Conversation"} info
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BellOff className="h-4 w-4 mr-2" />
              Mute notifications
            </DropdownMenuItem>
            {channel.channel_type !== "direct" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLeaveChannel}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave {channel.channel_type === "channel" ? "channel" : "group"}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
