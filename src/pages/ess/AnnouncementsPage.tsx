import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Megaphone, Pin, AlertCircle, AlertTriangle, Info } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  is_pinned: boolean;
  publish_at: string | null;
  created_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

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

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Company Announcements</h1>
            <p className="text-muted-foreground">Stay updated with the latest news</p>
          </div>
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
            {announcements.map((ann) => (
              <Card key={ann.id} className={getPriorityBorder(ann.priority)}>
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
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Posted {format(new Date(ann.publish_at || ann.created_at), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
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
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{ann.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
