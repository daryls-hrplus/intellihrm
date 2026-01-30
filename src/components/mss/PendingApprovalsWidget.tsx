import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  GraduationCap,
  Receipt,
  GitBranch,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import type { PendingApprovalsMetrics } from "@/hooks/useMssTeamMetrics";

interface PendingApprovalsWidgetProps {
  approvals: PendingApprovalsMetrics;
  loading?: boolean;
}

interface ApprovalRowProps {
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  route: string;
}

function ApprovalRow({ label, count, icon: Icon, color, route }: ApprovalRowProps) {
  const { navigateToList } = useWorkspaceNavigation();

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 px-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50",
        count > 0 && "bg-muted/30"
      )}
      onClick={() =>
        navigateToList({
          route,
          title: label,
          moduleCode: "mss",
        })
      }
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", color)} />
        <span className="text-sm">{label}</span>
      </div>
      <Badge variant={count > 0 ? "default" : "secondary"} className="min-w-[32px] justify-center">
        {count}
      </Badge>
    </div>
  );
}

export function PendingApprovalsWidget({ approvals, loading = false }: PendingApprovalsWidgetProps) {
  const { navigateToList } = useWorkspaceNavigation();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const approvalRows: ApprovalRowProps[] = [
    {
      label: "Leave Requests",
      count: approvals.leave,
      icon: Calendar,
      color: "text-green-600",
      route: "/mss/leave-approvals",
    },
    {
      label: "Time Approvals",
      count: approvals.time,
      icon: Clock,
      color: "text-orange-600",
      route: "/mss/time-attendance",
    },
    {
      label: "Training Requests",
      count: approvals.training,
      icon: GraduationCap,
      color: "text-amber-600",
      route: "/mss/training",
    },
    {
      label: "Workflow Approvals",
      count: approvals.workflow,
      icon: GitBranch,
      color: "text-purple-600",
      route: "/workflow/approvals",
    },
  ];

  // Only show expense if we have that functionality
  if (approvals.expense > 0) {
    approvalRows.push({
      label: "Expense Claims",
      count: approvals.expense,
      icon: Receipt,
      color: "text-emerald-600",
      route: "/mss/expenses",
    });
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              Pending Approvals
              {approvals.total > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {approvals.total}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs">Actions requiring your attention</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {approvalRows.map((row) => (
          <ApprovalRow key={row.label} {...row} />
        ))}

        {approvals.total > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-primary"
            onClick={() =>
              navigateToList({
                route: "/workflow/approvals",
                title: "All Approvals",
                moduleCode: "workflow",
              })
            }
          >
            View All Approvals
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}

        {approvals.total === 0 && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <Badge variant="outline" className="mb-2">
              All Caught Up
            </Badge>
            <p className="text-xs text-muted-foreground">No pending approvals</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
