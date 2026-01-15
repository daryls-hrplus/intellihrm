import { cn } from "@/lib/utils";
import { AlertCircle, ArrowDown, Check, Star, Trophy, Circle } from "lucide-react";

// Print-safe rating icon definitions - replaces emojis with SVG icons
export const RATING_ICONS = {
  1: {
    icon: AlertCircle,
    badgeClass: "bg-red-100 text-red-700 border-red-300",
    dotClass: "bg-red-500",
    textClass: "text-red-700 dark:text-red-400",
  },
  2: {
    icon: ArrowDown,
    badgeClass: "bg-orange-100 text-orange-700 border-orange-300",
    dotClass: "bg-orange-500",
    textClass: "text-orange-700 dark:text-orange-400",
  },
  3: {
    icon: Check,
    badgeClass: "bg-green-100 text-green-700 border-green-300",
    dotClass: "bg-green-500",
    textClass: "text-green-700 dark:text-green-400",
  },
  4: {
    icon: Star,
    badgeClass: "bg-blue-100 text-blue-700 border-blue-300",
    dotClass: "bg-blue-500",
    textClass: "text-blue-700 dark:text-blue-400",
  },
  5: {
    icon: Trophy,
    badgeClass: "bg-purple-100 text-purple-700 border-purple-300",
    dotClass: "bg-purple-500",
    textClass: "text-purple-700 dark:text-purple-400",
  },
} as const;

// Get rating icon config
export function getRatingIcon(level: number) {
  return RATING_ICONS[level as keyof typeof RATING_ICONS] || RATING_ICONS[3];
}

// Print-safe rating icon component
interface RatingIconProps {
  level: number;
  size?: "xs" | "sm" | "md" | "lg";
  showBadge?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function RatingIcon({ level, size = "sm", showBadge = false, className }: RatingIconProps) {
  const config = getRatingIcon(level);
  const Icon = config.icon;

  if (showBadge) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full border px-1.5 py-0.5",
          config.badgeClass,
          className
        )}
      >
        <Icon className={sizeClasses[size]} />
      </span>
    );
  }

  return <Icon className={cn(sizeClasses[size], config.textClass, className)} />;
}

// Print-safe rating dot (for visual scales)
interface RatingDotProps {
  level: number;
  filled?: boolean;
  active?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const dotSizes = {
  xs: "h-2 w-2",
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function RatingDot({ level, filled = false, active = false, size = "sm", className }: RatingDotProps) {
  const config = getRatingIcon(level);

  return (
    <span
      className={cn(
        "inline-block rounded-full transition-all",
        dotSizes[size],
        filled
          ? active
            ? cn(config.dotClass, "ring-2 ring-offset-1", `ring-${config.dotClass.replace("bg-", "")}`)
            : config.dotClass
          : "bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

// Compact inline rating badge for print headers
interface PrintRatingBadgeProps {
  level: number;
  shortLabel: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function PrintRatingBadge({ level, shortLabel, size = "sm", className }: PrintRatingBadgeProps) {
  const config = getRatingIcon(level);
  const Icon = config.icon;

  const textSizes = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-medium",
        config.badgeClass,
        textSizes[size],
        className
      )}
    >
      <Icon className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      <span>{level}</span>
      <span className="opacity-75">({shortLabel})</span>
    </span>
  );
}
