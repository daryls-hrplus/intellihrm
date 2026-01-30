import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Award,
  FileText,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import type { TrainingMetrics } from "@/hooks/useMssTeamMetrics";

interface TeamTrainingStatusCardProps {
  metrics: TrainingMetrics;
  loading?: boolean;
}

export function TeamTrainingStatusCard({ metrics, loading = false }: TeamTrainingStatusCardProps) {
  const { navigateToList } = useWorkspaceNavigation();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-4 w-4 text-primary" />
          Training & Development
        </CardTitle>
        <CardDescription className="text-xs">L&D compliance status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Completion Rate */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion Rate</span>
            <Badge
              variant={
                metrics.completionRate >= 90
                  ? "default"
                  : metrics.completionRate >= 70
                  ? "secondary"
                  : "destructive"
              }
            >
              {metrics.completionRate}%
            </Badge>
          </div>
          <Progress value={metrics.completionRate} className="h-1.5" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() =>
              navigateToList({ route: "/mss/training?filter=active", title: "Active Enrollments", moduleCode: "mss" })
            }
          >
            <BookOpen className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">{metrics.activeEnrollments}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
              metrics.overdueTraining > 0 ? "bg-destructive/10" : "bg-muted/30"
            )}
            onClick={() =>
              navigateToList({ route: "/mss/training?filter=overdue", title: "Overdue Training", moduleCode: "mss" })
            }
          >
            <AlertTriangle
              className={cn("h-4 w-4", metrics.overdueTraining > 0 ? "text-destructive" : "text-muted-foreground")}
            />
            <div>
              <p className="text-sm font-medium">{metrics.overdueTraining}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
              metrics.expiringCertifications > 0 ? "bg-amber-500/10" : "bg-muted/30"
            )}
            onClick={() =>
              navigateToList({ route: "/mss/training?filter=expiring", title: "Expiring Certs", moduleCode: "mss" })
            }
          >
            <Award
              className={cn("h-4 w-4", metrics.expiringCertifications > 0 ? "text-amber-600" : "text-muted-foreground")}
            />
            <div>
              <p className="text-sm font-medium">{metrics.expiringCertifications}</p>
              <p className="text-xs text-muted-foreground">Expiring Certs</p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() =>
              navigateToList({ route: "/mss/development", title: "Development Plans", moduleCode: "mss" })
            }
          >
            <FileText className="h-4 w-4 text-cyan-600" />
            <div>
              <p className="text-sm font-medium">{metrics.activeDevelopmentPlans}</p>
              <p className="text-xs text-muted-foreground">Active IDPs</p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-primary"
          onClick={() =>
            navigateToList({
              route: "/mss/training",
              title: "Team Training",
              moduleCode: "mss",
            })
          }
        >
          View All Training
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
