import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  MessageSquare,
  AlertTriangle,
  TrendingDown,
  Clock,
  ChevronRight,
  X,
  RefreshCw,
  User,
} from "lucide-react";
import { useGoalAIAnalyzer } from "@/hooks/performance/useGoalAIAnalyzer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CoachingNudge {
  nudge_type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  suggested_action: string;
  employee_name?: string;
  goal_title?: string;
}

interface EnhancedCoachingNudgesProps {
  companyId: string;
  managerId: string;
  employeeId?: string;
  maxNudges?: number;
}

const nudgeIcons: Record<string, any> = {
  stale_goal: Clock,
  at_risk: AlertTriangle,
  low_engagement: TrendingDown,
  coaching_opportunity: MessageSquare,
  default: Sparkles,
};

const priorityStyles: Record<string, string> = {
  high: "border-red-200 bg-red-50/50 dark:bg-red-950/20",
  medium: "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20",
  low: "border-border",
};

export function EnhancedCoachingNudges({
  companyId,
  managerId,
  employeeId,
  maxNudges = 5,
}: EnhancedCoachingNudgesProps) {
  const { generateCoachingNudges, analyzing } = useGoalAIAnalyzer();
  const [nudges, setNudges] = useState<CoachingNudge[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (companyId && managerId && !hasLoaded) {
      loadNudges();
    }
  }, [companyId, managerId, hasLoaded]);

  const loadNudges = async () => {
    const result = await generateCoachingNudges(companyId, managerId, employeeId);
    if (result?.nudges) {
      setNudges(result.nudges);
      setHasLoaded(true);
    }
  };

  const handleDismiss = async (index: number, nudge: CoachingNudge) => {
    setDismissedIds((prev) => new Set([...prev, `${nudge.nudge_type}-${index}`]));

    // Store dismissal in database
    try {
      await supabase.from("goal_coaching_nudges").insert({
        company_id: companyId,
        manager_id: managerId,
        employee_id: employeeId,
        nudge_type: nudge.nudge_type,
        nudge_title: nudge.title,
        nudge_message: nudge.message,
        priority: nudge.priority,
        suggested_action: nudge.suggested_action,
        is_dismissed: true,
        dismissed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error storing nudge dismissal:", error);
    }
  };

  const handleRefresh = () => {
    setHasLoaded(false);
    setDismissedIds(new Set());
    loadNudges();
  };

  const handleTakeAction = (nudge: CoachingNudge) => {
    toast.info("Action", {
      description: nudge.suggested_action,
    });
  };

  const visibleNudges = nudges
    .filter((_, index) => !dismissedIds.has(`${nudges[index].nudge_type}-${index}`))
    .slice(0, maxNudges);

  if (analyzing && !hasLoaded) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            Loading AI Coaching Insights...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Coaching Suggestions
            {visibleNudges.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {visibleNudges.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={analyzing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${analyzing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {visibleNudges.length > 0 ? (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {visibleNudges.map((nudge, index) => {
                const Icon = nudgeIcons[nudge.nudge_type] || nudgeIcons.default;
                return (
                  <div
                    key={`${nudge.nudge_type}-${index}`}
                    className={`p-3 rounded-lg border transition-all ${priorityStyles[nudge.priority]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-1.5 rounded-full ${
                          nudge.priority === "high"
                            ? "bg-red-100 text-red-600"
                            : nudge.priority === "medium"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-sm">{nudge.title}</h4>
                            {nudge.employee_name && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <User className="h-3 w-3" />
                                {nudge.employee_name}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                            onClick={() => handleDismiss(index, nudge)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">{nudge.message}</p>

                        {nudge.goal_title && (
                          <p className="text-xs text-primary mt-1 font-medium">
                            Goal: {nudge.goal_title}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleTakeAction(nudge)}
                          >
                            <ChevronRight className="h-3 w-3 mr-1" />
                            {nudge.suggested_action.length > 30
                              ? nudge.suggested_action.substring(0, 30) + "..."
                              : nudge.suggested_action}
                          </Button>
                          <Badge
                            variant={
                              nudge.priority === "high"
                                ? "destructive"
                                : nudge.priority === "medium"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {nudge.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No coaching suggestions at this time.</p>
            <p className="text-xs mt-1">Your team is doing great!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
