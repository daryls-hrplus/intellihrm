import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { MoreVertical, Edit, Trash2, TrendingUp, CheckCircle, MessageSquare, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
import { GoalProgressDialog } from "./GoalProgressDialog";
import { GoalCommentsDialog } from "./GoalCommentsDialog";
import { GoalWeightBadge } from "./GoalWeightSummary";
import { WeightSummary, WeightStatus } from "@/hooks/useGoalWeights";

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

interface GoalsListProps {
  goals: Goal[];
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

const typeLabels: Record<GoalType, string> = {
  okr_objective: "OKR Objective",
  okr_key_result: "Key Result",
  smart_goal: "SMART",
};

export function GoalsList({ goals, onEdit, onRefresh }: GoalsListProps) {
  const { logAction } = useAuditLog();
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Calculate weight summaries per employee
  const employeeWeightMap = useMemo(() => {
    const map = new Map<string, { totalWeight: number; goalCount: number }>();
    
    goals.forEach(goal => {
      if (goal.goal_level === "individual" && goal.employee_id) {
        const current = map.get(goal.employee_id) || { totalWeight: 0, goalCount: 0 };
        map.set(goal.employee_id, {
          totalWeight: current.totalWeight + (goal.weighting || 0),
          goalCount: current.goalCount + 1,
        });
      }
    });
    
    return map;
  }, [goals]);

  const getEmployeeWeightSummary = (employeeId: string | null): WeightSummary | null => {
    if (!employeeId) return null;
    const data = employeeWeightMap.get(employeeId);
    if (!data) return null;
    
    const status: WeightStatus = data.totalWeight === 100 ? "complete" : 
                                  data.totalWeight < 100 ? "under" : "over";
    
    return {
      totalWeight: data.totalWeight,
      remainingWeight: 100 - data.totalWeight,
      status,
      goalCount: data.goalCount,
      requiredGoalCount: 0,
    };
  };

  const handleDelete = async (goal: Goal) => {
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

  const handleMarkComplete = async (goal: Goal) => {
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

  const openProgressDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setProgressDialogOpen(true);
  };

  const openCommentsDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setCommentsDialogOpen(true);
  };

  if (goals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No goals found.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal) => {
              const statusStyle = statusConfig[goal.status];
              return (
                <TableRow key={goal.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      {goal.category && (
                        <p className="text-xs text-muted-foreground">{goal.category}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[goal.goal_type]}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{goal.goal_level}</TableCell>
                  <TableCell>
                    <Badge className={statusStyle.className}>{statusStyle.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress value={goal.progress_percentage} className="h-2 flex-1" />
                      <span className="text-sm text-muted-foreground w-10">
                        {goal.progress_percentage}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{goal.weighting}%</span>
                      {goal.goal_level === "individual" && goal.employee_id && (
                        (() => {
                          const summary = getEmployeeWeightSummary(goal.employee_id);
                          return summary && summary.status !== "complete" ? (
                            <GoalWeightBadge summary={summary} />
                          ) : null;
                        })()
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {goal.due_date
                      ? formatDateForDisplay(goal.due_date, "MMM d, yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
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
                        <DropdownMenuItem onClick={() => openProgressDialog(goal)}>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Update Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openCommentsDialog(goal)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Comments
                        </DropdownMenuItem>
                        {goal.status !== "completed" && (
                          <DropdownMenuItem onClick={() => handleMarkComplete(goal)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(goal)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedGoal && (
        <>
          <GoalProgressDialog
            open={progressDialogOpen}
            onOpenChange={setProgressDialogOpen}
            goal={selectedGoal}
            onSuccess={onRefresh}
          />
          <GoalCommentsDialog
            open={commentsDialogOpen}
            onOpenChange={setCommentsDialogOpen}
            goalId={selectedGoal.id}
            goalTitle={selectedGoal.title}
          />
        </>
      )}
    </>
  );
}
