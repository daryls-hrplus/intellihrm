import React from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { BatchAnalysisResult, CommentAnalysisResult } from '@/hooks/performance/useCommentAnalyzer';

interface AppraisalAIAnalysisSummaryProps {
  batchResult?: BatchAnalysisResult | null;
  singleResult?: CommentAnalysisResult | null;
  loading?: boolean;
  onAnalyze?: () => void;
  className?: string;
}

export function AppraisalAIAnalysisSummary({
  batchResult,
  singleResult,
  loading = false,
  onAnalyze,
  className,
}: AppraisalAIAnalysisSummaryProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Use batch summary or derive from single result
  const summary = batchResult?.summary || (singleResult ? {
    avgInflation: singleResult.inflationScore,
    avgConsistency: singleResult.consistencyScore,
    totalBiasIssues: singleResult.biasIndicators.length,
  } : null);

  const results = batchResult?.results || (singleResult ? [singleResult] : []);

  const getOverallStatus = () => {
    if (!summary) return 'unknown';
    if (summary.avgInflation >= 60 || summary.avgConsistency <= 40 || summary.totalBiasIssues >= 3) {
      return 'critical';
    }
    if (summary.avgInflation >= 40 || summary.avgConsistency <= 60 || summary.totalBiasIssues >= 1) {
      return 'needs_attention';
    }
    return 'good';
  };

  const status = getOverallStatus();

  const statusConfig = {
    good: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      label: 'Good Quality',
    },
    needs_attention: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      label: 'Review Recommended',
    },
    critical: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
      label: 'Review Required',
    },
    unknown: {
      icon: Brain,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      label: 'Not Analyzed',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  if (!summary && !loading && onAnalyze) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">AI Feedback Quality Analysis</p>
              <p className="text-xs text-muted-foreground">
                Analyze comments for consistency, bias, and alignment
              </p>
            </div>
          </div>
          <Button onClick={onAnalyze} size="sm" variant="outline">
            Run Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={cn(className)}>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Analyzing feedback quality...</span>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <Card className={cn(config.bgColor, 'border', className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <StatusIcon className={cn('h-4 w-4', config.color)} />
              AI Feedback Quality Analysis
              <Badge variant={status === 'good' ? 'default' : status === 'critical' ? 'destructive' : 'secondary'}>
                {config.label}
              </Badge>
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription className="text-xs">
            {results.length} comment{results.length !== 1 ? 's' : ''} analyzed
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Comment-Rating Alignment</span>
                <span className="font-medium">{100 - summary.avgInflation}%</span>
              </div>
              <Progress 
                value={100 - summary.avgInflation} 
                className="h-1.5"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Evidence Consistency</span>
                <span className="font-medium">{summary.avgConsistency}%</span>
              </div>
              <Progress 
                value={summary.avgConsistency} 
                className="h-1.5"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Bias Issues</span>
                <span className="font-medium">{summary.totalBiasIssues}</span>
              </div>
              <div className="flex gap-0.5">
                {[...Array(Math.min(5, summary.totalBiasIssues))].map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-red-500" />
                ))}
                {[...Array(Math.max(0, 5 - summary.totalBiasIssues))].map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-muted" />
                ))}
              </div>
            </div>
          </div>

          <CollapsibleContent className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium">Detailed Findings</p>
            {results.filter(r => r.overallAssessment !== 'good').length === 0 ? (
              <p className="text-xs text-muted-foreground">
                All comments passed quality checks. No issues detected.
              </p>
            ) : (
              <div className="space-y-2">
                {results
                  .filter(r => r.overallAssessment !== 'good')
                  .slice(0, 5)
                  .map((result, idx) => (
                    <div 
                      key={idx} 
                      className="text-xs p-2 rounded bg-background/50 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={result.overallAssessment === 'critical' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {result.overallAssessment === 'critical' ? 'Critical' : 'Needs Review'}
                        </Badge>
                        {result.inflationScore >= 50 && (
                          <span className="text-muted-foreground">
                            {result.inflationScore}% inflation risk
                          </span>
                        )}
                      </div>
                      {result.biasIndicators.length > 0 && (
                        <p className="text-muted-foreground">
                          Bias concerns: {result.biasIndicators.map(b => `"${b.term}"`).join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
