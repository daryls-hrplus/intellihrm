import { format } from "date-fns";
import { CheckCircle2, XCircle, RotateCcw, AlertTriangle, Clock, User, MessageSquare, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WorkflowStepAction, WorkflowAction } from "@/hooks/useWorkflow";

interface WorkflowTimelineProps {
  actions: WorkflowStepAction[];
  showInternalNotes?: boolean;
}

export function WorkflowTimeline({ actions, showInternalNotes = false }: WorkflowTimelineProps) {
  const getActionIcon = (action: WorkflowAction) => {
    switch (action) {
      case "approve":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "reject":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "return":
        return <RotateCcw className="h-4 w-4 text-amber-500" />;
      case "escalate":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "delegate":
        return <User className="h-4 w-4 text-blue-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionLabel = (action: WorkflowAction) => {
    switch (action) {
      case "approve":
        return "Approved";
      case "reject":
        return "Rejected";
      case "return":
        return "Returned";
      case "escalate":
        return "Escalated";
      case "delegate":
        return "Delegated";
      case "comment":
        return "Commented";
      default:
        return action;
    }
  };

  const getActionBadgeVariant = (action: WorkflowAction): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case "approve":
        return "default";
      case "reject":
        return "destructive";
      case "return":
      case "escalate":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (actions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No actions taken yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actions.map((action, index) => (
        <div key={action.id}>
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                {getActionIcon(action.action)}
              </div>
              {index < actions.length - 1 && (
                <div className="w-px flex-1 bg-border mt-2" />
              )}
            </div>
            
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">
                  {action.actor?.full_name || "Unknown User"}
                </span>
                <Badge variant={getActionBadgeVariant(action.action)}>
                  {getActionLabel(action.action)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Step {action.step_order}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(action.acted_at), "MMM d, yyyy 'at' h:mm a")}
              </p>

              {action.comment && (
                <div className="mt-2 rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="whitespace-pre-wrap">{action.comment}</p>
                </div>
              )}

              {showInternalNotes && action.internal_notes && (
                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 text-sm">
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
                    Internal Note
                  </p>
                  <p className="whitespace-pre-wrap text-amber-900 dark:text-amber-100">
                    {action.internal_notes}
                  </p>
                </div>
              )}

              {action.return_reason && (
                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 text-sm">
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
                    Reason for Return
                  </p>
                  <p className="whitespace-pre-wrap text-amber-900 dark:text-amber-100">
                    {action.return_reason}
                  </p>
                </div>
              )}

              {action.delegated_to && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <span>Delegated to: </span>
                  <span className="font-medium">{action.delegated_to}</span>
                  {action.delegation_reason && (
                    <span> - {action.delegation_reason}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
