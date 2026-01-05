import { useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeedbackWritingAssistant, WritingSuggestion } from '@/hooks/useFeedbackWritingAssistant';
import { WritingQualityMeter } from './WritingQualityMeter';
import { BiasWarningInline } from './BiasWarningInline';
import { SuggestionPopover } from './SuggestionPopover';

interface AIWritingAssistantProps {
  text: string;
  questionContext?: string;
  raterCategory?: string;
  responseId?: string;
  onApplySuggestion?: (suggestion: WritingSuggestion, newText: string) => void;
  showCompact?: boolean;
  className?: string;
}

export function AIWritingAssistant({
  text,
  questionContext,
  raterCategory,
  responseId,
  onApplySuggestion,
  showCompact = false,
  className
}: AIWritingAssistantProps) {
  const {
    isAnalyzing,
    result,
    error,
    analyzeDebounced,
    analyze,
    acceptSuggestion,
    dismissSuggestion,
    reset
  } = useFeedbackWritingAssistant({ debounceMs: 1500, minTextLength: 30 });

  // Auto-analyze on text change
  useEffect(() => {
    if (text.length >= 30) {
      analyzeDebounced(text, questionContext, raterCategory);
    } else {
      reset();
    }
  }, [text, questionContext, raterCategory, analyzeDebounced, reset]);

  const handleAccept = useCallback((suggestion: WritingSuggestion) => {
    if (responseId) {
      acceptSuggestion(responseId, suggestion, text);
    }
    
    // Apply suggestion to text if handler provided
    if (onApplySuggestion && suggestion.originalPhrase) {
      const newText = text.replace(suggestion.originalPhrase, suggestion.suggestion);
      onApplySuggestion(suggestion, newText);
    } else if (onApplySuggestion) {
      onApplySuggestion(suggestion, suggestion.suggestion);
    }
  }, [responseId, text, acceptSuggestion, onApplySuggestion]);

  const handleDismiss = useCallback((suggestion: WritingSuggestion) => {
    if (responseId) {
      dismissSuggestion(responseId, suggestion, text);
    }
  }, [responseId, text, dismissSuggestion]);

  const handleRefresh = () => {
    analyze(text, questionContext, raterCategory);
  };

  // Compact mode - just show quality indicator
  if (showCompact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <WritingQualityMeter
          scores={result?.qualityScores ?? null}
          isAnalyzing={isAnalyzing}
          compact
        />
        {result?.biasIndicators && result.biasIndicators.length > 0 && (
          <BiasWarningInline
            biasIndicators={result.biasIndicators}
            biasRiskScore={result.qualityScores.biasRisk}
          />
        )}
      </div>
    );
  }

  // Don't show anything if text is too short
  if (text.length < 30 && !isAnalyzing) {
    return null;
  }

  const hasSuggestions = result?.suggestions && result.suggestions.length > 0;
  const hasBiasWarning = result?.biasIndicators && result.biasIndicators.length > 0;

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Writing Assistant
            <Badge variant="outline" className="text-xs font-normal">
              Beta
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleRefresh}
              disabled={isAnalyzing}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isAnalyzing && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={reset}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        {/* Quality Meter */}
        <WritingQualityMeter
          scores={result?.qualityScores ?? null}
          isAnalyzing={isAnalyzing}
        />

        {/* Bias Warning */}
        {hasBiasWarning && result && (
          <BiasWarningInline
            biasIndicators={result.biasIndicators}
            biasRiskScore={result.qualityScores.biasRisk}
          />
        )}

        {/* Suggestions */}
        {hasSuggestions && result && (
          <SuggestionPopover
            suggestions={result.suggestions}
            onAccept={handleAccept}
            onDismiss={handleDismiss}
          />
        )}

        {/* Error State */}
        {error && (
          <div className="text-xs text-muted-foreground bg-destructive/10 rounded px-2 py-1.5">
            Analysis unavailable: {error}
          </div>
        )}

        {/* ISO 42001 Transparency Notice */}
        <p className="text-[10px] text-muted-foreground">
          AI-powered suggestions. All recommendations require human review before application.
          <span className="ml-1 opacity-60">ISO 42001 compliant</span>
        </p>
      </CardContent>
    </Card>
  );
}
