import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award, ChevronDown, ChevronUp, Paperclip, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProficiencyIndicators {
  [level: string]: string[];
}

interface EmployeeCompetencyCardProps {
  competencyId: string;
  competencyName: string;
  category?: string;
  weight: number;
  currentRating: number | null;
  comments: string;
  selectedBehaviors?: string[];
  proficiencyIndicators?: ProficiencyIndicators;
  requiredLevel?: number;
  evidenceCount?: number;
  maxRating?: number;
  minRating?: number;
  onRatingChange: (rating: number) => void;
  onCommentsChange: (comments: string) => void;
  onBehaviorsChange?: (behaviors: string[]) => void;
  onAttachEvidence?: () => void;
  readOnly?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: "Novice",
  2: "Developing",
  3: "Proficient",
  4: "Advanced",
  5: "Expert",
};

export function EmployeeCompetencyCard({
  competencyId,
  competencyName,
  category,
  weight,
  currentRating,
  comments,
  selectedBehaviors = [],
  proficiencyIndicators,
  requiredLevel,
  evidenceCount = 0,
  maxRating = 5,
  minRating = 1,
  onRatingChange,
  onCommentsChange,
  onBehaviorsChange,
  onAttachEvidence,
  readOnly = false,
}: EmployeeCompetencyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRatingColor = (rating: number | null) => {
    if (rating === null) return "text-muted-foreground";
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-blue-600";
    if (rating >= 2) return "text-amber-600";
    return "text-red-600";
  };

  const isComplete = currentRating !== null;
  const currentLevelIndicators = proficiencyIndicators?.[String(Math.floor(currentRating || 1))] || [];

  const handleBehaviorToggle = (behavior: string) => {
    if (!onBehaviorsChange) return;
    const newBehaviors = selectedBehaviors.includes(behavior)
      ? selectedBehaviors.filter(b => b !== behavior)
      : [...selectedBehaviors, behavior];
    onBehaviorsChange(newBehaviors);
  };

  return (
    <Card className={cn(
      "transition-all",
      isComplete && "border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardContent className="pt-4 pb-3 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "p-2 rounded-lg",
                  isComplete ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                )}>
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Award className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{competencyName}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {category && <Badge variant="outline" className="text-xs">{category}</Badge>}
                    <span>Weight: {weight}%</span>
                    {requiredLevel && (
                      <span className="text-primary">Required: L{requiredLevel}</span>
                    )}
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
                  <Label className="text-sm font-medium flex items-center gap-2">
                    Your Proficiency Level
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">
                            Rate your current proficiency. Select behaviors below that you've demonstrated.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
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

              {/* Behavioral Indicators */}
              {proficiencyIndicators && Object.keys(proficiencyIndicators).length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Demonstrated Behaviors
                    <span className="text-muted-foreground ml-1 font-normal">
                      (Select all that apply)
                    </span>
                  </Label>
                  <ScrollArea className="h-40 rounded-md border p-3">
                    <div className="space-y-2">
                      {Object.entries(proficiencyIndicators).map(([level, behaviors]) => (
                        <div key={level} className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Level {level} - {RATING_LABELS[parseInt(level)] || ""}
                          </p>
                          {behaviors.map((behavior, idx) => (
                            <div key={`${level}-${idx}`} className="flex items-start gap-2">
                              <Checkbox
                                id={`${competencyId}-${level}-${idx}`}
                                checked={selectedBehaviors.includes(behavior)}
                                onCheckedChange={() => handleBehaviorToggle(behavior)}
                                disabled={readOnly}
                              />
                              <label
                                htmlFor={`${competencyId}-${level}-${idx}`}
                                className="text-sm leading-tight cursor-pointer"
                              >
                                {behavior}
                              </label>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <p className="text-xs text-muted-foreground">
                    {selectedBehaviors.length} behaviors selected
                  </p>
                </div>
              )}

              {/* Comments */}
              <div className="space-y-2">
                <Label className="text-sm">
                  Self-Assessment Comments
                  <span className="text-muted-foreground ml-1">(How you've demonstrated this competency)</span>
                </Label>
                <Textarea
                  value={comments}
                  onChange={(e) => onCommentsChange(e.target.value)}
                  placeholder="Describe specific examples where you demonstrated this competency..."
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
