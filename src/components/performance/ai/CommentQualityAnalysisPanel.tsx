import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  FileText,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useManagerCommentAnalysis, StoredCommentAnalysis } from '@/hooks/performance/useManagerCommentAnalysis';

interface CommentQualityAnalysisPanelProps {
  managerId: string;
  companyId: string;
  cycleId?: string;
}

export function CommentQualityAnalysisPanel({ managerId, companyId, cycleId }: CommentQualityAnalysisPanelProps) {
  const { loading, getBatchAnalysis, getQualityDistribution, getIssuesSummary } = useManagerCommentAnalysis();
  const [analyses, setAnalyses] = useState<StoredCommentAnalysis[]>([]);
  const [expandedComment, setExpandedComment] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyses();
  }, [managerId, companyId, cycleId]);

  const loadAnalyses = async () => {
    const data = await getBatchAnalysis(managerId, companyId, cycleId);
    setAnalyses(data);
  };

  const distribution = getQualityDistribution(analyses);
  const issuesSummary = getIssuesSummary(analyses);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-800">Needs Work</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  const totalComments = analyses.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Comments Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quality Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge className="bg-green-100 text-green-800">{distribution.excellent} Excellent</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">{distribution.good} Good</Badge>
              <Badge className="bg-orange-100 text-orange-800">{distribution.needsImprovement} Needs Work</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Common Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {issuesSummary.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">No common issues detected</span>
              </div>
            ) : (
              <div className="space-y-1">
                {issuesSummary.slice(0, 3).map(issue => (
                  <div key={issue.type} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {issue.type.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="secondary">{issue.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comment List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comment-by-Comment Analysis
          </CardTitle>
          <CardDescription>
            Click on a comment to see detailed analysis and suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments analyzed yet</p>
              <p className="text-sm">Comments will appear here after manager submissions</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedComment(
                        expandedComment === analysis.id ? null : analysis.id
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-2">
                            {analysis.commentText || 'No comment text'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {analysis.commentType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {analysis.wordCount} words
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className={`text-lg font-bold ${getScoreColor(analysis.overallQualityScore)}`}>
                            {Math.round(analysis.overallQualityScore)}%
                          </div>
                          {getScoreBadge(analysis.overallQualityScore)}
                        </div>
                      </div>
                    </div>

                    {expandedComment === analysis.id && (
                      <div className="border-t bg-muted/30 p-4 space-y-4">
                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Depth</p>
                            <div className="flex items-center gap-2">
                              <Progress value={analysis.depthScore} className="h-1.5 flex-1" />
                              <span className="text-sm font-medium">{Math.round(analysis.depthScore)}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Specificity</p>
                            <div className="flex items-center gap-2">
                              <Progress value={analysis.specificityScore} className="h-1.5 flex-1" />
                              <span className="text-sm font-medium">{Math.round(analysis.specificityScore)}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Actionability</p>
                            <div className="flex items-center gap-2">
                              <Progress value={analysis.actionabilityScore} className="h-1.5 flex-1" />
                              <span className="text-sm font-medium">{Math.round(analysis.actionabilityScore)}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">AI Confidence</p>
                            <div className="flex items-center gap-2">
                              <Progress value={analysis.aiConfidenceScore} className="h-1.5 flex-1" />
                              <span className="text-sm font-medium">{Math.round(analysis.aiConfidenceScore)}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Quality Indicators */}
                        <div className="flex flex-wrap gap-2">
                          {analysis.evidencePresent && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Has Evidence
                            </Badge>
                          )}
                          {analysis.examplesPresent && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Has Examples
                            </Badge>
                          )}
                          {analysis.forwardLooking && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Forward Looking
                            </Badge>
                          )}
                          {analysis.balancedFeedback && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Balanced
                            </Badge>
                          )}
                        </div>

                        {/* Issues */}
                        {analysis.issuesDetected.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                              Issues Detected
                            </p>
                            <ul className="space-y-1">
                              {analysis.issuesDetected.map((issue, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-orange-500">•</span>
                                  {issue.description}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggestions */}
                        {analysis.improvementSuggestions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium flex items-center gap-2">
                              <Eye className="h-4 w-4 text-blue-500" />
                              Suggestions for Improvement
                            </p>
                            <ul className="space-y-1">
                              {analysis.improvementSuggestions.map((suggestion, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-blue-500">•</span>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
