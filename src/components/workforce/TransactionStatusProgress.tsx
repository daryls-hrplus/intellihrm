import { cn } from "@/lib/utils";
import { TransactionStatus } from "@/hooks/useEmployeeTransactions";
import { Check, Clock, X, FileEdit, Ban } from "lucide-react";

interface TransactionStatusProgressProps {
  status: TransactionStatus;
  requiresWorkflow?: boolean;
  size?: "sm" | "default";
}

const statusSteps = [
  { key: "draft", label: "Draft", icon: FileEdit },
  { key: "pending_approval", label: "Pending", icon: Clock },
  { key: "approved", label: "Approved", icon: Check },
  { key: "completed", label: "Completed", icon: Check },
];

const statusIndex: Record<TransactionStatus, number> = {
  draft: 0,
  pending_approval: 1,
  approved: 2,
  completed: 3,
  rejected: -1,
  cancelled: -1,
};

export function TransactionStatusProgress({
  status,
  requiresWorkflow = true,
  size = "default",
}: TransactionStatusProgressProps) {
  const currentIndex = statusIndex[status];
  const isRejected = status === "rejected";
  const isCancelled = status === "cancelled";
  const isTerminal = isRejected || isCancelled;

  // For non-workflow transactions, show simplified view
  if (!requiresWorkflow) {
    return (
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "rounded-full flex items-center justify-center",
            size === "sm" ? "h-5 w-5" : "h-6 w-6",
            status === "completed"
              ? "bg-success text-success-foreground"
              : status === "draft"
              ? "bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          <Check className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
        </div>
        <span className={cn("capitalize", size === "sm" ? "text-xs" : "text-sm")}>
          {status.replace("_", " ")}
        </span>
      </div>
    );
  }

  // Show rejected/cancelled state
  if (isTerminal) {
    return (
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "rounded-full flex items-center justify-center",
            size === "sm" ? "h-5 w-5" : "h-6 w-6",
            isRejected ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {isRejected ? (
            <X className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
          ) : (
            <Ban className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
          )}
        </div>
        <span className={cn("capitalize", size === "sm" ? "text-xs" : "text-sm", isRejected && "text-destructive")}>
          {status.replace("_", " ")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {statusSteps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={cn(
                "rounded-full flex items-center justify-center transition-colors",
                size === "sm" ? "h-4 w-4" : "h-5 w-5",
                isCompleted && "bg-success text-success-foreground",
                isActive && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                !isCompleted && !isActive && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
              ) : (
                <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
              )}
            </div>
            {index < statusSteps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 transition-colors",
                  size === "sm" ? "w-2" : "w-3",
                  isCompleted ? "bg-success" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
