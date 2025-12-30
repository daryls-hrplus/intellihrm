import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { RESPONSIBILITY_LEVELS, requiresComment, ResponsibilityLevel } from "@/constants/responsibilityLevels";

interface ResponsibilityRatingCardProps {
  itemId: string;
  rating: number | null;
  comments: string;
  onRatingChange: (value: number) => void;
  onCommentChange: (value: string) => void;
  weightedScore?: number | null;
  segmentBadge?: string;
  positionBadge?: string;
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
}: ResponsibilityRatingCardProps) {
  const selectedLevel = rating ? RESPONSIBILITY_LEVELS.find(l => l.value === rating) : null;
  const needsComment = rating !== null && requiresComment(rating) && !comments.trim();

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
