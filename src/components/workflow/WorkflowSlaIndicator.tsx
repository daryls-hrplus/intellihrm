import { useMemo } from "react";
import { differenceInHours, differenceInDays, formatDistanceToNow, isPast } from "date-fns";
import { Clock, AlertTriangle, AlertCircle, CheckCircle2, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type SlaStatus = "on_track" | "warning" | "critical" | "overdue" | "expired";

interface WorkflowSlaIndicatorProps {
  stepStartedAt: string | null;
  stepDeadlineAt: string | null;
  escalationHours: number | null;
  slaWarningHours: number | null;
  slaCriticalHours: number | null;
  slaStatus?: SlaStatus;
  variant?: "badge" | "inline" | "detailed";
  className?: string;
}

export function WorkflowSlaIndicator({
  stepStartedAt,
  stepDeadlineAt,
  escalationHours,
  slaWarningHours,
  slaCriticalHours,
  slaStatus: providedStatus,
  variant = "badge",
  className,
}: WorkflowSlaIndicatorProps) {
  const slaInfo = useMemo(() => {
    const now = new Date();
    
    if (!stepStartedAt) {
      return {
        status: "on_track" as SlaStatus,
        timeRemaining: null,
        percentComplete: 0,
        label: "Not started",
        description: "Workflow step has not started yet",
      };
    }

    const startedAt = new Date(stepStartedAt);
    const hoursElapsed = differenceInHours(now, startedAt);
    
    // If we have a deadline, use that
    if (stepDeadlineAt) {
      const deadline = new Date(stepDeadlineAt);
      const hoursUntilDeadline = differenceInHours(deadline, now);
      const daysUntilDeadline = differenceInDays(deadline, now);
      const totalHours = differenceInHours(deadline, startedAt);
      const percentComplete = totalHours > 0 ? Math.min(100, (hoursElapsed / totalHours) * 100) : 0;

      if (isPast(deadline)) {
        return {
          status: "overdue" as SlaStatus,
          timeRemaining: formatDistanceToNow(deadline, { addSuffix: true }),
          percentComplete: 100,
          label: "Overdue",
          description: `Deadline was ${formatDistanceToNow(deadline, { addSuffix: true })}`,
        };
      }

      let status: SlaStatus = "on_track";
      if (slaCriticalHours && hoursUntilDeadline <= slaCriticalHours) {
        status = "critical";
      } else if (slaWarningHours && hoursUntilDeadline <= slaWarningHours) {
        status = "warning";
      }

      const timeLabel = daysUntilDeadline >= 1 
        ? `${daysUntilDeadline}d ${hoursUntilDeadline % 24}h left`
        : `${hoursUntilDeadline}h left`;

      return {
        status,
        timeRemaining: timeLabel,
        percentComplete,
        label: timeLabel,
        description: `Deadline: ${formatDistanceToNow(deadline, { addSuffix: true })}`,
      };
    }

    // Fall back to escalation-based timing
    if (escalationHours) {
      const percentComplete = Math.min(100, (hoursElapsed / escalationHours) * 100);
      const hoursRemaining = Math.max(0, escalationHours - hoursElapsed);

      let status: SlaStatus = "on_track";
      if (percentComplete >= 100) {
        status = "overdue";
      } else if (percentComplete >= 90) {
        status = "critical";
      } else if (percentComplete >= 75) {
        status = "warning";
      }

      const timeLabel = hoursRemaining >= 24
        ? `${Math.floor(hoursRemaining / 24)}d ${Math.floor(hoursRemaining % 24)}h left`
        : `${Math.floor(hoursRemaining)}h left`;

      return {
        status,
        timeRemaining: timeLabel,
        percentComplete,
        label: status === "overdue" ? "Overdue" : timeLabel,
        description: status === "overdue" 
          ? `Escalation was triggered ${formatDistanceToNow(new Date(startedAt.getTime() + escalationHours * 60 * 60 * 1000), { addSuffix: true })}`
          : `Escalation in ${timeLabel}`,
      };
    }

    // No timing configured
    return {
      status: "on_track" as SlaStatus,
      timeRemaining: null,
      percentComplete: 0,
      label: formatDistanceToNow(startedAt, { addSuffix: true }),
      description: `Started ${formatDistanceToNow(startedAt, { addSuffix: true })}`,
    };
  }, [stepStartedAt, stepDeadlineAt, escalationHours, slaWarningHours, slaCriticalHours]);

  // Use provided status if available
  const status = providedStatus || slaInfo.status;

  const statusConfig = {
    on_track: {
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      borderColor: "border-green-200 dark:border-green-800",
      progressColor: "bg-green-500",
      badgeVariant: "secondary" as const,
    },
    warning: {
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      borderColor: "border-amber-200 dark:border-amber-800",
      progressColor: "bg-amber-500",
      badgeVariant: "outline" as const,
    },
    critical: {
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      borderColor: "border-orange-200 dark:border-orange-800",
      progressColor: "bg-orange-500",
      badgeVariant: "destructive" as const,
    },
    overdue: {
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      borderColor: "border-red-200 dark:border-red-800",
      progressColor: "bg-red-500",
      badgeVariant: "destructive" as const,
    },
    expired: {
      icon: Timer,
      color: "text-red-700 dark:text-red-300",
      bgColor: "bg-red-200 dark:bg-red-900/50",
      borderColor: "border-red-300 dark:border-red-700",
      progressColor: "bg-red-600",
      badgeVariant: "destructive" as const,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (variant === "badge") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={status === "on_track" ? "secondary" : config.badgeVariant}
              className={cn("gap-1", className)}
            >
              <Icon className="h-3 w-3" />
              {slaInfo.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{slaInfo.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-sm", config.color, className)}>
        <Icon className="h-4 w-4" />
        <span>{slaInfo.label}</span>
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-2 text-sm font-medium", config.color)}>
          <Icon className="h-4 w-4" />
          <span>{status === "on_track" ? "On Track" : status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
        <span className="text-sm text-muted-foreground">{slaInfo.label}</span>
      </div>
      {slaInfo.percentComplete > 0 && (
        <div className="space-y-1">
          <Progress 
            value={slaInfo.percentComplete} 
            className={cn("h-2", config.bgColor)}
          />
          <p className="text-xs text-muted-foreground">{slaInfo.description}</p>
        </div>
      )}
    </div>
  );
}
