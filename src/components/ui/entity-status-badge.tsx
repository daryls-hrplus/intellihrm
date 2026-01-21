import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Archive,
  Ban,
  FileEdit,
  Pause,
  type LucideIcon
} from "lucide-react";

/**
 * ENTITY STATE COLOR STANDARD (HRMS-Aligned)
 * 
 * Entity State → Semantic Intent → Color
 * 
 * | Entity State      | Semantic Intent | Color  | Notes                      |
 * |-------------------|-----------------|--------|----------------------------|
 * | Active            | Success         | Green  | Enabled, usable, valid     |
 * | Inactive          | Neutral         | Grey   | Disabled but not an error  |
 * | Draft             | Neutral         | Grey   | Not yet live               |
 * | Pending           | Neutral         | Grey   | Awaiting action            |
 * | Needs Review      | Warning         | Amber  | Attention required         |
 * | Suspended         | Warning         | Amber  | Temporarily restricted     |
 * | Rejected          | Error           | Red    | Explicit failure           |
 * | Blocked           | Error           | Red    | Hard stop                  |
 * | Archived          | Neutral         | Grey   | Historical, read-only      |
 * 
 * CRITICAL: Blue is NEVER used for entity state.
 * Blue is reserved for informational/guidance content only.
 */

export type EntityStatus = 
  | "active"
  | "inactive" 
  | "draft"
  | "pending"
  | "needs_review"
  | "suspended"
  | "rejected"
  | "blocked"
  | "archived";

type StatusIntent = "success" | "warning" | "error" | "neutral";

interface StatusConfig {
  intent: StatusIntent;
  label: string;
  icon: LucideIcon;
}

const STATUS_CONFIG: Record<EntityStatus, StatusConfig> = {
  active: { intent: "success", label: "Active", icon: CheckCircle2 },
  inactive: { intent: "neutral", label: "Inactive", icon: XCircle },
  draft: { intent: "neutral", label: "Draft", icon: FileEdit },
  pending: { intent: "neutral", label: "Pending", icon: Clock },
  needs_review: { intent: "warning", label: "Needs Review", icon: AlertTriangle },
  suspended: { intent: "warning", label: "Suspended", icon: Pause },
  rejected: { intent: "error", label: "Rejected", icon: XCircle },
  blocked: { intent: "error", label: "Blocked", icon: Ban },
  archived: { intent: "neutral", label: "Archived", icon: Archive },
};

const entityStatusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border font-medium",
  {
    variants: {
      intent: {
        success: "bg-[hsl(var(--semantic-success-bg))] text-[hsl(var(--semantic-success-text))] border-[hsl(var(--semantic-success-border))]",
        warning: "bg-[hsl(var(--semantic-warning-bg))] text-[hsl(var(--semantic-warning-text))] border-[hsl(var(--semantic-warning-border))]",
        error: "bg-[hsl(var(--semantic-error-bg))] text-[hsl(var(--semantic-error-text))] border-[hsl(var(--semantic-error-border))]",
        neutral: "bg-[hsl(var(--semantic-neutral-bg))] text-[hsl(var(--semantic-neutral-text))] border-[hsl(var(--semantic-neutral-border))]",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        default: "px-2 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
      },
    },
    defaultVariants: {
      intent: "neutral",
      size: "default",
    },
  }
);

export interface EntityStatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof entityStatusBadgeVariants> {
  status: EntityStatus;
  showIcon?: boolean;
  customLabel?: string;
}

export function EntityStatusBadge({
  className,
  status,
  size,
  showIcon = true,
  customLabel,
  ...props
}: EntityStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  
  const iconSizeClass = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }[size || "default"];

  return (
    <span 
      className={cn(entityStatusBadgeVariants({ intent: config.intent, size }), className)} 
      {...props}
    >
      {showIcon && <Icon className={iconSizeClass} />}
      {customLabel || config.label}
    </span>
  );
}

/** Convenience function to derive status from boolean */
export function getEntityStatus(isActive: boolean): EntityStatus {
  return isActive ? "active" : "inactive";
}

/** Helper component for common is_active pattern */
export function ActiveInactiveBadge({ 
  isActive,
  showIcon = true,
  size,
  className,
  ...props 
}: Omit<EntityStatusBadgeProps, "status"> & { isActive: boolean }) {
  return (
    <EntityStatusBadge 
      status={isActive ? "active" : "inactive"} 
      showIcon={showIcon}
      size={size}
      className={className}
      {...props} 
    />
  );
}
