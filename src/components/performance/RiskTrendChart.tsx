import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subDays } from 'date-fns';

interface RiskTrendChartProps {
  companyId?: string;
}

export function RiskTrendChart({ companyId }: RiskTrendChartProps) {
  const { data: trendData, isLoading } = useQuery({
    queryKey: ['risk-trend-chart', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      // Get aggregated risk data by date
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('performance_trend_history' as any)
        .select('snapshot_date, metric_value, trend_direction')
        .eq('company_id', companyId)
        .eq('metric_type', 'composite_risk')
        .gte('snapshot_date', thirtyDaysAgo)
        .order('snapshot_date', { ascending: true });

      if (error) throw error;

      // Aggregate by date
      const records = (data || []) as any[];
        const date = item.snapshot_date;
        if (!acc[date]) {
          acc[date] = {
            date,
            avgRiskScore: 0,
            count: 0,
            improving: 0,
            declining: 0
          };
        }
        acc[date].avgRiskScore += item.metric_value || 0;
        acc[date].count += 1;
        if (item.trend_direction === 'improving') acc[date].improving += 1;
        if (item.trend_direction === 'declining') acc[date].declining += 1;
        return acc;
      }, {});

      return Object.values(aggregated).map((item: any) => ({
        date: format(new Date(item.date), 'MMM dd'),
        avgRiskScore: Math.round(item.avgRiskScore / item.count),
        improving: item.improving,
        declining: item.declining
      }));
    },
    enabled: !!companyId
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Loading trend data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trendData || trendData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">
              No trend data available. Run AI Analysis to start tracking trends.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Risk Score Trend (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                domain={[0, 100]}
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
              <Line
                type="monotone"
                dataKey="avgRiskScore"
                name="Avg Risk Score"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--destructive))' }}
              />
              <Line
                type="monotone"
                dataKey="improving"
                name="Improving"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line
                type="monotone"
                dataKey="declining"
                name="Declining"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--warning))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
