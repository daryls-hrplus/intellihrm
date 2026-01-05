import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Lightbulb, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WritingSuggestion } from '@/hooks/useFeedbackWritingAssistant';

interface SuggestionPopoverProps {
  suggestions: WritingSuggestion[];
  onAccept: (suggestion: WritingSuggestion) => void;
  onDismiss: (suggestion: WritingSuggestion) => void;
  className?: string;
}

const typeLabels: Record<string, { label: string; icon: React.ElementType }> = {
  bias: { label: 'Bias', icon: AlertCircle },
  clarity: { label: 'Clarity', icon: Lightbulb },
  specificity: { label: 'Specificity', icon: Info },
  tone: { label: 'Tone', icon: AlertTriangle },
  length: { label: 'Length', icon: Info },
  behavioral: { label: 'Behavioral', icon: Lightbulb }
};

const severityConfig = {
  error: {
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/30',
    borderClass: 'border-l-destructive'
  },
  warning: {
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400',
    borderClass: 'border-l-amber-500'
  },
  info: {
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
    borderClass: 'border-l-blue-500'
  }
};

export function SuggestionPopover({
  suggestions,
  onAccept,
  onDismiss,
  className
}: SuggestionPopoverProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    suggestions.length === 1 ? 0 : null
  );
  const [dismissedIndexes, setDismissedIndexes] = useState<Set<number>>(new Set());

  if (suggestions.length === 0) return null;

  const visibleSuggestions = suggestions.filter((_, i) => !dismissedIndexes.has(i));
  
  if (visibleSuggestions.length === 0) return null;

  const handleDismiss = (index: number, suggestion: WritingSuggestion) => {
    setDismissedIndexes(prev => new Set([...prev, index]));
    onDismiss(suggestion);
  };

  // Sort by severity
  const sortedSuggestions = [...suggestions]
    .map((s, i) => ({ suggestion: s, originalIndex: i }))
    .filter(({ originalIndex }) => !dismissedIndexes.has(originalIndex))
    .sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return severityOrder[a.suggestion.severity] - severityOrder[b.suggestion.severity];
    });

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="px-3 py-2 bg-muted/50 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Writing Suggestions</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {visibleSuggestions.length}
        </Badge>
      </div>

      <div className="divide-y max-h-[300px] overflow-y-auto">
        {sortedSuggestions.map(({ suggestion, originalIndex }) => {
          const isExpanded = expandedIndex === originalIndex;
          const { label, icon: TypeIcon } = typeLabels[suggestion.type] || typeLabels.clarity;
          const { badgeClass, borderClass } = severityConfig[suggestion.severity];

          return (
            <div
              key={originalIndex}
              className={cn(
                "border-l-4 transition-colors",
                borderClass,
                isExpanded ? "bg-muted/30" : "hover:bg-muted/20"
              )}
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                className="w-full px-3 py-2 flex items-center gap-2 text-left"
              >
                <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs", badgeClass)}>
                      {label}
                    </Badge>
                    {suggestion.originalPhrase && (
                      <span className="text-xs text-muted-foreground truncate">
                        "{suggestion.originalPhrase}"
                      </span>
                    )}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="text-sm bg-primary/5 rounded-md p-2 border border-primary/10">
                    {suggestion.suggestion}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.explanation}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs"
                      onClick={() => onAccept(suggestion)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => handleDismiss(originalIndex, suggestion)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
