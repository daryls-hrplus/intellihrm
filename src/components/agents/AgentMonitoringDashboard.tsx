import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap, 
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  Bot
} from "lucide-react";
import { AIAgent, AgentExecution, AgentMetrics } from "@/hooks/useAgentRegistry";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface AgentMonitoringDashboardProps {
  agents: AIAgent[];
  executions: AgentExecution[];
  metrics: AgentMetrics[];
  isLoading: boolean;
  fullView?: boolean;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))"
];

export function AgentMonitoringDashboard({
  agents,
  executions,
  metrics,
  isLoading,
  fullView = false
}: AgentMonitoringDashboardProps) {
  // Calculate execution trends
  const executionTrends = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      return {
        date: format(date, "MMM dd"),
        fullDate: date.toISOString().split("T")[0],
        executions: 0,
        successful: 0,
        failed: 0
      };
    });

    executions.forEach(exec => {
      const execDate = exec.started_at.split("T")[0];
      const dayData = last7Days.find(d => d.fullDate === execDate);
      if (dayData) {
        dayData.executions++;
        if (exec.status === "completed") dayData.successful++;
        if (exec.status === "failed") dayData.failed++;
      }
    });

    return last7Days;
  }, [executions]);

  // Calculate agent distribution by category
  const categoryDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    agents.forEach(agent => {
      distribution[agent.category] = (distribution[agent.category] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [agents]);

  // Calculate top agents by execution count
  const topAgents = useMemo(() => {
    const agentExecCounts: Record<string, { name: string; count: number; successRate: number }> = {};
    
    executions.forEach(exec => {
      const agentId = exec.agent_id;
      const agentName = exec.agent?.agent_name || "Unknown";
      
      if (!agentExecCounts[agentId]) {
        agentExecCounts[agentId] = { name: agentName, count: 0, successRate: 0 };
      }
      agentExecCounts[agentId].count++;
    });

    // Calculate success rate
    Object.keys(agentExecCounts).forEach(agentId => {
      const agentExecs = executions.filter(e => e.agent_id === agentId);
      const successful = agentExecs.filter(e => e.status === "completed").length;
      agentExecCounts[agentId].successRate = agentExecs.length > 0 
        ? (successful / agentExecs.length) * 100 
        : 100;
    });

    return Object.entries(agentExecCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }));
  }, [executions]);

  // Calculate latency distribution
  const latencyData = useMemo(() => {
    const buckets = [
      { range: "<100ms", min: 0, max: 100, count: 0 },
      { range: "100-500ms", min: 100, max: 500, count: 0 },
      { range: "500ms-1s", min: 500, max: 1000, count: 0 },
      { range: "1-5s", min: 1000, max: 5000, count: 0 },
      { range: ">5s", min: 5000, max: Infinity, count: 0 }
    ];

    executions.forEach(exec => {
      const latency = exec.latency_ms || 0;
      const bucket = buckets.find(b => latency >= b.min && latency < b.max);
      if (bucket) bucket.count++;
    });

    return buckets;
  }, [executions]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Execution Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Execution Trends
          </CardTitle>
          <CardDescription>Last 7 days execution activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={executionTrends}>
                <defs>
                  <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs" 
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis 
                  className="text-xs" 
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="successful"
                  stroke="hsl(var(--chart-2))"
                  fill="url(#successGradient)"
                  name="Successful"
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  stroke="hsl(var(--destructive))"
                  fill="url(#failedGradient)"
                  name="Failed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {fullView && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Agent Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-4 w-4" />
                Agent Distribution
              </CardTitle>
              <CardDescription>Agents by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Latency Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Latency Distribution
              </CardTitle>
              <CardDescription>Response time breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={latencyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      type="number" 
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      dataKey="range" 
                      type="category" 
                      width={80}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Top Performing Agents
          </CardTitle>
          <CardDescription>By execution count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topAgents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No execution data available
              </p>
            ) : (
              topAgents.map((agent, index) => (
                <div 
                  key={agent.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {agent.count} executions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {agent.successRate >= 95 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : agent.successRate >= 80 ? (
                      <Activity className="h-4 w-4 text-amber-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {agent.successRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
