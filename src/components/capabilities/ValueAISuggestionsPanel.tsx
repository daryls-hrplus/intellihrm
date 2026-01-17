import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ChevronDown, ChevronUp, Lightbulb, Link2, Award, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useValueAI } from "@/hooks/capabilities/useValueAI";

interface ValueAISuggestionsPanelProps {
  valueName: string;
  valueDescription?: string;
  onApplyImprovement?: (improvement: string) => void;
  className?: string;
}

export function ValueAISuggestionsPanel({
  valueName,
  valueDescription,
  onApplyImprovement,
  className,
}: ValueAISuggestionsPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [analysis, setAnalysis] = useState<{
    confidence_score: number;
    improvements: string[];
    related_values: { name: string; reason: string }[];
    classification: string;
  } | null>(null);

  const { isAnalyzing, analyzeValue } = useValueAI();

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (valueName && valueName.trim().length >= 3) {
        analyzeValue(valueName, valueDescription).then((result) => {
          if (result) {
            setAnalysis(result);
          }
        });
      } else {
        setAnalysis(null);
      }
    }, 800);

    return () => clearTimeout(debounceTimer);
  }, [valueName, valueDescription]);

  if (!valueName || valueName.trim().length < 3) {
    return null;
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-amber-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return "High";
    if (score >= 0.6) return "Medium";
    return "Low";
  };

  const getClassificationBadge = (classification: string) => {
    const variants: Record<string, string> = {
      core: "bg-blue-100 text-blue-800 border-blue-200",
      aspirational: "bg-purple-100 text-purple-800 border-purple-200",
      leadership: "bg-amber-100 text-amber-800 border-amber-200",
    };
    return variants[classification] || variants.core;
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("rounded-lg border bg-primary/5 border-primary/20", className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-3 h-auto hover:bg-primary/10"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">AI Suggestions</span>
            {isAnalyzing && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3 space-y-3">
          {analysis ? (
            <>
              {/* Confidence Score */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Definition Confidence</span>
                  <span className={cn("font-medium", getConfidenceColor(analysis.confidence_score))}>
                    {getConfidenceLabel(analysis.confidence_score)} ({Math.round(analysis.confidence_score * 100)}%)
                  </span>
                </div>
                <Progress value={analysis.confidence_score * 100} className="h-1.5" />
              </div>

              {/* Classification */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Classified as:</span>
                <Badge variant="outline" className={cn("text-xs capitalize", getClassificationBadge(analysis.classification))}>
                  {analysis.classification} Value
                </Badge>
                {analysis.classification === "core" && (
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                )}
              </div>

              {/* Improvements */}
              {analysis.improvements.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lightbulb className="h-3 w-3" />
                    <span>Suggested Improvements</span>
                  </div>
                  <ul className="space-y-1">
                    {analysis.improvements.slice(0, 3).map((improvement, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-muted-foreground pl-3 border-l-2 border-primary/30 hover:border-primary cursor-pointer transition-colors"
                        onClick={() => onApplyImprovement?.(improvement)}
                      >
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Values */}
              {analysis.related_values.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Link2 className="h-3 w-3" />
                    <span>Related Values</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analysis.related_values.slice(0, 4).map((related, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs cursor-help"
                        title={related.reason}
                      >
                        {related.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-2">
              {isAnalyzing ? (
                "Analyzing value definition..."
              ) : (
                "Enter a value name to get AI suggestions"
              )}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
