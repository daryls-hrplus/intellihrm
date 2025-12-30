import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  Target,
  Calendar,
  FileText,
  Clock,
  Award,
  TrendingUp,
  MessageCircle,
  CheckSquare,
  CreditCard,
  ClipboardCheck,
  Star,
  AlertCircle,
  ArrowRight,
  Zap,
  RefreshCw,
} from "lucide-react";

interface PendingTask {
  type: string;
  title: string;
  description: string;
  urgency: "high" | "medium" | "low";
  dueDate?: string;
  daysOverdue?: number;
  href: string;
  actionLabel: string;
  count?: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  priority: number;
  category: string;
  reasoning?: string;
}

interface DashboardData {
  pendingTasks: PendingTask[];
  quickActions: QuickAction[];
  aiInsight: string;
  greeting: string;
  focusArea: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Target,
  Calendar,
  FileText,
  Clock,
  Award,
  TrendingUp,
  MessageCircle,
  CheckSquare,
  CreditCard,
  ClipboardCheck,
  Star,
};

const URGENCY_STYLES: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
};

export function ESSAIDashboard() {
  const { user, company } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isRefresh = false) => {
    if (!user?.id || !company?.id) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ess-ai-dashboard", {
        body: { userId: user.id, companyId: company.id },
      });

      if (fnError) throw fnError;
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to fetch ESS dashboard:", err);
      setError("Unable to load personalized dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?.id, company?.id]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !dashboardData) {
    return (
      <Card className="border-muted">
        <CardContent className="py-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">{error || "Dashboard unavailable"}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchDashboard()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { greeting, aiInsight, focusArea, pendingTasks, quickActions } = dashboardData;

  return (
    <div className="space-y-4">
      {/* AI Greeting & Insight Card */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">{greeting}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-muted-foreground">{aiInsight}</p>
              {focusArea && (
                <Badge variant="secondary" className="mt-2">
                  <Zap className="h-3 w-3 mr-1" />
                  {focusArea}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Tasks - Only show if there are tasks */}
      {pendingTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              Action Required
              <Badge variant="outline" className="border-warning text-warning">
                {pendingTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {pendingTasks.map((task, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${URGENCY_STYLES[task.urgency]}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      {task.count && task.count > 1 && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {task.count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={task.urgency === "high" ? "default" : "outline"}
                    onClick={() => navigate(task.href)}
                    className="shrink-0"
                  >
                    {task.actionLabel}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Suggested for You
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const IconComponent = ICON_MAP[action.icon] || Target;
              return (
                <Card
                  key={action.id}
                  className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                  onClick={() => navigate(action.href)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                          {action.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
