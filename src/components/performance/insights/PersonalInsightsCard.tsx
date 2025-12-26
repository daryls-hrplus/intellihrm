import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  Target, 
  AlertTriangle, 
  TrendingUp,
  Network,
  Gauge
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

interface PersonalInsightsCardProps {
  employeeId: string;
  companyId: string | undefined;
}

export function PersonalInsightsCard({ employeeId, companyId }: PersonalInsightsCardProps) {
  const { t } = useLanguage();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['personal-performance-insights', employeeId, companyId],
    queryFn: async () => {
      // Fetch employee's goals
      const { data: goals, error } = await supabase
        .from('performance_goals')
        .select('*')
        .eq('employee_id', employeeId)
        .not('status', 'eq', 'cancelled');

      if (error) throw error;

      const activeGoals = goals?.filter(g => g.status === 'active' || g.status === 'in_progress') || [];
      const completedGoals = goals?.filter(g => g.status === 'completed') || [];
      const totalGoals = goals?.length || 0;

      // Calculate quality score based on goal attributes
      let qualityScore = 0;
      let alignedCount = 0;
      let totalWeighting = 0;

      activeGoals.forEach(goal => {
        let goalQuality = 0;
        
        // Has metrics (25 points)
        if (goal.target_value && goal.unit_of_measure) goalQuality += 25;
        
        // Has SMART criteria (25 points) - check for key fields
        if (goal.specific && goal.measurable && goal.achievable && 
            goal.relevant && goal.time_bound) goalQuality += 25;
        else if (goal.due_date && goal.description) goalQuality += 15;
        
        // Has alignment (25 points)
        if (goal.parent_goal_id) {
          goalQuality += 25;
          alignedCount++;
        }
        
        // Reasonable weighting (25 points)
        if (goal.weighting && goal.weighting > 0 && goal.weighting <= 50) goalQuality += 25;
        
        qualityScore += goalQuality;
        totalWeighting += goal.weighting || 0;
      });

      const avgQualityScore = activeGoals.length > 0 ? Math.round(qualityScore / activeGoals.length) : 0;
      const alignmentPercentage = activeGoals.length > 0 ? Math.round((alignedCount / activeGoals.length) * 100) : 0;

      // Calculate workload status
      let workloadStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (totalWeighting > 150) workloadStatus = 'critical';
      else if (totalWeighting > 100) workloadStatus = 'warning';

      // Calculate completion rate
      const completionRate = totalGoals > 0 ? Math.round((completedGoals.length / totalGoals) * 100) : 0;

      return {
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        totalGoals,
        avgQualityScore,
        alignmentPercentage,
        totalWeighting,
        workloadStatus,
        completionRate,
      };
    },
    enabled: !!employeeId && !!companyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  const getWorkloadBadge = () => {
    switch (insights.workloadStatus) {
      case 'critical':
        return <Badge variant="destructive">Overloaded</Badge>;
      case 'warning':
        return <Badge className="bg-warning/10 text-warning border-warning/20">High</Badge>;
      default:
        return <Badge className="bg-success/10 text-success border-success/20">Healthy</Badge>;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 75) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t("performance.insights.personalSummary") || "Your Performance Insights"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Quality Score */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              Goal Quality
            </div>
            <div className={`text-2xl font-bold ${getQualityColor(insights.avgQualityScore)}`}>
              {insights.avgQualityScore}%
            </div>
            <Progress value={insights.avgQualityScore} className="h-1.5" />
          </div>

          {/* Workload */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gauge className="h-4 w-4" />
              Workload
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{insights.totalWeighting}%</span>
              {getWorkloadBadge()}
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.activeGoals} active goals
            </p>
          </div>

          {/* Alignment */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Network className="h-4 w-4" />
              Alignment
            </div>
            <div className={`text-2xl font-bold ${getQualityColor(insights.alignmentPercentage)}`}>
              {insights.alignmentPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              Goals linked to objectives
            </p>
          </div>

          {/* Completion Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Completion Rate
            </div>
            <div className="text-2xl font-bold">{insights.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {insights.completedGoals} of {insights.totalGoals} goals
            </p>
          </div>
        </div>

        {/* Alerts */}
        {(insights.workloadStatus !== 'healthy' || insights.avgQualityScore < 50) && (
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
              <div className="text-sm">
                {insights.workloadStatus === 'critical' && (
                  <p className="text-warning">Your workload exceeds 150%. Consider discussing goal redistribution with your manager.</p>
                )}
                {insights.workloadStatus === 'warning' && (
                  <p className="text-warning">Your workload is at {insights.totalWeighting}%. Monitor for overload.</p>
                )}
                {insights.avgQualityScore < 50 && (
                  <p className="text-warning mt-1">Some goals may need clearer metrics or alignment to company objectives.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
