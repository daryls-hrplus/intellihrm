import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useAPIKeyStats } from "@/hooks/useAPIKeys";

interface APIUsageChartProps {
  apiKeyId?: string;
}

export function APIUsageChart({ apiKeyId }: APIUsageChartProps) {
  const { data: stats, isLoading } = useAPIKeyStats(apiKeyId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Loading usage data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats?.totalRequests.toLocaleString() || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats?.successRate || 100}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.successfulRequests.toLocaleString() || 0} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-destructive">{stats?.errorRequests || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{stats?.avgResponseTime || 0}ms</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Request Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Request Volume (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.dailyStats && stats.dailyStats.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString("en", { weekday: "short" })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Bar dataKey="requests" name="Requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="errors" name="Errors" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No request data available for the last 7 days
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
