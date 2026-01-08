import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAnnouncementReads } from "@/hooks/useAnnouncementReads";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, ChevronRight, FileText, Bell, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isPast, isToday } from "date-fns";

interface QuickAction {
  id: string;
  type: "announcement" | "reminder" | "change_request" | "appraisal";
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  onAction?: () => void;
  priority: "critical" | "high" | "medium";
}

export function QuickActionsPanel() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { acknowledgeAnnouncement, isAcknowledged } = useAnnouncementReads();

  const { data: quickActions = [], isLoading } = useQuery({
    queryKey: ["ess-quick-actions", user?.id, profile?.company_id],
    queryFn: async () => {
      if (!user?.id) return [];

      const actions: QuickAction[] = [];
      const now = new Date().toISOString();

      // 1. Announcements requiring acknowledgement
      if (profile?.company_id) {
        const { data: announcements } = await supabase
          .from("company_announcements")
          .select("id, title, priority")
          .eq("company_id", profile.company_id)
          .eq("is_active", true)
          .eq("requires_acknowledgement", true)
          .or(`publish_at.is.null,publish_at.lte.${now}`)
          .or(`expire_at.is.null,expire_at.gte.${now}`)
          .limit(5);

        const { data: reads } = await supabase
          .from("announcement_reads")
          .select("announcement_id, acknowledged_at")
          .eq("user_id", user.id);

        const acknowledgedIds = new Set(
          (reads || []).filter(r => r.acknowledged_at).map(r => r.announcement_id)
        );

        (announcements || []).forEach(ann => {
          if (!acknowledgedIds.has(ann.id)) {
            actions.push({
              id: `ann-${ann.id}`,
              type: "announcement",
              title: "Acknowledge Required",
              description: ann.title,
              actionLabel: "Acknowledge",
              actionPath: "/ess/announcements",
              priority: ann.priority === "urgent" ? "critical" : "high",
            });
          }
        });
      }

      // 2. Critical/overdue reminders
      const today = new Date().toISOString().split("T")[0];
      const { data: reminders } = await supabase
        .from("employee_reminders")
        .select("id, title, reminder_date, priority")
        .eq("employee_id", user.id)
        .eq("status", "pending")
        .lte("reminder_date", today)
        .order("priority", { ascending: true })
        .limit(3);

      (reminders || []).forEach(reminder => {
        actions.push({
          id: `rem-${reminder.id}`,
          type: "reminder",
          title: "Reminder Overdue",
          description: reminder.title,
          actionLabel: "View",
          actionPath: "/ess/reminders",
          priority: reminder.priority === "critical" ? "critical" : "high",
        });
      });

      // 3. Change requests requiring info
      const { data: changeRequests } = await supabase
        .from("employee_data_change_requests")
        .select("id, request_type")
        .eq("employee_id", user.id)
        .eq("status", "info_required")
        .limit(3);

      (changeRequests || []).forEach(cr => {
        actions.push({
          id: `cr-${cr.id}`,
          type: "change_request",
          title: "Information Required",
          description: `${cr.request_type?.replace(/_/g, " ") || "Change Request"} needs your response`,
          actionLabel: "Respond",
          actionPath: `/ess/my-change-requests/${cr.id}`,
          priority: "high",
        });
      });

      // 4. Appraisals requiring response
      const { data: appraisals } = await supabase
        .from("appraisal_participants")
        .select("id, appraisal_cycles(name)")
        .eq("employee_id", user.id)
        .eq("employee_response_status", "pending")
        .limit(3);

      (appraisals || []).forEach(ap => {
        const cycle = ap.appraisal_cycles as { name: string } | null;
        actions.push({
          id: `apr-${ap.id}`,
          type: "appraisal",
          title: "Response Required",
          description: cycle?.name || "Performance Review",
          actionLabel: "Respond",
          actionPath: "/ess/my-appraisals",
          priority: "high",
        });
      });

      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2 };
      return actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });

  const getIcon = (type: QuickAction["type"]) => {
    switch (type) {
      case "announcement":
        return <Bell className="h-4 w-4" />;
      case "reminder":
        return <AlertTriangle className="h-4 w-4" />;
      case "change_request":
        return <FileText className="h-4 w-4" />;
      case "appraisal":
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (isLoading || quickActions.length === 0) {
    return null;
  }

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="font-semibold text-sm text-destructive">Action Required</span>
          <Badge variant="destructive" className="ml-auto">
            {quickActions.length} {quickActions.length === 1 ? "item" : "items"}
          </Badge>
        </div>

        <div className="space-y-2">
          {quickActions.slice(0, 3).map((action) => (
            <div
              key={action.id}
              className="flex items-center justify-between gap-3 p-2 rounded-lg bg-background/50 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 rounded bg-destructive/10 text-destructive shrink-0">
                  {getIcon(action.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{action.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="default"
                onClick={() => navigate(action.actionPath)}
                className="shrink-0"
              >
                {action.actionLabel}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>

        {quickActions.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-destructive hover:text-destructive"
            onClick={() => navigate("/ess/my-inbox")}
          >
            View all {quickActions.length} action items
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
