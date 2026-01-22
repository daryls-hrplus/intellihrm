import * as React from "react";
import { SemanticBadge, type SemanticIntent, type SemanticBadgeProps } from "./semantic-badge";

interface RatingScoreBadgeProps extends Omit<SemanticBadgeProps, "intent" | "children"> {
  /** The rating value (can be null for unrated) */
  rating: number | null;
  /** Maximum rating value. Defaults to 5 */
  maxRating?: number;
  /** Whether to show the numeric score. Defaults to true */
  showScore?: boolean;
  /** Optional label to display after the score */
  label?: string;
  /** Custom label mapping for ratings (e.g., { 5: "Outstanding", 4: "Exceeds" }) */
  ratingLabels?: Record<number, string>;
}

/**
 * RatingScoreBadge - Displays performance/proficiency ratings with semantic colors
 * 
 * Uses semantic color mapping based on rating thresholds:
 * - 80%+ (4-5/5): Success (green) - achievement
 * - 60%+ (3-3.9/5): Info (blue) - meets expectations  
 * - 40%+ (2-2.9/5): Warning (amber) - needs attention
 * - Below 40% (<2/5): Error (red) - below expectations
 * - Null: Neutral (grey) - pending/not rated
 * 
 * @example
 * <RatingScoreBadge rating={4.5} />
 * // Renders: "4.5" in green (success)
 * 
 * @example
 * <RatingScoreBadge rating={3} label="Meets Expectations" />
 * // Renders: "3.0 Meets Expectations" in blue (info)
 * 
 * @example
 * <RatingScoreBadge rating={null} />
 * // Renders: "Not Rated" in grey (neutral)
 */
export function RatingScoreBadge({
  rating,
  maxRating = 5,
  showScore = true,
  label,
  ratingLabels,
  size,
  ...props
}: RatingScoreBadgeProps) {
  // Calculate semantic intent based on normalized rating
  const getIntent = (): SemanticIntent => {
    if (rating === null) return "neutral";
    const normalized = rating / maxRating;
    if (normalized >= 0.8) return "success";   // 4-5 out of 5
    if (normalized >= 0.6) return "info";      // 3-3.9 out of 5
    if (normalized >= 0.4) return "warning";   // 2-2.9 out of 5
    return "error";                            // Below 2
  };

  // Determine display text
  const getDisplayText = () => {
    if (rating === null) {
      return label || "Not Rated";
    }
    
    const roundedRating = Math.round(rating);
    const ratingLabel = ratingLabels?.[roundedRating];
    const scoreText = showScore ? rating.toFixed(1) : "";
    const labelText = label || ratingLabel || "";
    
    if (scoreText && labelText) {
      return `${scoreText} ${labelText}`;
    }
    return scoreText || labelText || rating.toFixed(1);
  };

  return (
    <SemanticBadge 
      intent={getIntent()} 
      showIcon={false}
      size={size}
      {...props}
    >
      {getDisplayText()}
    </SemanticBadge>
  );
}
