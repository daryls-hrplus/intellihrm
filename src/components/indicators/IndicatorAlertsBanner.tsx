import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle, 
  X,
  ChevronRight 
} from "lucide-react";
import { format } from "date-fns";
import { useTalentIndicatorAlerts, useAcknowledgeAlert, type IndicatorAlert } from "@/hooks/useTalentIndicators";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface IndicatorAlertsBannerProps {
  companyId: string;
  maxItems?: number;
  onViewAll?: () => void;
}

const severityConfig = {
  info: {
    icon: Bell,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  critical: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
};

const alertTypeLabels: Record<string, string> = {
  threshold_breach: "Threshold Breach",
  trend_change: "Trend Change",
  confidence_drop: "Data Quality",
  stale_data: "Stale Data",
};

export function IndicatorAlertsBanner({ companyId, maxItems = 5, onViewAll }: IndicatorAlertsBannerProps) {
  const { user } = useAuth();
  const { data: alerts = [], isLoading } = useTalentIndicatorAlerts(companyId);
  const acknowledgeAlert = useAcknowledgeAlert();
  const [dismissedLocally, setDismissedLocally] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts
    .filter((a) => !dismissedLocally.has(a.id))
    .slice(0, maxItems);

  const handleAcknowledge = (alertId: string) => {
    if (user?.id) {
      acknowledgeAlert.mutate({ alertId, userId: user.id });
      setDismissedLocally((prev) => new Set([...prev, alertId]));
    }
  };

  if (isLoading) {
    return null;
  }

  if (visibleAlerts.length === 0) {
    return null;
  }

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-warning" />
            <CardTitle className="text-base">Talent Alerts</CardTitle>
            <div className="flex items-center gap-1">
              {criticalCount > 0 && (
                <Badge variant="destructive" className="h-5 text-xs">
                  {criticalCount} critical
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge className="h-5 text-xs bg-warning text-warning-foreground">
                  {warningCount} warning
                </Badge>
              )}
            </div>
          </div>
          {onViewAll && alerts.length > maxItems && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All ({alerts.length})
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={cn(visibleAlerts.length > 3 && "h-[200px]")}>
          <div className="space-y-2">
            {visibleAlerts.map((alert) => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;
              const indicatorScore = alert.indicator_score as any;
              const indicatorName = indicatorScore?.indicator?.name || "Unknown";

              return (
                <Alert
                  key={alert.id}
                  className={cn("py-2", config.bg, config.border)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Icon className={cn("h-4 w-4 mt-0.5", config.color)} />
                      <div className="space-y-1">
                        <AlertDescription className="text-sm font-medium">
                          {alert.message}
                        </AlertDescription>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="h-5">
                            {alertTypeLabels[alert.alert_type] || alert.alert_type}
                          </Badge>
                          <span>•</span>
                          <span>{indicatorName}</span>
                          {alert.employee && (
                            <>
                              <span>•</span>
                              <span>{(alert.employee as any).full_name}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{format(new Date(alert.created_at), "MMM d, h:mm a")}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={acknowledgeAlert.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Alert>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
