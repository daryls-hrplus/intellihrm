import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SubTaskItem } from "./SubTaskItem";
import { useSubTaskProgress, SubTaskDefinition } from "@/hooks/useSubTaskProgress";
import { Loader2 } from "lucide-react";

interface SubTaskListProps {
  companyId: string | undefined;
  phaseId: string;
  stepOrder: number;
  subTaskDefinitions?: SubTaskDefinition[];
}

export function SubTaskList({ companyId, phaseId, stepOrder, subTaskDefinitions }: SubTaskListProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { 
    subTasks, 
    isLoading, 
    initializeSubTasks, 
    updateSubTaskStatus, 
    getCompletionStats 
  } = useSubTaskProgress(companyId, phaseId, stepOrder);

  useEffect(() => {
    if (subTaskDefinitions && subTaskDefinitions.length > 0 && subTasks.length === 0 && !isLoading) {
      initializeSubTasks(subTaskDefinitions);
    }
  }, [subTaskDefinitions, subTasks.length, isLoading]);

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
          {stats.completed}/{stats.total}
        </span>
        {stats.blocked > 0 && (
          <Badge variant="destructive" className="text-xs">
            {stats.blocked} blocked
          </Badge>
        )}
        {stats.deferred > 0 && (
          <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
            {stats.deferred} deferred
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
