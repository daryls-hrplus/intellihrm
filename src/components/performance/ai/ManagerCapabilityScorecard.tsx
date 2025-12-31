import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  MessageSquare, 
  BarChart3, 
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Brain
} from 'lucide-react';
import { useManagerCapabilityMetrics, CapabilityMetrics, CoachingRecommendation } from '@/hooks/performance/useManagerCapabilityMetrics';
import { CommentQualityAnalysisPanel } from './CommentQualityAnalysisPanel';
import { supabase } from '@/integrations/supabase/client';

interface ManagerCapabilityScorecardProps {
  managerId: string;
  companyId: string;
  cycleId?: string;
}

export function ManagerCapabilityScorecard({ managerId, companyId, cycleId }: ManagerCapabilityScorecardProps) {
  const { 
    loading, 
    metrics, 
    recommendations,
    calculateMetrics, 
    fetchCapabilityScorecard,
    getCoachingRecommendations 
  } = useManagerCapabilityMetrics();
  
  const [managerName, setManagerName] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [managerId, companyId, cycleId]);

  const loadData = async () => {
    // Fetch manager name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', managerId)
      .single();
    
    if (profile) {
      setManagerName(profile.full_name || 'Unknown');
    }

    // Try to fetch existing scorecard first
    const existing = await fetchCapabilityScorecard(managerId, companyId);
    if (!existing) {
      // Calculate if no existing data
      await calculateMetrics(managerId, companyId, cycleId);
    }
    
    // Always get coaching recommendations
    await getCoachingRecommendations(managerId, companyId, cycleId);
  };

  const handleRefresh = async () => {
    await calculateMetrics(managerId, companyId, cycleId);
    await getCoachingRecommendations(managerId, companyId, cycleId);
  };

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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High Priority</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
      default: return <Badge variant="secondary">Low Priority</Badge>;
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{managerName}</h2>
          <p className="text-muted-foreground">Manager Capability Scorecard</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Capability Score</p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-4xl font-bold ${getScoreColor(metrics?.overallCapabilityScore || 0)}`}>
                  {Math.round(metrics?.overallCapabilityScore || 0)}%
                </span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metrics?.capabilityTrend)}
                  <span className="text-sm text-muted-foreground capitalize">
                    {metrics?.capabilityTrend || 'stable'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last calculated</p>
              <p className="text-sm">
                {metrics?.calculatedAt 
                  ? new Date(metrics.calculatedAt).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Four Quadrant Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Timeliness
            </CardTitle>
            <CardDescription>Review completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics?.timelinessScore || 0)}`}>
              {Math.round(metrics?.timelinessScore || 0)}%
            </div>
            <Progress 
              value={metrics?.timelinessScore || 0} 
              className="mt-2 h-2"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {metrics?.breakdown?.timeliness?.reviewsOnTime || 0} of {metrics?.breakdown?.timeliness?.totalReviewsAssigned || 0} on time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-600" />
              Comment Quality
            </CardTitle>
            <CardDescription>Feedback depth & clarity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics?.commentQualityScore || 0)}`}>
              {Math.round(metrics?.commentQualityScore || 0)}%
            </div>
            <Progress 
              value={metrics?.commentQualityScore || 0} 
              className="mt-2 h-2"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {metrics?.breakdown?.commentQuality?.commentsWithEvidence || 0} comments with evidence
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              Differentiation
            </CardTitle>
            <CardDescription>Score distribution variance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics?.differentiationScore || 0)}`}>
              {Math.round(metrics?.differentiationScore || 0)}%
            </div>
            <Progress 
              value={metrics?.differentiationScore || 0} 
              className="mt-2 h-2"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Avg: {metrics?.breakdown?.scoreVariance?.avgScore?.toFixed(1) || 'N/A'}, 
              StdDev: {metrics?.breakdown?.scoreVariance?.stdDeviation?.toFixed(2) || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              Calibration Alignment
            </CardTitle>
            <CardDescription>Agreement with final scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics?.calibrationAlignmentScore || 0)}`}>
              {Math.round(metrics?.calibrationAlignmentScore || 0)}%
            </div>
            <Progress 
              value={metrics?.calibrationAlignmentScore || 0} 
              className="mt-2 h-2"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Lower adjustment = better alignment
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Details */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Coaching Recommendations</TabsTrigger>
          <TabsTrigger value="comments">Comment Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="font-medium">Great job!</p>
                <p className="text-muted-foreground">
                  No specific improvement areas identified at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            recommendations.map((rec, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      <CardTitle className="text-base">{rec.title}</CardTitle>
                    </div>
                    {getPriorityBadge(rec.priority)}
                  </div>
                  <CardDescription>{rec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">Action Items:</p>
                  <ul className="space-y-2">
                    {rec.actionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="comments">
          <CommentQualityAnalysisPanel 
            managerId={managerId} 
            companyId={companyId}
            cycleId={cycleId}
          />
        </TabsContent>
      </Tabs>

      {/* ISO 42001 Explainability Footer */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">AI Transparency (ISO 42001)</p>
              <p className="text-muted-foreground">
                Scores are calculated using rule-based analysis with 85% confidence. 
                Timeliness (25%), Comment Quality (30%), Differentiation (20%), and 
                Calibration Alignment (25%) contribute to the overall score.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
