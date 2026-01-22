import * as React from "react";
import { Target } from "lucide-react";
import { SemanticBadge, type SemanticBadgeProps } from "./semantic-badge";

/**
 * PROFICIENCY LABELS (Dreyfus Model)
 * Standard proficiency level naming used across HRplus
 */
const PROFICIENCY_LABELS: Record<number, string> = {
  1: "Novice",
  2: "Developing",
  3: "Proficient",
  4: "Advanced",
  5: "Expert",
};

interface RequiredLevelBadgeProps extends Omit<SemanticBadgeProps, "intent" | "children"> {
  /** The required proficiency level (1-5) */
  level: number;
  /** Optional custom label prefix. Defaults to "L{level}" */
  label?: string;
  /** Whether to show the proficiency label (e.g., "Advanced"). Defaults to true */
  showProficiencyLabel?: boolean;
  /** Whether to show the Target icon. Defaults to true */
  showIcon?: boolean;
}

/**
 * RequiredLevelBadge - Displays job/role required proficiency levels
 * 
 * CRITICAL: Always uses "info" (blue) intent per UI Color Semantics Standard.
 * Required/target values are reference information, NOT achievements.
 * Green is reserved for actual achievements only.
 * 
 * @example
 * <RequiredLevelBadge level={4} />
 * // Renders: "L4 (Advanced)" in blue
 * 
 * @example
 * <RequiredLevelBadge level={3} label="Required" />
 * // Renders: "Required (Proficient)" in blue
 */
export function RequiredLevelBadge({
  level,
  label,
  showProficiencyLabel = true,
  showIcon = true,
  size,
  ...props
}: RequiredLevelBadgeProps) {
  const proficiencyLabel = PROFICIENCY_LABELS[level] || `Level ${level}`;
  const displayLabel = label || `L${level}`;
  
  return (
    <SemanticBadge 
      intent="info" 
      icon={showIcon ? Target : null}
      size={size}
      {...props}
    >
      {displayLabel}
      {showProficiencyLabel && ` (${proficiencyLabel})`}
    </SemanticBadge>
  );
}
