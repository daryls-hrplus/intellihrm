import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle,
  Bell,
  Clock,
  Bot
} from "lucide-react";
import { AgentAlert } from "@/hooks/useAgentRegistry";
import { formatDistanceToNow } from "date-fns";

interface AgentAlertsPanelProps {
  alerts: AgentAlert[];
  onResolve: (alertId: string) => void;
  compact?: boolean;
}

const severityConfig: Record<string, { 
  color: string; 
  icon: React.ElementType;
  bgColor: string;
}> = {
  critical: { 
    color: "text-red-600", 
    icon: XCircle,
    bgColor: "bg-red-500/10 border-red-500/20"
  },
  error: { 
    color: "text-red-500", 
    icon: XCircle,
    bgColor: "bg-red-500/10 border-red-500/20"
  },
  warning: { 
    color: "text-amber-500", 
    icon: AlertTriangle,
    bgColor: "bg-amber-500/10 border-amber-500/20"
  },
  info: { 
    color: "text-blue-500", 
    icon: Info,
    bgColor: "bg-blue-500/10 border-blue-500/20"
  }
};

export function AgentAlertsPanel({
  alerts,
  onResolve,
  compact = false
}: AgentAlertsPanelProps) {
  const unresolvedAlerts = alerts.filter(a => !a.is_resolved);
  const resolvedAlerts = alerts.filter(a => a.is_resolved);

  const renderAlert = (alert: AgentAlert) => {
    const severity = severityConfig[alert.severity] || severityConfig.info;
    const SeverityIcon = severity.icon;

    return (
      <div 
        key={alert.id}
        className={`p-4 rounded-lg border ${severity.bgColor} ${
          alert.is_resolved ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <SeverityIcon className={`h-5 w-5 mt-0.5 ${severity.color}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-sm">{alert.title}</h4>
                {alert.agent && (
                  <div className="flex items-center gap-1 mt-1">
                    <Bot className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {alert.agent.agent_name}
                    </span>
                  </div>
                )}
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs capitalize ${severity.color}`}
              >
                {alert.severity}
              </Badge>
            </div>
            
            {alert.message && (
              <p className="text-sm text-muted-foreground mt-2">
                {alert.message}
              </p>
            )}

            {(alert.threshold_value || alert.actual_value) && (
              <div className="flex gap-4 mt-2 text-xs">
                {alert.threshold_value && (
                  <span className="text-muted-foreground">
                    Threshold: <span className="font-medium">{alert.threshold_value}</span>
                  </span>
                )}
                {alert.actual_value && (
                  <span className="text-muted-foreground">
                    Actual: <span className="font-medium">{alert.actual_value}</span>
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
              </span>
              
              {!alert.is_resolved && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onResolve(alert.id)}
                  className="h-7 text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolve
                </Button>
              )}
              
              {alert.is_resolved && (
                <Badge variant="outline" className="text-xs text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Recent Alerts
            {unresolvedAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {unresolvedAlerts.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 3).map(renderAlert)}
              {alerts.length > 3 && (
                <p className="text-xs text-center text-muted-foreground">
                  +{alerts.length - 3} more alerts
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Agent Alerts
            </CardTitle>
            <CardDescription>
              {unresolvedAlerts.length} unresolved, {resolvedAlerts.length} resolved
            </CardDescription>
          </div>
          {unresolvedAlerts.length > 0 && (
            <Badge variant="destructive">
              {unresolvedAlerts.length} Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="font-medium">All Clear</p>
            <p className="text-sm">No alerts to display</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {unresolvedAlerts.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Active Alerts
                  </h3>
                  {unresolvedAlerts.map(renderAlert)}
                </>
              )}
              
              {resolvedAlerts.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-muted-foreground mt-6 mb-2">
                    Resolved
                  </h3>
                  {resolvedAlerts.map(renderAlert)}
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
