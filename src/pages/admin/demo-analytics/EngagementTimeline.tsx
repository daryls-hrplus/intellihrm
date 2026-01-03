import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Play,
  CheckCircle,
  MousePointerClick,
  Eye,
  User,
  Clock,
  Video,
  FileText,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  event_type: string;
  video_watch_percentage: number;
  time_spent_seconds: number;
  event_data: unknown;
  created_at: string;
  experience_name: string | null;
  chapter_title: string | null;
}

interface EngagementTimelineProps {
  events: TimelineEvent[];
}

const eventConfig: Record<string, { icon: typeof Play; color: string; label: string }> = {
  experience_start: { icon: Play, color: "text-blue-500", label: "Started Experience" },
  experience_complete: { icon: CheckCircle, color: "text-green-500", label: "Completed Experience" },
  chapter_start: { icon: Video, color: "text-purple-500", label: "Started Chapter" },
  chapter_complete: { icon: CheckCircle, color: "text-green-500", label: "Completed Chapter" },
  video_progress: { icon: Play, color: "text-blue-500", label: "Video Progress" },
  video_complete: { icon: CheckCircle, color: "text-green-500", label: "Video Complete" },
  cta_click: { icon: MousePointerClick, color: "text-orange-500", label: "CTA Click" },
  lead_capture: { icon: User, color: "text-emerald-500", label: "Lead Captured" },
  page_view: { icon: Eye, color: "text-gray-500", label: "Page View" },
  book_demo: { icon: FileText, color: "text-pink-500", label: "Demo Booked" },
  request_trial: { icon: FileText, color: "text-cyan-500", label: "Trial Requested" },
};

export function EngagementTimeline({ events }: EngagementTimelineProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No engagement events recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Engagement Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {events.map((event, index) => {
              const config = eventConfig[event.event_type] || {
                icon: Eye,
                color: "text-gray-500",
                label: event.event_type,
              };
              const Icon = config.icon;

              return (
                <div key={event.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-2 w-5 h-5 rounded-full bg-background border-2 flex items-center justify-center ${config.color.replace("text-", "border-")}`}
                  >
                    <Icon className={`h-3 w-3 ${config.color}`} />
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{config.label}</p>
                        {event.experience_name && (
                          <p className="text-xs text-muted-foreground">
                            {event.experience_name}
                            {event.chapter_title && ` → ${event.chapter_title}`}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.created_at), "MMM d, HH:mm")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {event.video_watch_percentage > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          {event.video_watch_percentage}% watched
                        </Badge>
                      )}
                      {event.time_spent_seconds > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.time_spent_seconds}s
                        </Badge>
                      )}
                      {event.event_data && typeof event.event_data === "object" && Object.keys(event.event_data as object).length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          +{Object.keys(event.event_data as object).length} details
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
