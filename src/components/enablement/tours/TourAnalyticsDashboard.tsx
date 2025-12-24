import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import type { TourAnalyticsSummary } from "@/types/tours";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export function TourAnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["tour-analytics-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enablement_tour_analytics_summary")
        .select("*");

      if (error) throw error;
      return data as TourAnalyticsSummary[];
    },
  });

  const { data: recentEvents } = useQuery({
    queryKey: ["tour-analytics-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enablement_tour_analytics")
        .select("*, enablement_tours(tour_name)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  // Calculate summary stats
  const totalStarts = analytics?.reduce((acc, t) => acc + (t.total_starts || 0), 0) || 0;
  const totalCompletions = analytics?.reduce((acc, t) => acc + (t.total_completions || 0), 0) || 0;
  const totalSkips = analytics?.reduce((acc, t) => acc + (t.total_skips || 0), 0) || 0;
  const avgCompletionRate = analytics?.length 
    ? analytics.reduce((acc, t) => acc + (t.completion_rate || 0), 0) / analytics.length 
    : 0;

  // Prepare chart data
  const tourPerformanceData = analytics?.map((t) => ({
    name: t.tour_name?.substring(0, 15) + (t.tour_name?.length > 15 ? "..." : ""),
    starts: t.total_starts || 0,
    completions: t.total_completions || 0,
    skips: t.total_skips || 0,
  })) || [];

  const completionPieData = [
    { name: "Completed", value: totalCompletions },
    { name: "Skipped", value: totalSkips },
    { name: "Abandoned", value: Math.max(0, totalStarts - totalCompletions - totalSkips) },
  ].filter((d) => d.value > 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading analytics...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStarts}</p>
                <p className="text-xs text-muted-foreground">Total Starts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCompletions}</p>
                <p className="text-xs text-muted-foreground">Completions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <XCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSkips}</p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {avgCompletionRate.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tour Performance</CardTitle>
            <CardDescription>Starts, completions, and skips by tour</CardDescription>
          </CardHeader>
          <CardContent>
            {tourPerformanceData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tourPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="starts" fill="hsl(var(--primary))" name="Starts" />
                  <Bar dataKey="completions" fill="hsl(var(--chart-2))" name="Completions" />
                  <Bar dataKey="skips" fill="hsl(var(--chart-3))" name="Skips" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Distribution</CardTitle>
            <CardDescription>Overall tour outcome breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {completionPieData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={completionPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {completionPieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tour Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tour Details</CardTitle>
          <CardDescription>Performance metrics for each tour</CardDescription>
        </CardHeader>
        <CardContent>
          {!analytics?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No tour analytics data yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tour</TableHead>
                  <TableHead className="text-right">Starts</TableHead>
                  <TableHead className="text-right">Completions</TableHead>
                  <TableHead className="text-right">Skips</TableHead>
                  <TableHead className="text-right">Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.map((tour) => (
                  <TableRow key={tour.tour_id}>
                    <TableCell className="font-medium">
                      {tour.tour_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {tour.total_starts || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {tour.total_completions || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {tour.total_skips || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          (tour.completion_rate || 0) >= 70
                            ? "default"
                            : (tour.completion_rate || 0) >= 40
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {(tour.completion_rate || 0).toFixed(0)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest tour interactions</CardDescription>
        </CardHeader>
        <CardContent>
          {!recentEvents?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent events
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEvents.slice(0, 20).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Badge
                        variant={
                          event.event_type === "completed"
                            ? "default"
                            : event.event_type === "skipped"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {event.event_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(event.enablement_tours as { tour_name: string } | null)?.tour_name || "-"}
                    </TableCell>
                    <TableCell>{event.step_id ? "Yes" : "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
