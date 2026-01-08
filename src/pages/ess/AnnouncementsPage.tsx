import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Megaphone, Pin, AlertCircle, AlertTriangle, Info, Check, Eye, CheckCircle2 } from "lucide-react";
import { useAnnouncementReads } from "@/hooks/useAnnouncementReads";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  is_pinned: boolean;
  publish_at: string | null;
  created_at: string;
  requires_acknowledgement: boolean;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { 
    markAsRead, 
    acknowledgeAnnouncement, 
    isRead, 
    isAcknowledged,
    getUnreadCount,
    loading: readsLoading 
  } = useAnnouncementReads();

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // Auto-mark as read when viewing announcements
  useEffect(() => {
    if (!readsLoading && announcements.length > 0) {
      announcements.forEach(ann => {
        if (!isRead(ann.id)) {
          markAsRead(ann.id);
        }
      });
    }
  }, [announcements, readsLoading]);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("company_announcements")
        .select("*")
        .eq("is_active", true)
        .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
        .or(`expire_at.is.null,expire_at.gte.${new Date().toISOString()}`)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      setAnnouncements((data || []) as Announcement[]);
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async (announcementId: string) => {
    await acknowledgeAnnouncement(announcementId);
    toast.success("Acknowledgement recorded");
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-4 border-l-red-500";
      case "high":
        return "border-l-4 border-l-orange-500";
      default:
        return "border-l-4 border-l-blue-500";
    }
  };

  const breadcrumbItems = [
    { label: "Employee Self-Service", href: "/ess" },
    { label: "Announcements" },
  ];

  const unreadCount = getUnreadCount(announcements.map(a => a.id));

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Company Announcements</h1>
              <p className="text-muted-foreground">Stay updated with the latest news</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No announcements at this time</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => {
              const read = isRead(ann.id);
              const acknowledged = isAcknowledged(ann.id);
              
              return (
                <Card 
                  key={ann.id} 
                  className={`${getPriorityBorder(ann.priority)} ${!read ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getPriorityIcon(ann.priority)}
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {ann.title}
                            {ann.is_pinned && (
                              <Pin className="h-4 w-4 text-primary" />
                            )}
                            {!read && (
                              <Badge variant="default" className="text-xs">New</Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            Posted {format(new Date(ann.publish_at || ann.created_at), "MMMM d, yyyy")}
                            {read && (
                              <span className="flex items-center gap-1 text-green-600">
                                <Eye className="h-3 w-3" />
                                Read
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            ann.priority === "urgent"
                              ? "bg-red-500/20 text-red-700"
                              : ann.priority === "high"
                              ? "bg-orange-500/20 text-orange-700"
                              : "bg-blue-500/20 text-blue-700"
                          }
                        >
                          {ann.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{ann.content}</p>
                    
                    {ann.requires_acknowledgement && (
                      <div className="mt-4 pt-4 border-t">
                        {acknowledged ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-medium">You acknowledged this announcement</span>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleAcknowledge(ann.id)}
                            className="gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
