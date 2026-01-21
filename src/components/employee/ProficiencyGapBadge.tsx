import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

interface ProficiencyGapBadgeProps {
  required: number | null;
  assessed: number | null;
  size?: "sm" | "md";
  showLabel?: boolean;
}

/**
 * ProficiencyGapBadge - Displays proficiency gap status using semantic color tokens
 * 
 * Color Semantics (HRMS Standard):
 * - success (teal): Meets or exceeds requirement
 * - error (red): Below requirement - gap exists  
 * - neutral (grey): Pending assessment or no comparison possible
 */
export function ProficiencyGapBadge({
  required,
  assessed,
  size = "sm",
  showLabel = true,
}: ProficiencyGapBadgeProps) {
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  // If assessed is null, show "Pending Assessment" - neutral semantic
  if (assessed === null || assessed === undefined) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1 bg-[hsl(var(--semantic-neutral-bg))] text-[hsl(var(--semantic-neutral-text))] border-[hsl(var(--semantic-neutral-border))]",
          sizeClasses
        )}
      >
        <Clock className={cn("text-[hsl(var(--semantic-neutral-text))]", iconSize)} />
        {showLabel && "Pending"}
      </Badge>
    );
  }

  // If required is null, just show assessed level - neutral semantic
  if (required === null || required === undefined) {
    return (
      <Badge
        variant="secondary"
        className={cn(sizeClasses)}
      >
        Level {assessed}
      </Badge>
    );
  }

  const gap = assessed - required;

  if (gap >= 0) {
    // Meets or exceeds requirement - success semantic
    return (
      <Badge
        className={cn(
          "gap-1 bg-[hsl(var(--semantic-success-bg))] text-[hsl(var(--semantic-success-text))] border-[hsl(var(--semantic-success-border))] hover:bg-[hsl(var(--semantic-success-bg))]",
          sizeClasses
        )}
        variant="outline"
      >
        <TrendingUp className={cn("text-[hsl(var(--semantic-success-text))]", iconSize)} />
        {showLabel && (gap === 0 ? "Meets" : `+${gap} Exceeds`)}
      </Badge>
    );
  } else {
    // Below requirement - gap exists - error semantic
    return (
      <Badge
        className={cn(
          "gap-1 bg-[hsl(var(--semantic-error-bg))] text-[hsl(var(--semantic-error-text))] border-[hsl(var(--semantic-error-border))] hover:bg-[hsl(var(--semantic-error-bg))]",
          sizeClasses
        )}
        variant="outline"
      >
        <TrendingDown className={cn("text-[hsl(var(--semantic-error-text))]", iconSize)} />
        {showLabel && `${gap} Gap`}
      </Badge>
    );
  }
}

interface AssessmentSourceBadgeProps {
  source: string;
  size?: "sm" | "md";
}

/**
 * AssessmentSourceBadge - Displays assessment source using semantic color tokens
 * 
 * Color Semantics (HRMS Standard):
 * - neutral: Pending assessment
 * - info: Appraisal (formal process)
 * - secondary: Self-assessment
 * - warning: Manager rated (requires validation)
 * - success: Training verified (certified)
 */
export function AssessmentSourceBadge({ source, size = "sm" }: AssessmentSourceBadgeProps) {
  const config: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Pending Assessment",
      className: "bg-[hsl(var(--semantic-neutral-bg))] text-[hsl(var(--semantic-neutral-text))] border-[hsl(var(--semantic-neutral-border))]",
    },
    appraisal: {
      label: "From Appraisal",
      className: "bg-[hsl(var(--semantic-info-bg))] text-[hsl(var(--semantic-info-text))] border-[hsl(var(--semantic-info-border))]",
    },
    self: {
      label: "Self-Assessment",
      className: "bg-secondary text-secondary-foreground border-border",
    },
    manager: {
      label: "Manager Rated",
      className: "bg-[hsl(var(--semantic-warning-bg))] text-[hsl(var(--semantic-warning-text))] border-[hsl(var(--semantic-warning-border))]",
    },
    training: {
      label: "Training Verified",
      className: "bg-[hsl(var(--semantic-success-bg))] text-[hsl(var(--semantic-success-text))] border-[hsl(var(--semantic-success-border))]",
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
