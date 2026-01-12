import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, RefreshCw, Users, MessageSquare, Target, ClipboardCheck, Lightbulb } from "lucide-react";
import { useManagerEffectiveness } from "@/hooks/useManagerEffectiveness";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface ManagerEffectivenessCardProps {
  managerId: string;
  managerName?: string;
}

export function ManagerEffectivenessCard({ managerId, managerName }: ManagerEffectivenessCardProps) {
  const { currentScore, scoreHistory, isLoading, calculateScore, isCalculating } = useManagerEffectiveness(managerId);

  const handleRefresh = () => {
    const now = new Date();
    const periodEnd = endOfMonth(now);
    const periodStart = startOfMonth(subMonths(now, 3));
    
    calculateScore({
      managerId,
      periodStart: format(periodStart, "yyyy-MM-dd"),
      periodEnd: format(periodEnd, "yyyy-MM-dd"),
    });
  };

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-amber-600";
    return "text-red-600";
  };

  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return "-";
    return `${(value * 100).toFixed(0)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Manager Effectiveness</CardTitle>
          <CardDescription>
            {managerName ? `Performance metrics for ${managerName}` : "Team leadership metrics"}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isCalculating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? "animate-spin" : ""}`} />
          {isCalculating ? "Calculating..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        {currentScore ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-4xl font-bold ${getScoreColor(currentScore.overall_score)}`}>
                    {formatPercentage(currentScore.overall_score)}
                  </span>
                  {getTrendIcon(currentScore.score_trend)}
                </div>
                <p className="text-sm text-muted-foreground">Overall Effectiveness Score</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>Team size: {currentScore.team_size}</div>
                <div>
                  {format(new Date(currentScore.period_start), "MMM yyyy")} -{" "}
                  {format(new Date(currentScore.period_end), "MMM yyyy")}
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={<Users className="h-4 w-4" />}
                label="Team Rating"
                value={currentScore.avg_team_rating?.toFixed(2) || "-"}
                suffix="/5"
              />
              <MetricCard
                icon={<MessageSquare className="h-4 w-4" />}
                label="Feedback Frequency"
                value={formatPercentage(currentScore.feedback_frequency_score)}
                progress={currentScore.feedback_frequency_score}
              />
              <MetricCard
                icon={<Target className="h-4 w-4" />}
                label="Goal Completion"
                value={formatPercentage(currentScore.goal_completion_rate)}
                progress={currentScore.goal_completion_rate}
              />
              <MetricCard
                icon={<ClipboardCheck className="h-4 w-4" />}
                label="Appraisal Completion"
                value={formatPercentage(currentScore.appraisal_completion_rate)}
                progress={currentScore.appraisal_completion_rate}
              />
            </div>

            {/* Recommendations */}
            {currentScore.improvement_recommendations && 
             Array.isArray(currentScore.improvement_recommendations) &&
             currentScore.improvement_recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span>Recommendations</span>
                </div>
                <div className="space-y-1">
                  {(currentScore.improvement_recommendations as string[]).map((rec, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground pl-6">
                      • {rec}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No effectiveness score available. Calculate based on recent performance data.
            </p>
            <Button onClick={handleRefresh} disabled={isCalculating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? "animate-spin" : ""}`} />
              Calculate Score
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  suffix, 
  progress 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  suffix?: string;
  progress?: number | null;
}) {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{value}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      {progress !== undefined && progress !== null && (
        <Progress value={progress * 100} className="h-1.5" />
      )}
    </div>
  );
}
