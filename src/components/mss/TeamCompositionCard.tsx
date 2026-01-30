import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserPlus,
  Clock,
  Calendar,
  FileWarning,
  UserMinus,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import type { CompositionMetrics } from "@/hooks/useMssTeamMetrics";

interface TeamCompositionCardProps {
  metrics: CompositionMetrics;
  loading?: boolean;
}

interface MetricRowProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  highlight?: boolean;
  route?: string;
}

function MetricRow({ label, value, icon: Icon, color, highlight, route }: MetricRowProps) {
  const { navigateToList } = useWorkspaceNavigation();
  
  const content = (
    <div
      className={cn(
        "flex items-center justify-between py-2 px-3 rounded-lg transition-colors",
        route && "cursor-pointer hover:bg-muted/50",
        highlight && "bg-amber-500/5"
      )}
      onClick={() => route && navigateToList({ route, title: label, moduleCode: "mss" })}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", color)} />
        <span className="text-sm">{label}</span>
      </div>
      <Badge variant={highlight ? "destructive" : "secondary"} className="min-w-[32px] justify-center">
        {value}
      </Badge>
    </div>
  );

  return content;
}

export function TeamCompositionCard({ metrics, loading = false }: TeamCompositionCardProps) {
  const { navigateToList } = useWorkspaceNavigation();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const rows: MetricRowProps[] = [
    {
      label: "New Hires (90 days)",
      value: metrics.newHires,
      icon: UserPlus,
      color: "text-green-600",
      route: "/mss/onboarding",
    },
    {
      label: "Probationary",
      value: metrics.probationary,
      icon: Clock,
      color: "text-amber-600",
      route: "/mss/team?filter=probation",
    },
    {
      label: "Upcoming Anniversaries",
      value: metrics.upcomingAnniversaries,
      icon: Calendar,
      color: "text-blue-600",
      route: "/mss/team?filter=anniversaries",
    },
    {
      label: "Expiring Documents",
      value: metrics.expiringDocuments,
      icon: FileWarning,
      color: "text-orange-600",
      highlight: metrics.expiringDocuments > 0,
      route: "/mss/team?filter=expiring-docs",
    },
    {
      label: "Pending Exits",
      value: metrics.pendingExits,
      icon: UserMinus,
      color: "text-red-600",
      highlight: metrics.pendingExits > 0,
      route: "/mss/offboarding",
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Team Composition
            </CardTitle>
            <CardDescription className="text-xs">Workforce snapshot</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {rows.map((row) => (
          <MetricRow key={row.label} {...row} />
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-primary"
          onClick={() =>
            navigateToList({
              route: "/mss/team",
              title: "My Team",
              moduleCode: "mss",
            })
          }
        >
          View Full Team
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
