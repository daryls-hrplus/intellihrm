import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock,
  type LucideIcon 
} from "lucide-react";

/**
 * SEMANTIC UI COLOR STANDARD (HRMS-Aligned)
 * 
 * Color communicates meaning, not styling.
 * 
 * | Intent   | Color | Usage                                           |
 * |----------|-------|------------------------------------------------|
 * | info     | Blue  | Tooltips, guidance, required/reference values   |
 * | success  | Green | Achieved, validated, met expectations           |
 * | warning  | Amber | Needs attention, requires action                |
 * | error    | Red   | Validation failures, critical gaps              |
 * | neutral  | Grey  | Pending, disabled, placeholder, not assessed    |
 * 
 * CRITICAL RULE: Required/target/reference values use 'info' or 'neutral', NEVER 'success'.
 * Green implies achievement. Requirements are not achievements.
 */

export type SemanticIntent = "info" | "success" | "warning" | "error" | "neutral";

const semanticBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors",
  {
    variants: {
      intent: {
        info: "bg-[hsl(var(--semantic-info-bg))] text-[hsl(var(--semantic-info-text))] border-[hsl(var(--semantic-info-border))]",
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

const intentIcons: Record<SemanticIntent, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  neutral: Clock,
};

export interface SemanticBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof semanticBadgeVariants> {
  intent?: SemanticIntent;
  icon?: LucideIcon | null; // Pass null to hide icon
  showIcon?: boolean;
}

/**
 * SemanticBadge - Enterprise-grade badge with semantic color meaning
 * 
 * @example
 * // Required level (reference value) - use 'info' or 'neutral', never 'success'
 * <SemanticBadge intent="info">Level 3 Required</SemanticBadge>
 * 
 * // Achieved/met expectation - use 'success'
 * <SemanticBadge intent="success">Meets Expectations</SemanticBadge>
 * 
 * // Pending assessment - use 'neutral'
 * <SemanticBadge intent="neutral">Pending</SemanticBadge>
 */
export function SemanticBadge({
  className,
  intent = "neutral",
  size,
  icon,
  showIcon = true,
  children,
  ...props
}: SemanticBadgeProps) {
  const IconComponent = icon === null ? null : (icon || intentIcons[intent]);
  
  const iconSizeClass = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }[size || "default"];

  return (
    <span className={cn(semanticBadgeVariants({ intent, size }), className)} {...props}>
      {showIcon && IconComponent && <IconComponent className={iconSizeClass} />}
      {children}
    </span>
  );
}

// Convenience components for common use cases
export function InfoBadge({ children, ...props }: Omit<SemanticBadgeProps, "intent">) {
  return <SemanticBadge intent="info" {...props}>{children}</SemanticBadge>;
}

export function SuccessBadge({ children, ...props }: Omit<SemanticBadgeProps, "intent">) {
  return <SemanticBadge intent="success" {...props}>{children}</SemanticBadge>;
}

export function WarningBadge({ children, ...props }: Omit<SemanticBadgeProps, "intent">) {
  return <SemanticBadge intent="warning" {...props}>{children}</SemanticBadge>;
}

export function ErrorBadge({ children, ...props }: Omit<SemanticBadgeProps, "intent">) {
  return <SemanticBadge intent="error" {...props}>{children}</SemanticBadge>;
}

export function NeutralBadge({ children, ...props }: Omit<SemanticBadgeProps, "intent">) {
  return <SemanticBadge intent="neutral" {...props}>{children}</SemanticBadge>;
}

/**
 * PendingBadge - For not-assessed / pending states
 * Uses neutral grey per HRMS standard (amber is for "needs attention")
 */
export function PendingBadge({ children = "Pending", ...props }: Omit<SemanticBadgeProps, "intent">) {
  return <SemanticBadge intent="neutral" icon={Clock} {...props}>{children}</SemanticBadge>;
}
