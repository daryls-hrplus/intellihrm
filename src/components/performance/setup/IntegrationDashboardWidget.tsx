import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntegrationWidget } from "@/hooks/useIntegrationDashboard";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useNavigate } from "react-router-dom";
import { 
  GitBranch, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Grid3X3,
  Users,
  Target,
  DollarSign,
  Bell,
  Calendar,
  BarChart3
} from "lucide-react";

interface IntegrationDashboardWidgetProps {
  companyId: string;
}

const PERFORMANCE_MODULES = ['nine_box', 'succession', 'idp', 'pip', 'compensation', 'notifications', 'reminders', 'workforce_analytics'];

const MODULE_ICONS: Record<string, React.ElementType> = {
  nine_box: Grid3X3,
  succession: Users,
  idp: Target,
  pip: AlertTriangle,
  compensation: DollarSign,
  notifications: Bell,
  reminders: Calendar,
  workforce_analytics: BarChart3
};

const MODULE_LABELS: Record<string, string> = {
  nine_box: "9-Box",
  succession: "Succession",
  idp: "IDP",
  pip: "PIP",
  compensation: "Compensation",
  notifications: "Notifications",
  reminders: "Reminders",
  workforce_analytics: "Analytics"
};

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-500/20 text-green-600",
  pending_approval: "bg-amber-500/20 text-amber-600",
  failed: "bg-red-500/20 text-red-600"
};

export function IntegrationDashboardWidget({ companyId }: IntegrationDashboardWidgetProps) {
  const navigate = useNavigate();
  const { logs, stats, loading } = 
    useIntegrationWidget(companyId, PERFORMANCE_MODULES);

  const recentLogs = logs.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <GitBranch className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.pending > 0 ? "border-amber-500/50" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.failed > 0 ? "border-red-500/50" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Status Alerts */}
      {(stats.pending > 0 || stats.failed > 0) && (
        <Card className={stats.pending > 0 ? "border-amber-500/50 bg-amber-500/5" : "border-destructive/50 bg-destructive/5"}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {stats.pending > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">{stats.pending} pending approval</span>
                  </div>
                )}
                {stats.failed > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium">{stats.failed} failed</span>
                  </div>
                )}
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/performance/intelligence-hub')}
              >
                View Full Analytics
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Button 
              variant="link" 
              size="sm"
              onClick={() => navigate('/performance/intelligence-hub')}
            >
              View Full Analytics
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No integration activity in the last 30 days
            </p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => {
                const ModuleIcon = MODULE_ICONS[log.target_module] || GitBranch;
                return (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <ModuleIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{log.employee_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {MODULE_LABELS[log.target_module]} • {formatDateForDisplay(log.created_at, "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                    <Badge className={STATUS_COLORS[log.action_result] || "bg-muted"}>
                      {log.action_result === 'pending_approval' ? 'Pending' : log.action_result}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
