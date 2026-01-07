import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, Activity, AlertCircle } from "lucide-react";
import { AuditCoverageMetrics, getCoverageColor } from "@/utils/auditCoverageUtils";
import { getInstrumentationCounts } from "@/utils/pageInstrumentationRegistry";

interface AuditCoverageOverviewProps {
  metrics: AuditCoverageMetrics;
  isLoading?: boolean;
}

export function AuditCoverageOverview({ metrics, isLoading }: AuditCoverageOverviewProps) {
  const pendingCount = metrics.coverageGaps.filter(g => g.status === 'pending_activation').length;
  const instrumentationCounts = getInstrumentationCounts();
  const implementationPercentage = Math.round((instrumentationCounts.instrumented / instrumentationCounts.total) * 100);
  
  const cards = [
    {
      label: "Implementation",
      value: `${implementationPercentage}%`,
      subtitle: `${instrumentationCounts.instrumented} of ${instrumentationCounts.total} pages have hooks`,
      icon: CheckCircle2,
      color: implementationPercentage >= 90 ? "text-success" : implementationPercentage >= 50 ? "text-warning" : "text-destructive",
      bgColor: implementationPercentage >= 90 ? "bg-success/10" : implementationPercentage >= 50 ? "bg-warning/10" : "bg-destructive/10",
      progress: implementationPercentage,
    },
    {
      label: "Not Implemented",
      value: `${instrumentationCounts.notInstrumented}`,
      subtitle: "pages need usePageAudit hooks",
      icon: AlertCircle,
      color: instrumentationCounts.notInstrumented > 0 ? "text-destructive" : "text-success",
      bgColor: instrumentationCounts.notInstrumented > 0 ? "bg-destructive/10" : "bg-success/10",
    },
    {
      label: "Pending Activation",
      value: `${pendingCount}`,
      subtitle: "instrumented pages awaiting visit",
      icon: Clock,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Activity Score",
      value: `${metrics.overallActivityLevel}%`,
      subtitle: `${metrics.activeEntityTypes} of ${metrics.totalImplementedTypes} types active`,
      icon: Activity,
      color: getCoverageColor(metrics.overallActivityLevel),
      bgColor: metrics.overallActivityLevel >= 90 
        ? "bg-success/10" 
        : metrics.overallActivityLevel >= 50 
          ? "bg-warning/10" 
          : "bg-info/10",
      progress: metrics.overallActivityLevel,
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