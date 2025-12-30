import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePerformanceRiskAnalyzer } from '@/hooks/performance/usePerformanceRiskAnalyzer';
import { format } from 'date-fns';

interface PerformanceTrendChartProps {
  companyId?: string;
  employeeId?: string;
}

export function PerformanceTrendChart({ companyId, employeeId }: PerformanceTrendChartProps) {
  const { trendHistory, isLoadingTrends } = usePerformanceRiskAnalyzer({ companyId, employeeId });

  if (isLoadingTrends) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-pulse h-64 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // Group by cycle for aggregation
  const cycleData = trendHistory.reduce((acc, trend) => {
    const key = trend.cycle_id || trend.snapshot_date;
    if (!acc[key]) {
      acc[key] = {
        cycle_name: trend.cycle_name || format(new Date(trend.snapshot_date), 'MMM yyyy'),
        date: trend.snapshot_date,
        scores: [],
        directions: { improving: 0, stable: 0, declining: 0 }
      };
    }
    if (trend.overall_score) {
      acc[key].scores.push(trend.overall_score);
    }
    acc[key].directions[trend.trend_direction]++;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(cycleData)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((cycle: any) => ({
      name: cycle.cycle_name,
      avgScore: cycle.scores.length > 0 
        ? (cycle.scores.reduce((a: number, b: number) => a + b, 0) / cycle.scores.length).toFixed(2)
        : null,
      improving: cycle.directions.improving,
      declining: cycle.directions.declining,
      stable: cycle.directions.stable
    }));

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Calculate overall trend
  const latestTrends = trendHistory.slice(0, 20);
  const trendCounts = latestTrends.reduce(
    (acc, t) => {
      acc[t.trend_direction]++;
      return acc;
    },
    { improving: 0, stable: 0, declining: 0 }
  );

  const dominantTrend = Object.entries(trendCounts).reduce(
    (a, b) => (b[1] > a[1] ? b : a)
  )[0];

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>No trend data available yet</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          Run a performance risk analysis to generate trend data
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Performance Trends
              {getTrendIcon(dominantTrend)}
            </CardTitle>
            <CardDescription>
              Score trajectory across appraisal cycles
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>{trendCounts.improving} improving</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span>{trendCounts.declining} declining</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="h-4 w-4 text-gray-500" />
              <span>{trendCounts.stable} stable</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              domain={[0, 5]} 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="avgScore"
              name="Average Score"
              stroke="hsl(var(--primary))"
              fill="url(#colorScore)"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="improving" 
              name="Improving"
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ fill: '#22c55e', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="declining" 
              name="Declining"
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
