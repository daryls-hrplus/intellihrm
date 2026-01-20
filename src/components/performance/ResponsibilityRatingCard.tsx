import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, User, TrendingUp, TrendingDown, Minus, MessageSquare } from "lucide-react";
import { RESPONSIBILITY_LEVELS, requiresComment, ResponsibilityLevel } from "@/constants/responsibilityLevels";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ResponsibilityRatingCardProps {
  itemId: string;
  rating: number | null;
  comments: string;
  onRatingChange: (value: number) => void;
  onCommentChange: (value: string) => void;
  weightedScore?: number | null;
  segmentBadge?: string;
  positionBadge?: string;
  selfRating?: number | null;
  selfComments?: string | null;
  isManagerView?: boolean;
}

export function ResponsibilityRatingCard({
  itemId,
  rating,
  comments,
  onRatingChange,
  onCommentChange,
  weightedScore,
  segmentBadge,
  positionBadge,
  selfRating,
  selfComments,
  isManagerView = false,
}: ResponsibilityRatingCardProps) {
  const selectedLevel = rating ? RESPONSIBILITY_LEVELS.find(l => l.value === rating) : null;
  const needsComment = rating !== null && requiresComment(rating) && !comments.trim();
  
  // Gap calculation
  const gap = selfRating !== null && selfRating !== undefined && rating !== null 
    ? selfRating - rating 
    : null;
  const hasSignificantGap = gap !== null && Math.abs(gap) >= 1.5;

  return (
    <div className="space-y-4">
      {/* Segment/Position Badges */}
      {(segmentBadge || positionBadge) && (
        <div className="flex gap-2 mb-2">
          {segmentBadge && (
            <Badge variant="outline" className="text-xs">
              {segmentBadge}
            </Badge>
          )}
          {positionBadge && (
            <Badge variant="secondary" className="text-xs">
              {positionBadge}
            </Badge>
          )}
        </div>
      )}

      {/* Rating Level Selection */}
      <div>
        <Label className="mb-3 block">Performance Level</Label>
        <div className="grid grid-cols-5 gap-2">
          {RESPONSIBILITY_LEVELS.map((level) => {
            const Icon = level.icon;
            const isSelected = rating === level.value;
            
            return (
              <button
                key={level.value}
                type="button"
                onClick={() => onRatingChange(level.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isSelected
                    ? cn(level.bgClass, "border-2 ring-1 ring-offset-1", level.colorClass.replace("text-", "ring-"))
                    : "border-border bg-background hover:bg-accent/50"
                )}
              >
                <Icon className={cn("h-5 w-5", isSelected ? level.colorClass : "text-muted-foreground")} />
                <span className={cn(
                  "text-xs font-medium text-center leading-tight",
                  isSelected ? level.colorClass : "text-muted-foreground"
                )}>
                  {level.label}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Selected Level Description */}
        {selectedLevel && (
          <p className={cn("text-sm mt-3 p-2 rounded-md", selectedLevel.bgClass)}>
            <span className={cn("font-medium", selectedLevel.colorClass)}>{selectedLevel.label}:</span>{" "}
            <span className="text-muted-foreground">{selectedLevel.description}</span>
          </p>
        )}

        {/* Weighted Score */}
        {weightedScore !== null && weightedScore !== undefined && (
          <p className="text-sm text-muted-foreground mt-2">
            Weighted score: {weightedScore.toFixed(1)}%
          </p>
        )}

        {/* Self-Rating Indicator for Manager View */}
        {isManagerView && selfRating !== null && selfRating !== undefined && (
          <div className="mt-3 p-2 rounded-lg bg-accent/30 border border-accent/50">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Self-Rating:</span>
                    <span className={cn(
                      "font-semibold",
                      hasSignificantGap ? (gap! > 0 ? "text-amber-600" : "text-blue-600") : ""
                    )}>
                      {selfRating.toFixed(1)}
                    </span>
                    {gap !== null && Math.abs(gap) >= 0.5 && (
                      <span className={cn(
                        "flex items-center gap-1 text-xs",
                        hasSignificantGap ? (gap > 0 ? "text-amber-600" : "text-blue-600") : "text-muted-foreground"
                      )}>
                        {gap > 0 ? <TrendingUp className="h-3 w-3" /> : gap < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {gap > 0 ? "+" : ""}{gap.toFixed(1)}
                      </span>
                    )}
                    {hasSignificantGap && (
                      <Badge variant="destructive" className="text-xs">Gap</Badge>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">Employee Self-Assessment</p>
                    <p className="text-sm">Rating: {selfRating.toFixed(1)}</p>
                    {selfComments && (
                      <div className="border-t pt-2 mt-2">
                        <p className="text-xs text-muted-foreground italic">"{selfComments}"</p>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label htmlFor={`comments-${itemId}`}>
            Comments
            {rating !== null && requiresComment(rating) && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
          {needsComment && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <AlertTriangle className="h-3 w-3" />
              Required for this rating
            </span>
          )}
        </div>
        <Textarea
          id={`comments-${itemId}`}
          value={comments}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder={
            rating !== null && requiresComment(rating)
              ? "Explain the performance gap and improvement actions required..."
              : "Add feedback comments..."
          }
          rows={rating !== null && requiresComment(rating) ? 3 : 2}
          className={cn(needsComment && "border-destructive focus-visible:ring-destructive")}
        />
      </div>
    </div>
  );
}
