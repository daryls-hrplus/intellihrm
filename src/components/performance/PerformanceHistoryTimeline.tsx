import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CycleSnapshot } from "@/hooks/usePerformanceIndex";
import { format } from "date-fns";

interface PerformanceHistoryTimelineProps {
  snapshots: CycleSnapshot[];
  isLoading?: boolean;
  maxItems?: number;
}

function getCategoryColor(code: string | null): string {
  switch (code?.toLowerCase()) {
    case "exceptional": return "bg-green-500";
    case "exceeds": return "bg-blue-500";
    case "meets": return "bg-amber-500";
    case "needs_improvement": return "bg-orange-500";
    case "unsatisfactory": return "bg-red-500";
    default: return "bg-muted";
  }
}

function getScoreChange(current: number | null, previous: number | null): { direction: string; delta: number } | null {
  if (current === null || previous === null) return null;
  const delta = current - previous;
  return {
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "same",
    delta: Math.abs(delta),
  };
}

export function PerformanceHistoryTimeline({ snapshots, isLoading, maxItems = 10 }: PerformanceHistoryTimelineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!snapshots.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No performance history available</p>
        </CardContent>
      </Card>
    );
  }

  const displayedSnapshots = snapshots.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Performance History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {displayedSnapshots.map((snapshot, idx) => {
              const previousSnapshot = displayedSnapshots[idx + 1];
              const change = getScoreChange(snapshot.overall_score, previousSnapshot?.overall_score || null);

              return (
                <div key={snapshot.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${getCategoryColor(snapshot.performance_category_code)}`}>
                    {snapshot.overall_score?.toFixed(0) || "—"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{snapshot.cycle_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(snapshot.cycle_end_date), "MMM yyyy")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {snapshot.performance_category_name && (
                          <Badge variant="outline" className="text-xs">
                            {snapshot.performance_category_name}
                          </Badge>
                        )}
                        {change && (
                          <div className={`flex items-center gap-1 text-xs ${
                            change.direction === "up" ? "text-green-600" : 
                            change.direction === "down" ? "text-red-600" : 
                            "text-muted-foreground"
                          }`}>
                            {change.direction === "up" && <TrendingUp className="h-3 w-3" />}
                            {change.direction === "down" && <TrendingDown className="h-3 w-3" />}
                            {change.direction === "same" && <Minus className="h-3 w-3" />}
                            {change.delta > 0 && `${change.delta.toFixed(1)}%`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Component scores */}
                    <div className="flex gap-3 mt-2 text-xs">
                      {snapshot.competency_score !== null && (
                        <span className="text-muted-foreground">
                          Competency: <span className="font-medium text-foreground">{snapshot.competency_score.toFixed(1)}%</span>
                        </span>
                      )}
                      {snapshot.responsibility_score !== null && (
                        <span className="text-muted-foreground">
                          Responsibility: <span className="font-medium text-foreground">{snapshot.responsibility_score.toFixed(1)}%</span>
                        </span>
                      )}
                      {snapshot.goal_score !== null && (
                        <span className="text-muted-foreground">
                          Goals: <span className="font-medium text-foreground">{snapshot.goal_score.toFixed(1)}%</span>
                        </span>
                      )}
                    </div>

                    {/* Calibration indicator */}
                    {snapshot.was_calibrated && snapshot.calibration_delta && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Calibrated: {snapshot.calibration_delta > 0 ? "+" : ""}{snapshot.calibration_delta.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
