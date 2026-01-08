import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertTriangle, CheckCircle2, Paperclip } from "lucide-react";
import { differenceInHours } from "date-fns";

interface ChangeRequest {
  id: string;
  status: string;
  requested_at: string;
  applied_at: string | null;
  document_urls?: string[] | null;
}

interface RequestMetricsCardsProps {
  requests: ChangeRequest[] | undefined;
}

export function RequestMetricsCards({ requests }: RequestMetricsCardsProps) {
  const now = new Date();
  
  const pendingCount = requests?.filter((r) => r.status === "pending").length || 0;
  
  const overdueCount = requests?.filter((r) => {
    if (r.status !== "pending") return false;
    const hoursAgo = differenceInHours(now, new Date(r.requested_at));
    return hoursAgo > 48;
  }).length || 0;
  
  const completedTodayCount = requests?.filter((r) => {
    if (r.status !== "applied" && r.status !== "rejected") return false;
    if (!r.applied_at) return false;
    const appliedDate = new Date(r.applied_at);
    return appliedDate.toDateString() === now.toDateString();
  }).length || 0;
  
  const withDocsCount = requests?.filter((r) => {
    return r.document_urls && r.document_urls.length > 0;
  }).length || 0;

  const metrics = [
    {
      label: "Pending Review",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-100/80 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800",
    },
    {
      label: "Overdue (48h+)",
      value: overdueCount,
      icon: AlertTriangle,
      color: "text-red-700 dark:text-red-400",
      bgColor: "bg-red-100/80 dark:bg-red-900/40 border border-red-200 dark:border-red-800",
    },
    {
      label: "Completed Today",
      value: completedTodayCount,
      icon: CheckCircle2,
      color: "text-emerald-700 dark:text-emerald-400",
      bgColor: "bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800",
    },
    {
      label: "With Documents",
      value: withDocsCount,
      icon: Paperclip,
      color: "text-blue-700 dark:text-blue-400",
      bgColor: "bg-blue-100/80 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className={metric.bgColor}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${metric.color}`}>
                  {metric.value}
                </p>
              </div>
              <metric.icon className={`h-8 w-8 ${metric.color} opacity-50`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
