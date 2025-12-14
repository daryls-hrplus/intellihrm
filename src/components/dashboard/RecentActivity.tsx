import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, UserCheck, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const ACTION_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  CREATE: { icon: CheckCircle2, color: "text-success" },
  UPDATE: { icon: Edit, color: "text-primary" },
  DELETE: { icon: Trash2, color: "text-destructive" },
  VIEW: { icon: Eye, color: "text-info" },
  LOGIN: { icon: UserCheck, color: "text-primary" },
  LOGOUT: { icon: Clock, color: "text-muted-foreground" },
};

export function RecentActivity() {
  const { t } = useTranslation();
  const { company, isAdmin, isHRManager } = useAuth();

  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activity", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          id,
          action,
          entity_type,
          entity_name,
          created_at,
          user_id,
          metadata
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin || isHRManager,
  });

  const getActionDisplay = (action: string, entityType: string, entityName: string | null) => {
    const actionMap: Record<string, string> = {
      CREATE: t("dashboard.activity.created", "Created"),
      UPDATE: t("dashboard.activity.updated", "Updated"),
      DELETE: t("dashboard.activity.deleted", "Deleted"),
      VIEW: t("dashboard.activity.viewed", "Viewed"),
      LOGIN: t("dashboard.activity.loggedIn", "Logged in"),
      LOGOUT: t("dashboard.activity.loggedOut", "Logged out"),
    };

    const actionText = actionMap[action] || action;
    const entityDisplay = entityName || entityType.replace(/_/g, " ");
    
    return {
      title: `${actionText} ${entityType.replace(/_/g, " ")}`,
      description: entityName ? `${entityDisplay}` : `${entityType.replace(/_/g, " ")} record`,
    };
  };

  // Show placeholder for non-admin users
  if (!isAdmin && !isHRManager) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "300ms" }}>
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">
          {t("dashboard.recentActivity", "Recent Activity")}
        </h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("dashboard.activityRestrictedAccess", "Activity log available for administrators")}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "300ms" }}>
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">
          {t("dashboard.recentActivity", "Recent Activity")}
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">
          {t("dashboard.recentActivity", "Recent Activity")}
        </h3>
        <button className="text-sm font-medium text-primary hover:underline">
          {t("dashboard.viewAll", "View all")}
        </button>
      </div>
      <div className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity) => {
            const iconConfig = ACTION_ICONS[activity.action] || { icon: AlertCircle, color: "text-muted-foreground" };
            const Icon = iconConfig.icon;
            const display = getActionDisplay(activity.action, activity.entity_type, activity.entity_name);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div className={cn("mt-0.5 shrink-0", iconConfig.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-card-foreground">{display.title}</p>
                  <p className="text-sm text-muted-foreground">{display.description}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("dashboard.noRecentActivity", "No recent activity")}
          </p>
        )}
      </div>
    </div>
  );
}
