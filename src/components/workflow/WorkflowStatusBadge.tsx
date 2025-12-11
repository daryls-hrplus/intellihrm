import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertTriangle, RotateCcw, Ban, Timer } from "lucide-react";
import { WorkflowStatus } from "@/hooks/useWorkflow";

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
  showIcon?: boolean;
}

export function WorkflowStatusBadge({ status, showIcon = true }: WorkflowStatusBadgeProps) {
  const config: Record<WorkflowStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    draft: {
      label: "Draft",
      variant: "outline",
      icon: <Clock className="h-3 w-3" />,
    },
    pending: {
      label: "Pending",
      variant: "secondary",
      icon: <Clock className="h-3 w-3" />,
    },
    in_progress: {
      label: "In Progress",
      variant: "default",
      icon: <Timer className="h-3 w-3" />,
    },
    approved: {
      label: "Approved",
      variant: "default",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    rejected: {
      label: "Rejected",
      variant: "destructive",
      icon: <XCircle className="h-3 w-3" />,
    },
    cancelled: {
      label: "Cancelled",
      variant: "outline",
      icon: <Ban className="h-3 w-3" />,
    },
    escalated: {
      label: "Escalated",
      variant: "secondary",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    returned: {
      label: "Returned",
      variant: "secondary",
      icon: <RotateCcw className="h-3 w-3" />,
    },
    auto_terminated: {
      label: "Auto-Terminated",
      variant: "destructive",
      icon: <Timer className="h-3 w-3" />,
    },
  };

  const { label, variant, icon } = config[status] || config.pending;

  return (
    <Badge variant={variant} className="gap-1">
      {showIcon && icon}
      {label}
    </Badge>
  );
}
