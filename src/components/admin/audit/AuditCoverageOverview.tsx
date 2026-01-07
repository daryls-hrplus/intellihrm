import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Layers, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import { AuditCoverageMetrics, getCoverageColor } from "@/utils/auditCoverageUtils";

interface AuditCoverageOverviewProps {
  metrics: AuditCoverageMetrics;
  isLoading?: boolean;
}

export function AuditCoverageOverview({ metrics, isLoading }: AuditCoverageOverviewProps) {
  const cards = [
    {
      label: "Coverage Score",
      value: `${metrics.overallCoverage}%`,
      subtitle: `${metrics.coveredEntityTypes} of ${metrics.totalEntityTypes} entity types`,
      icon: CheckCircle2,
      color: getCoverageColor(metrics.overallCoverage),
      bgColor: metrics.overallCoverage >= 90 
        ? "bg-success/10" 
        : metrics.overallCoverage >= 50 
          ? "bg-warning/10" 
          : "bg-destructive/10",
      progress: metrics.overallCoverage,
    },
    {
      label: "Modules Tracked",
      value: `${metrics.modulesWithCoverage}`,
      subtitle: `of ${metrics.totalModules} total modules`,
      icon: Layers,
      color: "text-primary",
      bgColor: "bg-primary/10",
      progress: Math.round((metrics.modulesWithCoverage / metrics.totalModules) * 100),
    },
    {
      label: "Coverage Gaps",
      value: `${metrics.coverageGaps.length}`,
      subtitle: "entity types need attention",
      icon: AlertTriangle,
      color: metrics.coverageGaps.length > 20 
        ? "text-destructive" 
        : metrics.coverageGaps.length > 10 
          ? "text-warning" 
          : "text-muted-foreground",
      bgColor: metrics.coverageGaps.length > 20 
        ? "bg-destructive/10" 
        : metrics.coverageGaps.length > 10 
          ? "bg-warning/10" 
          : "bg-muted/10",
    },
    {
      label: "Active This Week",
      value: metrics.moduleCoverages.reduce((sum, m) => sum + m.totalLogs, 0).toLocaleString(),
      subtitle: "audit log entries",
      icon: Activity,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-5">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={card.label}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </p>
                  <p className={`mt-1 text-3xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.subtitle}
                  </p>
                  {card.progress !== undefined && (
                    <Progress 
                      value={card.progress} 
                      className="h-1.5 mt-2"
                    />
                  )}
                </div>
                <div className={`rounded-lg p-3 ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
