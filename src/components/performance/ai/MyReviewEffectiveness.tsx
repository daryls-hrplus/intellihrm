import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  MessageSquare, 
  BarChart3, 
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useManagerCapabilityMetrics, CoachingRecommendation } from '@/hooks/performance/useManagerCapabilityMetrics';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MyReviewEffectivenessProps {
  managerId: string;
  companyId: string;
  cycleId?: string;
  showDetailedBreakdown?: boolean;
}

export function MyReviewEffectiveness({ 
  managerId, 
  companyId, 
  cycleId,
  showDetailedBreakdown = false 
}: MyReviewEffectivenessProps) {
  const { 
    loading, 
    metrics, 
    recommendations,
    fetchCapabilityScorecard,
    getCoachingRecommendations 
  } = useManagerCapabilityMetrics();

  useEffect(() => {
    fetchCapabilityScorecard(managerId, companyId);
    getCoachingRecommendations(managerId, companyId, cycleId);
  }, [managerId, companyId, cycleId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">On Track</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-800">Attention Needed</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  if (loading && !metrics) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Review Effectiveness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete your reviews to see effectiveness metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Compact view for sidebar
  if (!showDetailedBreakdown) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Review Quality
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Your review quality is assessed based on timeliness, 
                    comment depth, and alignment with calibration outcomes.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getScoreColor(metrics.overallCapabilityScore)}`}>
                {Math.round(metrics.overallCapabilityScore)}%
              </span>
              {getTrendIcon(metrics.capabilityTrend)}
            </div>
            {getStatusBadge(metrics.overallCapabilityScore)}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Timeliness
              </span>
              <span className={getScoreColor(metrics.timelinessScore)}>
                {Math.round(metrics.timelinessScore)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Comment Quality
              </span>
              <span className={getScoreColor(metrics.commentQualityScore)}>
                {Math.round(metrics.commentQualityScore)}%
              </span>
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs font-medium flex items-center gap-1 mb-2">
                <Lightbulb className="h-3 w-3 text-amber-500" />
                Quick Tip
              </p>
              <p className="text-xs text-muted-foreground">
                {recommendations[0]?.actionItems[0] || 'Keep up the good work!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Detailed view
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            My Review Effectiveness
          </CardTitle>
          <CardDescription>
            Track your performance review quality and get personalized coaching suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${getScoreColor(metrics.overallCapabilityScore)}`}>
                  {Math.round(metrics.overallCapabilityScore)}%
                </span>
                {getTrendIcon(metrics.capabilityTrend)}
              </div>
            </div>
            {getStatusBadge(metrics.overallCapabilityScore)}
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Timeliness
                </span>
                <span className={`font-medium ${getScoreColor(metrics.timelinessScore)}`}>
                  {Math.round(metrics.timelinessScore)}%
                </span>
              </div>
              <Progress value={metrics.timelinessScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  Comment Quality
                </span>
                <span className={`font-medium ${getScoreColor(metrics.commentQualityScore)}`}>
                  {Math.round(metrics.commentQualityScore)}%
                </span>
              </div>
              <Progress value={metrics.commentQualityScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  Differentiation
                </span>
                <span className={`font-medium ${getScoreColor(metrics.differentiationScore)}`}>
                  {Math.round(metrics.differentiationScore)}%
                </span>
              </div>
              <Progress value={metrics.differentiationScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <Target className="h-4 w-4 text-orange-600" />
                  Alignment
                </span>
                <span className={`font-medium ${getScoreColor(metrics.calibrationAlignmentScore)}`}>
                  {Math.round(metrics.calibrationAlignmentScore)}%
                </span>
              </div>
              <Progress value={metrics.calibrationAlignmentScore} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coaching Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                <p className="font-medium text-sm">{rec.title}</p>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                <ul className="space-y-1 mt-2">
                  {rec.actionItems.slice(0, 2).map((item, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-primary mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
