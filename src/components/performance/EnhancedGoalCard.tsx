import { useState } from "react";
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
  Edit,
  Trash,
  CheckCircle,
  AlertTriangle,
  Target,
  Users,
  Building2,
  User,
  Star,
} from "lucide-react";
import { differenceInDays, isPast } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { GoalRatingDialog } from "./GoalRatingDialog";

type GoalStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
type GoalType = 'okr_objective' | 'okr_key_result' | 'smart_goal';
type GoalLevel = 'company' | 'department' | 'team' | 'individual';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  goal_type: GoalType;
  goal_level: GoalLevel;
  status: GoalStatus;
  progress_percentage: number;
  weighting: number;
  due_date: string | null;
  target_value: number | null;
  current_value: number | null;
  unit_of_measure: string | null;
  category: string | null;
  employee_id?: string | null;
  self_rating?: number | null;
  manager_rating?: number | null;
  final_score?: number | null;
  employee?: { full_name: string } | null;
  department?: { name: string } | null;
}

interface EnhancedGoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onRefresh: () => void;
  onUpdateProgress?: (goal: Goal) => void;
  onViewComments?: (goal: Goal) => void;
  showOwner?: boolean;
  userRole?: "employee" | "manager";
}

const statusColors: Record<GoalStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  in_progress: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  overdue: "bg-warning/10 text-warning",
};

const levelIcons: Record<GoalLevel, typeof Target> = {
  company: Building2,
  department: Users,
  team: Users,
  individual: User,
};

const typeLabels: Record<GoalType, string> = {
  smart_goal: "SMART",
  okr_objective: "OKR",
  okr_key_result: "Key Result",
};

export function EnhancedGoalCard({
  goal,
  onEdit,
  onRefresh,
  onUpdateProgress,
  onViewComments,
  showOwner = false,
  userRole = "employee",
}: EnhancedGoalCardProps) {
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const isOverdue = goal.due_date && isPast(new Date(goal.due_date)) && goal.status !== "completed";
  const daysUntilDue = goal.due_date ? differenceInDays(new Date(goal.due_date), new Date()) : null;
  
  // Calculate if goal is at risk
  const isAtRisk = daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 7 && goal.progress_percentage < 80;

  const effectiveStatus: GoalStatus = isOverdue ? "overdue" : goal.status;
  const LevelIcon = levelIcons[goal.goal_level];

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    
    const { error } = await supabase
      .from("performance_goals")
      .delete()
      .eq("id", goal.id);
    
    if (error) {
      toast.error("Failed to delete goal");
    } else {
      toast.success("Goal deleted");
      onRefresh();
    }
  };

  const handleMarkComplete = async () => {
    const { error } = await supabase
      .from("performance_goals")
      .update({ status: "completed", progress_percentage: 100 })
      .eq("id", goal.id);
    
    if (error) {
      toast.error("Failed to update goal");
    } else {
      toast.success("Goal marked as complete");
      onRefresh();
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${isOverdue ? "border-warning/50" : ""} ${isAtRisk && !isOverdue ? "border-warning/30" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <LevelIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <CardTitle className="text-base truncate">{goal.title}</CardTitle>
              {isAtRisk && !isOverdue && (
                <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
              )}
            </div>
            <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {typeLabels[goal.goal_type]}
              </Badge>
              {showOwner && goal.employee?.full_name && (
                <span className="text-xs">{goal.employee.full_name}</span>
              )}
              {goal.category && (
                <Badge variant="secondary" className="text-xs">{goal.category}</Badge>
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
                <DropdownMenuItem onClick={() => onEdit(goal)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View / Edit
                </DropdownMenuItem>
                {onUpdateProgress && goal.status !== "completed" && (
                  <DropdownMenuItem onClick={() => onUpdateProgress(goal)}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Update Progress
                  </DropdownMenuItem>
                )}
                {onViewComments && (
                  <DropdownMenuItem onClick={() => onViewComments(goal)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Comments
                  </DropdownMenuItem>
                )}
                {(goal.status === "completed" || goal.progress_percentage >= 80) && (
                  <DropdownMenuItem onClick={() => setRatingDialogOpen(true)}>
                    <Star className="mr-2 h-4 w-4" />
                    {userRole === "employee" ? "Rate Goal" : "Rate / Review"}
                  </DropdownMenuItem>
                )}
                {goal.status !== "completed" && (
                  <DropdownMenuItem onClick={handleMarkComplete}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {goal.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {goal.description}
            </p>
          )}

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

          {/* Target Value */}
          {goal.target_value && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Target</span>
              <span>{goal.current_value || 0} / {goal.target_value} {goal.unit_of_measure}</span>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              {goal.due_date && (
                <div className={`flex items-center gap-1 ${isOverdue ? "text-warning font-medium" : ""}`}>
                  <Calendar className="h-3.5 w-3.5" />
                  {isOverdue ? (
                    <span>Overdue</span>
                  ) : daysUntilDue !== null && daysUntilDue <= 7 ? (
                    <span className="text-warning">{daysUntilDue}d left</span>
                  ) : (
                    <span>{formatDateForDisplay(goal.due_date, "MMM d")}</span>
                  )}
                </div>
              )}
              {goal.weighting > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {goal.weighting}%
                </div>
              )}
            </div>
            {/* Rating Badge */}
            {(goal.self_rating || goal.manager_rating || goal.final_score) && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="text-sm font-medium">
                  {goal.final_score ?? goal.manager_rating ?? goal.self_rating}/5
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Rating Dialog */}
      <GoalRatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        goal={goal}
        userRole={userRole}
        onSuccess={onRefresh}
      />
    </Card>
  );
}
