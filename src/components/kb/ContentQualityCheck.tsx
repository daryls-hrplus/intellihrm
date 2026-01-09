import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Sparkles,
  FileSearch
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QualityIssue {
  sectionId: string;
  sectionTitle: string;
  severity: 'error' | 'warning' | 'info';
  type: string;
  message: string;
  suggestion?: string;
}

interface QualityResult {
  score: number;
  status: 'pass' | 'warning' | 'fail';
  totalSections: number;
  issues: QualityIssue[];
  summary: string;
}

interface Section {
  id: string;
  title: string;
  content: string;
}

interface ContentQualityCheckProps {
  sections: Section[];
  manualName: string;
  onComplete?: (result: QualityResult) => void;
  autoRun?: boolean;
}

export function ContentQualityCheck({ 
  sections, 
  manualName, 
  onComplete,
  autoRun = true 
}: ContentQualityCheckProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QualityResult | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (autoRun && sections.length > 0 && !result) {
      runQualityCheck();
    }
  }, [sections, autoRun]);

  const runQualityCheck = async () => {
    if (sections.length === 0) {
      toast({
        title: "No sections to analyze",
        description: "Please select sections to publish first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-publishing-quality', {
        body: { sections, manualName }
      });

      if (error) throw error;

      setResult(data);
      onComplete?.(data);
    } catch (error) {
      console.error('Quality check failed:', error);
      toast({
        title: "Quality check failed",
        description: error instanceof Error ? error.message : "Unable to analyze content quality",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIssue = (issueKey: string) => {
    setExpandedIssues(prev => {
      const next = new Set(prev);
      if (next.has(issueKey)) {
        next.delete(issueKey);
      } else {
        next.add(issueKey);
      }
      return next;
    });
  };

  const getStatusIcon = (status: QualityResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-6 w-6 text-destructive" />;
    }
  };

  const getSeverityIcon = (severity: QualityIssue['severity']) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: QualityIssue['severity']) => {
    switch (severity) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Warning</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-destructive';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <FileSearch className="h-12 w-12 text-muted-foreground animate-pulse" />
              <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1 animate-bounce" />
            </div>
            <div className="text-center">
              <p className="font-medium">Analyzing content quality...</p>
              <p className="text-sm text-muted-foreground">
                Checking {sections.length} sections for issues
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <FileSearch className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Content Quality Check</p>
              <p className="text-sm text-muted-foreground mb-4">
                Run an AI-powered quality analysis before publishing
              </p>
              <Button onClick={runQualityCheck}>
                <Sparkles className="h-4 w-4 mr-2" />
                Run Quality Check
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const errorCount = result.issues.filter(i => i.severity === 'error').length;
  const warningCount = result.issues.filter(i => i.severity === 'warning').length;
  const infoCount = result.issues.filter(i => i.severity === 'info').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {getStatusIcon(result.status)}
            Content Quality Check
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={runQualityCheck}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Re-check
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score and Summary */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </div>
              <div className="text-xs text-muted-foreground">Quality Score</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-sm font-medium">{result.summary}</p>
              <p className="text-xs text-muted-foreground">
                {result.totalSections} sections analyzed
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive">{errorCount} errors</Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                {warningCount} warnings
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="secondary">{infoCount} suggestions</Badge>
            )}
          </div>
        </div>

        {/* Issues List */}
        {result.issues.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Issues Found:</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {result.issues.map((issue, index) => {
                const issueKey = `${issue.sectionId}-${index}`;
                const isExpanded = expandedIssues.has(issueKey);
                
                return (
                  <Collapsible key={issueKey} open={isExpanded} onOpenChange={() => toggleIssue(issueKey)}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="mt-0.5">
                          {getSeverityIcon(issue.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {issue.sectionTitle}
                            </span>
                            {getSeverityBadge(issue.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {issue.message}
                          </p>
                        </div>
                        <div className="text-muted-foreground">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {issue.suggestion && (
                        <div className="ml-7 mt-2 p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                          <p className="text-xs font-medium text-primary mb-1">Suggestion:</p>
                          <p className="text-sm">{issue.suggestion}</p>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">All checks passed! Content is ready to publish.</span>
          </div>
        )}

        {/* Warning for proceeding with issues */}
        {result.status !== 'pass' && (
          <p className="text-xs text-muted-foreground italic">
            You can still publish with warnings or suggestions. Errors should be addressed before publishing.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
