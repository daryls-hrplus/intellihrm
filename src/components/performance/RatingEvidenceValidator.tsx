import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EvidenceValidationResult } from '@/hooks/performance/useCommentAnalyzer';

interface RatingEvidenceValidatorProps {
  validation: EvidenceValidationResult | null;
  loading?: boolean;
  rating?: number;
  className?: string;
}

export function RatingEvidenceValidator({
  validation,
  loading = false,
  rating,
  className,
}: RatingEvidenceValidatorProps) {
  if (loading) {
    return (
      <div className={cn('inline-flex items-center', className)}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!validation) return null;

  const { consistencyScore, recommendation, evidenceSummary } = validation;
  const { totalEvidence, validatedEvidence, evidenceTypes } = evidenceSummary;

  const getIcon = () => {
    switch (recommendation) {
      case 'consistent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'review_needed':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'inconsistent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMessage = () => {
    if (totalEvidence === 0 && rating && rating >= 4) {
      return 'High rating with no supporting evidence. Consider adding evidence to support this evaluation.';
    }
    if (totalEvidence === 0) {
      return 'No evidence attached. Consider linking supporting documents or feedback.';
    }
    if (validatedEvidence === 0 && rating && rating >= 4) {
      return `${totalEvidence} evidence item(s) attached but none validated. Validation strengthens credibility.`;
    }
    if (recommendation === 'inconsistent') {
      return `Evidence may not support this rating. ${validatedEvidence} of ${totalEvidence} items validated.`;
    }
    if (recommendation === 'review_needed') {
      return `Rating alignment could be improved. ${validatedEvidence} of ${totalEvidence} items validated.`;
    }
    return `Rating well-supported by ${validatedEvidence} validated evidence item(s) across ${evidenceTypes.length} category type(s).`;
  };

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (recommendation) {
      case 'consistent':
        return 'default';
      case 'review_needed':
        return 'secondary';
      case 'inconsistent':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex items-center gap-1.5 cursor-help', className)}>
            {getIcon()}
            <Badge variant={getBadgeVariant()} className="text-xs">
              {consistencyScore}%
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium text-sm">Evidence Consistency</p>
            <p className="text-xs text-muted-foreground">{getMessage()}</p>
            {totalEvidence > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {evidenceTypes.map((type, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs capitalize">
                    {type.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
