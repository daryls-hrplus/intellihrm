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
  AlertTriangle,
} from "lucide-react";
import { differenceInDays, isPast } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";

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
}

interface TeamGoalCardProps {
  goal: Goal;
  onView: (goal: Goal) => void;
  onUpdateProgress: (goal: Goal) => void;
  onViewComments: (goal: Goal) => void;
  onSendReminder: (goal: Goal) => void;
  onRequestUpdate: (goal: Goal) => void;
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
              {isAtRisk && !isOverdue && (
                <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
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
                <DropdownMenuItem onClick={() => onUpdateProgress(goal)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewComments(goal)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Comments
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onSendReminder(goal)}>
                  <Bell className="mr-2 h-4 w-4" />
                  Send Reminder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRequestUpdate(goal)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Request Update
                </DropdownMenuItem>
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
