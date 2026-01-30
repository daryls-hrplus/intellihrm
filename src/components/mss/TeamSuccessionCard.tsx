import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Users,
  Star,
  AlertTriangle,
  Puzzle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import type { SuccessionMetrics } from "@/hooks/useMssTeamMetrics";

interface TeamSuccessionCardProps {
  metrics: SuccessionMetrics;
  loading?: boolean;
}

export function TeamSuccessionCard({ metrics, loading = false }: TeamSuccessionCardProps) {
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
          <TrendingUp className="h-4 w-4 text-primary" />
          Succession & Talent
        </CardTitle>
        <CardDescription className="text-xs">Talent pipeline health</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Succession Coverage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Succession Coverage</span>
            <Badge
              variant={
                metrics.successionCoverage >= 80
                  ? "default"
                  : metrics.successionCoverage >= 50
                  ? "secondary"
                  : "destructive"
              }
            >
              {metrics.successionCoverage}%
            </Badge>
          </div>
          <Progress value={metrics.successionCoverage} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {metrics.keyPositionsWithSuccessors} of {metrics.totalKeyPositions} key positions covered
          </p>
        </div>

        {/* Talent Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 cursor-pointer hover:bg-green-500/20 transition-colors"
            onClick={() =>
              navigateToList({ route: "/mss/succession?filter=ready-now", title: "Ready Now", moduleCode: "mss" })
            }
          >
            <Users className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">{metrics.readyNowCandidates}</p>
              <p className="text-xs text-muted-foreground">Ready Now</p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10 cursor-pointer hover:bg-purple-500/20 transition-colors"
            onClick={() =>
              navigateToList({ route: "/mss/succession?filter=hipo", title: "High Potentials", moduleCode: "mss" })
            }
          >
            <Star className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm font-medium">{metrics.highPotentials}</p>
              <p className="text-xs text-muted-foreground">High Potentials</p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:opacity-80 transition-colors",
              metrics.flightRisk > 0 ? "bg-destructive/10" : "bg-muted/30"
            )}
            onClick={() =>
              navigateToList({ route: "/mss/succession?filter=flight-risk", title: "Flight Risk", moduleCode: "mss" })
            }
          >
            <AlertTriangle
              className={cn("h-4 w-4", metrics.flightRisk > 0 ? "text-destructive" : "text-muted-foreground")}
            />
            <div>
              <p className="text-sm font-medium">{metrics.flightRisk}</p>
              <p className="text-xs text-muted-foreground">Flight Risk</p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:opacity-80 transition-colors",
              metrics.skillGaps > 0 ? "bg-amber-500/10" : "bg-muted/30"
            )}
            onClick={() =>
              navigateToList({ route: "/mss/succession?filter=skill-gaps", title: "Skill Gaps", moduleCode: "mss" })
            }
          >
            <Puzzle className={cn("h-4 w-4", metrics.skillGaps > 0 ? "text-amber-600" : "text-muted-foreground")} />
            <div>
              <p className="text-sm font-medium">{metrics.skillGaps}</p>
              <p className="text-xs text-muted-foreground">Skill Gaps</p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-primary"
          onClick={() =>
            navigateToList({
              route: "/mss/succession",
              title: "Succession Planning",
              moduleCode: "mss",
            })
          }
        >
          View Succession Plans
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
