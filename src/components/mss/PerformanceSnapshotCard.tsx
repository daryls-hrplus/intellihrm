import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ClipboardCheck,
  Target,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PerformanceMetrics } from "@/hooks/useMssTeamMetrics";

interface PerformanceSnapshotCardProps {
  metrics: PerformanceMetrics;
  loading?: boolean;
}

const ratingColors: Record<string, string> = {
  "1": "hsl(var(--destructive))",
  "2": "hsl(var(--warning))",
  "3": "hsl(var(--primary))",
  "4": "hsl(142 71% 45%)",
  "5": "hsl(142 76% 36%)",
};

export function PerformanceSnapshotCard({ metrics, loading = false }: PerformanceSnapshotCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = metrics.totalAppraisals > 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          Performance Snapshot
        </CardTitle>
        <CardDescription className="text-xs">
          Team appraisals & goals overview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Appraisal Completion */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Appraisal Completion</span>
            <Badge
              variant={
                metrics.appraisalCompletionRate >= 80
                  ? "default"
                  : metrics.appraisalCompletionRate >= 50
                  ? "secondary"
                  : "destructive"
              }
            >
              {metrics.appraisalCompletionRate}%
            </Badge>
          </div>
          <Progress value={metrics.appraisalCompletionRate} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {metrics.completedAppraisals} of {metrics.totalAppraisals} completed
          </p>
        </div>

        {/* Average Rating */}
        {metrics.teamAverageRating !== null && (
          <div className="flex items-center justify-between py-2 border-t">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Rating</span>
            </div>
            <span className="text-lg font-bold">{metrics.teamAverageRating.toFixed(1)}</span>
          </div>
        )}

        {/* Rating Distribution Mini Chart */}
        {hasData && metrics.ratingDistribution.some((r) => r.count > 0) && (
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.ratingDistribution} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="rating"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-2 text-xs">
                          <p>Rating {data.rating}: {data.count} ({data.percentage}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {metrics.ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ratingColors[entry.rating] || "hsl(var(--primary))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Goals & PIPs */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">{metrics.goalsOnTrackPercent}%</p>
              <p className="text-xs text-muted-foreground">Goals On Track</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={cn(
                "h-4 w-4",
                metrics.activePips > 0 ? "text-orange-600" : "text-muted-foreground"
              )}
            />
            <div>
              <p className="text-sm font-medium">{metrics.activePips}</p>
              <p className="text-xs text-muted-foreground">Active PIPs</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
