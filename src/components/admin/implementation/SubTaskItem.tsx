import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Circle,
  CheckCircle2,
  MinusCircle,
  Clock,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import type { SubTaskProgress, SubTaskStatus } from "@/hooks/useSubTaskProgress";

interface SubTaskItemProps {
  subTask: SubTaskProgress;
  onUpdateStatus: (order: number, status: SubTaskStatus, notes?: string, blockerReason?: string) => Promise<void>;
  isUpdating: boolean;
}

const statusConfig: Record<SubTaskStatus, { icon: React.ElementType; label: string; color: string }> = {
  pending: { icon: Circle, label: "Pending", color: "text-muted-foreground" },
  completed: { icon: CheckCircle2, label: "Completed", color: "text-green-600" },
  not_applicable: { icon: MinusCircle, label: "N/A", color: "text-blue-600" },
  deferred: { icon: Clock, label: "Deferred", color: "text-orange-500" },
  blocked: { icon: AlertCircle, label: "Blocked", color: "text-destructive" },
};

export function SubTaskItem({ subTask, onUpdateStatus, isUpdating }: SubTaskItemProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(subTask.notes || "");
  const [blockerReason, setBlockerReason] = useState(subTask.blocker_reason || "");

  const currentStatus = statusConfig[subTask.status];
  const StatusIcon = currentStatus.icon;

  const handleStatusChange = async (newStatus: SubTaskStatus) => {
    if (newStatus === 'blocked') {
      setShowNotes(true);
    } else {
      await onUpdateStatus(subTask.sub_task_order, newStatus, notes, blockerReason);
    }
  };

  const handleSaveBlocker = async () => {
    await onUpdateStatus(subTask.sub_task_order, 'blocked', notes, blockerReason);
    setShowNotes(false);
  };

  return (
    <div className="flex flex-col gap-2 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <StatusIcon className={`h-4 w-4 ${currentStatus.color}`} />
        
        {/* Task Name */}
        <span className={`flex-1 text-sm ${subTask.status === 'completed' ? 'line-through text-muted-foreground' : ''} ${!subTask.is_required ? 'text-muted-foreground' : ''}`}>
          {subTask.sub_task_name}
          {!subTask.is_required && <span className="ml-2 text-xs italic">(Optional)</span>}
        </span>

        {/* Status Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs gap-1"
              disabled={isUpdating}
            >
              <span className={currentStatus.color}>{currentStatus.label}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              return (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status as SubTaskStatus)}
                  className="gap-2"
                >
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  {config.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Blocker/Notes Input */}
      {showNotes && (
        <div className="ml-7 space-y-2">
          <Textarea
            placeholder="What's blocking this task?"
            value={blockerReason}
            onChange={(e) => setBlockerReason(e.target.value)}
            className="min-h-[60px] text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveBlocker} disabled={!blockerReason.trim()}>
              Save Blocker
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowNotes(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Show existing blocker reason */}
      {subTask.status === 'blocked' && subTask.blocker_reason && !showNotes && (
        <div className="ml-7 text-xs text-destructive bg-destructive/10 p-2 rounded">
          <strong>Blocked:</strong> {subTask.blocker_reason}
        </div>
      )}

      {/* Show notes if present */}
      {subTask.notes && subTask.status !== 'blocked' && (
        <div className="ml-7 text-xs text-muted-foreground bg-muted p-2 rounded">
          {subTask.notes}
        </div>
      )}
    </div>
  );
}
