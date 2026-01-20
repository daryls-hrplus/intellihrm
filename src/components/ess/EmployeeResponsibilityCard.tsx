import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Briefcase, ChevronDown, ChevronUp, Paperclip, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeResponsibilityCardProps {
  responsibilityId: string;
  responsibilityName: string;
  weight: number;
  currentRating: number | null;
  comments: string;
  evidenceCount?: number;
  maxRating?: number;
  minRating?: number;
  onRatingChange: (rating: number) => void;
  onCommentsChange: (comments: string) => void;
  onAttachEvidence?: () => void;
  readOnly?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: "Needs Improvement",
  2: "Below Expectations",
  3: "Meets Expectations",
  4: "Exceeds Expectations",
  5: "Outstanding",
};

export function EmployeeResponsibilityCard({
  responsibilityId,
  responsibilityName,
  weight,
  currentRating,
  comments,
  evidenceCount = 0,
  maxRating = 5,
  minRating = 1,
  onRatingChange,
  onCommentsChange,
  onAttachEvidence,
  readOnly = false,
}: EmployeeResponsibilityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRatingColor = (rating: number | null) => {
    if (rating === null) return "text-muted-foreground";
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-blue-600";
    if (rating >= 2) return "text-amber-600";
    return "text-red-600";
  };

  const isComplete = currentRating !== null;

  return (
    <Card className={cn(
      "transition-all",
      isComplete && "border-purple-200 bg-purple-50/30 dark:border-purple-900 dark:bg-purple-950/20"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardContent className="pt-4 pb-3 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "p-2 rounded-lg",
                  isComplete ? "bg-green-100 dark:bg-green-900/30" : "bg-purple-100 dark:bg-purple-900/30"
                )}>
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Briefcase className="h-4 w-4 text-purple-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{responsibilityName}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Weight: {weight}%</span>
                    {evidenceCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <Paperclip className="h-3 w-3 mr-1" />
                        {evidenceCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {currentRating !== null && (
                  <div className="text-right">
                    <span className={cn("text-lg font-bold", getRatingColor(currentRating))}>
                      {currentRating.toFixed(1)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {RATING_LABELS[Math.round(currentRating)] || ""}
                    </p>
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 border-t">
            <div className="space-y-4 pt-4">
              {/* Rating Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Your Self-Rating</Label>
                  <span className={cn("text-lg font-bold", getRatingColor(currentRating))}>
                    {currentRating !== null ? currentRating.toFixed(1) : "Not rated"}
                  </span>
                </div>
                
                {!readOnly && (
                  <>
                    <Slider
                      value={[currentRating ?? minRating]}
                      min={minRating}
                      max={maxRating}
                      step={0.5}
                      onValueChange={([value]) => onRatingChange(value)}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{RATING_LABELS[minRating]}</span>
                      <span>{RATING_LABELS[maxRating]}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <Label className="text-sm">
                  Justification & Accomplishments
                  <span className="text-muted-foreground ml-1">(How you fulfilled this responsibility)</span>
                </Label>
                <Textarea
                  value={comments}
                  onChange={(e) => onCommentsChange(e.target.value)}
                  placeholder="Describe how you fulfilled this responsibility, key accomplishments, and any challenges overcome..."
                  rows={3}
                  disabled={readOnly}
                  className="resize-none"
                />
              </div>

              {/* Evidence Button */}
              {onAttachEvidence && !readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAttachEvidence}
                  className="w-full"
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  {evidenceCount > 0 ? `View Evidence (${evidenceCount})` : "Attach Evidence"}
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
