import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SEMANTIC UI COLOR STANDARD (HRMS-Aligned)
 * 
 * Tooltips and "i" icons MUST ALWAYS be Blue (Info). No exceptions.
 * This is a non-negotiable enterprise HRMS standard.
 */

export interface SemanticTooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  iconClassName?: string;
  asChild?: boolean;
  /** Size of the info icon */
  size?: "xs" | "sm" | "default" | "lg";
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  default: "h-4 w-4",
  lg: "h-5 w-5",
};

/**
 * SemanticTooltip - Enterprise-grade tooltip with enforced blue info styling
 * 
 * ALWAYS uses blue info styling for the trigger icon per HRMS standard.
 * 
 * @example
 * // Info icon tooltip (most common use)
 * <SemanticTooltip content="This is helpful information">
 *   <span>Hover me</span>
 * </SemanticTooltip>
 * 
 * // Standalone info icon
 * <SemanticTooltip content="What this field means" />
 */
export function SemanticTooltip({
  content,
  children,
  side = "top",
  className,
  iconClassName,
  asChild = false,
  size = "default",
}: SemanticTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild={asChild || !!children}>
          {children ? (
            children
          ) : (
            <Info 
              className={cn(
                sizeClasses[size],
                "text-info cursor-help hover:text-info/80 transition-colors",
                iconClassName
              )} 
            />
          )}
        </TooltipTrigger>
        <TooltipContent side={side} className={cn("max-w-xs", className)}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * InfoIcon - Standalone info icon with tooltip
 * 
 * ALWAYS blue per HRMS standard.
 * 
 * @example
 * <InfoIcon tooltip="Explanation of this field" />
 * 
 * // With custom size
 * <InfoIcon tooltip="Small info" size="xs" />
 */
export function InfoIcon({
  tooltip,
  side = "top",
  size = "default",
  className,
}: {
  tooltip: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  size?: "xs" | "sm" | "default" | "lg";
  className?: string;
}) {
  return (
    <SemanticTooltip content={tooltip} side={side} size={size} iconClassName={className} />
  );
}

/**
 * TooltipInfoPair - Common pattern: Label with info icon
 * 
 * @example
 * <TooltipInfoPair 
 *   label="Required Level" 
 *   tooltip="The proficiency level expected for this role"
 * />
 */
export function TooltipInfoPair({
  label,
  tooltip,
  labelClassName,
  iconSize = "sm",
}: {
  label: string;
  tooltip: React.ReactNode;
  labelClassName?: string;
  iconSize?: "xs" | "sm" | "default" | "lg";
}) {
  return (
    <div className="flex items-center gap-1">
      <span className={labelClassName}>{label}</span>
      <InfoIcon tooltip={tooltip} size={iconSize} />
    </div>
  );
}
