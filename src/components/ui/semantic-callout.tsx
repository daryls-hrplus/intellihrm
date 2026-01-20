import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock,
  type LucideIcon 
} from "lucide-react";
import type { SemanticIntent } from "./semantic-badge";

/**
 * SEMANTIC UI COLOR STANDARD (HRMS-Aligned)
 * 
 * Callouts use semantic colors to communicate intent:
 * - info: Blue - general information, guidance, tips
 * - success: Green - confirmations, completed actions
 * - warning: Amber - cautions, needs attention
 * - error: Red - critical warnings, failures
 * - neutral: Grey - notes, additional context
 */

const intentConfig: Record<SemanticIntent, { icon: LucideIcon; borderClass: string }> = {
  info: { 
    icon: Info, 
    borderClass: "border-l-[hsl(var(--info))]" 
  },
  success: { 
    icon: CheckCircle2, 
    borderClass: "border-l-[hsl(var(--success))]" 
  },
  warning: { 
    icon: AlertTriangle, 
    borderClass: "border-l-[hsl(var(--warning))]" 
  },
  error: { 
    icon: XCircle, 
    borderClass: "border-l-[hsl(var(--destructive))]" 
  },
  neutral: { 
    icon: Clock, 
    borderClass: "border-l-muted-foreground" 
  },
};

export interface SemanticCalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  intent?: SemanticIntent;
  title?: string;
  icon?: LucideIcon | null;
}

/**
 * SemanticCallout - Enterprise-grade callout with semantic color meaning
 * 
 * @example
 * <SemanticCallout intent="info" title="Important Note">
 *   This is general information for users.
 * </SemanticCallout>
 * 
 * <SemanticCallout intent="warning" title="Attention Required">
 *   This action requires your attention.
 * </SemanticCallout>
 */
export function SemanticCallout({
  intent = "info",
  title,
  icon,
  className,
  children,
  ...props
}: SemanticCalloutProps) {
  const config = intentConfig[intent];
  const IconComponent = icon === null ? null : (icon || config.icon);

  return (
    <div
      className={cn(
        "p-4 border-l-4 rounded-r-lg my-4 bg-muted/50",
        config.borderClass,
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {IconComponent && (
          <IconComponent className={cn(
            "h-5 w-5 flex-shrink-0 mt-0.5",
            intent === "info" && "text-info",
            intent === "success" && "text-success",
            intent === "warning" && "text-warning",
            intent === "error" && "text-destructive",
            intent === "neutral" && "text-muted-foreground"
          )} />
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          )}
          <div className="text-sm text-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Convenience components
export function InfoCallout({ title, children, ...props }: Omit<SemanticCalloutProps, "intent">) {
  return <SemanticCallout intent="info" title={title} {...props}>{children}</SemanticCallout>;
}

export function SuccessCallout({ title, children, ...props }: Omit<SemanticCalloutProps, "intent">) {
  return <SemanticCallout intent="success" title={title} {...props}>{children}</SemanticCallout>;
}

export function WarningCallout({ title, children, ...props }: Omit<SemanticCalloutProps, "intent">) {
  return <SemanticCallout intent="warning" title={title} {...props}>{children}</SemanticCallout>;
}

export function ErrorCallout({ title, children, ...props }: Omit<SemanticCalloutProps, "intent">) {
  return <SemanticCallout intent="error" title={title} {...props}>{children}</SemanticCallout>;
}

export function NeutralCallout({ title, children, ...props }: Omit<SemanticCalloutProps, "intent">) {
  return <SemanticCallout intent="neutral" title={title} {...props}>{children}</SemanticCallout>;
}
