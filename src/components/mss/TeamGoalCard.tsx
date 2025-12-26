import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Calendar,
  TrendingUp,
  MoreVertical,
  MessageSquare,
  Bell,
  RefreshCw,
  Link2,
  ClipboardCheck,
  FileEdit,
  ScrollText,
  Lock,
  Unlock,
} from "lucide-react";
import { differenceInDays, isPast } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { GoalRiskIndicator } from "@/components/performance/GoalRiskIndicator";
import type { RiskIndicator, RiskFactor } from "@/types/goalDependencies";

type GoalStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  goal_type: string;
  status: GoalStatus;
  progress_percentage: number;
  weighting: number;
  due_date: string | null;
  employee_name?: string;
  category: string | null;
  // Risk assessment fields
  risk_indicator?: RiskIndicator | null;
  risk_score?: number | null;
  risk_factors?: RiskFactor[];
  dependency_count?: number;
  // Lock status
  is_locked?: boolean;
}

interface TeamGoalCardProps {
  goal: Goal;
  onView: (goal: Goal) => void;
  onUpdateProgress: (goal: Goal) => void;
  onViewComments: (goal: Goal) => void;
  onSendReminder: (goal: Goal) => void;
  onRequestUpdate: (goal: Goal) => void;
  onManageDependencies?: (goal: Goal) => void;
  onReviewCheckIn?: (goal: Goal) => void;
  onRequestCheckIn?: (goal: Goal) => void;
  // Goal Adjustment Features (MSS - full manager access)
  onRecordAdjustment?: (goal: Goal) => void;
  onViewAuditTrail?: (goal: Goal) => void;
  onLockGoal?: (goal: Goal) => void;
  onUnlockGoal?: (goal: Goal) => void;
  pendingCheckInCount?: number;
  pendingAdjustmentCount?: number;
}

const statusColors: Record<GoalStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  in_progress: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  overdue: "bg-warning/10 text-warning",
};

export function TeamGoalCard({
  goal,
  onView,
  onUpdateProgress,
  onViewComments,
  onSendReminder,
  onRequestUpdate,
  onManageDependencies,
  onReviewCheckIn,
  onRequestCheckIn,
  onRecordAdjustment,
  onViewAuditTrail,
  onLockGoal,
  onUnlockGoal,
  pendingCheckInCount = 0,
  pendingAdjustmentCount = 0,
}: TeamGoalCardProps) {
  const isOverdue = goal.due_date && isPast(new Date(goal.due_date)) && goal.status !== "completed";
  const daysUntilDue = goal.due_date ? differenceInDays(new Date(goal.due_date), new Date()) : null;
  
  // Calculate if goal is at risk (progress behind expected)
  const isAtRisk = daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 7 && goal.progress_percentage < 80;

  // Determine effective status for display
  const effectiveStatus: GoalStatus = isOverdue ? "overdue" : goal.status;

  return (
    <Card className={`transition-all hover:shadow-md ${isOverdue ? "border-warning/50" : ""} ${isAtRisk ? "border-warning/30" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg truncate">{goal.title}</CardTitle>
              {goal.risk_indicator && (
                <GoalRiskIndicator
                  riskIndicator={goal.risk_indicator}
                  riskScore={goal.risk_score}
                  riskFactors={goal.risk_factors}
                  size="sm"
                  showLabel={false}
                />
              )}
            </div>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>{goal.employee_name}</span>
              <span>•</span>
              <span>{goal.goal_type.replace(/_/g, " ")}</span>
              {goal.category && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">{goal.category}</Badge>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[effectiveStatus]}>
              {effectiveStatus.replace("_", " ")}
            </Badge>
            {goal.is_locked && (
              <Badge variant="outline" className="border-warning text-warning">
                <Lock className="mr-1 h-3 w-3" />
                Locked
              </Badge>
            )}
            {pendingAdjustmentCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <FileEdit className="mr-1 h-3 w-3" />
                {pendingAdjustmentCount} pending
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(goal)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {onReviewCheckIn && (
                  <DropdownMenuItem onClick={() => onReviewCheckIn(goal)}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Review Check-in
                    {pendingCheckInCount > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs h-5 w-5 p-0 flex items-center justify-center">
                        {pendingCheckInCount}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onUpdateProgress(goal)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewComments(goal)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Comments
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                {/* Goal Adjustment Features (MSS - Manager full access) */}
                {onRecordAdjustment && (
                  <DropdownMenuItem onClick={() => onRecordAdjustment(goal)}>
                    <FileEdit className="mr-2 h-4 w-4" />
                    Record Adjustment
                  </DropdownMenuItem>
                )}
                {onViewAuditTrail && (
                  <DropdownMenuItem onClick={() => onViewAuditTrail(goal)}>
                    <ScrollText className="mr-2 h-4 w-4" />
                    View Audit Trail
                    {pendingAdjustmentCount > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {pendingAdjustmentCount}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                )}
                {onLockGoal && !goal.is_locked && (
                  <DropdownMenuItem onClick={() => onLockGoal(goal)}>
                    <Lock className="mr-2 h-4 w-4" />
                    Lock Goal
                  </DropdownMenuItem>
                )}
                {onUnlockGoal && goal.is_locked && (
                  <DropdownMenuItem onClick={() => onUnlockGoal(goal)}>
                    <Unlock className="mr-2 h-4 w-4" />
                    Unlock Goal
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => onSendReminder(goal)}>
                  <Bell className="mr-2 h-4 w-4" />
                  Send Reminder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRequestUpdate(goal)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Request Update
                </DropdownMenuItem>
                {onRequestCheckIn && (
                  <DropdownMenuItem onClick={() => onRequestCheckIn(goal)}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Request Check-in
                  </DropdownMenuItem>
                )}
                {onManageDependencies && (
                  <DropdownMenuItem onClick={() => onManageDependencies(goal)}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Manage Dependencies
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className={`font-medium ${goal.progress_percentage >= 100 ? "text-success" : ""}`}>
                {goal.progress_percentage}%
              </span>
            </div>
            <Progress 
              value={goal.progress_percentage} 
              className={`h-2 ${isOverdue ? "[&>div]:bg-warning" : ""}`}
            />
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {goal.due_date && (
                <div className={`flex items-center gap-2 ${isOverdue ? "text-warning font-medium" : ""}`}>
                  <Calendar className="h-4 w-4" />
                  {isOverdue ? (
                    <span>Overdue by {Math.abs(daysUntilDue!)} days</span>
                  ) : daysUntilDue !== null && daysUntilDue <= 7 ? (
                    <span className="text-warning">{daysUntilDue} days left</span>
                  ) : (
                    <span>Due: {formatDateForDisplay(goal.due_date, "MMM d, yyyy")}</span>
                  )}
                </div>
              )}
              {goal.weighting > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Weight: {goal.weighting}%
                </div>
              )}
              {goal.dependency_count !== undefined && goal.dependency_count > 0 && (
                <div className="flex items-center gap-1">
                  <Link2 className="h-4 w-4" />
                  <span>{goal.dependency_count} deps</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onView(goal)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
