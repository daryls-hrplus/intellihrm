import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { DriftAnalysis } from "@/hooks/capabilities/useCompetencyRatingHistory";

interface CompetencyDriftChartProps {
  driftData: DriftAnalysis[];
  historyData?: {
    period: string;
    avgRating: number;
    count: number;
  }[];
  jobFamilyAverage?: number;
  showAlerts?: boolean;
  title?: string;
}

const TREND_CONFIG = {
  IMPROVING: {
    icon: TrendingUp,
    label: "Improving",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  STABLE: {
    icon: Minus,
    label: "Stable",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  DECLINING: {
    icon: TrendingDown,
    label: "Declining",
    color: "text-red-600",
    bgColor: "bg-red-500/10",
  },
};

export function CompetencyDriftChart({
  driftData,
  historyData = [],
  jobFamilyAverage,
  showAlerts = true,
  title = "Competency Trends",
}: CompetencyDriftChartProps) {
  const chartData = useMemo(() => {
    if (historyData.length > 0) {
      return historyData.map((h) => ({
        period: h.period,
        rating: h.avgRating,
        count: h.count,
      }));
    }

    // If no history data, create from drift analysis
    return driftData.map((d) => ({
      period: d.capability_name,
      rating: d.current_level,
      previousRating: d.previous_level,
      change: d.change,
    }));
  }, [driftData, historyData]);

  const alerts = useMemo(() => {
    return driftData.filter(
      (d) => d.trend === "DECLINING" && d.change < -0.5
    );
  }, [driftData]);

  const overallTrend = useMemo(() => {
    if (driftData.length === 0) return "STABLE";
    
    const avgChange =
      driftData.reduce((sum, d) => sum + d.avg_change_per_period, 0) /
      driftData.length;
    
    if (avgChange > 0.1) return "IMPROVING";
    if (avgChange < -0.1) return "DECLINING";
    return "STABLE";
  }, [driftData]);

  const trendConfig = TREND_CONFIG[overallTrend];
  const TrendIcon = trendConfig.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <Badge variant="outline" className={`${trendConfig.bgColor} ${trendConfig.color}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {trendConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alerts Section */}
        {showAlerts && alerts.length > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-destructive text-sm">
                Capability Decline Detected
              </span>
            </div>
            <div className="space-y-1">
              {alerts.map((alert) => (
                <div key={alert.capability_id} className="text-sm text-muted-foreground">
                  <strong>{alert.capability_name}</strong> dropped from level{" "}
                  {alert.previous_level} to {alert.current_level}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rating"
                  name="Rating"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                {jobFamilyAverage && (
                  <ReferenceLine
                    y={jobFamilyAverage}
                    label={{
                      value: "Job Family Avg",
                      position: "right",
                      fontSize: 10,
                    }}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No trend data available</p>
              <p className="text-xs">Ratings will appear after multiple evaluation periods</p>
            </div>
          </div>
        )}

        {/* Drift Summary Table */}
        {driftData.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 font-medium">Capability</th>
                  <th className="text-center p-2 font-medium">Current</th>
                  <th className="text-center p-2 font-medium">Previous</th>
                  <th className="text-center p-2 font-medium">Change</th>
                  <th className="text-center p-2 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {driftData.slice(0, 5).map((item) => {
                  const itemTrendConfig = TREND_CONFIG[item.trend];
                  const ItemTrendIcon = itemTrendConfig.icon;
                  
                  return (
                    <tr key={item.capability_id} className="border-t">
                      <td className="p-2 font-medium">{item.capability_name}</td>
                      <td className="p-2 text-center">{item.current_level}</td>
                      <td className="p-2 text-center text-muted-foreground">
                        {item.previous_level}
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={
                            item.change > 0
                              ? "text-green-600"
                              : item.change < 0
                              ? "text-red-600"
                              : "text-muted-foreground"
                          }
                        >
                          {item.change > 0 ? "+" : ""}
                          {item.change}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <Badge
                          variant="outline"
                          className={`${itemTrendConfig.bgColor} ${itemTrendConfig.color} text-xs`}
                        >
                          <ItemTrendIcon className="h-3 w-3 mr-1" />
                          {itemTrendConfig.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}