import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, Minus, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversionRuleSet } from "@/hooks/useRatingScale";

interface CompetencyScore {
  item_id: string;
  item_name: string;
  rating: number | null;
  currentProficiency?: number;
}

interface ProficiencyImpactPreviewProps {
  competencies: CompetencyScore[];
  conversionRules?: ConversionRuleSet | null;
  showTitle?: boolean;
  variant?: "compact" | "detailed";
}

// Dreyfus proficiency labels
const PROFICIENCY_LABELS: Record<number, string> = {
  1: "Novice",
  2: "Developing",
  3: "Proficient",
  4: "Advanced",
  5: "Expert",
};

/**
 * Calculates the projected proficiency change based on conversion rules
 */
function calculateImpact(
  rules: ConversionRuleSet["rules"],
  performanceRating: number | null,
  currentProficiency: number
): { newLevel: number; change: number; reason: string } {
  if (performanceRating === null) {
    return { newLevel: currentProficiency, change: 0, reason: "Not rated yet" };
  }

  const roundedRating = Math.round(performanceRating);
  const rule = rules.find(r => r.performance_rating === roundedRating);

  if (!rule) {
    return { newLevel: currentProficiency, change: 0, reason: "No rule found" };
  }

  let change = rule.proficiency_change;
  let reason = rule.label;

  switch (rule.condition) {
    case "if_below_max":
      if (currentProficiency >= 5) {
        change = 0;
        reason = `${rule.label} (already at maximum)`;
      }
      break;
    case "if_above_min":
      if (currentProficiency <= 1) {
        change = 0;
        reason = `${rule.label} (already at minimum)`;
      }
      break;
    case "maintain":
      change = 0;
      break;
    case "always":
      break;
  }

  const newLevel = Math.max(1, Math.min(5, currentProficiency + change));

  return {
    newLevel,
    change: newLevel - currentProficiency,
    reason
  };
}

export function ProficiencyImpactPreview({
  competencies,
  conversionRules,
  showTitle = true,
  variant = "compact",
}: ProficiencyImpactPreviewProps) {
  if (!conversionRules || competencies.length === 0) {
    return null;
  }

  const ratedCompetencies = competencies.filter(c => c.rating !== null && c.currentProficiency);
  
  if (ratedCompetencies.length === 0 && variant === "compact") {
    return null;
  }

  const impacts = ratedCompetencies.map(c => ({
    ...c,
    impact: calculateImpact(conversionRules.rules, c.rating, c.currentProficiency || 3)
  }));

  const increases = impacts.filter(i => i.impact.change > 0).length;
  const decreases = impacts.filter(i => i.impact.change < 0).length;
  const noChange = impacts.filter(i => i.impact.change === 0).length;

  if (variant === "compact") {
    return (
      <Alert className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <Sparkles className="h-4 w-4 text-primary" />
        <AlertDescription>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">Proficiency Impact Preview:</span>
            {increases > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                {increases} increase{increases > 1 ? "s" : ""}
              </span>
            )}
            {decreases > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <TrendingDown className="h-3 w-3" />
                {decreases} decrease{decreases > 1 ? "s" : ""}
              </span>
            )}
            {noChange > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Minus className="h-3 w-3" />
                {noChange} unchanged
              </span>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Detailed variant
  return (
    <Card>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Proficiency Impact Preview
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "pt-0" : ""}>
        <div className="text-xs text-muted-foreground mb-3">
          Based on your ratings, here's how proficiency levels will be updated:
        </div>
        <ScrollArea className="max-h-48">
          <div className="space-y-2">
            {impacts.map(item => (
              <div
                key={item.item_id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg text-sm",
                  item.impact.change > 0 && "bg-green-50 dark:bg-green-950/20",
                  item.impact.change < 0 && "bg-red-50 dark:bg-red-950/20",
                  item.impact.change === 0 && "bg-muted/50"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.item_name}</div>
                  <div className="text-xs text-muted-foreground">
                    Rating: {item.rating?.toFixed(1)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div className="text-xs">
                    <span className="text-muted-foreground">
                      {PROFICIENCY_LABELS[item.currentProficiency || 3]} ({item.currentProficiency})
                    </span>
                    <span className="mx-1">→</span>
                    <span className={cn(
                      "font-medium",
                      item.impact.change > 0 && "text-green-600",
                      item.impact.change < 0 && "text-red-600"
                    )}>
                      {PROFICIENCY_LABELS[item.impact.newLevel]} ({item.impact.newLevel})
                    </span>
                  </div>
                  {item.impact.change > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{item.impact.change}
                    </Badge>
                  )}
                  {item.impact.change < 0 && (
                    <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {item.impact.change}
                    </Badge>
                  )}
                  {item.impact.change === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Minus className="h-3 w-3 mr-1" />
                      No change
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground flex items-start gap-2">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>
            Proficiency levels are updated when the appraisal is finalized. 
            Exceptional ratings may increase proficiency, while underperformance may decrease it.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
