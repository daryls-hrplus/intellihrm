import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useEvidenceAuditTrail, AuditSummary } from "@/hooks/useEvidenceAuditTrail";

interface EvidenceAuditSummaryCardProps {
  employeeId: string;
  periodDays?: number;
  compact?: boolean;
}

export function EvidenceAuditSummaryCard({
  employeeId,
  periodDays = 30,
  compact = false,
}: EvidenceAuditSummaryCardProps) {
  const { loading, fetchAuditSummary } = useEvidenceAuditTrail();
  const [summary, setSummary] = useState<AuditSummary | null>(null);

  useEffect(() => {
    loadSummary();
  }, [employeeId, periodDays]);

  const loadSummary = async () => {
    const data = await fetchAuditSummary(employeeId, periodDays);
    setSummary(data);
  };

  if (loading && !summary) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const stats = [
    {
      label: "Total Actions",
      value: summary.totalActions,
      icon: <Activity className="h-4 w-4" />,
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      label: "Validations",
      value: summary.validationsThisPeriod,
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Rejections",
      value: summary.rejectionsThisPeriod,
      icon: <XCircle className="h-4 w-4" />,
      color: "text-red-600 bg-red-500/10",
    },
    {
      label: "New Evidence",
      value: summary.byAction['created'] || 0,
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-purple-600 bg-purple-500/10",
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Last {periodDays} days:</span>
        </div>
        <div className="flex items-center gap-3">
          {stats.map(stat => (
            <Badge key={stat.label} variant="secondary" className={stat.color}>
              {stat.icon}
              <span className="ml-1">{stat.value}</span>
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Activity Summary
          <Badge variant="outline" className="ml-auto text-xs">
            Last {periodDays} days
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(stat => (
            <div
              key={stat.label}
              className={`p-3 rounded-lg ${stat.color} flex flex-col items-center justify-center text-center`}
            >
              {stat.icon}
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-xs opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>

        {summary.recentActivity.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Recent Activity
            </p>
            <div className="space-y-1">
              {summary.recentActivity.slice(0, 3).map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-xs p-2 rounded bg-accent/30"
                >
                  <span className="capitalize">{entry.action.replace(/_/g, ' ')}</span>
                  <span className="text-muted-foreground">
                    {new Date(entry.performed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
