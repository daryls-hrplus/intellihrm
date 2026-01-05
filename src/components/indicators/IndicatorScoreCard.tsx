import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IndicatorScore } from "@/hooks/useTalentIndicators";

interface IndicatorScoreCardProps {
  score: IndicatorScore;
  showEmployee?: boolean;
  compact?: boolean;
}

const levelColors = {
  low: "bg-success/20 text-success border-success/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  high: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  critical: "bg-destructive/20 text-destructive border-destructive/30",
};

const categoryIcons: Record<string, string> = {
  readiness: "🎯",
  risk: "⚠️",
  potential: "⭐",
  engagement: "💪",
  performance: "📈",
};

export function IndicatorScoreCard({ score, showEmployee = false, compact = false }: IndicatorScoreCardProps) {
  const indicator = score.indicator;
  
  if (!indicator) return null;

  const getTrendIcon = () => {
    switch (score.trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityIcon = () => {
    if (score.level === "critical") {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    if (score.level === "high" && indicator.category === "risk") {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    return null;
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-lg">{categoryIcons[indicator.category] || "📊"}</span>
          <div>
            <p className="text-sm font-medium">{indicator.name}</p>
            {showEmployee && score.employee && (
              <p className="text-xs text-muted-foreground">{score.employee.full_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={levelColors[score.level]}>
            {score.score.toFixed(0)}%
          </Badge>
          {getTrendIcon()}
          {getSeverityIcon()}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryIcons[indicator.category] || "📊"}</span>
            <div>
              <CardTitle className="text-base">{indicator.name}</CardTitle>
              {showEmployee && score.employee && (
                <p className="text-sm text-muted-foreground">{score.employee.full_name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={levelColors[score.level]}>
              {score.level.charAt(0).toUpperCase() + score.level.slice(1)}
            </Badge>
            {getSeverityIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Score</span>
            <span className="font-medium">{score.score.toFixed(1)}%</span>
          </div>
          <Progress 
            value={score.score} 
            className={cn(
              "h-2",
              score.level === "critical" && "[&>div]:bg-destructive",
              score.level === "high" && "[&>div]:bg-orange-500",
              score.level === "medium" && "[&>div]:bg-warning",
              score.level === "low" && "[&>div]:bg-success"
            )}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Trend</span>
            {getTrendIcon()}
          </div>
          {score.trend_percentage !== null && (
            <span className={cn(
              "font-medium",
              score.trend === "improving" && "text-success",
              score.trend === "declining" && "text-destructive"
            )}>
              {score.trend_percentage > 0 ? "+" : ""}{score.trend_percentage.toFixed(1)}%
            </span>
          )}
        </div>

        {score.confidence !== null && (
          <div className="flex items-center justify-between text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1 text-muted-foreground">
                  <span>Confidence</span>
                  <HelpCircle className="h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Based on {score.data_points_used || 0} data points</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="font-medium">{(score.confidence * 100).toFixed(0)}%</span>
          </div>
        )}

        {score.explanation && (
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">{score.explanation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
