import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { TrendingUp } from "lucide-react";

interface TrendDataPoint {
  date: string;
  displayDate: string;
  count: number;
}

interface AuditLogTrendChartProps {
  dateFrom?: Date;
  dateTo?: Date;
  actionFilter?: string;
  entityFilter?: string;
}

export function AuditLogTrendChart({ 
  dateFrom, 
  dateTo, 
  actionFilter, 
  entityFilter 
}: AuditLogTrendChartProps) {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, [dateFrom, dateTo, actionFilter, entityFilter]);

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      // Default to last 7 days if no date range
      const endDate = dateTo || new Date();
      const startDate = dateFrom || subDays(endDate, 6);

      let query = supabase
        .from('audit_logs')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (actionFilter && actionFilter !== 'all') {
        query = query.eq('action', actionFilter as 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'LOGIN' | 'LOGOUT');
      }

      if (entityFilter && entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by date
      const groupedByDate: Record<string, number> = {};
      
      // Initialize all dates in range with 0
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      for (let i = 0; i <= daysDiff; i++) {
        const date = subDays(endDate, daysDiff - i);
        const dateKey = format(date, 'yyyy-MM-dd');
        groupedByDate[dateKey] = 0;
      }

      // Count events per day
      (data || []).forEach(log => {
        const dateKey = format(new Date(log.created_at), 'yyyy-MM-dd');
        if (groupedByDate[dateKey] !== undefined) {
          groupedByDate[dateKey]++;
        }
      });

      // Convert to array
      const trendArray: TrendDataPoint[] = Object.entries(groupedByDate).map(([date, count]) => ({
        date,
        displayDate: format(new Date(date), 'MMM d'),
        count,
      }));

      setTrendData(trendArray);
    } catch (error) {
      console.error('Error fetching trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalEvents = trendData.reduce((sum, d) => sum + d.count, 0);
  const avgEvents = trendData.length > 0 ? Math.round(totalEvents / trendData.length) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Activity Trend
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {totalEvents} events • {avgEvents} avg/day
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[100px] flex items-center justify-center text-muted-foreground text-sm">
            Loading trend data...
          </div>
        ) : (
          <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  hide 
                  domain={[0, 'dataMax + 2']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [value, 'Events']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
