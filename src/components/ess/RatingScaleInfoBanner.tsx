import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info, HelpCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { RatingScale, ConversionRuleSet } from "@/hooks/useRatingScale";

interface RatingScaleInfoBannerProps {
  ratingScale: RatingScale | null | undefined;
  conversionRules?: ConversionRuleSet | null;
  showConversionInfo?: boolean;
  variant?: "compact" | "detailed";
}

export function RatingScaleInfoBanner({
  ratingScale,
  conversionRules,
  showConversionInfo = true,
  variant = "compact",
}: RatingScaleInfoBannerProps) {
  if (!ratingScale) {
    return (
      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
          Using default rating scale. Contact HR to configure a custom scale for this appraisal cycle.
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4 text-primary" />
          <span className="font-medium">Rating Scale:</span>
          <span className="text-muted-foreground">{ratingScale.name}</span>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              <HelpCircle className="h-4 w-4 mr-1" />
              View Scale
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <div className="font-medium">{ratingScale.name}</div>
              <div className="space-y-2">
                {Object.entries(ratingScale.labels)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([level, info]) => (
                    <div key={level} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="min-w-[24px] justify-center">
                        {level}
                      </Badge>
                      <div>
                        <div className="font-medium">{info.label}</div>
                        {info.description && (
                          <div className="text-xs text-muted-foreground">{info.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              
              {showConversionInfo && conversionRules && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-2">
                    How ratings affect your proficiency levels:
                  </div>
                  <div className="space-y-1">
                    {conversionRules.rules.map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary" className="min-w-[20px] justify-center text-xs">
                          {rule.performance_rating}
                        </Badge>
                        <span className="flex items-center gap-1">
                          {rule.proficiency_change > 0 ? (
                            <>
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span className="text-green-600">+{rule.proficiency_change} level</span>
                            </>
                          ) : rule.proficiency_change < 0 ? (
                            <>
                              <TrendingDown className="h-3 w-3 text-red-600" />
                              <span className="text-red-600">{rule.proficiency_change} level</span>
                            </>
                          ) : (
                            <>
                              <Minus className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">No change</span>
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Detailed variant
  return (
    <Alert className="bg-primary/5 border-primary/20">
      <Info className="h-4 w-4 text-primary" />
      <AlertDescription>
        <div className="space-y-2">
          <div className="font-medium">Rating Scale: {ratingScale.name}</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ratingScale.labels)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([level, info]) => (
                <TooltipProvider key={level}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="cursor-help">
                        {level} - {info.label}
                      </Badge>
                    </TooltipTrigger>
                    {info.description && (
                      <TooltipContent>
                        <p className="max-w-xs">{info.description}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
