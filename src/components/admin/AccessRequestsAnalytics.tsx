import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp } from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface DailyStats {
  date: string;
  pending: number;
  approved: number;
  rejected: number;
  revoked: number;
  total: number;
}

interface StatusBreakdown {
  name: string;
  value: number;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(var(--warning))",
  approved: "hsl(var(--success))",
  rejected: "hsl(var(--destructive))",
  revoked: "#f97316",
};

export function AccessRequestsAnalytics() {
  const [timeRange, setTimeRange] = useState<"7" | "14" | "30">("14");
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const days = parseInt(timeRange);
      const startDate = startOfDay(subDays(new Date(), days - 1));

      // Fetch all requests within the time range
      const { data: requests, error } = await supabase
        .from("access_requests")
        .select("status, created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Generate date range
      const dateRange = eachDayOfInterval({
        start: startDate,
        end: new Date(),
      });

      // Initialize daily stats
      const statsMap: Record<string, DailyStats> = {};
      dateRange.forEach((date) => {
        const key = format(date, "yyyy-MM-dd");
        statsMap[key] = {
          date: format(date, "MMM d"),
          pending: 0,
          approved: 0,
          rejected: 0,
          revoked: 0,
          total: 0,
        };
      });

      // Count totals
      let totalPending = 0, totalApproved = 0, totalRejected = 0, totalRevoked = 0;

      // Aggregate requests by day and status
      (requests || []).forEach((req) => {
        const dayKey = format(new Date(req.created_at), "yyyy-MM-dd");
        if (statsMap[dayKey]) {
          const status = req.status as keyof DailyStats;
          if (status in statsMap[dayKey] && status !== "date" && status !== "total") {
            (statsMap[dayKey][status] as number)++;
          }
          statsMap[dayKey].total++;
        }

        // Count totals
        switch (req.status) {
          case "pending": totalPending++; break;
          case "approved": totalApproved++; break;
          case "rejected": totalRejected++; break;
          case "revoked": totalRevoked++; break;
        }
      });

      const daily = Object.values(statsMap);
      setDailyStats(daily);
      setTotals({
        total: requests?.length || 0,
        pending: totalPending,
        approved: totalApproved,
        rejected: totalRejected,
      });

      // Status breakdown for pie chart
      const breakdown: StatusBreakdown[] = [
        { name: "Pending", value: totalPending, color: STATUS_COLORS.pending },
        { name: "Approved", value: totalApproved, color: STATUS_COLORS.approved },
        { name: "Rejected", value: totalRejected, color: STATUS_COLORS.rejected },
        { name: "Revoked", value: totalRevoked, color: STATUS_COLORS.revoked },
      ].filter(item => item.value > 0);

      setStatusBreakdown(breakdown);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const approvalRate = totals.total > 0 
    ? Math.round((totals.approved / (totals.approved + totals.rejected || 1)) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Access Request Analytics</CardTitle>
          </div>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as "7" | "14" | "30")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          Request trends and status distribution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{totals.total}</p>
            <p className="text-xs text-muted-foreground">Total Requests</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-warning/10">
            <p className="text-2xl font-bold text-warning">{totals.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-success/10">
            <p className="text-2xl font-bold text-success">{totals.approved}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <p className="text-2xl font-bold text-primary">{approvalRate}%</p>
            <p className="text-xs text-muted-foreground">Approval Rate</p>
          </div>
        </div>

        {totals.total === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No access requests in this period</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Area Chart - Requests Over Time */}
            <div className="lg:col-span-2">
              <p className="text-sm font-medium mb-3">Requests Over Time</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart - Status Distribution */}
            <div>
              <p className="text-sm font-medium mb-3">Status Distribution</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend 
                      iconSize={10}
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Stacked Bar Chart - Daily Breakdown */}
        {totals.total > 0 && (
          <div>
            <p className="text-sm font-medium mb-3">Daily Status Breakdown</p>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} name="Pending" />
                  <Bar dataKey="approved" stackId="a" fill={STATUS_COLORS.approved} name="Approved" />
                  <Bar dataKey="rejected" stackId="a" fill={STATUS_COLORS.rejected} name="Rejected" />
                  <Bar dataKey="revoked" stackId="a" fill={STATUS_COLORS.revoked} name="Revoked" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
