import * as React from "react";
import { TrendingUp, TrendingDown, Check, Clock } from "lucide-react";
import { SemanticBadge, type SemanticIntent, type SemanticBadgeProps } from "./semantic-badge";

interface ProficiencyGapStatusBadgeProps extends Omit<SemanticBadgeProps, "intent" | "children" | "icon"> {
  /** Current assessed proficiency level (can be null if not assessed) */
  currentLevel: number | null;
  /** Required proficiency level for the role/job */
  requiredLevel: number;
  /** Whether to show the gap label. Defaults to true */
  showLabel?: boolean;
  /** Whether to show the numeric gap value (e.g., "+1", "-2"). Defaults to false */
  showGapValue?: boolean;
}

/**
 * ProficiencyGapStatusBadge - Displays proficiency gap status with semantic colors
 * 
 * Semantic color mapping per UI Color Semantics Standard:
 * - Gap >= 0: Success (green) - meets or exceeds requirement
 * - Gap == -1: Warning (amber) - close to target, needs development
 * - Gap <= -2: Error (red) - significant development needed
 * - Current is null: Neutral (grey) - pending assessment
 * 
 * CRITICAL: This component enforces correct color usage by design.
 * Never use green for requirements/targets, only for achievements.
 * 
 * @example
 * <ProficiencyGapStatusBadge currentLevel={4} requiredLevel={3} />
 * // Renders: "Exceeds" in green with TrendingUp icon
 * 
 * @example
 * <ProficiencyGapStatusBadge currentLevel={2} requiredLevel={4} />
 * // Renders: "Development needed" in red with TrendingDown icon
 * 
 * @example
 * <ProficiencyGapStatusBadge currentLevel={null} requiredLevel={3} />
 * // Renders: "Pending" in grey with Clock icon
 */
export function ProficiencyGapStatusBadge({
  currentLevel,
  requiredLevel,
  showLabel = true,
  showGapValue = false,
  size,
  ...props
}: ProficiencyGapStatusBadgeProps) {
  // Handle pending state
  if (currentLevel === null) {
    return (
      <SemanticBadge 
        intent="neutral" 
        icon={Clock}
        size={size}
        {...props}
      >
        {showLabel && "Pending"}
      </SemanticBadge>
    );
  }

  const gap = currentLevel - requiredLevel;

  // Determine semantic intent and display values
  const getGapConfig = (): {
    intent: SemanticIntent;
    icon: typeof TrendingUp;
    label: string;
  } => {
    if (gap > 0) {
      return {
        intent: "success",
        icon: TrendingUp,
        label: "Exceeds",
      };
    }
    if (gap === 0) {
      return {
        intent: "success",
        icon: Check,
        label: "Meets",
      };
    }
    if (gap === -1) {
      return {
        intent: "warning",
        icon: TrendingDown,
        label: "Close to target",
      };
    }
    return {
      intent: "error",
      icon: TrendingDown,
      label: "Development needed",
    };
  };

  const config = getGapConfig();
  
  // Build display text
  const displayText = () => {
    const parts: string[] = [];
    if (showLabel) parts.push(config.label);
    if (showGapValue && gap !== 0) {
      parts.push(gap > 0 ? `+${gap}` : `${gap}`);
    }
    return parts.join(" ");
  };

  return (
    <SemanticBadge 
      intent={config.intent} 
      icon={config.icon}
      size={size}
      {...props}
    >
      {displayText()}
    </SemanticBadge>
  );
}
