import React from 'react';
import { Lightbulb, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { BiasIndicator, SuggestedAlternative } from '@/hooks/performance/useCommentAnalyzer';

interface NeutralAlternativeSuggesterProps {
  biasIndicators: BiasIndicator[];
  suggestedAlternatives: SuggestedAlternative[];
  onApplyAlternative?: (original: string, alternative: string) => void;
  className?: string;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  gender_coded: { label: 'Gender-Coded', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  age_coded: { label: 'Age-Related', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  racial_coded: { label: 'Racial Undertones', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  vague_bias: { label: 'Vague/Subjective', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  conditional_praise: { label: 'Conditional Praise', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
};

const severityColors = {
  low: 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950',
  medium: 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950',
  high: 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950',
};

export function NeutralAlternativeSuggester({
  biasIndicators,
  suggestedAlternatives,
  onApplyAlternative,
  className,
}: NeutralAlternativeSuggesterProps) {
  if (biasIndicators.length === 0 && suggestedAlternatives.length === 0) {
    return null;
  }

  return (
    <Card className={cn('border-dashed', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Inclusive Language Suggestions
        </CardTitle>
        <CardDescription className="text-xs">
          Consider these alternatives for more objective, bias-free feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestedAlternatives.map((alt, idx) => {
          const indicator = biasIndicators.find(b => b.term.toLowerCase() === alt.original.toLowerCase());
          const category = indicator ? categoryLabels[indicator.category] : null;
          const severity = indicator?.severity || 'low';

          return (
            <div 
              key={idx} 
              className={cn(
                'rounded-md border p-3 space-y-2',
                severityColors[severity]
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm line-through opacity-70">
                    "{alt.original}"
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-sm text-primary">
                    "{alt.alternative}"
                  </span>
                </div>
                {onApplyAlternative && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => onApplyAlternative(alt.original, alt.alternative)}
                        >
                          Apply
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Replace in your comment</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {category && (
                  <Badge variant="outline" className={cn('text-xs', category.color)}>
                    {category.label}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {severity} severity
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {alt.reason}
              </p>
            </div>
          );
        })}

        <div className="pt-2 border-t">
          <a 
            href="https://docs.lovable.dev/features/inclusive-language" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            Learn more about inclusive language in performance reviews
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
