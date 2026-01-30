import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamHealthMetrics } from "@/hooks/useMssTeamMetrics";

interface TeamHealthSummaryProps {
  metrics: TeamHealthMetrics;
  loading?: boolean;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  highlight?: boolean;
  suffix?: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor, highlight, suffix }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg bg-card border transition-all",
        highlight && "border-destructive/50 bg-destructive/5"
      )}
    >
      <div className={cn("p-2.5 rounded-lg", bgColor)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold">
          {value}
          {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
        </p>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  );
}

export function TeamHealthSummary({ metrics, loading = false }: TeamHealthSummaryProps) {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats: StatCardProps[] = [
    {
      label: "Team Size",
      value: metrics.teamSize,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Actions Pending",
      value: metrics.actionsPending,
      icon: ClipboardCheck,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      highlight: metrics.actionsPending > 5,
    },
    {
      label: "Overdue Items",
      value: metrics.overdueItems,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      highlight: metrics.overdueItems > 0,
    },
    {
      label: "High Performers",
      value: metrics.highPerformersPercent,
      suffix: "%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      label: "At Risk",
      value: metrics.atRiskCount,
      icon: AlertCircle,
      color: metrics.atRiskCount > 0 ? "text-orange-600" : "text-muted-foreground",
      bgColor: metrics.atRiskCount > 0 ? "bg-orange-500/10" : "bg-muted",
      highlight: metrics.atRiskCount > 0,
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs font-medium">
            Team Health Summary
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
