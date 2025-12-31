import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  useReviewQualityAssistant,
  ReviewQualityIssue,
  ClarifyingPrompt 
} from '@/hooks/performance/useReviewQualityAssistant';

interface ReviewQualityDashboardProps {
  participantId: string;
  companyId: string;
  onReadinessChange?: (isReady: boolean) => void;
  className?: string;
}

const severityConfig = {
  low: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
  medium: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle },
  high: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertCircle },
};

const issueTypeLabels: Record<ReviewQualityIssue['type'], string> = {
  inconsistent_scoring: 'Inconsistent Scoring',
  missing_evidence: 'Missing Evidence',
  bias_detected: 'Potential Bias',
  vague_comment: 'Vague Comment',
  inflation_risk: 'Inflation Risk',
};

export function ReviewQualityDashboard({
  participantId,
  companyId,
  onReadinessChange,
  className,
}: ReviewQualityDashboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  
  const {
    analyzing,
    assessment,
    analyzeReviewQuality,
    calculateReviewReadiness,
  } = useReviewQualityAssistant();

  useEffect(() => {
    if (participantId && companyId) {
      analyzeReviewQuality(participantId, companyId);
    }
  }, [participantId, companyId, analyzeReviewQuality]);

  useEffect(() => {
    if (assessment && onReadinessChange) {
      onReadinessChange(assessment.isReadyForSubmission);
    }
  }, [assessment, onReadinessChange]);

  const handleRefresh = () => {
    analyzeReviewQuality(participantId, companyId);
  };

  if (analyzing && !assessment) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No review quality data available</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={handleRefresh}>
            Analyze Review Quality
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getOverallStatus = () => {
    if (assessment.qualityScore >= 80) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (assessment.qualityScore >= 60) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (assessment.qualityScore >= 40) return { label: 'Needs Improvement', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { label: 'Poor', color: 'text-destructive', bgColor: 'bg-destructive/10' };
  };

  const status = getOverallStatus();
  const highSeverityIssues = assessment.issues.filter(i => i.severity === 'high');
  const blockers = highSeverityIssues.length;

  return (
    <Card className={cn('relative', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Review Quality Assessment</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              ISO 42001 Compliant
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={analyzing}
            >
              <RefreshCw className={cn("h-4 w-4", analyzing && "animate-spin")} />
            </Button>
          </div>
        </div>
        <CardDescription>
          AI-powered assessment of review quality and completeness
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className={cn("rounded-lg p-4", status.bgColor)}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Quality Score</span>
            <div className="flex items-center gap-2">
              {assessment.isReadyForSubmission ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <Badge className={status.color}>{status.label}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={assessment.qualityScore} className="flex-1 h-2" />
            <span className={cn("text-lg font-bold", status.color)}>
              {assessment.qualityScore}%
            </span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground">
              {assessment.consistencyScore}%
            </div>
            <div className="text-xs text-muted-foreground">Consistency</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground">
              {assessment.evidenceCoverageScore}%
            </div>
            <div className="text-xs text-muted-foreground">Evidence</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground">
              {assessment.biasFreeScore}%
            </div>
            <div className="text-xs text-muted-foreground">Bias-Free</div>
          </div>
        </div>

        {/* Blockers Warning */}
        {blockers > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <span className="text-sm text-destructive font-medium">
              {blockers} blocking issue{blockers > 1 ? 's' : ''} must be resolved before submission
            </span>
          </div>
        )}

        {/* Issues List */}
        {assessment.issues.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>{assessment.issues.length} Issue{assessment.issues.length > 1 ? 's' : ''} Found</span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {assessment.issues.map((issue, idx) => {
                const config = severityConfig[issue.severity];
                const Icon = config.icon;
                return (
                  <div 
                    key={idx} 
                    className={cn("p-3 rounded-lg border", config.color)}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {issueTypeLabels[issue.type]}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-sm">{issue.description}</p>
                        {issue.suggestion && (
                          <p className="text-xs mt-1 opacity-80">
                            💡 {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Clarifying Prompts */}
        {assessment.clarifyingPrompts && assessment.clarifyingPrompts.length > 0 && (
          <Collapsible open={showPrompts} onOpenChange={setShowPrompts}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>Improvement Suggestions</span>
                </div>
                {showPrompts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {assessment.clarifyingPrompts.map((prompt, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm font-medium mb-1">{prompt.question}</p>
                  <p className="text-xs text-muted-foreground">{prompt.suggestedApproach}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* AI Confidence */}
        {assessment.aiConfidenceScore && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            AI Confidence: {Math.round(assessment.aiConfidenceScore * 100)}% • 
            Model: {assessment.aiModelUsed || 'Standard'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
