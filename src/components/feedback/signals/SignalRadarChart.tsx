import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTalentSignalSnapshots } from "@/hooks/feedback/useTalentSignals";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SignalRadarChartProps {
  employeeId: string;
  height?: number;
  showCard?: boolean;
  className?: string;
}

export function SignalRadarChart({
  employeeId,
  height = 300,
  showCard = true,
  className,
}: SignalRadarChartProps) {
  const { data: signals, isLoading, error } = useTalentSignalSnapshots(employeeId);

  if (isLoading) {
    return showCard ? (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    ) : (
      <Skeleton className={`h-[${height}px] w-full ${className}`} />
    );
  }

  if (error || !signals || signals.length === 0) {
    const content = (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        {error ? "Failed to load signals" : "No signals available"}
      </div>
    );

    return showCard ? (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Signal Overview</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    ) : (
      content
    );
  }

  // Transform data for radar chart
  const chartData = signals
    .filter((s) => s.signal_value !== null)
    .map((signal) => ({
      signal: signal.signal_definition?.name || "Unknown",
      value: signal.signal_value || 0,
      fullMark: 100,
      confidence: signal.confidence_score || 0,
      category: signal.signal_definition?.signal_category || "general",
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium">{data.signal}</p>
          <p className="text-muted-foreground">Score: {data.value.toFixed(0)}</p>
          <p className="text-muted-foreground">
            Confidence: {(data.confidence * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground capitalize mt-1">
            Category: {data.category}
          </p>
        </div>
      );
    }
    return null;
  };

  const radarContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="signal"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );

  if (!showCard) {
    return <div className={className}>{radarContent}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Signal Overview</CardTitle>
      </CardHeader>
      <CardContent>{radarContent}</CardContent>
    </Card>
  );
}
