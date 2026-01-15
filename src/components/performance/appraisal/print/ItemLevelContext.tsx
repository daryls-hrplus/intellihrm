import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Target, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRatingDefinition } from "./RatingScaleLegend";

interface ItemLevelContextProps {
  requiredLevel?: number;
  requiredLevelLabel?: string;
  requiredLevelIndicators?: string[];
  currentRating?: number;
  currentRatingLabel?: string;
  isEmployeeView?: boolean;
  showDevelopmentSuggestion?: boolean;
  className?: string;
}

// Default proficiency level names when not provided
const DEFAULT_LEVEL_NAMES: Record<number, string> = {
  1: "Novice",
  2: "Beginner",
  3: "Competent",
  4: "Proficient",
  5: "Expert",
};

// Default indicators for when specific ones aren't defined
const DEFAULT_LEVEL_INDICATORS: Record<number, string[]> = {
  1: [
    "Has basic awareness of the skill/competency",
    "Requires close supervision and guidance",
    "Follows established procedures step-by-step",
  ],
  2: [
    "Understands fundamental concepts and terminology",
    "Handles routine tasks with some supervision",
    "Applies knowledge in straightforward situations",
  ],
  3: [
    "Works independently in typical situations",
    "Applies good judgment and problem-solving",
    "Meets expectations consistently",
  ],
  4: [
    "Handles complex or ambiguous situations effectively",
    "Mentors and develops others",
    "Is recognized as a go-to resource",
  ],
  5: [
    "Innovates and sets new standards",
    "Is a recognized authority in the field",
    "Drives strategic initiatives and thought leadership",
  ],
};

export function ItemLevelContext({
  requiredLevel,
  requiredLevelLabel,
  requiredLevelIndicators,
  currentRating,
  currentRatingLabel,
  isEmployeeView = false,
  showDevelopmentSuggestion = true,
  className,
}: ItemLevelContextProps) {
  if (!requiredLevel) return null;

  const levelName = requiredLevelLabel || DEFAULT_LEVEL_NAMES[requiredLevel] || `Level ${requiredLevel}`;
  const indicators = requiredLevelIndicators?.length 
    ? requiredLevelIndicators 
    : DEFAULT_LEVEL_INDICATORS[requiredLevel] || [];

  const gap = currentRating !== undefined ? currentRating - requiredLevel : undefined;
  const ratingDef = currentRating !== undefined ? getRatingDefinition(currentRating) : undefined;

  const getGapMessage = () => {
    if (gap === undefined || gap === null) return null;
    
    if (gap > 0) {
      return {
        icon: TrendingUp,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800",
        message: gap === 1 
          ? "Performing above the required level. Ready for additional challenges."
          : `Performing ${gap} levels above requirement. Strong candidate for advancement.`,
        suggestion: "Consider stretch assignments or mentoring opportunities.",
      };
    } else if (gap < 0) {
      const absGap = Math.abs(gap);
      return {
        icon: TrendingDown,
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        borderColor: "border-amber-200 dark:border-amber-800",
        message: absGap === 1
          ? "Currently performing below the required level."
          : `Performing ${absGap} levels below requirement. Development is a priority.`,
        suggestion: absGap > 1 
          ? "Urgent development plan needed with regular check-ins."
          : "Focused coaching and practice opportunities recommended.",
      };
    } else {
      return {
        icon: CheckCircle,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        message: "Performing at the level required for this role.",
        suggestion: "Continue reinforcing current capabilities.",
      };
    }
  };

  const gapInfo = getGapMessage();

  return (
    <div className={cn("space-y-3", className)}>
      {/* Required Level Section */}
      <Card className="p-4 bg-muted/30 border-muted">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 shrink-0">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">Required Level:</span>
              <Badge variant="outline" className="font-medium">
                Level {requiredLevel} - {levelName}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {isEmployeeView 
                ? "Your role requires you to demonstrate these behaviors:"
                : "This role requires the employee to demonstrate:"}
            </p>
            {indicators.length > 0 && (
              <ul className="space-y-1 mt-2">
                {indicators.map((indicator, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary shrink-0 mt-0.5">•</span>
                    <span>{indicator}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>

      {/* Rating Context Section */}
      {currentRating !== undefined && gapInfo && (
        <Card className={cn(
          "p-4 border",
          gapInfo.bgColor,
          gapInfo.borderColor
        )}>
          <div className="flex items-start gap-3">
            <div className={cn("rounded-full p-2 shrink-0", gapInfo.bgColor)}>
              <gapInfo.icon className={cn("h-4 w-4", gapInfo.color)} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">
                  {isEmployeeView ? "Your Rating:" : "Rating Given:"}
                </span>
                <Badge className={cn("font-medium", ratingDef?.color)}>
                  {ratingDef?.icon} Level {currentRating} - {currentRatingLabel || ratingDef?.label}
                </Badge>
                {gap !== undefined && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-mono text-xs",
                      gap > 0 ? "text-green-600 border-green-600" :
                      gap < 0 ? "text-amber-600 border-amber-600" :
                      "text-blue-600 border-blue-600"
                    )}
                  >
                    {gap > 0 ? `+${gap}` : gap === 0 ? "0" : gap} vs Required
                  </Badge>
                )}
              </div>
              
              <p className={cn("text-sm font-medium", gapInfo.color)}>
                {gapInfo.message}
              </p>

              {showDevelopmentSuggestion && gapInfo.suggestion && (
                <div className="flex items-start gap-2 mt-2 pt-2 border-t border-current/10">
                  <Lightbulb className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    {gapInfo.suggestion}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* No rating yet indicator */}
      {currentRating === undefined && (
        <Card className="p-4 bg-muted/20 border-dashed">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              {isEmployeeView 
                ? "You have not yet provided a self-rating for this item."
                : "No rating has been provided yet."}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
