import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardCheck,
  Eye,
  Bell,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

interface DirectReport {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_avatar?: string;
  cycle_id: string;
  cycle_name: string;
  status: string;
  evaluation_deadline?: string | null;
  overall_score?: number | null;
  is_central_cycle?: boolean;
  self_assessment_completed?: boolean;
}

interface DirectReportsAppraisalStatusProps {
  reports: DirectReport[];
  onEvaluate: (report: DirectReport) => void;
  onView: (report: DirectReport) => void;
  onSendReminder: (report: DirectReport) => void;
  loading?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Clock },
  submitted: { label: "Submitted", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", icon: CheckCircle2 },
  reviewed: { label: "Reviewed", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle2 },
  finalized: { label: "Finalized", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle2 },
  overdue: { label: "Overdue", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

export function DirectReportsAppraisalStatus({
  reports,
  onEvaluate,
  onView,
  onSendReminder,
  loading = false,
}: DirectReportsAppraisalStatusProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOverdue = (deadline: string | null | undefined, status: string) => {
    if (!deadline || status === "reviewed" || status === "finalized") return false;
    return new Date(deadline) < new Date();
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "text-muted-foreground";
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-blue-600";
    if (score >= 2) return "text-amber-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Direct Reports Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Direct Reports Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No pending evaluations for your team</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Direct Reports Status
          <Badge variant="secondary" className="ml-2">
            {reports.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const overdue = isOverdue(report.evaluation_deadline, report.status);
                const status = overdue ? statusConfig.overdue : (statusConfig[report.status] || statusConfig.pending);
                const StatusIcon = status.icon;

                return (
                  <TableRow 
                    key={report.id}
                    className={cn(overdue && "bg-destructive/5")}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={report.employee_avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(report.employee_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{report.employee_name}</p>
                          {report.self_assessment_completed && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Self-assessed
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{report.cycle_name}</span>
                        {report.is_central_cycle && (
                          <Badge variant="outline" className="text-xs">Central</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1", status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.evaluation_deadline ? (
                        <div className={cn(
                          "flex items-center gap-1 text-sm",
                          overdue && "text-destructive font-medium"
                        )}>
                          <Calendar className="h-3 w-3" />
                          {formatDateForDisplay(report.evaluation_deadline)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {report.overall_score !== null && report.overall_score !== undefined ? (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          <span className={cn("font-medium", getScoreColor(report.overall_score))}>
                            {report.overall_score.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(report.status === "pending" || report.status === "in_progress") && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onEvaluate(report)}
                            >
                              <ClipboardCheck className="h-3 w-3 mr-1" />
                              Evaluate
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onSendReminder(report)}
                            >
                              <Bell className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {(report.status === "submitted" || report.status === "reviewed" || report.status === "finalized") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onView(report)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
