import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Target,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import analytics hooks
import { useGoalCompletionRates } from "@/hooks/performance/useGoalCompletionRates";
import { useGoalQualityMetrics } from "@/hooks/performance/useGoalQualityMetrics";
import { useAlignmentAnalytics } from "@/hooks/performance/useAlignmentAnalytics";
import { useEmployeeWorkload } from "@/hooks/performance/useEmployeeWorkload";

interface KeyInsightsAIPanelProps {
  companyId?: string;
}

interface AIInsight {
  type: 'risk' | 'trend' | 'recommendation';
  severity?: 'critical' | 'warning' | 'info';
  trend?: 'up' | 'down' | 'stable';
  title: string;
  description: string;
  metric?: string;
  action?: string;
}

interface InsightsData {
  risks: AIInsight[];
  trends: AIInsight[];
  recommendations: AIInsight[];
  generatedAt: string;
}

export function KeyInsightsAIPanel({ companyId }: KeyInsightsAIPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const { data: completionData, isLoading: loadingCompletion } = useGoalCompletionRates(companyId);
  const { data: qualityData, isLoading: loadingQuality } = useGoalQualityMetrics(companyId);
  const { data: alignmentData, isLoading: loadingAlignment } = useAlignmentAnalytics(companyId);
  const { data: workloadData, isLoading: loadingWorkload } = useEmployeeWorkload(companyId);

  const isLoadingData = loadingCompletion || loadingQuality || loadingAlignment || loadingWorkload;

  const generateInsights = async () => {
    if (!companyId) return;

    setIsGenerating(true);
    setError(null);

    try {
      const metricsData = {
        completionRate: completionData?.overallCompletionRate || 0,
        totalGoals: completionData?.totalGoals || 0,
        completedGoals: completionData?.completedGoals || 0,
        inProgressGoals: completionData?.inProgressGoals || 0,
        qualityScore: qualityData?.avgQualityScore || 0,
        lowQualityGoals: qualityData?.lowQualityGoals?.length || 0,
        alignmentRate: alignmentData?.companyAlignmentPercentage || 0,
        brokenChains: alignmentData?.brokenChains || 0,
        orphanGoals: alignmentData?.orphanGoals || 0,
        overloadedEmployees: workloadData?.overloadedCount || 0,
        warningEmployees: workloadData?.warningCount || 0,
        healthyEmployees: workloadData?.healthyCount || 0,
        totalEmployees: workloadData?.totalEmployees || 0,
        avgWorkloadScore: workloadData?.avgWorkloadScore || 0,
        departmentBreakdown: completionData?.byDepartment || [],
      };

      const { data, error: fnError } = await supabase.functions.invoke('generate-key-insights', {
        body: { metricsData }
      });

      if (fnError) throw fnError;

      if (data?.insights) {
        setInsights(data.insights);
      } else {
        // Fallback to local generation
        setInsights(generateLocalInsights(metricsData));
      }
    } catch (err) {
      console.error("Error generating insights:", err);
      // Use local fallback
      const metricsData = {
        completionRate: completionData?.overallCompletionRate || 0,
        totalGoals: completionData?.totalGoals || 0,
        completedGoals: completionData?.completedGoals || 0,
        inProgressGoals: completionData?.inProgressGoals || 0,
        qualityScore: qualityData?.avgQualityScore || 0,
        lowQualityGoals: qualityData?.lowQualityGoals?.length || 0,
        alignmentRate: alignmentData?.companyAlignmentPercentage || 0,
        brokenChains: alignmentData?.brokenChains || 0,
        orphanGoals: alignmentData?.orphanGoals || 0,
        overloadedEmployees: workloadData?.overloadedCount || 0,
        warningEmployees: workloadData?.warningCount || 0,
        healthyEmployees: workloadData?.healthyCount || 0,
        totalEmployees: workloadData?.totalEmployees || 0,
        avgWorkloadScore: workloadData?.avgWorkloadScore || 0,
      };
      setInsights(generateLocalInsights(metricsData));
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate insights when data loads
  useEffect(() => {
    if (companyId && !isLoadingData && !insights && !isGenerating) {
      generateInsights();
    }
  }, [companyId, isLoadingData]);

  if (!companyId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          Select a company to view AI insights
        </CardContent>
      </Card>
    );
  }

  if (isLoadingData || isGenerating) {
    return <InsightsPanelSkeleton />;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 shadow-lg">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Key Insights
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Brain className="h-3 w-3" />
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription>
                Critical risks, trends, and recommendations across all analytics
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={isGenerating}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {insights ? (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Critical Risks */}
            <InsightColumn
              title="Critical Risks"
              icon={AlertTriangle}
              iconColor="text-destructive"
              bgColor="bg-destructive/5"
              items={insights.risks}
            />

            {/* Trending Metrics */}
            <InsightColumn
              title="Trending Metrics"
              icon={TrendingUp}
              iconColor="text-blue-500"
              bgColor="bg-blue-500/5"
              items={insights.trends}
            />

            {/* Recommendations */}
            <InsightColumn
              title="Recommendations"
              icon={Lightbulb}
              iconColor="text-amber-500"
              bgColor="bg-amber-500/5"
              items={insights.recommendations}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No insights available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InsightColumn({ 
  title, 
  icon: Icon, 
  iconColor, 
  bgColor,
  items 
}: { 
  title: string; 
  icon: React.ElementType; 
  iconColor: string;
  bgColor: string;
  items: AIInsight[];
}) {
  return (
    <div className="flex flex-col">
      <div className={cn("flex items-center gap-2 px-4 py-3 border-b", bgColor)}>
        <Icon className={cn("h-4 w-4", iconColor)} />
        <span className="font-medium text-sm">{title}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {items.length}
        </Badge>
      </div>
      <div className="flex-1 p-4 space-y-3 max-h-[320px] overflow-y-auto">
        {items.length > 0 ? (
          items.map((item, index) => (
            <InsightCard key={index} insight={item} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No {title.toLowerCase()} detected
          </p>
        )}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: AIInsight }) {
  const getSeverityStyles = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'border-destructive/30 bg-destructive/5';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/5';
      default:
        return 'border-border bg-muted/30';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-3 w-3 text-destructive" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
      case 'trend':
        return <TrendingUp className="h-3.5 w-3.5 text-blue-500" />;
      case 'recommendation':
        return <Lightbulb className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "rounded-lg border p-3 transition-colors hover:bg-accent/50",
      getSeverityStyles(insight.severity)
    )}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{getTypeIcon(insight.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{insight.title}</span>
            {insight.trend && getTrendIcon(insight.trend)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {insight.description}
          </p>
          {insight.metric && (
            <Badge variant="outline" className="mt-2 text-xs font-mono">
              {insight.metric}
            </Badge>
          )}
          {insight.action && (
            <p className="text-xs text-primary mt-2 font-medium">
              → {insight.action}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InsightsPanelSkeleton() {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Local fallback insight generation
function generateLocalInsights(metrics: Record<string, any>): InsightsData {
  const risks: AIInsight[] = [];
  const trends: AIInsight[] = [];
  const recommendations: AIInsight[] = [];

  // Analyze risks
  if (metrics.overloadedEmployees > 0) {
    risks.push({
      type: 'risk',
      severity: metrics.overloadedEmployees > 5 ? 'critical' : 'warning',
      title: 'Employee Overload',
      description: `${metrics.overloadedEmployees} employees have excessive workload and may be at risk of burnout.`,
      metric: `${metrics.overloadedEmployees} overloaded`,
      action: 'Review workload distribution'
    });
  }

  if (metrics.lowQualityGoals > 0) {
    risks.push({
      type: 'risk',
      severity: metrics.lowQualityGoals > 10 ? 'critical' : 'warning',
      title: 'Goal Quality Issues',
      description: `${metrics.lowQualityGoals} goals have been flagged for quality concerns and need review.`,
      metric: `${metrics.lowQualityGoals} flagged`,
      action: 'Improve goal definitions'
    });
  }

  if (metrics.brokenChains > 0) {
    risks.push({
      type: 'risk',
      severity: metrics.brokenChains > 5 ? 'warning' : 'info',
      title: 'Broken Alignment Chains',
      description: `${metrics.brokenChains} goal alignment chains are broken, affecting strategic cascade.`,
      metric: `${metrics.brokenChains} chains`,
      action: 'Repair alignment links'
    });
  }

  // Analyze trends
  trends.push({
    type: 'trend',
    trend: metrics.completionRate >= 70 ? 'up' : metrics.completionRate >= 40 ? 'stable' : 'down',
    title: 'Goal Completion',
    description: `Overall goal completion rate is ${metrics.completionRate?.toFixed(1)}% across the organization.`,
    metric: `${metrics.completionRate?.toFixed(1)}%`
  });

  trends.push({
    type: 'trend',
    trend: metrics.qualityScore >= 75 ? 'up' : metrics.qualityScore >= 50 ? 'stable' : 'down',
    title: 'Goal Quality Score',
    description: `Average goal quality score indicates ${metrics.qualityScore >= 75 ? 'strong' : metrics.qualityScore >= 50 ? 'moderate' : 'weak'} goal setting practices.`,
    metric: `${metrics.qualityScore?.toFixed(1)}/100`
  });

  trends.push({
    type: 'trend',
    trend: metrics.alignmentRate >= 80 ? 'up' : metrics.alignmentRate >= 60 ? 'stable' : 'down',
    title: 'Strategic Alignment',
    description: `${metrics.alignmentRate?.toFixed(1)}% of goals are properly aligned to company objectives.`,
    metric: `${metrics.alignmentRate?.toFixed(1)}%`
  });

  // Generate recommendations
  if (metrics.completionRate < 60) {
    recommendations.push({
      type: 'recommendation',
      title: 'Boost Goal Completion',
      description: 'Consider implementing weekly check-ins and breaking down large goals into smaller milestones.',
      action: 'Schedule goal review sessions'
    });
  }

  if (metrics.alignmentRate < 70) {
    recommendations.push({
      type: 'recommendation',
      title: 'Improve Goal Alignment',
      description: 'Run alignment workshops to ensure team goals connect to company OKRs.',
      action: 'Cascade company objectives'
    });
  }

  if (metrics.overloadedEmployees / (metrics.totalEmployees || 1) > 0.1) {
    recommendations.push({
      type: 'recommendation',
      title: 'Redistribute Workload',
      description: 'Consider redistributing goals from overloaded employees to maintain healthy performance.',
      action: 'Balance team capacity'
    });
  }

  if (metrics.qualityScore < 60) {
    recommendations.push({
      type: 'recommendation',
      title: 'Goal Writing Training',
      description: 'Provide SMART goal training to improve goal clarity and measurability.',
      action: 'Schedule training sessions'
    });
  }

  // Ensure at least one item in each category
  if (risks.length === 0) {
    risks.push({
      type: 'risk',
      severity: 'info',
      title: 'No Critical Risks',
      description: 'No major performance risks detected. Continue monitoring key metrics.',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'recommendation',
      title: 'Maintain Momentum',
      description: 'Performance metrics look healthy. Focus on sustaining current practices.',
      action: 'Continue monitoring'
    });
  }

  return {
    risks,
    trends,
    recommendations,
    generatedAt: new Date().toISOString()
  };
}
