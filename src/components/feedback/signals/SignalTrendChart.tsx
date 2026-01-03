import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTalentSignalHistory, useTalentSignalDefinitions } from "@/hooks/feedback/useTalentSignals";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import { useState } from "react";

interface SignalTrendChartProps {
  employeeId: string;
  companyId?: string;
  height?: number;
  showCard?: boolean;
  className?: string;
}

export function SignalTrendChart({
  employeeId,
  companyId,
  height = 250,
  showCard = true,
  className,
}: SignalTrendChartProps) {
  const [selectedSignal, setSelectedSignal] = useState<string>("all");
  const { data: definitions } = useTalentSignalDefinitions(companyId);
  const { data: history, isLoading, error } = useTalentSignalHistory(
    employeeId,
    selectedSignal !== "all" ? selectedSignal : undefined
  );

  if (isLoading) {
    return showCard ? (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    ) : (
      <Skeleton className={`h-[${height}px] w-full ${className}`} />
    );
  }

  if (error || !history || history.length === 0) {
    const content = (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        {error ? "Failed to load signal history" : "No historical data available"}
      </div>
    );

    return showCard ? (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Signal Trends</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    ) : (
      content
    );
  }

  // Transform data for line chart
  const chartData = history.map((snapshot) => ({
    date: format(parseISO(snapshot.computed_at), "MMM yyyy"),
    fullDate: snapshot.computed_at,
    value: snapshot.signal_value || 0,
    signal: snapshot.signal_definition?.name || "Unknown",
    confidence: snapshot.confidence_score || 0,
    version: snapshot.snapshot_version,
  }));

  // Calculate average for reference line
  const avgValue = chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium">{data.signal}</p>
          <p className="text-muted-foreground">Date: {format(parseISO(data.fullDate), "PPP")}</p>
          <p className="text-muted-foreground">Score: {data.value.toFixed(0)}</p>
          <p className="text-muted-foreground">
            Confidence: {(data.confidence * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Version: {data.version}
          </p>
        </div>
      );
    }
    return null;
  };

  const chartContent = (
    <div className="space-y-4">
      {definitions && definitions.length > 0 && (
        <Select value={selectedSignal} onValueChange={setSelectedSignal}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select signal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Signals</SelectItem>
            {definitions.map((def) => (
              <SelectItem key={def.id} value={def.code}>
                {def.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avgValue}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="5 5"
            label={{
              value: `Avg: ${avgValue.toFixed(0)}`,
              position: "right",
              fontSize: 10,
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  if (!showCard) {
    return <div className={className}>{chartContent}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Signal Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
}
