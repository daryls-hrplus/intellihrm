import * as React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import type { SemanticIntent } from "./semantic-badge";

/**
 * SEMANTIC UI COLOR STANDARD (HRMS-Aligned)
 * 
 * Semantic links use colors to communicate intent:
 * - info: Blue (default) - standard navigation, information links
 * - success: Green - positive action links, success state navigation
 * - warning: Amber - cautionary links
 * - error: Red - destructive action links
 * - neutral: Grey - secondary/muted links
 */

const intentLinkClasses: Record<SemanticIntent, string> = {
  info: "text-info hover:text-info/80 underline-offset-4 hover:underline",
  success: "text-success hover:text-success/80 underline-offset-4 hover:underline",
  warning: "text-warning hover:text-warning/80 underline-offset-4 hover:underline",
  error: "text-destructive hover:text-destructive/80 underline-offset-4 hover:underline",
  neutral: "text-muted-foreground hover:text-foreground underline-offset-4 hover:underline",
};

export interface SemanticLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  intent?: SemanticIntent;
  to?: string; // For React Router
  external?: boolean;
}

/**
 * SemanticLink - Link with semantic color meaning
 * 
 * @example
 * // Internal navigation (uses React Router)
 * <SemanticLink to="/settings" intent="info">Go to Settings</SemanticLink>
 * 
 * // External link
 * <SemanticLink href="https://example.com" external>External Site</SemanticLink>
 * 
 * // Cautionary link
 * <SemanticLink to="/dangerous-action" intent="warning">Proceed with Caution</SemanticLink>
 */
export function SemanticLink({
  intent = "info",
  to,
  href,
  external,
  className,
  children,
  ...props
}: SemanticLinkProps) {
  const linkClasses = cn(
    "transition-colors cursor-pointer",
    intentLinkClasses[intent],
    className
  );

  // Use React Router Link for internal navigation
  if (to) {
    return (
      <Link to={to} className={linkClasses} {...(props as React.ComponentProps<typeof Link>)}>
        {children}
      </Link>
    );
  }

  // Use anchor for external links
  return (
    <a
      href={href}
      className={linkClasses}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
}

// Convenience components
export function InfoLink({ children, ...props }: Omit<SemanticLinkProps, "intent">) {
  return <SemanticLink intent="info" {...props}>{children}</SemanticLink>;
}

export function SuccessLink({ children, ...props }: Omit<SemanticLinkProps, "intent">) {
  return <SemanticLink intent="success" {...props}>{children}</SemanticLink>;
}

export function WarningLink({ children, ...props }: Omit<SemanticLinkProps, "intent">) {
  return <SemanticLink intent="warning" {...props}>{children}</SemanticLink>;
}

export function ErrorLink({ children, ...props }: Omit<SemanticLinkProps, "intent">) {
  return <SemanticLink intent="error" {...props}>{children}</SemanticLink>;
}

export function MutedLink({ children, ...props }: Omit<SemanticLinkProps, "intent">) {
  return <SemanticLink intent="neutral" {...props}>{children}</SemanticLink>;
}
