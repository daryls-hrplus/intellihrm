import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";

interface ProficiencyGapBadgeProps {
  required: number | null;
  assessed: number | null;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function ProficiencyGapBadge({
  required,
  assessed,
  size = "sm",
  showLabel = true,
}: ProficiencyGapBadgeProps) {
  // If assessed is null, show "Pending Assessment"
  if (assessed === null || assessed === undefined) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1 bg-slate-50 text-slate-600 border-slate-200",
          size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
        )}
      >
        <Clock className={cn("text-slate-400", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        {showLabel && "Pending"}
      </Badge>
    );
  }

  // If required is null, just show assessed level
  if (required === null || required === undefined) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
        )}
      >
        Level {assessed}
      </Badge>
    );
  }

  const gap = assessed - required;

  if (gap >= 0) {
    // Meets or exceeds requirement
    return (
      <Badge
        className={cn(
          "gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
          size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
        )}
        variant="outline"
      >
        <TrendingUp className={cn("text-emerald-500", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        {showLabel && (gap === 0 ? "Meets" : `+${gap} Exceeds`)}
      </Badge>
    );
  } else {
    // Below requirement - gap exists
    return (
      <Badge
        className={cn(
          "gap-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
          size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
        )}
        variant="outline"
      >
        <TrendingDown className={cn("text-red-500", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        {showLabel && `${gap} Gap`}
      </Badge>
    );
  }
}

interface AssessmentSourceBadgeProps {
  source: string;
  size?: "sm" | "md";
}

export function AssessmentSourceBadge({ source, size = "sm" }: AssessmentSourceBadgeProps) {
  const config: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Pending Assessment",
      className: "bg-slate-50 text-slate-600 border-slate-200",
    },
    appraisal: {
      label: "From Appraisal",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    self: {
      label: "Self-Assessment",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },
    manager: {
      label: "Manager Rated",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    training: {
      label: "Training Verified",
      className: "bg-green-50 text-green-700 border-green-200",
    },
  };

  const sourceConfig = config[source] || config.pending;

  return (
    <Badge
      variant="outline"
      className={cn(
        sourceConfig.className,
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      )}
    >
      {sourceConfig.label}
    </Badge>
  );
}
