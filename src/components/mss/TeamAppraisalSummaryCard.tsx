import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamAppraisalSummaryCardProps {
  totalToEvaluate: number;
  pendingCount: number;
  completedCount: number;
  overdueCount: number;
  averageScore?: number;
  companyAverageScore?: number;
  loading?: boolean;
}

export function TeamAppraisalSummaryCard({
  totalToEvaluate,
  pendingCount,
  completedCount,
  overdueCount,
  averageScore,
  companyAverageScore,
  loading = false,
}: TeamAppraisalSummaryCardProps) {
  const completionRate = totalToEvaluate > 0 
    ? Math.round((completedCount / totalToEvaluate) * 100) 
    : 0;

  const stats = [
    {
      label: "Total to Evaluate",
      value: totalToEvaluate,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Overdue",
      value: overdueCount,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      highlight: overdueCount > 0,
    },
  ];

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg bg-background/80 border",
                  stat.highlight && "border-destructive/50 bg-destructive/5"
                )}
              >
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Completion Progress */}
          <div className="lg:w-64 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <Badge variant={completionRate >= 80 ? "default" : completionRate >= 50 ? "secondary" : "destructive"}>
                {completionRate}%
              </Badge>
            </div>
            <Progress value={completionRate} className="h-2" />
            
            {averageScore !== undefined && (
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Avg. Score Given
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{averageScore.toFixed(1)}</span>
                  {companyAverageScore && (
                    <span className="text-xs text-muted-foreground">
                      (Co. avg: {companyAverageScore.toFixed(1)})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
