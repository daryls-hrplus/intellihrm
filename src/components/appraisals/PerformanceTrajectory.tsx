import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle } from "lucide-react";
import { usePerformanceTrajectory } from "@/hooks/usePerformanceTrajectory";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface PerformanceTrajectoryProps {
  employeeId: string;
  employeeName?: string;
}

export function PerformanceTrajectory({ employeeId, employeeName }: PerformanceTrajectoryProps) {
  const { trajectory, trajectoryHistory, isLoading, generateTrajectory, isGenerating } = usePerformanceTrajectory(employeeId);

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "volatile":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string | null) => {
    switch (trend) {
      case "improving":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "declining":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "volatile":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const chartData = trajectory ? [
    { period: "Current", score: trajectory.current_score, type: "actual" },
    { period: "3 Months", score: trajectory.predicted_score_3m, type: "predicted" },
    { period: "6 Months", score: trajectory.predicted_score_6m, type: "predicted" },
    { period: "12 Months", score: trajectory.predicted_score_12m, type: "predicted" },
  ] : [];

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
          <CardTitle className="text-lg">Performance Trajectory</CardTitle>
          <CardDescription>
            {employeeName ? `Predicted performance for ${employeeName}` : "AI-powered performance prediction"}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateTrajectory(employeeId)}
          disabled={isGenerating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating ? "Generating..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        {trajectory ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getTrendIcon(trajectory.trend_direction)}
                <Badge className={getTrendColor(trajectory.trend_direction)}>
                  {trajectory.trend_direction || "Unknown"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Confidence: {((trajectory.confidence_level || 0) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Based on {trajectory.data_points_used} data points
              </div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => [value?.toFixed(2), "Score"]}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))"
                    }}
                  />
                  <ReferenceLine y={3} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{trajectory.current_score?.toFixed(1) || "-"}</div>
                <div className="text-xs text-muted-foreground">Current</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary/80">{trajectory.predicted_score_3m?.toFixed(1) || "-"}</div>
                <div className="text-xs text-muted-foreground">3 Months</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary/60">{trajectory.predicted_score_6m?.toFixed(1) || "-"}</div>
                <div className="text-xs text-muted-foreground">6 Months</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary/40">{trajectory.predicted_score_12m?.toFixed(1) || "-"}</div>
                <div className="text-xs text-muted-foreground">12 Months</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No trajectory data available. Generate a prediction based on historical performance.
            </p>
            <Button onClick={() => generateTrajectory(employeeId)} disabled={isGenerating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              Generate Trajectory
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
