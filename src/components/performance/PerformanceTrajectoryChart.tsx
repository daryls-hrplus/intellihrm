import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, TrendingUp } from "lucide-react";
import { CycleSnapshot, PerformanceIndex } from "@/hooks/usePerformanceIndex";
import { format } from "date-fns";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";

interface PerformanceTrajectoryChartProps {
  snapshots: CycleSnapshot[];
  index?: PerformanceIndex | null;
  isLoading?: boolean;
  showProjection?: boolean;
  height?: number;
}

// Category threshold bands
const categoryBands = [
  { min: 0, max: 40, color: "#fef2f2", name: "Unsatisfactory" },
  { min: 40, max: 60, color: "#fff7ed", name: "Needs Improvement" },
  { min: 60, max: 75, color: "#fffbeb", name: "Meets Expectations" },
  { min: 75, max: 90, color: "#eff6ff", name: "Exceeds" },
  { min: 90, max: 100, color: "#f0fdf4", name: "Exceptional" },
];

export function PerformanceTrajectoryChart({ 
  snapshots, 
  index, 
  isLoading, 
  showProjection = true,
  height = 300,
}: PerformanceTrajectoryChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!snapshots.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <LineChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No performance data to chart</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data (reverse to show oldest first)
  const chartData = [...snapshots].reverse().map((snapshot) => ({
    date: format(new Date(snapshot.cycle_end_date), "MMM yy"),
    fullDate: snapshot.cycle_end_date,
    score: snapshot.overall_score,
    competency: snapshot.competency_score,
    responsibility: snapshot.responsibility_score,
    goal: snapshot.goal_score,
    cycleName: snapshot.cycle_name,
    category: snapshot.performance_category_name,
    isBest: index?.best_cycle_id === snapshot.cycle_id,
    isLowest: index?.lowest_cycle_id === snapshot.cycle_id,
  }));

  // Add projection point if enabled and we have trend data
  if (showProjection && index?.trend_direction && index.trend_velocity && chartData.length >= 2) {
    const lastScore = chartData[chartData.length - 1].score || 0;
    const projectedScore = Math.max(0, Math.min(100, 
      lastScore + (index.trend_direction === "improving" ? 1 : index.trend_direction === "declining" ? -1 : 0) * (index.trend_velocity * 6)
    ));
    
    chartData.push({
      date: "Projected",
      fullDate: "",
      score: projectedScore,
      competency: null,
      responsibility: null,
      goal: null,
      cycleName: "AI Projection",
      category: null,
      isBest: false,
      isLowest: false,
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium">{data.cycleName}</p>
          <p className="text-muted-foreground text-xs mb-2">{label}</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4">
              <span>Overall:</span>
              <span className="font-medium">{data.score?.toFixed(1)}%</span>
            </p>
            {data.competency !== null && (
              <p className="flex justify-between gap-4 text-xs">
                <span className="text-muted-foreground">Competency:</span>
                <span>{data.competency?.toFixed(1)}%</span>
              </p>
            )}
            {data.responsibility !== null && (
              <p className="flex justify-between gap-4 text-xs">
                <span className="text-muted-foreground">Responsibility:</span>
                <span>{data.responsibility?.toFixed(1)}%</span>
              </p>
            )}
            {data.goal !== null && (
              <p className="flex justify-between gap-4 text-xs">
                <span className="text-muted-foreground">Goals:</span>
                <span>{data.goal?.toFixed(1)}%</span>
              </p>
            )}
          </div>
          {data.category && (
            <p className="mt-2 text-xs text-muted-foreground">Category: {data.category}</p>
          )}
          {data.isBest && <p className="text-green-600 text-xs mt-1">★ Best Performance</p>}
          {data.isLowest && <p className="text-red-600 text-xs mt-1">▼ Lowest Performance</p>}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isBest) {
      return <circle cx={cx} cy={cy} r={6} fill="#22c55e" stroke="#fff" strokeWidth={2} />;
    }
    if (payload.isLowest) {
      return <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />;
    }
    if (payload.cycleName === "AI Projection") {
      return <circle cx={cx} cy={cy} r={5} fill="none" stroke="#6366f1" strokeWidth={2} strokeDasharray="3 3" />;
    }
    return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={2} />;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance Trajectory
          </CardTitle>
          {index?.trend_direction && (
            <span className={`text-xs px-2 py-1 rounded ${
              index.trend_direction === "improving" ? "bg-green-100 text-green-800" :
              index.trend_direction === "declining" ? "bg-red-100 text-red-800" :
              "bg-muted text-muted-foreground"
            }`}>
              {index.trend_direction === "improving" ? "↗" : index.trend_direction === "declining" ? "↘" : "→"} 
              {" "}{index.trend_direction}
              {index.trend_confidence !== null && ` (${(index.trend_confidence * 100).toFixed(0)}% confidence)`}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Category threshold lines */}
              <ReferenceLine y={90} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.5} />
              <ReferenceLine y={75} stroke="#3b82f6" strokeDasharray="5 5" strokeOpacity={0.5} />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.5} />
              <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} />

              {/* Main score line */}
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Best</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Lowest</span>
          </div>
          {showProjection && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-dashed border-indigo-500" />
              <span>Projected</span>
            </div>
          )}
          <div className="flex-1" />
          <div className="flex gap-2 text-muted-foreground">
            <span>90% Exceptional</span>
            <span>75% Exceeds</span>
            <span>60% Meets</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
