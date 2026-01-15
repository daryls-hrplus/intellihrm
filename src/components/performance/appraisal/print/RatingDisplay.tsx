import { cn } from "@/lib/utils";
import { getRatingDefinition } from "./RatingScaleLegend";

interface RatingDisplayProps {
  rating?: number;
  maxRating?: number;
  minRating?: number;
  label?: string;
  sublabel?: string;
  showLevelName?: boolean;
  showDots?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact" | "inline";
  className?: string;
}

export function RatingDisplay({
  rating,
  maxRating = 5,
  minRating = 1,
  label,
  sublabel,
  showLevelName = true,
  showDots = true,
  size = "md",
  variant = "default",
  className,
}: RatingDisplayProps) {
  const ratingDef = rating !== undefined ? getRatingDefinition(rating) : undefined;
  const totalDots = maxRating - minRating + 1;

  const sizeClasses = {
    sm: {
      dot: "h-2 w-2",
      text: "text-xs",
      icon: "text-sm",
      gap: "gap-0.5",
    },
    md: {
      dot: "h-3 w-3",
      text: "text-sm",
      icon: "text-base",
      gap: "gap-1",
    },
    lg: {
      dot: "h-4 w-4",
      text: "text-base",
      icon: "text-lg",
      gap: "gap-1.5",
    },
  };

  const classes = sizeClasses[size];

  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        {rating !== undefined ? (
          <>
            {showDots && (
              <span className={cn("inline-flex items-center", classes.gap)}>
                {Array.from({ length: totalDots }, (_, i) => {
                  const dotLevel = minRating + i;
                  const isFilled = rating >= dotLevel;
                  return (
                    <span
                      key={dotLevel}
                      className={cn(
                        "rounded-full transition-colors",
                        classes.dot,
                        isFilled 
                          ? "bg-primary" 
                          : "bg-muted-foreground/20"
                      )}
                    />
                  );
                })}
              </span>
            )}
            <span className={cn("font-semibold", classes.text)}>
              {rating}
            </span>
            {showLevelName && ratingDef && (
              <span className={cn("text-muted-foreground", classes.text)}>
                ({ratingDef.label})
              </span>
            )}
          </>
        ) : (
          <span className={cn("text-muted-foreground", classes.text)}>—</span>
        )}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {rating !== undefined ? (
          <>
            {ratingDef && (
              <span className={classes.icon}>{ratingDef.icon}</span>
            )}
            <span className={cn("font-semibold", classes.text)}>
              Level {rating}
            </span>
            {showLevelName && ratingDef && (
              <span className={cn("text-muted-foreground", classes.text)}>
                {ratingDef.label}
              </span>
            )}
          </>
        ) : (
          <span className={cn("text-muted-foreground", classes.text)}>Not rated</span>
        )}
      </div>
    );
  }

  // Default variant - full display
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className={cn("font-medium", classes.text)}>
          {label}
        </div>
      )}
      
      {rating !== undefined ? (
        <div className="space-y-1">
          {/* Dots display */}
          {showDots && (
            <div className={cn("flex items-center", classes.gap)}>
              {Array.from({ length: totalDots }, (_, i) => {
                const dotLevel = minRating + i;
                const isFilled = rating >= dotLevel;
                const isExact = rating === dotLevel;
                return (
                  <div
                    key={dotLevel}
                    className={cn(
                      "rounded-full transition-all",
                      classes.dot,
                      isFilled 
                        ? isExact
                          ? "bg-primary ring-2 ring-primary/30"
                          : "bg-primary"
                        : "bg-muted-foreground/20"
                    )}
                    title={`Level ${dotLevel}`}
                  />
                );
              })}
            </div>
          )}

          {/* Level info */}
          <div className="flex items-center gap-2">
            {ratingDef && (
              <span className={classes.icon}>{ratingDef.icon}</span>
            )}
            <span className={cn("font-semibold", classes.text)}>
              Level {rating}
            </span>
            {showLevelName && ratingDef && (
              <span className={cn("text-muted-foreground", classes.text)}>
                ({ratingDef.label})
              </span>
            )}
          </div>

          {sublabel && (
            <p className={cn("text-muted-foreground leading-tight", classes.text)}>
              {sublabel}
            </p>
          )}
        </div>
      ) : (
        <div className={cn("text-muted-foreground italic", classes.text)}>
          Not rated yet
        </div>
      )}
    </div>
  );
}

// Gap indicator component
interface GapIndicatorProps {
  gap?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function GapIndicator({ gap, size = "md", showLabel = true, className }: GapIndicatorProps) {
  if (gap === undefined || gap === null) return null;

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const getGapColor = () => {
    if (gap > 0) return "text-green-600 dark:text-green-400";
    if (gap < 0) return "text-red-600 dark:text-red-400";
    return "text-blue-600 dark:text-blue-400";
  };

  const getGapIcon = () => {
    if (gap > 0) return "↑";
    if (gap < 0) return "↓";
    return "=";
  };

  return (
    <span className={cn("inline-flex items-center gap-1 font-mono", getGapColor(), sizeClasses[size], className)}>
      <span>{getGapIcon()}</span>
      <span>{gap > 0 ? `+${gap}` : gap}</span>
      {showLabel && <span className="font-sans text-muted-foreground">vs req</span>}
    </span>
  );
}
