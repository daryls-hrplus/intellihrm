import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { CommentAnalysisResult } from '@/hooks/performance/useCommentAnalyzer';

interface CommentInflationWarningProps {
  analysis: CommentAnalysisResult | null;
  onAcknowledge?: () => void;
  acknowledged?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function CommentInflationWarning({
  analysis,
  onAcknowledge,
  acknowledged = false,
  showDetails = true,
  className,
}: CommentInflationWarningProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!analysis) return null;

  const { inflationScore, consistencyScore, overallAssessment, biasIndicators } = analysis;

  // Don't show warning for good assessments
  if (overallAssessment === 'good' && inflationScore < 40) {
    return null;
  }

  const isCritical = overallAssessment === 'critical';
  const needsAttention = overallAssessment === 'needs_attention';

  const getIcon = () => {
    if (isCritical) return <AlertCircle className="h-4 w-4" />;
    if (needsAttention) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getVariant = (): 'destructive' | 'default' => {
    if (isCritical) return 'destructive';
    return 'default';
  };

  const getMessage = () => {
    if (inflationScore >= 75) {
      return 'This comment may not align with the rating given. High-performing ratings typically require specific, evidence-backed feedback.';
    }
    if (inflationScore >= 50) {
      return 'Consider adding specific examples or evidence to support this rating. Vague comments can undermine the credibility of the evaluation.';
    }
    if (consistencyScore <= 50) {
      return 'The rating may not be consistent with the available evidence. Please review the linked evidence before finalizing.';
    }
    if (biasIndicators.length > 0) {
      return 'Some language in this comment may carry unintended bias. Consider the suggested alternatives for more objective feedback.';
    }
    return 'Please review this feedback for clarity and specificity.';
  };

  return (
    <Alert 
      variant={getVariant()} 
      className={cn(
        'mt-2',
        acknowledged && 'opacity-60',
        className
      )}
    >
      {getIcon()}
      <AlertTitle className="flex items-center gap-2">
        {isCritical ? 'Review Required' : 'Feedback Quality Alert'}
        {acknowledged && (
          <Badge variant="outline" className="text-xs">
            Acknowledged
          </Badge>
        )}
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p className="text-sm">{getMessage()}</p>
        
        {showDetails && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                {isExpanded ? (
                  <>Hide Details <ChevronUp className="ml-1 h-3 w-3" /></>
                ) : (
                  <>Show Details <ChevronDown className="ml-1 h-3 w-3" /></>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant={inflationScore >= 60 ? 'destructive' : 'secondary'}>
                  Comment-Rating Alignment: {100 - inflationScore}%
                </Badge>
                <Badge variant={consistencyScore <= 50 ? 'destructive' : 'secondary'}>
                  Evidence Consistency: {consistencyScore}%
                </Badge>
                {biasIndicators.length > 0 && (
                  <Badge variant="outline">
                    {biasIndicators.length} bias indicator{biasIndicators.length > 1 ? 's' : ''} detected
                  </Badge>
                )}
              </div>
              
              {biasIndicators.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Language concerns:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {biasIndicators.slice(0, 3).map((indicator, idx) => (
                      <li key={idx}>
                        "{indicator.term}" - {indicator.suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {!acknowledged && onAcknowledge && (isCritical || needsAttention) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAcknowledge}
            className="mt-2"
          >
            I've reviewed this feedback
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
