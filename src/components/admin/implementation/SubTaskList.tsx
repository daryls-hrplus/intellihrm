import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SubTaskItem } from "./SubTaskItem";
import { useSubTaskProgress, SubTaskDefinition, StepRollupStatus } from "@/hooks/useSubTaskProgress";
import { Loader2 } from "lucide-react";

interface SubTaskListProps {
  companyId: string | undefined;
  phaseId: string;
  stepOrder: number;
  subTaskDefinitions?: SubTaskDefinition[];
  onStepStatusChange?: (status: StepRollupStatus) => void;
}

export function SubTaskList({ companyId, phaseId, stepOrder, subTaskDefinitions, onStepStatusChange }: SubTaskListProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { 
    subTasks, 
    isLoading, 
    initializeSubTasks,
    syncSubTasks,
    updateSubTaskStatus, 
    getCompletionStats,
    calculateStepStatus,
  } = useSubTaskProgress(companyId, phaseId, stepOrder);

  // Initialize if no subtasks exist, or sync if definitions have changed
  useEffect(() => {
    if (!subTaskDefinitions || subTaskDefinitions.length === 0 || isLoading) return;
    
    if (subTasks.length === 0) {
      // No subtasks exist yet - initialize
      initializeSubTasks(subTaskDefinitions);
    } else {
      // Check if definitions have changed (different count or different names)
      const needsSync = subTasks.length !== subTaskDefinitions.length ||
        subTasks.some((st) => {
          const def = subTaskDefinitions.find(d => d.order === st.sub_task_order);
          return !def || def.name !== st.sub_task_name;
        });
      
      if (needsSync) {
        syncSubTasks(subTaskDefinitions);
      }
    }
  }, [subTaskDefinitions, subTasks, isLoading]);

  // Notify parent of status changes
  useEffect(() => {
    if (subTasks.length > 0 && onStepStatusChange) {
      onStepStatusChange(calculateStepStatus());
    }
  }, [subTasks, onStepStatusChange, calculateStepStatus]);

  const handleUpdateStatus = async (order: number, status: Parameters<typeof updateSubTaskStatus>[1], notes?: string, blockerReason?: string) => {
    setIsUpdating(true);
    try {
      await updateSubTaskStatus(order, status, notes, blockerReason);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (subTasks.length === 0 && (!subTaskDefinitions || subTaskDefinitions.length === 0)) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        No sub-tasks defined for this step.
      </p>
    );
  }

  const stats = getCompletionStats();

  return (
    <div className="space-y-3">
      {/* Progress Summary */}
      <div className="flex items-center gap-3">
        <Progress value={stats.percentage} className="flex-1 h-2" />
        <span className="text-sm font-medium text-muted-foreground">
          {stats.requiredCompleted}/{stats.required} required
        </span>
        {stats.requiredBlocked > 0 && (
          <Badge variant="destructive" className="text-xs">
            {stats.requiredBlocked} blocked
          </Badge>
        )}
        {stats.stepStatus === 'completed' && (
          <Badge className="text-xs bg-green-500">
            Ready
          </Badge>
        )}
        {stats.stepStatus === 'deferred' && (
          <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
            Deferred
          </Badge>
        )}
      </div>

      {/* Sub-task Items */}
      <div className="divide-y">
        {subTasks.map((subTask) => (
          <SubTaskItem
            key={subTask.id}
            subTask={subTask}
            onUpdateStatus={handleUpdateStatus}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
}
