import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, TrendingUp, TrendingDown, Minus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelfRatingIndicatorProps {
  selfRating: number | null;
  managerRating: number | null;
  selfComments?: string | null;
  showGapAlert?: boolean;
  gapThreshold?: number;
  compact?: boolean;
}

export function SelfRatingIndicator({
  selfRating,
  managerRating,
  selfComments,
  showGapAlert = true,
  gapThreshold = 1.5,
  compact = false,
}: SelfRatingIndicatorProps) {
  if (selfRating === null) {
    return null;
  }

  const gap = managerRating !== null ? selfRating - managerRating : null;
  const absGap = gap !== null ? Math.abs(gap) : 0;
  const hasSignificantGap = absGap >= gapThreshold;

  const getGapIcon = () => {
    if (gap === null || absGap < 0.5) return <Minus className="h-3 w-3" />;
    if (gap > 0) return <TrendingUp className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
  };

  const getGapColor = () => {
    if (gap === null || absGap < 0.5) return "text-muted-foreground";
    if (hasSignificantGap) return gap > 0 ? "text-amber-600" : "text-blue-600";
    return gap > 0 ? "text-amber-500" : "text-blue-500";
  };

  const getGapBadgeVariant = () => {
    if (!hasSignificantGap) return "secondary";
    return gap && gap > 0 ? "destructive" : "default";
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className={cn("text-sm font-medium", getGapColor())}>
                {selfRating.toFixed(1)}
              </span>
              {hasSignificantGap && showGapAlert && (
                <Badge variant={getGapBadgeVariant()} className="text-[10px] px-1 py-0 h-4">
                  Gap
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Self-Rating:</span>
                <span className="font-semibold">{selfRating.toFixed(1)}</span>
              </div>
              {managerRating !== null && (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Manager Rating:</span>
                    <span className="font-semibold">{managerRating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t pt-2">
                    <span className="text-muted-foreground">Gap:</span>
                    <span className={cn("font-semibold", getGapColor())}>
                      {gap! > 0 ? "+" : ""}{gap!.toFixed(1)}
                    </span>
                  </div>
                </>
              )}
              {selfComments && (
                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground italic line-clamp-3">
                    "{selfComments}"
                  </p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/30 border border-accent/50">
      <User className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Self-Rating:</span>
          <span className={cn("font-semibold", getGapColor())}>
            {selfRating.toFixed(1)}
          </span>
          {gap !== null && (
            <span className={cn("flex items-center gap-1 text-xs", getGapColor())}>
              {getGapIcon()}
              {gap > 0 ? "+" : ""}{gap.toFixed(1)}
            </span>
          )}
          {hasSignificantGap && showGapAlert && (
            <Badge variant={getGapBadgeVariant()} className="text-xs">
              Gap Alert
            </Badge>
          )}
        </div>
        {selfComments && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 cursor-help">
                  <MessageSquare className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">{selfComments}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm">
                <p className="text-sm">{selfComments}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
