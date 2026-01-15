import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RATING_SCALE_DEFINITIONS, RatingScaleLegend } from "./RatingScaleLegend";

interface RatingScaleLegendCompactProps {
  minRating?: number;
  maxRating?: number;
  className?: string;
  sticky?: boolean;
}

export function RatingScaleLegendCompact({
  minRating = 1,
  maxRating = 5,
  className,
  sticky = false,
}: RatingScaleLegendCompactProps) {
  const [showDialog, setShowDialog] = useState(false);

  const filteredLevels = RATING_SCALE_DEFINITIONS.filter(
    (level) => level.level >= minRating && level.level <= maxRating
  );

  const dotColors: Record<number, string> = {
    1: "bg-red-500",
    2: "bg-orange-500",
    3: "bg-green-500",
    4: "bg-blue-500",
    5: "bg-purple-500",
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "rating-legend-compact bg-white border-b px-4 py-2 flex items-center justify-between gap-4 print:border-t print:border-b print:py-1.5",
          sticky && "sticky top-0 z-20 shadow-sm",
          className
        )}
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground mr-1">Rating Scale:</span>
          {filteredLevels.map((level) => (
            <Tooltip key={level.level} delayDuration={200}>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted/50 cursor-help transition-colors">
                  <span className={cn("w-2 h-2 rounded-full", dotColors[level.level])} />
                  <span className="font-medium">{level.level}</span>
                  <span className="text-muted-foreground">({level.shortLabel})</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">{level.label}</p>
                  <p className="text-xs text-muted-foreground">{level.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        <div className="no-print">
          <RatingScaleLegend minRating={minRating} maxRating={maxRating} />
        </div>
      </div>
    </TooltipProvider>
  );
}

// Print-specific inline legend for PDF headers
export function RatingScalePrintHeader({
  minRating = 1,
  maxRating = 5,
}: {
  minRating?: number;
  maxRating?: number;
}) {
  const filteredLevels = RATING_SCALE_DEFINITIONS.filter(
    (level) => level.level >= minRating && level.level <= maxRating
  );

  return (
    <div className="rating-scale-print-header hidden print:flex items-center justify-center gap-3 py-1 text-[10px] border-b bg-muted/20">
      <span className="font-semibold">Rating:</span>
      {filteredLevels.map((level) => (
        <span key={level.level} className="inline-flex items-center gap-0.5">
          <span>{level.icon}</span>
          <span className="font-medium">{level.level}</span>
          <span className="text-muted-foreground">= {level.shortLabel}</span>
        </span>
      ))}
    </div>
  );
}
