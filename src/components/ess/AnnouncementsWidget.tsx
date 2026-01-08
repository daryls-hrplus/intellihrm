import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAnnouncementReads } from "@/hooks/useAnnouncementReads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Bell, ChevronRight, Check, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  requires_acknowledgement: boolean;
  is_pinned: boolean;
  publish_at: string | null;
  created_at: string;
}

export function AnnouncementsWidget() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { isRead, isAcknowledged, acknowledgeAnnouncement, markAsRead } = useAnnouncementReads();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["ess-announcements-widget", user?.id, profile?.company_id],
    queryFn: async () => {
      if (!user?.id || !profile?.company_id) return [];

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("company_announcements")
        .select("id, title, content, priority, requires_acknowledgement, is_pinned, publish_at, created_at")
        .eq("company_id", profile.company_id)
        .eq("is_active", true)
        .or(`publish_at.is.null,publish_at.lte.${now}`)
        .or(`expire_at.is.null,expire_at.gte.${now}`)
        .order("is_pinned", { ascending: false })
        .order("priority", { ascending: true }) // urgent first
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return (data || []) as Announcement[];
    },
    enabled: !!user?.id && !!profile?.company_id,
    staleTime: 1000 * 60 * 2,
  });

  // Filter to show unread or requires acknowledgement
  const relevantAnnouncements = announcements.filter(ann => {
    const needsAck = ann.requires_acknowledgement && !isAcknowledged(ann.id);
    const unread = !isRead(ann.id);
    return needsAck || unread;
  }).slice(0, 3);

  const unreadCount = announcements.filter(ann => !isRead(ann.id)).length;
  const needsAckCount = announcements.filter(ann => ann.requires_acknowledgement && !isAcknowledged(ann.id)).length;

  const handleAcknowledge = async (e: React.MouseEvent, announcementId: string) => {
    e.stopPropagation();
    await acknowledgeAnnouncement(announcementId);
  };

  const handleView = (announcement: Announcement) => {
    markAsRead(announcement.id);
    navigate("/ess/announcements");
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-destructive/30 bg-destructive/5";
      case "high":
        return "border-orange-500/30 bg-orange-500/5";
      default:
        return "border-border";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case "high":
        return <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">High</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relevantAnnouncements.length === 0) {
    return null; // Hide widget when no relevant announcements
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            Announcements
          </CardTitle>
          {(unreadCount > 0 || needsAckCount > 0) && (
            <Badge variant={needsAckCount > 0 ? "destructive" : "secondary"}>
              {needsAckCount > 0 ? `${needsAckCount} action required` : `${unreadCount} new`}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {relevantAnnouncements.map((announcement) => {
          const needsAck = announcement.requires_acknowledgement && !isAcknowledged(announcement.id);
          const unread = !isRead(announcement.id);

          return (
            <div
              key={announcement.id}
              onClick={() => handleView(announcement)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${getPriorityStyles(announcement.priority)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {unread && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                    <span className="font-medium text-sm truncate">{announcement.title}</span>
                    {getPriorityBadge(announcement.priority)}
                    {announcement.is_pinned && (
                      <Badge variant="outline" className="text-xs">Pinned</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {announcement.content.replace(/<[^>]*>/g, "").slice(0, 100)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(announcement.publish_at || announcement.created_at), { addSuffix: true })}
                  </p>
                </div>
                {needsAck ? (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={(e) => handleAcknowledge(e, announcement.id)}
                    className="shrink-0"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Acknowledge
                  </Button>
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                )}
              </div>
            </div>
          );
        })}

        <Button
          variant="ghost"
          className="w-full text-sm"
          onClick={() => navigate("/ess/announcements")}
        >
          View All Announcements
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
