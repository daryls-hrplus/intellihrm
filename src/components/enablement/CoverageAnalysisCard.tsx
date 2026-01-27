import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  RefreshCw,
  Loader2,
  TrendingUp,
  FileText,
  Rocket,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useDocumentationAgent } from "@/hooks/useDocumentationAgent";

interface CoverageAnalysisCardProps {
  compact?: boolean;
  autoLoad?: boolean;
}

export function CoverageAnalysisCard({ compact = false, autoLoad = true }: CoverageAnalysisCardProps) {
  const { isAnalyzing, coverageAssessment, assessCoverage } = useDocumentationAgent();

  useEffect(() => {
    if (autoLoad && !coverageAssessment) {
      assessCoverage();
    }
  }, [autoLoad, coverageAssessment, assessCoverage]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[hsl(var(--semantic-success-text))]";
    if (score >= 60) return "text-[hsl(var(--semantic-warning-text))]";
    return "text-[hsl(var(--semantic-error-text))]";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-[hsl(var(--semantic-success-bg))]";
    if (score >= 60) return "bg-[hsl(var(--semantic-warning-bg))]";
    return "bg-[hsl(var(--semantic-error-bg))]";
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Documentation Coverage</p>
                <p className="text-sm text-muted-foreground">
                  {coverageAssessment 
                    ? `${coverageAssessment.documented} of ${coverageAssessment.totalFeatures} features`
                    : 'Loading...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {coverageAssessment && (
                <div className={`text-2xl font-bold ${getScoreColor(coverageAssessment.readinessScore)}`}>
                  {coverageAssessment.readinessScore}%
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => assessCoverage()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {coverageAssessment && (
            <Progress 
              value={coverageAssessment.overallCoverage} 
              className="mt-3 h-2" 
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Documentation Coverage Analysis</CardTitle>
              <CardDescription>
                Real-time assessment of documentation completeness
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => assessCoverage()}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isAnalyzing && !coverageAssessment ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : coverageAssessment ? (
          <>
            {/* Readiness Score */}
            <div className={`p-6 rounded-xl ${getScoreBg(coverageAssessment.readinessScore)} text-center`}>
              <p className="text-sm font-medium mb-2">Release Readiness Score</p>
              <p className={`text-5xl font-bold ${getScoreColor(coverageAssessment.readinessScore)}`}>
                {coverageAssessment.readinessScore}%
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {coverageAssessment.readinessScore >= 80 ? (
                  <Badge variant="outline" className="border-[hsl(var(--semantic-success-border))] text-[hsl(var(--semantic-success-text))]">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Release Ready
                  </Badge>
                ) : coverageAssessment.readinessScore >= 60 ? (
                  <Badge variant="outline" className="border-[hsl(var(--semantic-warning-border))] text-[hsl(var(--semantic-warning-text))]">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Almost Ready
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-[hsl(var(--semantic-error-border))] text-[hsl(var(--semantic-error-text))]">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Needs Work
                  </Badge>
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Feature Coverage</span>
                </div>
                <p className="text-2xl font-bold">{coverageAssessment.overallCoverage}%</p>
                <Progress value={coverageAssessment.overallCoverage} className="mt-2 h-1" />
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Features Documented</span>
                </div>
                <p className="text-2xl font-bold">
                  {coverageAssessment.documented}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{coverageAssessment.totalFeatures}
                  </span>
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">KB Articles</span>
                </div>
                <p className="text-2xl font-bold">{coverageAssessment.publishedArticles}</p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Quick Starts</span>
                </div>
                <p className="text-2xl font-bold">{coverageAssessment.publishedQuickstarts}</p>
              </div>
            </div>

            {/* Module Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium">Coverage by Module</h4>
              <div className="grid gap-2">
                {Object.entries(coverageAssessment.moduleBreakdown)
                  .sort(([, a], [, b]) => b.percentage - a.percentage)
                  .slice(0, 8)
                  .map(([code, data]) => (
                    <div key={code} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                      <span className="text-sm font-medium w-32 truncate">{code}</span>
                      <Progress value={data.percentage} className="flex-1 h-2" />
                      <div className="flex items-center gap-2 w-24 justify-end">
                        <span className="text-xs text-muted-foreground">
                          {data.documented}/{data.total}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            data.percentage >= 80 
                              ? 'border-[hsl(var(--semantic-success-border))] text-[hsl(var(--semantic-success-text))]'
                              : data.percentage >= 50
                                ? 'border-[hsl(var(--semantic-warning-border))] text-[hsl(var(--semantic-warning-text))]'
                                : 'border-[hsl(var(--semantic-error-border))] text-[hsl(var(--semantic-error-text))]'
                          }`}
                        >
                          {data.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Click refresh to load coverage analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
