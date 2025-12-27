import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Check, ChevronRight, Target } from "lucide-react";
import { useGoalAIAnalyzer } from "@/hooks/performance/useGoalAIAnalyzer";
import { DEFAULT_METRIC_TEMPLATES } from "@/types/goalEnhancements";

interface MetricSuggestion {
  template_name: string;
  template_type: string;
  confidence: number;
  reasoning: string;
  suggested_target?: string;
  unit_of_measure?: string;
}

interface AIMetricSuggestionPanelProps {
  goalTitle: string;
  goalDescription?: string;
  companyId: string;
  onSelectTemplate: (templateId: string, suggestedTarget?: string, unit?: string) => void;
}

export function AIMetricSuggestionPanel({
  goalTitle,
  goalDescription,
  companyId,
  onSelectTemplate,
}: AIMetricSuggestionPanelProps) {
  const { suggestTemplates, analyzing } = useGoalAIAnalyzer();
  const [suggestions, setSuggestions] = useState<MetricSuggestion[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!goalTitle) return;

    const result = await suggestTemplates({
      id: "",
      title: goalTitle,
      description: goalDescription,
      company_id: companyId,
    });

    if (result?.suggestions) {
      setSuggestions(result.suggestions);
      setHasAnalyzed(true);
    }
  };

  const handleSelectSuggestion = (suggestion: MetricSuggestion) => {
    const template = DEFAULT_METRIC_TEMPLATES.find(
      (t) => t.name.toLowerCase() === suggestion.template_name.toLowerCase() ||
             t.templateType === suggestion.template_type
    );

    setSelectedTemplate(suggestion.template_name);
    const templateId = template ? (template as any).id || suggestion.template_type : suggestion.template_type;
    onSelectTemplate(templateId, suggestion.suggested_target, suggestion.unit_of_measure);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500/10 text-green-600 border-green-200";
    if (confidence >= 0.6) return "bg-amber-500/10 text-amber-600 border-amber-200";
    return "bg-muted text-muted-foreground";
  };

  if (!hasAnalyzed) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleAnalyze}
        disabled={analyzing || !goalTitle}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {analyzing ? "Analyzing..." : "AI Suggest Metrics"}
      </Button>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Metric Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {analyzing ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.slice(0, 3).map((suggestion, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                selectedTemplate === suggestion.template_name
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              }`}
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{suggestion.template_name}</span>
                    {selectedTemplate === suggestion.template_name && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {suggestion.reasoning}
                  </p>
                  {suggestion.suggested_target && (
                    <p className="text-xs text-primary mt-1">
                      Suggested target: {suggestion.suggested_target} {suggestion.unit_of_measure}
                    </p>
                  )}
                </div>
                <Badge className={getConfidenceColor(suggestion.confidence)}>
                  {Math.round(suggestion.confidence * 100)}%
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No metric suggestions available for this goal.
          </p>
        )}

        {suggestions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={handleAnalyze}
          >
            <ChevronRight className="h-4 w-4 mr-1" />
            Refresh Suggestions
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
