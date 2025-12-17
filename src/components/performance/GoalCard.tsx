import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  MoreVertical,
  Edit,
  Trash2,
  MessageSquare,
  TrendingUp,
  Target,
  Flag,
  CheckCircle,
  Calendar,
  User,
  Building2,
  Users,
} from "lucide-react";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
import { GoalProgressDialog } from "./GoalProgressDialog";
import { GoalCommentsDialog } from "./GoalCommentsDialog";

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
  start_date: string;
  due_date: string | null;
  target_value: number | null;
  current_value: number | null;
  unit_of_measure: string | null;
  employee_id: string | null;
  department_id: string | null;
  parent_goal_id: string | null;
  category: string | null;
  employee?: { full_name: string } | null;
  department?: { name: string } | null;
}

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onRefresh: () => void;
}

const statusConfig: Record<GoalStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  active: { label: "Active", className: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", className: "bg-info/10 text-info" },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
  overdue: { label: "Overdue", className: "bg-warning/10 text-warning" },
};

const typeConfig: Record<GoalType, { label: string; icon: typeof Target }> = {
  okr_objective: { label: "OKR Objective", icon: Target },
  okr_key_result: { label: "Key Result", icon: TrendingUp },
  smart_goal: { label: "SMART Goal", icon: Flag },
};

const levelIcons: Record<GoalLevel, typeof User> = {
  company: Building2,
  department: Building2,
  team: Users,
  individual: User,
};

export function GoalCard({ goal, onEdit, onRefresh }: GoalCardProps) {
  const { logAction } = useAuditLog();
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);

  const TypeIcon = typeConfig[goal.goal_type]?.icon || Flag;
  const LevelIcon = levelIcons[goal.goal_level];
  const statusStyle = statusConfig[goal.status];

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const { error } = await supabase
        .from("performance_goals")
        .delete()
        .eq("id", goal.id);

      if (error) throw error;

      await logAction({
        action: "DELETE",
        entityType: "performance_goal",
        entityId: goal.id,
        entityName: goal.title,
      });

      toast.success("Goal deleted successfully");
      onRefresh();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  const handleMarkComplete = async () => {
    try {
      const { error } = await supabase
        .from("performance_goals")
        .update({
          status: "completed",
          progress_percentage: 100,
          completed_date: getTodayString(),
        })
        .eq("id", goal.id);

      if (error) throw error;

      await logAction({
        action: "UPDATE",
        entityType: "performance_goal",
        entityId: goal.id,
        entityName: goal.title,
        newValues: { status: "completed" },
      });

      toast.success("Goal marked as complete");
      onRefresh();
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal");
    }
  };

  return (
    <>
      <Card className="group hover:shadow-card-hover transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TypeIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  {typeConfig[goal.goal_type]?.label}
                </span>
                <Badge variant="outline" className={statusStyle.className}>
                  {statusStyle.label}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(goal)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProgressDialogOpen(true)}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Update Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCommentsDialogOpen(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Comments
                </DropdownMenuItem>
                {goal.status !== "completed" && (
                  <DropdownMenuItem onClick={handleMarkComplete}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {goal.description}
            </p>
          )}

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{goal.progress_percentage}%</span>
              </div>
              <Progress value={goal.progress_percentage} className="h-2" />
            </div>

            {goal.target_value && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Target</span>
                <span className="font-medium">
                  {goal.current_value || 0} / {goal.target_value} {goal.unit_of_measure}
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {goal.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Due {formatDateForDisplay(goal.due_date)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <LevelIcon className="h-3 w-3" />
                <span className="capitalize">{goal.goal_level}</span>
              </div>
            </div>

            {goal.weighting > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Weight</span>
                <Badge variant="outline">{goal.weighting}%</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <GoalProgressDialog
        open={progressDialogOpen}
        onOpenChange={setProgressDialogOpen}
        goal={goal}
        onSuccess={onRefresh}
      />

      <GoalCommentsDialog
        open={commentsDialogOpen}
        onOpenChange={setCommentsDialogOpen}
        goalId={goal.id}
        goalTitle={goal.title}
      />
    </>
  );
}
