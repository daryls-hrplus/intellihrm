import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RequiredLevelBadge } from "@/components/ui/required-level-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Award, ChevronDown, ChevronUp, Paperclip, CheckCircle2, Info, Target, TrendingUp } from "lucide-react";
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
  currentAssessedLevel?: number | null;
  evidenceCount?: number;
  maxRating?: number;
  minRating?: number;
  onRatingChange: (rating: number) => void;
  onCommentsChange: (comments: string) => void;
  onBehaviorsChange?: (behaviors: string[]) => void;
  onAttachEvidence?: () => void;
  readOnly?: boolean;
  // New props for configurable rating scale
  ratingLabels?: Record<number, string>;
  usePerformanceScale?: boolean;
  ratingLabel?: string; // e.g. "Performance Rating" vs "Proficiency Level"
  showRoleExpectation?: boolean;
}

// Default proficiency labels (Dreyfus model - used for competency profiles)
const PROFICIENCY_LABELS: Record<number, string> = {
  1: "Novice",
  2: "Developing",
  3: "Proficient",
  4: "Advanced",
  5: "Expert",
};

// Default performance labels (used when no custom scale provided in appraisals)
const PERFORMANCE_LABELS: Record<number, string> = {
  1: "Needs Improvement",
  2: "Below Expectations",
  3: "Meets Expectations",
  4: "Exceeds Expectations",
  5: "Outstanding",
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
  currentAssessedLevel,
  evidenceCount = 0,
  maxRating = 5,
  minRating = 1,
  onRatingChange,
  onCommentsChange,
  onBehaviorsChange,
  onAttachEvidence,
  readOnly = false,
  ratingLabels,
  usePerformanceScale = false,
  ratingLabel,
  showRoleExpectation = false,
}: EmployeeCompetencyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine which labels to use based on context
  const displayLabels = ratingLabels || (usePerformanceScale ? PERFORMANCE_LABELS : PROFICIENCY_LABELS);
  const fieldLabel = ratingLabel || (usePerformanceScale ? "Your Performance Rating" : "Your Proficiency Level");
  
  // Get proficiency gap status for role expectation display
  // Uses semantic CSS variables per UI Color Semantics Standard
  const getProficiencyGapStatus = () => {
    if (!requiredLevel || !currentAssessedLevel) return null;
    const gap = currentAssessedLevel - requiredLevel;
    if (gap >= 0) return { status: "meets", label: "Meets/Exceeds", color: "text-success" };
    if (gap === -1) return { status: "close", label: "Close to target", color: "text-warning" };
    return { status: "gap", label: "Development needed", color: "text-destructive" };
  };
  
  const gapStatus = getProficiencyGapStatus();

  // Rating color uses semantic CSS variables per UI Color Semantics Standard
  const getRatingColor = (rating: number | null) => {
    if (rating === null) return "text-muted-foreground";
    if (rating >= 4) return "text-success";      // Achievement - green
    if (rating >= 3) return "text-info";         // Meets expectations - blue
    if (rating >= 2) return "text-warning";      // Needs attention - amber
    return "text-destructive";                   // Below expectations - red
  };

  const isComplete = currentRating !== null;
  const currentLevelIndicators = proficiencyIndicators?.[String(Math.floor(currentRating || 1))] || [];
  
  // Get label for current rating
  const currentRatingLabel = currentRating !== null 
    ? displayLabels[Math.round(currentRating)] || ""
    : "";

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
      isComplete && "border-success/20 bg-success/5"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardContent className="pt-4 pb-3 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "p-2 rounded-lg",
                  isComplete ? "bg-success/10" : "bg-info/10"
                )}>
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Award className="h-4 w-4 text-info" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{competencyName}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    {category && <Badge variant="outline" className="text-xs">{category}</Badge>}
                    <span>Weight: {weight}%</span>
                    {showRoleExpectation && requiredLevel && (
                      <RequiredLevelBadge 
                        level={requiredLevel} 
                        label={`Role: L${requiredLevel}`}
                        size="sm"
                      />
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
                      {currentRatingLabel}
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
              {/* Role Expectation Info - Industry Standard Transparency */}
              {showRoleExpectation && requiredLevel && (
                <Alert className="bg-info/5 border-info/20">
                  <Target className="h-4 w-4 text-info" />
                  <AlertDescription className="text-sm">
                    <span className="font-medium">Role Expectation:</span>{" "}
                    <span className="text-info font-semibold">
                      {PROFICIENCY_LABELS[requiredLevel]} (Level {requiredLevel})
                    </span>
                    {currentAssessedLevel !== null && currentAssessedLevel !== undefined && (
                      <span className="block mt-1 text-muted-foreground">
                        Your current proficiency: {PROFICIENCY_LABELS[currentAssessedLevel]} (L{currentAssessedLevel})
                        {gapStatus && (
                          <span className={cn("ml-2 font-medium", gapStatus.color)}>
                            • {gapStatus.label}
                          </span>
                        )}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Rating Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    {fieldLabel}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">
                            {usePerformanceScale 
                              ? "Rate how well you demonstrated this competency during the review period."
                              : "Rate your current proficiency. Select behaviors below that you've demonstrated."}
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
                      <span>{displayLabels[minRating] || minRating}</span>
                      <span>{displayLabels[maxRating] || maxRating}</span>
                    </div>
                  </>
                )}

                {/* Proficiency Impact Hint */}
                {usePerformanceScale && showRoleExpectation && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Exceptional ratings may increase your proficiency level after manager review.
                  </p>
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
                  <div className="rounded-md border p-3 max-h-[50vh] overflow-y-auto">
                    <div className="space-y-2">
                      {Object.entries(proficiencyIndicators).map(([level, behaviors]) => (
                        <div key={level} className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Level {level} - {PROFICIENCY_LABELS[parseInt(level)] || displayLabels[parseInt(level)] || ""}
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
                  </div>
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
