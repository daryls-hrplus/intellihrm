import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import type { CompensationMetrics } from "@/hooks/useMssTeamMetrics";

interface CompensationAlertCardProps {
  metrics: CompensationMetrics;
  loading?: boolean;
}

export function CompensationAlertCard({ metrics, loading = false }: CompensationAlertCardProps) {
  const { navigateToList } = useWorkspaceNavigation();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const compaRatioColor =
    metrics.avgCompaRatio >= 0.95 && metrics.avgCompaRatio <= 1.05
      ? "text-green-600"
      : metrics.avgCompaRatio < 0.95
      ? "text-amber-600"
      : "text-blue-600";

  const compaRatioBg =
    metrics.avgCompaRatio >= 0.95 && metrics.avgCompaRatio <= 1.05
      ? "bg-green-500/10"
      : metrics.avgCompaRatio < 0.95
      ? "bg-amber-500/10"
      : "bg-blue-500/10";

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4 text-primary" />
          Compensation Insights
          {metrics.payEquityAlerts > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {metrics.payEquityAlerts} Alerts
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-xs">Pay equity visibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avg Compa-Ratio */}
        <div
          className={cn("flex items-center justify-between p-3 rounded-lg cursor-pointer hover:opacity-80", compaRatioBg)}
          onClick={() =>
            navigateToList({ route: "/mss/compensation/compa-ratio", title: "Compa-Ratio", moduleCode: "mss" })
          }
        >
          <div className="flex items-center gap-2">
            <Scale className={cn("h-5 w-5", compaRatioColor)} />
            <div>
              <p className="text-xs text-muted-foreground">Avg Compa-Ratio</p>
              <p className={cn("text-xl font-bold", compaRatioColor)}>{metrics.avgCompaRatio.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {metrics.avgCompaRatio >= 0.95 && metrics.avgCompaRatio <= 1.05
              ? "Healthy Range"
              : metrics.avgCompaRatio < 0.95
              ? "Below Target"
              : "Above Target"}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:opacity-80 transition-colors",
              metrics.belowMidpoint > 0 ? "bg-amber-500/10" : "bg-muted/30"
            )}
            onClick={() =>
              navigateToList({
                route: "/mss/compensation?filter=below-midpoint",
                title: "Below Midpoint",
                moduleCode: "mss",
              })
            }
          >
            <TrendingDown
              className={cn("h-4 w-4", metrics.belowMidpoint > 0 ? "text-amber-600" : "text-muted-foreground")}
            />
            <div>
              <p className="text-sm font-medium">{metrics.belowMidpoint}</p>
              <p className="text-xs text-muted-foreground">Below 95%</p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:opacity-80 transition-colors",
              metrics.aboveMaximum > 0 ? "bg-blue-500/10" : "bg-muted/30"
            )}
            onClick={() =>
              navigateToList({
                route: "/mss/compensation?filter=above-max",
                title: "Above Maximum",
                moduleCode: "mss",
              })
            }
          >
            <TrendingUp
              className={cn("h-4 w-4", metrics.aboveMaximum > 0 ? "text-blue-600" : "text-muted-foreground")}
            />
            <div>
              <p className="text-sm font-medium">{metrics.aboveMaximum}</p>
              <p className="text-xs text-muted-foreground">Above Max</p>
            </div>
          </div>
        </div>

        {/* Pay Equity Alerts */}
        {metrics.payEquityAlerts > 0 && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 cursor-pointer hover:bg-destructive/15 transition-colors"
            onClick={() =>
              navigateToList({ route: "/mss/compensation?filter=equity-alerts", title: "Equity Alerts", moduleCode: "mss" })
            }
          >
            <AlertCircle className="h-4 w-4 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{metrics.payEquityAlerts} Pay Equity Alerts</p>
              <p className="text-xs text-muted-foreground">Review required</p>
            </div>
            <ChevronRight className="h-4 w-4 text-destructive" />
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-primary"
          onClick={() =>
            navigateToList({
              route: "/mss/compensation",
              title: "Team Compensation",
              moduleCode: "mss",
            })
          }
        >
          View Compensation Details
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
