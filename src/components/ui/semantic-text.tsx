import * as React from "react";
import { cn } from "@/lib/utils";
import type { SemanticIntent } from "./semantic-badge";

/**
 * SEMANTIC UI COLOR STANDARD (HRMS-Aligned)
 * 
 * Semantic text uses colors to communicate meaning:
 * - info: Blue - guidance, reference values, help text
 * - success: Green - positive outcomes, achievements
 * - warning: Amber - needs attention
 * - error: Red - errors, failures
 * - neutral: Grey - secondary, muted content
 */

const intentTextClasses: Record<SemanticIntent, string> = {
  info: "text-[hsl(var(--semantic-info-text))]",
  success: "text-[hsl(var(--semantic-success-text))]",
  warning: "text-[hsl(var(--semantic-warning-text))]",
  error: "text-[hsl(var(--semantic-error-text))]",
  neutral: "text-[hsl(var(--semantic-neutral-text))]",
};

export interface SemanticTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  intent?: SemanticIntent;
  as?: "span" | "p" | "div" | "strong" | "em";
}

/**
 * SemanticText - Text with semantic color meaning
 * 
 * @example
 * <SemanticText intent="info">This is reference information</SemanticText>
 * <SemanticText intent="success">Goal achieved!</SemanticText>
 * <SemanticText intent="warning">Action required</SemanticText>
 * <SemanticText intent="error">Validation failed</SemanticText>
 */
export function SemanticText({
  intent = "neutral",
  as: Component = "span",
  className,
  children,
  ...props
}: SemanticTextProps) {
  return (
    <Component 
      className={cn(intentTextClasses[intent], className)} 
      {...props}
    >
      {children}
    </Component>
  );
}

// Convenience components
export function InfoText({ children, ...props }: Omit<SemanticTextProps, "intent">) {
  return <SemanticText intent="info" {...props}>{children}</SemanticText>;
}

export function SuccessText({ children, ...props }: Omit<SemanticTextProps, "intent">) {
  return <SemanticText intent="success" {...props}>{children}</SemanticText>;
}

export function WarningText({ children, ...props }: Omit<SemanticTextProps, "intent">) {
  return <SemanticText intent="warning" {...props}>{children}</SemanticText>;
}

export function ErrorText({ children, ...props }: Omit<SemanticTextProps, "intent">) {
  return <SemanticText intent="error" {...props}>{children}</SemanticText>;
}

export function MutedText({ children, className, ...props }: Omit<SemanticTextProps, "intent">) {
  return <SemanticText intent="neutral" className={cn("text-muted-foreground", className)} {...props}>{children}</SemanticText>;
}
