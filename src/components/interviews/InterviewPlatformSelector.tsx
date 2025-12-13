import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, ExternalLink } from "lucide-react";

interface InterviewPlatformSelectorProps {
  platform: string;
  meetingLink?: string | null;
  zoomMeetingId?: string | null;
  teamsMeetingId?: string | null;
  onJoinBuiltIn: () => void;
}

export function InterviewPlatformSelector({
  platform,
  meetingLink,
  zoomMeetingId,
  teamsMeetingId,
  onJoinBuiltIn,
}: InterviewPlatformSelectorProps) {
  const getPlatformInfo = () => {
    switch (platform) {
      case "zoom":
        return {
          name: "Zoom",
          icon: "🎥",
          color: "bg-blue-500/10 text-blue-600",
          link: zoomMeetingId 
            ? `https://zoom.us/j/${zoomMeetingId}` 
            : meetingLink,
        };
      case "teams":
        return {
          name: "Microsoft Teams",
          icon: "👥",
          color: "bg-purple-500/10 text-purple-600",
          link: teamsMeetingId || meetingLink,
        };
      case "daily":
        return {
          name: "Video Call (Built-in)",
          icon: "📹",
          color: "bg-green-500/10 text-green-600",
          link: null,
        };
      default:
        return {
          name: "Custom Link",
          icon: "🔗",
          color: "bg-gray-500/10 text-gray-600",
          link: meetingLink,
        };
    }
  };

  const platformInfo = getPlatformInfo();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${platformInfo.color}`}>
              <Video className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{platformInfo.name}</p>
              <Badge variant="outline" className="mt-1">
                {platformInfo.icon} {platform === "daily" ? "Browser-based" : "External"}
              </Badge>
            </div>
          </div>

          {platform === "daily" ? (
            <Button onClick={onJoinBuiltIn}>
              <Video className="mr-2 h-4 w-4" />
              Join Video Call
            </Button>
          ) : platformInfo.link ? (
            <Button asChild>
              <a href={platformInfo.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Join on {platformInfo.name}
              </a>
            </Button>
          ) : (
            <Badge variant="secondary">No meeting link</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
